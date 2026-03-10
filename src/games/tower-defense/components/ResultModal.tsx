import { motion } from 'framer-motion';

interface Props {
  result: 'won' | 'lost';
  stars: number;
  score: number;
  livesLeft: number;
  maxLives: number;
  onRetry: () => void;
  onExit: () => void;
  onNextLevel: (() => void) | null;
}

export function ResultModal({ result, stars, score, livesLeft, maxLives, onRetry, onExit, onNextLevel }: Props) {
  const isWin = result === 'won';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-full max-w-xs rounded-3xl p-6 text-center ${
          isWin
            ? 'bg-gradient-to-b from-amber-900 to-amber-950 border border-amber-700/50'
            : 'bg-gradient-to-b from-red-900 to-red-950 border border-red-700/50'
        }`}
      >
        {/* Icon */}
        <motion.div
          className="text-5xl mb-2"
          animate={isWin ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : { scale: [1, 0.9, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
        >
          {isWin ? '🎉' : '💔'}
        </motion.div>

        <h2 className="text-2xl font-extrabold text-white mb-1">
          {isWin ? 'Victory!' : 'Defeated!'}
        </h2>

        {isWin && (
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3].map(i => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.2, type: 'spring' }}
                className={`text-3xl ${i <= stars ? '' : 'opacity-20'}`}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        )}

        <div className="text-white/70 text-sm mb-4 space-y-1">
          <div>Score: <span className="text-white font-bold">{score.toLocaleString()}</span></div>
          <div>Lives: <span className="text-white font-bold">{livesLeft}/{maxLives}</span></div>
        </div>

        <div className="flex flex-col gap-2">
          {isWin && onNextLevel && (
            <motion.button
              onClick={onNextLevel}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold shadow-lg active:scale-95 transition-transform"
              whileTap={{ scale: 0.95 }}
            >
              Next Level →
            </motion.button>
          )}
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl bg-white/15 text-white font-bold active:bg-white/25 transition-colors"
          >
            {isWin ? 'Retry' : 'Try Again'}
          </button>
          <button
            onClick={onExit}
            className="w-full py-2 rounded-xl text-white/60 text-sm active:text-white/80 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
