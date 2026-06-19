import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, X, MapPin, Heart, ChevronLeft, ChevronRight, Clock, Camera, Utensils, Play, Gift, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import FeedDogModal from '../components/gallery/FeedDogModal';

const fallbackBios = {
  'dog-1': { bio: 'Coco lives in a rescue shelter in Kathmandu and loves her cozy sweater and warm blankets. She is playful and friendly with everyone she meets.', feeder: 'Puja Lama' },
  'dog-2': { bio: 'Shadow was found on the streets of Pokhara as a young puppy. He is now thriving with daily meals and loves to play with anyone who visits.', feeder: 'Hari Shrestha' },
  'dog-3': { bio: 'Bruno is a friendly shelter dog in Delhi with the sweetest smile. He loves belly rubs and greets every visitor with a wagging tail.', feeder: 'Ravi Kumar' },
  'dog-4': { bio: 'Goldie lives near a local market in Jaipur and is always eager for her daily meal. She is well known by the local traders who look out for her.', feeder: 'Priya Sharma' },
  'dog-5': { bio: 'Kalu is a gentle giant at the rescue shelter in Kathmandu. He loves lounging on the grass and is very calm around other dogs and people.', feeder: 'Puja Lama' },
  'dog-6': { bio: 'Fluffy is a sweet street dog in Pokhara with a fluffy tail that never stops wagging. She is young, healthy and full of energy.', feeder: 'Hari Shrestha' },
  'dog-7': { bio: 'Casper was found wandering the streets of Mumbai and is now getting regular meals from our feeders. He is gentle and loves attention.', feeder: 'Anita Patel' },
  'dog-8': { bio: 'Patches lives around a metal workshop in Bhaktapur and is the only surviving puppy of a litter of 6. He is currently healthy, vaccinated and being fed on a regular basis.', feeder: 'Puja Lama' },
  'dog-9': { bio: 'Blackie is a senior dog recovering at the shelter in Kathmandu with a leg injury. He needs nutritious meals to help him regain his strength.', feeder: 'Puja Lama' },
  'dog-10': { bio: 'Oreo is a calm shelter resident in Pokhara with soulful eyes. He is patient, well-behaved and always grateful for his next meal.', feeder: 'Hari Shrestha' },
  'dog-11': { bio: 'Ginger was rescued and is recovering at a shelter in Varanasi. She is grateful for every meal she receives and is slowly regaining her health.', feeder: 'Sunita Singh' },
  'dog-12': { bio: 'Marigold is celebrated during local festivals in Kathmandu and is loved by the community. She is a well-known and well-loved street dog.', feeder: 'Puja Lama' },
  'dog-13': { bio: 'Rusty is a happy-go-lucky street dog in Bali who loves greeting tourists and following locals on their morning walks. He is young, healthy and full of energy.', feeder: 'Ketut Sujana' },
  'dog-14': { bio: 'Hope was severely malnourished when found in Chennai and is now recovering with regular meals. She is gentle and trusting despite her difficult start.', feeder: 'Meena Rajan' },
  'dog-15': { bio: 'Biscuit is a hungry street pup in Kolkata who depends on community feeders for survival. He is young, energetic and loves to run around.', feeder: 'Debashis Roy' },
  'dog-16': { bio: 'Mama is a street mother in Lalitpur caring for her pup. She needs extra nutrition to keep herself and her baby healthy and strong.', feeder: 'Puja Lama' },
  'dog-17': { bio: 'Sunny is a street mom watching over her puppies at a local market in Bangalore. She is protective and devoted to keeping her family safe.', feeder: 'Kavya Nair' },
  'dog-18': { bio: 'Luna is a beautiful white dog found in the countryside near Seoul. She is now getting regular meals from local feeders and is thriving.', feeder: 'Ji-young Park' },
  'dog-19': { bio: 'Midnight is a sweet black dog living on the streets of Seoul. She loves her daily meals and has become a familiar face to local feeders.', feeder: 'Ji-young Park' },
};

// Stock feeding photos with realistic metadata
const stockFeedingPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    date: '2026-05-14',
    time: '07:32 AM',
    location: 'Kathmandu, Nepal',
    lat: '27.7172° N',
    lng: '85.3240° E',
  },
  {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80',
    date: '2026-05-13',
    time: '08:11 AM',
    location: 'Kathmandu, Nepal',
    lat: '27.7174° N',
    lng: '85.3238° E',
  },
  {
    url: 'https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=600&q=80',
    date: '2026-05-12',
    time: '07:55 AM',
    location: 'Kathmandu, Nepal',
    lat: '27.7170° N',
    lng: '85.3241° E',
  },
  {
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
    date: '2026-05-11',
    time: '08:22 AM',
    location: 'Kathmandu, Nepal',
    lat: '27.7172° N',
    lng: '85.3239° E',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    date: '2026-05-10',
    time: '07:48 AM',
    location: 'Kathmandu, Nepal',
    lat: '27.7173° N',
    lng: '85.3242° E',
  },
];

