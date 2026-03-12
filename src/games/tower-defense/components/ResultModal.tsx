import { motion } from 'framer-motion';
import { getSpriteUrl } from '../assets/sprites';
import { monetizationManager, GEM_COSTS } from '../systems/monetization';

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
  const canContinue = !isWin && monetizationManager.canAfford('continue_after_loss');
  const continueCost = GEM_COSTS.continue_after_loss ?? 20;
  const gemIconUrl = getSpriteUrl('ui', 'gem');
  const canWatchAd = !isWin && monetizationManager.canWatchRewardedVideo();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-full max-w-xs rounded-3xl p-6 text-center relative overflow-hidden ${
          isWin
            ? 'bg-gradient-to-b from-amber-900/95 to-amber-950/95 border border-amber-600/30'
            : 'bg-gradient-to-b from-red-900/95 to-red-950/95 border border-red-600/30'
        }`}
      >
        {/* Decorative particles */}
        {isWin && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-400"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  x: `${10 + Math.random() * 80}%`,
                  y: `${10 + Math.random() * 80}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}

        {/* Icon */}
        <motion.div
          className="text-5xl mb-2 relative"
          animate={isWin
            ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }
            : { scale: [1, 0.9, 1] }
          }
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
        >
          {isWin ? '🏆' : '💀'}
        </motion.div>

        <h2 className="text-2xl font-extrabold text-white mb-1">
          {isWin ? 'Victory!' : 'Defeated!'}
        </h2>

        {/* Stars */}
        {isWin && (
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.2, type: 'spring' }}
              >
                <img
                  src={getSpriteUrl('ui', i <= stars ? 'star' : 'starEmpty')}
                  alt=""
                  className="w-10 h-10 drop-shadow-lg"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="bg-black/30 rounded-xl p-3 mb-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Score</span>
            <span className="text-white font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-white/60 mt-1">
            <span>Lives</span>
            <span className="text-white font-bold">{livesLeft}/{maxLives}</span>
          </div>
          {isWin && (
            <div className="flex justify-between text-white/60 mt-1">
              <span>Gems earned</span>
              <span className="text-purple-300 font-bold flex items-center gap-1">
                +{stars}
                <img src={gemIconUrl} alt="" className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {isWin && onNextLevel && (
            <motion.button
              onClick={onNextLevel}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
              whileTap={{ scale: 0.95 }}
            >
              Next Level →
            </motion.button>
          )}

          {/* Continue with gems (on loss) */}
          {!isWin && canContinue && (
            <motion.button
              onClick={() => {
                // PLACEHOLDER: spending gems to continue would restore lives and resume
                monetizationManager.spendGems('continue_after_loss');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              Continue
              <span className="flex items-center gap-0.5 text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {continueCost}
                <img src={gemIconUrl} alt="" className="w-3.5 h-3.5" />
              </span>
            </motion.button>
          )}

          {/* Watch ad to continue (on loss) */}
          {!isWin && canWatchAd && (
            <motion.button
              onClick={() => {
                monetizationManager.watchRewardedVideo('post_loss_continue');
              }}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-bold active:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/10"
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,4 20,12 6,20"/>
              </svg>
              Watch Ad to Continue
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
            className="w-full py-2 rounded-xl text-white/50 text-sm active:text-white/80 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
