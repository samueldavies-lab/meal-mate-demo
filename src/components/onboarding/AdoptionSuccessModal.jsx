import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

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
            {/* Header */}
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
              {/* Dog avatars */}
              {dogs.length > 0 && (
                <div className="flex justify-center gap-4 mb-5">
                  {dogs.map(dog => (
                    <div key={dog.id} className="flex flex-col items-center">
                      <img
                        src={dog.photo_url || dog.dog_photo}
                        alt={dog.name || dog.dog_name}
                        className="w-16 h-16 rounded-full object-cover border-3 border-emerald-300 shadow-md"
                      />
                      <span className="text-xs font-semibold text-amber-800 mt-1">{dog.name || dog.dog_name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message */}
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