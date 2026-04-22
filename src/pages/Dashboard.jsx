import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ScanLine, TrendingUp, ArrowRight, Award, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { getCategoryConfig } from '../services/historyService';
import Header from './TempratureAPI';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ seedCount: 0, diseaseCount: 0, yieldCount: 0 });
  const [activities, setActivities] = useState([]);
  const { history, loading, error } = useHistory(currentUser?.uid);

  // Calculate stats from Firebase history
  useEffect(() => {
    if (history && history.length > 0) {
      const seedCount = history.filter(item => item.category === 'seedAnalysis').length;
      const diseaseCount = history.filter(item => item.category === 'diseaseDetections').length;
      const yieldCount = history.filter(item => item.category === 'yieldPredictions').length;
      
      setStats({ seedCount, diseaseCount, yieldCount });
    }
  }, [history]);

  // Load recent activities from history
  useEffect(() => {
    if (history && history.length > 0) {
      // Convert Firebase history to activity format
      const recentActivities = history.slice(0, 10).map(item => {
        const categoryConfig = getCategoryConfig(item.category);
        const date = item.createdAt ? new Date(item.createdAt) : new Date();
        const timeStr = date.toLocaleString();
        
        return {
          type: categoryConfig.label,
          result: item.result?.status || 'Completed',
          time: timeStr,
          category: item.category,
        };
      });
      
      setActivities(recentActivities);
    }
  }, [history]);

  return (
    <div className="p-8 min-h-screen bg-[#f8fcf8]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-green-600 font-medium mt-1">Your intelligent farming companion</p>
        </div>
        <Header/>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActionCard title="Analyze Seed Quality" icon={<Sprout size={24}/>} color="green" link="/seed-analyzer" desc="Check seed purity" />
        <ActionCard title="Detect Disease" icon={<ScanLine size={24}/>} color="red" link="/disease-detection" desc="Identify crop issues" />
        <ActionCard title="Predict Yield" icon={<TrendingUp size={24}/>} color="yellow" link="/yield-prediction" desc="Estimate harvest" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Seed Analyses" count={stats.seedCount} icon={<Sprout size={40}/>} color="green" />
        <StatCard title="Disease Detections" count={stats.diseaseCount} icon={<ScanLine size={40}/>} color="red" />
        <StatCard title="Yield Predictions" count={stats.yieldCount} icon={<TrendingUp size={40}/>} color="orange" />
      </div>

      {/* === RECENT ACTIVITY SECTION === */}
      <div>
        {/* <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            {activities.length > 0 && (
                <button 
                  onClick={() => { localStorage.removeItem('recentActivities'); setActivities([]); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear History
                </button>
            )}
        </div> */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                    <Clock size={48} className="mb-2 opacity-20" />
                    <p>No recent activity. Start analyzing to see history here.</p>
                </div>
            ) : (
                <div>
                    {activities.map((item, index) => (
                        <div key={index} className={`p-4 border-b border-slate-100 last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            item.type === 'Disease Detection' ? 'bg-red-50/30' : 'bg-white'
                        }`}>
                           <div className="flex items-center gap-4">
                                {/* Icon based on Type */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    item.type === 'Seed Analysis' ? 'bg-green-100 text-green-600' :
                                    item.type === 'Disease Detection' ? 'bg-red-100 text-red-600' :
                                    'bg-orange-100 text-orange-600'
                                }`}>
                                    {item.type === 'Seed Analysis' && <Sprout size={20} />}
                                    {item.type === 'Disease Detection' && <ScanLine size={20} />}
                                    {item.type === 'Yield Prediction' && <TrendingUp size={20} />}
                                </div>
                                
                                {/* Text Info */}
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{item.type}</h4>
                                    <p className={`text-xs font-medium ${
                                        item.type === 'Disease Detection' ? 'text-red-500' : 'text-slate-500'
                                    }`}>
                                        {item.result}
                                    </p>
                                </div>
                           </div>

                           {/* Status Icon/Time */}
                           <div className="flex flex-col items-end">
                                {item.type === 'Disease Detection' ? (
                                    <AlertCircle size={18} className="text-red-500 mb-1" />
                                ) : (
                                    <CheckCircle size={18} className="text-green-500 mb-1" />
                                )}
                                <span className="text-[10px] text-slate-400">{item.time}</span>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

// Helper Components
const ActionCard = ({ title, icon, color, link, desc }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between h-48">
    <div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600 mb-4`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
    </div>
    <Link to={link} className="text-green-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
        Start <ArrowRight size={16} />
    </Link>
  </div>
);

const StatCard = ({ title, count, icon, color }) => (
  <div className={`bg-${color}-50 border border-${color}-100 p-6 rounded-2xl flex items-center justify-between`}>
    <div>
        <p className={`text-${color}-700 font-bold text-sm`}>{title}</p>
        <h2 className="text-3xl font-bold text-slate-800 mt-1">{count}</h2>
    </div>
    <div className={`text-${color}-300`}>{icon}</div>
  </div>
);

export default Dashboard;