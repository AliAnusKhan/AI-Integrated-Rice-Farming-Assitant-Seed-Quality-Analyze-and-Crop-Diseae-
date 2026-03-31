
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, ArrowRight, Loader2, Bug, AlertTriangle, ShieldCheck, Leaf, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysisResult(null);
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

  // 2. Simulation Logic (Fake Analysis)
  const handleAnalyze = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      // Mock Data: Yeh result backend se aayega
      const mockResult = {
        plantName: "Tomato (Tamatar)",
        diseaseName: "Early Blight Detection",
        confidence: 96,
        severity: "Moderate", // Low, Moderate, High
        isHealthy: false,
        treatments: [
          "Use fungicides containing Copper or Mancozeb.",
          "Remove infected lower leaves immediately.",
          "Improve air circulation and avoid overhead watering."
        ]
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2500); // 2.5 sec delay
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium mb-8">
            <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-3">
               <Bug className="text-red-500" /> Crop Disease Detection
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Upload a photo of the affected leaf to identify the disease and get remedies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* LEFT: Upload Section */}
            <div className="bg-white dark:bg-black border border-white rounded-3xl shadow-sm border-2 border-slate-100 dark:border-slate-700 p-6">
                {!selectedImage ? (
                    <div 
                        onClick={triggerFileInput}
                        className="border-3 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-10 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 group h-80 flex flex-col items-center justify-center"
                    >
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Click to Upload Leaf Photo</p>
                    </div>
                ) : (
                    <div className="relative h-80 rounded-2xl overflow-hidden border-2 border-red-500">
                        <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 z-10">
                            <X size={16} />
                        </button>
                        <img src={selectedImage} alt="Leaf Scan" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Button */}
                {selectedImage && !analysisResult && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin"/> Diagnosing Issue...</> : <>Identify Disease <ArrowRight/></>}
                    </button>
                )}
            </div>

            {/* RIGHT: Result Section */}
            <div className="bg-white dark:bg-black border border-white rounded-3xl shadow-sm border-2 border-slate-100 dark:border-slate-700 p-6 min-h-[400px] flex flex-col justify-center">
                
                {!analysisResult && !isAnalyzing && (
                    <div className="text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Leaf size={32} />
                        </div>
                        <p>Upload a leaf photo to see diagnosis.</p>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="text-center space-y-4">
                        <Loader2 size={48} className="animate-spin text-red-500 mx-auto" />
                        <p className="text-slate-600 dark:text-slate-300 font-medium">Analyzing Symptoms...</p>
                        <p className="text-xs text-slate-400">Checking for fungal, bacterial, and viral patterns.</p>
                    </div>
                )}

                {/* --- RESULT CARD --- */}
                {analysisResult && (
                    <div className="animate-fade-in-up w-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Diagnosis Report</span>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                {analysisResult.plantName}
                            </span>
                        </div>

                        {/* Disease Name Main */}
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                {analysisResult.diseaseName}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                                Confidence: <span className="font-bold">{analysisResult.confidence}%</span> • Severity: <span className="font-bold text-red-600">{analysisResult.severity}</span>
                            </p>
                        </div>

                        {/* Recommended Treatments */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <Pill size={20} className="text-blue-500"/> Recommended Cure
                            </h3>
                            <ul className="space-y-3">
                                {analysisResult.treatments.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-200">
                                        <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                            onClick={() => {setAnalysisResult(null); setSelectedImage(null);}}
                            className="w-full border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Check Another Leaf
                        </button>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;