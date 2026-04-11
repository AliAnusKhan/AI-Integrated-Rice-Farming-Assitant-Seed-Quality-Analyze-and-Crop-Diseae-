import React, { useState } from 'react';
import { ArrowLeft, Sprout, Droplet, Mountain, Bug, FlaskRound } from 'lucide-react';
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

    // Simulate AI Prediction
    setTimeout(async () => {
      const area = parseFloat(formData.farmingArea);
      const yieldPerAcre = 3300; // kg
      const totalYield = Math.round(yieldPerAcre * area);

      const result = {
        yieldPerAcre: yieldPerAcre,
        totalYield: totalYield,
        confidence: "Medium",
        farmingArea: area,
        inputData: { ...formData },
        recommendations: `To improve yield, consider using higher quality seeds to unlock the potential increase of 15-20%. Ensure the irrigation system is well-maintained to provide consistent water supply. Regular monitoring for any signs of disease, even though currently none are present, will help in early detection, and the use of integrated pest management practices can safeguard crops. Additionally, applying the right balance of fertilizers based on soil tests will further boost plant growth and increase yields.`,
        status: "Completed",
        fieldName: `Farm ${area} Acres`,
      };

      setPredictionResult(result);

      // Save to Firebase
      try {
        await saveToHistory('yieldPredictions', result);
      } catch (error) {
        console.error("Failed to save yield prediction:", error);
        // Continue anyway - don't block UI
      }

      setLoading(false);

      // Console Data (as requested)
      console.log("=== Yield Prediction Data ===");
      console.log("Input Data:", formData);
      console.log("Predicted Yield per Acre:", yieldPerAcre, "kg");
      console.log("Total Expected Yield:", totalYield, "kg");
      console.log("Confidence Level:", result.confidence);
      console.log("============================");
    }, 1800);
  };

  const resetPrediction = () => {
    setPredictionResult(null);
    setFormData({
      seedQuality: 'Medium',
      diseaseStatus: 'None',
      soilType: 'Loam',
      farmingArea: '',
      irrigationType: 'Canal',
      fertilizerType: 'Chemical',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 tracking-tight">Yield Prediction</h1>
          <p className="text-amber-700 mt-2 text-lg">
            Calculate expected rice harvest based on your farming conditions
          </p>
        </div>

        {!predictionResult ? (
          /* ====================== INPUT FORM ====================== */
          <div className="bg-white rounded-3xl  border  p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Input Farming Details</h2>

           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Seed Quality */}
  <CustomSelect
    label="Seed Quality"
    icon={Sprout}
    name="seedQuality"
    value={formData.seedQuality}
    options={[
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' }
    ]}
    onChange={handleChange}
  />

  {/* Disease Status */}
  <CustomSelect
    label="Disease Status"
    icon={Bug}
    name="diseaseStatus"
    value={formData.diseaseStatus}
    options={[
      { value: 'None', label: 'None' },
      { value: 'Mild', label: 'Mild' },
      { value: 'Moderate', label: 'Moderate' },
      { value: 'Severe', label: 'Severe' }
    ]}
    onChange={handleChange}
  />

  {/* Soil Type */}
  <CustomSelect
    label="Soil Type"
    icon={Mountain}
    name="soilType"
    value={formData.soilType}
    options={[
      { value: 'Loam', label: 'Loam' },
      { value: 'Clay', label: 'Clay' },
      { value: 'Sandy', label: 'Sandy' },
      { value: 'Silt', label: 'Silt' }
    ]}
    onChange={handleChange}
  />

  {/* Farming Area (Input - remains same) */}
  <div>
    <label className="text-sm font-medium text-slate-700 mb-2 block">
      Farming Area (Acres)
    </label>
    <input
      type="number"
      name="farmingArea"
      value={formData.farmingArea}
      onChange={handleChange}
      placeholder="Enter area in acres"
      className="w-full p-3.5 border border-slate-300 focus:border-emerald-500 rounded-2xl bg-white focus:outline-none shadow-sm"
    />
  </div>

  {/* Irrigation Type */}
  <CustomSelect
    label="Irrigation Type"
    icon={Droplet}
    name="irrigationType"
    value={formData.irrigationType}
    options={[
      { value: 'Canal', label: 'Canal' },
      { value: 'Tube Well', label: 'Tube Well' },
      { value: 'Rain Fed', label: 'Rain Fed' },
      { value: 'Mixed', label: 'Mixed' }
    ]}
    onChange={handleChange}
  />

  {/* Fertilizer Type */}
  <CustomSelect
    label="Fertilizer Type"
    icon={FlaskRound}
    name="fertilizerType"
    value={formData.fertilizerType}
    options={[
      { value: 'Chemical', label: 'Chemical' },
      { value: 'Organic', label: 'Organic' },
      { value: 'Mixed', label: 'Mixed' }
    ]}
    onChange={handleChange}
  />

  {/* Submit Button */}
  <div className="md:col-span-2 mt-4">
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-4 rounded-2xl text-lg shadow-lg shadow-amber-200 transition-all disabled:opacity-70"
    >
      {loading ? "Calculating Yield..." : "Predict Expected Yield"}
    </button>
  </div>
</form>
          </div>
        ) : (
          /* ====================== RESULT SCREEN ====================== */
          <div className="bg-white rounded-3xl   border border-amber-200 ">
            <div className="bg-amber-50 p-5 flex rounded-t-3xl items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-amber-100  flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <p className="font-semibold text-amber-800 text-xl">Prediction Result</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4">
              {/* Predicted Yield per Acre */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-start">
                <p className="text-emerald-700 text-sm font-medium">Predicted Yield per Acre</p>
                <p className="text-4xl font-bold text-emerald-800 mt-3">
                  {predictionResult.yieldPerAcre} <span className="text-2xl">kg</span>
                </p>
              </div>

              {/* Total Expected Yield */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-start">
                <p className="text-amber-700 text-sm font-medium">Total Expected Yield</p>
                <p className="text-4xl font-bold text-amber-800 mt-3">
                  {predictionResult.totalYield} <span className="text-2xl">kg</span>
                </p>
              </div>

              {/* Confidence Level */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-start">
                <p className="text-blue-700 text-sm font-medium">Confidence Level</p>
                <p className="text-4xl font-bold text-blue-800 mt-3">
                  {predictionResult.confidence}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-7 mx-4">
              <div className="flex items-center gap-2 mb-4 ">
                <span className="text-xl">📈</span>
                <p className="font-semibold text-yellow-800 text-lg">Recommendations</p>
              </div>
              <p className="text-yellow-700 leading-relaxed">
                {predictionResult.recommendations}
              </p>
            </div>

            {/* New Prediction Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={resetPrediction}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-12 py-3 rounded-lg font-semibold   transition-all"
              >
                New Prediction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YieldPrediction;