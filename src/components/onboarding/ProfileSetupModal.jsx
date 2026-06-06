import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProfileSetupModal({ isOpen, userEmail, onComplete }) {
  const [step, setStep] = useState(1); // 1 = profile, 2 = confirm
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Update the user's full name
      await base44.auth.updateMe({ full_name: fullName.trim() });
      
      // Create UserStats with zero values for brand new user
      const existingStats = await base44.entities.UserStats.filter({ user_email: userEmail });
      if (existingStats.length === 0) {
        await base44.entities.UserStats.create({
          user_email: userEmail,
          user_name: fullName.trim(),
          registration_completed: false, // Will be marked true after adoption
          total_ads_watched: 0,
          total_meals_provided: 0,
          total_dogs_fed: 0,
          current_progress: 0,
          current_target: 5,
          current_streak: 0,
          longest_streak: 0
        });
      }
      
      toast.success('✅ Profile created! Welcome to Feed a Stray 🐕');
      
      // Call onComplete to move forward
      onComplete({ fullName, email: userEmail });
    } catch (error) {
      toast.error('Failed to create profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 pt-10 pb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Create Your Profile</h1>
        <p className="text-emerald-100 text-sm">Set up your account to start your journey</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">How should we call you?</p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">💡 Tip:</span> Your name helps feeders know who's supporting their dogs.
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!fullName.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-5 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-gray-600 text-sm border border-gray-200">
                  {userEmail}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a secure password"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">🔒 Secure:</span> Your password is encrypted and never shared.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 py-5 rounded-xl font-semibold"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isLoading || !password || !confirmPassword}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-5 rounded-xl font-semibold"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}