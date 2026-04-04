import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, ScanLine, TrendingUp, History,
  Globe, LogOut, Leaf, ChevronRight
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
          ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100'
          : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-600 rounded-r-full"></div>}
          <div className={`${isActive ? 'text-green-600' : 'text-slate-400'}`}>{icon}</div>
          <span>{label}</span>
          {isActive && <ChevronRight size={16} className="mr-auto opacity-50" />}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Hamburger button for small screens */}
      {/* Hamburger / Close button for small screens */}
      <button
        className="fixed top-4 right-4 z-50 p-2 rounded-md bg-green-600 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          // X icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>


      {/* Sidebar */}
      <div
        className={`fixed lg:static md:static top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col font-sans z-40 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-72 min-w-[18rem]`}
      >
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="bg-green-600 p-2.5 rounded-xl shadow-lg shadow-green-200">
            <Leaf className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">
              Rice<span className="text-green-600">Farm</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1 tracking-wide">SMART ASSISTANT</p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Navigation</p>
            <div className="space-y-1">
              <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavItem to="/seed-info" icon={<Sprout size={20} />} label="Seed Analysis" />
              <NavItem to="/disease-detection" icon={<ScanLine size={20} />} label="Disease Detection" />
              <NavItem to="/yield-prediction" icon={<TrendingUp size={20} />} label="Yield Prediction" />
              <NavItem to="/history" icon={<History size={20} />} label="History" />
            </div>
          </div>

          {/* Settings */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Settings</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <Globe size={20} /> <span className="text-sm font-medium">Language</span>
                </div>
                <span className="text-xs font-bold text-slate-400">EN</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-green-100 shrink-0">
                {currentUser && currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 truncate capitalize">{currentUser && currentUser.email ? currentUser.email.split('@')[0] : 'Guest'}</h4>
                <p className="text-[10px] text-slate-500 truncate w-32" title={currentUser ? currentUser.email : 'No Account'}>
                  {currentUser ? currentUser.email : 'No Account'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
