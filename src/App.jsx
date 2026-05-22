import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Pages & Components
import Dashboard from './pages/Dashboard'
import SeedAnalysis from './pages/SeedAnalysis'
import DiseaseScanner from './pages/DiseaseScanner'
import YieldPrediction from './pages/YieldPrediction'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SeedScanner from './pages/SeedScanner'
import DiseaseDetection from './pages/DiseaseDetection'
import ForgotPassword from './pages/ForgotPassword'
import History from './pages/History'
import TestDebug from './pages/TestDebug'

import Layout from './Layout'
import VerifyOtp from './pages/VerifyOtp'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/test-debug" element={<TestDebug />} />

        {/* DASHBOARD */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />

        {/* PROTECTED ROUTES */}
        <Route path="/seed-analyzer" element={<ProtectedRoute><Layout><SeedAnalysis /></Layout></ProtectedRoute>} />
        <Route path="/disease-scanner" element={<ProtectedRoute><Layout><DiseaseScanner /></Layout></ProtectedRoute>} />
        <Route path="/yield-prediction" element={<ProtectedRoute><Layout><YieldPrediction /></Layout></ProtectedRoute>} />
        <Route path="/seed-scan" element={<ProtectedRoute><Layout><SeedScanner /></Layout></ProtectedRoute>} />
        <Route path="/disease-detection" element={<ProtectedRoute><Layout><DiseaseDetection /></Layout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
        {/* <Route path="/seed-info" element={<ProtectedRoute><Layout><SeedInfo /></Layout></ProtectedRoute>} /> */}
        {/* <Route path="/disease-info" element={<ProtectedRoute><Layout><DiseaseInfo /></Layout></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  )
}

export default App
