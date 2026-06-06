import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dog, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'feeder_activated';
const TRAINING_KEY = 'feeder_training_completed';
const AUTH_KEY = 'feeder_authenticated';
const FEEDER_REGISTERED_KEY = 'feeder_registered';

export default function FeederGate() {
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReturningFeeder, setIsReturningFeeder] = useState(false);
  const navigate = useNavigate();

  const getNextRoute = () =>
    localStorage.getItem(TRAINING_KEY) === 'true' ? '/FeederDashboard' : '/FeederTraining';

  useEffect(() => {
    // Admins bypass the gate entirely
    base44.auth.me().then(u => {
      if (u?.role === 'admin') {
        sessionStorage.setItem(SESSION_KEY, 'true');
        navigate(getNextRoute(), { replace: true });
      }
    }).catch(() => {});

    // If already authenticated this session, go straight to dashboard
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      navigate(getNextRoute(), { replace: true });
      return;
    }
    // If this device has a registered feeder, show login button instead of code form
    if (localStorage.getItem(FEEDER_REGISTERED_KEY)) {
      setIsReturningFeeder(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      setCodeInput(urlCode.toUpperCase());
    }
  }, []);

  const handleActivate = async () => {
    const entered = codeInput.trim().toUpperCase();
    if (!entered) return;
    setLoading(true);
    setCodeError(false);

    try {
      const res = await base44.functions.invoke('validateAccessCode', { code: entered });
      if (res.data?.valid) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        localStorage.setItem(AUTH_KEY, 'true');
        // Check if already logged into Base44, if not redirect to login first
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          base44.auth.redirectToLogin(getNextRoute());
        } else {
          navigate(getNextRoute(), { replace: true });
        }
      } else {
        setCodeError(true);
      }
    } catch (e) {
      setCodeError(true);
    }

    setLoading(false);
  };

  if (isReturningFeeder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-5 shadow-lg">
            <Dog className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Welcome Back!</h1>
          <p className="text-emerald-700 text-sm mb-6">
            Log in with your feeder account to access the dashboard.
          </p>
          <Button
            onClick={() => base44.auth.redirectToLogin('/FeederDashboard')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold mb-3"
          >
            Log In to Feeder Portal
          </Button>
          <button
            onClick={() => { localStorage.removeItem(FEEDER_REGISTERED_KEY); setIsReturningFeeder(false); }}
            className="text-xs text-emerald-400 hover:text-emerald-600 underline"
          >
            Use a different activation code
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-5 shadow-lg">
          <Dog className="w-10 h-10 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <Lock className="w-3 h-3" /> Invite Only
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">Feeder Portal</h1>
        <p className="text-emerald-700 text-sm mb-6">
          This area is for verified feeders only. Enter your activation code to continue.
        </p>
        <Input
          value={codeInput}
          onChange={e => { setCodeInput(e.target.value); setCodeError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
          placeholder="Enter activation code"
          className={`mb-3 border-2 text-center font-mono tracking-widest uppercase ${codeError ? 'border-red-400 bg-red-50' : 'border-emerald-200 focus:border-emerald-400'}`}
        />
        {codeError && <p className="text-red-500 text-sm mb-3">Invalid code. Please check and try again.</p>}
        <Button
          onClick={handleActivate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter'}
        </Button>
        <p className="text-xs text-emerald-400 mt-4">Don't have a code? Contact the Feed a Stray team.</p>
      </motion.div>
    </div>
  );
}