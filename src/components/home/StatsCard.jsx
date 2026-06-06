import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, subtext, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
          <Icon className="w-6 h-6 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-700 font-medium">{label}</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-amber-600 mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}