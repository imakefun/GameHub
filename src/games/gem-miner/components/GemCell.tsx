import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Cell, Position, SpecialGemType } from '../types';
import { GEM_DEFS } from '../data/gems';

interface GemCellProps {
  cell: Cell;
  isSelected: boolean;
  isHinted: boolean;
  isMatched: boolean;
  isPowerUpTarget: boolean;
  cellSize: number;
  onClick: (pos: Position) => void;
}

// --- Special gem visual overlays ---

function specialOverlay(special: SpecialGemType, cellSize: number) {
  switch (special) {
    case 'striped_h':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
          {[-2, -1, 0, 1, 2].map(i => (
            <div key={i} className="absolute w-full bg-white/40" style={{
              height: 1.5,
              top: `${50 + i * 18}%`,
            }} />
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-cellSize, cellSize] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      );
    case 'striped_v':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
          {[-2, -1, 0, 1, 2].map(i => (
            <div key={i} className="absolute h-full bg-white/40" style={{
              width: 1.5,
              left: `${50 + i * 18}%`,
            }} />
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
            animate={{ y: [-cellSize, cellSize] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      );
    case 'bomb':
      return (
        <>
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-white/50 pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-white/30 pointer-events-none"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        </>
      );
    case 'prismatic':
      return (
        <>
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
              opacity: 0.4,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 rounded-lg pointer-events-none bg-white/10"
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
        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 border-2 border-cyan-300/60 rounded-lg bg-cyan-200/15" />
          <div className="absolute top-0.5 left-1 w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
          <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 bg-white/30 rounded-full blur-[0.5px]" />
          <div className="absolute top-1 right-0.5 w-1 h-1 bg-cyan-200/50 rounded-full" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-cyan-300/10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        </div>
      );
    case 'dirt':
      return (
        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-amber-900/40 rounded-lg" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-800/20 to-transparent" />
        </div>
      );
    case 'locked':
      return (
        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 border-2 border-gray-400/50 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-gray-400/70 text-[10px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🔒
            </motion.span>
          </div>
          <div className="absolute inset-0 bg-gray-500/10 rounded-lg" />
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
  onClick,
}: GemCellProps) {
  const { gem, modifier, special, row, col } = cell;
  const px = col * cellSize + 1.5;
  const py = row * cellSize + 1.5;
  const s = cellSize - 3;

  // --- Bedrock cell ---
  if (modifier === 'bedrock') {
    return (
      <div
        className="absolute rounded-md"
        style={{
          width: s + 1, height: s + 1,
          left: px - 0.5, top: py - 0.5,
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
      <motion.div
        className="absolute rounded-md cursor-pointer"
        style={{
          width: s + 1, height: s + 1,
          left: px - 0.5, top: py - 0.5,
          background: 'linear-gradient(135deg, #78716c, #a8a29e 30%, #78716c 70%, #57534e)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
        }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onClick({ row, col })}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-60">🪨</div>
        {isPowerUpTarget && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-yellow-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </motion.div>
    );
  }

  // --- Empty cell ---
  if (!gem) {
    return (
      <div
        className="absolute rounded-md"
        style={{
          width: s, height: s,
          left: px, top: py,
          background: 'rgba(0,0,0,0.08)',
        }}
      />
    );
  }

  // --- Gem cell ---
  const gemDef = GEM_DEFS[gem];

  return (
    <motion.div
      className="absolute rounded-lg cursor-pointer"
      style={{
        width: s, height: s,
        left: px, top: py,
        background: gemDef.bgGradient,
        zIndex: isSelected ? 10 : isMatched ? 5 : 1,
      }}
      initial={false}
      animate={{
        scale: isMatched ? [1, 1.2, 0] : isSelected ? 1.12 : 1,
        opacity: isMatched ? [1, 1, 0] : 1,
        boxShadow: isSelected
          ? `0 0 14px ${gemDef.color}, 0 0 28px ${gemDef.color}60, inset 0 2px 4px rgba(255,255,255,0.4)`
          : isHinted
          ? `0 0 10px #fbbf24, 0 0 20px #fbbf2460, inset 0 2px 4px rgba(255,255,255,0.3)`
          : `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)`,
      }}
      transition={
        isMatched
          ? { duration: 0.35, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 25 }
      }
      whileTap={(!isMatched && !isSelected) ? { scale: 0.92 } : undefined}
      onClick={() => onClick({ row, col })}
    >
      {/* Gem inner highlight / shine */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '45%',
          height: '30%',
          top: '10%',
          left: '15%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.7), rgba(255,255,255,0.1) 60%, transparent)',
        }}
      />

      {/* Idle shimmer animation */}
      {special === 'none' && !isMatched && (
        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-[200%] h-full"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 70%)',
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
          className="absolute -inset-1 rounded-xl border-2 border-white pointer-events-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}

      {/* Hint glow */}
      {isHinted && !isSelected && (
        <motion.div
          className="absolute -inset-1 rounded-xl border-2 border-yellow-400 pointer-events-none"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: ['0 0 4px #fbbf24', '0 0 12px #fbbf24', '0 0 4px #fbbf24'],
          }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}

      {/* Power-up target crosshair */}
      {isPowerUpTarget && (
        <motion.div
          className="absolute -inset-0.5 rounded-lg border-2 border-orange-400 pointer-events-none"
          animate={{ opacity: [0.4, 1, 0.4], borderColor: ['#fb923c', '#fbbf24', '#fb923c'] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
});
