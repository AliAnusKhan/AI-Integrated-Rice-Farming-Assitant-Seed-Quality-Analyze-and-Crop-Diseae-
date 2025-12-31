import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  ScanLine, 
  TrendingUp, 
  History,
  Globe,
  Moon,
  LogOut,
  Leaf,
  ChevronRight,
  User
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // User Data Store karne ke liye State
  const [user, setUser] = useState({ name: 'Loading...', email: '...' });

  // === FIREBASE SE DATA UTHANA ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Agar user ka Display Name set nahi hai to Email ka pehla hissa naam bana lo
        const displayName = currentUser.displayName || currentUser.email.split('@')[0];
        setUser({
          name: displayName,
          email: currentUser.email
        });
      } else {
        setUser({ name: 'Guest', email: 'No Account' });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    // 'shrink-0' ka matlab: Sidebar kabhi chhota nahi hoga, chahe screen kitni bhi tang ho.
    <div className="w-72 min-w-[18rem] h-screen bg-white border-r border-slate-200 flex flex-col font-sans sticky top-0 shrink-0">
      
      {/* 1. LOGO */}
      <div className="p-6 flex items-center gap-3 shrink-0">
        <div className="bg-green-600 p-2.5 rounded-xl shadow-lg shadow-green-200">
          <Leaf className="text-white" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">Rice<span className="text-green-600">Farm</span></h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1 tracking-wide">SMART ASSISTANT</p>
        </div>
      </div>

      {/* 2. MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
        
        {/* Navigation */}
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Navigation</p>
            <div className="space-y-1">
                <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/'} />
                <NavItem to="/seed-analyzer" icon={<Sprout size={20}/>} label="Seed Analysis" active={location.pathname === '/seed-analyzer'} />
                <NavItem to="/disease-scanner" icon={<ScanLine size={20}/>} label="Disease Detection" active={location.pathname === '/disease-scanner'} />
                <NavItem to="/yield-prediction" icon={<TrendingUp size={20}/>} label="Yield Prediction" active={location.pathname === '/yield-prediction'} />
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer transition-all">
                    <History size={20} />
                    <span className="font-medium text-sm">History</span>
                </div>
            </div>
        </div>

        {/* Settings */}
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Settings</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                        <Globe size={20}/> <span className="text-sm font-medium">Language</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">EN</span>
                </div>
            </div>
        </div>
      </div>

      {/* 3. PROFILE (DYNAMIC DATA) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm flex items-center justify-between group hover:border-green-200 transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
                {/* User Avatar - First Letter of Name */}
                <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-green-100 shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                {/* Dynamic User Details */}
                <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-800 truncate capitalize">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate w-32" title={user.email}>
                        {user.email}
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
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        active 
        ? 'bg-green-50 text-green-700 shadow-sm shadow-green-100' 
        : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm'
    }`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-600 rounded-r-full"></div>}
    <div className={`${active ? 'text-green-600' : 'text-slate-400'}`}>{icon}</div>
    <span>{label}</span>
    {active && <ChevronRight size={16} className="ml-auto opacity-50"/>}
  </Link>
);

export default Sidebar;