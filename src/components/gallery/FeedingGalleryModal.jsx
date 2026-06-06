import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, Star, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FeedingFeedbackModal from './FeedingFeedbackModal';

export default function FeedingGalleryModal({ dog, onClose }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [feedbackLog, setFeedbackLog] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: feedingPhotos = [], isLoading } = useQuery({
    queryKey: ['feedingGallery', dog?.dog_id, dog?.dog_name],
    queryFn: async () => {
      if (!dog) return [];
      const logs = await base44.entities.FeedingLog.list('-created_date', 100);
      return logs.filter(
        l => l.photo_url && l.dog_name &&
          l.dog_name.toLowerCase().trim() === dog.dog_name.toLowerCase().trim()
      );
    },
    enabled: !!dog
  });

  // Fetch existing feedback to know which logs already rated
  const { data: existingFeedback = [] } = useQuery({
    queryKey: ['feedingFeedback', user?.email, dog?.dog_id],
    queryFn: () => base44.entities.FeedingFeedback.filter({ user_email: user.email, dog_id: dog.dog_id }),
    enabled: !!user?.email && !!dog?.dog_id
  });

  if (!dog) return null;

  const prev = () => setCarouselIndex(i => (i === 0 ? feedingPhotos.length - 1 : i - 1));
  const next = () => setCarouselIndex(i => (i === feedingPhotos.length - 1 ? 0 : i + 1));

  const currentPhoto = feedingPhotos[carouselIndex];
  const alreadyRated = currentPhoto && existingFeedback.some(f => f.feeding_log_id === currentPhoto.id);

  // Suggest feedback every 3rd photo (index 2, 5, 8…) if not already rated
  const isFeedbackSuggested = currentPhoto && !alreadyRated && (carouselIndex + 1) % 3 === 0;

  // Average rating for this feeding log
  const feedbackForCurrent = currentPhoto && existingFeedback.find(f => f.feeding_log_id === currentPhoto.id);
  const avgRating = feedbackForCurrent?.overall_rating ?? null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
            onClick={onClose}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-white text-xl font-bold text-center mb-1">{dog.dog_name}</h2>
            <p className="text-white/60 text-sm text-center mb-4">Feeding Gallery</p>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : feedingPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/50 gap-3">
                <Camera className="w-16 h-16" />
                <p className="text-center">No feeding photos yet.<br />Check back after the next meal!</p>
              </div>
            ) : (
              <>
                {/* Main photo */}
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-black">
                  <img
                    src={feedingPhotos[carouselIndex].photo_url}
                    alt={`Feeding ${carouselIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {feedingPhotos.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {feedingPhotos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === carouselIndex ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Caption */}
                <div className="mt-3 text-center text-white/70 text-sm">
                  {feedingPhotos[carouselIndex].feeder_name && (
                    <p>📸 By {feedingPhotos[carouselIndex].feeder_name}</p>
                  )}
                  <p>{new Date(feedingPhotos[carouselIndex].created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-white/40 text-xs mt-1">{carouselIndex + 1} / {feedingPhotos.length}</p>
                </div>

                {/* Existing rating display */}
                {avgRating && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-white/30 fill-white/10'}`} />
                    ))}
                    <span className="text-white/70 text-xs ml-1">Your rating: {avgRating}/5 stars</span>
                  </div>
                )}

                {/* Feedback prompt / button */}
                {!alreadyRated && (
                  <button
                    onClick={() => setFeedbackLog(feedingPhotos[carouselIndex])}
                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isFeedbackSuggested
                        ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isFeedbackSuggested ? '⭐ Rate this feeding!' : 'Rate this feeding'}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <FeedingFeedbackModal
        isOpen={!!feedbackLog}
        onClose={() => setFeedbackLog(null)}
        dog={dog}
        feedingLog={feedbackLog}
        userEmail={user?.email}
      />
    </>
  );
}