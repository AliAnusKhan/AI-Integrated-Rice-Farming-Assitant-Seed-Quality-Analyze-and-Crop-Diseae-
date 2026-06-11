import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sprout, Droplet, Mountain, Bug, FlaskRound, Sparkles } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { useAuth } from '../Context/AuthContext';
import { useSaveHistory } from '../hooks/useHistory';

const YieldPrediction = () => {
  const { currentUser } = useAuth();
  const { save: saveToHistory, saving: savingHistory } = useSaveHistory(currentUser?.uid);
  
  const [formData, setFormData] = useState({
    seedQuality: 'Medium',
    diseaseStatus: 'None',
    soilType: 'Loam',
    farmingArea: '',
    irrigationType: 'Canal',
    fertilizerType: 'Chemical',
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoLoadedAlert, setAutoLoadedAlert] = useState(false);

  // 🔄 AUTO IMPORT FROM ACTIVE SCAN HISTORIES
  useEffect(() => {
    const savedSeed = localStorage.getItem('scannedSeedQuality');
    const savedDisease = localStorage.getItem('scannedDiseaseStatus');

    if (savedSeed || savedDisease) {
      setFormData(prev => ({
        ...prev,
        seedQuality: savedSeed ? savedSeed : prev.seedQuality,
        diseaseStatus: savedDisease ? savedDisease : prev.diseaseStatus
      }));
      setAutoLoadedAlert(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.farmingArea) {
      alert("Please enter farming area in acres");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      const area = parseFloat(formData.farmingArea);
      
      // 📐 REALISTIC MULTIPLIER MATH EQUATION
      const BASE_YIELD = 3000; // International reference benchmark for hybrid/coarse crop seeds

      const seedFactors = { High: 1.20, Medium: 1.00, Low: 0.75 };
      const diseaseFactors = { None: 1.00, Mild: 0.85, Moderate: 0.60, Severe: 0.30 };
      const soilFactors = { Loam: 1.15, Clay: 1.00, Silt: 0.95, Sandy: 0.70 };
      const irrigationFactors = { Canal: 1.10, 'Tube Well': 1.00, Mixed: 0.95, 'Rain Fed': 0.65 };
      const fertilizerFactors = { Mixed: 1.10, Chemical: 1.00, Organic: 0.85 };

      const fSeed = seedFactors[formData.seedQuality] || 1.00;
      const fDisease = diseaseFactors[formData.diseaseStatus] || 1.00;
      const fSoil = soilFactors[formData.soilType] || 1.00;
      const fIrrigation = irrigationFactors[formData.irrigationType] || 1.00;
      const fFertilizer = fertilizerFactors[formData.fertilizerType] || 1.00;

      const calculatedYieldPerAcre = Math.round(BASE_YIELD * fSeed * fDisease * fSoil * fIrrigation * fFertilizer);
      const totalYield = Math.round(calculatedYieldPerAcre * area);

      let calculatedConfidence = "High";
      if (formData.diseaseStatus === 'Severe' || formData.irrigationType === 'Rain Fed' || formData.seedQuality === 'Low') {
        calculatedConfidence = "Low";
      } else if (formData.diseaseStatus === 'Moderate' || formData.soilType === 'Sandy') {
        calculatedConfidence = "Medium";
      }

      let dynamicAdvice = `Based on your live system parameters, your farm configuration yields an estimate of ${calculatedYieldPerAcre} kg/acre. `;
      if (formData.seedQuality === 'High') {
        dynamicAdvice += "🌟 Your scanned high quality seeds are actively boosting maximum capacity benchmarks (+20%). ";
      } else {
        dynamicAdvice += "Upgrading to 'High' certified seeds can unlock up to 20% more yield potential. ";
      }
      if (formData.diseaseStatus !== 'None') {
        dynamicAdvice += `Warning: The auto-detected '${formData.diseaseStatus}' leaf disease risk is actively suppressing crop metabolism. High priority action needed. `;
      }

      const result = {
        yieldPerAcre: calculatedYieldPerAcre,
        totalYield: totalYield,
        confidence: calculatedConfidence,
        farmingArea: area,
        inputData: { ...formData },
        recommendations: dynamicAdvice,
        status: "Completed",
        fieldName: `Farm ${area} Acres`,
      };

      setPredictionResult(result);
      try { await saveToHistory('yieldPredictions', result); } catch (e) {}
      setLoading(false);
    }, 1800);
  };

  const clearScannedData = () => {
    localStorage.removeItem('scannedSeedQuality');
    localStorage.removeItem('scannedDiseaseStatus');
    setAutoLoadedAlert(false);
    setFormData({ seedQuality: 'Medium', diseaseStatus: 'None', soilType: 'Loam', farmingArea: '', irrigationType: 'Canal', fertilizerType: 'Chemical' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 bg-transparent border-none cursor-pointer"><ArrowLeft size={20} /> Back to Dashboard</button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 tracking-tight m-0">Smart Yield Prediction</h1>
          <p className="text-amber-700 mt-2 text-lg m-0">Calculate expected rice harvest utilizing real-time diagnostic scanning inputs</p>
        </div>

        {autoLoadedAlert && !predictionResult && (
          <div className="bg-purple-50 border border-solid border-purple-200 p-4 mb-6 rounded-2xl flex items-center justify-between block w-full box-border">
            <div className="flex items-center gap-2.5 text-purple-900 text-sm font-semibold"><Sparkles size={18} className="text-purple-600" /><span>AI Sync: Parameters have been automatically imported from your recent Leaf Disease and Seed Quality scans!</span></div>
            <button type="button" onClick={clearScannedData} className="text-xs text-purple-700 hover:text-purple-900 font-bold bg-purple-100 px-3 py-1.5 border-none rounded-xl cursor-pointer">Reset Inputs</button>
          </div>
        )}

        {!predictionResult ? (
          <div className="bg-white rounded-3xl border border-solid border-slate-100 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 m-0">Confirm Your Parameters</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect label="Seed Quality" icon={Sprout} name="seedQuality" value={formData.seedQuality} options={[{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]} onChange={handleChange} />
              <CustomSelect label="Disease Status" icon={Bug} name="diseaseStatus" value={formData.diseaseStatus} options={[{ value: 'None', label: 'None' }, { value: 'Mild', label: 'Mild' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Severe', label: 'Severe' }]} onChange={handleChange} />
              <CustomSelect label="Soil Type" icon={Mountain} name="soilType" value={formData.soilType} options={[{ value: 'Loam', label: 'Loam' }, { value: 'Clay', label: 'Clay' }, { value: 'Sandy', label: 'Sandy' }, { value: 'Silt', label: 'Silt' }]} onChange={handleChange} />
              <div className="block">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Farming Area (Acres)</label>
                <input type="number" name="farmingArea" step="any" value={formData.farmingArea} onChange={handleChange} placeholder="Enter area in acres" className="w-full p-3.5 border border-solid border-slate-300 focus:border-emerald-500 rounded-2xl bg-white focus:outline-none shadow-sm box-border" />
              </div>
              <CustomSelect label="Irrigation Type" icon={Droplet} name="irrigationType" value={formData.irrigationType} options={[{ value: 'Canal', label: 'Canal' }, { value: 'Tube Well', label: 'Tube Well' }, { value: 'Rain Fed', label: 'Rain Fed' }, { value: 'Mixed', label: 'Mixed' }]} onChange={handleChange} />
              <CustomSelect label="Fertilizer Type" icon={FlaskRound} name="fertilizerType" value={formData.fertilizerType} options={[{ value: 'Chemical', label: 'Chemical' }, { value: 'Organic', label: 'Organic' }, { value: 'Mixed', label: 'Mixed' }]} onChange={handleChange} />
              <div className="md:col-span-2 mt-4 block">
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-lg border-none cursor-pointer disabled:opacity-70">{loading ? "Calculating Integrated Yield..." : "Predict Connected Yield"}</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-solid border-amber-200 shadow-sm overflow-hidden block">
            <div className="bg-amber-50 p-5 flex items-center gap-3 mb-8 box-border"><div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center"><span>📊</span></div><p className="font-bold text-amber-800 text-xl m-0">AI Ecosystem Prediction Result</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-6 block box-border">
              <div className="bg-emerald-50 border border-solid border-emerald-200 rounded-2xl p-6 text-left"><p className="text-emerald-700 text-sm font-medium m-0">Predicted Yield per Acre</p><p className="text-4xl font-bold text-emerald-800 mt-3 m-0">{predictionResult.yieldPerAcre} <span className="text-2xl font-semibold">kg</span></p></div>
              <div className="bg-amber-50 border border-solid border-amber-200 rounded-2xl p-6 text-left"><p className="text-amber-700 text-sm font-medium m-0">Total Expected Yield</p><p className="text-4xl font-bold text-amber-800 mt-3 m-0">{predictionResult.totalYield} <span className="text-2xl font-semibold">kg</span></p></div>
              <div className={`border border-solid rounded-2xl p-6 text-left ${predictionResult.confidence === 'High' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : predictionResult.confidence === 'Medium' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}><p className="text-sm font-medium m-0">Confidence Level</p><p className="text-4xl font-bold mt-3 m-0">{predictionResult.confidence}</p></div>
            </div>
            <div className="bg-purple-50/60 border border-solid border-purple-200 rounded-2xl p-7 mx-6 block box-border">
              <div className="flex items-center gap-2 mb-3 block"><span>💡</span><p className="font-bold text-purple-800 text-lg m-0">Dynamic Interconnected Feedback</p></div>
              <p className="text-purple-700 leading-relaxed m-0 text-sm font-medium">{predictionResult.recommendations}</p>
            </div>
            <div className="flex justify-center my-6"><button onClick={() => setPredictionResult(null)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-3.5 rounded-xl font-semibold shadow-md border-none cursor-pointer">Recalculate Model</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YieldPrediction;