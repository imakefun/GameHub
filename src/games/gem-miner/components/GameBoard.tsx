import { useMemo } from 'react';
import type { Grid, Position, PowerUpType } from '../types';
import { GemCell } from './GemCell';

interface GameBoardProps {
  grid: Grid;
  selectedCell: Position | null;
  hintCells: Position[];
  matchedCells: Position[];
  activePowerUp: PowerUpType | null;
  onCellClick: (pos: Position) => void;
  isProcessing: boolean;
}

export function GameBoard({
  grid,
  selectedCell,
  hintCells,
  matchedCells,
  activePowerUp,
  onCellClick,
  isProcessing,
}: GameBoardProps) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Calculate cell size based on container
  // Mobile-first: max width ~360px, accounting for padding
  const cellSize = Math.min(
    Math.floor(360 / cols),
    Math.floor(400 / rows),
    48
  );

  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;

  const hintSet = useMemo(() => {
    const s = new Set<string>();
    hintCells.forEach(p => s.add(`${p.row},${p.col}`));
    return s;
  }, [hintCells]);

  const matchedSet = useMemo(() => {
    const s = new Set<string>();
    matchedCells.forEach(p => s.add(`${p.row},${p.col}`));
    return s;
  }, [matchedCells]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Board container with mine-shaft border */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: boardWidth + 8,
          height: boardHeight + 8,
          background: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)',
          border: '2px solid #44403c',
        }}
      >
        {/* Inner grid area */}
        <div
          className="absolute"
          style={{
            left: 4,
            top: 4,
            width: boardWidth,
            height: boardHeight,
            background: 'rgba(41, 37, 36, 0.5)',
          }}
        >
          {/* Grid background lines */}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute w-full"
              style={{
                top: i * cellSize,
                height: 1,
                background: 'rgba(255,255,255,0.05)',
              }}
            />
          ))}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <div
              key={`v${i}`}
              className="absolute h-full"
              style={{
                left: i * cellSize,
                width: 1,
                background: 'rgba(255,255,255,0.05)',
              }}
            />
          ))}

          {/* Gem cells */}
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              return (
                <GemCell
                  key={cell.gemId || `empty-${key}`}
                  cell={cell}
                  isSelected={selectedCell?.row === r && selectedCell?.col === c}
                  isHinted={hintSet.has(key)}
                  isMatched={matchedSet.has(key)}
                  isPowerUpTarget={!!activePowerUp && activePowerUp !== 'earthquake' && activePowerUp !== 'lantern'}
                  cellSize={cellSize}
                  onClick={onCellClick}
                />
              );
            })
          )}
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-20" style={{ cursor: 'not-allowed' }} />
        )}

        {/* Power-up active mode overlay */}
        {activePowerUp && activePowerUp !== 'earthquake' && activePowerUp !== 'lantern' && (
          <div className="absolute inset-0 z-10 rounded-xl pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 30px rgba(251, 191, 36, 0.3)',
              border: '2px solid rgba(251, 191, 36, 0.5)',
            }}
          />
        )}
      </div>
    </div>
  );
}
