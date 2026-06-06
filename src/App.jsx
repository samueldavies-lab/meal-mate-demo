import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/lib/LanguageContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Rewards from './pages/Rewards';
import StrayMap from './pages/StrayMap';
import Profile from './pages/Profile';
import FeederDashboard from './pages/FeederDashboard';
import FeederRegister from './pages/FeederRegister';
import FeederLayout from './components/feeder/FeederLayout';
import FeederAccount from './pages/FeederAccount';
import FeederGate from './pages/FeederGate';
import FeederTraining from './pages/FeederTraining';

import DevPortal from './pages/DevPortal';
import DevDashboard from './pages/DevDashboard';
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import { base44 } from '@/api/base44Client';


// Sends logged-in non-feeders to /Home, everyone else to the splash
function RootRedirect() {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [target, setTarget] = React.useState(null);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) {
        const me = await base44.auth.me();
        if (me?.role === 'feeder') {
          setTarget('splash');
        } else {
          setTarget('home');
        }
      } else {
        setTarget('splash');
      }
    });
  }, []);

  if (isLoadingAuth || isLoadingPublicSettings || target === null) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>;
  }
  if (target === 'home') return <Navigate to="/Home" replace />;
  return <Welcome />;
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (skip for feeder/dev routes which have their own auth)
  const pathname = window.location.pathname;
  const isExemptRoute = pathname === '/' || pathname === '/Login' || pathname === '/Register' || pathname.startsWith('/Feeder') || pathname.startsWith('/DevPortal') || pathname.startsWith('/DevDashboard');
  if (authError && !isExemptRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Developer routes */}
      <Route path="/DevPortal" element={<DevPortal />} />
      <Route path="/DevDashboard" element={<DevDashboard />} />

      {/* Feeder routes — must come BEFORE the pagesConfig loop to override it */}
      <Route path="/FeederGate" element={<FeederGate />} />
      <Route path="/FeederTraining" element={<FeederTraining />} />
      <Route
        path="/FeederDashboard"
        element={
          <FeederLayout>
            <FeederDashboard />
          </FeederLayout>
        }
      />
      <Route
        path="/FeederRegister"
        element={
          <FeederLayout>
            <FeederRegister />
          </FeederLayout>
        }
      />
      <Route
        path="/FeederAccount"
        element={
          <FeederLayout>
            <FeederAccount />
          </FeederLayout>
        }
      />


      <Route path="/Login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route 
        path="/Rewards" 
        element={
          <LayoutWrapper currentPageName="Rewards">
            <Rewards />
          </LayoutWrapper>
        } 
      />
      <Route 
        path="/StrayMap" 
        element={
          <LayoutWrapper currentPageName="StrayMap">
            <StrayMap />
          </LayoutWrapper>
        } 
      />
      <Route 
        path="/Profile" 
        element={
          <LayoutWrapper currentPageName="Profile">
            <Profile />
          </LayoutWrapper>
        } 
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <LanguageProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </LanguageProvider>
  )
}

export default App