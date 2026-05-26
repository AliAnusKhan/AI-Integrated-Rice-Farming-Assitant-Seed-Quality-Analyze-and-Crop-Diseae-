import React, { useState } from 'react';
import { ArrowLeft, Eye, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { formatTimestamp } from '../services/historyService';

const History = () => {
  const { currentUser } = useAuth();
  const { history, loading, error } = useHistory(currentUser?.uid);
  const [activeTab, setActiveTab] = useState('seedAnalyses');

  // Filter data according to tabs (Safely guarding history if it's loading/null)
  const filteredHistory = (history || []).filter(item => {
    if (activeTab === 'seedAnalyses') return item.category === 'seedAnalysis';
    if (activeTab === 'diseaseDetections') return item.category === 'diseaseDetections';
    if (activeTab === 'yieldPredictions') return item.category === 'yieldPredictions';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fdf9] pb-12">
      {/* Header - Hamesha instantly visible rahega */}
      <div className="pt-8 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium group">
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-emerald-950 mt-2">Analysis History</h1>
        <p className="text-emerald-600">View all your farming analyses</p>
      </div>

      {/* Tabs - Bina rukawat ke switch honge */}
      <div className="px-6 mt-8">
        <div className="bg-white rounded-2xl p-1 inline-flex shadow-sm border border-emerald-100">
          <button
            onClick={() => setActiveTab('seedAnalyses')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'seedAnalyses' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🌱 Seed Analyses
          </button>
          <button
            onClick={() => setActiveTab('diseaseDetections')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'diseaseDetections' ? 'bg-rose-100 text-rose-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🐛 Disease Detections
          </button>
          <button
            onClick={() => setActiveTab('yieldPredictions')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'yieldPredictions' ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📈 Yield Predictions
          </button>
        </div>
      </div>

      {/* Cards Grid / Loading State */}
      <div className="px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
        
        {/* PREMIUM UI LOADER (SKELETON CARDS SHOWN ONLY IN THE GRID) */}
        {loading ? (
          <>
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
          </>
        ) : filteredHistory.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <Inbox size={48} className="mb-3 opacity-30 text-emerald-800" />
            <p className="font-medium text-slate-500">No records found in this category</p>
            <p className="text-xs text-slate-400 mt-1">Perform actions on your dashboard to populate history.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const result = item.result || {};

            // Seed Analysis Card
            if (item.category === 'seedAnalysis') {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-xl text-slate-800">Seed Analysis</h3>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${result.quality === 'Low' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        Quality: {result.quality || 'Medium'}
                      </span>
                    </div>

                    <div className="my-6 h-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="seed" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-slate-300 text-6xl">📊</span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-emerald-600 font-bold text-base">{result.seedName || "Unknown Seed"}</p>
                        <p className="text-sm text-slate-400 mt-1">{item.timestamp ? formatTimestamp(item.timestamp) : 'Recent'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Confidence</p>
                        <p className="text-3xl font-black text-emerald-700">{result.confidence || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 px-6 py-4 bg-slate-50/50 flex justify-end">
                    <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-semibold">
                      <Eye size={18} /> View Analysis Details
                    </button>
                  </div>
                </div>
              );
            }

            // Yield Prediction Card
            if (item.category === 'yieldPredictions') {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-xl text-slate-800">Yield Prediction</h3>
                      <span className="px-4 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        Processed
                      </span>
                    </div>

                    <div className="mt-8 space-y-6">
                      <div>
                        <p className="text-sm text-slate-400 font-medium">Predicted per acre</p>
                        <p className="text-4xl font-black text-emerald-700">{result.yieldPerAcre || 3600} <span className="text-xl font-bold text-slate-500">kg</span></p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <p className="text-slate-400 font-medium">Total Yield</p>
                          <p className="font-bold text-slate-800 text-lg">{result.totalYield || 3600} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Farming Area</p>
                          <p className="font-bold text-slate-800 text-lg">{result.farmingArea || 1} acres</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs pt-4 border-t border-slate-100 text-slate-500">
                        <div>
                          <span className="font-medium">Soil Type:</span> <span className="font-bold text-slate-700">{result.soilType || 'Loam'}</span>
                        </div>
                        <div className="text-right">
                          <p>{item.timestamp ? formatTimestamp(item.timestamp) : 'Recent'}</p>
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
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-xl text-slate-800">Disease Detection</h3>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${result.disease && result.disease !== 'Healthy' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {result.disease && result.disease !== 'Healthy' ? 'Issue Detected' : 'Healthy'}
                      </span>
                    </div>

                    <div className="my-6 rounded-2xl overflow-hidden h-48 bg-slate-100">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="disease" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-6xl bg-slate-50">🥬</div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-base">Type: <span className="text-red-600">{result.disease || 'Healthy'}</span></p>
                        <p className="text-sm text-slate-400 mt-0.5">Confidence: {result.confidence || 100}%</p>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 text-sm font-semibold">
                        <Eye size={18} /> View Image
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

// UI Skeleton Loader Component - Beautiful pulsing blocks matching your custom premium styling
const HistoryCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm w-full h-[360px] flex flex-col justify-between animate-pulse">
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
      </div>
      <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4"></div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="space-y-2 w-1/2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
    </div>
  </div>
);

export default History;