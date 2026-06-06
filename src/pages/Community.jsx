import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Share2, Users, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/social/PostCard';
import CreatePostModal from '../components/social/CreatePostModal';
import { toast } from 'sonner';

export default function Community() {
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      return base44.entities.SocialPost.list('-created_date', 50);
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      return stats[0];
    },
    enabled: !!user?.email
  });

  const inviteLink = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Feed a Stray',
          text: 'Join me in feeding stray dogs around the world! Watch ads, feed dogs. 🐕',
          url: inviteLink
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
        <div className="relative px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Community</h1>
                <p className="text-amber-700 text-sm">Share & inspire others</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="icon"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        {/* Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 mb-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Invite Friends</h3>
              <p className="text-sm text-purple-100 mb-4">
                Every friend you invite multiplies the impact. Share the mission!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  className="bg-white text-purple-700 hover:bg-purple-50 flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-amber-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-amber-100 rounded w-full mb-1" />
                    <div className="h-3 bg-amber-100 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={user?.email}
                delay={0.05 * (index + 1)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700 mb-2">No posts yet</p>
              <p className="text-sm text-amber-600">Be the first to share your journey!</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        user={user}
        userStats={userStats}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}