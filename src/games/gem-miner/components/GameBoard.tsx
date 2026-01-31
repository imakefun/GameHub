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
  onSwap: (from: Position, to: Position) => void;
  isProcessing: boolean;
  combo: number;
  lastScore: number;
}

// Drag state stored in a ref for 60fps performance (no re-renders during drag)
interface DragState {
  row: number;
  col: number;
  startX: number;
  startY: number;
  element: HTMLElement | null;
  pointerId: number;
  settled: boolean; // true once swap or tap detected
}

export function GameBoard({
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
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // Dynamic spring parameters: heavy, weighted feel with minimal bounce.
  // High stiffness compensates for heavy mass to keep movement fast.
  // Damping ratio ~0.85 (near-critical) prevents floaty overshoot.
  const cascadeBoost = Math.min(combo, 5);
  const springTransition = useMemo(() => ({
    x: {
      type: 'spring' as const,
      stiffness: 320 + cascadeBoost * 60,
      damping: 62 + cascadeBoost * 12,
      mass: 4.0 + cascadeBoost * 0.3,
    },
    y: {
      type: 'spring' as const,
      stiffness: 300 + cascadeBoost * 60,
      damping: 60 + cascadeBoost * 12,
      mass: 4.5 + cascadeBoost * 0.3,
    },
  }), [cascadeBoost]);

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

  // Calculate pixel position for a grid cell
  const getCellCenter = useCallback((row: number, col: number) => {
    return {
      x: col * cellSize + cellSize / 2 + 4,
      y: row * cellSize + cellSize / 2 + 4,
    };
  }, [cellSize]);

  // Identify cell from pointer coordinates relative to the grid area
  const cellFromPointer = useCallback((clientX: number, clientY: number): Position | null => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }, [cellSize, rows, cols]);

  // --- Pointer event handlers for swipe / drag ---

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isProcessing) return;
    const pos = cellFromPointer(e.clientX, e.clientY);
    if (!pos) return;

    const cell = grid[pos.row]?.[pos.col];
    if (!cell) return;
    // Allow tap on rock for power-ups, but don't allow drag
    if (!cell.gem && cell.modifier !== 'rock') return;

    // Find the wrapper element for this cell
    const wrapper = gridRef.current?.querySelector(`[data-cell="${pos.row},${pos.col}"]`) as HTMLElement | null;

    // Capture pointer for reliable tracking
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    dragRef.current = {
      row: pos.row,
      col: pos.col,
      startX: e.clientX,
      startY: e.clientY,
      element: wrapper,
      pointerId: e.pointerId,
      settled: false,
    };

    // Visual: slightly lift the gem
    if (wrapper && cell.gem) {
      wrapper.style.zIndex = '20';
      wrapper.style.transition = 'none';
    }
  }, [isProcessing, cellFromPointer, grid]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.settled) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Clamp drag offset to one axis (whichever is dominant) and to one cell size
    let ox = 0, oy = 0;
    if (absDx > absDy) {
      ox = Math.max(-cellSize, Math.min(cellSize, dx));
    } else {
      oy = Math.max(-cellSize, Math.min(cellSize, dy));
    }

    // Apply visual offset directly to DOM for 60fps
    if (drag.element) {
      drag.element.style.transform = `translate(${ox}px, ${oy}px) scale(1.08)`;
    }

    // Check if swipe threshold crossed
    const threshold = cellSize * 0.35;
    if (absDx > threshold || absDy > threshold) {
      let targetRow = drag.row;
      let targetCol = drag.col;
      if (absDx > absDy) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }

      // Bounds check
      if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
        drag.settled = true;
        // Reset visual (let framer-motion handle the animated transition)
        if (drag.element) {
          drag.element.style.zIndex = '';
          drag.element.style.transition = '';
          drag.element.style.transform = '';
        }
        onSwap({ row: drag.row, col: drag.col }, { row: targetRow, col: targetCol });
      }
    }
  }, [cellSize, rows, cols, onSwap]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    // Reset visual
    if (drag.element) {
      drag.element.style.zIndex = '';
      drag.element.style.transition = '';
      drag.element.style.transform = '';
    }

    dragRef.current = null;

    if (drag.settled) return; // Already handled as swipe

    // If minimal movement, treat as tap
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      onCellClick({ row: drag.row, col: drag.col });
    }
  }, [onCellClick]);

  const handlePointerCancel = useCallback(() => {
    const drag = dragRef.current;
    if (drag?.element) {
      drag.element.style.zIndex = '';
      drag.element.style.transition = '';
      drag.element.style.transform = '';
    }
    dragRef.current = null;
  }, []);

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
        {/* Inner grid area with pointer event handling */}
        <div
          ref={gridRef}
          className="absolute"
          style={{
            left: 4, top: 4,
            width: boardWidth,
            height: boardHeight,
            background: 'rgba(41, 37, 36, 0.5)',
            touchAction: 'none', // Prevent browser scroll/zoom during swipe
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {/* Grid background lines */}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute w-full pointer-events-none"
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
              className="absolute h-full pointer-events-none"
              style={{
                left: i * cellSize,
                width: 1,
                background: 'rgba(255,255,255,0.04)',
              }}
            />
          ))}

          {/* Gem cells in position-animated wrappers — flatMap so React
              reconciles keys across rows (enables vertical swap animation) */}
          {grid.flatMap((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              return (
                <motion.div
                  key={cell.gemId || `static-${key}`}
                  data-cell={key}
                  className="absolute"
                  initial={false}
                  animate={{
                    x: c * cellSize,
                    y: r * cellSize,
                  }}
                  transition={springTransition}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    left: 0,
                    top: 0,
                    willChange: 'transform',
                  }}
                >
                  <GemCell
                    cell={cell}
                    isSelected={selectedCell?.row === r && selectedCell?.col === c}
                    isHinted={hintSet.has(key)}
                    isMatched={matchedSet.has(key)}
                    isPowerUpTarget={!!activePowerUp && activePowerUp !== 'earthquake' && activePowerUp !== 'lantern'}
                    cellSize={cellSize}
                  />
                </motion.div>
              );
            })
          )}
        </div>

        {/* Particle canvas overlay */}
        <ParticleCanvas ref={particleRef} />

        {/* Floating score popups */}
        <FloatingScoreLayer apiRef={floatingRef} />

        {/* Processing overlay (blocks pointer events) */}
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
