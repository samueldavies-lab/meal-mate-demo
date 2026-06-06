import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dog, Utensils, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

export default function RefeedDogModal({ isOpen, onClose, onRefeed, userEmail, unfedDogs }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate days since last meal and sort by urgency
  const dogsWithDaysSince = unfedDogs.map(dog => {
    const lastFeedDate = new Date(dog.updated_date);
    const today = new Date();
    const daysSinceLastMeal = Math.floor((today - lastFeedDate) / (1000 * 60 * 60 * 24));
    return { ...dog, daysSinceLastMeal };
  }).sort((a, b) => b.daysSinceLastMeal - a.daysSinceLastMeal);

  const handleRefeed = async () => {
    if (!selectedDog || !userEmail) return;
    setIsSubmitting(true);

    try {
      // Update UserDog meals count
      await base44.entities.UserDog.update(selectedDog.id, {
        meals_provided: (selectedDog.meals_provided || 1) + 1
      });

      // Create PendingMeal with random delivery time between 48-58 hours
      const now = new Date();
      const randomHours = 48 + Math.random() * 10;
      const deliveryTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
      
      await base44.entities.PendingMeal.create({
        user_email: userEmail,
        dog_id: selectedDog.dog_id,
        dog_name: selectedDog.dog_name,
        dog_photo: selectedDog.dog_photo,
        dog_country: selectedDog.dog_country,
        dog_city: selectedDog.dog_city,
        status: 'pending',
        created_at: now.toISOString(),
        delivery_scheduled_at: deliveryTime.toISOString()
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EA580C', '#92400E', '#FCD34D']
      });

      onRefeed(selectedDog);
      setSelectedDog(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-900">
              🐕 Feed Your Dogs First!
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {!selectedDog ? (
            <div className="space-y-3">
              <p className="text-amber-700 text-center mb-4">
                Your dogs need their daily meal! Feed them before adding new friends.
              </p>

              <div className="bg-amber-100 rounded-xl p-3 mb-4 text-center">
                <p className="text-amber-800 font-medium">
                  {unfedDogs.length} dog{unfedDogs.length !== 1 ? 's' : ''} waiting for food today
                </p>
              </div>

              {dogsWithDaysSince.map(dog => (
                <motion.button
                  key={dog.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDog(dog)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border-2 border-amber-100 hover:border-amber-400 transition-all bg-white"
                >
                  {dog.dog_photo ? (
                    <img 
                      src={dog.dog_photo} 
                      alt={dog.dog_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Dog className="w-8 h-8 text-amber-400" />
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-amber-900">{dog.dog_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <MapPin className="w-3 h-3" />
                      <span>{dog.dog_city}, {dog.dog_country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="text-amber-500">{dog.meals_provided || 1} meals provided</span>
                      <span className="text-amber-400">•</span>
                      <span className={dog.daysSinceLastMeal >= 2 ? "text-red-600 font-semibold" : "text-amber-600"}>
                        {dog.daysSinceLastMeal} day{dog.daysSinceLastMeal !== 1 ? 's' : ''} since last meal
                      </span>
                    </div>
                  </div>
                  <Utensils className="w-5 h-5 text-amber-400" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              {selectedDog.dog_photo ? (
                <img 
                  src={selectedDog.dog_photo} 
                  alt={selectedDog.dog_name}
                  className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Dog className="w-16 h-16 text-amber-400" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-amber-900 mb-1">{selectedDog.dog_name}</h3>
              <p className="text-amber-600 mb-4">{selectedDog.dog_city}, {selectedDog.dog_country}</p>

              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <p className="text-amber-800">
                  <Utensils className="w-4 h-4 inline text-amber-600 mr-1" />
                  This will be meal #{(selectedDog.meals_provided || 1) + 1} for {selectedDog.dog_name}!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedDog(null)}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl border-amber-200"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRefeed}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl font-semibold"
                >
                  {isSubmitting ? 'Feeding...' : 'Feed ' + selectedDog.dog_name + '!'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}