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
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

const DiseaseDetection = () => {
  const { currentUser } = useAuth();
  const { save: saveToHistory, saving: savingHistory } = useSaveHistory(currentUser?.uid);
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
        console.log("📡 Attempting Route 1: Direct Mirror URL...");
        const client = await Client.connect("[https://ricefarming-diseases-model.hf.space](https://ricefarming-diseases-model.hf.space)");
        result = await client.predict("/predict", { input_img: imageBlob });
      } catch (firstConnectError) {
        console.warn("⚠️ Route 1 failed, trying Route 2 (Explicit Repo Key)...", firstConnectError);
        const backupClient = await Client.connect("ricefarming/diseases-model");
        result = await backupClient.predict("/predict", { input_img: imageBlob });
      }

      console.log("📥 Raw Server Response Payload:", result.data);

      if (typeof result.data[0] === 'string' && (result.data[0].startsWith("Under") || result.data[0].includes("<!DOCTYPE"))) {
        throw new Error("Hugging Face Server is booting up or building. Please wait 30 seconds and retry.");
      }

      let serverPayload;
      try {
        serverPayload = JSON.parse(result.data[0]);
      } catch (e) {
        throw new Error("Invalid output layout stream from AI provider endpoint.");
      }

      if (serverPayload.Error) {
        throw new Error(serverPayload.Error);
      }

      const rawPredictedDisease = serverPayload.predicted_label || "Healthy";
      const rawConfidence = serverPayload.confidence !== undefined ? serverPayload.confidence : 0.70;
      const calculatedConfidence = Math.round(rawConfidence * 100);

      if (calculatedConfidence < 40) {
        setSaveError("Invalid Input: Leaf structure not detected properly. Please try with a clearer image.");
        setStep('preview'); 
        setAnalyzing(false);
        return; 
      }

      const llmMetrics = serverPayload.llm_metrics || {};

      let symptoms = llmMetrics.colorQuality || "Leaf diagnostic parameters processed with baseline pathology values.";
      let treatment = llmMetrics.sizeUniformity || "Apply target chemical elements matching localized farm regulations.";
      let tips = llmMetrics.textureQuality || "Isolate stagnant runoff water channels inside affected blocks.";
      let severityIndicator = llmMetrics.expectedGermination || "📢 MODERATE CONTAINMENT REQUIRED";
      
      let rawRecommendations = llmMetrics.recommendations;
      let globalProtocol = "";
      if (typeof rawRecommendations === 'object' && rawRecommendations !== null) {
        globalProtocol = rawRecommendations.text || rawRecommendations.advice || JSON.stringify(rawRecommendations);
      } else {
        globalProtocol = String(rawRecommendations || "Maintain custom weeding routines and monitor fields daily.");
      }

      const finalResult = {
        disease: rawPredictedDisease, 
        severity: severityIndicator,
        confidence: calculatedConfidence,
        observedSymptoms: String(symptoms),
        recommendedTreatment: String(treatment),
        preventionTips: String(tips),
        expectedYieldImpact: globalProtocol,
        imageUrl: image, 
        status: "Detected",
        leafName: imageFile?.name || "Sample Leaf",
        isLlmGenerated: !result.data[0].includes("Fallback")
      };

      setAnalysisResult(finalResult);

      try {
        await saveToHistory('diseaseDetections', finalResult);
      } catch (error) {
        console.error("Firestore history save error skipped:", error);
      }

      setStep('result');
    } catch (error) {
      console.error("❌ Process Pipeline Error:", error);
      setSaveError("AI Connection Error: " + error.message);
      setStep('preview');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setSaveError(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 p-6">
      <div className="max-w-4xl py-10 my-auto mx-auto">
        
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Disease Detection
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Upload rice leaf images for instant deep learning and LLM-augmented diagnostics
          </p>
        </div>

        {/* STEP 1: UPLOAD SCREEN */}
        {step === 'upload' && (
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-3xl bg-white py-12 flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
              <p className="text-xl font-semibold text-slate-700 mb-1">Drop rice leaf image here</p>
              <p className="text-slate-400 mb-6 text-sm">Supports JPG, PNG formats</p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />

              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-md transition-all">
                <Camera size={20} />
                Choose Image
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW SCREEN */}
        {step === 'preview' && image && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
            {saveError && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-2xl text-red-700 text-sm font-medium flex items-start gap-2 text-left">
                <span>⚠️</span> <span>{saveError}</span>
              </div>
            )}
            
            <div className="flex justify-center mb-8">
              <div className="p-2 border border-slate-100 rounded-2xl bg-slate-50">
                <img src={image} alt="Preview" className="max-h-80 rounded-xl object-contain shadow-sm" />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetAnalysis}
                className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Choose Another Image
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
              >
                <Sparkles size={20} />
                Detect Disease
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ANALYZING SCREEN */}
        {step === 'analyzing' && (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Leaf Sample...</h3>
            <p className="text-slate-500 animate-pulse">Running Deep Neural Extraction & Requesting Generative Agronomist Insights...</p>
          </div>
        )}

        {/* STEP 4: RESULT SCREEN */}
        {step === 'result' && analysisResult && (
          <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-8">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <p className="font-bold text-emerald-800">AI Diagnostic Complete</p>
              </div>
              {analysisResult.isLlmGenerated && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-bounce">
                  <BrainCircuit size={14} /> Powered by Gemini LLM
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 flex justify-center items-start">
                <div className="p-2 border border-slate-100 rounded-2xl bg-slate-50 w-full">
                  <img src={analysisResult.imageUrl} alt="Crop Leaf" className="max-h-72 w-full rounded-xl object-contain" />
                </div>
              </div>

              <div className="md:col-span-7 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Condition Detected</p>
                  <div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-xl font-bold flex items-baseline justify-between">
                    <span>{analysisResult.disease}</span> 
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Severity / Status Evaluation</p>
                  <div className={`px-5 py-2.5 rounded-xl font-semibold text-sm uppercase tracking-wide border ${
                    analysisResult.severity.includes('CRITICAL') || analysisResult.disease.toLowerCase().includes('blast') || analysisResult.disease.toLowerCase().includes('tungro')
                      ? 'bg-red-50 border-red-200 text-red-800 animate-pulse'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {analysisResult.severity}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>Model Confidence Level</span>
                    <span className="text-emerald-600 font-extrabold">{analysisResult.confidence}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${analysisResult.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Panels */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1.5 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} className="text-amber-500" /> Pathological Leaf Symptoms
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">{analysisResult.observedSymptoms}</p>
              </div>

              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <p className="font-bold text-emerald-800 mb-1.5 flex items-center gap-2 text-sm">
                  <ShieldCheck size={16} className="text-emerald-600" /> Recommended Fungicide & Treatment Control
                </p>
                <p className="text-emerald-700 text-sm leading-relaxed">{analysisResult.recommendedTreatment}</p>
              </div>

              <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100">
                <p className="font-bold text-sky-800 mb-1.5 flex items-center gap-2 text-sm">
                  <Leaf size={16} className="text-sky-600" /> Organic Remedies & Cultural Field Tips
                </p>
                <p className="text-sky-700 text-sm leading-relaxed">{analysisResult.preventionTips}</p>
              </div>

              <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100">
                <p className="font-bold text-orange-800 mb-1 text-sm">Comprehensive Field Protocol Summary</p>
                <p className="text-orange-700 text-sm leading-relaxed">{analysisResult.expectedYieldImpact}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={resetAnalysis}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-semibold shadow-md transition-all"
              >
                Scan Another Leaf
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;