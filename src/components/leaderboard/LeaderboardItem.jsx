import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardItem({ rank, user, isCurrentUser, delay = 0 }) {
  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-orange-700 text-white';
    return 'bg-amber-100 text-amber-700';
  };

  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-4 h-4" />;
    if (rank <= 3) return <Medal className="w-4 h-4" />;
    return rank;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-md' 
          : 'bg-white/70 hover:bg-white border border-amber-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getRankStyle()}`}>
        {getRankIcon()}
      </div>
      
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-xl font-bold text-amber-800 overflow-hidden">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          user.user_name?.charAt(0)?.toUpperCase() || '?'
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isCurrentUser ? 'text-amber-900' : 'text-amber-800'}`}>
          {user.user_name || 'Anonymous Hero'}
          {isCurrentUser && <span className="ml-2 text-xs text-amber-600">(You)</span>}
        </p>
        <p className="text-sm text-amber-600">
          {user.total_dogs_fed || 0} dogs fed
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-2xl font-bold text-amber-900">{user.total_meals_provided || 0}</p>
        <p className="text-xs text-amber-600">meals</p>
      </div>
    </motion.div>
  );
}