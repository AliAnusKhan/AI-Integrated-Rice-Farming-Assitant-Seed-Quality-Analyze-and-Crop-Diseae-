import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Pages & Components
import Dashboard from './pages/Dashboard'
// 💡 FIX: We import the default export (SeedQualityAnalysis) and alias it as SeedAnalysis so your code below doesn't break!
import SeedAnalysis from './pages/SeedAnalysis'
import YieldPrediction from './pages/YieldPrediction'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DiseaseDetection from './pages/DiseaseDetection'
import ForgotPassword from './pages/ForgotPassword'
import History from './pages/History'
import Layout from './Layout'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* DASHBOARD */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />

        {/* PROTECTED ROUTES */}
        <Route path="/seed-analyzer" element={<ProtectedRoute><Layout><SeedAnalysis /></Layout></ProtectedRoute>} />
        <Route path="/yield-prediction" element={<ProtectedRoute><Layout><YieldPrediction /></Layout></ProtectedRoute>} />
        <Route path="/disease-detection" element={<ProtectedRoute><Layout><DiseaseDetection /></Layout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App