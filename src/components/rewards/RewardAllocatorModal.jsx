import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Dog, Plus, Minus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RewardAllocatorModal({ isOpen, onClose, userEmail, availablePoints, rewardMilestones }) {
  const [step, setStep] = useState('select-dog'); // select-dog | select-reward | set-amount
  const [selectedDog, setSelectedDog] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [amount, setAmount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: userDogs = [] } = useQuery({
    queryKey: ['userDogsUnique', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const dogs = await base44.entities.UserDog.filter({ user_email: userEmail });
      const map = {};
      for (const d of dogs) {
        if (!map[d.dog_id]) map[d.dog_id] = d;
      }
      return Object.values(map);
    },
    enabled: !!userEmail && isOpen
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ['rewardAllocations', userEmail],
    queryFn: () => base44.entities.RewardAllocation.filter({ user_email: userEmail }),
    enabled: !!userEmail && isOpen
  });

  const getAllocatedForDogReward = (dogId, rewardKey) => {
    return allocations.find(a => a.dog_id === dogId && a.reward_key === rewardKey);
  };

  const handleAllocate = async () => {
    if (!selectedDog || !selectedReward || amount <= 0) return;
    if (amount > availablePoints) {
      toast.error('Not enough meal points!');
      return;
    }
    setIsSubmitting(true);
    try {
      const rewardKey = `${selectedReward.title.toLowerCase().replace(/\s+/g, '_')}_${selectedReward.meals}`;
      const existing = getAllocatedForDogReward(selectedDog.dog_id, rewardKey);
      const newTotal = (existing?.meals_allocated || 0) + amount;
      const isCompleted = newTotal >= selectedReward.meals;

      if (existing) {
        await base44.entities.RewardAllocation.update(existing.id, {
          meals_allocated: newTotal,
          is_completed: isCompleted,
          completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at
        });
      } else {
        await base44.entities.RewardAllocation.create({
          user_email: userEmail,
          dog_id: selectedDog.dog_id,
          dog_name: selectedDog.dog_name,
          reward_key: rewardKey,
          reward_title: selectedReward.title,
          meals_allocated: amount,
          reward_cost: selectedReward.meals,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        });
      }

      queryClient.invalidateQueries({ queryKey: ['rewardAllocations'] });
      toast.success(`${amount} meal points allocated to ${selectedReward.title} for ${selectedDog.dog_name}! 🐾`);
      onClose();
      resetState();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setStep('select-dog');
    setSelectedDog(null);
    setSelectedReward(null);
    setAmount(1);
  };

  const handleClose = () => { resetState(); onClose(); };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end justify-center sm:items-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-amber-100">
            <div>
              <h2 className="text-lg font-bold text-amber-900">Allocate Meal Points</h2>
              <p className="text-xs text-amber-600">{availablePoints} points available</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 px-5 pt-3">
            {['select-dog', 'select-reward', 'set-amount'].map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${
                step === s ? 'bg-amber-500' : 
                ['select-reward', 'set-amount'].slice(0, ['select-dog','select-reward','set-amount'].indexOf(step)).includes(s) || 
                (step === 'set-amount' && s === 'select-dog') || (step === 'set-amount' && s === 'select-reward')
                  ? 'bg-amber-300' : 'bg-amber-100'
              }`} />
            ))}
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4">

            {/* Step 1: Select Dog */}
            {step === 'select-dog' && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-800 mb-3">Which dog should receive this reward?</p>
                {userDogs.length === 0 && (
                  <p className="text-center text-amber-500 text-sm py-8">You haven't adopted any dogs yet.</p>
                )}
                {userDogs.map(dog => (
                  <button
                    key={dog.dog_id}
                    onClick={() => { setSelectedDog(dog); setStep('select-reward'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
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
                      <p className="text-xs text-amber-600">{dog.dog_city}, {dog.dog_country}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Select Reward */}
            {step === 'select-reward' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setStep('select-dog')} className="text-amber-500 text-sm hover:underline">← Back</button>
                  <p className="text-sm font-medium text-amber-800">Select a reward for <span className="font-bold">{selectedDog?.dog_name}</span></p>
                </div>
                {rewardMilestones.map(reward => {
                  const rewardKey = `${reward.title.toLowerCase().replace(/\s+/g, '_')}_${reward.meals}`;
                  const alloc = getAllocatedForDogReward(selectedDog?.dog_id, rewardKey);
                  const allocated = alloc?.meals_allocated || 0;
                  const pct = Math.min(100, (allocated / reward.meals) * 100);
                  return (
                    <button
                      key={reward.meals}
                      onClick={() => { setSelectedReward(reward); setAmount(5); setStep('set-amount'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${reward.color} flex-shrink-0`}>
                        {reward.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-amber-900 text-sm">{reward.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-amber-100 rounded-full h-1.5">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-amber-600 whitespace-nowrap">{allocated}/{reward.meals}</span>
                        </div>
                        {alloc?.is_completed && <p className="text-xs text-green-600 font-medium mt-0.5">✓ Completed</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 3: Set Amount */}
            {step === 'set-amount' && selectedReward && selectedDog && (
              <div className="text-center">
                <button onClick={() => setStep('select-reward')} className="text-amber-500 text-sm hover:underline block mb-4">← Back</button>
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br ${selectedReward.color} mb-3`}>
                  {selectedReward.icon}
                </div>
                <h3 className="font-bold text-amber-900 text-lg">{selectedReward.title}</h3>
                <p className="text-amber-600 text-sm mb-1">for <span className="font-semibold">{selectedDog.dog_name}</span></p>
                <p className="text-amber-500 text-xs mb-6">Costs {selectedReward.meals} meal points total</p>

                <p className="text-sm font-medium text-amber-800 mb-3">How many points to allocate?</p>
                <div className="flex items-center justify-center gap-6 mb-2">
                  <button
                    onClick={() => setAmount(a => Math.max(5, a - 5))}
                    className="w-12 h-12 rounded-full border-2 border-amber-200 flex items-center justify-center hover:bg-amber-50"
                  >
                    <Minus className="w-5 h-5 text-amber-700" />
                  </button>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-amber-800">{amount}</span>
                  </div>
                  <button
                    onClick={() => setAmount(a => Math.min(availablePoints, a + 5))}
                    className="w-12 h-12 rounded-full border-2 border-amber-200 flex items-center justify-center hover:bg-amber-50"
                  >
                    <Plus className="w-5 h-5 text-amber-700" />
                  </button>
                </div>
                <p className="text-xs text-amber-500 mb-6">{availablePoints} points available</p>

                <button
                  onClick={handleAllocate}
                  disabled={isSubmitting || amount > availablePoints}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {isSubmitting ? 'Allocating...' : `Allocate ${amount} point${amount !== 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}