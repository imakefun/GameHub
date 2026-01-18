import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, X } from 'lucide-react';
import type { CraftResult } from '../types';

interface DiscoveryPopupProps {
  craftResult: CraftResult | null;
  onClose: () => void;
}

// Tier colors for the glow effect
const tierColors = {
  1: { primary: '#9ca3af', glow: 'rgba(156, 163, 175, 0.5)' },
  2: { primary: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)' },
  3: { primary: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)' },
  4: { primary: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' },
  5: { primary: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
};

export function DiscoveryPopup({ craftResult, onClose }: DiscoveryPopupProps) {
  const [showParticles, setShowParticles] = useState(false);

  const isNewDiscovery = craftResult?.isNewDiscovery && craftResult?.success;
  const element = craftResult?.outputElement;
  const tier = element?.tier || 1;
  const colors = tierColors[tier as keyof typeof tierColors];

  useEffect(() => {
    if (isNewDiscovery) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNewDiscovery, craftResult?.timestamp]);

  // Auto-close after delay
  useEffect(() => {
    if (isNewDiscovery) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isNewDiscovery, craftResult?.timestamp, onClose]);

  return (
    <AnimatePresence>
      {isNewDiscovery && element && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Particle effects */}
          {showParticles && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${20 + Math.random() * 60}vw`,
                    y: `${20 + Math.random() * 60}vh`,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                  className="absolute text-2xl"
                >
                  {['✨', '⭐', '🌟', '💫', '🔮'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}

          {/* Main popup */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative p-8 rounded-2xl text-center max-w-sm mx-4"
            style={{
              background: `linear-gradient(135deg, ${colors.glow}, rgba(0,0,0,0.8))`,
              boxShadow: `0 0 60px ${colors.glow}, 0 0 100px ${colors.glow}`,
              border: `2px solid ${colors.primary}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Discovery label */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
              <span
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                New Discovery!
              </span>
              <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
            </motion.div>

            {/* Element emoji with glow animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative mb-4"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 20px ${colors.glow}`,
                    `0 0 60px ${colors.glow}`,
                    `0 0 20px ${colors.glow}`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
                style={{ background: `radial-gradient(circle, ${colors.glow}, transparent)` }}
              >
                <span className="text-7xl">{element.emoji}</span>
              </motion.div>

              {/* Tier stars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
              >
                {[...Array(tier)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={colors.primary}
                      stroke={colors.primary}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Element name */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {element.name}
            </motion.h2>

            {/* Tier label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm opacity-70"
              style={{ color: colors.primary }}
            >
              Tier {tier} Element
            </motion.p>

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.5] }}
              transition={{ delay: 1.5, duration: 1.5, repeat: Infinity }}
              className="mt-6 text-xs text-white/50"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
