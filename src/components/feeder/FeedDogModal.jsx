import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FeedDogModal({ isOpen, onClose, dog, feederProfile, user }) {
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState([null, null, null]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos(prev => { const p = [...prev]; p[index] = file_url; return p; });
      toast.success(`Photo ${index + 1} uploaded!`);
    } finally {
      setUploadingIndex(null);
    }
  };

  const uploadedCount = photos.filter(Boolean).length;

  const handleSubmit = async () => {
    if (uploadedCount === 0) {
      toast.error('Please upload at least 1 photo');
      return;
    }
    setSubmitting(true);
    try {
      const uploadedPhotos = photos.filter(Boolean);

      await base44.entities.FeedingLog.create({
        feeder_email: user.email,
        feeder_name: feederProfile.feeder_name,
        dogs_fed: 1,
        dog_name: dog.name,
        photo_url: uploadedPhotos[0],
        photo_urls: uploadedPhotos,
        location: `${feederProfile.city}, ${feederProfile.country}`,
        notes: notes || `Feeding update for ${dog.name}`
      });

      for (const url of uploadedPhotos) {
        await base44.entities.FeedingMedia.create({
          title: `${dog.name} feeding`,
          media_url: url,
          media_type: 'photo',
          location: `${feederProfile.city}, ${feederProfile.country}`,
          dogs_fed: 1
        });
        await base44.entities.FeedingPhotoBacklog.create({
          dog_id: dog.id,
          dog_name: dog.name,
          feeder_email: user.email,
          photo_url: url,
          is_used: false
        });
      }

      await base44.entities.FeederProfile.update(feederProfile.id, {
        total_feedings: (feederProfile.total_feedings || 0) + 1
      });

      toast.success(`Feeding update for ${dog.name} saved! 🐕`);
      setPhotos([null, null, null]);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['feederDogs'] });
      queryClient.invalidateQueries({ queryKey: ['photoBacklog'] });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPhotos([null, null, null]);
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: 'spring', damping: 28 }}
            className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {dog?.photo_url && (
                  <img src={dog.photo_url} alt={dog.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Feed {dog?.name}</h3>
                  <p className="text-xs text-gray-500">{dog?.city}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 bg-emerald-50 rounded-xl p-3 mb-5">
              📸 Upload photos of this feeding session and optionally add a short update note.
            </p>

            {/* Photo upload grid */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Photos <span className="text-gray-400 font-normal">(at least 1 required)</span></p>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(index => (
                  <div key={index} className="relative">
                    {photos[index] ? (
                      <div className="relative">
                        <img src={photos[index]} alt={`Photo ${index + 1}`} className="w-full aspect-square object-cover rounded-xl border-2 border-emerald-400" />
                        <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => { const p = [...photos]; p[index] = null; setPhotos(p); }}
                          className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5 text-white w-5 h-5 flex items-center justify-center text-xs"
                        >✕</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, index)} disabled={uploadingIndex !== null} />
                        {uploadingIndex === index
                          ? <div className="animate-pulse text-emerald-400 text-xs text-center">Uploading...</div>
                          : <><Camera className="w-5 h-5 text-emerald-300 mb-1" /><span className="text-xs text-emerald-400">{['Photo 1', 'Photo 2', 'Photo 3'][index]}</span></>
                        }
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Update note <span className="text-gray-400 font-normal">(optional)</span></p>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={`How is ${dog?.name} doing today? Any health updates?`}
                className="border-gray-200 resize-none h-20 text-sm"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || uploadedCount === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold"
            >
              {submitting ? 'Saving...' : <><Upload className="w-4 h-4 mr-2" />Submit Feeding Update ({uploadedCount}/3 photos)</>}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}