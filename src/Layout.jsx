import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Trophy, Camera, Heart, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import DeveloperChatButton from './components/DeveloperChatButton';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Strays', icon: Map, page: 'StrayMap' },
  { name: 'Rewards', icon: Trophy, page: 'Rewards' },
  { name: 'My Dogs', icon: Camera, page: 'Gallery' },
  { name: 'Mission', icon: Heart, page: 'Mission' },
];

const pageRoutes = {
  Home: '/Home',
  StrayMap: '/StrayMap',
  Rewards: '/Rewards',
  Gallery: '/Gallery',
  Mission: '/Mission',
};

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showNav = !location.pathname.includes('/Register');

  const handleNavClick = (e, page) => {
    const route = pageRoutes[page] || `/${page}`;
    if (location.pathname === route) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <style>{`
        :root {
          --color-primary: #F59E0B;
          --color-secondary: #EA580C;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            color: '#92400E',
          },
        }}
      />

      {/* Main Content */}
      <main className={showNav ? "pb-20" : ""}>
        {children}
      </main>

      {/* Bottom Navigation - Hidden during onboarding */}
      {showNav && (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-amber-100 px-2 py-2 pb-[env(safe-area-inset-bottom,8px)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map(({ name, icon: Icon, page }) => {
            const isActive = currentPageName === page;
            const route = pageRoutes[page] || `/${page}`;
            return (
              <Link
                key={page}
                to={route}
                aria-label={name}
                onClick={(e) => handleNavClick(e, page)}
                className="relative flex flex-col items-center gap-0.5 py-1 px-2 flex-1 min-w-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-amber-600' : 'text-amber-400'
                  }`}
                  aria-hidden="true"
                />
                <span className={`text-[10px] font-medium transition-colors truncate ${
                  isActive ? 'text-amber-700' : 'text-amber-500'
                }`}>
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}



      {/* Developer Chat Button */}
      <div className="fixed top-4 left-4 z-40">
        <DeveloperChatButton />
      </div>
    </div>
  );
}