import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle, CheckCircle, ShieldCheck, Leaf, BrainCircuit } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useSaveHistory } from '../hooks/useHistory';
import { Client } from "@gradio/client"; 

const base64ToBlob = (base64Data) => {
  const byteString = atob(base64Data.split(',')[1]);
  const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
  return new Blob([ab], { type: mimeString });
};

const DiseaseDetection = () => {
  const { currentUser } = useAuth();
  const { save: saveToHistory } = useSaveHistory(currentUser?.uid);
  const [step, setStep] = useState('upload'); 
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageFile(file);
        setStep('preview');
        setSaveError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setStep('analyzing');
    setSaveError(null);

    try {
      const imageBlob = base64ToBlob(image);
      let result;
      
      try {
        const client = await Client.connect("https://ricefarming-diseases-model.hf.space");
        result = await client.predict("/predict", { input_img: imageBlob });
      } catch (e) {
        const backupClient = await Client.connect("ricefarming/diseases-model");
        result = await backupClient.predict("/predict", { input_img: imageBlob });
      }

      let serverPayload = JSON.parse(result.data[0]);
      if (serverPayload.Error) throw new Error(serverPayload.Error);

      // 🛑 MASTER STRICT VALIDATION GUARD (SRK BLOCKER)
      const rawConfidence = serverPayload.confidence !== undefined ? serverPayload.confidence : 0.0;
      const llmMetrics = serverPayload.llm_metrics || {};
      const symptomsText = (llmMetrics.colorQuality || "").toLowerCase();
      
      const isInvalidConfidence = rawConfidence < 0.75; 
      const isInvalidContent = symptomsText.includes("invalid") || symptomsText.includes("human") || symptomsText.includes("person") || symptomsText.length < 25;

      if (isInvalidConfidence || isInvalidContent) {
        throw new Error("Invalid Input Detected: The uploaded image does not contain a valid rice leaf structure. Please upload a proper crop leaf photo.");
      }

      const rawPredictedDisease = serverPayload.predicted_label || "Healthy";
      const calculatedConfidence = Math.round(rawConfidence * 100);

      // 🔄 STATE SHARING LOGIC FOR YIELD
      if (rawPredictedDisease) {
        let formattedDisease = 'None';
        if (rawPredictedDisease.toLowerCase().includes('blast')) formattedDisease = 'Severe';
        else if (rawPredictedDisease.toLowerCase().includes('brown')) formattedDisease = 'Moderate';
        else if (rawPredictedDisease.toLowerCase().includes('hispa')) formattedDisease = 'Mild';
        localStorage.setItem('scannedDiseaseStatus', formattedDisease);
      }

      const finalResult = {
        disease: rawPredictedDisease, 
        severity: llmMetrics.expectedGermination || "📢 MODERATE CONTAINMENT REQUIRED",
        confidence: calculatedConfidence,
        observedSymptoms: String(llmMetrics.colorQuality || "Processed."),
        recommendedTreatment: String(llmMetrics.sizeUniformity || "Apply Elements."),
        preventionTips: String(llmMetrics.textureQuality || "Isolate channels."),
        expectedYieldImpact: typeof llmMetrics.recommendations === 'object' ? (llmMetrics.recommendations.text || llmMetrics.recommendations.advice) : String(llmMetrics.recommendations || "Routine check."),
        imageUrl: image, 
        status: "Detected",
        leafName: imageFile?.name || "Sample Leaf",
        isLlmGenerated: !result.data[0].includes("Fallback")
      };

      setAnalysisResult(finalResult);
      try { await saveToHistory('diseaseDetections', finalResult); } catch (e) {}
      setStep('result');
    } catch (error) {
      setSaveError(error.message || "Invalid Input: Please upload a proper rice leaf image.");
      setStep('preview');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null); imageFile(null); setAnalysisResult(null); setSaveError(null); setStep('upload');
  };

  return (
    <div className="relative w-full min-h-screen bg-emerald-50/30 p-6 overflow-x-hidden overflow-y-auto box-border">
      <div className="max-w-4xl mx-auto py-10 w-full block">
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 bg-transparent border-none cursor-pointer"><ArrowLeft size={20} /> Back to Dashboard</button>
        <div className="mb-8 block">
          <h1 className="text-4xl font-bold text-slate-800 m-0">Disease Detection</h1>
          <p className="text-slate-500 mt-2 text-lg m-0">Upload rice leaf images for instant deep learning diagnostics</p>
        </div>

        <div className="min-h-[500px] w-full block relative">
          {step === 'upload' && (
            <div className="text-center h-[420px] flex flex-col justify-center border-2 border-dashed border-emerald-300 bg-white rounded-3xl p-6 shadow-sm w-full box-border">
              <div onClick={() => fileInputRef.current.click()} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Upload size={32} /></div>
                <p className="text-xl font-semibold text-slate-700 mb-1 m-0">Drop rice leaf image here</p>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button type="button" className="bg-emerald-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-md border-none pointer-events-none"><Camera size={20} /> Choose Image</button>
              </div>
            </div>
          )}

          {step === 'preview' && image && (
            <div className="p-8 min-h-[420px] flex flex-col justify-between rounded-3xl bg-white border border-slate-200 shadow-sm text-center w-full box-border">
              {saveError && <div className="bg-red-50 border border-red-200 p-4 mb-4 rounded-2xl text-red-700 text-sm font-medium text-left flex items-start gap-2"><AlertTriangle size={18} className="shrink-0 text-red-600" /><span>{saveError}</span></div>}
              <div className="flex justify-center items-center h-48 overflow-hidden mb-4"><img src={image} alt="Preview" className="max-h-44 rounded-xl object-contain shadow-sm" /></div>
              <div className="flex gap-4 justify-center">
                <button type="button" onClick={resetAnalysis} className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl bg-white cursor-pointer">Choose Another</button>
                <button type="button" onClick={handleAnalyze} disabled={analyzing} className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md border-none cursor-pointer"><Sparkles size={20} /> Detect Disease</button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="h-[420px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm text-center w-full box-border">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 m-0">Analyzing Leaf Sample...</h3>
            </div>
          )}

          {step === 'result' && analysisResult && (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-8 block w-full box-border">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
                  <p className="font-bold text-emerald-800 m-0">AI Diagnostic Complete</p>
                </div>
                {analysisResult.isLlmGenerated && <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"><BrainCircuit size={14} /> Powered by Gemini LLM</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
                <div className="md:col-span-5 flex justify-center items-start"><div className="p-2 border border-slate-100 rounded-2xl bg-slate-50 w-full"><img src={analysisResult.imageUrl} alt="Crop" className="max-h-72 w-full rounded-xl object-contain" /></div></div>
                <div className="md:col-span-7 space-y-5">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Condition Detected</p><div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-xl font-bold">{analysisResult.disease}</div></div>
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Severity Status</p><div className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-50 text-amber-800">{analysisResult.severity}</div></div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"><span>Confidence Level</span><span className="text-emerald-600 font-extrabold">{analysisResult.confidence}%</span></div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.confidence}%` }}></div></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 block w-full box-border">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"><p className="font-bold text-slate-800 mb-1.5 flex items-center gap-2 text-sm m-0"><AlertTriangle size={16} className="text-amber-500" /> Symptoms</p><p className="text-slate-600 text-sm m-0 mt-1">{analysisResult.observedSymptoms}</p></div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100"><p className="font-bold text-emerald-800 mb-1.5 flex items-center gap-2 text-sm m-0"><ShieldCheck size={16} className="text-emerald-600" /> Recommended Control</p><p className="text-emerald-700 text-sm m-0 mt-1">{analysisResult.recommendedTreatment}</p></div>
                <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100"><p className="font-bold text-sky-800 mb-1.5 flex items-center gap-2 text-sm m-0"><Leaf size={16} className="text-sky-600" /> Prevention Tips</p><p className="text-sky-700 text-sm m-0 mt-1">{analysisResult.preventionTips}</p></div>
                <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100"><p className="font-bold text-orange-800 mb-1 text-sm m-0">Protocol Summary</p><p className="text-orange-700 text-sm m-0 mt-1">{analysisResult.expectedYieldImpact}</p></div>
              </div>
              <div className="pt-4 flex justify-center"><button type="button" onClick={resetAnalysis} className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-semibold shadow-md border-none cursor-pointer">Scan Another Leaf</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;