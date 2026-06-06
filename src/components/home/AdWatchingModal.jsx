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

export default function AdWatchingModal({ isOpen, onClose, onAdComplete, currentProgress, currentTarget = 3, onMealComplete, totalAdsWatched = 0 }) {
  // After 50 ads total (then every 50 thereafter) — triggers the developer request
  const isDeveloperRequestAd = totalAdsWatched > 0 && totalAdsWatched % 50 === 0;

  const [stage, setStage] = useState('ready'); // dev_request, ready, watching, complete
  const [isDevAd, setIsDevAd] = useState(false); // true = this ad is for the developer
  const [devAdsRemaining, setDevAdsRemaining] = useState(0); // how many dev ads left (out of 5)
  const [countdown, setCountdown] = useState(15);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (stage === 'watching') {
      const timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setCountdown(Math.max(0, videoDuration - newTime));
          if (newTime >= videoDuration) {
            setStage('complete');
            const willCompleteMeal = (currentProgress + 1) >= currentTarget;
            if (willCompleteMeal) {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#EA580C', '#92400E', '#FCD34D']
              });
            }
            return prev;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, videoDuration, currentProgress, currentTarget]);



  const startWatching = () => {
    const randomIndex = Math.floor(Math.random() * adVideos.length);
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    setCurrentVideoIndex(randomIndex);
    setVideoDuration(randomDuration);
    setCountdown(randomDuration);
    setElapsedTime(0);
    setStage('watching');
  };

  const handleDevYes = () => {
    // User agreed — watch 5 ads for developer, not counted toward meals
    setIsDevAd(true);
    setDevAdsRemaining(5);
    setStage('ready');
  };

  const handleDevNo = () => {
    // User declined — normal ad for dogs
    setIsDevAd(false);
    setDevAdsRemaining(0);
    setStage('ready');
  };

  const handleComplete = () => {
    if (isDevAd) {
      // Dev ad complete — don't call onAdComplete (no meal credit), just count remaining
      const remaining = devAdsRemaining - 1;
      setDevAdsRemaining(remaining);
      if (remaining > 0) {
        setStage('ready');
        setCountdown(0);
        setElapsedTime(0);
      } else {
        // All 5 dev ads done
        setIsDevAd(false);
        setStage('dev_thanks');
      }
      return;
    }

    const completedMeal = (currentProgress + 1) >= currentTarget;
    onAdComplete();
    setStage('ready');
    setCountdown(0);
    setElapsedTime(0);

    if (completedMeal && onMealComplete) {
      onMealComplete();
      // Only show dev request prompt AFTER a full meal is completed
      if (isDeveloperRequestAd) {
        setStage('dev_request');
        return;
      }
    }
    onClose();
  };

  const handleClose = () => {
    setStage('ready');
    setIsDevAd(false);
    setDevAdsRemaining(0);
    onClose();
  };

  if (!isOpen) return null;

  const willCompleteMeal = !isDevAd && (currentProgress + 1) >= currentTarget;

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
          className={`bg-gradient-to-b rounded-3xl p-6 max-w-md w-full shadow-2xl transition-all ${isDevAd ? 'from-blue-50 to-white border-4 border-blue-400' : 'from-amber-50 to-white'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-amber-900">
              {isDevAd ? `💙 Supporting the Platform (${6 - devAdsRemaining} of 5)` : 'Watch an Ad'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {stage === 'dev_request' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
              <div className="text-5xl mb-4">🙏</div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">A message from the developer</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-left">
                <p className="text-blue-800 text-sm leading-relaxed mb-3">
                  Hi! Running this platform costs real money — servers, delivery coordination, and keeping the feeding network going.
                </p>
                <p className="text-blue-800 text-sm font-medium">
                  Would you be willing to watch <strong>5 short ads</strong> to help cover platform costs and keep us feeding dogs? 🐕
                </p>
              </div>
              <p className="text-xs text-amber-600 mb-5">
                These ads go directly to platform costs — your normal ads still feed dogs!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDevNo}
                  variant="outline"
                  className="flex-1 py-5 rounded-xl border-amber-200 text-amber-700"
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
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-amber-700 ml-1" />
              </div>
              {isDevAd ? (
                <>
                  <p className="text-blue-700 font-medium mb-2">💙 Helping the platform</p>
                  <p className="text-sm text-blue-600 mb-6">This ad helps cover running costs — thank you!</p>
                </>
              ) : (
                <>
                  <p className="text-amber-800 mb-2">Watch a short ad</p>
                  <p className="text-sm text-amber-600 mb-6">
                    {willCompleteMeal 
                      ? "🎉 This ad will complete a meal for a stray dog!" 
                      : `${currentTarget - currentProgress - 1} more ad${currentTarget - currentProgress - 1 !== 1 ? 's' : ''} after this to provide a meal`
                    }
                  </p>
                </>
              )}
              <Button 
                onClick={startWatching}
                className={`text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg ${isDevAd ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`}
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
                {/* Mute button */}
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
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 z-10"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: videoDuration, ease: 'linear' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-700">{countdown}</span>
                </div>
                <span className="text-amber-700">seconds remaining</span>
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
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${isDevAd ? 'bg-gradient-to-br from-blue-200 to-indigo-200' : 'bg-gradient-to-br from-green-200 to-emerald-200'}`}
              >
                {isDevAd ? (
                  <CheckCircle className="w-12 h-12 text-blue-700" />
                ) : willCompleteMeal ? (
                  <Dog className="w-12 h-12 text-emerald-700" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-emerald-700" />
                )}
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                {isDevAd ? '💙 Ad watched!' : willCompleteMeal ? "🎉 Meal Provided!" : "Thank You!"}
              </h3>
              <p className="text-amber-700 mb-4">
                {isDevAd
                  ? devAdsRemaining - 1 > 0 ? `💙 Thank you! ${devAdsRemaining - 1} more platform ad${devAdsRemaining - 1 !== 1 ? 's' : ''} to go.` : "That's the last one — thank you so much! 💙"
                  : willCompleteMeal 
                    ? "You just provided a warm chicken & rice meal for a stray dog!" 
                    : "You're one step closer to feeding a stray dog!"
                }
              </p>
              {!isDevAd && willCompleteMeal && (
                <>
                  <p className="text-amber-800 font-medium mb-3">
                    Please select the dog you would like to feed! 🐕
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left">
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">⏰ Please note:</span> It can take up to 72 hours for a feeder to receive the instruction, prep the food, and feed your dog. Meals are collated across multiple users so feeders can feed many dogs at once — this also helps reduce costs through bulk buying!
                    </p>
                  </div>
                </>
              )}
              <Button 
                onClick={handleComplete}
                className={`text-white px-8 py-3 rounded-xl font-semibold ${isDevAd ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'}`}
              >
                {isDevAd ? (devAdsRemaining - 1 > 0 ? `Watch next platform ad (${devAdsRemaining - 1} left)` : "Finish") : willCompleteMeal ? "Choose a Dog" : "Continue"}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}