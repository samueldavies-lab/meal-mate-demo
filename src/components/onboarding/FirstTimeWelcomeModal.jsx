import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export default function FirstTimeWelcomeModal({ isOpen, onGoToMap }) {
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
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="text-6xl mb-3"
              >
                🐕
              </motion.div>
              <h1 className="text-2xl font-black text-white leading-tight mb-1">
                Welcome to MealMate!
              </h1>
              <p className="text-amber-100 text-sm font-medium">
                The only place where you can feed hungry stray dogs around the world — for free!
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-amber-50 rounded-2xl p-4 mb-5 border border-amber-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💝</span>
                  <div>
                    <p className="font-bold text-amber-900 text-sm mb-1">Here's how it works</p>
                    <p className="text-amber-700 text-sm">
                      Watch short ads → earn credits → feed real stray dogs. It costs you nothing but a few seconds of your time!
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {[
                  { step: '1', icon: '🗺️', text: 'Explore the world map & find dogs near you' },
                  { step: '2', icon: '🐾', text: 'Adopt 3 dogs into your feeding family' },
                  { step: '3', icon: '📺', text: 'Watch ads to earn meal credits' },
                  { step: '4', icon: '🍚', text: 'Your credit feeds your dogs for real!' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {step}
                    </div>
                    <span className="text-sm text-amber-800">
                      <span className="mr-1">{icon}</span>{text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={onGoToMap}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 rounded-2xl text-base font-bold shadow-lg shadow-orange-200"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Choose My First 3 Dogs!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}