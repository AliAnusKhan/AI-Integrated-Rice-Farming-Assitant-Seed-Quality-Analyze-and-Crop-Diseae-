import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle } from 'lucide-react';
import { CiCircleCheck } from "react-icons/ci";
import { useAuth } from '../Context/AuthContext';
import { useSaveHistory } from '../hooks/useHistory';
import { saveToHistory as saveToHistoryDirect } from '../services/historyService';
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

const SeedQualityAnalysis = () => {
  const { currentUser } = useAuth();
  const { save: saveToHistory, saving: savingHistory } = useSaveHistory(currentUser?.uid);
  const [step, setStep] = useState('upload');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSavedId, setLastSavedId] = useState(null);
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
      const client = await Client.connect("ricefarming/rice-farming-first-model-0.1");
      const result = await client.predict("/predict", {
        input_img: imageBlob,
      });

      console.log("📥 Live API Response Data:", result.data);

      // Sahi Parsing Strategy: result.data[0] direct object hai jisme label key hai
      const responseObj = result.data && result.data[0] ? result.data[0] : {};
      
      // Live Response se main predicted label aur highest confidence uthaya
      const predictedLabel = responseObj.label || "Common Rice";
      
      // Agar confidences array hai to top prediction ka confidence score nikalo
      let rawConfidence = 0.70; 
      if (responseObj.confidences && responseObj.confidences.length > 0) {
        rawConfidence = responseObj.confidences[0].confidence;
      }
      const calculatedConfidence = Math.round(rawConfidence * 100);

      // Default Logic Cards: Common Rice ke liye
      let extraData = {
        colorQuality: "Standard white color with minimal discoloration.",
        sizeUniformity: "Average length and shape uniformity mixed.",
        textureQuality: "Regular texture suitable for commercial supply.",
        expectedGermination: "75%",
        recommendations: "Standard grade grain detected. Highly suitable for regular consumption, household cooking, and general retail processing markets."
      };

      // Condition switches model ke response data ke mutabik
      if (predictedLabel === "Premium Rice") {
        extraData = {
          colorQuality: "Excellent bright appearance with translucent polished surface.",
          sizeUniformity: "Highly uniform long grains with zero broken percentage detected.",
          textureQuality: "Superb smooth firm texture, premium milling quality.",
          expectedGermination: "95%",
          recommendations: "Outstanding grain quality detected! Highly recommended for premium high-end packaging, brand distribution, and premium export markets."
        };
      } else if (predictedLabel === "Broken Rice") {
        extraData = {
          colorQuality: "Variable color shade with prominent cracked textures.",
          sizeUniformity: "Low uniformity, majority of grains are split or fragmented.",
          textureQuality: "Brittle texture with high starch surface release.",
          expectedGermination: "45%",
          recommendations: "High fraction of broken grains detected. Best suited for industrial rice flour production, animal feed processing, or brewing industry ingredients."
        };
      }

      const dynamicResult = {
        qualityGrade: predictedLabel,
        confidence: calculatedConfidence,
        ...extraData,
        imageUrl: image,
        status: "Completed",
        seedName: imageFile?.name || "Sample Analysis",
      };

      setAnalysisResult(dynamicResult);

      if (currentUser?.uid) {
        const saved = await saveToHistoryDirect(currentUser.uid, 'seedAnalysis', dynamicResult);
        setLastSavedId(saved?.id);
      }

      setStep('result');
    } catch (error) {
      console.error("❌ Model Call Failed:", error);
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
    <div className="min-h-screen bg-emerald-50/30 border border-green-600">
      <div className="max-w-4xl py-10 my-auto mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">
            Seed Quality Analysis
          </h1>
          <p className="text-emerald-700 mt-2 text-lg">
            Upload seed images for AI-powered quality assessment
          </p>
        </div>

        {step === 'upload' && (
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-3xl py-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-emerald-50"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="text-emerald-600" size={42} />
              </div>
              <p className="text-xl font-medium text-slate-700 mb-2">Drop seed image here or click to browse</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl flex items-center gap-3 font-semibold shadow-lg shadow-emerald-200">
                <Camera size={20} />
                Choose Image
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && image && (
          <div className="p-12 border-2 border-dashed border-emerald-300 rounded ">
            <div className="flex justify-center mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                <img
                  src={image}
                  alt="Uploaded Seed"
                  className="max-h-80 max-w-full rounded-2xl object-contain"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetAnalysis}
                className="px-8 py-3.5 border border-emerald-300 text-emerald-700 font-semibold rounded-2xl hover:bg-emerald-50 transition-all"
              >
                Choose Different Image
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-200 disabled:opacity-70 transition-all"
              >
                <Sparkles size={22} />
                Analyze Seed Quality
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="p-16 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 border-8 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-3">Analyzing Seed Quality...</h3>
            <p className="text-slate-500">Connecting to Hugging Face models and checking images...</p>
          </div>
        )}

        {step === 'result' && analysisResult && (
          <div className="bg-white border border-green-300">
            {saveError && (
              <div className="bg-red-50 border-2 border-red-300 p-5 mx-3 mt-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="font-bold text-red-800 text-lg">History Save Failed</p>
                    <p className="text-red-700 text-sm mt-1">{saveError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-emerald-50 border border-emerald-100 p-6 flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl"><CiCircleCheck /></span>
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Analysis Complete</p>
                {lastSavedId && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center"><CiCircleCheck className='flex-shrink-0 ' size={20} /> Saved to history (ID: {lastSavedId.substring(0, 8)}...)</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-3">
              <div className="lg:col-span-5 flex justify-center">
                <div className="bg-white p-8 rounded-3xl shadow-lg">
                  <img
                    src={analysisResult.imageUrl}
                    alt="Analyzed Seed"
                    className="max-h-80 rounded-2xl object-contain"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Model Prediction Result</p>
                  <div className="bg-yellow-100 w-full text-yellow-800 text-2xl font-semibold px-6 py-3 rounded-2xl inline-block">
                    {analysisResult.qualityGrade}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">Confidence</span>
                    <span className="font-semibold">{analysisResult.confidence}%</span>
                  </div>
                  <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl">
                    <p className="font-semibold text-slate-700 mb-2">Color Quality</p>
                    <p className="text-sm text-slate-600">{analysisResult.colorQuality}</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl">
                    <p className="font-semibold text-slate-700 mb-2">Size Uniformity</p>
                    <p className="text-sm text-slate-600">{analysisResult.sizeUniformity}</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl">
                    <p className="font-semibold text-slate-700 mb-2">Texture Quality</p>
                    <p className="text-sm text-slate-600">{analysisResult.textureQuality}</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl">
                    <p className="font-semibold text-slate-700 mb-2">Expected Germination</p>
                    <p className="text-emerald-600 font-semibold text-xl">{analysisResult.expectedGermination}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl mx-3 my-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-amber-600" size={22} />
                <p className="font-semibold text-amber-800">Recommendations</p>
              </div>
              <p className="text-amber-700 text-sm leading-relaxed">
                {analysisResult.recommendations}
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={resetAnalysis}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all"
              >
                Analyze Another Sample
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedQualityAnalysis;