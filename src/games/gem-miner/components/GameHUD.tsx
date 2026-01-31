import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { ObjectiveProgress, GemType } from '../types';
import { GEM_DEFS } from '../data/gems';
import { LEVELS } from '../data/levels';
import { soundEngine } from '../systems/SoundEngine';

interface GameHUDProps {
  levelId: number;
  score: number;
  movesRemaining: number;
  objectives: ObjectiveProgress[];
  combo: number;
  onBack: () => void;
  onReset: () => void;
}

function objectiveLabel(obj: ObjectiveProgress): string {
  switch (obj.type) {
    case 'score': return 'Score';
    case 'collect_gems': return GEM_DEFS[obj.gemType as GemType]?.name || 'Gems';
    case 'clear_rocks': return 'Rocks';
    case 'clear_ice': return 'Ice';
    case 'clear_dirt': return 'Dirt';
    default: return 'Goal';
  }
}

function objectiveIcon(obj: ObjectiveProgress): string {
  switch (obj.type) {
    case 'score': return '⭐';
    case 'collect_gems': {
      const colors: Record<string, string> = {
        ruby: '🔴', sapphire: '🔵', emerald: '🟢', topaz: '🟡',
        amethyst: '🟣', diamond: '💎', obsidian: '⚫',
      };
      return colors[obj.gemType || ''] || '💎';
    }
    case 'clear_rocks': return '🪨';
    case 'clear_ice': return '🧊';
    case 'clear_dirt': return '🟤';
    default: return '🎯';
  }
}

// Animated number counter
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;

    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

export function GameHUD({ levelId, score, movesRemaining, objectives, combo, onBack, onReset }: GameHUDProps) {
  const level = LEVELS.find(l => l.id === levelId);
  const levelName = level?.name || `Level ${levelId}`;
  const [sfxOn, setSfxOn] = useState(soundEngine.sfxEnabled);

  const toggleSound = () => {
    const newSfx = soundEngine.toggleSfx();
    setSfxOn(newSfx);
    if (newSfx) {
      if (!soundEngine.musicEnabled) soundEngine.toggleMusic();
    } else {
      if (soundEngine.musicEnabled) soundEngine.toggleMusic();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <button
          onClick={() => { soundEngine.play('buttonClick'); onBack(); }}
          className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-stone-800"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center">
          <div className="text-sm font-bold text-amber-400">{levelName}</div>
          {level && (
            <div className="text-[10px] text-stone-500">Depth: {level.depth}m</div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="text-stone-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-800"
          >
            {sfxOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => { soundEngine.play('buttonClick'); onReset(); }}
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-stone-800"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      </div>

      {/* Score and Moves */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="text-xs text-stone-500 uppercase tracking-wider">Score</div>
          <AnimatedNumber value={score} className="text-lg font-bold text-white tabular-nums" />
        </div>

        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              key="combo"
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <motion.div
                className="text-amber-400 font-extrabold text-sm px-2 py-0.5 rounded-full"
                animate={{
                  textShadow: ['0 0 4px #fbbf24', '0 0 12px #fbbf24', '0 0 4px #fbbf24'],
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.15))',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}
              >
                {combo}x COMBO
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <div className="text-xs text-stone-500 uppercase tracking-wider">Moves</div>
          <motion.div
            key={movesRemaining}
            initial={movesRemaining < 10 ? { scale: 1.3 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`text-lg font-bold tabular-nums ${
              movesRemaining <= 3 ? 'text-red-400' : movesRemaining <= 7 ? 'text-amber-400' : 'text-white'
            }`}
          >
            {movesRemaining}
          </motion.div>
        </div>
      </div>

      {/* Objectives */}
      <div className="flex items-center justify-center gap-3 px-3 py-1.5 flex-wrap">
        {objectives.map((obj, i) => {
          const progress = Math.min(obj.current / obj.target, 1);
          const isComplete = obj.current >= obj.target;
          return (
            <motion.div
              key={i}
              animate={isComplete ? {
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0px #22c55e', '0 0 10px #22c55e', '0 0 0px #22c55e'],
              } : {}}
              transition={isComplete ? { duration: 0.5 } : {}}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
                isComplete
                  ? 'bg-green-900/50 border border-green-600/50 text-green-300'
                  : 'bg-stone-800/80 border border-stone-700/50 text-stone-300'
              }`}
            >
              <span>{objectiveIcon(obj)}</span>
              <span className="font-medium">{objectiveLabel(obj)}</span>
              <span className="tabular-nums">
                <AnimatedNumber value={Math.min(obj.current, obj.target)} />/{obj.target}
              </span>
              {!isComplete && (
                <div className="w-8 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              {isComplete && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>✓</motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
