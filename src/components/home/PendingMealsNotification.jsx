import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, Dog } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const deliveryPhotos = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/1f35f20ac_WhatsAppImage2026-01-23at112512.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/0c30038ad_WhatsAppImage2026-02-12at134417.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/f6b8e99ae_WhatsAppImage2026-02-15at130228.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6fb2fadbc_WhatsAppImage2026-01-22at174404.jpg"
];

export default function PendingMealsNotification({ userEmail }) {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const queryClient = useQueryClient();

  const { data: pendingMeals = [] } = useQuery({
    queryKey: ['pendingMeals', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await base44.entities.PendingMeal.filter({ 
        user_email: userEmail,
        status: 'pending'
      });
    },
    enabled: !!userEmail,
    refetchInterval: 30000
  });

  // Check for meals ready to be "delivered" and build a queue
  useEffect(() => {
    const checkDeliveries = async () => {
      const now = new Date();
      const newNotifications = [];
      for (const meal of pendingMeals) {
        const scheduledTime = new Date(meal.delivery_scheduled_at);
        if (now >= scheduledTime && meal.status === 'pending') {
          const randomPhoto = deliveryPhotos[Math.floor(Math.random() * deliveryPhotos.length)];
          await base44.entities.PendingMeal.update(meal.id, {
            status: 'delivered',
            delivered_at: now.toISOString(),
            delivery_photo: randomPhoto
          });
          newNotifications.push({
            dogName: meal.dog_name,
            dogPhoto: meal.dog_photo,
            deliveryPhoto: randomPhoto,
            city: meal.dog_city,
            country: meal.dog_country
          });
        }
      }
      if (newNotifications.length > 0) {
        setNotificationQueue(prev => [...prev, ...newNotifications]);
        queryClient.invalidateQueries({ queryKey: ['pendingMeals'] });
      }
    };

    if (pendingMeals.length > 0) {
      checkDeliveries();
    }
  }, [pendingMeals, queryClient]);

  const deliveryNotification = notificationQueue[0] ?? null;

  const dismissNotification = () => {
    setNotificationQueue(prev => prev.slice(1));
  };

  return (
    <>
      {/* Pending meals indicator */}
      {pendingMeals.length > 0 && !deliveryNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 rounded-full">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {pendingMeals.length} meal{pendingMeals.length > 1 ? 's' : ''} being prepared
              </p>
              <p className="text-xs text-amber-600">
                You'll be notified when delivered
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delivery notification popup */}
      <AnimatePresence>
        {deliveryNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={dismissNotification}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-green-50 to-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={dismissNotification}
                className="absolute top-4 right-4 p-2 hover:bg-green-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-green-700" />
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>

                {notificationQueue.length > 1 && (
                  <p className="text-xs text-green-600 font-medium mb-2">
                    {notificationQueue.length} deliveries to review — {notificationQueue.length - 1} more after this
                  </p>
                )}
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  🎉 Meal Delivered!
                </h2>
                <p className="text-green-700 mb-4">
                  {deliveryNotification.dogName} in {deliveryNotification.city}, {deliveryNotification.country} has been fed!
                </p>

                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={deliveryNotification.deliveryPhoto}
                    alt="Feeding proof"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">
                      📸 Feeding confirmation photo
                    </p>
                  </div>
                </div>

                <p className="text-sm text-green-600 mb-4">
                  Thank you for making a difference! ❤️
                </p>

                <button
                  onClick={dismissNotification}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold"
                >
                  {notificationQueue.length > 1 ? `Next (${notificationQueue.length - 1} more) →` : 'Awesome!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}