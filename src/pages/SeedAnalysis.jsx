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
    if (!image) { alert("Pehle image upload karein!"); return; }
    setAnalyzing(true);

    // 1. Update Counter
    const currentCount = parseInt(localStorage.getItem('seedCount') || '0');
    localStorage.setItem('seedCount', currentCount + 1);

    setTimeout(() => {
      setAnalyzing(false);
      const analysisResult = {
        quality: "Good",
        purity: "92%",
        moisture: "12%",
        recommendation: "Suitable for planting."
      };
      setResult(analysisResult);

      // === SAVE TO HISTORY ===
      const newActivity = {
        type: 'Seed Analysis',
        result: `Quality: ${analysisResult.quality} (${analysisResult.purity})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const updatedHistory = [newActivity, ...existingHistory].slice(0, 5); // Keep top 5 only
      localStorage.setItem('recentActivities', JSON.stringify(updatedHistory));
      // =======================

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
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center h-fit">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <div onClick={() => fileInputRef.current.click()} className={`w-full h-80 bg-slate-50 border-2 border-dashed ${image ? 'border-blue-500' : 'border-slate-300'} rounded-2xl flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all overflow-hidden relative`}>
            {image ? <img src={image} alt="Seed Preview" className="w-full h-full object-cover" /> : <><Upload className="text-blue-600 mb-2" size={32} /><p className="text-slate-500">Upload Seed Image</p></>}
          </div>
          <button onClick={handleAnalyze} disabled={analyzing || !image} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200">
            {analyzing ? "Analyzing..." : "Check Quality"}
          </button>
        </div>

        <div className="space-y-6">
          {!result ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 text-center"><AlertCircle size={48} className="opacity-20"/><p>Waiting for analysis</p></div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex justify-between items-center"><span className="text-slate-600 font-bold">Quality</span><span className="text-green-700 font-bold text-xl flex gap-2"><CheckCircle/> {result.quality}</span></div>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100"><p className="text-blue-800 font-bold mb-2">Recommendation:</p><p className="text-blue-700 text-sm">{result.recommendation}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedAnalysis;