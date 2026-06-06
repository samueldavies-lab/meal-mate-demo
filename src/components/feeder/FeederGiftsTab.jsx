import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Loader, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const giftIcons = {
  collar: '📿',
  vaccine: '💉',
  vet_visit: '🏥',
  medication: '💊',
  food_supply: '🍖',
  tip: '💝',
  other: '🎁',
};

const statusConfig = {
  pending_coordination: {
    label: 'Awaiting Coordination',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

export default function FeederGiftsTab({ user }) {
  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ['feederGifts', user?.email],
    queryFn: () => base44.entities.SpecialGift.filter({ feeder_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-emerald-500">Loading gifts...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-4">

      {/* Header Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="bg-white/20 rounded-full p-2 mt-0.5">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base">Special Gifts for Your Dogs 🎁</p>
            <p className="text-sm text-purple-100 mt-0.5">
              When a sponsor sends a special gift — like a collar, vaccine, or tip — it appears here.
              A member of the <strong>MealMate team</strong> will contact you to help coordinate the purchase and delivery.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Gifts List */}
      {gifts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center"
        >
          <div className="text-5xl mb-3">🎁</div>
          <p className="text-gray-600 font-semibold mb-1">No special gifts yet</p>
          <p className="text-sm text-gray-400">
            When a sponsor sends a gift for one of your dogs, it will appear here and the MealMate team will be in touch to coordinate.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {gifts.map((gift, i) => {
            const status = statusConfig[gift.status] || statusConfig.pending_coordination;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border-2 ${status.border} p-4 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{giftIcons[gift.gift_type] || '🎁'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 text-base">{gift.gift_label}</p>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${status.bg} ${status.color} flex-shrink-0`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    {gift.dog_name && (
                      <p className="text-sm text-gray-500 mt-0.5">For: <span className="font-medium text-gray-700">{gift.dog_name}</span></p>
                    )}

                    {gift.donor_name && (
                      <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700">{gift.donor_name}</span></p>
                    )}

                    {gift.message && (
                      <p className="text-sm text-gray-600 italic mt-2 bg-gray-50 rounded-xl px-3 py-2">
                        "{gift.message}"
                      </p>
                    )}

                    {gift.admin_notes && (
                      <div className="mt-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-purple-700 mb-0.5">📋 MealMate Team Note:</p>
                        <p className="text-sm text-purple-800">{gift.admin_notes}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Received {new Date(gift.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}