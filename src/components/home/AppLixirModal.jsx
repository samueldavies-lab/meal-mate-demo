import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

export default function AppLixirModal({ isOpen, onClose, onRewardGranted }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [hasWatchedAd, setHasWatchedAd] = useState(false);

  // Load AppLixir SDK
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    // AppLixir SDK initialization
    const scriptId = 'applixir-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://applixir.com/scripts/applixir.js';
      script.async = true;
      script.onload = () => {
        // Initialize AppLixir with your app ID
        // Replace 'YOUR_APP_ID' with actual AppLixir app ID
        if (window.ApplixirSDK) {
          window.ApplixirSDK.init('YOUR_APP_ID');
          setSdkReady(true);
        }
        setIsLoading(false);
      };
      script.onerror = () => {
        setError('Failed to load AppLixir SDK. Please try again.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    if (!window.ApplixirSDK) {
      setError('AppLixir SDK not ready');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Watch the rewarded video
      await new Promise((resolve, reject) => {
        window.ApplixirSDK.showRewardedVideo({
          onComplete: resolve,
          onFail: reject,
          onUserClosed: reject
        });
      });

      // Ad completed, grant reward
      const response = await base44.functions.invoke('applixirReward', {
        reward_amount: 1 // 1 ad = 1 progress
      });

      setHasWatchedAd(true);

      if (response.data.mealCompleted) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F59E0B', '#EA580C'] });
      }

      setTimeout(() => {
        if (onRewardGranted) {
          onRewardGranted(response.data);
        }
        if (response.data.mealCompleted) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error processing reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-xl font-bold text-amber-900">AppLixir Rewarded Ad</h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          <div className="text-center py-6">
            {isLoading && !hasWatchedAd ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-amber-700 font-medium">Loading ad...</p>
              </>
            ) : hasWatchedAd ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Ad Completed!</h3>
                <p className="text-amber-700 mb-4">Your reward has been granted.</p>
                <p className="text-sm text-amber-600">Keep watching ads to unlock meals for stray dogs!</p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <p className="text-sm text-amber-600">Please try again or contact support if the issue persists.</p>
              </>
            ) : !sdkReady ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-amber-700 font-medium">Initializing AppLixir...</p>
                <p className="text-xs text-amber-600 mt-2">Make sure you've set your App ID in the component</p>
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
              {hasWatchedAd ? 'Done' : 'Close'}
            </Button>
            {!hasWatchedAd && sdkReady && !error && (
              <Button
                onClick={handleWatchAd}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Watch Ad'}
              </Button>
            )}
          </div>

          {/* Configuration info */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 font-medium mb-1">⚙️ Setup Required</p>
            <p className="text-xs text-yellow-700">Replace 'YOUR_APP_ID' in components/home/AppLixirModal.jsx with your actual AppLixir app ID from their dashboard.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}