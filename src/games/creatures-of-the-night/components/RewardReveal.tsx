import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CLReward } from '../types';

interface RewardRevealProps {
  reward: CLReward;
  onDismiss: () => void;
}

const REWARD_DISPLAY: Record<string, { emoji: string; label: string; color: string }> = {
  shadowEssence: { emoji: '🌑', label: 'Shadow Essence', color: '#a855f7' },
  soulShards: { emoji: '💎', label: 'Soul Shards', color: '#3b82f6' },
  lunarCrystals: { emoji: '🌙', label: 'Lunar Crystals', color: '#f59e0b' },
  tome: { emoji: '📖', label: 'Tome', color: '#10b981' },
  premiumTome: { emoji: '📕', label: 'Premium Tome', color: '#ef4444' },
  special: { emoji: '✨', label: 'Special Reward', color: '#ec4899' },
};

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function RewardReveal({ reward, onDismiss }: RewardRevealProps) {
  const display = REWARD_DISPLAY[reward.type] || REWARD_DISPLAY.special;

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onDismiss}
    >
      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(ellipse at center, ${display.color}20 0%, transparent 55%)`,
        }}
      />

      {/* Ring burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ border: `2px solid ${display.color}` }}
        initial={{ width: 60, height: 60, opacity: 0.8 }}
        animate={{ width: 400, height: 400, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Sparkles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: display.color }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i / 10) * Math.PI * 2) * (120 + Math.random() * 60),
            y: Math.sin((i / 10) * Math.PI * 2) * (120 + Math.random() * 60),
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 1.2, delay: 0.1 + i * 0.04 }}
        />
      ))}

      <div className="relative text-center px-8">
        {/* CL badge */}
        <motion.p
          className="text-xs font-medium tracking-widest uppercase mb-4"
          style={{ color: display.color }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          CL {reward.cl} Reward
        </motion.p>

        {/* Big emoji icon */}
        <motion.div
          className="text-7xl mb-4"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: [0.3, 1.2, 1] }}
          transition={{ duration: 0.5, type: 'spring', damping: 10 }}
        >
          {display.emoji}
        </motion.div>

        {/* Reward amount */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-3xl font-bold text-white mb-1">
            +{formatAmount(reward.amount)}
          </p>
          <p className="text-sm font-medium" style={{ color: display.color }}>
            {display.label}
          </p>
        </motion.div>

        {/* Description */}
        {reward.description && (
          <motion.p
            className="text-xs text-surface-400 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {reward.description}
          </motion.p>
        )}

        {/* Tap to dismiss hint */}
        <motion.p
          className="text-xs text-surface-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6] }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Tap to continue
        </motion.p>
      </div>
    </motion.div>
  );
}
