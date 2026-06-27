import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, supabaseClient } from '@/lib/supabaseClient';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const isSupporter = searchParams.get('redirect') === '/Supporter';

  const [name, setName] = useState('');
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
      if (isSignup) {
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
        const email = `${sanitized}-${Date.now()}@meal-mate.app`;

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });

        const redirect = searchParams.get('redirect') || '';

        if (!signUpError && signUpData?.user) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          navigate(`/Register${redirect ? `?redirect=${redirect}` : ''}`);
          return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_via_rpc', {
          user_name: sanitized,
          user_password: password,
          display_name: name,
        });
        if (rpcError) throw new Error(rpcError.message || 'Signup failed');

        const rpcEmail = rpcData?.email;
        if (!rpcEmail) throw new Error('Signup failed - no email returned');

        const { error: signInError } = await supabase.auth.signInWithPassword({ email: rpcEmail, password });
        if (signInError) throw signInError;

        navigate(`/Register${redirect ? `?redirect=${redirect}` : ''}`);
      } else {
        const identifier = name.includes('@') ? name : null;

        if (!identifier) {
          const { data: stats } = await supabase
            .from('user_stats')
            .select('user_email')
            .eq('user_name', name)
            .limit(1);
          if (!stats?.length) throw new Error('User not found. Try your email instead.');
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: stats[0].user_email,
            password,
          });
          if (signInError) throw signInError;
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: identifier,
            password,
          });
          if (signInError) throw signInError;
        }

        const me = await supabaseClient.auth.me();
        if (!me) {
          navigate('/Register');
        } else {
          const { data: stats } = await supabase.from('user_stats').select('id').eq('user_email', me.email).limit(1);
          if (stats?.length === 0) {
            const redirect = searchParams.get('redirect');
            navigate(`/Register${redirect ? `?redirect=${redirect}` : ''}`);
          } else {
            const redirect = searchParams.get('redirect');
            navigate(redirect || '/Home');
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const label = isSignup ? 'Name' : 'Name or Email';

  return (
    <div className={`min-h-screen bg-gradient-to-b flex flex-col items-center justify-center px-6 ${isSupporter ? 'from-indigo-900 via-indigo-800 to-violet-900' : 'from-amber-900 via-amber-800 to-orange-900'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mb-6 ${isSupporter ? 'bg-gradient-to-br from-indigo-400 to-violet-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
        <span className="text-3xl">{isSupporter ? '⚡' : '🐕'}</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">
        {isSupporter ? 'Support the Platform' : isSignup ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className={`text-sm mb-8 ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>
        {isSupporter ? 'Watch ads to keep the servers running' : isSignup ? 'Join the pack and start feeding strays' : 'Log in to continue feeding'}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isSupporter ? 'text-indigo-300' : 'text-amber-300'}`} />
          <input
            type="text"
            placeholder={label}
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none ${isSupporter ? 'focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400' : 'focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
            required
          />
        </div>
        <div className="relative">
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isSupporter ? 'text-indigo-300' : 'text-amber-300'}`} />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full pl-11 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none ${isSupporter ? 'focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400' : 'focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isSupporter ? 'text-indigo-300 hover:text-indigo-200' : 'text-amber-300 hover:text-amber-200'}`}
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
          className={`w-full text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${isSupporter ? 'bg-gradient-to-r from-indigo-400 to-violet-500 hover:from-indigo-500 hover:to-violet-600 shadow-indigo-900/50' : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-orange-900/50'}`}
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>

        <p className={`text-center text-sm ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignup(v => !v)}
            className={`font-semibold underline underline-offset-2 ${isSupporter ? 'text-indigo-400 hover:text-indigo-300' : 'text-amber-400 hover:text-amber-300'}`}
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
}