export default function Gallery() {
   const location = useLocation();
   const [user, setUser] = useState(null);
   const [selectedDog, setSelectedDog] = useState(null);
   const [feedCarouselIndex, setFeedCarouselIndex] = useState(0);
   const [feedingDog, setFeedingDog] = useState(null);
   const [showFirstMealPrompt, setShowFirstMealPrompt] = useState(false);
   const [newlyAdoptedDog, setNewlyAdoptedDog] = useState(null);

   useEffect(() => {
     base44.auth.me().then(async (u) => {
       setUser(u);
       if (u?.email) {
         // Clean up any duplicate dog records
         await base44.functions.invoke('cleanupDuplicateDogs', {});
       }
     });
   }, []);

   useEffect(() => {
     // Check if redirected from StrayMap with newly adopted dog
     if (location.state?.dogAdopted) {
       setNewlyAdoptedDog(location.state.dogAdopted);
       setShowFirstMealPrompt(true);
     }
   }, [location]);

  const { data: userDogs = [] } = useQuery({
    queryKey: ['userDogs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const dogs = await base44.entities.UserDog.filter({ user_email: user.email });
      const dogMap = {};
      for (const dog of dogs) {
        if (dogMap[dog.dog_id]) {
          dogMap[dog.dog_id].meals += dog.meals_provided || 1;
        } else {
          dogMap[dog.dog_id] = {
            id: dog.id,
            dog_name: dog.dog_name,
            location: `${dog.dog_city}, ${dog.dog_country}`,
            meals: dog.meals_provided || 1,
            photo_url: dog.dog_photo,
            adoption_date: dog.adoption_date,
            dog_id: dog.dog_id
          };
        }
      }
      return Object.values(dogMap);
    },
    enabled: !!user?.email
  });

  const { data: feederProfiles = [] } = useQuery({
    queryKey: ['allFeederProfiles'],
    queryFn: () => base44.entities.FeederProfile.list(),
  });

  const getFeederPhoto = (feederName) => {
    const profile = feederProfiles.find(
      p => p.feeder_name?.toLowerCase().trim() === feederName?.toLowerCase().trim()
    );
    return profile?.profile_photo || null;
  };

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: pendingMeals = [] } = useQuery({
    queryKey: ['allPendingMeals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.PendingMeal.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const { data: rewardAllocations = [] } = useQuery({
    queryKey: ['rewardAllocations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.RewardAllocation.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const { data: dogBios = {} } = useQuery({
    queryKey: ['dogBios', user?.email],
    queryFn: async () => {
      if (!user?.email || userDogs.length === 0) return {};
      const dogIds = userDogs.map(d => d.dog_id);
      try {
        const allBios = await base44.entities.DogBio.list();
        const bioMap = {};
        for (const record of allBios) {
          if (dogIds.includes(record.dog_id)) {
            bioMap[record.dog_id] = { bio: record.bio, source: 'ai' };
          }
        }
        for (const id of dogIds) {
          if (!bioMap[id] && fallbackBios[id]) {
            bioMap[id] = { ...fallbackBios[id], source: 'fallback' };
          }
        }
        return bioMap;
      } catch {
        const bioMap = {};
        for (const id of dogIds) {
          if (fallbackBios[id]) bioMap[id] = { ...fallbackBios[id], source: 'fallback' };
        }
        return bioMap;
      }
    },
    enabled: !!user?.email && userDogs.length > 0,
  });

  const generateBioMutation = useMutation({
    mutationFn: async (dog) => {
      const res = await fetch('/.netlify/functions/generate-dog-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dog_id: dog.dog_id,
          name: dog.dog_name,
          country: dog.dog_country || dog.location?.split(', ')[1],
          city: dog.dog_city || dog.location?.split(', ')[0],
        }),
      });
      if (!res.ok) throw new Error('Failed to generate bio');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogBios', user?.email] });
    },
  });

  const getLatestReward = (dogId) => {
    const dogRewards = rewardAllocations
      .filter(r => r.dog_id === dogId && r.is_completed)
      .sort((a, b) => new Date(b.completed_at || b.created_date) - new Date(a.completed_at || a.created_date));
    return dogRewards[0] || null;
  };

  const getMealStatus = (dog) => {
    const dogPendingMeals = pendingMeals.filter(m => m.dog_id === dog.dog_id);
    const deliveredMeals = dogPendingMeals.filter(m => m.status === 'delivered').length;
    const stillPending = dogPendingMeals.filter(m => m.status === 'pending').length;
    const deliveredMealDates = dogPendingMeals
      .filter(m => m.status === 'delivered' && (m.created_at || m.delivered_at))
      .map(m => new Date(m.created_at || m.delivered_at).getTime());
    let daysSinceLastMeal = null;
    if (deliveredMealDates.length > 0) {
      const lastMealDate = Math.max(...deliveredMealDates);
      daysSinceLastMeal = Math.floor((Date.now() - lastMealDate) / (1000 * 60 * 60 * 24));
    }
    return { delivered: deliveredMeals, pending: stillPending, daysSinceLastMeal };
  };

  const displayDogs = userDogs;
  const totalMeals = displayDogs.reduce((sum, d) => sum + d.meals, 0);

  const openDogModal = (dog) => {
    setSelectedDog(dog);
    setFeedCarouselIndex(0);
  };

  const closeModal = () => {
    setSelectedDog(null);
    setFeedCarouselIndex(0);
  };

  const currentPhoto = stockFeedingPhotos[feedCarouselIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">My Dogs</h1>
              <p className="text-amber-700 text-sm">Dogs you've helped feed</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-4 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8" />
              <div>
                <p className="font-semibold">{displayDogs.length} Dogs</p>
                <p className="text-sm text-rose-100">In your family</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalMeals}</p>
              <p className="text-sm text-rose-100">Total meals</p>
            </div>
          </div>
        </motion.div>

        {/* Dogs List */}
        {displayDogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Dog className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">No dogs yet</h3>
            <p className="text-amber-600 text-sm">Watch 5 ads to provide a meal and adopt your first dog!</p>
          </motion.div>
        )}

        <div className="space-y-3">
           {displayDogs.map((dog, index) => (
             <motion.div
               key={dog.dog_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openDogModal(dog)}
              className="bg-white rounded-xl p-3 shadow-sm border border-amber-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              {dog.photo_url ? (
                <img src={dog.photo_url} alt={dog.dog_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Dog className="w-6 h-6 text-amber-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                 <h3 className="font-semibold text-amber-900 truncate">{dog.dog_name}</h3>
                 <div className="flex items-center gap-1 text-amber-600 text-sm">
                   <MapPin className="w-3 h-3 flex-shrink-0" />
                   <span className="truncate">{dog.location}</span>
                 </div>
                 {(() => {
                   const reward = getLatestReward(dog.dog_id);
                   if (!reward) return null;
                   const rewardDate = reward.completed_at || reward.created_date;
                   const dateStr = rewardDate ? new Date(rewardDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                   return (
                     <div className="flex items-center gap-1 mt-1">
                       <Gift className="w-3 h-3 text-pink-500 flex-shrink-0" />
                       <span className="text-xs text-pink-600 font-medium truncate">{reward.reward_title}{dateStr ? ` · ${dateStr}` : ''}</span>
                     </div>
                   );
                 })()}
               </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {(() => {
                  const status = getMealStatus(dog);
                  return (
                    <div className="space-y-0.5 text-right">
                      {status.delivered > 0 && (
                        <div className="text-right space-y-0.5">
                          <p className="text-xs text-amber-500">Meals = <span className="font-bold text-amber-900">{status.delivered}</span></p>
                          {status.daysSinceLastMeal !== null && (
                            <p className="text-xs text-amber-500">Last fed = <span className="font-semibold text-amber-700">{status.daysSinceLastMeal === 0 ? 'today' : `${status.daysSinceLastMeal}d ago`}</span></p>
                          )}
                        </div>
                      )}
                      {status.pending > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{status.pending} pending</span>
                        </div>
                      )}
                      {status.delivered === 0 && status.pending === 0 && (
                        <p className="text-xs text-amber-500">Meals = <span className="font-bold text-amber-900">{dog.meals}</span></p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* First Meal Prompt Modal */}
       <AnimatePresence>
         {showFirstMealPrompt && newlyAdoptedDog && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center px-4"
           >
             <motion.div
               initial={{ scale: 0.85, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.85, opacity: 0, y: 30 }}
               transition={{ type: 'spring', stiffness: 260, damping: 22 }}
               className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
             >
               {/* Header */}
               <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center">
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                   className="text-5xl mb-3"
                 >
                   🎉
                 </motion.div>
                 <h2 className="text-2xl font-black text-white leading-tight">
                   {newlyAdoptedDog.name} is here!
                 </h2>
                 <p className="text-amber-100 text-sm font-medium mt-1">
                   Welcome to your family
                 </p>
               </div>

               {/* Body */}
               <div className="p-6">
                 <div className="bg-amber-50 rounded-2xl p-4 mb-5 border border-amber-100">
                   <p className="text-amber-900 text-sm">
                     Watch <span className="font-bold">5 short ads</span> to provide {newlyAdoptedDog.name} their <span className="font-bold">first meal</span>!
                   </p>
                 </div>

                 <div className="space-y-2 mb-6">
                   <button
                     onClick={() => {
                       setShowFirstMealPrompt(false);
                       setFeedingDog(newlyAdoptedDog);
                     }}
                     className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                   >
                     <Play className="w-4 h-4" />
                     Watch Ads Now
                   </button>
                   <button
                     onClick={() => setShowFirstMealPrompt(false)}
                     className="w-full py-3 rounded-2xl border border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
                   >
                     Later
                   </button>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Feed Dog Modal */}
       <FeedDogModal
         isOpen={!!feedingDog}
         onClose={() => setFeedingDog(null)}
         dog={feedingDog}
         userEmail={user?.email}
         userStats={userStats}
       />

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="relative w-full max-w-md mx-auto px-4 pt-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-2 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Dog name & location */}
              <div className="text-center mb-4 pt-2">
                <h3 className="text-2xl font-bold text-white">{selectedDog.dog_name}</h3>
                <div className="flex items-center justify-center gap-1 mt-1 text-white/60 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedDog.location}</span>
                </div>
              </div>

              {/* Bio & Feeder */}
              {(() => {
                const bioData = dogBios[selectedDog.dog_id] || fallbackBios[selectedDog.dog_id];
                if (!bioData) {
                  return (
                    <div className="bg-white/10 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/50">No bio yet</p>
                        <button
                          onClick={() => generateBioMutation.mutate(selectedDog)}
                          disabled={generateBioMutation.isPending}
                          className="flex items-center gap-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {generateBioMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Generate AI Bio
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-white/10 rounded-2xl p-4 mb-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white/85 leading-relaxed">{bioData.bio}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                      {(() => {
                        const feederName = bioData.feeder;
                        if (!feederName) return null;
                        const feederPhoto = getFeederPhoto(feederName);
                        return (
                          <>
                            {feederPhoto ? (
                              <img src={feederPhoto} alt={feederName} className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-amber-400/30 flex items-center justify-center flex-shrink-0 border-2 border-amber-400/50">
                                <span className="text-lg">🐾</span>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-white/50">Feeder</p>
                              <p className="text-sm text-amber-300 font-semibold">{feederName}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Meal stats */}
              {(() => {
                const status = getMealStatus(selectedDog);
                return (
                  <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-400">{status.delivered || selectedDog.meals}</p>
                      <p className="text-xs text-white/60">meals delivered</p>
                    </div>
                    {status.pending > 0 && (
                      <div className="flex-1 bg-orange-500/20 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-300">
                          <Clock className="w-4 h-4" />
                          <p className="text-2xl font-bold">{status.pending}</p>
                        </div>
                        <p className="text-xs text-orange-200">pending</p>
                      </div>
                    )}
                    {status.daysSinceLastMeal !== null && (
                      <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">{status.daysSinceLastMeal === 0 ? '✓' : `${status.daysSinceLastMeal}d`}</p>
                        <p className="text-xs text-white/60">{status.daysSinceLastMeal === 0 ? 'fed today' : 'since last meal'}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Feed this dog CTA */}
              <button
                onClick={() => { closeModal(); setFeedingDog(selectedDog); }}
                className="w-full mb-5 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                <Utensils className="w-5 h-5" />
                Feed {selectedDog?.dog_name} Now (watch 5 ads)
              </button>

              {/* Feeding Photo Carousel */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">Feeding Journal</p>
                  <span className="text-xs text-white/40 ml-auto">{feedCarouselIndex + 1} / {stockFeedingPhotos.length}</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={feedCarouselIndex}
                      src={currentPhoto.url}
                      alt="Feeding photo"
                      className="w-full aspect-[4/3] object-cover"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.25 }}
                    />
                  </AnimatePresence>

                  {/* Timestamp overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white text-xs font-semibold">{currentPhoto.date} · {currentPhoto.time}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <p className="text-amber-300 text-xs">{currentPhoto.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-[10px]">{currentPhoto.lat}</p>
                        <p className="text-white/50 text-[10px]">{currentPhoto.lng}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nav arrows */}
                  <button
                    onClick={() => setFeedCarouselIndex(prev => prev === 0 ? stockFeedingPhotos.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setFeedCarouselIndex(prev => prev === stockFeedingPhotos.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {stockFeedingPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeedCarouselIndex(idx)}
                      className={`transition-all rounded-full ${idx === feedCarouselIndex ? 'w-5 h-2 bg-amber-400' : 'w-2 h-2 bg-white/25'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}