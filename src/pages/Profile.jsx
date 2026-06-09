import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, Camera, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin('/Profile');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: userDogs = [] } = useQuery({
    queryKey: ['userDogs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserDog.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe({
        full_name: data.full_name || user.full_name,
      });
      
      if (userStats) {
        await base44.entities.UserStats.update(userStats.id, {
          country: data.country || userStats.country,
          avatar_url: data.avatar_url || userStats.avatar_url,
        });
      }
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      base44.auth.me().then(setUser);
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      if (userStats?.id) {
        await base44.entities.UserStats.delete(userStats.id);
      }
      await base44.auth.logout('/');
      toast.success('Account deleted');
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    }
    setShowDeleteConfirm(false);
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const uniqueDogsCount = Object.values(
    userDogs.reduce((acc, dog) => {
      if (!acc[dog.dog_id]) acc[dog.dog_id] = dog;
      return acc;
    }, {})
  ).length;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 px-6 pt-8 pb-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-amber-100 mt-2">View and manage your information</p>
      </div>

      <div className="px-6 -mt-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {formData.avatar_url || userStats?.avatar_url ? (
                <img
                  src={formData.avatar_url || userStats?.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-4xl">
                  🐕
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4 mb-8">
            {/* Name */}
            <div>
              <label className="text-sm text-amber-600 font-semibold">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name || user.full_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-800 font-semibold mt-1">{user.full_name || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-amber-600 font-semibold">Email</label>
              <p className="text-gray-800 mt-1">{user.email}</p>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm text-amber-600 font-semibold">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country || userStats?.country || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-800 mt-1">{userStats?.country || 'Not set'}</p>
              )}
            </div>

            {/* Dogs Count */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
              <label className="text-sm text-amber-600 font-semibold">Dogs in Your Family</label>
              <p className="text-3xl font-bold text-amber-900 mt-2">{uniqueDogsCount}</p>
              <p className="text-sm text-amber-600 mt-1">Unique dogs you're helping</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase">Meals Provided</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{userStats?.total_meals_provided || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-semibold uppercase">Ads Watched</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">{userStats?.total_ads_watched || 0}</p>
              </div>
            </div>
          </div>

          {/* Edit/Save Buttons */}
          {!isEditing ? (
            <Button
              onClick={() => {
                setIsEditing(true);
                setFormData({
                  full_name: user.full_name || '',
                  country: userStats?.country || '',
                  avatar_url: userStats?.avatar_url || '',
                });
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 py-3 rounded-lg border-amber-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-2xl text-lg font-semibold shadow-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            className="w-full border-red-200 text-red-500 hover:bg-red-50 py-4 rounded-2xl font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                <p className="text-gray-500 text-sm">
                  This will permanently delete your account and all your data — including your feeding history and adopted dogs. This cannot be undone.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-semibold"
                >
                  Yes, Delete My Account
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="w-full py-4 rounded-2xl font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}