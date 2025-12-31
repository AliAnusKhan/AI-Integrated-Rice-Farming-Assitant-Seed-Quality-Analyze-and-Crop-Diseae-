import React, { useState, useRef } from 'react';
import { Upload, Microscope, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const SeedAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    setAnalyzing(true);

    // === COUNTER LOGIC ADDED HERE ===
    // 1. Purana count uthao (agar nahi hai to 0)
    const currentCount = parseInt(localStorage.getItem('seedCount') || '0');
    // 2. Usmein 1 jama karo aur wapis save kar do
    localStorage.setItem('seedCount', currentCount + 1);
    // ================================
    
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        quality: "Good",
        purity: "92%",
        moisture: "12%",
        recommendation: "Suitable for planting. Treat with fungicide before sowing."
      });
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Microscope className="text-blue-600" size={32} />
          Seed Quality Analyzer
        </h1>
        <p className="text-slate-500 mt-2">Upload an image of your rice seeds to check their quality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center h-fit">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />

          <div 
            onClick={() => fileInputRef.current.click()} 
            className={`w-full h-80 bg-slate-50 border-2 border-dashed ${image ? 'border-blue-500' : 'border-slate-300'} rounded-2xl flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all overflow-hidden relative`}
          >
            {image ? (
                <>
                    <img src={image} alt="Seed Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold">Change Image</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <Upload className="text-blue-600" size={32} />
                    </div>
                    <p className="text-slate-700 font-bold text-lg">Click to upload seed image</p>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG supported</p>
                </>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={analyzing || !image}
            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg ${
                !image ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {analyzing ? "Analyzing..." : <>Check Quality <ArrowRight size={20}/></>}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!result ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-slate-500">No Analysis Yet</h3>
              <p className="text-sm">Upload an image and click "Check Quality" to see results.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex items-center justify-between p-6 bg-green-50 rounded-3xl border border-green-100">
                <span className="text-slate-600 font-bold">Overall Quality</span>
                <span className="text-green-700 font-bold text-xl flex items-center gap-2">
                  <CheckCircle size={24} /> {result.quality}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Purity</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{result.purity}</p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Moisture</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{result.moisture}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-2">AI Recommendation:</p>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedAnalysis;