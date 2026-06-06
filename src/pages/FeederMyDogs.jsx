import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Camera, Plus, Clock, MapPin, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AddDogModal from '@/components/feeder/AddDogModal';

const SESSION_KEY = 'feeder_activated';
const TRAINING_KEY = 'feeder_training_completed';

export default function FeederMyDogs() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [feederProfile, setFeederProfile] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [mealData, setMealData] = useState({ time: '', date: '', location: '', photos: [null, null, null] });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [showAddDog, setShowAddDog] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      window.location.href = '/FeederGate';
      return;
    }
    if (localStorage.getItem(TRAINING_KEY) === 'false') {
      window.location.href = '/FeederTraining';
      return;
    }
    base44.auth.me().then(setUser);
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FeederProfile.filter({ user_email: user.email }).then(profiles => {
      if (profiles.length > 0) setFeederProfile(profiles[0]);
    });
  }, [user]);

  const { data: myDogs = [] } = useQuery({
    queryKey: ['myDogs', user?.email],
    queryFn: async () => {
      const allDogs = await base44.entities.UserDog.filter({
        user_email: user.email
      });
      return allDogs;
    },
    enabled: !!user?.email
  });

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newPhotos = [...mealData.photos];
      newPhotos[index] = file_url;
      setMealData({ ...mealData, photos: newPhotos });
      toast.success(`Photo ${index + 1} uploaded!`);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddDog = async (dog) => {
    if (!user?.email) return;
    try {
      await base44.entities.UserDog.create({
        user_email: user.email,
        dog_id: dog.id,
        dog_name: dog.name,
        dog_photo: dog.photo_url,
        dog_country: dog.country,
        dog_city: dog.city,
        meals_provided: 0,
        adopted_date: new Date().toISOString().split('T')[0]
      });
      toast.success(`${dog.name} added to My Dogs!`);
      setShowAddDog(false);
      queryClient.invalidateQueries({ queryKey: ['myDogs'] });
    } catch (error) {
      toast.error('Failed to add dog');
    }
  };

  const handleLogMeal = async () => {
    if (!selectedDog || !mealData.date || !mealData.time || !mealData.location || mealData.photos.filter(Boolean).length < 3) {
      toast.error('Please fill in all fields and upload 3 photos');
      return;
    }

    setSubmitting(true);
    try {
      const mealDateTime = `${mealData.date}T${mealData.time}`;
      
      await base44.entities.FeedingLog.create({
        feeder_email: user.email,
        feeder_name: feederProfile.feeder_name,
        dogs_fed: 1,
        dog_name: selectedDog.dog_name,
        photo_url: mealData.photos[0],
        photo_urls: mealData.photos,
        location: mealData.location,
        notes: `Meal logged for ${selectedDog.dog_name} on ${mealData.date} at ${mealData.time}`
      });

      // Update dog's meals_provided
      await base44.entities.UserDog.update(selectedDog.id, {
        meals_provided: (selectedDog.meals_provided || 1) + 1
      });

      // Add to media gallery
      for (const photoUrl of mealData.photos) {
        if (photoUrl) {
          await base44.entities.FeedingMedia.create({
            title: `${selectedDog.dog_name} meal`,
            media_url: photoUrl,
            media_type: 'photo',
            location: mealData.location,
            dogs_fed: 1
          });
        }
      }

      toast.success(`Meal logged for ${selectedDog.dog_name}! 🐕`);
      setSelectedDog(null);
      setMealData({ time: '', date: '', location: '', photos: [null, null, null] });
      queryClient.invalidateQueries({ queryKey: ['myDogs'] });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !feederProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/95 backdrop-blur border-b border-emerald-100">
        <div className="relative px-6 pt-6 pb-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">My Dogs</h1>
              <p className="text-emerald-700 text-sm">{myDogs.length} dogs in your network</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dogs Grid */}
      <div className="px-6 py-6 space-y-4">
        {myDogs.length > 0 && (
          <button
            onClick={() => setShowAddDog(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-3 rounded-xl transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Another Dog
          </button>
        )}
        {myDogs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {myDogs.map((dog) => (
              <motion.div
                key={dog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedDog(dog)}
                className="rounded-2xl overflow-hidden border-2 border-emerald-100 bg-white cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all"
              >
                {dog.dog_photo && (
                  <img src={dog.dog_photo} alt={dog.dog_name} className="w-full h-40 object-cover" />
                )}
                <div className="p-3 bg-emerald-50">
                  <p className="font-bold text-emerald-900 text-sm">{dog.dog_name}</p>
                  <p className="text-xs text-emerald-600 mb-2">{dog.dog_city}</p>
                  <p className="text-xs text-emerald-500 font-medium">Meals: {dog.meals_provided || 1}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-emerald-700 font-medium">No dogs in your network yet</p>
            <p className="text-sm text-emerald-600 mb-4">Select dogs from your city to start feeding them</p>
            <button
              onClick={() => setShowAddDog(true)}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Dog
            </button>
          </div>
        )}
      </div>

      {/* Add Dog Modal */}
      <AnimatePresence>
        {showAddDog && (
          <AddDogModal
            isOpen={showAddDog}
            onClose={() => setShowAddDog(false)}
            onAddDog={handleAddDog}
            feederCity={feederProfile?.city}
            feederCountry={feederProfile?.country}
            existingDogIds={new Set(myDogs.map(d => d.dog_id))}
          />
        )}
      </AnimatePresence>

      {/* Meal Log Modal */}
      <AnimatePresence>
        {selectedDog && (
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
                <h2 className="text-xl font-bold text-emerald-900">Log Meal for {selectedDog.dog_name}</h2>
                <button
                  onClick={() => setSelectedDog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <Label className="text-emerald-800 block mb-2">Date *</Label>
                  <Input
                    type="date"
                    value={mealData.date}
                    onChange={(e) => setMealData({ ...mealData, date: e.target.value })}
                    className="border-emerald-200"
                  />
                </div>

                {/* Time */}
                <div>
                  <Label className="text-emerald-800 block mb-2">Time *</Label>
                  <Input
                    type="time"
                    value={mealData.time}
                    onChange={(e) => setMealData({ ...mealData, time: e.target.value })}
                    className="border-emerald-200"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label className="text-emerald-800 block mb-2">Location *</Label>
                  <Input
                    value={mealData.location}
                    onChange={(e) => setMealData({ ...mealData, location: e.target.value })}
                    placeholder="e.g., Near market, Park entrance"
                    className="border-emerald-200"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label className="text-emerald-800 block mb-2">Photos (3 required) *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="relative">
                        {mealData.photos[index] ? (
                          <div className="relative">
                            <img
                              src={mealData.photos[index]}
                              alt={`Photo ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-xl border-2 border-emerald-400"
                            />
                            <button
                              onClick={() => {
                                const newPhotos = [...mealData.photos];
                                newPhotos[index] = null;
                                setMealData({ ...mealData, photos: newPhotos });
                              }}
                              className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5 text-white text-xs w-5 h-5 flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, index)}
                              disabled={uploadingIndex !== null}
                            />
                            {uploadingIndex === index ? (
                              <div className="animate-pulse text-emerald-400 text-xs text-center">Uploading...</div>
                            ) : (
                              <>
                                <Camera className="w-5 h-5 text-emerald-300 mb-1" />
                                <span className="text-xs text-emerald-400 text-center">Photo {index + 1}</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">Upload 3 photos of the meal feeding</p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleLogMeal}
                  disabled={submitting || mealData.photos.filter(Boolean).length < 3}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold mt-6"
                >
                  {submitting ? 'Logging...' : 'Log Meal'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}