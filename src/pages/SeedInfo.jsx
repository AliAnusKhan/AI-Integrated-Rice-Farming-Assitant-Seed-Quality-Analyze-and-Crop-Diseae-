import React from 'react';
import { ArrowLeft, CheckCircle, ArrowRight, Sprout, ScanLine, FileBarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const SeedInfo = () => {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300">
      
      {/* Header */}
      <div className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors font-medium mb-4 bg-white dark:bg-black border border-white px-4 py-2 rounded-full text-sm shadow-sm border border-green-100 dark:border-slate-700">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white dark:bg-black border border-white rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
            
            {/* Hero Section */}
            <div className="p-8 md:p-12 text-center border-b border-slate-100 dark:border-slate-700">
                <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                    <Sprout size={40} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Seed Quality Analysis</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Use our advanced AI to determine seed purity, physical defects, and germination probability before you plant.
                </p>
                
                {/* THE BUTTON TO NAVIGATE TO UPLOAD PAGE */}
                <Link to="/seed-scan" className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-green-200 dark:shadow-none transition-all hover:-translate-y-1">
                    Start New Analysis <ArrowRight size={20} />
                </Link>
            </div>

            {/* How it Works Grid */}
            <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-black border border-white/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8 text-center">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <ScanLine size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">1. Upload Image</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Take a clear photo of your seed sample spread on a plain white surface.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600">
                        <div className="bg-purple-50 dark:bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <FileBarChart size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">2. AI Processing</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Our model identifies broken seeds, impurities, and mixed varieties instantly.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600">
                        <div className="bg-green-50 dark:bg-green-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">3. Get Results</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive a detailed quality score and germination forecast for your crop.</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SeedInfo;