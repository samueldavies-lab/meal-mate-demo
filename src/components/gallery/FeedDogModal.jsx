import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle, Volume2, VolumeX, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';

const adVideos = [
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/d5de9302f_YTDown_YouTube_Candy-Crush-Saga-TV-Commercial_Media_gJjCGmMkAIw_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/a3de2f4a9_YTDown_YouTube_Dog-Insurance-_-Care-TV-Ad-Jan-2024-30s-_Media_c5or_ZwpoLs_001_1080p1.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/c6df8c61f_YTDown_YouTube_Freshpet-Dinner-Date-Commercial-30_Media_vp0KBkum8Ug_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/f98660d05_YTDown_YouTube_Good-Boys-Spot-Pet-Insurance_Media_MCAdCuumKmY_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/88197f568_YTDown_YouTube_Quality-Dog-Food-Just-Look-for-Our-Name_Media_w1Z4KjFhQ44_001_1080p.mp4' },
  { url: 'https://media.base44.com/videos/public/6989e83e8a88fafc135e714b/9f9d5b77a_YTDown_YouTube_Welcome-to-the-Specsavers-Vet-Specsavers_Media_I3MUX3V0aUE_001_1080p.mp4' },
];

const durations = [15, 20, 30];
const ADS_PER_MEAL = 5;

