import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Eye, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdWatchingModal from '../components/home/AdWatchingModal';

import { useLanguage } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ADS_PER_BLOCK = 15;
const ADS_PER_DAY = 15;
const HOURS_PER_DAY = 24;

export default function SupporterHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullThreshold = 80;
  const queryClient = useQueryClient();

  const userEmailRef = useRef(user?.email);
  useEffect(() => { userEmailRef.current = user?.email; }, [user?.email]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) {
        navigate('/Login?redirect=/Supporter');
      } else {
        setUser(u);
      }
    }).catch(() => navigate('/Login?redirect=/Supporter'));
  }, []);

  const { data: userStats, isLoading } = useQuery({
    queryKey: ['supporterStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      if (stats.length === 0 || !stats[0].registration_completed) {
        return { needsRegistration: true };
      }
      return stats[0];
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (userStats?.needsRegistration) {
      navigate('/Register?type=supporter');
    }
  }, [userStats]);

  const totalServerDays = Math.floor((userStats?.total_ads_watched || 0) / ADS_PER_DAY);
  const remainingAds = (userStats?.total_ads_watched || 0) % ADS_PER_DAY;
  const totalHoursCovered = totalServerDays * HOURS_PER_DAY + Math.floor(remainingAds * HOURS_PER_DAY / ADS_PER_DAY);
  const remainingHours = totalHoursCovered % HOURS_PER_DAY;

  const updateStatsMutation = useMutation({
    mutationFn: async () => {
      const email = userEmailRef.current;
      if (!email) {
        console.error('[Supporter mutationFn] no email');
        toast.error('Session error. Please refresh.');
        return false;
      }
      const freshStats = await base44.entities.UserStats.filter({ user_email: email });
      console.log('[Supporter mutationFn] email:', email, 'freshStats length:', freshStats.length);
      if (freshStats.length === 0) {
        console.error('[Supporter mutationFn] no stats found for email:', email);
        toast.error('Stats not found. Please refresh.');
        return false;
      }
      const s = freshStats[0];
      console.log('[Supporter mutationFn] DB read:', { id: s.id, current_progress: s.current_progress, current_target: s.current_target, total_ads_watched: s.total_ads_watched });

      const currentTarget = ADS_PER_BLOCK;
      const newProgress = (s.current_progress || 0) + 1;
      const completedBlock = newProgress >= currentTarget;
      console.log('[Supporter mutationFn] computed:', { newProgress, currentTarget, completedBlock });

      const today = new Date().toISOString().split('T')[0];

      const updates = {
        total_ads_watched: (s.total_ads_watched || 0) + 1,
        current_progress: completedBlock ? 0 : newProgress,
        last_activity_date: today,
      };

      if (completedBlock) {
        updates.current_streak = (s.current_streak || 0) + 1;
        updates.longest_streak = Math.max(s.longest_streak || 0, updates.current_streak);
        updates.current_target = ADS_PER_BLOCK;

        toast.success(`⚡ ${ADS_PER_BLOCK} ads watched — contributing to server & licensing costs!`);
      }

      console.log('[Supporter mutationFn] writing to DB:', { id: s.id, updates });
      await base44.entities.UserStats.update(s.id, updates);

      // Track dev support ads in daily_activity so dev dashboard sees it
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const existing = await base44.entities.DailyActivity.filter({ date: todayStr });
        if (existing.length > 0) {
          await base44.entities.DailyActivity.update(existing[0].id, {
            dev_support_ads: (existing[0].dev_support_ads || 0) + 1,
          });
        } else {
          await base44.entities.DailyActivity.create({
            date: todayStr,
            dev_support_ads: 1,
          });
        }
      } catch (_) {}

      return completedBlock;
    },
    onSuccess: (completedBlock) => {
      console.log('[Supporter onSuccess] completedBlock:', completedBlock);
      queryClient.setQueryData(['supporterStats', userEmailRef.current], (old) => {
        console.log('[Supporter setQueryData] old:', old);
        if (!old) return old;
        const updated = {
          ...old,
          current_progress: completedBlock ? 0 : (old.current_progress || 0) + 1,
          total_ads_watched: (old.total_ads_watched || 0) + 1,
          developer_support_ads: (old.developer_support_ads || 0) + 1,
          current_target: ADS_PER_BLOCK,
        };
        console.log('[Supporter setQueryData] new:', updated);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ['globalMealCount'] });
    },
    onError: (err) => {
      console.error('[Supporter mutation] onError:', err);
      toast.error(`Failed to save progress: ${err.message}. Check console for details.`);
    }
  });

  const handleAdComplete = async () => {
    await updateStatsMutation.mutateAsync();
  };

  const handleDevAdComplete = async () => {
    const email = userEmailRef.current;
    if (!email) return;
    const freshStats = await base44.entities.UserStats.filter({ user_email: email });
    if (freshStats.length > 0) {
      await base44.entities.UserStats.update(freshStats[0].id, {
        developer_support_ads: (freshStats[0].developer_support_ads || 0) + 1,
      });
      queryClient.invalidateQueries({ queryKey: ['supporterStats', email] });
    }
  };

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > pullThreshold && window.scrollY === 0 && !isRefreshing) {
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['supporterStats'] });
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [isRefreshing, queryClient]);

  if (!user || isLoading || userStats?.needsRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-700">Loading...</div>
      </div>
    );
  }

  const currentProgress = userStats?.current_progress || 0;
  const currentTarget = ADS_PER_BLOCK;
  const adsToNextBlock = currentTarget - currentProgress;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-50"
          >
            <div className="bg-indigo-500 text-white text-xs px-4 py-2 rounded-full shadow-lg">Refreshing...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-violet-400/20" />
        <div className="relative px-6 pt-8 pb-12 text-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => navigate('/Profile?from=supporter')}
              className="bg-white hover:bg-indigo-50 text-indigo-600 rounded-full p-3 shadow-md transition-all hover:scale-110 active:scale-95"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
            <span className="text-4xl">⚡</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-indigo-900 mb-1"
          >
            Server Supporter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-600"
          >
            Your ads keep this app running
          </motion.p>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Progress Ring Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-indigo-100"
        >
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#E0E7FF" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r="56"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentProgress / currentTarget) * 352} 352`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-indigo-900">{currentProgress}/{currentTarget}</span>
                <span className="text-xs text-indigo-500">ads watched</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-indigo-800 mb-1">
                <span className="font-semibold">{adsToNextBlock} more {adsToNextBlock === 1 ? 'ad' : 'ads'}</span> to contribute
              </p>
              <p className="text-sm text-indigo-600">Every {ADS_PER_DAY} ads = 1 day of server &amp; licensing time</p>
            </div>

            <Button
              onClick={async () => {
                await queryClient.refetchQueries({ queryKey: ['supporterStats', user?.email] });
                setShowAdModal(true);
              }}
              className="mt-6 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-6 rounded-2xl text-lg font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Ad to Support
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-indigo-100 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">Server &amp; Licensing Time</span>
            </div>
            <p className="text-3xl font-bold text-indigo-900">
              {totalServerDays > 0 ? `${totalServerDays}d ${remainingHours}h` : `${totalHoursCovered}h`}
            </p>
            <p className="text-xs text-indigo-400 mt-1">total uptime funded</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-indigo-100 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">Ads Watched</span>
            </div>
            <p className="text-3xl font-bold text-indigo-900">{userStats?.total_ads_watched || 0}</p>
            <p className="text-xs text-indigo-400 mt-1">total ads viewed</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-indigo-100 p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">Streak</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-indigo-900">{userStats?.current_streak || 0}</p>
            <p className="text-sm text-indigo-400 mb-1">blocks completed</p>
          </div>
          <div className="mt-2 bg-indigo-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full"
              style={{ width: `${Math.min((currentProgress / currentTarget) * 100, 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Impact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">⚡</div>
            <div>
              <p className="font-semibold">Your Impact</p>
              <p className="text-sm text-indigo-100">
                Every ad you watch helps keep Feed a Stray online
              </p>
            </div>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-center mb-2">
              <p className="text-xs text-indigo-100 uppercase tracking-wide mb-1">Total Server &amp; Licensing Days Funded</p>
              <p className="text-4xl font-bold text-white mb-1">
                {totalServerDays > 0
                  ? `${totalServerDays}d ${remainingHours}h`
                  : `${totalHoursCovered}h`}
              </p>
              <p className="text-sm text-indigo-100">of uptime covered ({ADS_PER_DAY} ads = 1 day)</p>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-indigo-100 mb-1">
                <span>Progress to 30 days</span>
                <span>{Math.min((totalServerDays / 30) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalServerDays / 30) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
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
        onMealComplete={() => {}}
        totalAdsWatched={userStats?.total_ads_watched || 0}
        totalMealsProvided={totalHoursCovered}
        isSupporter={true}
      />
    </div>
  );
}
