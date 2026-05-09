'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function WeirdnessGauge({ score, size = 160, showLabel = true }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (animated / 100) * circumference;

  const color = score <= 30 ? '#00FF88' : score <= 60 ? '#F59E0B' : '#FF4444';
  const level = score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : 'HIGH';

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size / 2 + 20 }} className="relative">
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke="#1C1C28"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
          {/* Score text */}
          <text
            x={size / 2}
            y={size / 2 - 5}
            textAnchor="middle"
            fill={color}
            fontSize={size * 0.2}
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {score}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            fill="#888"
            fontSize={size * 0.08}
            fontFamily="var(--font-mono)"
          >
            / 100
          </text>
        </svg>
      </div>
      {showLabel && (
        <div
          className="px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {level} RISK
        </div>
      )}
    </div>
  );
}
