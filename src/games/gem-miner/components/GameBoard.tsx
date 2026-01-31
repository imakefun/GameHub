import { useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Grid, Position, PowerUpType } from '../types';
import { GEM_DEFS } from '../data/gems';
import { GemCell } from './GemCell';
import { ParticleCanvas, FX } from '../systems/ParticleSystem';
import type { ParticleAPI } from '../systems/ParticleSystem';
import { FloatingScoreLayer } from './FloatingScore';
import type { FloatingScoreAPI } from './FloatingScore';

interface GameBoardProps {
  grid: Grid;
  selectedCell: Position | null;
  hintCells: Position[];
  matchedCells: Position[];
  activePowerUp: PowerUpType | null;
  onCellClick: (pos: Position) => void;
  isProcessing: boolean;
  combo: number;
  lastScore: number; // score delta to display
}

export function GameBoard({
  grid,
  selectedCell,
  hintCells,
  matchedCells,
  activePowerUp,
  onCellClick,
  isProcessing,
  combo,
  lastScore,
}: GameBoardProps) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const cellSize = Math.min(
    Math.floor(360 / cols),
    Math.floor(400 / rows),
    48
  );

  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;

  const particleRef = useRef<ParticleAPI>(null);
  const floatingRef = useRef<FloatingScoreAPI | null>(null);
  const shakeControls = useAnimation();
  const prevMatchedRef = useRef<string>('');
  const prevComboRef = useRef(0);
  const boardContainerRef = useRef<HTMLDivElement>(null);

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

  // Calculate pixel position for a grid cell (relative to board inner area)
  const getCellCenter = useCallback((row: number, col: number) => {
    // Offset by the board container's padding (4px border)
    return {
      x: col * cellSize + cellSize / 2 + 4,
      y: row * cellSize + cellSize / 2 + 4,
    };
  }, [cellSize]);

  // --- Particle effects on matched cells ---
  useEffect(() => {
    const matchKey = matchedCells.map(p => `${p.row},${p.col}`).join('|');
    if (matchKey === prevMatchedRef.current || matchedCells.length === 0) return;
    prevMatchedRef.current = matchKey;

    const api = particleRef.current;
    if (!api) return;

    for (const pos of matchedCells) {
      const cell = grid[pos.row]?.[pos.col];
      if (!cell) continue;
      const { x, y } = getCellCenter(pos.row, pos.col);

      if (cell.gem) {
        const color = GEM_DEFS[cell.gem].color;
        const isSpecial = cell.special !== 'none';
        api.burstCircle(x, y, isSpecial ? FX.gemMatchBig(color) : FX.gemMatch(color));
      }
    }

    // Show floating score for the match
    if (lastScore > 0 && floatingRef.current && matchedCells.length > 0) {
      const midCell = matchedCells[Math.floor(matchedCells.length / 2)];
      const { x, y } = getCellCenter(midCell.row, midCell.col);
      const scoreText = combo > 1 ? `+${lastScore} x${combo}` : `+${lastScore}`;
      const size = combo > 2 ? 'lg' : combo > 1 ? 'md' : 'sm';
      floatingRef.current.spawn(x, y, scoreText, combo > 1 ? '#fbbf24' : '#ffffff', size);
    }
  }, [matchedCells, grid, getCellCenter, combo, lastScore]);

  // --- Screen shake on combos ---
  useEffect(() => {
    if (combo > prevComboRef.current && combo >= 2) {
      const intensity = Math.min(combo * 1.5, 8);
      shakeControls.start({
        x: [0, -intensity, intensity, -intensity * 0.5, intensity * 0.5, 0],
        y: [0, intensity * 0.5, -intensity * 0.5, intensity * 0.3, 0, 0],
        transition: { duration: 0.4, ease: 'easeOut' },
      });

      // Screen flash on big combos
      if (combo >= 3 && particleRef.current) {
        particleRef.current.screenFlash('rgba(251, 191, 36, 0.15)', 0.3);
      }
    }
    prevComboRef.current = combo;
  }, [combo, shakeControls]);

  // --- Ambient particles ---
  useEffect(() => {
    const api = particleRef.current;
    if (!api) return;

    const interval = setInterval(() => {
      const x = Math.random() * (boardWidth + 8);
      const y = Math.random() * (boardHeight + 8);
      api.emit(x, y, FX.ambient());
    }, 800);

    return () => clearInterval(interval);
  }, [boardWidth, boardHeight]);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        ref={boardContainerRef}
        animate={shakeControls}
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
            left: 4, top: 4,
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
                background: 'rgba(255,255,255,0.04)',
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
                background: 'rgba(255,255,255,0.04)',
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

        {/* Particle canvas overlay */}
        <ParticleCanvas ref={particleRef} />

        {/* Floating score popups */}
        <FloatingScoreLayer apiRef={floatingRef} />

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-40" style={{ cursor: 'not-allowed' }} />
        )}

        {/* Power-up active mode overlay */}
        {activePowerUp && activePowerUp !== 'earthquake' && activePowerUp !== 'lantern' && (
          <motion.div
            className="absolute inset-0 z-10 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              boxShadow: [
                'inset 0 0 20px rgba(251, 191, 36, 0.2)',
                'inset 0 0 35px rgba(251, 191, 36, 0.35)',
                'inset 0 0 20px rgba(251, 191, 36, 0.2)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ border: '2px solid rgba(251, 191, 36, 0.5)' }}
          />
        )}

        {/* Combo indicator overlay */}
        {combo >= 3 && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.5 }}
            style={{
              background: `radial-gradient(circle, ${combo >= 5 ? '#ef4444' : '#fbbf24'}40 0%, transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
