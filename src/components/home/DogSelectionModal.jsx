import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, Dog, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const realDogs = [
  { id: "dog-1",  name: "Coco",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!" },
  { id: "dog-2",  name: "Shadow",   photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "male",   description: "A playful pup found on the streets, now thriving with daily meals!" },
  { id: "dog-3",  name: "Bruno",    photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A friendly shelter dog with the sweetest smile, loves belly rubs!" },
  { id: "dog-4",  name: "Goldie",   photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg",  country: "India",       city: "Jaipur",    age: "Adult",  gender: "female", description: "Lives near a local market, always eager for her daily meal!" },
  { id: "dog-5",  name: "Kalu",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg",  country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "male",   description: "A gentle giant at the rescue shelter, loves lounging on the grass." },
  { id: "dog-6",  name: "Fluffy",   photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg",  country: "Nepal",       city: "Istanbul",  age: "Young",  gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!" },
  { id: "dog-7",  name: "Casper",   photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg",   country: "India",       city: "Mumbai",    age: "Adult",  gender: "male",   description: "Found wandering the streets, now gets regular meals from our feeders." },
  { id: "dog-8",  name: "Patches",  photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg",  country: "Nepal",       city: "Bhaktapur", age: "Puppy",  gender: "male",   description: "An adorable puppy living on the streets, needs your help to grow strong!" },
  { id: "dog-9",  name: "Blackie",  photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg", country: "Nepal",       city: "Kathmandu", age: "Senior", gender: "male",   description: "Recovering at the shelter with a leg injury, needs nutritious meals." },
  { id: "dog-10", name: "Oreo",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg", country: "Nepal",       city: "Pokhara",   age: "Adult",  gender: "male",   description: "A calm shelter resident with soulful eyes, waiting for his next meal." },
  { id: "dog-11", name: "Ginger",   photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/5762d6ed8_WhatsAppImage2026-02-17at19231612.jpg", country: "India",       city: "Varanasi",  age: "Adult",  gender: "female", description: "Rescued and recovering at shelter, grateful for every meal she gets." },
  { id: "dog-12", name: "Marigold", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/4608904d0_WhatsAppImage2026-02-17at19231610.jpg", country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "female", description: "Celebrated during festivals, this street dog is loved by the community!" },
  { id: "dog-13", name: "Rusty",    photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df9eaffb2_WhatsAppImage2026-02-17at1923172.jpg",  country: "Indonesia",   city: "Bali",      age: "Young",  gender: "male",   description: "A happy street dog with the friendliest face, loves meeting new people!" },
  { id: "dog-14", name: "Hope",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c23588dca_WhatsAppImage2026-02-17at19231710.jpg", country: "India",       city: "Chennai",   age: "Adult",  gender: "female", description: "Severely malnourished when found, now recovering with regular meals." },
  { id: "dog-15", name: "Biscuit",  photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/409c38a43_WhatsAppImage2026-02-17at1923175.jpg",  country: "India",       city: "Kolkata",   age: "Young",  gender: "male",   description: "A hungry street pup who depends on community feeders for survival." },
  { id: "dog-16", name: "Mama",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/1b09ee111_WhatsAppImage2026-02-17at1923174.jpg",  country: "Nepal",       city: "Lalitpur",  age: "Adult",  gender: "female", description: "A street mother with her pup, needs extra nutrition to care for her baby." },
  { id: "dog-17", name: "Sunny",    photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/e5de9f351_WhatsAppImage2026-02-17at192316.jpg",   country: "India",       city: "Bangalore", age: "Adult",  gender: "female", description: "A street mom watching over her puppies at a local market." },
  { id: "dog-18", name: "Luna",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/13525cd25_WhatsAppImage2026-02-14at013153.jpg",   country: "South Korea", city: "Seoul",     age: "Adult",  gender: "female", description: "A beautiful white dog found in the countryside, now getting regular meals." },
  { id: "dog-19", name: "Midnight", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/25406fbcd_WhatsAppImage2026-01-22at174401.jpg",   country: "South Korea", city: "Seoul",     age: "Young",  gender: "female", description: "A sweet black cat living on the streets, loves her daily meals!" },
  { id: "dog-20", name: "Mary",     photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/mary-dog.jpg",                                                                          country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "female", description: "A gentle street dog waiting for her daily meals." }
];

// view: 'my-dogs' | 'adopt' | 'confirm'
export default function DogSelectionModal({ isOpen, onClose, onDogSelected, userEmail, userDogs = [], fedTodayIds = [] }) {
  const [view, setView] = useState('my-dogs');
  const [selectedDog, setSelectedDog] = useState(null); // static dog data
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of dog_id -> UserDog record
  const userDogMap = userDogs.reduce((acc, ud) => {
    acc[ud.dog_id] = ud;
    return acc;
  }, {});

  const adoptedDogIds = new Set(userDogs.map(ud => ud.dog_id));
  const newDogs = realDogs.filter(d => !adoptedDogIds.has(d.id));
  const unfedDogs = userDogs.filter(dog => !fedTodayIds.includes(dog.id));
  const allDogsFedToday = userDogs.length > 0 && unfedDogs.length === 0;

  const handleClose = () => {
    setView('my-dogs');
    setSelectedDog(null);
    onClose();
  };

  const selectDog = (dog) => {
    setSelectedDog(dog);
    setView('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedDog || !userEmail) return;
    setIsSubmitting(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deliveryTime = new Date(now.getTime() + (48 + Math.random() * 10) * 60 * 60 * 1000);

      const existingUserDog = userDogMap[selectedDog.id];

      if (existingUserDog) {
        await base44.entities.UserDog.update(existingUserDog.id, {
          meals_provided: (existingUserDog.meals_provided || 1) + 1
        });
        await base44.entities.DailyFeedingLog.create({
          user_email: userEmail,
          dog_id: existingUserDog.id,
          date: today
        });
      } else {
        await base44.entities.UserDog.create({
          user_email: userEmail,
          dog_id: selectedDog.id,
          dog_name: selectedDog.name,
          dog_photo: selectedDog.photo_url,
          dog_country: selectedDog.country,
          dog_city: selectedDog.city,
          meals_provided: 1,
          adopted_date: today
        });
      }

      await base44.entities.PendingMeal.create({
        user_email: userEmail,
        dog_id: selectedDog.id,
        dog_name: selectedDog.name,
        dog_photo: selectedDog.photo_url,
        dog_country: selectedDog.country,
        dog_city: selectedDog.city,
        status: 'pending',
        created_at: now.toISOString(),
        delivery_scheduled_at: deliveryTime.toISOString()
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F59E0B', '#EA580C', '#92400E', '#FCD34D'] });
      onDogSelected(selectedDog);
      setView('my-dogs');
      setSelectedDog(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              {(view === 'adopt' || view === 'confirm') && (
                <button
                  onClick={() => setView(view === 'confirm' ? (adoptedDogIds.has(selectedDog?.id) ? 'my-dogs' : 'adopt') : 'my-dogs')}
                  className="p-1.5 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-700" />
                </button>
              )}
              <h2 className="text-xl font-bold text-amber-900">
                {view === 'my-dogs' && '🍖 Feed Your Dogs'}
                {view === 'adopt' && '🐕 Adopt a New Dog'}
                {view === 'confirm' && `Feed ${selectedDog?.name}`}
              </h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* My Dogs view */}
          {view === 'my-dogs' && (
            <div>
              {userDogs.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🐾</div>
                  <p className="text-amber-700 mb-2 font-medium">You haven't adopted any dogs yet!</p>
                  <p className="text-sm text-amber-600 mb-5">Adopt a dog from our network to start feeding them.</p>
                </div>
              ) : allDogsFedToday ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-amber-700 mb-2 font-medium">Amazing! All your dogs are fed today!</p>
                  <p className="text-sm text-amber-600 mb-5">Adopt another dog to continue making a difference!</p>
                </div>
              ) : (
                <div>
                  <p className="text-amber-700 text-sm text-center mb-4">Choose one of your dogs to feed 🐾</p>
                  <div className="space-y-2 mb-4">
                    {userDogs.map(dog => {
                      const isFedToday = fedTodayIds.includes(dog.id);
                      return (
                        <motion.button
                          key={dog.id}
                          whileHover={!isFedToday ? { scale: 1.02 } : {}}
                          whileTap={!isFedToday ? { scale: 0.98 } : {}}
                          onClick={() => {
                            if (!isFedToday) {
                              const staticDog = realDogs.find(d => d.id === dog.dog_id);
                              if (staticDog) {
                                selectDog(staticDog);
                              } else {
                                selectDog({ id: dog.dog_id, name: dog.dog_name, photo_url: dog.dog_photo, country: dog.dog_country, city: dog.dog_city, description: '', age: '', gender: '' });
                              }
                            }
                          }}
                          disabled={isFedToday}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                            isFedToday
                              ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                              : 'border-amber-100 hover:border-amber-400 bg-white'
                          }`}
                        >
                          {dog.dog_photo ? (
                            <img src={dog.dog_photo} alt={dog.dog_name} className={`w-14 h-14 rounded-xl object-cover flex-shrink-0 ${isFedToday ? 'grayscale' : ''}`} />
                          ) : (
                            <div className={`w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 ${isFedToday ? 'grayscale' : ''}`}>
                              <Dog className="w-8 h-8 text-amber-400" />
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <h3 className={`font-semibold ${isFedToday ? 'text-gray-600' : 'text-amber-900'}`}>{dog.dog_name}</h3>
                            <div className={`flex items-center gap-1 text-sm ${isFedToday ? 'text-gray-500' : 'text-amber-600'}`}>
                              <MapPin className="w-3 h-3" />
                              <span>{dog.dog_city}, {dog.dog_country}</span>
                            </div>
                            {isFedToday && <p className="text-xs text-green-600 mt-0.5 font-medium">✓ Fed today</p>}
                          </div>
                          {!isFedToday && <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Adopt new dog button */}
              <button
                onClick={() => setView('adopt')}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all font-medium text-sm ${
                  allDogsFedToday
                    ? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500'
                    : 'border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <Heart className="w-4 h-4" />
                {allDogsFedToday ? 'Adopt another dog to continue!' : 'Adopt a new dog to your family'}
              </button>
            </div>
          )}

          {/* Adopt new dog view */}
          {view === 'adopt' && (
            <div>
              <p className="text-amber-700 text-sm text-center mb-4">
                {newDogs.length === 0
                  ? "You're already feeding every dog in our network! 🎉"
                  : "Choose a dog to add to your family 🐾"}
              </p>
              <div className="space-y-2">
                {newDogs.map(dog => (
                  <motion.button
                    key={dog.id}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => selectDog(dog)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border-2 border-amber-100 hover:border-amber-400 transition-all bg-white"
                  >
                    <img src={dog.photo_url} alt={dog.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-amber-900">{dog.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-amber-600">
                        <MapPin className="w-3 h-3" />
                        <span>{dog.city}, {dog.country}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Confirm view */}
          {view === 'confirm' && selectedDog && (
            <div className="text-center">
              <img src={selectedDog.photo_url} alt={selectedDog.name} className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
              <h3 className="text-2xl font-bold text-amber-900 mb-1">{selectedDog.name}</h3>
              <p className="text-amber-600 mb-2">{selectedDog.city}, {selectedDog.country}</p>
              <p className="text-sm text-amber-700 mb-4">{selectedDog.description}</p>
              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <p className="text-amber-800">
                  {userDogMap[selectedDog.id]
                    ? `This will be meal #${(userDogMap[selectedDog.id].meals_provided || 1) + 1} for ${selectedDog.name}! 🍖`
                    : `${selectedDog.name} will be added to your family and get their first meal! ❤️`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setView(adoptedDogIds.has(selectedDog.id) ? 'my-dogs' : 'adopt')}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl border-amber-200"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl font-semibold"
                >
                  {isSubmitting ? 'Feeding...' : `Feed ${selectedDog.name}! 🍖`}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}