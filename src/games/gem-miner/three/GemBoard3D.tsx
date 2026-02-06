import { useRef, useCallback, useMemo, useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Gem, GemType, SpecialGemType, CellModifier } from '../types';
import { Gem3D } from './Gem3D';
import { CellOverlay } from './CellOverlay';

interface GemBoard3DProps {
  grid: (Gem | null)[][];
  selectedGem: { row: number; col: number } | null;
  matchedGems: Set<string>;
  hintedGems: Set<string>;
  failedGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
  onSwipe: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  cellSize?: number;
}

// Track gem positions for animation
interface GemAnimState {
  lastRow: number;
  lastCol: number;
  isNew: boolean;
}

// Convert grid position to 3D world position
function gridToWorld(row: number, col: number, rows: number, cols: number, cellSize: number): [number, number, number] {
  const halfWidth = (cols * cellSize) / 2;
  const halfHeight = (rows * cellSize) / 2;
  const x = col * cellSize - halfWidth + cellSize / 2;
  const y = -(row * cellSize - halfHeight + cellSize / 2); // Flip Y so row 0 is at top
  return [x, y, 0];
}

export function GemBoard3D({
  grid,
  selectedGem,
  matchedGems,
  hintedGems,
  failedGems,
  onGemClick,
  onSwipe,
  cellSize = 1,
}: GemBoard3DProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Track gem positions across renders for animations
  const gemStates = useRef<Map<string, GemAnimState>>(new Map());

  // Swipe gesture state - track globally for reliability
  const gestureRef = useRef<{
    active: boolean;
    startRow: number;
    startCol: number;
    startX: number;
    startY: number;
    handled: boolean;
  } | null>(null);

  const swipeThreshold = 25; // Pixels - trigger swap when exceeded

  // Handle pointer down on a gem - start tracking gesture
  const handlePointerDown = useCallback((row: number, col: number, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    gestureRef.current = {
      active: true,
      startRow: row,
      startCol: col,
      startX: e.nativeEvent.clientX,
      startY: e.nativeEvent.clientY,
      handled: false,
    };
  }, []);

  // Global pointer move handler - detect swipe direction during movement
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || !gesture.active || gesture.handled) return;

      const dx = e.clientX - gesture.startX;
      const dy = e.clientY - gesture.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Check if swipe threshold exceeded
      if (absDx >= swipeThreshold || absDy >= swipeThreshold) {
        // Determine direction and execute swap immediately
        let toRow = gesture.startRow;
        let toCol = gesture.startCol;

        if (absDx > absDy) {
          toCol = gesture.startCol + (dx > 0 ? 1 : -1);
        } else {
          toRow = gesture.startRow + (dy > 0 ? 1 : -1);
        }

        // Mark as handled so we don't trigger again
        gesture.handled = true;

        // Validate and execute swap
        if (toRow >= 0 && toRow < rows && toCol >= 0 && toCol < cols) {
          onSwipe(gesture.startRow, gesture.startCol, toRow, toCol);
        }
      }
    };

    const handlePointerUp = () => {
      const gesture = gestureRef.current;
      if (!gesture) return;

      // If gesture wasn't handled as a swipe, it was a tap
      if (gesture.active && !gesture.handled) {
        onGemClick(gesture.startRow, gesture.startCol);
      }

      gestureRef.current = null;
    };

    const handlePointerCancel = () => {
      gestureRef.current = null;
    };

    // Use passive: false for touch events to allow preventDefault if needed
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [rows, cols, onSwipe, onGemClick, swipeThreshold]);

  // Flatten grid and create gem instances with animation tracking
  const { gems, cellOverlays } = useMemo(() => {
    const gemResult: {
      id: string;
      gem: Gem;
      row: number;
      col: number;
      initialPosition: [number, number, number];
      targetPosition: [number, number, number];
      isSelected: boolean;
      isMatched: boolean;
      isHinted: boolean;
      isFailed: boolean;
      isNew: boolean;
      special: SpecialGemType;
    }[] = [];

    const overlayResult: {
      row: number;
      col: number;
      position: [number, number, number];
      modifier: CellModifier;
    }[] = [];

    const currentIds = new Set<string>();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gem = grid[row][col];
        if (!gem) continue;

        const targetPosition = gridToWorld(row, col, rows, cols, cellSize);

        // Add cell modifier overlay if present
        if (gem.modifier && gem.modifier !== 'none') {
          overlayResult.push({
            row,
            col,
            position: targetPosition,
            modifier: gem.modifier,
          });
        }

        // Skip gem rendering if no gem type (e.g., rock-only cell)
        if (!gem.type) continue;

        currentIds.add(gem.id);
        const isSelected = selectedGem?.row === row && selectedGem?.col === col;
        const isMatched = matchedGems.has(gem.id);
        const isHinted = hintedGems.has(gem.id);
        const isFailed = failedGems.has(gem.id);

        // Check if this is a new gem or has moved
        const prevState = gemStates.current.get(gem.id);
        let initialPosition: [number, number, number];
        let isNew = false;

        if (!prevState) {
          // New gem - start from above the board for drop animation
          isNew = true;
          initialPosition = gridToWorld(-2, col, rows, cols, cellSize);
        } else if (prevState.lastRow !== row || prevState.lastCol !== col) {
          // Gem has moved - start from previous position
          initialPosition = gridToWorld(prevState.lastRow, prevState.lastCol, rows, cols, cellSize);
        } else {
          // Gem hasn't moved - start at current position
          initialPosition = targetPosition;
        }

        // Update tracking state
        gemStates.current.set(gem.id, { lastRow: row, lastCol: col, isNew: false });

        gemResult.push({
          id: gem.id,
          gem,
          row,
          col,
          initialPosition,
          targetPosition,
          isSelected,
          isMatched,
          isHinted,
          isFailed,
          isNew,
          special: gem.special || 'none',
        });
      }
    }

    // Clean up old gem states
    for (const id of gemStates.current.keys()) {
      if (!currentIds.has(id)) {
        gemStates.current.delete(id);
      }
    }

    return { gems: gemResult, cellOverlays: overlayResult };
  }, [grid, rows, cols, cellSize, selectedGem, matchedGems, hintedGems, failedGems]);

  return (
    <group>
      {/* Simple background plane */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[cols * cellSize + 0.3, rows * cellSize + 0.3]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Cell modifier overlays (ice, dirt, rock) */}
      {cellOverlays.map(({ row, col, position, modifier }) => (
        <CellOverlay
          key={`overlay_${row}_${col}`}
          position={position}
          modifier={modifier}
          cellSize={cellSize}
        />
      ))}

      {/* Gems */}
      {gems.map(({ id, gem, row, col, initialPosition, targetPosition, isSelected, isMatched, isHinted, isFailed, isNew, special }) => (
        <Gem3D
          key={id}
          type={gem.type as GemType}
          special={special}
          position={initialPosition}
          targetPosition={targetPosition}
          isSelected={isSelected}
          isMatched={isMatched}
          isHinted={isHinted}
          isFailed={isFailed}
          isNew={isNew}
          onPointerDown={(e) => handlePointerDown(row, col, e)}
        />
      ))}
    </group>
  );
}
