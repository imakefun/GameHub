import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { ObjectiveProgress, GemType } from '../types';
import { GEM_DEFS } from '../data/gems';
import { LEVELS } from '../data/levels';

interface GameHUDProps {
  levelId: number;
  score: number;
  movesRemaining: number;
  objectives: ObjectiveProgress[];
  combo: number;
  onBack: () => void;
  onReset: () => void;
}

function objectiveLabel(obj: ObjectiveProgress): string {
  switch (obj.type) {
    case 'score':
      return 'Score';
    case 'collect_gems':
      return GEM_DEFS[obj.gemType as GemType]?.name || 'Gems';
    case 'clear_rocks':
      return 'Rocks';
    case 'clear_ice':
      return 'Ice';
    case 'clear_dirt':
      return 'Dirt';
    default:
      return 'Goal';
  }
}

function objectiveIcon(obj: ObjectiveProgress): string {
  switch (obj.type) {
    case 'score':
      return '⭐';
    case 'collect_gems': {
      const colors: Record<string, string> = {
        ruby: '🔴', sapphire: '🔵', emerald: '🟢', topaz: '🟡',
        amethyst: '🟣', diamond: '💎', obsidian: '⚫',
      };
      return colors[obj.gemType || ''] || '💎';
    }
    case 'clear_rocks':
      return '🪨';
    case 'clear_ice':
      return '🧊';
    case 'clear_dirt':
      return '🟤';
    default:
      return '🎯';
  }
}

export function GameHUD({ levelId, score, movesRemaining, objectives, combo, onBack, onReset }: GameHUDProps) {
  const level = LEVELS.find(l => l.id === levelId);
  const levelName = level?.name || `Level ${levelId}`;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top bar with back, level name, reset */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-stone-800"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center">
          <div className="text-sm font-bold text-amber-400">{levelName}</div>
          {level && (
            <div className="text-[10px] text-stone-500">Depth: {level.depth}m</div>
          )}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-stone-800"
        >
          <RotateCcw size={16} />
          <span className="text-sm">Retry</span>
        </button>
      </div>

      {/* Score and Moves */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="text-xs text-stone-500 uppercase tracking-wider">Score</div>
          <div className="text-lg font-bold text-white tabular-nums">{score.toLocaleString()}</div>
        </div>

        {combo > 1 && (
          <div className="text-amber-400 font-bold text-sm animate-bounce">
            {combo}x Combo!
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="text-xs text-stone-500 uppercase tracking-wider">Moves</div>
          <div className={`text-lg font-bold tabular-nums ${
            movesRemaining <= 5 ? 'text-red-400' : movesRemaining <= 10 ? 'text-amber-400' : 'text-white'
          }`}>
            {movesRemaining}
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="flex items-center justify-center gap-3 px-3 py-1.5 flex-wrap">
        {objectives.map((obj, i) => {
          const progress = Math.min(obj.current / obj.target, 1);
          const isComplete = obj.current >= obj.target;
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                isComplete
                  ? 'bg-green-900/50 border border-green-600/50 text-green-300'
                  : 'bg-stone-800/80 border border-stone-700/50 text-stone-300'
              }`}
            >
              <span>{objectiveIcon(obj)}</span>
              <span className="font-medium">{objectiveLabel(obj)}</span>
              <span className="tabular-nums">
                {Math.min(obj.current, obj.target)}/{obj.target}
              </span>
              {!isComplete && (
                <div className="w-8 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}
              {isComplete && <span>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
