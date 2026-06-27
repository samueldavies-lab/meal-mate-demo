import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Plus, Minus, Dog, MapPin, CheckCircle2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MilestoneCelebration from '../components/rewards/MilestoneCelebration';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const rewardMilestones = [
  { key: "snack_treat",       meals: 50,   title: "Special Snack & Treat",    description: "Nutritious treats delivered to your dog",                              icon: "🍖", color: "from-pink-400 to-rose-400" },
  { key: "deworming",         meals: 75,   title: "Deworming Treatment",       description: "Vitally important to ensure dogs maximise nutrition from their meals", icon: "💊", color: "from-lime-400 to-green-400" },
  { key: "safety_collar",     meals: 100,  title: "Reflective Safety Collar",  description: "Reduces nighttime traffic accidents - keeps your dog safe",            icon: "✨", color: "from-blue-400 to-cyan-400" },
  { key: "rabies_vaccine",    meals: 150,  title: "Rabies Vaccine",            description: "Life-saving rabies vaccination for your dog",                          icon: "💉", color: "from-emerald-400 to-green-400" },
  { key: "wellness_kit",      meals: 250,  title: "Premium Wellness Kit",      description: "Grooming supplies & health essentials",                                icon: "🎁", color: "from-purple-400 to-violet-400" },
  { key: "vet_checkup",       meals: 350,  title: "Full Veterinary Checkup",   description: "Complete health examination & care",                                   icon: "🏥", color: "from-teal-400 to-cyan-400" },
  { key: "guardian_angel",    meals: 500,  title: "Guardian Angel Package",    description: "Full vaccination series & medical support",                            icon: "🛡️", color: "from-indigo-400 to-blue-400" },
  { key: "hero_of_strays",    meals: 1000, title: "Hero of Strays",            description: "Lifetime care sponsor & community champion",                           icon: "🌟", color: "from-yellow-400 to-amber-400" },
];

