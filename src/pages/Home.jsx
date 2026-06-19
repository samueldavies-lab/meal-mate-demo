import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Dog, Eye, Gift, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProgressRing from '../components/home/ProgressRing';
import StatsCard from '../components/home/StatsCard';
import AdWatchingModal from '../components/home/AdWatchingModal';
import DogSelectionModal from '../components/home/DogSelectionModal';
import ReferralModal from '../components/home/ReferralModal';
import BulkDogSelectionModal from '../components/home/BulkDogSelectionModal';
import StreakTracker from '../components/home/StreakTracker';
import PendingMealsNotification from '../components/home/PendingMealsNotification';
import FirstTimeWelcomeModal from '../components/onboarding/FirstTimeWelcomeModal';
import AdoptionMapModal from '../components/onboarding/AdoptionMapModal';
import AdoptionSuccessModal from '../components/onboarding/AdoptionSuccessModal';


import confetti from 'canvas-confetti';
import { useLanguage } from '@/lib/LanguageContext';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullThreshold = 80;
  const [showDogSelection, setShowDogSelection] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBulkDogModal, setShowBulkDogModal] = useState(false);
  const [mealsToday, setMealsToday] = useState(0);
  const queryClient = useQueryClient();

  // Onboarding flow
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAdoptionMap, setShowAdoptionMap] = useState(false);
  const [showAdoptionSuccess, setShowAdoptionSuccess] = useState(false);
  const [newlyAdoptedDogs, setNewlyAdoptedDogs] = useState([]);



  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) {
        navigate('/');
      } else {
        setUser(u);
      }
    }).catch(() => navigate('/'));
  }, []);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && user?.email) {
      handleReferralSignup(refCode);
    }
  }, [user]);

  const { data: userStats, isLoading } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      if (stats.length === 0 || !stats[0].registration_completed) {
        return { needsRegistration: true };
      }
      return stats[0];
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (userStats?.needsRegistration) {
      navigate('/Register');
    }
  }, [userStats]);

  // Get all user's dogs
  const { data: allUserDogs = [] } = useQuery({
    queryKey: ['allUserDogs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserDog.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  // Show onboarding welcome for brand new users (registration complete but no dogs yet)
  useEffect(() => {
    if (userStats && userStats.registration_completed && allUserDogs.length === 0) {
      const key = `onboarding_shown_${user?.email}`;
      if (!localStorage.getItem(key)) {
        setShowWelcome(true);
        localStorage.setItem(key, '1');
      }
    }
  }, [userStats, allUserDogs, user]);

  // Deduplicate allUserDogs by dog_id (keep one record per unique dog)
  const today = new Date().toISOString().split('T')[0];
  const uniqueUserDogs = Object.values(
    allUserDogs.reduce((acc, dog) => {
      if (!acc[dog.dog_id]) acc[dog.dog_id] = dog;
      return acc;
    }, {})
  );

  // Determine which dogs have been fed today via last_fed_date
  const fedDogIdsToday = uniqueUserDogs.filter(d => d.last_fed_date === today).map(d => d.id);
  const unfedDogsToday = uniqueUserDogs.filter(dog => !fedDogIdsToday.includes(dog.id));

  // Get global meal count from all users + pending meals
  const { data: globalMealCount = 0 } = useQuery({
    queryKey: ['globalMealCount'],
    queryFn: async () => {
      const allStats = await base44.entities.UserStats.list();
      const providedMeals = allStats.reduce((total, stat) => total + (stat.total_meals_provided || 0), 0);
      const allPending = await base44.entities.PendingMeal.filter({ status: 'pending' });
      return providedMeals + allPending.length;
    },
    refetchInterval: 30000
  });

  const generateAdsTarget = () => 5;

  const handleReferralSignup = async (refCode) => {
    try {
      // Check if referral already exists
      const existingReferral = await base44.entities.Referral.filter({ 
        referee_email: user.email 
      });
      
      if (existingReferral.length > 0) return; // Already used a referral
      
      // Create pending referral
      await base44.entities.Referral.create({
        referrer_email: refCode.split(/[0-9]/)[0] + '@temp.com', // Will be updated when we find the actual referrer
        referee_email: user.email,
        referral_code: refCode,
        status: 'pending'
      });
      
      toast.success('🎉 Welcome! Complete your first meal to unlock 5 bonus meals!');
    } catch (error) {
      console.error('Referral signup error:', error);
    }
  };

  const updateStatsMutation = useMutation({
    mutationFn: async () => {
      const currentTarget = userStats.current_target || 5;
      const newProgress = userStats.current_progress + 1;
      const completedMeal = newProgress >= currentTarget;
      
      const today = new Date().toISOString().split('T')[0];

      const updates = {
        total_ads_watched: (userStats.total_ads_watched || 0) + 1,
        current_progress: completedMeal ? 0 : newProgress,
        last_activity_date: today,
      };

      if (completedMeal) {
        // Only update streak when a meal is actually completed
        const lastMealDate = userStats.last_meal_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let newStreak = userStats.current_streak || 0;
        if (lastMealDate === today) {
          // Already completed a meal today — no streak change
        } else if (lastMealDate === yesterday) {
          // Consecutive day — extend streak
          newStreak = newStreak + 1;
        } else {
          // Streak broken or first meal ever — start fresh
          newStreak = 1;
        }

        updates.current_streak = newStreak;
        updates.longest_streak = Math.max(userStats.longest_streak || 0, newStreak);
        updates.last_meal_date = today;
        updates.total_meals_provided = (userStats.total_meals_provided || 0) + 1;
        updates.current_target = generateAdsTarget();
        
        // Check if this is first meal and user was referred
        if ((userStats.total_meals_provided || 0) + 1 === 1) {
          await checkAndCompleteReferral();
        }
      }

      await base44.entities.UserStats.update(userStats.id, updates);
      return completedMeal;
    },
    onSuccess: (completedMeal) => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      if (completedMeal) {
        queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
      }
    }
  });

  const handleAdComplete = () => {
    updateStatsMutation.mutate();
  };

  const handleMealComplete = () => {
    setShowDogSelection(true);
  };

  const handleDogSelected = (dog) => {
    setShowDogSelection(false);
    queryClient.invalidateQueries({ queryKey: ['allUserDogs'] });
    queryClient.setQueryData(['userStats', user?.email], (old) => {
      if (!old) return old;
      return { ...old, current_progress: 0 };
    });
    queryClient.invalidateQueries({ queryKey: ['userStats', user?.email] });
    queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
    
    // Check if all dogs are fed today
    setTimeout(() => {
      const updatedUnfedDogs = uniqueUserDogs.filter(d => d.last_fed_date !== today);
      if (uniqueUserDogs.length > 0 && updatedUnfedDogs.length === 0) {
        setShowDogSelection(false);
        navigate('/StrayMap');
      }
    }, 100);
  };

  const checkAndCompleteReferral = async () => {
    try {
      // Find pending referral for this user
      const referrals = await base44.entities.Referral.filter({ 
        referee_email: user.email,
        status: 'pending'
      });
      
      if (referrals.length > 0) {
        const referral = referrals[0];
        
        // Find referrer by their referral code pattern
        const allUsers = await base44.entities.UserStats.list();
        const referrer = allUsers.find(u => {
          const potentialCode = u.user_email.split('@')[0] + referral.referral_code.slice(-4);
          return potentialCode === referral.referral_code;
        });
        
        if (referrer) {
          // Update referral to completed
          await base44.entities.Referral.update(referral.id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            bonus_meals_granted: 5,
            referrer_email: referrer.user_email
          });
          
          // Show bulk dog selection for both users
          toast.success('🎁 Referral bonus unlocked! Select 5 dogs to feed!');
          setShowBulkDogModal(true);
        }
      }
    } catch (error) {
      console.error('Referral completion error:', error);
    }
  };

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > pullThreshold && window.scrollY === 0 && !isRefreshing) {
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['allUserDogs'] });
      queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [isRefreshing, queryClient]);

  if (!user || isLoading || userStats?.needsRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-700">{t('home_loading')}</div>
      </div>
    );
  }

  const currentProgress = userStats?.current_progress || 0;
  const currentTarget = userStats?.current_target || 5;
  const adsToNextMeal = currentTarget - currentProgress;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-50"
          >
            <div className="bg-amber-500 text-white text-xs px-4 py-2 rounded-full shadow-lg">
              {t('home_refreshing')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-12 text-center">
          {/* Profile Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => navigate('/Profile')}
              aria-label={t('home_view_profile')}
              className="bg-white hover:bg-amber-50 text-amber-600 rounded-full p-3 shadow-md transition-all hover:scale-110 active:scale-95"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <span className="text-4xl">🐕</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-amber-900 mb-1"
          >
            {t('home_welcome_back', { name: user.full_name?.split(' ')[0] || 'Hero' })}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-700"
          >
            {t('home_subtitle')}
          </motion.p>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Progress Ring Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-amber-100"
        >
          <div className="flex flex-col items-center">
            <ProgressRing progress={currentProgress} target={currentTarget} />
            
            <div className="mt-6 text-center">
              <p className="text-amber-800 mb-1">
                <span className="font-semibold">{adsToNextMeal} {t('home_ad_unit', { count: adsToNextMeal })}</span> {t('home_until_next_meal')}
              </p>
              <p className="text-sm text-amber-600">{t('home_meal_description')}</p>
            </div>

            <Button
              onClick={() => setShowAdModal(true)}
              className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 rounded-2xl text-lg font-semibold shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('home_watch_ad')}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div onClick={() => navigate('/Gallery')} className="cursor-pointer">
            <StatsCard
              icon={Utensils}
              label={t('home_meals_provided')}
              value={userStats?.total_meals_provided || 0}
              subtext={t('home_chicken_rice')}
              delay={0.3}
            />
          </div>
          <div onClick={() => navigate('/Gallery')} className="cursor-pointer">
            <StatsCard
              icon={Dog}
              label={t('home_dogs_fed')}
              value={uniqueUserDogs.length}
              subtext={t('home_unique_dogs')}
              delay={0.4}
            />
          </div>
        </div>

        <StatsCard
              icon={Eye}
              label={t('home_ads_watched')}
              value={userStats?.total_ads_watched || 0}
              subtext={t('home_total_views')}
          delay={0.5}
        />

        {/* Pending Meals */}
        <PendingMealsNotification userEmail={user?.email} />

        {/* Streak Tracker */}
        <div className="mt-4">
          <StreakTracker 
            currentStreak={userStats?.current_streak || 0} 
            longestStreak={userStats?.longest_streak || 0}
          />
        </div>

        {/* Referral Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Button
            onClick={() => setShowReferralModal(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 py-6 rounded-2xl text-lg font-semibold shadow-lg"
          >
            <Gift className="w-5 h-5 mr-2" />
            {t('home_refer_friends')}
          </Button>
        </motion.div>



        {/* Motivation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">💝</div>
            <div>
              <p className="font-semibold">{t('home_making_diff')}</p>
              <p className="text-sm text-amber-100">
                {t('home_together')}
              </p>
            </div>
          </div>
          
          {/* Global Counter */}
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-center mb-2">
              <p className="text-xs text-amber-100 uppercase tracking-wide mb-1">{t('home_global_impact')}</p>
              <motion.p 
                key={globalMealCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-white mb-1"
              >
                {(globalMealCount + 2083).toLocaleString()}
              </motion.p>
              <p className="text-sm text-amber-100">{t('home_meals_fed')}</p>
            </div>
            
            {/* Progress to 1M */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-amber-100 mb-1">
                <span>{t('home_progress_goal')}</span>
                <span>{((globalMealCount / 1000000) * 100).toFixed(2)}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((globalMealCount / 1000000) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-xs text-amber-100 text-center mt-2">
                {t('home_target')}: <strong>1,000,000 {t('home_meals')}</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>



      <AdWatchingModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        currentProgress={currentProgress}
        currentTarget={currentTarget}
        onMealComplete={handleMealComplete}
        totalAdsWatched={userStats?.total_ads_watched || 0}
      />

      <DogSelectionModal
        isOpen={showDogSelection}
        onClose={() => setShowDogSelection(false)}
        onDogSelected={handleDogSelected}
        userEmail={user?.email}
        userDogs={uniqueUserDogs}
        fedTodayIds={fedDogIdsToday}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        userEmail={user?.email}
      />

      <BulkDogSelectionModal
        isOpen={showBulkDogModal}
        onClose={() => setShowBulkDogModal(false)}
        userEmail={user?.email}
        mealCount={5}
      />

      {/* First-time onboarding flow */}
      <FirstTimeWelcomeModal
        isOpen={showWelcome}
        onGoToMap={() => { setShowWelcome(false); setShowAdoptionMap(true); }}
      />

      <AdoptionMapModal
        isOpen={showAdoptionMap}
        userEmail={user?.email}
        onComplete={(dogs) => {
          setNewlyAdoptedDogs(dogs || []);
          setShowAdoptionMap(false);
          setShowAdoptionSuccess(true);
        }}
      />

      <AdoptionSuccessModal
        isOpen={showAdoptionSuccess}
        dogs={newlyAdoptedDogs}
        onClose={async () => {
          // Mark registration as complete after adoption
          if (userStats && !userStats.needsRegistration) {
            try {
              const stats = await base44.entities.UserStats.filter({ user_email: user?.email });
              if (stats.length > 0) {
                await base44.entities.UserStats.update(stats[0].id, {
                  registration_completed: true
                });
              }
            } catch (error) {
              console.error('Error marking registration complete:', error);
            }
          }
          setShowAdoptionSuccess(false);
        }}
      />

    </div>
  );
}