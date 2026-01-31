import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Cell, SpecialGemType } from '../types';
import { GEM_DEFS, GEM_SHAPES, GEM_COLORS } from '../data/gems';

interface GemCellProps {
  cell: Cell;
  isSelected: boolean;
  isHinted: boolean;
  isMatched: boolean;
  isPowerUpTarget: boolean;
  cellSize: number;
}

// --- Special gem visual overlays ---

function specialOverlay(special: SpecialGemType, cellSize: number) {
  switch (special) {
    case 'striped_h':
      return (
        <div className="absolute inset-[8%] pointer-events-none overflow-hidden" style={{ borderRadius: 4 }}>
          {[-2, -1, 0, 1, 2].map(i => (
            <div key={i} className="absolute w-full bg-white/30" style={{
              height: 1.5,
              top: `${50 + i * 18}%`,
            }} />
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: [-cellSize, cellSize] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      );
    case 'striped_v':
      return (
        <div className="absolute inset-[8%] pointer-events-none overflow-hidden" style={{ borderRadius: 4 }}>
          {[-2, -1, 0, 1, 2].map(i => (
            <div key={i} className="absolute h-full bg-white/30" style={{
              width: 1.5,
              left: `${50 + i * 18}%`,
            }} />
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/25 to-transparent"
            animate={{ y: [-cellSize, cellSize] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      );
    case 'bomb':
      return (
        <>
          <motion.div
            className="absolute inset-[12%] rounded-full border-2 border-white/50 pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <motion.div
            className="absolute inset-[18%] rounded-full border border-white/30 pointer-events-none"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        </>
      );
    case 'prismatic':
      return (
        <>
          <motion.div
            className="absolute inset-[6%] pointer-events-none"
            style={{
              background: 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
              opacity: 0.35,
              borderRadius: 4,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[10%] pointer-events-none bg-white/10"
            style={{ borderRadius: 4 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        </>
      );
    default:
      return null;
  }
}

// --- Cell modifier overlays ---

function modifierOverlay(modifier: Cell['modifier']) {
  switch (modifier) {
    case 'ice':
      return (
        <div className="absolute inset-[4%] pointer-events-none overflow-hidden" style={{ borderRadius: 6 }}>
          <div className="absolute inset-0 border-2 border-cyan-300/60 bg-cyan-200/15" style={{ borderRadius: 6 }} />
          <div className="absolute top-[8%] left-[12%] w-[15%] h-[15%] bg-white/40 rounded-full blur-[1px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[12%] h-[12%] bg-white/30 rounded-full blur-[0.5px]" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-cyan-300/10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        </div>
      );
    case 'dirt':
      return (
        <div className="absolute inset-[4%] pointer-events-none overflow-hidden" style={{ borderRadius: 6 }}>
          <div className="absolute inset-0 bg-amber-900/40" style={{ borderRadius: 6 }} />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }} />
        </div>
      );
    case 'locked':
      return (
        <div className="absolute inset-[4%] pointer-events-none overflow-hidden" style={{ borderRadius: 6 }}>
          <div className="absolute inset-0 border-2 border-gray-400/50" style={{ borderRadius: 6 }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-gray-400/70 text-[10px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🔒
            </motion.span>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// --- Main GemCell Component ---

export const GemCell = memo(function GemCell({
  cell,
  isSelected,
  isHinted,
  isMatched,
  isPowerUpTarget,
  cellSize,
}: GemCellProps) {
  const { gem, modifier, special } = cell;
  const pad = Math.max(1.5, cellSize * 0.04);

  // --- Bedrock cell ---
  if (modifier === 'bedrock') {
    return (
      <div
        className="absolute rounded-md"
        style={{
          inset: pad,
          background: 'linear-gradient(135deg, #1f2937, #374151 40%, #1f2937)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute inset-0 opacity-30 rounded-md" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)',
        }} />
      </div>
    );
  }

  // --- Rock cell ---
  if (modifier === 'rock') {
    return (
      <div
        className="absolute rounded-md"
        style={{
          inset: pad,
          background: 'linear-gradient(135deg, #78716c, #a8a29e 30%, #78716c 70%, #57534e)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-60">🪨</div>
        {isPowerUpTarget && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-yellow-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </div>
    );
  }

  // --- Empty cell ---
  if (!gem) {
    return (
      <div
        className="absolute rounded-md"
        style={{
          inset: pad + 0.5,
          background: 'rgba(0,0,0,0.08)',
        }}
      />
    );
  }

  // --- Gem cell ---
  const gemDef = GEM_DEFS[gem];
  const shape = GEM_SHAPES[gem];
  const colors = GEM_COLORS[gem];

  return (
    <motion.div
      className="absolute"
      style={{ inset: 0 }}
      initial={false}
      animate={{
        scale: isMatched ? [1, 1.2, 0] : isSelected ? 1.08 : 1,
        opacity: isMatched ? [1, 1, 0] : 1,
      }}
      transition={
        isMatched
          ? { duration: 0.35, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 25 }
      }
    >
      {/* Drop shadow beneath the gem */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '10%',
          clipPath: shape,
          background: 'rgba(0,0,0,0.45)',
          filter: 'blur(3px)',
          transform: 'translateY(2px)',
        }}
      />

      {/* Gem body with clip-path shape */}
      <div
        className="absolute overflow-hidden"
        style={{
          inset: '8%',
          clipPath: shape,
        }}
      >
        {/* Base body gradient */}
        <div className="absolute inset-0" style={{ background: gemDef.bgGradient }} />

        {/* Inner radial highlight (upper-left light source) */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 30% 25%, ${colors.light}50 0%, transparent 55%)`,
        }} />

        {/* Bottom edge darkening for depth */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom, transparent 45%, ${colors.dark}70 100%)`,
        }} />

        {/* Facet line 1 - diagonal highlight */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, transparent 36%, rgba(255,255,255,0.18) 39%, rgba(255,255,255,0.18) 41%, transparent 44%)',
        }} />

        {/* Facet line 2 - cross diagonal */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(45deg, transparent 54%, rgba(255,255,255,0.10) 56%, rgba(255,255,255,0.10) 58%, transparent 60%)',
        }} />

        {/* Specular highlight (top-left bright spot) */}
        <div className="absolute pointer-events-none" style={{
          width: '42%',
          height: '28%',
          top: '10%',
          left: '18%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 45%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(0.5px)',
        }} />

        {/* Edge rim light (top-left to bottom-right gradient) */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(155deg, rgba(255,255,255,0.22) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.05) 100%)',
        }} />
      </div>

      {/* Idle shimmer sweep animation */}
      {special === 'none' && !isMatched && (
        <div className="absolute overflow-hidden pointer-events-none" style={{ inset: '8%', clipPath: shape }}>
          <motion.div
            className="absolute w-[200%] h-full"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 70%)',
            }}
            animate={{ x: ['-200%', '100%'] }}
            transition={{
              repeat: Infinity,
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          />
        </div>
      )}

      {/* Special gem overlay */}
      {special !== 'none' && specialOverlay(special, cellSize)}

      {/* Modifier overlay */}
      {modifier !== 'none' && modifierOverlay(modifier)}

      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: '2%',
            border: '2px solid white',
            borderRadius: 6,
            boxShadow: `0 0 10px ${gemDef.color}, 0 0 20px ${gemDef.color}60`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}

      {/* Hint glow */}
      {isHinted && !isSelected && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: '2%',
            border: '2px solid #fbbf24',
            borderRadius: 6,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: ['0 0 4px #fbbf24', '0 0 14px #fbbf24', '0 0 4px #fbbf24'],
          }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}

      {/* Power-up target indicator */}
      {isPowerUpTarget && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: '4%',
            border: '2px solid #fb923c',
            borderRadius: 6,
          }}
          animate={{ opacity: [0.4, 1, 0.4], borderColor: ['#fb923c', '#fbbf24', '#fb923c'] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
});
