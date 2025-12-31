import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Aapke Components aur Pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SeedAnalysis from './pages/SeedAnalysis';
import DiseaseScanner from './pages/DiseaseScanner';
import YieldPrediction from './pages/YieldPrediction';
import Login from './pages/login';   // Agar aapke paas Login page hai
import Signup from './pages/Signup'; // Agar aapke paas Signup page hai

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
        {/* Login/Signup par Sidebar nahi dikhana chahiye */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* === PROTECTED ROUTES (Sidebar ke saath) === */}
        {/* Jo pages Sidebar ke sath dikhane hain, unhein Layout mein wrap karein */}
        
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />

        <Route path="/seed-analyzer" element={
          <Layout>
            <SeedAnalysis />
          </Layout>
        } />

        <Route path="/disease-scanner" element={
          <Layout>
            <DiseaseScanner />
          </Layout>
        } />

        <Route path="/yield-prediction" element={
          <Layout>
            <YieldPrediction />
          </Layout>
        } />

      </Routes>
    </Router>
  );
};

export default App;