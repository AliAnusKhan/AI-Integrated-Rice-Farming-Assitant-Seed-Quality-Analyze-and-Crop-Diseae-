import React, { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { formatTimestamp, getCategoryConfig } from '../services/historyService';

const History = () => {
  const { currentUser } = useAuth();
  const { history, loading, error } = useHistory(currentUser?.uid);
  const [activeTab, setActiveTab] = useState('seedAnalyses');

  // Filter data according to tabs
  const filteredHistory = history.filter(item => {
    if (activeTab === 'seedAnalyses') return item.category === 'seedAnalysis';
    if (activeTab === 'diseaseDetections') return item.category === 'diseaseDetections';
    if (activeTab === 'yieldPredictions') return item.category === 'yieldPredictions';
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fdf9] pb-12">
      {/* Header */}
      <div className="pt-8 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-emerald-950 mt-2">Analysis History</h1>
        <p className="text-emerald-600">View all your farming analyses</p>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-8">
        <div className="bg-white rounded-2xl p-1 inline-flex shadow-sm border border-emerald-100">
          <button
            onClick={() => setActiveTab('seedAnalyses')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'seedAnalyses' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600'}`}
          >
            🌱 Seed Analyses
          </button>
          <button
            onClick={() => setActiveTab('diseaseDetections')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'diseaseDetections' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}
          >
            🐛 Disease Detections
          </button>
          <button
            onClick={() => setActiveTab('yieldPredictions')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'yieldPredictions' ? 'bg-amber-100 text-amber-700' : 'text-slate-600'}`}
          >
            📈 Yield Predictions
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
        {filteredHistory.length === 0 ? (
          <p className="col-span-2 text-center text-slate-500 py-12">No records found in this category</p>
        ) : (
          filteredHistory.map((item) => {
            const result = item.result || {};

            // Seed Analysis Card
            if (item.category === 'seedAnalysis') {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-xl">Seed Analysis</h3>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${result.quality === 'Low' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        Quality: {result.quality || 'Medium'}
                      </span>
                    </div>

                    <div className="my-6 h-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="seed" className="h-full object-contain" />
                      ) : (
                        <span className="text-slate-300 text-6xl">📊</span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-emerald-600 font-medium">{result.seedName || ""}</p>
                        <p className="text-sm text-slate-500 mt-1">{item.timestamp ? formatTimestamp(item.timestamp) : 'Apr 3, 2026'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Confidence</p>
                        <p className="text-3xl font-bold text-emerald-700">{result.confidence || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-6 py-4 flex justify-end">
                    <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-medium">
                      <Eye size={18} /> View Image
                    </button>
                  </div>
                </div>
              );
            }

            // Yield Prediction Card
            if (item.category === 'yieldPredictions') {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-xl">Yield Prediction</h3>
                      <span className="px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                        Medium
                      </span>
                    </div>

                    <div className="mt-8 space-y-6">
                      <div>
                        <p className="text-sm text-slate-500">Predicted per acre</p>
                        <p className="text-4xl font-bold text-emerald-700">{result.yieldPerAcre || 3600} <span className="text-2xl">kg</span></p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Total</p>
                          <p className="font-semibold text-xl">{result.totalYield || 3600} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Area</p>
                          <p className="font-semibold text-xl">{result.farmingArea || 1} acres</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm pt-4 border-t">
                        <div>
                          <p className="text-slate-500">Soil</p>
                          <p className="font-medium">{result.soilType || 'Loam'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500">Date</p>
                          <p>{item.timestamp ? formatTimestamp(item.timestamp) : 'Apr 5, 2026'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Disease Detection Card
            if (item.category === 'diseaseDetections') {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-xl">Disease Detection</h3>
                      <span className="px-4 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                        Severity: Mild
                      </span>
                    </div>

                    <div className="my-6 rounded-2xl overflow-hidden h-56 bg-slate-100">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="disease" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-6xl">🥬</div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-emerald-700">Disease: {result.disease || 'Healthy'}</p>
                        <p className="text-sm text-slate-500 mt-1">Confidence: {result.confidence || 100}%</p>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
                        <Eye size={20} /> View Image
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
};

export default History;