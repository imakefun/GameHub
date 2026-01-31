import { motion, AnimatePresence } from 'framer-motion';
import type { PowerUpType } from '../types';
import { POWERUP_DEFS } from '../data/powerups';
import { soundEngine } from '../systems/SoundEngine';

interface PowerUpBarProps {
  powerUps: Record<PowerUpType, number>;
  activePowerUp: PowerUpType | null;
  onActivate: (powerUp: PowerUpType) => void;
  isProcessing: boolean;
}

const POWERUP_ORDER: PowerUpType[] = ['pickaxe', 'dynamite', 'drill', 'earthquake', 'lantern'];

export function PowerUpBar({ powerUps, activePowerUp, onActivate, isProcessing }: PowerUpBarProps) {
  return (
    <div className="w-full max-w-md mx-auto px-2 py-1">
      <div className="flex items-center justify-center gap-2">
        {POWERUP_ORDER.map((type, i) => {
          const def = POWERUP_DEFS[type];
          const count = powerUps[type] || 0;
          const isActive = activePowerUp === type;
          const isDisabled = count <= 0 || isProcessing;

          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isActive ? [1, 1.05, 1] : 1,
                boxShadow: isActive
                  ? ['0 0 8px rgba(245,158,11,0.3)', '0 0 16px rgba(245,158,11,0.5)', '0 0 8px rgba(245,158,11,0.3)']
                  : '0 0 0px transparent',
              }}
              transition={
                isActive
                  ? { scale: { repeat: Infinity, duration: 0.8 }, boxShadow: { repeat: Infinity, duration: 0.8 }, opacity: { delay: i * 0.05 }, y: { delay: i * 0.05 } }
                  : { delay: i * 0.05, type: 'spring', stiffness: 300 }
              }
              onClick={() => {
                if (!isDisabled) {
                  soundEngine.play('powerUpUse');
                  onActivate(type);
                }
              }}
              disabled={isDisabled}
              title={`${def.name}: ${def.description}`}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-amber-600/30 border-2 border-amber-500'
                  : isDisabled
                  ? 'bg-stone-800/50 border border-stone-700/30 opacity-40 cursor-not-allowed'
                  : 'bg-stone-800/80 border border-stone-600/50 hover:bg-stone-700/80 hover:border-amber-600/50'
              }`}
              whileTap={!isDisabled ? { scale: 0.9 } : undefined}
            >
              <motion.span
                className="text-lg leading-none"
                animate={isActive ? { rotate: [0, -10, 10, -5, 5, 0] } : { rotate: 0 }}
                transition={isActive ? { repeat: Infinity, duration: 0.5 } : {}}
              >
                {def.emoji}
              </motion.span>
              <span className="text-[10px] text-stone-400 leading-none">{def.name}</span>

              {/* Count badge */}
              <motion.div
                className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                  count > 0 ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-500'
                }`}
                key={count}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {count}
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Active power-up instruction */}
      <AnimatePresence>
        {activePowerUp && POWERUP_DEFS[activePowerUp].needsTarget && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center text-xs text-amber-400 mt-1.5"
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Tap a cell to use {POWERUP_DEFS[activePowerUp].name}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
