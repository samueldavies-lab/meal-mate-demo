import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const YES_NO_QUESTIONS = [
  { key: 'food_within_72hrs',  label: 'Was the food provided within 72 hours?' },
  { key: 'photos_each_time',   label: 'Were pictures taken of the dog eating each time?' },
  { key: 'photos_good_quality',label: 'Were the photos of a good quality?' },
];

function YesNoRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-amber-100 last:border-0">
      <p className="text-sm text-amber-900 flex-1">{label}</p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onChange(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            value === true
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            value === false
              ? 'bg-red-400 text-white shadow-sm'
              : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          No
        </button>
      </div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  return (
    <div className="text-center py-3">
      <p className="text-sm text-amber-900 font-medium mb-3">Overall, how would you rank the feeding of your dog through the app?</p>
      <div className="flex justify-center gap-1 mb-2">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hover || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-amber-200 fill-amber-100'
              }`}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <p className="text-sm font-semibold text-amber-700">{labels[hover || value]}</p>
      )}
    </div>
  );
}

export default function FeedingFeedbackModal({ isOpen, onClose, dog, feedingLog, userEmail }) {
  const [answers, setAnswers] = useState({ food_within_72hrs: null, photos_each_time: null, photos_good_quality: null });
  const [overallRating, setOverallRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    const unanswered = YES_NO_QUESTIONS.filter(q => answers[q.key] === null);
    if (unanswered.length > 0 || overallRating === 0) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await base44.entities.FeedingFeedback.create({
        user_email: userEmail,
        dog_id: dog.dog_id,
        dog_name: dog.dog_name,
        feeding_log_id: feedingLog.id,
        food_within_72hrs: answers.food_within_72hrs,
        photos_each_time: answers.photos_each_time,
        photos_good_quality: answers.photos_good_quality,
        overall_rating: overallRating,
      });
      queryClient.invalidateQueries({ queryKey: ['feedingFeedback'] });
      toast.success('Thank you for your feedback! 🐾');
      onClose();
      setAnswers({ food_within_72hrs: null, photos_each_time: null, photos_good_quality: null });
      setOverallRating(0);
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
        className="fixed inset-0 bg-black/70 z-[99999] flex items-end justify-center sm:items-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 pt-5 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Rate This Feeding</h2>
              <p className="text-amber-100 text-sm mt-0.5">
                {dog?.dog_name}{feedingLog && ` · ${new Date(feedingLog.created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Photo thumbnail */}
          {feedingLog?.photo_url && (
            <div className="px-5 pt-4">
              <img src={feedingLog.photo_url} alt="Feeding" className="w-full h-32 object-cover rounded-xl" />
            </div>
          )}

          <div className="px-5 pt-3 pb-5">
            {/* Yes/No questions */}
            <div className="mb-2">
              {YES_NO_QUESTIONS.map(q => (
                <YesNoRow
                  key={q.key}
                  label={q.label}
                  value={answers[q.key]}
                  onChange={val => setAnswers(a => ({ ...a, [q.key]: val }))}
                />
              ))}
            </div>

            {/* Star rating */}
            <div className="border border-amber-100 rounded-2xl px-3 mb-4">
              <StarRating value={overallRating} onChange={setOverallRating} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}