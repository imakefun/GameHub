import { motion, AnimatePresence } from 'framer-motion';
import type { LevelResult, ObjectiveProgress } from '../types';
import { LEVELS } from '../data/levels';

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
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
          className={`text-3xl ${i < count ? '' : 'opacity-30 grayscale'}`}
        >
          ⭐
        </motion.span>
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

  return (
    <AnimatePresence>
      {result !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: result === 'win'
                ? 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
                : 'linear-gradient(180deg, #1c1917 0%, #291917 50%, #1c1917 100%)',
              border: `2px solid ${result === 'win' ? '#d97706' : '#991b1b'}`,
              boxShadow: result === 'win'
                ? '0 0 40px rgba(217, 119, 6, 0.3)'
                : '0 0 40px rgba(153, 27, 27, 0.3)',
            }}
          >
            {/* Header */}
            <div className="text-center pt-6 pb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="text-4xl mb-2"
              >
                {result === 'win' ? '💎' : '💔'}
              </motion.div>
              <h2 className={`text-2xl font-bold ${
                result === 'win' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {result === 'win' ? 'Level Complete!' : 'Out of Moves'}
              </h2>
              {level && (
                <p className="text-stone-500 text-sm mt-1">{level.name}</p>
              )}
            </div>

            {/* Stars (win only) */}
            {result === 'win' && (
              <div className="flex justify-center py-2">
                <StarDisplay count={stars} />
              </div>
            )}

            {/* Score */}
            <div className="text-center py-2">
              <div className="text-stone-500 text-xs uppercase tracking-wider">Score</div>
              <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
            </div>

            {/* Objectives status */}
            <div className="px-6 py-2 space-y-1.5">
              {objectives.map((obj, i) => {
                const complete = obj.current >= obj.target;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-stone-400">
                      {obj.type === 'score' ? 'Score Target' :
                       obj.type === 'collect_gems' ? `Collect ${obj.gemType}` :
                       obj.type === 'clear_rocks' ? 'Break Rocks' :
                       obj.type === 'clear_ice' ? 'Break Ice' :
                       obj.type === 'clear_dirt' ? 'Clear Dirt' : 'Goal'}
                    </span>
                    <span className={complete ? 'text-green-400' : 'text-red-400'}>
                      {Math.min(obj.current, obj.target)}/{obj.target} {complete ? '✓' : '✗'}
                    </span>
                  </div>
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
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
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
            <div className="flex gap-3 p-4 pt-4">
              <button
                onClick={onLevelSelect}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 hover:bg-stone-700 transition-colors"
              >
                Levels
              </button>
              <button
                onClick={onReplay}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-stone-700 border border-stone-600 hover:bg-stone-600 transition-colors"
              >
                Replay
              </button>
              {result === 'win' && hasNextLevel && (
                <button
                  onClick={onNext}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 border border-amber-500 hover:bg-amber-500 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