const POINTS_PER_MEAL = 5;

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [celebrationMilestone, setCelebrationMilestone] = useState(null);
  // allocating: { reward } — which reward the user is currently adding points to
  const [allocating, setAllocating] = useState(null);
  const [allocAmount, setAllocAmount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // completedReward: when a reward just completed, ask which dog it's for
  const [completedReward, setCompletedReward] = useState(null);
  const [selectedDogForComplete, setSelectedDogForComplete] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  // Global pool allocations (not per dog — we accumulate towards the reward, then assign dog on completion)
  const { data: allocations = [], refetch: refetchAllocations } = useQuery({
    queryKey: ['rewardAllocations', user?.email],
    queryFn: () => base44.entities.RewardAllocation.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: userDogs = [] } = useQuery({
    queryKey: ['userDogsUnique', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const dogs = await base44.entities.UserDog.filter({ user_email: user.email });
      const map = {};
      for (const d of dogs) { if (!map[d.dog_id]) map[d.dog_id] = d; }
      return Object.values(map);
    },
    enabled: !!user?.email
  });

  const totalMeals = userStats?.total_meals_provided || 0;
  const totalPoints = totalMeals * POINTS_PER_MEAL;
  // Points spent = sum of all active (not-completed, or in-progress) allocations
  const totalSpent = allocations.reduce((sum, a) => sum + (a.meals_allocated || 0), 0);
  const availablePoints = Math.max(0, totalPoints - totalSpent);

  // Get the active (latest non-completed or current) allocation for a reward key
  const getActiveAlloc = (rewardKey) =>
    allocations.find(a => a.reward_key === rewardKey && !a.is_completed) || null;

  // Completed count for a reward key
  const getCompletedCount = (rewardKey) =>
    allocations.filter(a => a.reward_key === rewardKey && a.is_completed).length;

  const openAllocate = (reward) => {
    setAllocating(reward);
    setAllocAmount(Math.min(5, availablePoints));
  };

  const handleAllocate = async () => {
    if (!allocating || !user?.email || allocAmount <= 0) return;
    setIsSubmitting(true);
    try {
      const rewardKey = allocating.key;
      const existing = getActiveAlloc(rewardKey);
      const newTotal = (existing?.meals_allocated || 0) + allocAmount;
      const isCompleted = newTotal >= allocating.meals;

      if (existing) {
        await base44.entities.RewardAllocation.update(existing.id, {
          meals_allocated: newTotal,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        });
      } else {
        await base44.entities.RewardAllocation.create({
          user_email: user.email,
          dog_id: '',
          dog_name: '',
          reward_key: rewardKey,
          reward_title: allocating.title,
          meals_allocated: allocAmount,
          reward_cost: allocating.meals,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        });
      }

      await refetchAllocations();
      queryClient.invalidateQueries({ queryKey: ['rewardAllocations', user?.email] });
      setAllocating(null);

      if (isCompleted) {
        setCompletedReward(allocating);
        setSelectedDogForComplete(null);
      }
    } catch (e) {
      console.error('Failed to allocate points:', e);
      toast.error('Failed to save allocation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDogToReward = async () => {
    if (!completedReward || !selectedDogForComplete || !user?.email) return;
    setIsSubmitting(true);
    try {
      // Find the completed allocation record and update with dog info
      const rewardKey = completedReward.key;
      const completedAlloc = allocations.find(a => a.reward_key === rewardKey && a.is_completed && (!a.dog_id || a.dog_id === ''));
      if (completedAlloc) {
        await base44.entities.RewardAllocation.update(completedAlloc.id, {
          dog_id: selectedDogForComplete.dog_id,
          dog_name: selectedDogForComplete.dog_name
        });
      }
      await refetchAllocations();
      queryClient.invalidateQueries(['rewardAllocations', user?.email]);
      setCelebrationMilestone(completedReward);
      setCompletedReward(null);
      setSelectedDogForComplete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      <MilestoneCelebration milestone={celebrationMilestone} onClose={() => setCelebrationMilestone(null)} />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Dog Rewards</h1>
              <p className="text-amber-700 text-sm">Allocate points to unlock real rewards</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 space-y-5">
        {/* Points Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-amber-100">Available Points</p>
              <p className="text-5xl font-bold">{availablePoints}</p>
            </div>
            <Star className="w-12 h-12 text-white/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{totalPoints}</p>
              <p className="text-xs text-amber-100">Total earned</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{totalSpent}</p>
              <p className="text-xs text-amber-100">Spent on rewards</p>
            </div>
          </div>
          <p className="text-xs text-amber-200 mt-3 text-center">1 meal watched = {POINTS_PER_MEAL} points</p>
        </motion.div>

        {/* Rewards List */}
        <div>
          <h3 className="text-base font-bold text-amber-900 mb-3">All Rewards</h3>
          <div className="space-y-3">
            {rewardMilestones.map((reward, i) => {
              const activeAlloc = getActiveAlloc(reward.key);
              const allocated = activeAlloc?.meals_allocated || 0;
              const completedCount = getCompletedCount(reward.key);
              const pct = Math.min(100, (allocated / reward.meals) * 100);
              const canSpend = availablePoints > 0;

              return (
                <motion.div
                  key={reward.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${reward.color} flex-shrink-0`}>
                      {reward.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-amber-900 text-sm">{reward.title}</p>
                        {completedCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ {completedCount}x completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-600 mt-0.5 line-clamp-1">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 bg-amber-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-2 rounded-full bg-amber-500"
                          />
                        </div>
                        <span className="text-xs text-amber-600 whitespace-nowrap">{allocated}/{reward.meals} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openAllocate(reward)}
                      disabled={!canSpend}
                      className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                        canSpend
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow'
                          : 'bg-amber-100 text-amber-300 cursor-not-allowed'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Allocate Points Modal */}
      <AnimatePresence>
        {allocating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4"
            onClick={() => setAllocating(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-amber-900">Allocate Points</h3>
                <button onClick={() => setAllocating(null)} className="p-1 hover:bg-amber-100 rounded-full">
                  <X className="w-5 h-5 text-amber-700" />
                </button>
              </div>
              <div className="text-center mb-5">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${allocating.color} mb-3`}>
                  {allocating.icon}
                </div>
                <p className="font-semibold text-amber-900">{allocating.title}</p>
                <p className="text-xs text-amber-500 mt-1">Costs {allocating.meals} pts total · {availablePoints} pts available</p>
                {(() => {
                  const active = getActiveAlloc(allocating.key);
                  const already = active?.meals_allocated || 0;
                  return already > 0 ? (
                    <p className="text-xs text-amber-600 mt-1">{already} pts already allocated</p>
                  ) : null;
                })()}
              </div>
              {(() => {
                const active = getActiveAlloc(allocating.key);
                const already = active?.meals_allocated || 0;
                const needed = allocating.meals - already;
                return needed > 0 ? (
                  <p className="text-xs text-amber-600 text-center mb-1">
                    {needed > availablePoints ? `Need ${needed} pts total — watch more ads to earn ${needed - availablePoints} more` : `Allocate at least ${needed} pts to unlock this reward`}
                  </p>
                ) : null;
              })()}
              <p className="text-sm font-medium text-amber-800 text-center mb-3">How many points to allocate?</p>
              <div className="flex items-center justify-center gap-6 mb-5">
                <button
                  onClick={() => setAllocAmount(a => Math.max(1, a - 5))}
                  className="w-12 h-12 rounded-full border-2 border-amber-200 flex items-center justify-center hover:bg-amber-50"
                >
                  <Minus className="w-5 h-5 text-amber-700" />
                </button>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-800">{allocAmount}</span>
                </div>
                <button
                  onClick={() => setAllocAmount(a => Math.min(availablePoints, a + 5))}
                  className="w-12 h-12 rounded-full border-2 border-amber-200 flex items-center justify-center hover:bg-amber-50"
                >
                  <Plus className="w-5 h-5 text-amber-700" />
                </button>
              </div>
              <Button
                onClick={handleAllocate}
                disabled={isSubmitting || allocAmount > availablePoints || allocAmount <= 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-5 rounded-xl font-semibold"
              >
                {isSubmitting ? 'Allocating...' : `Allocate ${allocAmount} points`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Completed — Pick a Dog Modal */}
      <AnimatePresence>
        {completedReward && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-amber-900">Reward Unlocked!</h3>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${completedReward.color} my-3`}>
                  {completedReward.icon}
                </div>
                <p className="font-semibold text-amber-900">{completedReward.title}</p>
                <p className="text-sm text-amber-600 mt-1">Which dog should receive this reward?</p>
              </div>

              {userDogs.length === 0 ? (
                <p className="text-center text-amber-500 text-sm py-4">Feed a dog first to assign rewards!</p>
              ) : (
                <div className="space-y-2 mb-5">
                  {userDogs.map(dog => {
                    const isSelected = selectedDogForComplete?.dog_id === dog.dog_id;
                    return (
                      <button
                        key={dog.dog_id}
                        onClick={() => setSelectedDogForComplete(dog)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected ? 'border-amber-500 bg-amber-50' : 'border-amber-100 hover:border-amber-300'
                        }`}
                      >
                        {dog.dog_photo ? (
                          <img src={dog.dog_photo} alt={dog.dog_name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Dog className="w-6 h-6 text-amber-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900">{dog.dog_name}</p>
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <MapPin className="w-3 h-3" />
                            <span>{dog.dog_city}, {dog.dog_country}</span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={handleAssignDogToReward}
                disabled={!selectedDogForComplete || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-5 rounded-xl font-semibold"
              >
                {isSubmitting ? 'Saving...' : `Assign to ${selectedDogForComplete?.dog_name || '...'}! 🐾`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}