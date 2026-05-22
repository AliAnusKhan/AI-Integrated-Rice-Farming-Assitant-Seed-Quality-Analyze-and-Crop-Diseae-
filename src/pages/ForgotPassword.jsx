// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Loader2, Mail } from 'lucide-react';
import { auth } from '../firebase'; // Ensure karein aapki firebase.js se config main auth exported ho
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inputEmail = email.trim().toLowerCase();

      // Firebase Auth ka built-in method jo direct secure reset email bhejta hai
      await sendPasswordResetEmail(auth, inputEmail);

      alert(`✅ Password reset link has been sent to ${inputEmail}\n\nPlease check your inbox/spam folder.`);
      
      // Kaam khatam! User ko wapas login screen par bhej do
      navigate('/login');

    } catch (error) {
      console.error("Firebase Reset Error:", error.message);
      // Kuch common errors ko handle karne ke liye simple checks
      if (error.code === 'auth/user-not-found') {
        alert("Error: This email address is not registered!");
      } else if (error.code === 'auth/invalid-email') {
        alert("Error: Please enter a valid email address.");
      } else {
        alert("Error: " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Leaf className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          <p className="text-slate-500">Enter your email to receive a secure password reset link</p>
        </div>

        <form onSubmit={handleSendResetLink} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-semibold text-green-600 hover:text-green-700 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;