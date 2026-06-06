import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Same dog registry as in DogSelectionModal
const realDogs = [
  { id: "dog-1", name: "Coco", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg", country: "Nepal", city: "Kathmandu", age: "Young", gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!" },
  { id: "dog-2", name: "Shadow", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg", country: "Nepal", city: "Pokhara", age: "Puppy", gender: "male", description: "A playful pup found on the streets, now thriving with daily meals!" },
  { id: "dog-3", name: "Bruno", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg", country: "India", city: "Delhi", age: "Adult", gender: "male", description: "A friendly shelter dog with the sweetest smile, loves belly rubs!" },
  { id: "dog-4", name: "Goldie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg", country: "India", city: "Jaipur", age: "Adult", gender: "female", description: "Lives near a local market, always eager for her daily meal!" },
  { id: "dog-5", name: "Kalu", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg", country: "Nepal", city: "Kathmandu", age: "Adult", gender: "male", description: "A gentle giant at the rescue shelter, loves lounging on the grass." },
  { id: "dog-6", name: "Fluffy", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg", country: "Nepal", city: "Istanbul", age: "Young", gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!" },
  { id: "dog-7", name: "Casper", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg", country: "India", city: "Mumbai", age: "Adult", gender: "male", description: "Found wandering the streets, now gets regular meals from our feeders." },
  { id: "dog-8", name: "Patches", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg", country: "Nepal", city: "Bhaktapur", age: "Puppy", gender: "male", description: "An adorable puppy living on the streets, needs your help to grow strong!" },
  { id: "dog-9", name: "Blackie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg", country: "Nepal", city: "Kathmandu", age: "Senior", gender: "male", description: "Recovering at the shelter with a leg injury, needs nutritious meals." },
  { id: "dog-10", name: "Oreo", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg", country: "Nepal", city: "Pokhara", age: "Adult", gender: "male", description: "A calm shelter resident with soulful eyes, waiting for his next meal." },
  { id: "dog-11", name: "Ginger", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/5762d6ed8_WhatsAppImage2026-02-17at19231612.jpg", country: "India", city: "Varanasi", age: "Adult", gender: "female", description: "Rescued and recovering at shelter, grateful for every meal she gets." },
  { id: "dog-12", name: "Marigold", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/4608904d0_WhatsAppImage2026-02-17at19231610.jpg", country: "Nepal", city: "Kathmandu", age: "Adult", gender: "female", description: "Celebrated during festivals, this street dog is loved by the community!" },
  { id: "dog-13", name: "Rusty", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df9eaffb2_WhatsAppImage2026-02-17at1923172.jpg", country: "Indonesia", city: "Bali", age: "Young", gender: "male", description: "A happy street dog with the friendliest face, loves meeting new people!" },
  { id: "dog-14", name: "Hope", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c23588dca_WhatsAppImage2026-02-17at19231710.jpg", country: "India", city: "Chennai", age: "Adult", gender: "female", description: "Severely malnourished when found, now recovering with regular meals." },
  { id: "dog-15", name: "Biscuit", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/409c38a43_WhatsAppImage2026-02-17at1923175.jpg", country: "India", city: "Kolkata", age: "Young", gender: "male", description: "A hungry street pup who depends on community feeders for survival." },
  { id: "dog-16", name: "Mama", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/1b09ee111_WhatsAppImage2026-02-17at1923174.jpg", country: "Nepal", city: "Lalitpur", age: "Adult", gender: "female", description: "A street mother with her pup, needs extra nutrition to care for her baby." },
  { id: "dog-17", name: "Sunny", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/e5de9f351_WhatsAppImage2026-02-17at192316.jpg", country: "India", city: "Bangalore", age: "Adult", gender: "female", description: "A street mom watching over her puppies at a local market." },
  { id: "dog-18", name: "Luna", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/13525cd25_WhatsAppImage2026-02-14at013153.jpg", country: "South Korea", city: "Seoul", age: "Adult", gender: "female", description: "A beautiful white dog found in the countryside, now getting regular meals." },
  { id: "dog-19", name: "Midnight", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/25406fbcd_WhatsAppImage2026-01-22at174401.jpg", country: "South Korea", city: "Seoul", age: "Young", gender: "female", description: "A sweet black cat living on the streets, loves her daily meals!" }
];

export default function AddDogModal({ isOpen, onClose, onAddDog, feederCity, feederCountry, existingDogIds = new Set() }) {
  const [selectedDog, setSelectedDog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter dogs for feeder's city/country and exclude already added dogs
  const availableDogs = realDogs.filter(
    d => d.city === feederCity && d.country === feederCountry && !existingDogIds.has(d.id)
  );

  const handleAdd = async (dog) => {
    setIsSubmitting(true);
    try {
      await onAddDog(dog);
    } finally {
      setIsSubmitting(false);
      setSelectedDog(null);
    }
  };

  const handleClose = () => {
    setSelectedDog(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-end"
      >
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          exit={{ y: 200 }}
          className="w-full bg-white rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-emerald-900">
              {selectedDog ? `Add ${selectedDog.name}?` : '🐕 Available Dogs'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedDog ? (
            <>
              <p className="text-emerald-700 text-sm mb-4">
                Select a dog from {feederCity} to add to your feeding network
              </p>
              {availableDogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-emerald-600">No available dogs in your area</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDogs.map(dog => (
                    <motion.button
                      key={dog.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDog(dog)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl border-2 border-emerald-100 hover:border-emerald-400 transition-all bg-white"
                    >
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-emerald-900">{dog.name}</h3>
                        <p className="text-sm text-emerald-600">{dog.age} · {dog.gender}</p>
                        <p className="text-xs text-emerald-500 mt-0.5">{dog.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-400" />
                    </motion.button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <img
                src={selectedDog.photo_url}
                alt={selectedDog.name}
                className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-emerald-900 mb-1">{selectedDog.name}</h3>
              <p className="text-emerald-600 mb-4">{selectedDog.age} · {selectedDog.gender}</p>
              <p className="text-sm text-emerald-700 mb-6">{selectedDog.description}</p>
              <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                <p className="text-emerald-800">
                  {selectedDog.name} will be added to your feeding network and you can start logging meals!
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedDog(null)}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl border-emerald-200"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleAdd(selectedDog)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6 rounded-xl font-semibold"
                >
                  {isSubmitting ? 'Adding...' : `Add ${selectedDog.name}!`}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}