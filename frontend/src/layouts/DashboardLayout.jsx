import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Activity, Stethoscope, Apple, Calendar, 
  Settings, LogOut, Bell, Menu, X, User, ChevronDown,
  Video, Watch, Users
} from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const patientLinks = [
  { name: 'Overview', icon: Home, path: '/dashboard' },
  { name: 'Disease Prediction', icon: Activity, path: '/dashboard/prediction' },
  { name: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
  { name: 'Telemedicine', icon: Video, path: '/dashboard/telemedicine' },
  { name: 'Wearables & IoT', icon: Watch, path: '/dashboard/wearables' },
  { name: 'Recommendations', icon: Apple, path: '/dashboard/recommendations' },
  { name: 'Medical Records', icon: Stethoscope, path: '/dashboard/records' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const doctorLinks = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'My Patients', icon: User, path: '/dashboard/patients' },
  { name: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
  { name: 'Telemedicine', icon: Video, path: '/dashboard/telemedicine' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const adminLinks = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Users & Platform', icon: Users, path: '/dashboard/admin' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <div className="flex h-screen bg-dark-bg text-slate-200 overflow-hidden font-sans">
      
      {/* Background ambient light */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="w-64 bg-dark-card/50 backdrop-blur-xl border-r border-dark-border/50 flex flex-col z-20 relative"
          >
            <div className="p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                HealthHub+
              </h2>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  <link.icon size={20} className="shrink-0" />
                  <span className="font-medium">{link.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-dark-border/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-dark-card/30 backdrop-blur-xl border-b border-dark-border/50 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-dark-bg border border-dark-border hover:bg-dark-border/50 transition-colors text-slate-300"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-semibold text-white tracking-wide">
              {user?.role === 'patient' ? 'Patient Portal' : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-card" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-6 border-l border-dark-border/50 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-primary capitalize">{user?.role || 'Patient'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-dark-card border border-dark-border/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-dark-border/50 mb-2 sm:hidden">
                      <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role || 'Patient'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-dark-bg transition-colors"
                    >
                      <User size={16} /> My Profile
                    </button>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
