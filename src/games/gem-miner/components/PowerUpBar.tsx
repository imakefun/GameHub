import type { PowerUpType } from '../types';
import { POWERUP_DEFS } from '../data/powerups';

interface PowerUpBarProps {
  powerUps: Record<PowerUpType, number>;
  activePowerUp: PowerUpType | null;
  onActivate: (powerUp: PowerUpType) => void;
  isProcessing: boolean;
}

const POWERUP_ORDER: PowerUpType[] = ['pickaxe', 'dynamite', 'drill', 'earthquake', 'lantern'];

export function PowerUpBar({ powerUps, activePowerUp, onActivate, isProcessing }: PowerUpBarProps) {
  return (
    <div className="w-full max-w-md mx-auto px-2 py-2">
      <div className="flex items-center justify-center gap-2">
        {POWERUP_ORDER.map(type => {
          const def = POWERUP_DEFS[type];
          const count = powerUps[type] || 0;
          const isActive = activePowerUp === type;
          const isDisabled = count <= 0 || isProcessing;

          return (
            <button
              key={type}
              onClick={() => !isDisabled && onActivate(type)}
              disabled={isDisabled}
              title={`${def.name}: ${def.description}`}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-600/30 border-2 border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                  : isDisabled
                  ? 'bg-stone-800/50 border border-stone-700/30 opacity-40 cursor-not-allowed'
                  : 'bg-stone-800/80 border border-stone-600/50 hover:bg-stone-700/80 hover:border-amber-600/50 active:scale-95'
              }`}
            >
              <span className="text-lg leading-none">{def.emoji}</span>
              <span className="text-[10px] text-stone-400 leading-none">{def.name}</span>

              {/* Count badge */}
              <div className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                count > 0 ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-500'
              }`}>
                {count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active power-up instruction */}
      {activePowerUp && POWERUP_DEFS[activePowerUp].needsTarget && (
        <div className="text-center text-xs text-amber-400 mt-1.5 animate-pulse">
          Tap a cell to use {POWERUP_DEFS[activePowerUp].name}
        </div>
      )}
    </div>
  );
}
