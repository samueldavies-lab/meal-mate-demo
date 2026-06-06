import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MessageCircle, Target, Trophy, Users, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const postTypeConfig = {
  milestone: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
  invite: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
  update: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100' },
  target: { icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-100' },
};

export default function PostCard({ post, currentUserEmail, delay = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const config = postTypeConfig[post.post_type] || postTypeConfig.update;
  const Icon = config.icon;

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount(prev => prev + 1);
    
    try {
      await base44.entities.PostLike.create({
        post_id: post.id,
        user_email: currentUserEmail
      });
      await base44.entities.SocialPost.update(post.id, {
        likes_count: likesCount + 1
      });
    } catch (e) {
      // Ignore errors
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Feed a Stray',
          text: `${post.user_name} is helping feed stray dogs! Join us at Feed a Stray.`,
          url: window.location.origin
        });
      } catch (e) {
        // User cancelled
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-amber-100"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-lg font-bold text-amber-800 flex-shrink-0 overflow-hidden">
          {post.avatar_url ? (
            <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            post.user_name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-amber-900">{post.user_name || 'Anonymous Hero'}</span>
            <div className={`p-1 rounded-full ${config.bg}`}>
              <Icon className={`w-3 h-3 ${config.color}`} />
            </div>
          </div>
          
          <p className="text-amber-800 mb-3">{post.content}</p>
          
          {post.milestone_value && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-3">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">{post.milestone_value} meals</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  liked ? 'text-red-500' : 'text-amber-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
            
            <span className="text-xs text-amber-500">
              {format(new Date(post.created_date), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}