import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const DOG_PHOTOS = {
  'Coco': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg',
  'Shadow': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg',
  'Bruno': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg',
  'Goldie': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg',
  'Kalu': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg',
  'Fluffy': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg',
  'Casper': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg',
  'Patches': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg',
  'Blackie': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg',
  'Oreo': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg',
  'Ginger': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/5762d6ed8_WhatsAppImage2026-02-17at19231612.jpg',
  'Marigold': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/4608904d0_WhatsAppImage2026-02-17at19231610.jpg',
  'Rusty': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df9eaffb2_WhatsAppImage2026-02-17at1923172.jpg',
  'Hope': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c23588dca_WhatsAppImage2026-02-17at19231710.jpg',
  'Biscuit': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/409c38a43_WhatsAppImage2026-02-17at1923175.jpg',
  'Mama': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/1b09ee111_WhatsAppImage2026-02-17at1923174.jpg',
  'Sunny': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/e5de9f351_WhatsAppImage2026-02-17at192316.jpg',
  'Luna': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/13525cd25_WhatsAppImage2026-02-14at013153.jpg',
  'Midnight': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/25406fbcd_WhatsAppImage2026-01-22at174401.jpg',
};

function getDogPhoto(dog) {
  const name = dog.name || dog.dog_name || '';
  return DOG_PHOTOS[name] || dog.photo_url || dog.dog_photo || dog.photo || '';
}

export default function AdoptionSuccessModal({ isOpen, dogs = [], onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-7 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                className="text-6xl mb-2"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black text-white">Your Feeding Family!</h2>
              <p className="text-green-100 text-sm mt-1">You've just adopted 3 hungry dogs 🐾</p>
            </div>

            <div className="p-6">
              {dogs.length > 0 && (
                <div className="flex justify-center gap-4 mb-5">
                  {dogs.map(dog => (
                    <div key={dog.id} className="flex flex-col items-center">
                      <img
                        src={getDogPhoto(dog)}
                        alt={dog.name || dog.dog_name}
                        className="w-16 h-16 rounded-full object-cover border-3 border-emerald-300 shadow-md"
                      />
                      <span className="text-xs font-semibold text-amber-800 mt-1">{dog.name || dog.dog_name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 rounded-2xl p-4 mb-5 border border-amber-100 text-center">
                <p className="text-amber-900 font-semibold text-sm mb-1">⬇️ Now here's what to do next</p>
                <p className="text-amber-700 text-sm">
                  Watch a few short ads to generate enough credits to feed one of your newly adopted doggies — it only takes a minute!
                </p>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 rounded-2xl text-base font-bold shadow-lg shadow-orange-200"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Ads & Feed My Dogs!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
