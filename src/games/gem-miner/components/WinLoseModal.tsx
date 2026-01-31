import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LevelResult, ObjectiveProgress } from '../types';
import { LEVELS } from '../data/levels';
import { soundEngine } from '../systems/SoundEngine';

interface WinLoseModalProps {
  result: LevelResult;
  levelId: number;
  score: number;
  objectives: ObjectiveProgress[];
  stars: number;
  onReplay: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

function StarDisplay({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180, y: 20 }}
          animate={{
            scale: i < count ? [0, 1.3, 1] : [0, 0.8, 0.7],
            rotate: 0,
            y: 0,
          }}
          transition={{
            delay: 0.4 + i * 0.25,
            type: 'spring',
            stiffness: 200,
            damping: 12,
          }}
          className="relative"
        >
          <span className={`text-4xl ${i < count ? '' : 'opacity-20 grayscale'}`}>⭐</span>
          {/* Glow behind earned stars */}
          {i < count && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3], scale: [0.5, 1.5, 1.2] }}
              transition={{ delay: 0.5 + i * 0.25, duration: 0.5 }}
              style={{
                background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function WinLoseModal({
  result,
  levelId,
  score,
  objectives,
  stars,
  onReplay,
  onNext,
  onLevelSelect,
}: WinLoseModalProps) {
  const level = LEVELS.find(l => l.id === levelId);
  const hasNextLevel = LEVELS.some(l => l.id === levelId + 1);
  const soundPlayedRef = useRef<LevelResult>('none');

  // Play sound when result changes
  useEffect(() => {
    if (result !== 'none' && result !== soundPlayedRef.current) {
      soundPlayedRef.current = result;
      soundEngine.stopMusic();
      if (result === 'win') {
        soundEngine.play('win');
      } else {
        soundEngine.play('lose');
      }
    }
    if (result === 'none') {
      soundPlayedRef.current = 'none';
    }
  }, [result]);

  return (
    <AnimatePresence>
      {result !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          {/* Background celebration particles for win */}
          {result === 'win' && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    background: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#fbbf24'][i % 6],
                    left: `${10 + Math.random() * 80}%`,
                    top: '-5%',
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: 0.2 + Math.random() * 0.8,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                />
              ))}
            </>
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden relative"
            style={{
              background: result === 'win'
                ? 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
                : 'linear-gradient(180deg, #1c1917 0%, #291917 50%, #1c1917 100%)',
              border: `2px solid ${result === 'win' ? '#d97706' : '#991b1b'}`,
              boxShadow: result === 'win'
                ? '0 0 60px rgba(217, 119, 6, 0.4), 0 0 120px rgba(217, 119, 6, 0.15)'
                : '0 0 40px rgba(153, 27, 27, 0.3)',
            }}
          >
            {/* Animated glow ring for win */}
            {result === 'win' && (
              <motion.div
                className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                animate={{
                  boxShadow: [
                    'inset 0 0 20px rgba(251,191,36,0.1)',
                    'inset 0 0 40px rgba(251,191,36,0.2)',
                    'inset 0 0 20px rgba(251,191,36,0.1)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}

            {/* Header */}
            <div className="text-center pt-6 pb-3">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: [0, 1.3, 1], rotate: [-30, 10, 0] }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="text-5xl mb-3"
              >
                {result === 'win' ? '💎' : '💔'}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-bold ${
                  result === 'win' ? 'text-amber-400' : 'text-red-400'
                }`}
                style={result === 'win' ? { textShadow: '0 0 20px rgba(251,191,36,0.3)' } : undefined}
              >
                {result === 'win' ? 'Level Complete!' : 'Out of Moves'}
              </motion.h2>
              {level && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-stone-500 text-sm mt-1"
                >
                  {level.name}
                </motion.p>
              )}
            </div>

            {/* Stars (win only) */}
            {result === 'win' && (
              <div className="flex justify-center py-2">
                <StarDisplay count={stars} />
              </div>
            )}

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-2"
            >
              <div className="text-stone-500 text-xs uppercase tracking-wider">Score</div>
              <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
            </motion.div>

            {/* Objectives status */}
            <div className="px-6 py-2 space-y-1.5">
              {objectives.map((obj, i) => {
                const complete = obj.current >= obj.target;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-stone-400">
                      {obj.type === 'score' ? 'Score Target' :
                       obj.type === 'collect_gems' ? `Collect ${obj.gemType}` :
                       obj.type === 'clear_rocks' ? 'Break Rocks' :
                       obj.type === 'clear_ice' ? 'Break Ice' :
                       obj.type === 'clear_dirt' ? 'Clear Dirt' : 'Goal'}
                    </span>
                    <span className={complete ? 'text-green-400 font-medium' : 'text-red-400'}>
                      {Math.min(obj.current, obj.target)}/{obj.target} {complete ? '✓' : '✗'}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Rewards (win only) */}
            {result === 'win' && level && level.rewards.length > 0 && (
              <div className="px-6 py-2">
                <div className="text-stone-500 text-xs uppercase tracking-wider text-center mb-1">Rewards</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {level.rewards.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 300 }}
                      className="flex items-center gap-1 bg-amber-900/30 border border-amber-700/50 rounded-full px-2.5 py-1 text-xs text-amber-300"
                    >
                      <span>+{r.count}</span>
                      <span className="capitalize">{r.powerUp}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 p-4 pt-4"
            >
              <motion.button
                onClick={() => { soundEngine.play('buttonClick'); onLevelSelect(); }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 hover:bg-stone-700 transition-colors"
              >
                Levels
              </motion.button>
              <motion.button
                onClick={() => { soundEngine.play('buttonClick'); onReplay(); }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-stone-700 border border-stone-600 hover:bg-stone-600 transition-colors"
              >
                Replay
              </motion.button>
              {result === 'win' && hasNextLevel && (
                <motion.button
                  onClick={() => { soundEngine.play('buttonClick'); onNext(); }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 border border-amber-500 hover:bg-amber-500 transition-colors"
                  animate={{
                    boxShadow: ['0 0 4px #d97706', '0 0 12px #d97706', '0 0 4px #d97706'],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Next
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
