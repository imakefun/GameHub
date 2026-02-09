import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface QuestRewardRevealProps {
  questDescription: string;
  rewards: {
    shadowEssence?: number;
    soulShards?: number;
    lunarCrystals?: number;
  };
  shardTargetCardName?: string;
  onDismiss: () => void;
}

const REWARD_ITEMS: {
  key: keyof QuestRewardRevealProps['rewards'];
  emoji: string;
  label: string;
  color: string;
}[] = [
  { key: 'shadowEssence', emoji: '🌑', label: 'Shadow Essence', color: '#a855f7' },
  { key: 'soulShards', emoji: '💎', label: 'Soul Shards', color: '#3b82f6' },
  { key: 'lunarCrystals', emoji: '🌙', label: 'Lunar Crystals', color: '#f59e0b' },
];

export function QuestRewardReveal({ questDescription, rewards, shardTargetCardName, onDismiss }: QuestRewardRevealProps) {
  const activeRewards = REWARD_ITEMS.filter((r) => rewards[r.key] && rewards[r.key]! > 0);
  const primaryColor = activeRewards[0]?.color ?? '#10b981';

  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
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
          background: `radial-gradient(ellipse at center, #10b98120 0%, transparent 55%)`,
        }}
      />

      {/* Ring burst */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ border: '2px solid #10b981' }}
        initial={{ width: 60, height: 60, opacity: 0.8 }}
        animate={{ width: 400, height: 400, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Sparkles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: primaryColor }}
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
        {/* Quest complete badge */}
        <motion.p
          className="text-xs font-medium tracking-widest uppercase mb-3 text-emerald-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Quest Complete
        </motion.p>

        {/* Trophy icon */}
        <motion.div
          className="text-6xl mb-3"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: [0.3, 1.2, 1] }}
          transition={{ duration: 0.5, type: 'spring', damping: 10 }}
        >
          🏆
        </motion.div>

        {/* Quest description */}
        <motion.p
          className="text-sm text-surface-300 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {questDescription}
        </motion.p>

        {/* Reward items */}
        <div className="space-y-2">
          {activeRewards.map((item, idx) => (
            <motion.div
              key={item.key}
              className="flex flex-col items-center gap-0.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.15 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-2xl font-bold text-white">
                  +{rewards[item.key]!.toLocaleString()}
                </span>
                <span className="text-sm font-medium" style={{ color: item.color }}>
                  {item.label}
                </span>
              </div>
              {item.key === 'soulShards' && shardTargetCardName && (
                <motion.p
                  className="text-xs text-blue-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.15 }}
                >
                  &rarr; {shardTargetCardName}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tap to dismiss */}
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
