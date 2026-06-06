import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

function DogBowl({ filled, isToday, dayLabel, index }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={`relative w-10 h-7 rounded-b-full border-2 ${
        filled
          ? 'border-amber-500 bg-gradient-to-b from-amber-400 to-amber-500'
          : 'border-amber-200 bg-amber-50'
      }`}>
        {/* Bowl rim */}
        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full ${
          filled ? 'bg-amber-600' : 'bg-amber-200'
        }`} />
        {/* Food in bowl */}
        {filled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.07 + 0.2 }}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-amber-700"
          />
        )}
      </div>
      <span className={`text-[10px] font-medium ${
        isToday ? 'text-amber-700 font-bold' : filled ? 'text-amber-500' : 'text-amber-300'
      }`}>
        {isToday ? 'Today' : dayLabel}
      </span>
    </motion.div>
  );
}

export default function StreakTracker({ currentStreak, longestStreak }) {
  const displayDays = 7;

  // Build the last 7 days (oldest → newest, today is last)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const days = Array.from({ length: displayDays }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (displayDays - 1 - i)); // oldest first
    return {
      label: dayNames[d.getDay()],
      isToday: i === displayDays - 1,
      // A bowl is filled if it falls within the current streak window ending today
      filled: i >= displayDays - currentStreak
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">Daily Streak</h3>
            <p className="text-xs text-amber-600">Complete 1 meal (5 ads) per day</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-900">{currentStreak}</p>
          <p className="text-xs text-amber-500">day{currentStreak !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Dog Bowls — last 7 days */}
      <div className="flex items-end justify-between gap-1">
        {days.map((day, i) => (
          <DogBowl
            key={i}
            filled={day.filled}
            isToday={day.isToday}
            dayLabel={day.label}
            index={i}
          />
        ))}
      </div>

      {/* Longest streak */}
      {longestStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-100 text-center">
          <p className="text-xs text-amber-600">
            🏆 Best streak: <span className="font-semibold">{longestStreak} days</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}