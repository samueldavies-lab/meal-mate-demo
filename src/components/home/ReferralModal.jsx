import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Gift, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReferralModal({ isOpen, onClose, userEmail }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userEmail) {
      loadReferralData();
    }
  }, [isOpen, userEmail]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Generate referral code from email (simple hash)
      const code = userEmail.split('@')[0] + Math.random().toString(36).substring(2, 6).toUpperCase();
      setReferralCode(code);

      // Count completed referrals
      const referrals = await base44.entities.Referral.filter({ 
        referrer_email: userEmail,
        status: 'completed'
      });
      setReferralCount(referrals.length);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${referralCode}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getReferralLink());
    toast.success('Referral link copied!');
  };

  const shareReferral = async () => {
    const link = getReferralLink();
    const text = `🐕 Join me in feeding stray dogs! Sign up with my link and we both get 5 free meals to feed dogs in need: ${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Feed a Stray - Referral', text, url: link });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-orange-500" />
              Refer Friends
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-6 mb-6 text-center">
                <div className="text-5xl mb-3">🎁</div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">Get 5 Free Meals!</h3>
                <p className="text-amber-700 text-sm">
                  Share your referral link. When a friend signs up and completes their first meal (5 ads), you both get 5 bonus meals to feed dogs!
                </p>
              </div>

              <div className="bg-white rounded-xl border-2 border-amber-200 p-4 mb-4">
                <label className="text-xs text-amber-600 font-medium mb-1 block">Your Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getReferralLink()}
                    readOnly
                    className="flex-1 bg-amber-50 px-3 py-2 rounded-lg text-sm text-amber-900 border border-amber-200"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={shareReferral}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl text-lg font-semibold mb-4"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Referral Link
              </Button>

              <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 rounded-xl py-3">
                <Users className="w-5 h-5" />
                <span className="text-sm">
                  <strong>{referralCount}</strong> successful referral{referralCount !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-amber-600">
                <p className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  Your friend signs up using your link
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  They watch 5 ads to complete their first meal
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  You both instantly get 5 meals to feed dogs!
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}