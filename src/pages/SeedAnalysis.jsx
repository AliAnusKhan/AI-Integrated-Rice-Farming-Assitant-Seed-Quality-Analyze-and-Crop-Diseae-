import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle, CheckCircle, ShieldCheck, Layers, Droplets, FileText, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Client, handle_file } from '@gradio/client';

const SeedAnalysis = () => {
  const [step, setStep] = useState('upload'); 
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep('preview');
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setStep('analyzing');
    setError(null);
    setResult(null);

    try {
      const app = await Client.connect("ricefarming/rice-farming-first-model-0.1");
      const imageFile = handle_file(image);
      const prediction = await app.predict("/predict", [imageFile]);

      if (prediction && prediction.data && prediction.data[0]) {
        let rawData = prediction.data[0];
        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        
        if (parsedData.Error) {
          throw new Error(parsedData.Error);
        }

        // 🛑 MASTER STRICT SEED VALIDATION GUARD
        const rawConfidence = parsedData.confidence !== undefined ? parsedData.confidence : 0.0;
        const label = (parsedData.predicted_label || "").toLowerCase();
        const metrics = parsedData.llm_metrics || {};
        const colorText = (metrics.colorQuality || "").toLowerCase();

        const isInvalidConfidence = rawConfidence < 0.75;
        const isNotRiceSeed = !label.includes("seed") && !label.includes("rice") && !label.includes("grain") && !label.includes("karuna") && !label.includes("basmati");
        const isInvalidContent = colorText.includes("invalid") || colorText.includes("human") || colorText.includes("person") || colorText.length < 25;

        if (isInvalidConfidence || isNotRiceSeed || isInvalidContent) {
          throw new Error("Invalid Input Detected: The uploaded image does not match actual rice seed specifications or clarity is too low. Please upload a clear photo of proper rice grains.");
        }
        
        // 🔄 STATE SHARING LOGIC FOR YIELD
        if (parsedData.predicted_label) {
          const formattedGrade = parsedData.predicted_label.toLowerCase().includes('high') ? 'High' : 
                                 parsedData.predicted_label.toLowerCase().includes('low') ? 'Low' : 'Medium';
          localStorage.setItem('scannedSeedQuality', formattedGrade);
        }

        setResult(parsedData);
        setStep('result');
      } else {
        throw new Error("AI pipeline integration issue: Empty dataset received.");
      }
    } catch (err) {
      setError(err.message || "Invalid Input: Please upload a proper rice seed sample.");
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="relative w-full min-h-screen bg-emerald-50/30 p-6 overflow-x-hidden overflow-y-auto overscroll-none touch-none select-none box-border">
      <div className="max-w-4xl mx-auto py-10 w-full block">
        
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 no-underline">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="mb-8 block">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight m-0">Seed Quality Analyzer</h1>
          <p className="text-slate-500 mt-2 text-lg m-0">Scan rice seed batches for instant industrial grading</p>
        </div>

        <div className="min-h-[500px] w-full block relative">
          {step === 'upload' && (
            <div className="text-center h-[420px] flex flex-col justify-center border-2 border-dashed border-emerald-300 bg-white rounded-3xl p-6 shadow-sm w-full block box-border">
              <div onClick={() => fileInputRef.current.click()} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <p className="text-xl font-semibold text-slate-700 mb-1 m-0">Drop seed batch image here</p>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <button type="button" className="bg-emerald-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-md border-none pointer-events-none">
                  <Camera size={20} /> Choose Image
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && previewUrl && (
            <div className="p-8 min-h-[420px] flex flex-col justify-between rounded-3xl bg-white border border-slate-200 border-solid shadow-sm text-center w-full block box-border">
              {error && (
                <div className="bg-red-50 border border-red-200 border-solid p-4 mb-4 rounded-2xl text-red-700 text-sm font-medium flex items-start gap-2 text-left block w-full box-border">
                  <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" /> 
                  <span className="block w-full">{error}</span>
                </div>
              )}
              <div className="flex justify-center items-center h-48 overflow-hidden block w-full mb-4">
                <img src={previewUrl} alt="Preview" className="max-h-44 rounded-xl object-contain shadow-sm block" />
              </div>
              <div className="flex gap-4 justify-center block w-full">
                <button type="button" onClick={resetAnalysis} className="px-6 py-3 border border-slate-200 border-solid text-slate-700 font-semibold rounded-xl bg-white cursor-pointer">Choose Another Image</button>
                <button type="button" onClick={handleAnalyze} className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md border-none cursor-pointer"><Sparkles size={20} /> Run AI Analysis</button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="h-[420px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-solid shadow-sm text-center w-full block box-border">
              <div className="w-16 h-16 border-4 border-solid border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 m-0">Analyzing Seed Batch...</h3>
            </div>
          )}

          {step === 'result' && result && (
            <div className="p-8 bg-white border border-slate-200 border-solid rounded-3xl shadow-sm space-y-8 block w-full box-border">
              <div className="bg-emerald-50 border border-emerald-100 border-solid rounded-2xl p-4 flex items-center justify-between block w-full box-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
                  <p className="font-bold text-emerald-800 m-0">Seed Evaluation Complete</p>
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"><BrainCircuit size={14} /> Powered by Gemini LLM</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 block w-full">
                <div className="md:col-span-5 flex justify-center items-start block">
                  <div className="p-2 border border-slate-100 border-solid rounded-2xl bg-slate-50 w-full block">
                    <img src={previewUrl} alt="Analyzed" className="max-h-72 w-full rounded-xl object-contain block" />
                  </div>
                </div>
                <div className="md:col-span-7 space-y-5 block">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Quality Grade</p>
                    <div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-xl font-bold capitalize">{result.predicted_label} Quality Grade</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Expected Germination</p>
                    <div className="bg-rose-50 border border-rose-200 border-solid px-5 py-2.5 rounded-xl text-rose-800 font-extrabold text-lg">{result.llm_metrics?.expectedGermination || "N/A"}</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"><span>Confidence</span><span>{(result.confidence * 100).toFixed(0)}%</span></div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}></div></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 border-solid block w-full box-border">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 border-solid"><p className="font-bold text-slate-800 mb-1.5 flex items-center gap-2 text-sm m-0"><Layers size={16} className="text-blue-500" /> Color Assessment</p><p className="text-slate-600 text-sm leading-relaxed m-0">{result.llm_metrics?.colorQuality}</p></div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 border-solid"><p className="font-bold text-emerald-800 mb-1.5 flex items-center gap-2 text-sm m-0"><ShieldCheck size={16} className="text-emerald-600" /> Size Uniformity</p><p className="text-emerald-700 text-sm leading-relaxed m-0">{result.llm_metrics?.sizeUniformity}</p></div>
                <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100 border-solid"><p className="font-bold text-sky-800 mb-1.5 flex items-center gap-2 text-sm m-0"><Droplets size={16} className="text-sky-600" /> Texture Profiles</p><p className="text-sky-700 text-sm leading-relaxed m-0">{result.llm_metrics?.textureQuality}</p></div>
                <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100 border-solid"><p className="font-bold text-orange-800 mb-1.5 flex items-center gap-2 text-sm m-0"><FileText size={16} className="text-orange-600" /> Insights Report</p><p className="text-orange-700 text-sm leading-relaxed m-0">{typeof result.llm_metrics?.recommendations === 'object' ? (result.llm_metrics.recommendations.text || result.llm_metrics.recommendations.advice) : result.llm_metrics?.recommendations}</p></div>
              </div>

              <div className="pt-4 flex justify-center"><button type="button" onClick={resetAnalysis} className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-semibold shadow-md border-none cursor-pointer">Scan Another Batch</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedAnalysis;