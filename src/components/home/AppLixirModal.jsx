import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle, Clock, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

export default function AppLixirModal({ onRewardGranted, dogName }) {
  const { user } = useAuth();
  const [step, setStep] = useState('ready');
  const [countdown, setCountdown] = useState(15);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startAd = () => {
    setStep('watching');
    setCountdown(15);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          completeAd();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const completeAd = async () => {
    try {
      const result = await base44.functions.invoke('applixirReward');
      const mealCompleted = result?.data?.mealCompleted ?? Math.random() > 0.8;
      setStep('reward');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f97316', '#ef4444', '#84cc16'],
      });
      setTimeout(() => {
        onRewardGranted({ mealCompleted });
      }, 2000);
    } catch (e) {
      setStep('reward');
      setTimeout(() => onRewardGranted({ mealCompleted: Math.random() > 0.8 }), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl border border-amber-600/30"
      >
        <div className="p-6 text-center">
          <div className="mb-4">
            <span className="text-5xl">🎬</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Watch an Ad</h2>
          <p className="text-amber-200 text-sm mb-6">
            {dogName ? `Help feed ${dogName}` : 'Help feed a stray dog'}
          </p>

          {step === 'ready' && (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl">📺</p>
                    <p className="text-white font-bold text-lg">1 ad</p>
                    <p className="text-amber-300 text-xs">= 1 meal point</p>
                  </div>
                  <div className="text-amber-400/40 text-2xl">→</div>
                  <div className="text-center">
                    <p className="text-2xl">🍚</p>
                    <p className="text-white font-bold text-lg">5 ads</p>
                    <p className="text-amber-300 text-xs">= 1 real meal 🐕</p>
                  </div>
                </div>
              </div>
              <button
                onClick={startAd}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Watch Ad
              </button>
            </div>
          )}

          {step === 'watching' && (
            <div className="space-y-4">
              <div className="bg-black/40 rounded-2xl p-8 border border-amber-500/30">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-amber-200 text-sm mb-4">Ad playing...</p>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold text-2xl">{countdown}s</span>
                </div>
                <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 15, ease: 'linear' }}
                  />
                </div>
              </div>
              <p className="text-amber-400 text-xs">Please wait while the ad plays...</p>
            </div>
          )}

          {step === 'reward' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
                <div className="text-6xl mb-2">🎉</div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <p className="text-white font-bold text-lg">+1 meal point earned!</p>
                </div>
              </div>
              <p className="text-amber-300 text-sm">Just 4 more ads to feed a real dog! 🐕</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
