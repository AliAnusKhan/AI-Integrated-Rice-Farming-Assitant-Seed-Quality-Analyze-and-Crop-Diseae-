import React, { useState } from 'react';
import { Sprout, Scale, TrendingUp, DollarSign } from 'lucide-react';

const YieldPrediction = () => {
  const [area, setArea] = useState('');
  const [prediction, setPrediction] = useState(null);

  const calculateYield = (e) => {
    e.preventDefault();
    
    // 1. Update Counter
    const currentCount = parseInt(localStorage.getItem('yieldCount') || '0');
    localStorage.setItem('yieldCount', currentCount + 1);

    const estYield = area * 1200; 
    const estProfit = estYield * 150; 

    setPrediction({ totalYield: estYield, totalProfit: estProfit });

    // === SAVE TO HISTORY ===
    const newActivity = {
      type: 'Yield Prediction',
      result: `Est: ${estYield} kg | Profit: Rs ${estProfit}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    const updatedHistory = [newActivity, ...existingHistory].slice(0, 5);
    localStorage.setItem('recentActivities', JSON.stringify(updatedHistory));
    // =======================
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-8"><TrendingUp className="text-orange-500" size={32} /> Yield Estimator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
          <form onSubmit={calculateYield} className="space-y-6">
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Land Area (Acres)</label><input type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" value={area} onChange={(e) => setArea(e.target.value)} /></div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200">Calculate</button>
          </form>
        </div>
        <div className="bg-orange-600 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center min-h-[400px]">
            {!prediction ? <p>Enter details to calculate.</p> : 
            <div className="space-y-6"><div className="bg-white/10 p-6 rounded-2xl"><p className="text-sm">Expected Production</p><p className="text-5xl font-bold">{prediction.totalYield} kg</p></div></div>}
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;