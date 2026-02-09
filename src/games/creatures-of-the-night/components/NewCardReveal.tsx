import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardDefinition } from '../types';
import { UPGRADE_TIER_COLORS, CARD_TYPE_INFO } from '../types';

interface NewCardRevealProps {
  card: CardDefinition;
  onDismiss: () => void;
}

export function NewCardReveal({ card, onDismiss }: NewCardRevealProps) {
  const [phase, setPhase] = useState<'intro' | 'reveal'>('intro');
  const baseColor = UPGRADE_TIER_COLORS.base;
  const typeInfo = CARD_TYPE_INFO[card.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onClick={() => {
        if (phase === 'intro') {
          setPhase('reveal');
        } else {
          onDismiss();
        }
      }}
    >
      {/* Radial glow behind card */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        style={{
          background: `radial-gradient(ellipse at center, ${baseColor}25 0%, transparent 60%)`,
        }}
      />

      {/* Sparkle particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: baseColor }}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i / 12) * Math.PI * 2) * 180,
            y: Math.sin((i / 12) * Math.PI * 2) * 220,
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.5 + i * 0.08,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="text-center px-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-3">
                New Card Discovered
              </p>
              <motion.div
                className="w-24 h-24 mx-auto rounded-2xl border-2 flex items-center justify-center mb-4"
                style={{
                  borderColor: `${baseColor}60`,
                  background: `linear-gradient(135deg, ${baseColor}20, rgba(0,0,0,0.4))`,
                  boxShadow: `0 0 40px ${baseColor}30`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${baseColor}20`,
                    `0 0 60px ${baseColor}40`,
                    `0 0 20px ${baseColor}20`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-4xl">?</span>
              </motion.div>
              <motion.p
                className="text-surface-400 text-sm animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Tap to reveal
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            className="w-full max-w-xs px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card */}
            <motion.div
              className="w-full rounded-2xl border-2 overflow-hidden"
              style={{
                borderColor: `${baseColor}70`,
                background: `linear-gradient(180deg, ${baseColor}20 0%, rgba(0,0,0,0.5) 100%)`,
                boxShadow: `0 0 60px ${baseColor}30, 0 0 120px ${baseColor}15`,
              }}
              initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring', damping: 15 }}
            >
              {/* NEW badge */}
              <div className="flex justify-between items-start px-4 pt-3">
                <motion.span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: `${baseColor}30`, color: baseColor }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {typeInfo.emoji} {typeInfo.label}
                </motion.span>
                <motion.span
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-black"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  NEW CARD
                </motion.span>
              </div>

              {/* Art */}
              <div className="px-4 py-3">
                <motion.div
                  className="w-full aspect-[3/4] rounded-xl overflow-hidden border flex items-center justify-center"
                  style={{
                    borderColor: `${baseColor}30`,
                    background: `linear-gradient(135deg, ${baseColor}10, rgba(0,0,0,0.4))`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {card.artUrl ? (
                    <img src={card.artUrl} alt={card.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl">{typeInfo.emoji}</span>
                  )}
                </motion.div>
              </div>

              {/* Info */}
              <motion.div
                className="px-4 pb-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-white mb-1">{card.name}</h3>
                <div className="flex items-center justify-center gap-2 text-sm mb-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: `${baseColor}20`, color: baseColor }}
                  >
                    {typeInfo.emoji} {typeInfo.label}
                  </span>
                </div>
                {card.flavorText && (
                  <p className="text-xs text-surface-400 italic">
                    &ldquo;{card.flavorText}&rdquo;
                  </p>
                )}
              </motion.div>
            </motion.div>

            {/* Dismiss button */}
            <motion.button
              onClick={onDismiss}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black"
              style={{ boxShadow: `0 0 20px rgba(245, 158, 11, 0.3)` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Add to Collection
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
