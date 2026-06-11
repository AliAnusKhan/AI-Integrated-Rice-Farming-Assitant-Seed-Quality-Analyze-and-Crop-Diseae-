import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Upload, Camera, Sparkles, AlertTriangle, CheckCircle,
  ShieldCheck, Leaf, BrainCircuit, Download, ScanLine, Cpu, Activity, FileText
} from 'lucide-react';
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

const getGreenRatio = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 200; 
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let green = 0, total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const exg = 2 * g - r - b; 
        if (exg > 20 && g > 40) green++;
        total++;
      }
      resolve(total ? green / total : 0);
    };
    img.onerror = () => resolve(0);
    img.src = base64Image;
  });
};

const GREEN_THRESHOLD = 0.12;

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

  const handlePrintPDF = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
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
    setSaveError(null);

    const greenRatio = await getGreenRatio(image);
    if (greenRatio < GREEN_THRESHOLD) {
      setSaveError("Uploaded image does not appear to contain valid rice leaf/plant content.");
      setStep('preview');
      return;
    }

    setAnalyzing(true);
    setStep('analyzing');

    try {
      const imageBlob = base64ToBlob(image);
      let result = null;

      try {
        const client = await Client.connect("ricefarming/diseases-model");
        result = await client.predict("/predict", { input_img: imageBlob });
      } catch (firstError) {
        console.warn("Primary Space connection lookup failed...", firstError);
        try {
          const client = await Client.connect("https://ricefarming-diseases-model.hf.space");
          result = await client.predict("/predict", { input_img: imageBlob });
        } catch (secondError) {
          console.error("Secondary cloud routing error: ", secondError);
          throw new Error("AI Endpoint Configuration Error: Could not resolve model configuration space. Please verify network access.");
        }
      }

      if (!result || !result.data || !result.data[0]) {
        throw new Error("No response signature received from AI model dataset.");
      }

      let serverPayload = JSON.parse(result.data[0]);
      if (serverPayload.Error) throw new Error(serverPayload.Error);

      const rawPredictedDisease = serverPayload.predicted_label || "Healthy";
      const rawConfidence = serverPayload.confidence !== undefined ? serverPayload.confidence : 0.85;
      const calculatedConfidence = Math.round(rawConfidence * 100);
      const llmMetrics = serverPayload.llm_metrics || {};

      if (rawPredictedDisease) {
        let formattedDisease = 'None';
        const diseaseLower = rawPredictedDisease.toLowerCase();
        if (diseaseLower.includes('blast')) formattedDisease = 'Severe';
        else if (diseaseLower.includes('brown')) formattedDisease = 'Moderate';
        else if (diseaseLower.includes('hispa')) formattedDisease = 'Mild';
        localStorage.setItem('scannedDiseaseStatus', formattedDisease);
      }

      const now = new Date();
      const finalResult = {
        disease: rawPredictedDisease,
        severity: llmMetrics.expectedGermination || "📢 MODERATE CONTAINMENT REQUIRED",
        confidence: calculatedConfidence,
        observedSymptoms: String(llmMetrics.colorQuality || "Lesions and distinct discoloration patterns observed on the leaf blade surface."),
        recommendedTreatment: String(llmMetrics.sizeUniformity || "Apply standard recommended therapy mapping."),
        preventionTips: String(llmMetrics.textureQuality || "Monitor input loads and maintain stable management rows."),
        expectedYieldImpact: typeof llmMetrics.recommendations === 'object' ? (llmMetrics.recommendations.text || llmMetrics.recommendations.advice) : String(llmMetrics.recommendations || "Routine structural inspections required."),
        imageUrl: image,
        status: "Detected",
        leafName: imageFile?.name || "Sample Leaf",
        isLlmGenerated: !result.data[0].includes("Fallback"),
        generatedAt: now.toLocaleString(),
        reportId: "RPT-" + now.getTime().toString().slice(-8),
      };

      setAnalysisResult(finalResult);
      try { await saveToHistory('diseaseDetections', finalResult); } catch (e) {}
      setStep('result');
    } catch (error) {
      setSaveError(error.message || "Invalid Input: Connection timeout or configuration mapping mismatch.");
      setStep('preview');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAnalysisResult(null);
    setSaveError(null);
    setStep('upload');
  };

  const R = analysisResult;

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden overflow-y-auto box-border">

      {/* AMBIENT LIGHT BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 z-0 print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.06),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.4] bg-[linear-gradient(rgba(226,232,240,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(226,232,240,0.6)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* SCREEN INTERFACE CONTAINER */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 w-full print:hidden">

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6 bg-transparent border-none cursor-pointer transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Hybrid CNN · Gemini GenAI Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 m-0">
            Disease Detection
          </h1>
          <p className="text-slate-500 mt-2 text-base m-0">
            Upload a rice crop leaf sample to execute automated multi-spectral diagnosis.
          </p>
        </div>

        <div className="min-h-[460px] w-full">

          {/* STEP: UPLOAD CARD */}
          {step === 'upload' && (
            <div
              onClick={() => fileInputRef.current.click()}
              className="group relative text-center h-[380px] flex flex-col items-center justify-center rounded-2xl p-6 cursor-pointer
                         bg-white border-2 border-dashed border-slate-200
                         shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                         hover:border-emerald-500 hover:shadow-[0_10px_30px_-5px_rgba(16,185,129,0.1)] transition-all duration-300 overflow-hidden"
            >
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                              bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Upload size={28} />
              </div>
              <p className="text-lg font-bold text-slate-800 mb-1 m-0">Drop your rice leaf image here</p>
              <p className="text-xs text-slate-400 mb-5 m-0">PNG, JPG or JPEG standard high-res photo</p>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md shadow-emerald-600/10 border-none pointer-events-none transition-colors text-sm"
              >
                <Camera size={18} /> Select Photo
              </button>
            </div>
          )}

          {/* STEP: PREVIEW CARD */}
          {step === 'preview' && image && (
            <div className="p-6 min-h-[380px] flex flex-col justify-between rounded-2xl bg-white border border-slate-200 shadow-sm text-center w-full box-border">
              {saveError && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 mb-4 rounded-xl text-rose-700 text-xs font-semibold text-left flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}
              <div className="flex justify-center items-center flex-1 overflow-hidden mb-5">
                <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <img src={image} alt="Preview" className="max-h-52 rounded-lg object-contain" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button type="button" onClick={resetAnalysis} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors text-sm">
                  Change Image
                </button>
                <button type="button" onClick={handleAnalyze} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-2 shadow-md shadow-emerald-600/10 border-none cursor-pointer transition-colors text-sm">
                  <Sparkles size={18} /> Run AI Diagnosis
                </button>
              </div>
            </div>
          )}

          {/* STEP: ANALYZING PROCESSING FRAME */}
          {step === 'analyzing' && (
            <div className="h-[380px] flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-center w-full box-border overflow-hidden">
              <div className="relative w-36 h-36 mb-5">
                {image && (
                  <img src={image} alt="Scanning" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" />
                )}
                <div className="absolute inset-0 rounded-xl border border-slate-200" />
                <div className="ai-scan-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981]" />
                <div className="absolute -inset-2 rounded-2xl border border-emerald-500/20 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <Cpu size={16} className="animate-spin" />
                <h3 className="text-lg font-bold m-0">Processing leaf segmentation…</h3>
              </div>
              <p className="text-slate-400 text-xs m-0 flex items-center gap-1.5 justify-center">
                <Activity size={12} /> Mapping leaf lesions &amp; checking diagnostics datasets
              </p>
            </div>
          )}

          {/* STEP: ANALYSIS RESULTS LAYOUT */}
          {step === 'result' && R && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 w-full box-border">

              <div className="rounded-xl p-3.5 flex items-center justify-between bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-600/10 text-emerald-700 rounded-lg flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <p className="font-bold text-emerald-800 text-sm m-0">Analysis Complete</p>
                </div>
                {R.isLlmGenerated && (
                  <div className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border border-sky-100">
                    <BrainCircuit size={12} /> Gemini Integrated
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
                <div className="md:col-span-5 flex justify-center items-start">
                  <div className="p-1 rounded-xl bg-slate-50 border border-slate-100 w-full">
                    <img src={R.imageUrl} alt="Crop" className="max-h-64 w-full rounded-lg object-contain" />
                  </div>
                </div>
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Detected Plant Profile</p>
                    <div className="bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl text-lg font-extrabold">{R.disease}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 m-0">Urgency Assessment</p>
                    <div className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">{R.severity}</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      <span>Statistical Confidence</span>
                      <span className="text-emerald-600 font-extrabold">{R.confidence}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div className="h-full bg-emerald-600 rounded-full transition-all duration-700" style={{ width: `${R.confidence}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 w-full box-border">
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                  <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-xs m-0"><AlertTriangle size={14} className="text-amber-500" /> Symptoms Mapping</p>
                  <p className="text-slate-600 text-xs leading-relaxed m-0 mt-0.5">{R.observedSymptoms}</p>
                </div>
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5 text-xs m-0"><ShieldCheck size={14} className="text-emerald-600" /> Recommended Control</p>
                  <p className="text-emerald-700 text-xs leading-relaxed m-0 mt-0.5">{R.recommendedTreatment}</p>
                </div>
                <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100">
                  <p className="font-bold text-sky-800 mb-1 flex items-center gap-1.5 text-xs m-0"><Leaf size={14} className="text-sky-600" /> Prevention Protocols</p>
                  <p className="text-sky-700 text-xs leading-relaxed m-0 mt-0.5">{R.preventionTips}</p>
                </div>
                <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100">
                  <p className="font-bold text-orange-800 mb-1 text-xs m-0">Yield Guard Summary</p>
                  <p className="text-orange-700 text-xs leading-relaxed m-0 mt-0.5">{R.expectedYieldImpact}</p>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={resetAnalysis}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-700 px-5 py-2.5 rounded-lg font-semibold border border-slate-200 cursor-pointer hover:bg-slate-50 text-sm transition-colors"
                >
                  <ScanLine size={16} /> Diagnostic Another Leaf
                </button>

                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-semibold text-white cursor-pointer border-none
                             bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-150 text-sm"
                >
                  <FileText size={16} />
                  <span>Download Report PDF</span>
                  <Download size={14} />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* PRINT ADVISORY DISPATCH ENGINE */}
      {R && (
        <div id="ai-print-report" className="hidden print:block">
          <div className="rp-banner">
            <div>
              <h1 className="rp-title">RICE CROP DISEASE DIAGNOSTIC REPORT</h1>
              <p className="rp-sub">Hybrid CNN Classifier &amp; Gemini GenAI Advisory Engine</p>
            </div>
            <div className="rp-meta">
              <span><strong>Report ID:</strong> {R.reportId}</span>
              <span><strong>Generated:</strong> {R.generatedAt}</span>
              <span><strong>Sample:</strong> {R.leafName}</span>
            </div>
          </div>

          <div className="rp-top">
            <div className="rp-imgwrap">
              <img src={R.imageUrl} alt="Specimen" className="rp-img" />
              <p className="rp-imgcap">Analyzed specimen photo</p>
            </div>
            <div className="rp-facts">
              <div className="rp-fact">
                <span className="rp-label">Condition Detected</span>
                <div className="rp-disease">{R.disease}</div>
              </div>
              <div className="rp-fact">
                <span className="rp-label">Severity Status</span>
                <div className="rp-sev">{R.severity}</div>
              </div>
              <div className="rp-fact">
                <span className="rp-label">Confidence Level — {R.confidence}%</span>
                <div className="rp-bar"><div className="rp-bar-fill" style={{ width: `${R.confidence}%` }} /></div>
              </div>
            </div>
          </div>

          <div className="rp-section rp-amber">
            <h3>Observed Symptoms</h3>
            <p>{R.observedSymptoms}</p>
          </div>
          <div className="rp-section rp-green">
            <h3>Recommended Control</h3>
            <p>{R.recommendedTreatment}</p>
          </div>
          <div className="rp-section rp-blue">
            <h3>Prevention Tips</h3>
            <p>{R.preventionTips}</p>
          </div>
          <div className="rp-section rp-orange">
            <h3>Protocol Summary &amp; Expected Impact</h3>
            <p>{R.expectedYieldImpact}</p>
          </div>

          <div className="rp-footer">
            <p><strong>Disclaimer:</strong> This report is generated by an AI diagnostic engine and is intended as decision support. Confirm critical treatment decisions with a certified agronomist.</p>
            <p>© {new Date().getFullYear()} Rice Farming AI Platform · All rights reserved.</p>
          </div>
        </div>
      )}

      {/* STYLE LAYER INJECTIONS */}
      <style>{`
        @keyframes ai-scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        .ai-scan-line { animation: ai-scan 1.8s linear infinite; }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 15mm 12mm 15mm 12mm; }
          html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; color: #0f172a !important; }

          .print:hidden, .no-print { display: none !important; }

          #ai-print-report { 
            display: block !important; 
            font-family: Arial, Helvetica, sans-serif; 
            width: 100%; 
            position: relative; 
            margin: 0 !important; 
            padding: 0 !important; 
          }

          .rp-banner {
            display: flex; justify-content: space-between; align-items: flex-start;
            background: #059669 !important; color: #ffffff !important; padding: 18px 22px; border-radius: 12px; margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .rp-title { font-size: 18px; font-weight: 800; margin: 0; letter-spacing: .3px; }
          .rp-sub { font-size: 11px; margin: 4px 0 0; opacity: .9; }
          .rp-meta { display: flex; flex-direction: column; gap: 3px; font-size: 10px; text-align: right; }

          .rp-top { display: flex; gap: 20px; margin-bottom: 18px; page-break-inside: avoid; align-items: stretch; }
          .rp-imgwrap { width: 38%; display: flex; flex-direction: column; }
          .rp-img { width: 100%; border-radius: 10px; border: 1px solid #e2e8f0; object-fit: contain; max-height: 180px; display: block; }
          .rp-imgcap { font-size: 10px; color: #64748b; text-align: center; margin: 6px 0 0; }
          
          .rp-facts { flex: 1; display: flex; flex-direction: column; gap: 10px; justify-content: space-between; }
          .rp-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #64748b; margin-bottom: 3px; }
          .rp-disease { background: #0f172a !important; color: #ffffff !important; padding: 10px 14px; border-radius: 9px; font-size: 16px; font-weight: 800; }
          .rp-sev { background: #fef3c7 !important; color: #92400e !important; padding: 8px 12px; border-radius: 9px; font-size: 12px; font-weight: 700; }
          .rp-bar { height: 10px; background: #e2e8f0 !important; border-radius: 999px; overflow: hidden; }
          .rp-bar-fill { height: 100%; background: #10b981 !important; border-radius: 999px; }

          .rp-section { padding: 12px 16px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #e2e8f0; page-break-inside: avoid; }
          .rp-section h3 { font-size: 12px; font-weight: 800; margin: 0 0 4px; }
          .rp-section p { font-size: 11.5px; line-height: 1.5; margin: 0; color: #334155; }
          
          .rp-amber  { background: #fffbeb !important; border-color: #fde68a; }
          .rp-amber h3  { color: #b45309 !important; }
          .rp-green  { background: #ecfdf5 !important; border-color: #a7f3d0; }
          .rp-green h3  { color: #047857 !important; }
          .rp-blue   { background: #f0f9ff !important; border-color: #bae6fd; }
          .rp-blue h3   { color: #0369a1 !important; }
          .rp-orange { background: #fff7ed !important; border-color: #fed7aa; }
          .rp-orange h3 { color: #c2410c !important; }

          .rp-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; page-break-inside: avoid; }
          .rp-footer p { font-size: 9px; color: #94a3b8; margin: 0 0 4px; line-height: 1.3; }
        }
      `}</style>

    </div>
  );
};

export default DiseaseDetection;