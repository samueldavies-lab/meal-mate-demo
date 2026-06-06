import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Save, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const PAYOUT_THRESHOLD = 20; // USD

export default function FeederAccount() {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [formData, setFormData] = useState({
    full_legal_name: '',
    bank_name: '',
    account_number: '',
    swift_bic: '',
    bank_address: '',
    account_holder_address: '',
    wise_email: '',
    currency: '',
    additional_notes: '',
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: bankDetails, isLoading } = useQuery({
    queryKey: ['feederBankDetails', user?.email],
    queryFn: async () => {
      const results = await base44.entities.FeederBankDetails.filter({ user_email: user.email });
      if (results.length > 0) {
        const d = results[0];
        setExistingId(d.id);
        setFormData({
          full_legal_name: d.full_legal_name || '',
          bank_name: d.bank_name || '',
          account_number: d.account_number || '',
          swift_bic: d.swift_bic || '',
          bank_address: d.bank_address || '',
          account_holder_address: d.account_holder_address || '',
          wise_email: d.wise_email || '',
          currency: d.currency || '',
          additional_notes: d.additional_notes || '',
        });
        return d;
      }
      return null;
    },
    enabled: !!user?.email,
  });

  const { data: feederProfile } = useQuery({
    queryKey: ['feederProfile', user?.email],
    queryFn: async () => {
      const results = await base44.entities.FeederProfile.filter({ user_email: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email,
  });

  const totalEarned = bankDetails?.total_earned_usd || 0;
  const totalPaid = bankDetails?.total_paid_usd || 0;
  const pending = Math.max(0, totalEarned - totalPaid);
  const readyForPayout = pending >= PAYOUT_THRESHOLD;

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData, user_email: user.email };
      if (existingId) {
        await base44.entities.FeederBankDetails.update(existingId, payload);
      } else {
        const created = await base44.entities.FeederBankDetails.create(payload);
        setExistingId(created.id);
      }
      toast.success('Bank details saved!');
    } catch (e) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 px-5 py-8 pb-28">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-emerald-900">My Account</h1>
          <p className="text-emerald-700 text-sm">Payment & bank details</p>
        </div>
      </motion.div>

      {/* Earnings Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-5">
        <h2 className="text-base font-semibold text-emerald-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Earnings
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xl font-bold text-emerald-700">${totalEarned.toFixed(2)}</p>
            <p className="text-xs text-emerald-500 mt-1">Total Earned</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-3">
            <p className="text-xl font-bold text-teal-700">${totalPaid.toFixed(2)}</p>
            <p className="text-xs text-teal-500 mt-1">Paid Out</p>
          </div>
          <div className={`rounded-xl p-3 ${readyForPayout ? 'bg-amber-50' : 'bg-slate-50'}`}>
            <p className={`text-xl font-bold ${readyForPayout ? 'text-amber-600' : 'text-slate-400'}`}>${pending.toFixed(2)}</p>
            <p className={`text-xs mt-1 ${readyForPayout ? 'text-amber-500' : 'text-slate-400'}`}>Pending</p>
          </div>
        </div>
        {readyForPayout ? (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">You've reached the $20 threshold! A transfer will be initiated manually to your details below.</p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-emerald-600 mb-1">
              <span>Progress to next payout</span>
              <span>${pending.toFixed(2)} / ${PAYOUT_THRESHOLD}</span>
            </div>
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (pending / PAYOUT_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Disclaimer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Important Notice</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Any funds transferred to you are <strong>not a wage, salary, or employment compensation</strong>. They represent a voluntary contribution towards the cost of dog food and supplies used in your local area feeding activities. By providing your bank details, you acknowledge this and agree that no employment relationship exists between you and Feed a Stray.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bank Details Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 space-y-4">
        <h2 className="text-base font-semibold text-emerald-900">Bank / Transfer Details</h2>
        <p className="text-xs text-emerald-600">These details will be used to send your contribution via Wise. Please ensure they are accurate.</p>

        <div>
          <Label className="text-emerald-800 text-sm">Full Legal Name (as on bank account)</Label>
          <Input value={formData.full_legal_name} onChange={e => set('full_legal_name', e.target.value)}
            placeholder="e.g. Priya Sharma" className="mt-1 border-emerald-200 focus:border-emerald-400" />
        </div>

        <div>
          <Label className="text-emerald-800 text-sm">Wise Email (if you have a Wise account)</Label>
          <Input value={formData.wise_email} onChange={e => set('wise_email', e.target.value)}
            placeholder="yourwise@email.com" className="mt-1 border-emerald-200 focus:border-emerald-400" />
          <p className="text-xs text-emerald-500 mt-1">Fastest method. If you don't have Wise, fill in bank details below.</p>
        </div>

        <div className="border-t border-emerald-100 pt-3">
          <p className="text-xs font-semibold text-emerald-700 mb-3">— OR Bank Transfer Details —</p>
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-800 text-sm">Bank Name</Label>
              <Input value={formData.bank_name} onChange={e => set('bank_name', e.target.value)}
                placeholder="e.g. Nepal Investment Bank" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">Account Number / IBAN</Label>
              <Input value={formData.account_number} onChange={e => set('account_number', e.target.value)}
                placeholder="e.g. NP07 0010 0001 2345 6789" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">SWIFT / BIC Code</Label>
              <Input value={formData.swift_bic} onChange={e => set('swift_bic', e.target.value)}
                placeholder="e.g. NIBLNPKT" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">Preferred Currency</Label>
              <Input value={formData.currency} onChange={e => set('currency', e.target.value)}
                placeholder="e.g. USD, EUR, GBP, NPR" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">Bank Branch Address</Label>
              <Input value={formData.bank_address} onChange={e => set('bank_address', e.target.value)}
                placeholder="Full address of bank branch" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">Your Home Address</Label>
              <Input value={formData.account_holder_address} onChange={e => set('account_holder_address', e.target.value)}
                placeholder="Full home address of account holder" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
            <div>
              <Label className="text-emerald-800 text-sm">Additional Notes</Label>
              <Input value={formData.additional_notes} onChange={e => set('additional_notes', e.target.value)}
                placeholder="Any special instructions for the transfer" className="mt-1 border-emerald-200 focus:border-emerald-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <Button
        onClick={handleSave}
        disabled={isSubmitting}
        className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6 rounded-xl text-base font-semibold"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Saving...' : 'Save Details'}
      </Button>
    </div>
  );
}