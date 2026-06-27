import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Utensils, Dog, Eye, Gift, User, Clock, Calendar, BarChart3, Award } from 'lucide-react';
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
import DailyDogProgress from '../components/home/DailyDogProgress';
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
  const { data: allUserDogs = [], isLoading: dogsLoading, isSuccess: dogsLoaded } = useQuery({
    queryKey: ['allUserDogs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserDog.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  // Show onboarding welcome for brand new users (registration complete but no dogs yet)
  useEffect(() => {
    if (!dogsLoading && dogsLoaded && userStats && userStats.registration_completed && allUserDogs.length === 0) {
      const key = `onboarding_shown_${user?.email}`;
      if (!localStorage.getItem(key)) {
        setShowWelcome(true);
        localStorage.setItem(key, '1');
      }
    }
  }, [userStats, allUserDogs, user, dogsLoading]);

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

  // Get all meals this user has ordered for time-based stats
  const { data: userMeals = [] } = useQuery({
    queryKey: ['userMeals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.PendingMeal.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const pendingCount = userMeals.filter(m => m.status === 'pending').length;
  const todaysMeals = userMeals.filter(m => m.status === 'delivered' && m.scheduled_date === today).length;
  const weeklyMeals = userMeals.filter(m => m.status === 'delivered' && m.scheduled_date >= weekAgo).length;
  const avgPerDogPerWeek = uniqueUserDogs.length > 0 ? (weeklyMeals / uniqueUserDogs.length).toFixed(1) : '0';

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

  // Store email in ref to avoid any closure issues with mutation callbacks
  const userEmailRef = useRef(user?.email);
  useEffect(() => { userEmailRef.current = user?.email; }, [user?.email]);
  const userStatsKey = useRef(['userStats', user?.email]);
  useEffect(() => { userStatsKey.current = ['userStats', user?.email]; }, [user?.email]);

  const handleAdComplete = async () => {
    try {
      const email = userEmailRef.current;
      if (!email) { console.error('[Home] handleAdComplete: no user email'); return false; }

      const freshStats = await base44.entities.UserStats.filter({ user_email: email });
      if (freshStats.length === 0) {
        toast.error('Could not find your stats. Try refreshing.');
        return false;
      }
      const s = freshStats[0];

      const currentTarget = s.current_target || 5;
      const newProgress = (s.current_progress || 0) + 1;
      const completedMeal = newProgress >= currentTarget;

      const today = new Date().toISOString().split('T')[0];

      const updates = {
        total_ads_watched: (s.total_ads_watched || 0) + 1,
        current_progress: completedMeal ? 0 : newProgress,
        last_activity_date: today,
      };

      if (completedMeal) {
        updates.total_meals_provided = (s.total_meals_provided || 0) + 1;

        const lastMealDate = s.last_meal_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let newStreak = s.current_streak || 0;
        if (lastMealDate === today) {
        } else if (lastMealDate === yesterday) {
          newStreak = newStreak + 1;
        } else {
          newStreak = 1;
        }

        updates.current_streak = newStreak;
        updates.longest_streak = Math.max(s.longest_streak || 0, newStreak);
        updates.current_target = generateAdsTarget();

        if ((s.total_ads_watched || 0) + 1 === 5) {
          await checkAndCompleteReferral();
        }
      }

      await base44.entities.UserStats.update(s.id, updates);

      // Track every ad in daily_activity so the dev dashboard chart reflects it
      base44.entities.DailyActivity.filter({ date: today }).then(existing => {
        if (existing.length > 0) {
          base44.entities.DailyActivity.update(existing[0].id, {
            ads_watched: (existing[0].ads_watched || 0) + 1,
          }).catch(e => console.warn('[Home] daily_activity update failed:', e));
        } else {
          base44.entities.DailyActivity.create({
            date: today,
            ads_watched: 1,
          }).catch(e => console.warn('[Home] daily_activity create failed:', e));
        }
      }).catch(e => console.warn('[Home] daily_activity filter failed:', e));

      queryClient.setQueryData(userStatsKey.current, (old) => {
        if (!old) return old;
        return {
          ...old,
          current_progress: completedMeal ? 0 : newProgress,
          total_ads_watched: updates.total_ads_watched,
          total_meals_provided: completedMeal
            ? (old.total_meals_provided || 0) + 1
            : old.total_meals_provided,
          current_target: completedMeal ? generateAdsTarget() : old.current_target,
          current_streak: completedMeal ? (updates.current_streak ?? old.current_streak) : old.current_streak,
          longest_streak: completedMeal ? (updates.longest_streak ?? old.longest_streak) : old.longest_streak,
          last_meal_date: completedMeal ? today : old.last_meal_date,
        };
      });

      if (completedMeal) {
        queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
      }

      return completedMeal;
    } catch (error) {
      console.error('[Home] handleAdComplete error:', error);
      toast.error(`Failed to save progress: ${error.message}`);
      return false;
    }
  };

  const handleDevAdComplete = async () => {
    const email = userEmailRef.current;
    const freshStats = await base44.entities.UserStats.filter({ user_email: email });
    if (freshStats.length > 0) {
      await base44.entities.UserStats.update(freshStats[0].id, {
        developer_support_ads: (freshStats[0].developer_support_ads || 0) + 1,
      });
      // Track dev support ads in daily_activity so chart reflects them
      const todayStr = new Date().toISOString().split('T')[0];
      base44.entities.DailyActivity.filter({ date: todayStr }).then(existing => {
        if (existing.length > 0) {
          base44.entities.DailyActivity.update(existing[0].id, {
            dev_support_ads: (existing[0].dev_support_ads || 0) + 1,
          }).catch(e => console.warn('[Home] dev_support daily_activity update failed:', e));
        } else {
          base44.entities.DailyActivity.create({
            date: todayStr,
            dev_support_ads: 1,
          }).catch(e => console.warn('[Home] dev_support daily_activity create failed:', e));
        }
      }).catch(e => console.warn('[Home] dev_support daily_activity filter failed:', e));
    }
  };

  const updateStatsMutation = useMutation({
    mutationFn: handleAdComplete,
  });

  const handleMealComplete = () => {
    setShowDogSelection(true);
  };

  const handleDogSelected = async (dog) => {
    setShowDogSelection(false);
    queryClient.invalidateQueries({ queryKey: ['allUserDogs'] });

    const latestStats = queryClient.getQueryData(['userStats', user?.email]);
    if (latestStats?.id) {
      try {
        await base44.entities.UserStats.update(latestStats.id, { current_progress: 0 });
      } catch (e) {}
    }

    queryClient.setQueryData(['userStats', user?.email], (old) => {
      if (!old) return old;
      return { ...old, current_progress: 0 };
    });
    queryClient.invalidateQueries({ queryKey: ['userStats', user?.email] });
    queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
    queryClient.invalidateQueries({ queryKey: ['userMeals', user?.email] });
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
  const totalDogsNeedingMeals = uniqueUserDogs.length;
  const dogsFedToday = fedDogIdsToday.length;
  const overallAdTarget = totalDogsNeedingMeals * currentTarget;
  const overallAdProgress = Math.min(dogsFedToday * currentTarget + currentProgress, overallAdTarget);

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
              onClick={async () => {
                await queryClient.refetchQueries({ queryKey: ['userStats', user?.email] });
                setShowAdModal(true);
              }}
              className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 rounded-2xl text-lg font-semibold shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('home_watch_ad')}
            </Button>
          </div>
        </motion.div>

        {/* Overall ad progress toward feeding all dogs */}
        {totalDogsNeedingMeals > 0 && (
          <DailyDogProgress
            current={overallAdProgress}
            target={overallAdTarget}
            dogsFed={dogsFedToday}
            totalDogs={totalDogsNeedingMeals}
            onAdopt={() => queryClient.invalidateQueries({ queryKey: ['allUserDogs', user?.email] })}
            excludeDogIds={uniqueUserDogs.map(d => d.dog_id)}
          />
        )}

        {/* Meal Stats Grid */}
        <div className="mb-4">
          <StatsCard
            icon={Utensils}
            label="meals provided"
            value={todaysMeals}
            subtext="today (delivered after 24-72h)"
            delay={0.28}
          />
        </div>

        {/* Pending Meals */}
        <PendingMealsNotification userEmail={user?.email} />

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatsCard
            icon={Calendar}
            label="This Week"
            value={weeklyMeals}
            subtext="meals delivered"
            delay={0.35}
          />
          <StatsCard
            icon={BarChart3}
            label="Avg/Dog/Week"
            value={avgPerDogPerWeek}
            subtext={`across ${uniqueUserDogs.length} dogs`}
            delay={0.4}
          />
          <StatsCard
            icon={Award}
            label="All Time"
            value={userStats?.total_meals_provided || 0}
            subtext="total meals delivered"
            delay={0.45}
          />
        </div>

        <StatsCard
              icon={Eye}
              label={t('home_ads_watched')}
              value={userStats?.total_ads_watched || 0}
              subtext={t('home_total_views')}
          delay={0.5}
        />

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
        onDevAdComplete={handleDevAdComplete}
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