import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle, Images, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PhotoBacklogModal({ isOpen, onClose, dog, feederEmail }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: backlogPhotos = [] } = useQuery({
    queryKey: ['photoBacklog', dog?.id],
    queryFn: () => base44.entities.FeedingPhotoBacklog.filter({ dog_id: dog.id, feeder_email: feederEmail }, '-created_date', 50),
    enabled: !!dog?.id && isOpen
  });

  const unusedCount = backlogPhotos.filter(p => !p.is_used).length;
  const usedCount = backlogPhotos.filter(p => p.is_used).length;

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.FeedingPhotoBacklog.create({
          dog_id: dog.id,
          dog_name: dog.name,
          feeder_email: feederEmail,
          photo_url: file_url,
          is_used: false
        });
      }
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} added to backlog!`);
      queryClient.invalidateQueries({ queryKey: ['photoBacklog', dog.id] });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photo) => {
    if (photo.is_used) return;
    await base44.entities.FeedingPhotoBacklog.delete(photo.id);
    toast.success('Photo removed');
    queryClient.invalidateQueries({ queryKey: ['photoBacklog', dog.id] });
  };

  if (!isOpen || !dog) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          exit={{ y: 400 }}
          transition={{ type: 'spring', damping: 28 }}
          className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[92vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {dog.photo_url && (
                <img src={dog.photo_url} alt={dog.name} className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{dog.name}'s Photo Backlog</h3>
                <p className="text-xs text-gray-500">{dog.city}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-5">
            <p className="text-sm text-emerald-800 leading-relaxed">
              📸 <strong>Upload feeding photos ahead of time.</strong> When a donor sponsors {dog.name}'s meal, one of these photos will automatically be sent to them as proof of delivery — even if you're busy that day.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{unusedCount}</p>
              <p className="text-xs text-emerald-600">Ready to use</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-500">{usedCount}</p>
              <p className="text-xs text-gray-500">Already sent</p>
            </div>
          </div>

          {/* Upload button */}
          <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-4 mb-5 cursor-pointer transition-all ${uploading ? 'border-emerald-300 bg-emerald-50' : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50'}`}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading ? (
              <span className="text-sm text-emerald-600 animate-pulse font-medium">Uploading...</span>
            ) : (
              <>
                <Camera className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-emerald-700 font-semibold">Upload Feeding Photos</span>
                <span className="text-xs text-emerald-500">(select multiple)</span>
              </>
            )}
          </label>

          {/* Photo grid */}
          {backlogPhotos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No photos yet — upload some feeding photos above!</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Uploaded Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {backlogPhotos.map(photo => (
                  <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={photo.photo_url} alt="Feeding" className="w-full h-full object-cover" />
                    {photo.is_used ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <CheckCircle className="w-6 h-6 text-white mx-auto mb-1" />
                          <span className="text-white text-xs font-semibold">Sent</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(photo)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 rounded-full p-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                    {!photo.is_used && (
                      <div className="absolute bottom-1 left-1 bg-emerald-500 rounded-full px-1.5 py-0.5">
                        <span className="text-white text-xs font-bold">Ready</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onClose} variant="outline" className="w-full mt-6 rounded-xl border-gray-200">
            Done
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}