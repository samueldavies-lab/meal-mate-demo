import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dog, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const FEEDER_REGISTERED_KEY = 'feeder_registered';

const feederCountries = [
  "Nepal", "India", "Bangladesh", "Sri Lanka", "Pakistan", "Thailand", 
  "Indonesia", "Philippines", "Vietnam", "Cambodia", "Myanmar", "Turkey",
  "Egypt", "Morocco", "Kenya", "Nigeria", "South Africa", "Brazil", 
  "Mexico", "Colombia", "Peru", "Argentina", "Other"
];

const SESSION_KEY = 'feeder_activated';
const TRAINING_KEY = 'feeder_training_completed';

export default function FeederRegister() {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    feeder_name: '',
    email: '',
    country: '',
    city: ''
  });

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      window.location.href = '/FeederGate';
      return;
    }
    // Only redirect to training if explicitly set to false, not if missing
    if (localStorage.getItem(TRAINING_KEY) === 'false') {
      window.location.href = '/FeederTraining';
      return;
    }
    base44.auth.me().then(u => {
      setUser(u);
      setFormData(prev => ({ ...prev, feeder_name: u?.full_name || '', email: u?.email || '' }));
    });
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await base44.auth.me().catch(() => null);
        if (currentUser) setUser(currentUser);
      }
      if (!currentUser) {
        // User needs to be logged in to register as a feeder
        toast.error('Please log in to continue.');
        base44.auth.redirectToLogin('/FeederRegister');
        setIsSubmitting(false);
        return;
      }

      const existingProfile = await base44.entities.FeederProfile.filter({ user_email: currentUser.email });
      
      const profileData = {
        user_email: currentUser.email,
        feeder_name: formData.feeder_name,
        country: formData.country,
        city: formData.city,
        registration_completed: true,
        total_dogs_fed: 0,
        total_feedings: 0,
        ...(profilePhoto && { profile_photo: profilePhoto })
      };

      if (existingProfile.length > 0) {
        await base44.entities.FeederProfile.update(existingProfile[0].id, profileData);
      } else {
        await base44.entities.FeederProfile.create(profileData);
      }

      // Mark this user as a feeder role so future logins route them correctly
      await base44.auth.updateMe({ role: 'feeder' });
      // Remember this device has a registered feeder
      localStorage.setItem(FEEDER_REGISTERED_KEY, currentUser.email);

      window.location.href = createPageUrl('FeederDashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.feeder_name && formData.email && formData.country && formData.city;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-4 shadow-lg">
          <Dog className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">Welcome, Feeder Hero!</h1>
        <p className="text-emerald-700">You're the heart of our mission</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100"
      >
        <h2 className="text-lg font-semibold text-emerald-900 mb-4">Tell us about yourself</h2>
        
        <div className="space-y-4">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingPhoto(true);
                  try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setProfilePhoto(file_url);
                    toast.success('Photo uploaded!');
                  } finally {
                    setUploadingPhoto(false);
                  }
                }}
              />
              {profilePhoto ? (
                <div className="relative">
                  <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-md" />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 shadow">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-dashed border-emerald-300 flex flex-col items-center justify-center group-hover:border-emerald-400 transition-colors">
                  {uploadingPhoto ? (
                    <span className="text-xs text-emerald-500 animate-pulse">Uploading...</span>
                  ) : (
                    <>
                      <Camera className="w-7 h-7 text-emerald-400 mb-1" />
                      <span className="text-xs text-emerald-500 text-center leading-tight">Add photo</span>
                    </>
                  )}
                </div>
              )}
            </label>
            <p className="text-xs text-emerald-600">Profile photo (optional)</p>
          </div>

          <div>
            <Label htmlFor="name" className="text-emerald-800">Your Name</Label>
            <Input
              id="name"
              value={formData.feeder_name}
              onChange={(e) => setFormData({ ...formData, feeder_name: e.target.value })}
              placeholder="Enter your name"
              className="mt-1 border-emerald-200 focus:border-emerald-400"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-emerald-800">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="mt-1 border-emerald-200 focus:border-emerald-400"
            />
            <p className="text-xs text-emerald-500 mt-1">Used to log back in next time</p>
          </div>

          <div>
            <Label className="text-emerald-800">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
            >
              <SelectTrigger className="mt-1 border-emerald-200">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {feederCountries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city" className="text-emerald-800">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Enter your city"
              className="mt-1 border-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>
      </motion.div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6 rounded-xl text-lg font-semibold"
      >
        {isSubmitting ? 'Saving...' : 'Start Feeding Dogs! 🐕'}
      </Button>
    </div>
  );
}