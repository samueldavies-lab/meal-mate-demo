import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedConfirmationModal({ dogs, onComplete }) {
  const [index, setIndex] = useState(0);
  const dog = dogs[index];
  const isLast = index >= dogs.length - 1;

  const next = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex(i => i + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key={index}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          {/* Dog photo */}
          <div className="relative h-56 bg-gradient-to-br from-amber-100 to-orange-100">
            {dog.dog_photo ? (
              <img src={dog.dog_photo} alt={dog.dog_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dog className="w-20 h-20 text-amber-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <p className="text-xl font-bold drop-shadow-lg">{dog.dog_name}</p>
              <div className="flex items-center gap-1 text-sm text-white/80">
                <MapPin className="w-3.5 h-3.5" />
                <span>{dog.dog_city}{dog.dog_country ? `, ${dog.dog_country}` : ''}</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Fed ✓
            </div>
          </div>

          {/* Content */}
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Meal Delivered! 🎉</h3>
              <p className="text-sm text-amber-600 mb-4">
               {dog.dog_name}'s meal was delivered on{' '}
               {new Date(dog.scheduled_at || dog.fed_at).toLocaleDateString(undefined, {
                 weekday: 'long', month: 'short', day: 'numeric'
               })}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-5">
              {dogs.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === index ? 'bg-amber-500 w-4' : i < index ? 'bg-green-400' : 'bg-amber-200'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={next}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-5 rounded-xl font-semibold text-base"
            >
              {isLast ? 'Done! 🐾' : `Next Dog (${index + 1}/${dogs.length}) →`}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
