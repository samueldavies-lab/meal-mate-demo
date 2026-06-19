import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const realDogs = [
  { id: "dog-1", name: "Coco", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg", country: "Nepal", city: "Kathmandu" },
  { id: "dog-2", name: "Shadow", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg", country: "Nepal", city: "Pokhara" },
  { id: "dog-3", name: "Bruno", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg", country: "India", city: "Delhi" },
  { id: "dog-4", name: "Goldie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg", country: "India", city: "Jaipur" },
  { id: "dog-5", name: "Kalu", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg", country: "Nepal", city: "Kathmandu" },
  { id: "dog-6", name: "Fluffy", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg", country: "Nepal", city: "Istanbul" },
  { id: "dog-7", name: "Casper", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg", country: "India", city: "Mumbai" },
  { id: "dog-8", name: "Patches", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg", country: "Nepal", city: "Bhaktapur" },
  { id: "dog-9", name: "Blackie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg", country: "Nepal", city: "Kathmandu" },
  { id: "dog-10", name: "Oreo", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg", country: "Nepal", city: "Pokhara" },
  { id: "dog-11", name: "Ginger", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/5762d6ed8_WhatsAppImage2026-02-17at19231612.jpg", country: "India", city: "Varanasi" },
  { id: "dog-12", name: "Marigold", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/4608904d0_WhatsAppImage2026-02-17at19231610.jpg", country: "Nepal", city: "Kathmandu" },
];

export default function BulkDogSelectionModal({ isOpen, onClose, userEmail, mealCount = 5 }) {
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDogs, setUserDogs] = useState([]);

  useEffect(() => {
    if (isOpen && userEmail) {
      loadUserDogs();
    }
  }, [isOpen, userEmail]);

  const loadUserDogs = async () => {
    const dogs = await base44.entities.UserDog.filter({ user_email: userEmail });
    setUserDogs(dogs);
  };

  const toggleDog = (dog) => {
    if (selectedDogs.find(d => d.id === dog.id)) {
      setSelectedDogs(selectedDogs.filter(d => d.id !== dog.id));
    } else if (selectedDogs.length < mealCount) {
      setSelectedDogs([...selectedDogs, dog]);
    }
  };

  const handleConfirm = async () => {
    if (selectedDogs.length !== mealCount || !userEmail) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      for (const dog of selectedDogs) {
        // Check if user already has this dog
        const existingDog = userDogs.find(ud => ud.dog_id === dog.id);
        
        if (existingDog) {
          await base44.entities.UserDog.update(existingDog.id, {
            meals_provided: existingDog.meals_provided + 1,
            last_fed_date: today
          });
        } else {
          await base44.entities.UserDog.create({
            user_email: userEmail,
            dog_id: dog.id,
            dog_name: dog.name,
            dog_photo: dog.photo_url,
            dog_country: dog.country,
            dog_city: dog.city,
            meals_provided: 0,
            adoption_date: today,
            last_fed_date: today
          });
        }

        // Create PendingMeal
        const now = new Date();
        const randomHours = 48 + Math.random() * 10;
        const deliveryTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
        
        await base44.entities.PendingMeal.create({
          user_email: userEmail,
          dog_id: dog.id,
          dog_name: dog.name,
          scheduled_date: deliveryTime.toISOString().split('T')[0],
          status: 'pending',
        });
      }

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EA580C', '#92400E', '#FCD34D']
      });

      onClose();
    } catch (error) {
      console.error('Error feeding dogs:', error);
    } finally {
      setIsSubmitting(false);
      setSelectedDogs([]);
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
        onClick={onClose}
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
              🎁 Select {mealCount} Dogs to Feed
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 mb-4">
            <p className="text-center text-amber-800 text-sm">
              Selected: <strong>{selectedDogs.length}</strong> / {mealCount} dogs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {realDogs.map(dog => {
              const isSelected = selectedDogs.find(d => d.id === dog.id);
              return (
                <motion.button
                  key={dog.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDog(dog)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected 
                      ? 'border-green-400 shadow-lg' 
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <img 
                    src={dog.photo_url} 
                    alt={dog.name}
                    className="w-full h-32 object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="bg-white p-2">
                    <p className="font-semibold text-amber-900 text-sm">{dog.name}</p>
                    <p className="text-xs text-amber-600">{dog.city}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <Button
            onClick={handleConfirm}
            disabled={selectedDogs.length !== mealCount || isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl text-lg font-semibold"
          >
            {isSubmitting ? 'Processing...' : `Feed ${mealCount} Dogs!`}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}