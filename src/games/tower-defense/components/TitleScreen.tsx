import { motion } from 'framer-motion';
import { getSpriteUrl } from '../assets/sprites';
import { monetizationManager } from '../systems/monetization';

interface Props {
  totalStars: number;
  onPlay: () => void;
  onEditor: () => void;
  onSettings: () => void;
}

const FLOATING_ITEMS = [
  { sprite: 'tower', id: 'archer' },
  { sprite: 'tower', id: 'mage' },
  { sprite: 'tower', id: 'cannon' },
  { sprite: 'tower', id: 'frost' },
  { sprite: 'tower', id: 'lightning' },
  { sprite: 'enemy', id: 'slime' },
  { sprite: 'enemy', id: 'goblin' },
  { sprite: 'enemy', id: 'skeleton' },
  { sprite: 'enemy', id: 'bat' },
  { sprite: 'enemy', id: 'dragon' },
  { sprite: 'tower', id: 'sniper' },
  { sprite: 'tower', id: 'bomb' },
  { sprite: 'enemy', id: 'ghost' },
  { sprite: 'enemy', id: 'spider' },
  { sprite: 'tower', id: 'nature' },
  { sprite: 'enemy', id: 'wolf' },
  { sprite: 'enemy', id: 'orc' },
  { sprite: 'tower', id: 'poison' },
  { sprite: 'enemy', id: 'mushroom' },
  { sprite: 'enemy', id: 'knight' },
] as const;

const HERO_SPRITES = ['archer', 'mage', 'cannon', 'frost', 'lightning'] as const;

export function TitleScreen({ totalStars, onPlay, onEditor, onSettings }: Props) {
  const gems = monetizationManager.getGems();
  const gemIconUrl = getSpriteUrl('ui', 'gem');

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 p-4 overflow-hidden relative">
      {/* Parallax background layer 1 - slow stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              left: `${(i * 13 + 7) % 100}%`,
              top: `${(i * 17 + 3) % 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Parallax background layer 2 - floating sprites */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_ITEMS.map((item, i) => {
          const url = getSpriteUrl(item.sprite as 'tower' | 'enemy', item.id);
          return (
            <motion.img
              key={`float-${i}`}
              src={url}
              alt=""
              className="absolute opacity-15 blur-[0.5px]"
              style={{ width: 28 + (i % 3) * 8, height: 28 + (i % 3) * 8 }}
              initial={{ y: '110vh', x: `${3 + (i * 19) % 94}vw` }}
              animate={{ y: '-10vh' }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 6,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <motion.div
        className="relative z-10 text-center max-w-sm w-full"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {/* Castle icon with glow */}
        <div className="mb-3 relative">
          <motion.div
            className="absolute inset-0 mx-auto w-20 h-20 rounded-full bg-amber-500/20 blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="text-7xl relative"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🏰
          </motion.div>
        </div>

        {/* Title with gradient and shadow */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 drop-shadow-lg leading-tight">
          Tower Defense
        </h1>
        <p className="text-lg text-purple-300 mt-1 font-medium tracking-wide">Kingdom Guardians</p>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-4 mt-4 mb-6">
          {totalStars > 0 && (
            <motion.div
              className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <img src={getSpriteUrl('ui', 'star')} alt="stars" className="w-5 h-5" />
              <span className="text-amber-300 font-bold text-sm">{totalStars}</span>
            </motion.div>
          )}
          {gems > 0 && (
            <motion.div
              className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <img src={gemIconUrl} alt="gems" className="w-5 h-5" />
              <span className="text-purple-300 font-bold text-sm">{gems}</span>
            </motion.div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            onClick={onPlay}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold text-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%]"
              style={{ animation: 'shimmer 3s infinite' }}
            />
            Play Campaign
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              onClick={onEditor}
              className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Level Editor
            </motion.button>

            <motion.button
              onClick={onSettings}
              className="px-4 py-3 rounded-2xl bg-white/10 text-white/80 font-bold text-base active:scale-95 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2 L13 6 M12 22 L11 18 M2 12 L6 11 M22 12 L18 13 M4.93 4.93 L7.76 7.76 M19.07 19.07 L16.24 16.24 M4.93 19.07 L7.76 16.24 M19.07 4.93 L16.24 7.76"/>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Hero tower parade */}
        <div className="flex justify-center gap-3 mt-8">
          {HERO_SPRITES.map((id, i) => (
            <motion.img
              key={id}
              src={getSpriteUrl('tower', id)}
              alt={id}
              className="w-10 h-10 drop-shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-200%) skewX(-12deg); }
          50% { transform: translateX(200%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}
