import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabaseClient';
import { createPageUrl } from '@/utils';
import { Mail, Lock, Dog, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        navigate(createPageUrl('Register'));
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const me = await supabaseClient.auth.me();
        if (!me) {
          navigate(createPageUrl('Register'));
        } else {
          const { data: stats } = await supabase.from('user_stats').select('id').eq('user_email', email).limit(1);
          if (stats?.length === 0) {
            navigate(createPageUrl('Register'));
          } else {
            navigate(createPageUrl('Home'));
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
        <span className="text-3xl">🐕</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">
        {isSignup ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-amber-200 text-sm mb-8">
        {isSignup ? 'Join the pack and start feeding strays' : 'Log in to continue feeding'}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-300/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-300/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-200"
          >
            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className="text-red-300 text-sm bg-red-900/30 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl shadow-orange-900/50 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>

        <p className="text-center text-amber-200 text-sm">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignup(v => !v)}
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
}
