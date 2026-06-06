import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Minus, Check, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FeederFeedingTab({ feederProfile, user }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ dogs_fed: 1, dog_name: '', photo_url: '', notes: '' });

  const { data: recentFeedings = [] } = useQuery({
    queryKey: ['recentFeedings', user?.email],
    queryFn: async () => base44.entities.FeedingLog.filter({ feeder_email: user.email }, '-created_date', 10),
    enabled: !!user?.email
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: file_url }));
      toast.success('Photo uploaded!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !feederProfile) return;
    setIsSubmitting(true);
    try {
      await base44.entities.FeedingLog.create({
        feeder_email: user.email,
        feeder_name: feederProfile.feeder_name,
        dogs_fed: formData.dogs_fed,
        dog_name: formData.dog_name,
        photo_url: formData.photo_url,
        location: `${feederProfile.city}, ${feederProfile.country}`,
        notes: formData.notes
      });

      await base44.entities.FeederProfile.update(feederProfile.id, {
        total_dogs_fed: (feederProfile.total_dogs_fed || 0) + formData.dogs_fed,
        total_feedings: (feederProfile.total_feedings || 0) + 1
      });

      if (formData.photo_url) {
        await base44.entities.FeedingMedia.create({
          title: formData.dog_name ? `${formData.dog_name} enjoying a meal` : 'Stray dogs enjoying a meal',
          media_url: formData.photo_url,
          media_type: 'photo',
          location: `${feederProfile.city}, ${feederProfile.country}`,
          dogs_fed: formData.dogs_fed
        });
      }

      toast.success(`Logged ${formData.dogs_fed} dog${formData.dogs_fed > 1 ? 's' : ''} fed! 🐕`);
      setFormData({ dogs_fed: 1, dog_name: '', photo_url: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['recentFeedings'] });
      queryClient.invalidateQueries({ queryKey: ['feederProfile'] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 pb-8 space-y-5">
      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 rounded-2xl p-4 text-center border border-emerald-100">
          <p className="text-3xl font-bold text-emerald-900">{feederProfile?.total_dogs_fed || 0}</p>
          <p className="text-sm text-emerald-600">Dogs Fed</p>
        </div>
        <div className="bg-white/80 rounded-2xl p-4 text-center border border-emerald-100">
          <p className="text-3xl font-bold text-emerald-900">{feederProfile?.total_feedings || 0}</p>
          <p className="text-sm text-emerald-600">Total Feedings</p>
        </div>
      </motion.div>

      {/* Log Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h2 className="text-lg font-semibold text-emerald-900 mb-4">Log a Feeding</h2>

        <div className="mb-5">
          <Label className="text-emerald-800 mb-2 block">Number of Dogs Fed</Label>
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" size="icon"
              onClick={() => setFormData(prev => ({ ...prev, dogs_fed: Math.max(1, prev.dogs_fed - 1) }))}
              className="h-12 w-12 rounded-full border-emerald-200">
              <Minus className="w-5 h-5" />
            </Button>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-800">{formData.dogs_fed}</span>
            </div>
            <Button type="button" variant="outline" size="icon"
              onClick={() => setFormData(prev => ({ ...prev, dogs_fed: prev.dogs_fed + 1 }))}
              className="h-12 w-12 rounded-full border-emerald-200">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-emerald-800">Dog's Name (optional)</Label>
          <Input value={formData.dog_name}
            onChange={(e) => setFormData(prev => ({ ...prev, dog_name: e.target.value }))}
            placeholder="If you know their name"
            className="mt-1 border-emerald-200 focus:border-emerald-400" />
        </div>

        <div className="mb-4">
          <Label className="text-emerald-800 mb-2 block">Upload Photo</Label>
          {formData.photo_url ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={formData.photo_url} alt="Feeding" className="w-full h-48 object-cover" />
              <button onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white text-xs">✕</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
              {isUploading ? (
                <div className="animate-pulse text-emerald-600 text-sm">Uploading...</div>
              ) : (
                <><Camera className="w-8 h-8 text-emerald-400 mb-2" /><span className="text-sm text-emerald-600">Tap to upload photo</span></>
              )}
            </label>
          )}
        </div>

        <div className="mb-5">
          <Label className="text-emerald-800">Notes (optional)</Label>
          <Textarea value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes..."
            className="mt-1 border-emerald-200 focus:border-emerald-400 resize-none h-20" />
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6 rounded-xl text-lg font-semibold">
          {isSubmitting ? 'Logging...' : <><Check className="w-5 h-5 mr-2" />Log Feeding</>}
        </Button>
      </motion.div>

      {/* Recent Feedings */}
      {recentFeedings.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Recent Feedings</h3>
          <div className="space-y-3">
            {recentFeedings.map((feeding) => (
              <div key={feeding.id} className="bg-white/80 rounded-xl p-4 border border-emerald-100 flex items-center gap-4">
                {feeding.photo_url ? (
                  <img src={feeding.photo_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Image className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-emerald-900">
                    {feeding.dogs_fed} dog{feeding.dogs_fed > 1 ? 's' : ''} fed
                    {feeding.dog_name && ` — ${feeding.dog_name}`}
                  </p>
                  <p className="text-sm text-emerald-600">{new Date(feeding.created_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}