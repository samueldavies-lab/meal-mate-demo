import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle, Volume2, VolumeX, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const adVideos = [
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/d5de9302f_YTDown_YouTube_Candy-Crush-Saga-TV-Commercial_Media_gJjCGmMkAIw_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/a3de2f4a9_YTDown_YouTube_Dog-Insurance-_-Care-TV-Ad-Jan-2024-30s-_Media_c5or_ZwpoLs_001_1080p1.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/c6df8c61f_YTDown_YouTube_Freshpet-Dinner-Date-Commercial-30_Media_vp0KBkum8Ug_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/f98660d05_YTDown_YouTube_Good-Boys-Spot-Pet-Insurance_Media_MCAdCuumKmY_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/88197f568_YTDown_YouTube_Quality-Dog-Food-Just-Look-for-Our-Name_Media_w1Z4KjFhQ44_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/9f9d5b77a_YTDown_YouTube_Welcome-to-the-Specsavers-Vet-Specsavers_Media_I3MUX3V0aUE_001_1080p.mp4' },
];

const ADS_PER_BLOCK = 5;

export default function DevRequestModal({ isOpen, onClose, userEmail }) {
  const [stage, setStage] = useState('ready');
  const [adsWatched, setAdsWatched] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [completedBlock, setCompletedBlock] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStage('ready');
      setAdsWatched(0);
      setCompletedBlock(false);
      setCountdown(15);
      setElapsedTime(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (stage === 'watching') {
      const timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setCountdown(Math.max(0, videoDuration - newTime));
          if (newTime >= videoDuration) {
            const newTotal = adsWatched + 1;
            setAdsWatched(newTotal);
            if (newTotal >= ADS_PER_BLOCK) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6366F1', '#8B5CF6', '#4338CA'] });
            }
            setStage('complete');
            return prev;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, videoDuration, adsWatched]);

  const startWatching = () => {
    const randomIndex = Math.floor(Math.random() * adVideos.length);
    setCurrentVideoIndex(randomIndex);
    setVideoDuration(15);
    setCountdown(15);
    setElapsedTime(0);
    setStage('watching');
  };

  const handleComplete = async () => {
    const newTotal = adsWatched + 1;
    setAdsWatched(newTotal);

    // Increment developer support ads in UserStats
    try {
      if (userEmail) {
        const stats = await base44.entities.UserStats.filter({ user_email: userEmail });
        if (stats.length > 0) {
          await base44.entities.UserStats.update(stats[0].id, {
            developer_support_ads: (stats[0].developer_support_ads || 0) + 1,
          });
        }
      }
    } catch (e) {
      console.error('Failed to log dev support ad:', e);
    }

    if (newTotal >= ADS_PER_BLOCK) {
      setCompletedBlock(true);
      setStage('done');
    } else {
      setStage('ready');
      setCountdown(15);
      setElapsedTime(0);
    }
  };

  const handleClose = () => {
    setStage('ready');
    setAdsWatched(0);
    setCompletedBlock(false);
    onClose();
  };

  if (!isOpen) return null;

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
          className="bg-gradient-to-b from-indigo-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-indigo-300"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-indigo-900">Support the Platform</h2>
            <button onClick={handleClose} className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-indigo-700" />
            </button>
          </div>

          {stage === 'ready' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-200 to-violet-200 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Help Keep Us Running</h3>
              <p className="text-indigo-700 text-sm mb-1">
                {completedBlock
                  ? 'That was the last ad! Thank you so much!'
                  : `Watch ${ADS_PER_BLOCK - adsWatched} ad${ADS_PER_BLOCK - adsWatched !== 1 ? 's' : ''} to support the platform`
                }
              </p>
              <p className="text-indigo-500 text-xs mb-6">
                100% of ad revenue goes to keeping the servers running
              </p>
              <Button 
                onClick={startWatching}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              >
                {completedBlock ? 'Watch Again' : 'Watch an Ad'}
              </Button>
              {adsWatched > 0 && (
                <p className="text-xs text-indigo-500 mt-3">
                  {adsWatched} / {ADS_PER_BLOCK} ads watched this session
                </p>
              )}
            </div>
          )}

          {stage === 'watching' && (
            <div className="text-center py-4">
              <div className="w-full aspect-video bg-black rounded-2xl mb-4 relative overflow-hidden">
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
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <motion.div
                  key={`progress-${currentVideoIndex}`}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 z-10"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: videoDuration, ease: 'linear' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-700">{countdown}</span>
                </div>
                <span className="text-indigo-600 text-sm">seconds remaining</span>
              </div>
              <p className="text-xs text-indigo-400">
                Ad {adsWatched + 1} of {ADS_PER_BLOCK}
              </p>
            </div>
          )}

          {stage === 'complete' && (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Thank You!</h3>
              <p className="text-indigo-700 mb-4">
                100% of this ad goes to keeping the platform running.
              </p>
              <Button 
                onClick={handleComplete}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                {adsWatched + 1 >= ADS_PER_BLOCK ? 'Finish' : 'Next Ad →'}
              </Button>
            </div>
          )}

          {stage === 'done' && (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-200 to-violet-200 rounded-full flex items-center justify-center mb-4"
              >
                <Heart className="w-12 h-12 text-indigo-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">🎉 You're a Star!</h3>
              <p className="text-indigo-700 mb-2">
                You just watched {ADS_PER_BLOCK} ads to support the platform.
              </p>
              <p className="text-indigo-500 text-sm mb-6">
                100% of the revenue keeps the servers running and helps us expand to help more dogs.
              </p>
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Back to feeding dogs 🐕
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
