import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Award, Check, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const rewardMilestones = [
  {
    meals: 7,
    title: "Perfect Feeding Week",
    description: "You fed a dog every day this week! 🎉",
    icon: "🏆",
    color: "from-amber-400 to-orange-400"
  },
  {
    meals: 50,
    title: "Special Snack & Treat",
    description: "Nutritious treats delivered to your dog",
    icon: "🍖",
    color: "from-pink-400 to-rose-400"
  },
  {
    meals: 100,
    title: "Reflective Safety Collar",
    description: "Reduces nighttime traffic accidents - keeps your dog safe",
    icon: "✨",
    color: "from-blue-400 to-cyan-400"
  },
  {
    meals: 150,
    title: "Rabies Vaccine",
    description: "Life-saving rabies vaccination for your dog",
    icon: "💉",
    color: "from-emerald-400 to-green-400"
  },
  {
    meals: 250,
    title: "Premium Wellness Kit",
    description: "Grooming supplies & health essentials",
    icon: "🎁",
    color: "from-purple-400 to-violet-400"
  },
  {
    meals: 350,
    title: "Full Veterinary Checkup",
    description: "Complete health examination & care",
    icon: "🏥",
    color: "from-teal-400 to-cyan-400"
  },
  {
    meals: 500,
    title: "Guardian Angel Package",
    description: "Full vaccination series & medical support",
    icon: "🛡️",
    color: "from-indigo-400 to-blue-400"
  },
  {
    meals: 1000,
    title: "Hero of Strays",
    description: "Lifetime care sponsor & community champion",
    icon: "🌟",
    color: "from-yellow-400 to-amber-400"
  }
];

export default function Leaderboard() {
  const [user, setUser] = useState(null);

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

  const totalMeals = userStats?.total_meals_provided || 0;
  const nextMilestone = rewardMilestones.find(m => m.meals > totalMeals);
  const mealsToNext = nextMilestone ? nextMilestone.meals - totalMeals : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Dog Rewards</h1>
              <p className="text-amber-700 text-sm">Unlock special gifts as you feed more dogs</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-amber-100">Total Meals Provided</p>
              <p className="text-3xl font-bold">{totalMeals}</p>
            </div>
            <Award className="w-12 h-12 text-white/30" />
          </div>
          {nextMilestone && (
            <>
              <div className="bg-white/20 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((totalMeals % nextMilestone.meals) / nextMilestone.meals) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-sm text-amber-100">
                {mealsToNext} more meal{mealsToNext !== 1 ? 's' : ''} to unlock: {nextMilestone.title}
              </p>
            </>
          )}
        </motion.div>

        {/* Rewards List */}
        <div className="space-y-4">
          {rewardMilestones.map((milestone, index) => {
            const isUnlocked = totalMeals >= milestone.meals;
            const isNext = nextMilestone?.meals === milestone.meals;
            
            return (
              <motion.div
                key={milestone.meals}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                  isUnlocked 
                    ? 'bg-white border-green-200 shadow-md' 
                    : isNext
                    ? 'bg-white border-amber-300 shadow-sm'
                    : 'bg-white/50 border-amber-100'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
                )}
                
                <div className="p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${milestone.color} ${!isUnlocked && 'grayscale opacity-50'}`}>
                    {milestone.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isUnlocked ? 'text-amber-900' : 'text-amber-600'}`}>
                        {milestone.title}
                      </h3>
                      {isUnlocked && (
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Unlocked
                        </div>
                      )}
                    </div>
                    <p className={`text-sm ${isUnlocked ? 'text-amber-700' : 'text-amber-500'}`}>
                      {milestone.description}
                    </p>
                  </div>

                  {/* Milestone Badge */}
                  <div className="text-right">
                    {isUnlocked ? (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Lock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-amber-600">{milestone.meals}</p>
                        <p className="text-[10px] text-amber-500">meals</p>
                      </div>
                    )}
                  </div>
                </div>

                {isNext && (
                  <div className="bg-amber-50 px-4 py-2 border-t border-amber-100">
                    <p className="text-xs text-amber-700 text-center">
                      ⭐ Next reward: {mealsToNext} meal{mealsToNext !== 1 ? 's' : ''} away!
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100"
        >
          <p className="text-sm text-amber-700 text-center">
            💝 Every meal you provide brings you closer to unlocking rewards for your dogs! From weekly achievements to life-saving vaccines, each milestone helps keep your dogs healthy, safe, and happy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}