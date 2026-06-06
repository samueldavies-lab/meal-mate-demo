import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Target, Trophy, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const postTypes = [
  { type: 'update', icon: Sparkles, label: 'Share Update', color: 'purple' },
  { type: 'target', icon: Target, label: 'Set Target', color: 'emerald' },
  { type: 'milestone', icon: Trophy, label: 'Celebrate Milestone', color: 'amber' },
  { type: 'invite', icon: Users, label: 'Invite Friends', color: 'blue' },
];

export default function CreatePostModal({ isOpen, onClose, user, userStats, onPostCreated }) {
  const [selectedType, setSelectedType] = useState('update');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await base44.entities.SocialPost.create({
        user_email: user.email,
        user_name: user.full_name,
        post_type: selectedType,
        content: content.trim(),
        milestone_value: selectedType === 'milestone' ? userStats?.total_meals_provided : null,
        avatar_url: userStats?.avatar_url
      });
      
      setContent('');
      onPostCreated?.();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-amber-900">Share with Community</h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {postTypes.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedType === type 
                    ? `border-${color}-400 bg-${color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${
                  selectedType === type ? `text-${color}-600` : 'text-gray-500'
                }`} />
                <span className={`text-xs font-medium ${
                  selectedType === type ? `text-${color}-700` : 'text-gray-600'
                }`}>{label}</span>
              </button>
            ))}
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              selectedType === 'update' ? "Share what's on your mind..." :
              selectedType === 'target' ? "Set a goal for yourself..." :
              selectedType === 'milestone' ? "Celebrate your achievement..." :
              "Invite your friends to join..."
            }
            className="min-h-[120px] resize-none border-amber-200 focus:border-amber-400 rounded-xl mb-4"
          />

          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 rounded-xl font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Posting...' : 'Share Post'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}