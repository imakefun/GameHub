import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardDefinition, UpgradeTier } from '../types';
import {
  UPGRADE_TIER_COLORS,
  UPGRADE_TIER_LABELS,
  UPGRADE_COSTS,
  CARD_TYPE_INFO,
} from '../types';

interface UpgradeRevealProps {
  card: CardDefinition;
  fromTier: UpgradeTier;
  toTier: Exclude<UpgradeTier, 'base'>;
  onDismiss: () => void;
}

export function UpgradeReveal({ card, fromTier, toTier, onDismiss }: UpgradeRevealProps) {
  const [phase, setPhase] = useState<'charge' | 'transform' | 'complete'>('charge');
  const fromColor = UPGRADE_TIER_COLORS[fromTier];
  const toColor = UPGRADE_TIER_COLORS[toTier];
  const clGain = UPGRADE_COSTS[toTier].clGain;
  const typeInfo = CARD_TYPE_INFO[card.type];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('transform'), 1200);
    const t2 = setTimeout(() => setPhase('complete'), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.92)' }}
      onClick={() => {
        if (phase === 'complete') onDismiss();
      }}
    >
      {/* Energy ring that expands on transform */}
      <AnimatePresence>
        {phase === 'transform' && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ border: `3px solid ${toColor}` }}
            initial={{ width: 80, height: 80, opacity: 1 }}
            animate={{ width: 600, height: 600, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Background radial glow - transitions from old to new color */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 'charge'
            ? `radial-gradient(ellipse at center, ${fromColor}20 0%, transparent 50%)`
            : `radial-gradient(ellipse at center, ${toColor}30 0%, transparent 60%)`,
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Sparkle ring particles */}
      {phase !== 'charge' && Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{ background: toColor }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: Math.cos((i / 16) * Math.PI * 2) * 200,
            y: Math.sin((i / 16) * Math.PI * 2) * 240,
            scale: [0, 1.8, 1.2, 0],
          }}
          transition={{
            duration: 1.4,
            delay: i * 0.04,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Vertical light beams */}
      <AnimatePresence>
        {phase === 'transform' && (
          <>
            <motion.div
              className="absolute w-1 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent, ${toColor}80, transparent)`,
                height: '120vh',
                left: '50%',
                top: '-10vh',
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], scaleX: [0.5, 3, 0.5] }}
              transition={{ duration: 1.2 }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-xs px-4">
        {/* Phase label */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {phase === 'charge' && (
              <motion.p
                key="charge"
                className="text-sm font-medium tracking-widest uppercase"
                style={{ color: fromColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Upgrading...
              </motion.p>
            )}
            {phase !== 'charge' && (
              <motion.p
                key="done"
                className="text-sm font-bold tracking-widest uppercase"
                style={{ color: toColor }}
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {UPGRADE_TIER_LABELS[toTier]}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: phase === 'charge' ? `${fromColor}70` : `${toColor}`,
            background: phase === 'charge'
              ? `linear-gradient(180deg, ${fromColor}20 0%, rgba(0,0,0,0.5) 100%)`
              : `linear-gradient(180deg, ${toColor}25 0%, rgba(0,0,0,0.5) 100%)`,
            boxShadow: phase === 'charge'
              ? `0 0 30px ${fromColor}20`
              : `0 0 60px ${toColor}40, 0 0 120px ${toColor}15`,
          }}
          animate={phase === 'charge' ? {
            boxShadow: [
              `0 0 20px ${fromColor}20`,
              `0 0 50px ${fromColor}40`,
              `0 0 20px ${fromColor}20`,
            ],
          } : {}}
          transition={phase === 'charge' ? { duration: 0.8, repeat: Infinity } : { duration: 0.4 }}
        >
          {/* Shimmer overlay during charge */}
          {phase === 'charge' && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: `linear-gradient(105deg, transparent 40%, ${fromColor}30 50%, transparent 60%)`,
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Bright flash on transform */}
          <AnimatePresence>
            {phase === 'transform' && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{ background: toColor }}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>

          {/* Upgrade tier badges */}
          <div className="flex justify-between items-start px-4 pt-3 relative z-10">
            <motion.span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: `${typeInfo.emoji ? fromColor : fromColor}30`, color: fromColor }}
            >
              {typeInfo.emoji} {typeInfo.label}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={phase === 'charge' ? 'from' : 'to'}
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: phase === 'charge' ? `${fromColor}30` : `${toColor}40`,
                  color: phase === 'charge' ? fromColor : toColor,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {phase === 'charge'
                  ? UPGRADE_TIER_LABELS[fromTier]
                  : UPGRADE_TIER_LABELS[toTier]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Art */}
          <div className="px-4 py-3 relative z-10">
            <motion.div
              className="w-full aspect-[3/4] rounded-xl overflow-hidden border flex items-center justify-center"
              style={{
                borderColor: phase === 'charge' ? `${fromColor}30` : `${toColor}40`,
                background: `linear-gradient(135deg, ${phase === 'charge' ? fromColor : toColor}10, rgba(0,0,0,0.4))`,
              }}
              animate={phase === 'transform' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {card.artUrl ? (
                <img src={card.artUrl} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">{typeInfo.emoji}</span>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div className="px-4 pb-4 text-center relative z-10">
            <h3 className="text-2xl font-bold text-white mb-1">{card.name}</h3>
            <p className="text-xs text-surface-400">{typeInfo.emoji} {typeInfo.label}</p>
          </div>
        </motion.div>

        {/* CL gain badge */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="flex justify-center mt-3"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
            >
              <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                +{clGain} Collection Level
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dismiss button */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.button
              onClick={onDismiss}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-lg text-black"
              style={{
                background: `linear-gradient(135deg, ${toColor}, ${toColor}cc)`,
                boxShadow: `0 0 20px ${toColor}40`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
