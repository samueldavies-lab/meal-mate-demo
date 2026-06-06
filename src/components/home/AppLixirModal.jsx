import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function AppLixirModal({ isOpen, onClose, onRewardGranted }) {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [hasWatched, setHasWatched] = useState(false);

  const handleWatchAd = () => {
    setIsWatching(true);
    setCountdown(15);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWatching(false);
          setHasWatched(true);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F59E0B', '#EA580C'] });
          setTimeout(() => {
            if (onRewardGranted) onRewardGranted({ mealCompleted: Math.random() > 0.8 });
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-900">Rewarded Ad</h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          <div className="text-center py-6">
            {isWatching ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-3xl font-bold text-white animate-pulse">
                    {countdown}
                  </div>
                </div>
                <p className="text-amber-700 font-medium">Ad playing... {countdown}s remaining</p>
              </>
            ) : hasWatched ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Ad Completed!</h3>
                <p className="text-amber-700 mb-4">Your reward has been granted.</p>
                <p className="text-sm text-amber-600">Keep watching ads to unlock meals for stray dogs!</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Watch a Video</h3>
                <p className="text-amber-700 mb-4">Watch a short ad to earn progress toward feeding a stray dog.</p>
                <p className="text-sm text-amber-600 mb-6">Your reward will be applied instantly!</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 py-6 rounded-xl border-amber-200"
            >
              {hasWatched ? 'Done' : 'Close'}
            </Button>
            {!hasWatched && !isWatching && (
              <Button
                onClick={handleWatchAd}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Ad
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
