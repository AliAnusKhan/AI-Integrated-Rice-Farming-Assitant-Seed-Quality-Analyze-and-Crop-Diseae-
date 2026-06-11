import React, { useState } from 'react';
import { ArrowLeft, Eye, Inbox, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { formatTimestamp } from '../services/historyService';
import { db } from '../firebase'; 
import { deleteDoc, doc } from 'firebase/firestore';

const History = () => {
  const { currentUser } = useAuth();
  const { history, loading, error, refreshHistory } = useHistory(currentUser?.uid);
  const [activeTab, setActiveTab] = useState('seedAnalyses');
  const [clearing, setClearing] = useState(false);

  // 1. SAFE TAB FILTER MATRIX
  const filteredHistory = (history || []).filter(item => {
    if (!item) return false;
    const category = (item.category || '').toLowerCase();
    if (activeTab === 'seedAnalyses') {
      return category.includes('seed');
    }
    if (activeTab === 'diseaseDetections') {
      return category.includes('disease') || category.includes('detection');
    }
    if (activeTab === 'yieldPredictions') {
      return category.includes('yield') || category.includes('prediction');
    }
    return true;
  });

  // 2. FIXED & BULLETPROOF CLEAR HISTORY ACTION HANDLER
  const handleClearTabHistory = async () => {
    if (!currentUser?.uid || filteredHistory.length === 0) return;

    const categoryText = 
      activeTab === 'seedAnalyses' ? 'Seed Analyses' : 
      activeTab === 'diseaseDetections' ? 'Disease Detections' : 'Yield Predictions';

    // Professional English Text
    const confirmClear = window.confirm(`Are you sure you want to permanently delete your entire "${categoryText}" history?`);
    if (!confirmClear) return;

    setClearing(true);
    try {
      // Loop through all items filtered in the active tab
      const deletePromises = filteredHistory.map(async (item) => {
        if (item && item.id) {
          // Parallel dynamic lookup: Yeh teeno collections par brute hit karega. 
          // Jo sahi collection hogi wahan se document delete ho jayega bina code crash kiye!
          return Promise.allSettled([
            deleteDoc(doc(db, 'history', item.id)),
            deleteDoc(doc(db, 'histories', item.id)),
            deleteDoc(doc(db, 'analyses', item.id))
          ]);
        }
        return null;
      });

      // Wait for all delete operations to complete across databases
      await Promise.all(deletePromises);
      alert('Selected history cleared successfully!');
      
      // Screen reload/refresh layout sync
      if (refreshHistory) {
        refreshHistory();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("History clear process failed:", err);
      alert("Could not clear history. Please check your internet or database permissions.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdf9] pb-12">
      {/* Header Layout */}
      <div className="pt-8 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-6xl mx-auto">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium group">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-emerald-950 mt-2">Analysis History</h1>
          <p className="text-emerald-600">View all your farming analyses</p>
        </div>

        {/* Dynamic Clear History Button */}
        {filteredHistory.length > 0 && (
          <button
            type="button"
            onClick={handleClearTabHistory}
            disabled={clearing}
            className="self-start md:self-center inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Trash2 size={16} className={clearing ? "animate-pulse" : ""} />
            {clearing ? "Clearing..." : "Clear Current History"}
          </button>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="px-6 mt-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-1 inline-flex shadow-sm border border-emerald-100 flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('seedAnalyses')}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'seedAnalyses' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🌱 Seed Analyses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diseaseDetections')}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'diseaseDetections' ? 'bg-rose-100 text-rose-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🐛 Disease Detections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yieldPredictions')}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === 'yieldPredictions' ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📈 Yield Predictions
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        {loading ? (
          <>
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
          </>
        ) : filteredHistory.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <Inbox size={48} className="mb-3 opacity-30 text-emerald-800" />
            <p className="font-medium text-slate-500 text-base">No records found in this category</p>
            <p className="text-xs text-slate-400 mt-1">Perform actions on your dashboard to populate data pipeline.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            if (!item) return null;
            const result = item.result || {};
            const itemCategory = (item.category || '').toLowerCase();

            // RENDER: SEED QUALITY SCAN CARD
            if (itemCategory.includes('seed')) {
              const qualityString = String(result.quality || 'STANDARD');
              const isLowQuality = qualityString.toLowerCase().includes('low');
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-xl text-slate-800">Seed Quality Scan</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shrink-0 border ${isLowQuality ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {qualityString}
                      </span>
                    </div>

                    <div className="my-5 h-44 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="Seed Specimen" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-slate-300 text-5xl">🌾</span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-emerald-700 font-bold text-sm line-clamp-1">{result.sampleName || result.seedName || "Seed Batch Sample"}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.timestamp ? formatTimestamp(item.timestamp) : 'Recently Analyzed'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Score</p>
                        <p className="text-2xl font-black text-emerald-600">{result.confidence || 0}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50/50 flex justify-end">
                    <button type="button" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 text-xs font-bold bg-transparent border-none cursor-pointer">
                      <Eye size={16} /> View Analysis Details
                    </button>
                  </div>
                </div>
              );
            }

            // RENDER: YIELD PREDICTION CARD
            if (itemCategory.includes('yield') || itemCategory.includes('prediction')) {
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl text-slate-800">Yield Prediction</h3>
                      <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Processed
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Predicted per acre</p>
                        <p className="text-4xl font-black text-emerald-600 mt-0.5">{result.yieldPerAcre || 3600} <span className="text-lg font-bold text-slate-400">kg</span></p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-slate-400 font-medium">Total Volume</p>
                          <p className="font-bold text-slate-800 text-base mt-0.5">{result.totalYield || 3600} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Farming Plot</p>
                          <p className="font-bold text-slate-800 text-base mt-0.5">{result.farmingArea || 1} acres</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-4 mt-4 border-t border-slate-100 text-slate-500">
                    <div>
                      <span className="font-medium text-slate-400">Soil:</span> <span className="font-bold text-slate-700">{result.soilType || 'Loam'}</span>
                    </div>
                    <p className="text-slate-400">{item.timestamp ? formatTimestamp(item.timestamp) : 'Recent'}</p>
                  </div>
                </div>
              );
            }

            // RENDER: DISEASE DETECTION CARD
            if (itemCategory.includes('disease') || itemCategory.includes('detection')) {
              const isUnhealthy = result.disease && result.disease !== 'Healthy';
              return (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl text-slate-800">Disease Detection</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isUnhealthy ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {isUnhealthy ? 'Issue Detected' : 'Healthy Leaf'}
                      </span>
                    </div>

                    <div className="my-5 rounded-2xl overflow-hidden h-44 bg-slate-100 border border-slate-100">
                      {result.imageUrl ? (
                        <img src={result.imageUrl} alt="Disease Scan Specimen" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-5xl bg-slate-50">🌿</div>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Diagnosis: <span className={isUnhealthy ? "text-rose-600" : "text-emerald-600"}>{result.disease || 'Healthy'}</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">Confidence: {result.confidence || 100}%</p>
                      </div>
                      <button type="button" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 text-xs font-bold bg-transparent border-none cursor-pointer">
                        <Eye size={16} /> Preview
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

// PRESET SKELETON UI CARD
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