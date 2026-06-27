import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle, Dog, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const durations = [15, 20, 30];

const adVideos = [
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/d5de9302f_YTDown_YouTube_Candy-Crush-Saga-TV-Commercial_Media_gJjCGmMkAIw_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/a3de2f4a9_YTDown_YouTube_Dog-Insurance-_-Care-TV-Ad-Jan-2024-30s-_Media_c5or_ZwpoLs_001_1080p1.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/c6df8c61f_YTDown_YouTube_Freshpet-Dinner-Date-Commercial-30_Media_vp0KBkum8Ug_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/f98660d05_YTDown_YouTube_Good-Boys-Spot-Pet-Insurance_Media_MCAdCuumKmY_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/88197f568_YTDown_YouTube_Quality-Dog-Food-Just-Look-for-Our-Name_Media_w1Z4KjFhQ44_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/9f9d5b77a_YTDown_YouTube_Welcome-to-the-Specsavers-Vet-Specsavers_Media_I3MUX3V0aUE_001_1080p.mp4' },
];

export default function AdWatchingModal({ isOpen, onClose, onAdComplete, onDevAdComplete, currentProgress, currentTarget = 3, onMealComplete, totalAdsWatched = 0, isSupporter }) {
  const nextTotal = totalAdsWatched + 1;
  const isDeveloperRequestAd = nextTotal > 0 && nextTotal % 15 === 0;

  const [stage, setStage] = useState('ready'); // dev_request, ready, watching, complete
  const [isDevAd, setIsDevAd] = useState(false); // true = this ad is for the developer
  const [devAdsRemaining, setDevAdsRemaining] = useState(0); // how many dev ads left (out of 5)
  const [countdown, setCountdown] = useState(15);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const videoRef = useRef(null);
  const adSnapshotRef = useRef({ progress: 0, target: 5 });
  const devRequestWindowRef = useRef(null);
  const pendingDevRequestRef = useRef(false);

  useEffect(() => {
    if (isOpen && pendingDevRequestRef.current) {
      const currentWindow = Math.floor(totalAdsWatched / 15);
      if (devRequestWindowRef.current !== currentWindow) {
        setStage('dev_request');
      }
      pendingDevRequestRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (stage === 'watching') {
      const timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setCountdown(Math.max(0, videoDuration - newTime));
          if (newTime >= videoDuration) {
            setStage('complete');
            const snap = adSnapshotRef.current;
            const willCompleteMeal = (snap.progress + 1) >= snap.target;
            if (willCompleteMeal) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: isSupporter ? ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'] : ['#F59E0B', '#EA580C', '#92400E', '#FCD34D']
              });
            }
            return newTime;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, videoDuration, currentProgress, currentTarget]);



  const startWatching = () => {
    console.log('[AdWatchingModal] startWatching — currentProgress:', currentProgress, 'currentTarget:', currentTarget, 'isSupporter:', isSupporter);
    adSnapshotRef.current = { progress: currentProgress, target: currentTarget };
    console.log('[AdWatchingModal] snapshot set:', adSnapshotRef.current);
    const randomIndex = Math.floor(Math.random() * adVideos.length);
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    setCurrentVideoIndex(randomIndex);
    setVideoDuration(randomDuration);
    setCountdown(randomDuration);
    setElapsedTime(0);
    setStage('watching');
  };

  const handleDevYes = () => {
    devRequestWindowRef.current = Math.floor(totalAdsWatched / 15);
    setIsDevAd(true);
    setDevAdsRemaining(5);
    setStage('ready');
  };

  const handleDevNo = () => {
    devRequestWindowRef.current = Math.floor(totalAdsWatched / 15);
    setIsDevAd(false);
    setDevAdsRemaining(0);
    setStage('ready');
    onClose();
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      if (isDevAd) {
        console.log('[AdWatchingModal] dev ad complete, remaining:', devAdsRemaining);
        try {
          if (onDevAdComplete) await onDevAdComplete();
        } catch (err) {
          console.error('[AdWatchingModal] dev ad complete error (non-fatal):', err);
        }
        const remaining = devAdsRemaining - 1;
        setDevAdsRemaining(remaining);
        if (remaining > 0) {
          const randomIndex = Math.floor(Math.random() * adVideos.length);
          const randomDuration = durations[Math.floor(Math.random() * durations.length)];
          setCurrentVideoIndex(randomIndex);
          setVideoDuration(randomDuration);
          setCountdown(randomDuration);
          setElapsedTime(0);
          setStage('watching');
          setIsCompleting(false);
          return;
        } else {
          setIsDevAd(false);
          setStage('dev_thanks');
          setIsCompleting(false);
          return;
        }
      }

      const snap = adSnapshotRef.current;
      const completedMeal = (snap.progress + 1) >= snap.target;
      console.log('[AdWatchingModal] handleComplete — snap:', snap, 'completedMeal:', completedMeal, 'isDeveloperRequestAd:', isDeveloperRequestAd);
      console.log('[AdWatchingModal] calling onAdComplete (mutateAsync)...');
      await onAdComplete();
      console.log('[AdWatchingModal] onAdComplete returned successfully');

      if (completedMeal && onMealComplete) {
        console.log('[AdWatchingModal] calling onMealComplete (sets showDogSelection=true)');
        onMealComplete();
      }
      if (isDeveloperRequestAd) {
        console.log('[AdWatchingModal] deferring dev_request to next modal open');
        pendingDevRequestRef.current = true;
      }
    } catch (err) {
      console.error('[AdWatchingModal] handleComplete error:', err);
    }
    console.log('[AdWatchingModal] handleComplete cleanup — closing modal');
    setStage('ready');
    setCountdown(0);
    setElapsedTime(0);
    setIsCompleting(false);
    onClose();
  };

  const handleClose = () => {
    setStage('ready');
    setIsDevAd(false);
    setDevAdsRemaining(0);
    onClose();
  };

  if (!isOpen) return null;

  const snap = adSnapshotRef.current;
  const willCompleteMeal = !isDevAd && (snap.progress + 1) >= snap.target;

  const t = isSupporter ? {
    bg: 'from-indigo-50 to-violet-50',
    heading: 'text-indigo-900',
    headingText: isDevAd ? `💙 Supporting the Platform (${6 - devAdsRemaining} of 5)` : 'Watch an Ad to Support',
    closeHover: 'hover:bg-indigo-100',
    closeIcon: 'text-indigo-700',
    playBg: 'from-indigo-200 to-violet-200',
    playIcon: 'text-indigo-700',
    textPrimary: 'text-indigo-800',
    textSecondary: 'text-indigo-600',
    gradient: 'from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600',
    progressBar: 'from-indigo-500 to-violet-500',
    countdownBg: 'bg-indigo-100',
    countdownText: 'text-indigo-700',
    countdownLabel: 'text-indigo-700',
    completeCircle: 'bg-gradient-to-br from-indigo-200 to-violet-200',
    completeBtn: 'from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600',
    headingComplete: 'text-indigo-900',
    bodyComplete: 'text-indigo-700',
    noteBg: 'bg-indigo-50',
    noteBorder: 'border-indigo-200',
    noteText: 'text-indigo-700',
  } : {
    bg: 'from-amber-50 to-white',
    heading: 'text-amber-900',
    headingText: isDevAd ? `💙 Supporting the Platform (${6 - devAdsRemaining} of 5)` : 'Watch an Ad',
    closeHover: 'hover:bg-amber-100',
    closeIcon: 'text-amber-700',
    playBg: 'from-amber-200 to-orange-200',
    playIcon: 'text-amber-700',
    textPrimary: 'text-amber-800',
    textSecondary: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    progressBar: 'from-amber-500 to-orange-500',
    countdownBg: 'bg-amber-100',
    countdownText: 'text-amber-700',
    countdownLabel: 'text-amber-700',
    completeCircle: 'bg-gradient-to-br from-green-200 to-emerald-200',
    completeBtn: 'from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
    headingComplete: 'text-amber-900',
    bodyComplete: 'text-amber-700',
    noteBg: 'bg-amber-50',
    noteBorder: 'border-amber-200',
    noteText: 'text-amber-700',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-gradient-to-b rounded-3xl p-6 max-w-md w-full shadow-2xl transition-all ${isDevAd ? 'from-blue-50 to-white border-4 border-blue-400' : t.bg}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${isDevAd ? 'text-blue-900' : t.heading}`}>
              {t.headingText}
            </h2>
            <button onClick={handleClose} className={`p-2 ${isDevAd ? 'hover:bg-blue-100' : t.closeHover} rounded-full transition-colors`}>
              <X className={`w-5 h-5 ${isDevAd ? 'text-blue-700' : t.closeIcon}`} />
            </button>
          </div>

          {stage === 'dev_request' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
              <div className="text-5xl mb-4">🙏</div>
              <h3 className={`text-xl font-bold ${t.heading} mb-3`}>A message from the developer</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-left">
                <p className="text-blue-800 text-sm leading-relaxed mb-3">
                  Hi! Running this platform costs real money — servers, delivery coordination, and keeping the feeding network going.
                </p>
                <p className="text-blue-800 text-sm font-medium">
                  Would you be willing to watch <strong>5 short ads</strong> to help cover platform costs and keep us feeding dogs? 🐕
                </p>
              </div>
              <p className={`text-xs ${t.textSecondary} mb-5`}>
                These ads go directly to platform costs — your normal ads still feed dogs!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDevNo}
                  variant="outline"
                  className={`flex-1 py-5 rounded-xl ${isSupporter ? 'border-indigo-200 text-indigo-700' : 'border-amber-200 text-amber-700'}`}
                >
                  No thanks, just feed dogs
                </Button>
                <Button
                  onClick={handleDevYes}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-5 rounded-xl font-semibold"
                >
                  Yes, I'll help! 💙
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'ready' && (
            <div className="text-center py-8">
              <div className={`w-24 h-24 mx-auto bg-gradient-to-br rounded-full flex items-center justify-center mb-6 ${isDevAd ? 'from-blue-200 to-indigo-200' : t.playBg}`}>
                <Play className={`w-10 h-10 ${isDevAd ? 'text-blue-700' : t.playIcon} ml-1`} />
              </div>
              {isDevAd ? (
                <>
                  <p className="text-blue-700 font-medium mb-2">💙 Helping the platform</p>
                  <p className="text-sm text-blue-600 mb-6">This ad helps cover running costs — thank you!</p>
                </>
              ) : isSupporter ? (
                <>
                  <p className={`${t.textPrimary} mb-2`}>Watch a short ad</p>
                  <p className={`text-sm ${t.textSecondary} mb-6`}>
                    {willCompleteMeal
                      ? "⚡ This ad completes a block — thank you for supporting!"
                      : `${currentTarget - currentProgress - 1} more ad${currentTarget - currentProgress - 1 !== 1 ? 's' : ''} to complete this block`
                    }
                  </p>
                </>
              ) : (
                <>
                  <p className={`${t.textPrimary} mb-2`}>Watch a short ad</p>
                  <p className={`text-sm ${t.textSecondary} mb-6`}>
                    {willCompleteMeal 
                      ? "🎉 This ad will complete a meal for a stray dog!" 
                      : `${currentTarget - currentProgress - 1} more ad${currentTarget - currentProgress - 1 !== 1 ? 's' : ''} after this to provide a meal`
                    }
                  </p>
                </>
              )}
              <Button 
                onClick={startWatching}
                className={`text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg ${isDevAd ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : t.gradient}`}
              >
                Start Watching
              </Button>
            </div>
          )}

          {stage === 'watching' && (
            <div className="text-center py-8">
              <div className="w-full aspect-video bg-black rounded-2xl mb-6 relative overflow-hidden">
                <video
                  ref={videoRef}
                  key={currentVideoIndex}
                  src={adVideos[currentVideoIndex].url}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  {isMuted
                    ? <VolumeX className="w-4 h-4 text-white" />
                    : <Volume2 className="w-4 h-4 text-white" />
                  }
                </button>
                <motion.div
                  key={`progress-${currentVideoIndex}`}
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r z-10 ${isDevAd ? 'from-blue-500 to-indigo-500' : isSupporter ? 'from-indigo-500 to-violet-500' : 'from-amber-500 to-orange-500'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: videoDuration, ease: 'linear' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-12 h-12 rounded-full ${isDevAd ? 'bg-blue-100' : t.countdownBg} flex items-center justify-center`}>
                  <span className={`text-xl font-bold ${isDevAd ? 'text-blue-700' : t.countdownText}`}>{countdown}</span>
                </div>
                <span className={isDevAd ? 'text-blue-700' : t.countdownLabel}>seconds remaining</span>
              </div>
            </div>
          )}

          {stage === 'dev_thanks' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center py-8">
              <div className="text-5xl mb-4">💙</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Thank you so much!</h3>
              <p className="text-blue-700 mb-6">Your support keeps this platform running and the dogs fed. You're amazing! 🐕</p>
              <Button
                onClick={() => { setStage('ready'); setIsDevAd(false); onClose(); }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Back to feeding dogs 🐕
              </Button>
            </motion.div>
          )}

          {stage === 'complete' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${isDevAd ? 'bg-gradient-to-br from-blue-200 to-indigo-200' : isSupporter ? 'bg-gradient-to-br from-indigo-200 to-violet-200' : willCompleteMeal ? 'bg-gradient-to-br from-green-200 to-emerald-200' : 'bg-gradient-to-br from-green-200 to-emerald-200'}`}
              >
                {isDevAd ? (
                  <CheckCircle className="w-12 h-12 text-blue-700" />
                ) : isSupporter ? (
                  <CheckCircle className="w-12 h-12 text-indigo-700" />
                ) : willCompleteMeal ? (
                  <Dog className="w-12 h-12 text-emerald-700" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-emerald-700" />
                )}
              </motion.div>
              <h3 className={`text-2xl font-bold mb-2 ${isDevAd ? 'text-blue-900' : t.headingComplete}`}>
                {isDevAd ? '💙 Ad watched!' : willCompleteMeal ? (isSupporter ? '🎉 Block Complete!' : "🎉 Meal Provided!") : "Thank You!"}
              </h3>
              <p className={`mb-4 ${isDevAd ? 'text-blue-700' : t.bodyComplete}`}>
                {isDevAd
                  ? devAdsRemaining - 1 > 0 ? `💙 Thank you! ${devAdsRemaining - 1} more platform ad${devAdsRemaining - 1 !== 1 ? 's' : ''} to go.` : "That's the last one — thank you so much! 💙"
                  : willCompleteMeal
                    ? isSupporter
                      ? `Thank you for watching ${currentTarget} ads — your support helps us expand to more countries and help more dogs around the world!`
                      : "You just provided a warm chicken & rice meal for a stray dog!"
                    : isSupporter
                      ? "Every ad brings us closer to covering another day of server & licensing costs."
                      : "You're one step closer to feeding a stray dog!"
                }
              </p>
              {!isDevAd && !isSupporter && willCompleteMeal && (
                <>
                  <p className={`font-medium mb-3 ${t.bodyComplete}`}>
                    Please select the dog you would like to feed! 🐕
                  </p>
                  <div className={`rounded-xl p-3 mb-4 text-left ${t.noteBg} ${t.noteBorder} border`}>
                    <p className={`text-sm ${t.noteText}`}>
                      <span className="font-semibold">⏰ Please note:</span> It can take up to 72 hours for a feeder to receive the instruction, prep the food, and feed your dog. Meals are collated across multiple users so feeders can feed many dogs at once — this also helps reduce costs through bulk buying!
                    </p>
                  </div>
                </>
              )}
              {!isDevAd && isSupporter && willCompleteMeal && (
                <div className={`rounded-xl p-3 mb-4 text-left ${t.noteBg} ${t.noteBorder} border`}>
                  <p className={`text-sm ${t.noteText}`}>
                    <span className="font-semibold">🌍 Expanding our reach:</span> Every 15 ads funds 1 day of server &amp; licensing costs, helping us roll out Feed a Stray to more countries and help more stray dogs worldwide!
                  </p>
                </div>
              )}
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
                className={`text-white px-8 py-3 rounded-xl font-semibold ${isDevAd ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : isSupporter ? t.completeBtn : t.completeBtn} ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isCompleting ? 'Saving...' : isDevAd ? (devAdsRemaining - 1 > 0 ? `Watch next platform ad (${devAdsRemaining - 1} left)` : "Finish") : isSupporter ? "Continue" : willCompleteMeal ? "Choose a Dog" : "Continue"}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}