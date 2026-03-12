import { motion } from 'framer-motion';
import type { GameState, LevelDef, TowerId } from '../types';
import { TOWER_LIST } from '../data';
import { getSpriteUrl } from '../assets/sprites';

interface Props {
  state: GameState;
  level: LevelDef;
  onStartWave: () => void;
  onSetPlacing: (towerId: TowerId | null) => void;
  onPause: (paused: boolean) => void;
  onSetSpeed: (speed: number) => void;
  onExit: () => void;
}

export function GameHUD({ state, level, onStartWave, onSetPlacing, onPause, onSetSpeed, onExit }: Props) {
  const currentWaveDisplay = state.waveIndex;
  const totalWaves = level.waves.length;

  // Filter available towers by world unlock
  const availableTowers = TOWER_LIST.filter(t => t.unlockWorld <= (level.world || 6));

  return (
    <div className="flex flex-col gap-1.5">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/5">
        <button
          onClick={onExit}
          className="text-white/60 text-xs px-2.5 py-1.5 rounded-lg bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <img src={getSpriteUrl('ui', 'gold')} alt="gold" className="w-5 h-5" />
            <span className="text-amber-400 font-bold">{Math.floor(state.gold)}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src={getSpriteUrl('ui', 'heart')} alt="lives" className="w-5 h-5" />
            <span className="text-red-400 font-bold">{state.lives}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src={getSpriteUrl('ui', 'wave')} alt="wave" className="w-5 h-5" />
            <span className="text-white/60">{currentWaveDisplay}/{totalWaves}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPause(!state.isPaused)}
            className={`p-1.5 rounded-lg transition-colors ${
              state.isPaused ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            {state.isPaused ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            )}
          </button>
          <button
            onClick={() => onSetSpeed(state.gameSpeed === 1 ? 2 : 1)}
            className={`p-1.5 rounded-lg transition-colors ${
              state.gameSpeed === 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="3,4 13,12 3,20"/>
              <polygon points="13,4 23,12 13,20"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tower shop - horizontal scroll with SVG sprites */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-0.5 py-1">
        {availableTowers.map(tower => {
          const isSelected = state.placingTowerId === tower.id;
          const canAfford = state.gold >= tower.cost;
          const spriteUrl = getSpriteUrl('tower', tower.id);

          return (
            <button
              key={tower.id}
              onClick={() => onSetPlacing(isSelected ? null : tower.id)}
              disabled={!canAfford && !isSelected}
              className={`flex-shrink-0 flex flex-col items-center px-2 py-1.5 rounded-xl text-xs transition-all ${
                isSelected
                  ? 'bg-white/20 ring-2 ring-white/50 scale-105 shadow-lg'
                  : canAfford
                    ? 'bg-white/10 active:bg-white/20'
                    : 'bg-white/5 opacity-40'
              }`}
              style={{ minWidth: 58 }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={spriteUrl} alt={tower.name} className="w-7 h-7 drop-shadow" />
              </div>
              <span className="text-[10px] text-white/80 font-medium mt-0.5 leading-tight">{tower.name}</span>
              <span className={`text-[10px] font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                {tower.cost}g
              </span>
            </button>
          );
        })}
      </div>

      {/* Wave start button */}
      {!state.waveActive && !state.gameResult && state.waveIndex < totalWaves && (
        <motion.button
          onClick={onStartWave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-transform relative overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1.02, 1] }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            style={{ animation: 'shimmer 2s infinite' }}
          />
          <span className="relative">Start Wave {state.waveIndex + 1} / {totalWaves}</span>
        </motion.button>
      )}

      {state.waveActive && !state.gameResult && (
        <div className="w-full py-2.5 rounded-xl bg-white/10 text-center text-white/50 text-sm font-medium border border-white/5">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Wave in progress...
          </motion.span>
          <span className="text-white/40 ml-1">({state.enemies.filter(e => e.alive).length} enemies)</span>
        </div>
      )}

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
