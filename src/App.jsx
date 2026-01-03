import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; // Import useAuth
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// Aapke Components aur Pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SeedAnalysis from './pages/SeedAnalysis';
import DiseaseScanner from './pages/DiseaseScanner';
import YieldPrediction from './pages/YieldPrediction';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SeedScanner from './pages/SeedScanner';
import DiseaseDetection from './pages/DiseaseDetection';
import History from './pages/History';
import SeedInfo from './pages/SeedInfo';
import DiseaseInfo from './pages/DiseaseInfo';

// Layout Component: Ye Sidebar aur Page ko sahi tarah manage karega
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fcf8]">
      {/* Sidebar Left Side (Fixed) */}
      <Sidebar />

      {/* Main Content Right Side (Scrollable) */}
      <div className="flex-1 h-full overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTES (Bina Sidebar ke) === */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Make the main dashboard accessible initially without login */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />

        {/* === PROTECTED ROUTES (Sidebar ke saath) === */}
        {/* Jo pages Sidebar ke sath dikhane hain, unhein Layout mein wrap karein */}
        <Route
          path="/seed-analyzer"
          element={
            <ProtectedRoute>
              <Layout>
                <SeedAnalysis />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-scanner"
          element={
            <ProtectedRoute>
              <Layout>
                <DiseaseScanner />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/yield-prediction"
          element={
            <ProtectedRoute>
              <Layout>
                <YieldPrediction />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seed-scan"
          element={
            <ProtectedRoute>
              <Layout>
                <SeedScanner />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-detection"
          element={
            <ProtectedRoute>
              <Layout>
                <DiseaseDetection />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seed-info"
          element={
            <ProtectedRoute>
              <Layout>
                <SeedInfo />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease-info"
          element={
            <ProtectedRoute>
              <Layout>
                <DiseaseInfo />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;