import { motion } from 'framer-motion';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onExit: () => void;
}

export function PauseMenu({ onResume, onRestart, onSettings, onExit }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-xs bg-gradient-to-b from-slate-800/95 to-slate-900/95 rounded-3xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-extrabold text-white text-center mb-6">Paused</h2>

        <div className="flex flex-col gap-3">
          <motion.button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold shadow-lg shadow-emerald-500/30"
            whileTap={{ scale: 0.97 }}
          >
            Resume
          </motion.button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold active:bg-white/20 transition-colors"
          >
            Restart Level
          </button>

          <button
            onClick={onSettings}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold active:bg-white/20 transition-colors"
          >
            Settings
          </button>

          <button
            onClick={onExit}
            className="w-full py-2 rounded-xl text-white/50 text-sm active:text-white/80 transition-colors"
          >
            Quit to Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
