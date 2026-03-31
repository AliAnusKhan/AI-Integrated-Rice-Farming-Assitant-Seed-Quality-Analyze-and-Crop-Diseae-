import React from 'react';
import { ArrowLeft, Clock, Calendar, ChevronRight, FileText, CheckCircle, AlertCircle } from 'lucide-react';
// FIX: Import Link from react-router-dom
import { Link } from 'react-router-dom';

const History = () => {
  // Sample Data (You can replace this with real API data later)
  const historyData = [
    { id: 1, type: 'Disease', name: 'Tomato Blight', date: 'Dec 19, 2024', status: 'Detected', color: 'red' },
    { id: 2, type: 'Yield', name: 'Wheat Field A', date: 'Dec 18, 2024', status: 'Completed', color: 'yellow' },
    { id: 3, type: 'Seed', name: 'Corn Hybrid', date: 'Dec 15, 2024', status: 'Good Quality', color: 'green' },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300">
      
      {/* Header */}
      <div className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors font-medium mb-4 bg-white dark:bg-black border border-white px-4 py-2 rounded-full text-sm shadow-sm border border-blue-100 dark:border-slate-700">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Activity Records</h1>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white dark:bg-black border border-white rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            {historyData.map((item) => (
                <div key={item.id} className="p-6 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                            item.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                            item.color === 'yellow' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                            'bg-green-100 text-green-600 dark:bg-green-900/30'
                        }`}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> 10:23 AM</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                             item.color === 'red' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 
                             item.color === 'yellow' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 
                             'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                            {item.status}
                        </span>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default History;