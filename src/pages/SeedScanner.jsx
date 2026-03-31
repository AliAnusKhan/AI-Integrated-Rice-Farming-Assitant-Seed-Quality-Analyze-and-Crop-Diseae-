import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, ArrowRight, Loader2, Sprout, CheckCircle, AlertTriangle, Activity, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import CameraCapture from '../components/Camera';

const SeedScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // Result store karne ke liye
  const fileInputRef = useRef(null);

  // 1. Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysisResult(null); // Nayi image ho to purana result hata do
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 2. Asli Analysis Logic (Simulation)
  const handleAnalyze = () => {
    setIsAnalyzing(true);

    // Yahan hum 2.5 second ka delay daal rahe hain taake wo "Scanning" jaisa lage
    setTimeout(() => {
      // Yeh Dummy Data hai (Jab backend banega tab yahan API call aayegi)
      const mockResult = {
        qualityScore: 92,
        germinationRate: "High (90-95%)",
        diseaseDetected: false,
        moistureLevel: "Optimal",
        species: "Wheat (Gandum)",
        recommendation: "Seeds are healthy. Suitable for sowing immediately."
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium mb-8">
            <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        {/* Title */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-3">
               <Sprout className="text-green-500" /> Seed Quality Analysis
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Upload a clear photo to get instant quality report.</p>
        </div>

                    <CameraCapture/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* LEFT SIDE: Image Upload Section */}
            <div className="dark:bg-black  border border-white rounded-3xl shadow-sm border-2 border-slate-100 dark:border-slate-700 p-6 ">
                {!selectedImage ? (
                    <div 
                        onClick={triggerFileInput}
                        className="border-3 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-10 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-300 group h-80 flex flex-col items-center justify-center"
                    >
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Click to Upload Seed Image</p>
                    
                    </div>
                ) : (
                    <div className="relative h-80 rounded-2xl overflow-hidden border-2 border-green-500">
                        <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 z-10">
                            <X size={16} />
                        </button>
                        <img src={selectedImage} alt="Scan" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Analyze Button */}
                {selectedImage && !analysisResult && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin"/> Scanning AI Model...</> : <>Analyze Seed <ArrowRight/></>}
                    </button>
                )}
            </div>

            {/* RIGHT SIDE: Results Section */}
            <div className="bg-white dark:bg-black border border-white rounded-3xl shadow-sm border-2 border-slate-100 dark:border-slate-700 p-6  flex flex-col justify-center">
                
                {!analysisResult && !isAnalyzing && (
                    <div className="text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity size={32} />
                        </div>
                        <p>Results will appear here after analysis.</p>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="text-center space-y-4">
                        <Loader2 size={48} className="animate-spin text-green-500 mx-auto" />
                        <p className="text-slate-600 dark:text-slate-300 font-medium">Processing Image...</p>
                        <p className="text-xs text-slate-400">Checking seed count, moisture, and defects.</p>
                    </div>
                )}

                {/* --- RESULT CARD (Jab Analysis Khatam Ho) --- */}
                {analysisResult && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analysis Report</h2>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                CONFIDENCE: 98%
                            </span>
                        </div>

                        {/* 1. Quality Score Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500 dark:text-slate-400">Overall Quality</span>
                                <span className="font-bold text-green-600">{analysisResult.qualityScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${analysisResult.qualityScore}%` }}></div>
                            </div>
                        </div>

                        {/* 2. Detailed Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                <p className="text-xs text-slate-400 mb-1">Germination Rate</p>
                                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Sprout size={16} className="text-green-500"/> {analysisResult.germinationRate}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                <p className="text-xs text-slate-400 mb-1">Moisture</p>
                                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Droplets size={16} className="text-blue-500"/> {analysisResult.moistureLevel}
                                </p>
                            </div>
                        </div>

                        {/* 3. Disease Status */}
                        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${analysisResult.diseaseDetected ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
                            {analysisResult.diseaseDetected ? <AlertTriangle className="shrink-0"/> : <CheckCircle className="shrink-0"/>}
                            <div>
                                <p className="font-bold text-sm">
                                    {analysisResult.diseaseDetected ? "Disease Detected!" : "No Disease Detected"}
                                </p>
                                <p className="text-xs opacity-90 mt-1">{analysisResult.recommendation}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => {setAnalysisResult(null); setSelectedImage(null);}}
                            className="w-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Scan Another Sample
                        </button>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default SeedScanner;