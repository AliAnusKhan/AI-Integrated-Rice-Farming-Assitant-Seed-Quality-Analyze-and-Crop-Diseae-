import React, { useState, useRef } from 'react';
import { ScanLine, Upload, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const DiseaseScanner = () => {
  const [scanning, setScanning] = useState(false);
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

  const handleScan = () => {
    if (!image) return;
    setScanning(true);
    
    // 1. Update Counter
    const currentCount = parseInt(localStorage.getItem('diseaseCount') || '0');
    localStorage.setItem('diseaseCount', currentCount + 1);

    setTimeout(() => {
      setScanning(false);
      const diseaseName = "Brown Spot"; // Hardcoded for demo
      setResult({
        disease: diseaseName,
        confidence: "89%",
        treatment: "Apply fungicides like Mancozeb."
      });

      // === SAVE TO HISTORY ===
      const newActivity = {
        type: 'Disease Detection',
        result: `Found: ${diseaseName}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const updatedHistory = [newActivity, ...existingHistory].slice(0, 5);
      localStorage.setItem('recentActivities', JSON.stringify(updatedHistory));
      // =======================

    }, 2500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><ScanLine className="text-red-500" size={32} /> Disease Detection</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center h-fit">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div onClick={() => fileInputRef.current.click()} className={`w-full h-80 bg-slate-50 border-2 border-dashed ${image ? 'border-green-500' : 'border-slate-300'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-all mb-6 overflow-hidden relative`}>
                    {image ? <img src={image} alt="Leaf Preview" className="w-full h-full object-cover" /> : <><Upload className="text-green-600 mb-4" size={32} /><p className="text-slate-500">Upload Leaf Image</p></>}
                </div>
                <button onClick={handleScan} disabled={scanning || !image} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200">
                    {scanning ? "Analyzing..." : "Detect Disease"}
                </button>
            </div>
            <div className="space-y-6">
                {!result ? <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex items-center justify-center text-slate-400">Waiting for scan...</div> : 
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100"><h2 className="text-3xl font-bold text-red-700 flex items-center gap-2"><AlertTriangle/> {result.disease}</h2></div>}
            </div>
      </div>
    </div>
  );
};

export default DiseaseScanner;