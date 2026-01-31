import { memo } from 'react';
import type { Cell, Position, SpecialGemType } from '../types';
import { GEM_DEFS } from '../data/gems';

interface GemCellProps {
  cell: Cell;
  isSelected: boolean;
  isHinted: boolean;
  isMatched: boolean;
  isPowerUpTarget: boolean;
  cellSize: number;
  onClick: (pos: Position) => void;
}

function specialOverlay(special: SpecialGemType) {
  switch (special) {
    case 'striped_h':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[2px] bg-white/70" />
        </div>
      );
    case 'striped_v':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[2px] bg-white/70" />
        </div>
      );
    case 'bomb':
      return (
        <div className="absolute inset-1 rounded-full border-2 border-white/50 pointer-events-none animate-pulse" />
      );
    case 'prismatic':
      return (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none animate-spin"
          style={{
            background: 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
            opacity: 0.4,
            animationDuration: '3s',
          }}
        />
      );
    default:
      return null;
  }
}

function modifierOverlay(modifier: Cell['modifier']) {
  switch (modifier) {
    case 'ice':
      return (
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-300/60 bg-cyan-200/20 pointer-events-none">
          <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white/40 rounded-full" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/30 rounded-full" />
        </div>
      );
    case 'dirt':
      return (
        <div className="absolute inset-0 rounded-lg bg-amber-800/40 pointer-events-none">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }} />
        </div>
      );
    case 'locked':
      return (
        <div className="absolute inset-0 rounded-lg border-2 border-gray-400/60 pointer-events-none flex items-center justify-center">
          <span className="text-gray-400/60 text-xs">🔒</span>
        </div>
      );
    default:
      return null;
  }
}

export const GemCell = memo(function GemCell({
  cell,
  isSelected,
  isHinted,
  isMatched,
  isPowerUpTarget,
  cellSize,
  onClick,
}: GemCellProps) {
  const { gem, modifier, special, row, col } = cell;

  // Bedrock cell
  if (modifier === 'bedrock') {
    return (
      <div
        className="absolute rounded-md"
        style={{
          width: cellSize - 2,
          height: cellSize - 2,
          left: col * cellSize + 1,
          top: row * cellSize + 1,
          background: 'linear-gradient(135deg, #1f2937, #374151 40%, #1f2937)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)',
        }} />
      </div>
    );
  }

  // Rock cell (no gem visible)
  if (modifier === 'rock') {
    return (
      <div
        className="absolute rounded-md cursor-pointer active:scale-95 transition-transform"
        style={{
          width: cellSize - 2,
          height: cellSize - 2,
          left: col * cellSize + 1,
          top: row * cellSize + 1,
          background: 'linear-gradient(135deg, #78716c, #a8a29e 30%, #78716c 70%, #57534e)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
        }}
        onClick={() => onClick({ row, col })}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-60">🪨</div>
        {isPowerUpTarget && (
          <div className="absolute inset-0 rounded-md border-2 border-yellow-400 animate-pulse" />
        )}
      </div>
    );
  }

  // Empty cell (no gem)
  if (!gem) {
    return (
      <div
        className="absolute rounded-md"
        style={{
          width: cellSize - 2,
          height: cellSize - 2,
          left: col * cellSize + 1,
          top: row * cellSize + 1,
          background: 'rgba(0,0,0,0.1)',
        }}
      />
    );
  }

  const gemDef = GEM_DEFS[gem];

  return (
    <div
      className={`absolute rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-110 z-10' : 'active:scale-95'
      } ${isMatched ? 'scale-0 opacity-0' : ''}`}
      style={{
        width: cellSize - 3,
        height: cellSize - 3,
        left: col * cellSize + 1.5,
        top: row * cellSize + 1.5,
        background: gemDef.bgGradient,
        boxShadow: isSelected
          ? `0 0 12px ${gemDef.color}, 0 0 24px ${gemDef.color}80, inset 0 2px 4px rgba(255,255,255,0.3)`
          : isHinted
          ? `0 0 8px #fbbf24, 0 0 16px #fbbf2480, inset 0 2px 4px rgba(255,255,255,0.3)`
          : `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)`,
        transitionDuration: isMatched ? '300ms' : '200ms',
      }}
      onClick={() => onClick({ row, col })}
    >
      {/* Inner highlight */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          width: '40%',
          height: '30%',
          top: '12%',
          left: '18%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent)',
        }}
      />

      {/* Special gem overlay */}
      {special !== 'none' && specialOverlay(special)}

      {/* Modifier overlay */}
      {modifier !== 'none' && modifierOverlay(modifier)}

      {/* Selection ring */}
      {isSelected && (
        <div className="absolute -inset-0.5 rounded-lg border-2 border-white animate-pulse pointer-events-none" />
      )}

      {/* Hint ring */}
      {isHinted && !isSelected && (
        <div className="absolute -inset-0.5 rounded-lg border-2 border-yellow-400 animate-bounce pointer-events-none" />
      )}

      {/* Power-up target indicator */}
      {isPowerUpTarget && (
        <div className="absolute -inset-0.5 rounded-lg border-2 border-orange-400 animate-pulse pointer-events-none" />
      )}
    </div>
  );
});
