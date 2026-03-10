import { motion } from 'framer-motion';
import type { GameState, LevelDef, TowerId } from '../types';
import { TOWER_LIST } from '../data';

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
      <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5">
        <button
          onClick={onExit}
          className="text-white/70 text-xs px-2 py-1 rounded bg-white/10 active:bg-white/20"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 text-sm">
          <div className="text-amber-400 font-bold">
            💰 {Math.floor(state.gold)}
          </div>
          <div className="text-red-400 font-bold">
            ❤️ {state.lives}
          </div>
          <div className="text-white/70">
            🌊 {currentWaveDisplay}/{totalWaves}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPause(!state.isPaused)}
            className={`text-xs px-2 py-1 rounded ${
              state.isPaused ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            {state.isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={() => onSetSpeed(state.gameSpeed === 1 ? 2 : 1)}
            className={`text-xs px-2 py-1 rounded ${
              state.gameSpeed === 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/70'
            }`}
          >
            {state.gameSpeed === 2 ? '⏩' : '▶▶'}
          </button>
        </div>
      </div>

      {/* Tower shop - horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-0.5 py-1">
        {availableTowers.map(tower => {
          const isSelected = state.placingTowerId === tower.id;
          const canAfford = state.gold >= tower.cost;

          return (
            <button
              key={tower.id}
              onClick={() => onSetPlacing(isSelected ? null : tower.id)}
              disabled={!canAfford && !isSelected}
              className={`flex-shrink-0 flex flex-col items-center px-2 py-1.5 rounded-xl text-xs transition-all ${
                isSelected
                  ? 'bg-white/25 ring-2 ring-white/50 scale-105'
                  : canAfford
                    ? 'bg-white/10 active:bg-white/20'
                    : 'bg-white/5 opacity-50'
              }`}
              style={{ minWidth: 56 }}
            >
              <span className="text-lg">{tower.emoji}</span>
              <span className="text-[10px] text-white/80 font-medium mt-0.5">{tower.name}</span>
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
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-transform"
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1.02, 1] }}
          transition={{ duration: 0.5 }}
        >
          Start Wave {state.waveIndex + 1} / {totalWaves}
        </motion.button>
      )}

      {state.waveActive && !state.gameResult && (
        <div className="w-full py-2 rounded-xl bg-white/10 text-center text-white/60 text-sm font-medium">
          Wave in progress... ({state.enemies.filter(e => e.alive).length} enemies)
        </div>
      )}
    </div>
  );
}
