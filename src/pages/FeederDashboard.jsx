import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dog, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import FeederHomeTab from '../components/feeder/FeederHomeTab';
import FeederGiftsTab from '../components/feeder/FeederGiftsTab';

const tabs = [
  { key: 'home', label: 'Home', icon: Dog },
  { key: 'gifts', label: 'Special Gifts', icon: Gift },
];

const SESSION_KEY = 'feeder_activated';
const TRAINING_KEY = 'feeder_training_completed';

export default function FeederDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');


  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (!u) {
        // Not logged in — send to gate/login
        base44.auth.redirectToLogin('/FeederDashboard');
        return;
      }
      // If the user is a feeder logging in directly (no session key), set it
      if (u.role === 'feeder') {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } else if (!sessionStorage.getItem(SESSION_KEY)) {
        window.location.href = '/FeederGate';
        return;
      }
      if (localStorage.getItem(TRAINING_KEY) === 'false') {
        window.location.href = '/FeederTraining';
        return;
      }
      setUser(u);
    });
  }, []);

  const { data: feederProfile, isLoading } = useQuery({
    queryKey: ['feederProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.FeederProfile.filter({ user_email: user.email });
      if (profiles.length === 0 || !profiles[0].registration_completed) {
        window.location.href = createPageUrl('FeederRegister');
        return null;
      }
      return profiles[0];
    },
    enabled: !!user?.email
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-700">Loading...</div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20" />
        <div className="relative px-6 pt-8 pb-5">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">Hi, {feederProfile?.feeder_name}!</h1>
              <p className="text-emerald-700 text-sm">{feederProfile?.city}, {feederProfile?.country}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mx-4 mb-4 bg-white/70 rounded-2xl p-1 border border-emerald-100">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-2">
        {activeTab === 'home' && <FeederHomeTab feederProfile={feederProfile} user={user} />}
        {activeTab === 'gifts' && <FeederGiftsTab user={user} />}
      </div>

    </div>
  );
}