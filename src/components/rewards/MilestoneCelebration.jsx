import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

const celebrationDogs = [
  { name: "Coco", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg" },
  { name: "Shadow", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg" },
  { name: "Bruno", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg" },
  { name: "Goldie", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg" },
  { name: "Kalu", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg" },
  { name: "Fluffy", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg" },
  { name: "Casper", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg" },
  { name: "Patches", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg" },
  { name: "Blackie", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg" },
  { name: "Oreo", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg" },
  { name: "Ginger", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/5762d6ed8_WhatsAppImage2026-02-17at19231612.jpg" },
  { name: "Marigold", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/4608904d0_WhatsAppImage2026-02-17at19231610.jpg" },
  { name: "Hope", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c23588dca_WhatsAppImage2026-02-17at19231710.jpg" },
  { name: "Biscuit", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/409c38a43_WhatsAppImage2026-02-17at1923175.jpg" },
  { name: "Mama", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/1b09ee111_WhatsAppImage2026-02-17at1923174.jpg" },
  { name: "Sunny", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/e5de9f351_WhatsAppImage2026-02-17at192316.jpg" },
  { name: "Luna", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/13525cd25_WhatsAppImage2026-02-14at013153.jpg" },
  { name: "Midnight", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/25406fbcd_WhatsAppImage2026-01-22at174401.jpg" },
  { name: "Rusty", photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df9eaffb2_WhatsAppImage2026-02-17at1923172.jpg" },
];

export default function MilestoneCelebration({ milestone, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!milestone) return;
    // Fire confetti burst
    const fire = () => {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors: ['#F59E0B', '#EA580C', '#FCD34D', '#10B981'] });
    };
    fire();
    const t1 = setTimeout(fire, 700);
    const t2 = setTimeout(fire, 1400);

    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % celebrationDogs.length);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [milestone]);

  if (!milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-amber-900/95 to-orange-900/95 backdrop-blur-md p-4 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Big Thank You Banner */}
        <motion.div
          initial={{ scale: 0, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-6 z-10"
        >
          <p className="text-6xl mb-3">🎉</p>
          <h1 className="text-4xl font-black text-white mb-1 drop-shadow-lg">THANK YOU!</h1>
          <p className="text-xl text-amber-200 font-semibold mb-2">You unlocked a reward!</p>
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${milestone.color} px-5 py-2 rounded-full shadow-xl`}>
            <span className="text-2xl">{milestone.icon}</span>
            <span className="text-white font-bold text-lg">{milestone.title}</span>
          </div>
          <p className="text-amber-200 text-sm mt-2 max-w-xs mx-auto">{milestone.description}</p>
        </motion.div>

        {/* Dog Carousel */}
        <div className="relative w-full max-w-sm overflow-hidden">
          <p className="text-center text-amber-300 text-sm mb-3 font-medium">
            🐾 These pups say thank you! 🐾
          </p>

          {/* Main carousel image */}
          <div className="relative h-52 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -80, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="absolute flex flex-col items-center"
              >
                <img
                  src={celebrationDogs[currentIndex].photo}
                  alt={celebrationDogs[currentIndex].name}
                  className="w-44 h-44 rounded-3xl object-cover shadow-2xl border-4 border-white/30"
                />
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white font-bold text-lg mt-2"
                >
                  {celebrationDogs[currentIndex].name}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1 mt-4 flex-wrap px-4">
            {celebrationDogs.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="mt-6 bg-white text-amber-900 font-bold px-8 py-3 rounded-2xl shadow-xl hover:bg-amber-50 transition-colors text-lg"
        >
          Keep Feeding Dogs! 🐕
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}