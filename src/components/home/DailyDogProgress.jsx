import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dog, Eye, Play, CheckCircle2, MapPin, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DailyDogProgress({ current = 0, target = 5, dogsFed = 0, totalDogs = 1, onAdopt, excludeDogIds = [] }) {
  const navigate = useNavigate();
  const [showAdoptList, setShowAdoptList] = useState(false);
  const [adoptableDogs, setAdoptableDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(false);
  const [adopting, setAdopting] = useState(null);

  if (target === 0) return null;

  const percentage = Math.min(Math.floor((current / target) * 100), 100);
  const allDogsFed = dogsFed >= totalDogs;
  const remaining = target - current;

  const tier = allDogsFed ? 'green' : percentage <= 30 ? 'red' : percentage <= 70 ? 'amber' : 'green';

  const colors = {
    green: { bar: 'from-green-400 to-emerald-500', card: 'from-green-50 to-emerald-50 border-green-200', box: 'bg-green-100', icon: 'text-green-600', text: 'text-green-800', value: 'text-green-600', bg: 'bg-green-100', sub: 'text-green-600' },
    red: { bar: 'from-red-400 to-rose-500', card: 'bg-white border-red-200', box: 'bg-red-100', icon: 'text-red-600', text: 'text-red-800', value: 'text-red-600', bg: 'bg-red-100', sub: 'text-red-500' },
    amber: { bar: 'from-amber-400 to-orange-500', card: 'bg-white border-amber-200', box: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-800', value: 'text-amber-600', bg: 'bg-amber-100', sub: 'text-amber-600' },
  };

  const c = colors[tier];

  const openAdoptList = async () => {
    setLoadingDogs(true);
    setShowAdoptList(true);
    try {
      const dogs = await base44.entities.StrayDog.list(undefined, 500);
      setAdoptableDogs(dogs.filter(d => !excludeDogIds.includes(d.id)));
    } catch {
      setAdoptableDogs([]);
    }
    setLoadingDogs(false);
  };

  const adoptDog = async (dog) => {
    if (adopting) return;
    setAdopting(dog.id);
    const user = await base44.auth.me();
    if (!user?.email) {
      navigate('/');
      return;
    }
    try {
      await base44.entities.UserDog.create({
        user_email: user.email,
        dog_id: dog.id,
        dog_name: dog.name,
        dog_photo: dog.photo || '',
        dog_country: dog.country,
        dog_city: dog.city,
        meals_provided: 0,
        adoption_date: new Date().toISOString().split('T')[0],
      });
    } catch (_) {}
    setShowAdoptList(false);
    setAdopting(null);
    if (onAdopt) onAdopt();
    navigate('/');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`rounded-2xl p-5 shadow-sm border mb-6 ${c.card}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${c.box}`}>
              {allDogsFed
                ? <CheckCircle2 className={`w-5 h-5 ${c.icon}`} />
                : <Eye className={`w-5 h-5 ${c.icon}`} />
              }
            </div>
            <div>
              <p className={`text-sm font-semibold ${c.text}`}>
                {allDogsFed ? "You're a Hero! 🦸" : "Today's feeding progress"}
              </p>
              <p className={`text-xs ${c.sub}`}>
                {dogsFed} of {totalDogs} {totalDogs === 1 ? 'dog' : 'dogs'} fed — {current} of {target} ads
              </p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${c.value}`}>
            {percentage}%
          </span>
        </div>

        <div className={`h-3 ${c.bg} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
          />
        </div>

        {!allDogsFed && (
          <div className="flex items-center gap-1.5 mt-2">
            <Play className={`w-3 h-3 ${c.sub}`} />
            <p className={`text-xs ${c.sub}`}>
              {remaining > 0 ? `${remaining} more ad${remaining > 1 ? 's' : ''} remaining until you have fed all your dogs` : 'Select a dog to feed!'}
            </p>
          </div>
        )}

        {allDogsFed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 pt-4 border-t border-green-200 text-center"
          >
            <p className="text-sm text-green-700 font-medium">
              Every ad you watch helps feed a real stray dog. Thank you for making a difference!
            </p>
            <p className="text-sm text-green-600 mt-3">
              Still motivated to feed more hungry stray dogs?
            </p>
            <p className="text-sm font-semibold text-green-700 mt-1">
              Adopt another dog into your family 🐕
            </p>
            <button
              onClick={openAdoptList}
              className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full text-sm font-semibold transition-all shadow-md"
            >
              <MapPin className="w-4 h-4" />
              Select a Dog to Adopt
            </button>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAdoptList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-end justify-center"
            onClick={() => setShowAdoptList(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-h-[75vh] overflow-y-auto p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Adopt a Dog 🐕</h3>
                  <p className="text-xs text-amber-600">Choose one dog to add to your family</p>
                </div>
                <button onClick={() => setShowAdoptList(false)} className="p-2 hover:bg-amber-50 rounded-full">
                  <X className="w-5 h-5 text-amber-700" />
                </button>
              </div>

              {loadingDogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : adoptableDogs.length === 0 ? (
                <p className="text-center text-amber-600 py-8">No dogs available for adoption right now</p>
              ) : (
                <div className="space-y-3">
                  {adoptableDogs.map(dog => (
                    <div
                      key={dog.id}
                      className="flex gap-3 items-start bg-white rounded-2xl border border-amber-100 p-3"
                    >
                      {dog.photo && (
                        <img src={dog.photo} alt={dog.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-amber-900">{dog.name}</p>
                        <p className="text-xs text-amber-600">{dog.city}, {dog.country}</p>
                        {dog.description && (
                          <p className="text-xs text-amber-700 mt-1 line-clamp-2">{dog.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => adoptDog(dog)}
                        disabled={adopting === dog.id}
                        className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
                      >
                        {adopting === dog.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adopt'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
