import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, UserCircle, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/FeederDashboard' },
  { name: 'Profile', icon: UserCircle, path: '/FeederRegister' },
  { name: 'Account', icon: Wallet, path: '/FeederAccount' },
];

export default function FeederLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user entered a valid access code (only redirect if not authenticated at all)
    const isActivated = sessionStorage.getItem('feeder_activated') === 'true';
    const isAuthenticated = localStorage.getItem('feeder_authenticated') === 'true';
    
    if (!isActivated && !isAuthenticated) {
      navigate('/FeederGate', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#065F46',
          },
        }}
      />

      <main className="pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-emerald-100 px-2 py-2 pb-[env(safe-area-inset-bottom,8px)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex flex-col items-center gap-0.5 py-1 px-2 flex-1 min-w-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="feederBottomNavIndicator"
                    className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span className={`text-[10px] font-medium transition-colors truncate ${isActive ? 'text-emerald-700' : 'text-emerald-500'}`}>
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="fixed bottom-20 right-4 z-30 pointer-events-none">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-4xl"
        >
          🐕
        </motion.div>
      </div>
    </div>
  );
}