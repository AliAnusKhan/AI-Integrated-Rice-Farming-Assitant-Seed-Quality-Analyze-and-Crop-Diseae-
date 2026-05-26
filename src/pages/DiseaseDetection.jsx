import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle, CheckCircle, ShieldCheck, Leaf } from 'lucide-react';
import { CiCircleCheck } from "react-icons/ci";
import { useAuth } from '../Context/AuthContext';
import { useSaveHistory } from '../hooks/useHistory';
import { Client } from "@gradio/client"; // Imported Gradio Client

// Helper to convert base64 to Blob for API consumption
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
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'analyzing' | 'result'
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImage(base64String);
        setImageFile(file);
        setStep('preview');
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
    const client = await Client.connect("ricefarming/diseases-model");
    const result = await client.predict("/predict", {
      input_img: imageBlob,
    });

    console.log("📥 Live Disease API Response Data:", result.data);

    // Safe extraction directly mapping Hugging Face output format
    const responseObj = result.data && result.data[0] ? result.data[0] : {};
    
    // Jo actual label Hugging Face se aa raha hai (Premium, Common, ya Broken) wahi uthayenge
    const predictedDisease = responseObj.label || "Common Rice";
    
    let rawConfidence = 0.85;
    if (responseObj.confidences && responseObj.confidences.length > 0) {
      rawConfidence = responseObj.confidences[0].confidence;
    }
    const calculatedConfidence = Math.round(rawConfidence * 100);

    // Default Layout Values mapping "Common Rice"
    let urduTitle = "(عام چاول / نارمل لیف)";
    let diseaseSeverity = "Mild / Normal";
    let symptoms = "Standard visual pattern detected. No extreme fungal decay or critical bacterial lesions found on the surface.";
    let treatment = "Maintain regular nitrogen supply and follow normal watering intervals. No immediate chemical action needed.";
    let tips = "Ensure weed management and keep the field properly aerated to prevent any future moisture buildup.";
    let yieldImpact = "Standard expected output. No massive variance or heavy damage predicted.";

    // Agar Hugging Face "Premium Rice" bhej raha hai
    if (predictedDisease === "Premium Rice") {
      urduTitle = "(اعلیٰ معیار / صحت مند پتا)";
      diseaseSeverity = "None (Healthy Leaf)";
      symptoms = "Excellent cellular structure and optimal coloration visible. The leaf demonstrates strong biological health.";
      treatment = "N/A. Keep continuing existing standard organic farming protocols.";
      tips = "Continue practicing crop rotation and monitoring water quality at critical growth stages.";
      yieldImpact = "Highly positive. On track for maximum possible crop yield capacity.";
    } 
    // Agar Hugging Face "Broken Rice" bhej raha hai
    else if (predictedDisease === "Broken Rice") {
      urduTitle = "(متاثرہ چاول / ٹوٹا ہوا یا خراب پتا)";
      diseaseSeverity = "High (Critical Action Required)";
      symptoms = "Structural fragmentation or stress marks detected on the leaf pattern, aligning with weak crop properties.";
      treatment = "Apply corrective potassium doses and consult local extension service for suitable broad-spectrum protection sprays.";
      tips = "Avoid water logging conditions and separate infected debris post-harvest to clean the soil structure.";
      yieldImpact = "Risk of 15-25% crop quality or grain density drop if unchecked.";
    }

    const finalResult = {
      disease: predictedDisease,
      diseaseUrdu: urduTitle,
      severity: diseaseSeverity,
      confidence: calculatedConfidence,
      observedSymptoms: symptoms,
      recommendedTreatment: treatment,
      preventionTips: tips,
      expectedYieldImpact: yieldImpact,
      imageUrl: image, 
      status: "Detected",
      leafName: imageFile?.name || "Sample Leaf",
    };

    setAnalysisResult(finalResult);

    try {
      await saveToHistory('diseaseDetections', finalResult);
    } catch (error) {
      console.error("Failed to save disease detection:", error);
    }

    setStep('result');
  } catch (error) {
    console.error("❌ Disease Model Call Failed:", error);
    setSaveError("API Error: " + error.message);
    setStep('preview');
  } finally {
    setAnalyzing(false);
  }
};

  const resetAnalysis = () => {
    setImage(null);
    setImageFile(null);
    setImageURL(null);
    setAnalysisResult(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 border border-green-600 p-6">
      <div className="max-w-4xl py-10 my-auto mx-auto">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-rose-950 tracking-tight">
            Disease Detection
          </h1>
          <p className="text-rose-700 mt-2 text-lg">
            Upload rice leaf images for instant disease identification
          </p>
        </div>

        {/* Upload Screen */}
        {step === 'upload' && (
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-rose-300 hover:border-rose-400 rounded-3xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all "
            >
              <div className=" flex items-center justify-center mb-6">
                <Upload className="text-rose-600" size={42} />
              </div>
              <p className="text-xl font-medium text-slate-700 mb-2">Drop rice leaf image here</p>
              <p className="text-slate-500 mb-8">or click to browse</p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />

              <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-semibold shadow-lg shadow-rose-200">
                <Camera size={20} />
                Choose Image
              </button>
            </div>
          </div>
        )}

        {/* Preview Screen */}
        {step === 'preview' && image && (
          <div className="p-12 border-2 border-dashed border-rose-300 rounded-lg bg-white ">
            {saveError && (
              <div className="bg-red-50 border border-red-300 p-4 mb-4 rounded-xl text-red-700 text-sm font-medium">
                ⚠️ {saveError}
              </div>
            )}
            <div className="flex justify-center mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
                <img
                  src={image}
                  alt="Uploaded Leaf"
                  className="max-h-80 max-w-full rounded-2xl object-contain"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetAnalysis}
                className="px-8 py-3.5 border border-rose-300 text-rose-700 font-semibold rounded-2xl hover:bg-rose-50 transition-all"
              >
                Choose Different Image
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-200 disabled:opacity-70 transition-all"
              >
                <Sparkles size={22} />
                Detect Disease
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Screen */}
        {step === 'analyzing' && (
          <div className="p-16 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 border-8 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-3">Analyzing Leaf...</h3>
            <p className="text-slate-500">Our AI is scanning for disease symptoms</p>
          </div>
        )}

        {/* Result Screen */}
        {step === 'result' && analysisResult && (
          <div className="p-8 border-2 border-dashed border-rose-300 rounded-lg bg-white">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-4 mb-8">
              <div className="w-9 h-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <p className="font-semibold text-rose-800 text-lg">Detection Complete</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
                  <img
                    src={analysisResult.imageUrl}
                    alt="Analyzed Leaf"
                    className="max-h-80 w-full rounded-2xl object-contain"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1.5">Disease Identified</p>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-2xl font-semibold flex items-center gap-3">
                    <CheckCircle size={28} />
                    {analysisResult.disease} <span className="text-base font-normal">{analysisResult.diseaseUrdu}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1.5">Severity Level</p>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-2xl font-semibold text-xl">
                    {analysisResult.severity}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Detection Confidence</span>
                    <span className="font-bold text-rose-600">{analysisResult.confidence}%</span>
                  </div>
                  <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 mt-4 rounded-2xl">
                <p className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> Observed Symptoms
                </p>
                <p className="text-yellow-700">{analysisResult.observedSymptoms}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 mt-4 rounded-2xl">
                <p className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                  <ShieldCheck size={20} /> Recommended Treatment
                </p>
                <p className="text-emerald-700">{analysisResult.recommendedTreatment}</p>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-5 mt-4 rounded-2xl">
                <p className="font-semibold text-sky-800 mb-2 flex items-center gap-2">
                  <Leaf size={20} /> Prevention Tips
                </p>
                <p className="text-sky-700 text-sm">
                  {analysisResult.preventionTips}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-5 mt-4 rounded-2xl">
                <p className="font-semibold text-orange-800 mb-2">Expected Yield Impact</p>
                <p className="text-orange-700">{analysisResult.expectedYieldImpact}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={resetAnalysis}
                className="bg-rose-600 hover:bg-rose-700 text-white px-12 py-4 rounded-2xl font-semibold shadow-lg shadow-rose-200 transition-all"
              >
                Analyze Another Leaf
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;