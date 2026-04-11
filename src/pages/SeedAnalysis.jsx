import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle } from 'lucide-react';
import { CiCircleCheck } from "react-icons/ci";
import { useAuth } from '../Context/AuthContext';
import { useSaveHistory } from '../hooks/useHistory';
import { uploadImageToStorage } from '../services/storageService';

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
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setImageFile(file);
      setStep('preview');
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setStep('analyzing');

    console.log("🚀 Starting analysis...");
    console.log("👤 Current User:", currentUser);
    console.log("🖼️ Image file:", imageFile);

    // Upload image to Firebase Storage first (skip if CORS issue)
    let uploadedImageUrl = null;
    if (imageFile && currentUser) {
      try {
        setUploading(true);
        console.log("📤 Uploading image to storage...");
        uploadedImageUrl = await uploadImageToStorage(imageFile, currentUser.uid, 'seedAnalysis');
        setUploading(false);
        setImageURL(uploadedImageUrl);
        console.log("✅ Image processed:", uploadedImageUrl.substring(0, 50) + "...");
      } catch (error) {
        console.warn("⚠️ Image upload failed, using blob URL:", error.message);
        setUploading(false);
        // Continue with blob URL (temporary but works for current session)
        uploadedImageUrl = image;
      }
    }

    // Simulate AI Analysis
    setTimeout(async () => {
      const result = {
        qualityGrade: "Medium Quality",
        confidence: 75,
        colorQuality: "Seeds show a mix of colors; some display ideal golden hues while others show signs of discoloration.",
        sizeUniformity: "There is some variation in seed size; a portion of the seeds are inconsistent in dimensions.",
        textureQuality: "Most seeds appear smooth, but there are a few with visible cracks or damage on the surface.",
        expectedGermination: "Approximately 75%",
        recommendations: "Conduct a more detailed examination of the seeds to assess the extent of damage. Consider discarding any heavily discolored or cracked seeds to improve overall quality. Implement proper storage practices to maintain seed integrity and consider seed treatment options to enhance germination rates.",
        imageUrl: uploadedImageUrl || image,
        status: "Completed",
        seedName: "Sample Analysis",
      };

      setAnalysisResult(result);

      // Save to Firebase
      console.log("💾 Attempting to save to Firebase...");
      console.log("📂 Category: seedAnalysis");
      console.log("👤 User ID:", currentUser?.uid);
      console.log("📦 Result:", result);
      
      try {
        const saved = await saveToHistory('seedAnalysis', result);
        console.log("✅ Successfully saved to history:", saved);
        setSaveError(null);
      } catch (error) {
        console.error("❌ Failed to save seed analysis:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error code:", error.code);
        setSaveError(error.message || "Failed to save history");
      }

      setAnalyzing(false);
      setStep('result');
    }, 2200);
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
      {/* Header */}
      <div className="max-w-4xl py-10 my-auto  mx-auto">
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

        {/* Main Container */}

        {/* Upload Screen */}
        {step === 'upload' && (
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-3xl py-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-emerald-50"
            >
              <div className="w-20 h-20  rounded-2xl flex items-center justify-center mb-6">
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

        {/* Preview + Analyze Screen */}
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

        {/* Analyzing Screen */}
        {step === 'analyzing' && (
          <div className="p-16 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 border-8 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-3">Analyzing Seed Quality...</h3>
            <p className="text-slate-500">Our AI is checking color, size, texture and germination potential</p>
          </div>
        )}

        {/* Result Screen */}
        {step === 'result' && analysisResult && (
          <div className=" bg-white border border-green-300">
            {/* Error Alert if Save Failed */}
            {saveError && (
              <div className="bg-red-50 border-2 border-red-300 p-5 mx-3 mt-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="font-bold text-red-800 text-lg">History Save Failed</p>
                    <p className="text-red-700 text-sm mt-1">{saveError}</p>
                    <p className="text-red-600 text-xs mt-2">Check Firebase Database rules and CORS settings</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-emerald-50 border border-emerald-100  p-6 flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl"><CiCircleCheck /></span>
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Analysis Complete</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-3">
              {/* Atom Logo / Image Section */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="bg-white p-8 rounded-3xl shadow-lg ">
                  <img
                    src={analysisResult.imageUrl}
                    alt="Analyzed Seed"
                    className="max-h-80 rounded-2xl object-contain"
                  />
                </div>
              </div>

              {/* Analysis Details */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Quality Grade</p>
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
                    <div className="h-full w-[75%] bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
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

                {/* Recommendations */}

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
            <div className=" flex justify-center mb-4">
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