import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Grid, Position, PowerUpType, GemType } from '../types';
import { GemScene } from '../three/GemScene';

interface GameBoard3DProps {
  grid: Grid;
  selectedCell: Position | null;
  hintCells: Position[];
  matchedCells: Position[];
  activePowerUp: PowerUpType | null;
  onCellClick: (pos: Position) => void;
  onSwap: (from: Position, to: Position) => void;
  isProcessing: boolean;
  combo: number;
  lastScore: number;
}

// Convert grid cells to Gem objects for Three.js scene
function gridToGems(grid: Grid): (import('../types').Gem | null)[][] {
  return grid.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      // Return gem info even for cells without gems (to show modifiers)
      return {
        id: cell.gemId || `empty_${rowIdx}_${colIdx}`,
        type: cell.gem as GemType,
        special: cell.special,
        modifier: cell.modifier,
        row: rowIdx,
        col: colIdx,
      };
    })
  );
}

export function GameBoard3D({
  grid,
  selectedCell,
  hintCells,
  matchedCells,
  activePowerUp,
  onCellClick,
  onSwap,
  isProcessing,
  combo,
  lastScore,
}: GameBoard3DProps) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Calculate board dimensions for consistent sizing with 2D board
  const cellSize = Math.min(
    Math.floor(360 / cols),
    Math.floor(400 / rows),
    48
  );
  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;

  const shakeControls = useAnimation();
  const prevComboRef = useRef(0);

  // Convert grid to 3D gem format
  const gems = useMemo(() => gridToGems(grid), [grid]);

  // Create matched gems set by gemId
  const matchedGems = useMemo(() => {
    const set = new Set<string>();
    for (const pos of matchedCells) {
      const cell = grid[pos.row]?.[pos.col];
      if (cell?.gemId) {
        set.add(cell.gemId);
      }
    }
    return set;
  }, [matchedCells, grid]);

  // Create hinted gems set by gemId
  const hintedGems = useMemo(() => {
    const set = new Set<string>();
    for (const pos of hintCells) {
      const cell = grid[pos.row]?.[pos.col];
      if (cell?.gemId) {
        set.add(cell.gemId);
      }
    }
    return set;
  }, [hintCells, grid]);

  // Convert selectedCell to format expected by GemScene
  const selected = useMemo(() => {
    if (!selectedCell) return null;
    return { row: selectedCell.row, col: selectedCell.col };
  }, [selectedCell]);

  // Handle gem click
  const handleGemClick = useCallback((row: number, col: number) => {
    if (isProcessing) return;
    onCellClick({ row, col });
  }, [isProcessing, onCellClick]);

  // Handle swipe
  const handleSwipe = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (isProcessing) return;
    onSwap({ row: fromRow, col: fromCol }, { row: toRow, col: toCol });
  }, [isProcessing, onSwap]);

  // Screen shake on combos
  useEffect(() => {
    if (combo > prevComboRef.current && combo >= 2) {
      const intensity = Math.min(combo * 1.5, 8);
      shakeControls.start({
        x: [0, -intensity, intensity, -intensity * 0.5, intensity * 0.5, 0],
        y: [0, intensity * 0.5, -intensity * 0.5, intensity * 0.3, 0, 0],
        transition: { duration: 0.4, ease: 'easeOut' },
      });
    }
    prevComboRef.current = combo;
  }, [combo, shakeControls]);

  // Floating score display
  const [floatingScores, setFloatingScores] = useState<Array<{
    id: number;
    x: number;
    y: number;
    score: number;
    combo: number;
  }>>([]);

  useEffect(() => {
    if (lastScore > 0 && matchedCells.length > 0) {
      const midCell = matchedCells[Math.floor(matchedCells.length / 2)];
      const x = (midCell.col + 0.5) * cellSize;
      const y = (midCell.row + 0.5) * cellSize;

      setFloatingScores(prev => [...prev, {
        id: Date.now(),
        x,
        y,
        score: lastScore,
        combo,
      }]);
    }
  }, [lastScore, matchedCells, cellSize, combo]);

  // Remove floating scores after animation
  useEffect(() => {
    if (floatingScores.length === 0) return;
    const timeout = setTimeout(() => {
      setFloatingScores(prev => prev.slice(1));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [floatingScores]);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
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
        {/* 3D Canvas */}
        <div
          className="absolute"
          style={{
            left: 4,
            top: 4,
            width: boardWidth,
            height: boardHeight,
            touchAction: 'none',
          }}
        >
          <GemScene
            grid={gems}
            selectedGem={selected}
            matchedGems={matchedGems}
            hintedGems={hintedGems}
            onGemClick={handleGemClick}
            onSwipe={handleSwipe}
          />
        </div>

        {/* Floating score popups - keep 2D for crisp text */}
        {floatingScores.map(({ id, x, y, score, combo: c }) => (
          <motion.div
            key={id}
            className="absolute pointer-events-none z-50 font-bold text-center"
            initial={{ opacity: 1, y: y + 4, x: x + 4, scale: 0.5 }}
            animate={{ opacity: 0, y: y - 40, scale: 1.2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              color: c > 1 ? '#fbbf24' : '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              fontSize: c > 2 ? 20 : c > 1 ? 16 : 14,
              transform: 'translateX(-50%)',
            }}
          >
            {c > 1 ? `+${score} x${c}` : `+${score}`}
          </motion.div>
        ))}

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
