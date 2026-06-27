import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ progress, target = 3, size = 200, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = (progress / target) * 100;

  const tier = progressPercent >= 100 ? 'green' : progressPercent <= 30 ? 'red' : progressPercent <= 70 ? 'amber' : 'green';

  const colors = {
    red: { from: '#F87171', to: '#E11D48', bg: '#FEE2E2' },
    amber: { from: '#FBBF24', to: '#EA580C', bg: '#FEF3C7' },
    green: { from: '#34D399', to: '#10B981', bg: '#D1FAE5' },
  };

  const c = colors[tier];
  const gradientId = `progress-gradient-${tier}`;

  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={c.bg}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-amber-900">{progress}</span>
        <span className="text-amber-700 text-sm font-medium">of {target} ads</span>
      </div>
    </div>
  );
}