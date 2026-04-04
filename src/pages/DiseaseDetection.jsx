import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Sparkles, AlertTriangle, CheckCircle, ShieldCheck, Leaf } from 'lucide-react';
import { CiCircleCheck } from "react-icons/ci";

const DiseaseDetection = () => {
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'analyzing' | 'result'
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setStep('preview');
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    setAnalyzing(true);
    setStep('analyzing');

    // Simulate AI Analysis
    setTimeout(() => {
      setAnalyzing(false);
      setStep('result');
    }, 2200);
  };

  const resetAnalysis = () => {
    setImage(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 border border-green-600 p-6">
      <div className="max-w-4xl py-10 my-auto  mx-auto">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2  text-emerald-600 hover:text-emerald-700 font-medium mb-6"
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

          {/* Result Screen - Matching Screenshot */}
          {step === 'result' && (
            <div className="p-8 border-2 border-dashed border-rose-300 rounded-lg bg-white">
              {/* Detection Complete Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-4 mb-8">
                <div className="w-9 h-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <p className="font-semibold text-rose-800 text-lg">Detection Complete</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Image */}
                <div className="lg:col-span-5">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
                    <img
                      src={image}
                      alt="Analyzed Leaf"
                      className="max-h-80 w-full rounded-2xl object-contain"
                    />
                  </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Disease Identified */}
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Disease Identified</p>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-2xl font-semibold flex items-center gap-3">
                      <CheckCircle size={28} />
                      Healthy <span className="text-base font-normal">(صحت مند)</span>
                    </div>
                  </div>

                  {/* Severity Level */}
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Severity Level</p>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800  px-6 py-3 rounded-2xl font-semibold text-xl">
                      Mild
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Detection Confidence</span>
                      <span className="font-bold text-rose-600">100%</span>
                    </div>
                    <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-rose-600 rounded-full"></div>
                    </div>
                  </div>

                 
                </div>
              </div>
            <div> {/* Observed Symptoms */}
                  <div className="bg-yellow-50 border border-yellow-200 p-5 mt-4 rounded-2xl">
                    <p className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} /> Observed Symptoms
                    </p>
                    <p className="text-yellow-700">No visible symptoms of disease.</p>
                  </div>

                  {/* Recommended Treatment */}
                  <div className="bg-emerald-50 border border-emerald-200 p-5 mt-4 rounded-2xl">
                    <p className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                      <ShieldCheck size={20} /> Recommended Treatment
                    </p>
                    <p className="text-emerald-700">N/A as the leaves are healthy.</p>
                  </div>

                  {/* Prevention Tips */}
                  <div className="bg-sky-50 border border-sky-200 p-5 mt-4 rounded-2xl">
                    <p className="font-semibold text-sky-800 mb-2 flex items-center gap-2">
                      <Leaf size={20} /> Prevention Tips
                    </p>
                    <p className="text-sky-700 text-sm">
                      Continue regular agricultural practices such as crop rotation and maintaining optimal water and nutrient levels.
                    </p>
                  </div>

                  {/* Expected Yield Impact */}
                  <div className="bg-orange-50 border border-orange-200 p-5 mt-4 rounded-2xl">
                    <p className="font-semibold text-orange-800 mb-2">Expected Yield Impact</p>
                    <p className="text-orange-700">N/A, no disease detected.</p>
                  </div></div>
              {/* Bottom Button */}
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