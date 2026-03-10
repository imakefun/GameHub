import { motion } from 'framer-motion';

interface Props {
  totalStars: number;
  onPlay: () => void;
  onEditor: () => void;
}

export function TitleScreen({ totalStars, onPlay, onEditor }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 p-4 overflow-hidden relative">
      {/* Animated background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            initial={{ y: '110vh', x: `${5 + (i * 17) % 90}vw` }}
            animate={{ y: '-10vh' }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          >
            {['🏹', '🔮', '💣', '❄️', '⚡', '🎯', '🛡️', '🗡️', '🌲', '🏔️'][i % 10]}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Title */}
        <div className="mb-2">
          <motion.div
            className="text-6xl sm:text-7xl mb-2"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🏰
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 drop-shadow-lg">
            Tower Defense
          </h1>
          <p className="text-lg text-purple-300 mt-1 font-medium">Kingdom Guardians</p>
        </div>

        {/* Stars */}
        {totalStars > 0 && (
          <motion.div
            className="text-amber-300 text-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-2xl">⭐</span> {totalStars} stars collected
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6 w-64 mx-auto">
          <motion.button
            onClick={onPlay}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold text-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Campaign
          </motion.button>

          <motion.button
            onClick={onEditor}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Level Editor
          </motion.button>
        </div>

        {/* Cute characters */}
        <div className="flex justify-center gap-4 mt-8 text-3xl">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>🧙</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>🏹</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>🗡️</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>🛡️</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}>⚔️</motion.span>
        </div>
      </motion.div>
    </div>
  );
}