// stage: intro → watching → between → done
export default function FeedDogModal({ isOpen, onClose, dog, userEmail, userStats }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('intro');
  const [adsWatched, setAdsWatched] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [videoDuration, setVideoDuration] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const videoRef = useRef(null);

  // Load existing progress when opened
  useEffect(() => {
    if (isOpen && dog && userEmail) {
      loadOrCreateSession();
    }
  }, [isOpen, dog?.dog_id, userEmail]);

  const loadOrCreateSession = async () => {
    try {
      const sessions = await base44.entities.FeedingSession.filter({
        user_email: userEmail,
        dog_id: dog.dog_id
      });

      if (sessions.length > 0) {
        // Resume existing session
        const session = sessions[0];
        setSessionId(session.id);
        setAdsWatched(session.ads_watched);
        setStage('intro');
        setCountdown(15);
        setElapsedTime(0);
        setSaving(false);
      } else {
        // Start fresh
        const newSession = await base44.entities.FeedingSession.create({
          user_email: userEmail,
          dog_id: dog.dog_id,
          dog_name: dog.dog_name,
          ads_watched: 0,
          started_at: new Date().toISOString()
        });
        setSessionId(newSession.id);
        setAdsWatched(0);
        setStage('intro');
        setCountdown(15);
        setElapsedTime(0);
        setSaving(false);
      }
    } catch (e) {
      console.error('loadOrCreateSession error', e);
    }
  };

  // Save partial progress when modal closes without completing all ads
  useEffect(() => {
    return () => {
      if (isOpen && adsWatched > 0 && adsWatched < ADS_PER_MEAL && sessionId) {
        updateSessionProgress();
      }
    };
  }, [isOpen, adsWatched, sessionId]);

  // Countdown timer
  useEffect(() => {
    if (stage !== 'watching') return;
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        setCountdown(Math.max(0, videoDuration - next));
        if (next >= videoDuration) {
          clearInterval(timer);
          const newCount = adsWatched + 1;
          setAdsWatched(newCount);
          if (newCount >= ADS_PER_MEAL) {
            // All ads done — save meal and show done screen
            saveMeal();
          } else {
            setStage('between');
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, videoDuration, adsWatched]);

  const startNextAd = () => {
    const idx = Math.floor(Math.random() * adVideos.length);
    const dur = durations[Math.floor(Math.random() * durations.length)];
    setVideoIndex(idx);
    setVideoDuration(dur);
    setCountdown(dur);
    setElapsedTime(0);
    setStage('watching');
  };

  const updateSessionProgress = async () => {
    try {
      if (sessionId && adsWatched > 0 && adsWatched < ADS_PER_MEAL) {
        await base44.entities.FeedingSession.update(sessionId, {
          ads_watched: adsWatched
        });
      }
    } catch (e) {
      console.error('updateSessionProgress error', e);
    }
  };

  const savePartialProgress = async () => {
    try {
      if (userStats?.id && adsWatched > 0) {
        const today = new Date().toISOString().split('T')[0];
        await base44.entities.UserStats.update(userStats.id, {
          total_ads_watched: (userStats.total_ads_watched || 0) + adsWatched,
          last_activity_date: today,
        });
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
      }
    } catch (e) {
      console.error('savePartialProgress error', e);
    }
  };

  const saveMeal = async () => {
    setSaving(true);
    setStage('done');
    try {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + (48 + Math.random() * 10) * 60 * 60 * 1000);

      // Create PendingMeal for this specific dog
      await base44.entities.PendingMeal.create({
        user_email: userEmail,
        dog_id: dog.dog_id,
        dog_name: dog.dog_name,
        dog_photo: dog.photo_url || '',
        dog_country: dog.dog_country || dog.location?.split(', ')[1] || '',
        dog_city: dog.dog_city || dog.location?.split(', ')[0] || '',
        status: 'pending',
        created_at: now.toISOString(),
        delivery_scheduled_at: deliveryTime.toISOString(),
      });

      // Update UserDog meals count
      await base44.entities.UserDog.update(dog.id, {
        meals_provided: (dog.meals || 1) + 1
      });

      // Update UserStats
      if (userStats?.id) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastMealDate = userStats.last_meal_date;

        let newStreak = userStats.current_streak || 0;
        if (lastMealDate === today) {
          // already fed today — no streak change
        } else if (lastMealDate === yesterday) {
          newStreak = newStreak + 1;
        } else {
          newStreak = 1;
        }

        await base44.entities.UserStats.update(userStats.id, {
          total_ads_watched: (userStats.total_ads_watched || 0) + ADS_PER_MEAL,
          total_meals_provided: (userStats.total_meals_provided || 0) + 1,
          current_streak: newStreak,
          longest_streak: Math.max(userStats.longest_streak || 0, newStreak),
          last_meal_date: today,
          last_activity_date: today,
        });
      }

      confetti({
       particleCount: 120,
       spread: 70,
       origin: { y: 0.6 },
       colors: ['#F59E0B', '#EA580C', '#92400E', '#FCD34D']
      });

      // Delete the session since meal is complete
      if (sessionId) {
       await base44.entities.FeedingSession.delete(sessionId);
      }

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['userDogs'] });
      queryClient.invalidateQueries({ queryKey: ['allPendingMeals'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      } catch (e) {
      console.error('saveMeal error', e);
      } finally {
      setSaving(false);
      }
      };

  if (!isOpen || !dog) return null;

  const progressPct = (adsWatched / ADS_PER_MEAL) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {dog.photo_url && (
                <img src={dog.photo_url} alt={dog.dog_name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-300" />
              )}
              <div>
                <h2 className="text-lg font-bold text-amber-900">Feed {dog.dog_name}</h2>
                <p className="text-xs text-amber-600">Watch {ADS_PER_MEAL} ads to provide a meal</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-amber-600 mb-1">
              <span>{adsWatched} / {ADS_PER_MEAL} ads watched</span>
              <span>{ADS_PER_MEAL - adsWatched} remaining</span>
            </div>
            <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* INTRO */}
          {stage === 'intro' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <div className="text-5xl mb-3">🍖</div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Ready to feed {dog.dog_name}?
              </h3>
              <p className="text-sm text-amber-700 mb-6">
                Watch <strong>{ADS_PER_MEAL} short ads</strong> and we'll automatically arrange a warm meal of chicken & rice for {dog.dog_name}!
              </p>
              <Button
                onClick={startNextAd}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-5 rounded-xl text-base font-semibold shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Watching
              </Button>
            </motion.div>
          )}

          {/* WATCHING */}
          {stage === 'watching' && (
            <div className="text-center">
              <div className="w-full aspect-video bg-black rounded-2xl mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  key={videoIndex}
                  src={adVideos[videoIndex].url}
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
                  key={`progress-${videoIndex}`}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 z-10"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: videoDuration, ease: 'linear' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-700">{countdown}</span>
                </div>
                <span className="text-amber-700 text-sm">seconds remaining</span>
              </div>
            </div>
          )}

          {/* BETWEEN ADS */}
          {stage === 'between' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-amber-900 mb-1">Ad {adsWatched} of {ADS_PER_MEAL} done!</h3>
              <p className="text-sm text-amber-600 mb-5">{ADS_PER_MEAL - adsWatched} more to feed {dog.dog_name} 🐕</p>
              <Button
                onClick={startNextAd}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold"
              >
                Watch Next Ad
              </Button>
            </motion.div>
          )}

          {/* DONE */}
          {stage === 'done' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center py-6">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Meal Provided!</h3>
              <p className="text-amber-700 mb-2">
                A warm chicken & rice meal has been arranged for <strong>{dog.dog_name}</strong>!
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">⏰ Note:</span> Delivery takes up to 72 hours — feeders collate meals across users to reduce costs.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Done
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}