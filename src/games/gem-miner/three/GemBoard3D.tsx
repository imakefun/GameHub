import { useRef, useCallback, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Gem, GemType, SpecialGemType, CellModifier } from '../types';
import { Gem3D } from './Gem3D';
import { CellOverlay } from './CellOverlay';

interface GemBoard3DProps {
  grid: (Gem | null)[][];
  selectedGem: { row: number; col: number } | null;
  matchedGems: Set<string>;
  hintedGems: Set<string>;
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
  onGemClick,
  onSwipe,
  cellSize = 1,
}: GemBoard3DProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Track gem positions across renders for animations
  const gemStates = useRef<Map<string, GemAnimState>>(new Map());

  // Track swipe gesture - use pixel threshold for screen coordinates
  const swipeStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const swipeThreshold = 20; // Pixels

  const handlePointerDown = useCallback((row: number, col: number, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    swipeStart.current = { row, col, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  }, []);

  const handlePointerUp = useCallback((row: number, col: number, e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const event = e.nativeEvent;

    if (!swipeStart.current) {
      onGemClick(row, col);
      return;
    }

    const dx = event.clientX - swipeStart.current.x;
    const dy = event.clientY - swipeStart.current.y;
    const startRow = swipeStart.current.row;
    const startCol = swipeStart.current.col;

    swipeStart.current = null;

    // Check if it was a swipe
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < swipeThreshold && absDy < swipeThreshold) {
      // It was a tap, not a swipe
      onGemClick(row, col);
      return;
    }

    // Determine swipe direction
    let toRow = startRow;
    let toCol = startCol;

    if (absDx > absDy) {
      // Horizontal swipe
      toCol = startCol + (dx > 0 ? 1 : -1);
    } else {
      // Vertical swipe
      toRow = startRow + (dy > 0 ? 1 : -1);
    }

    // Validate target is within bounds
    if (toRow >= 0 && toRow < rows && toCol >= 0 && toCol < cols) {
      onSwipe(startRow, startCol, toRow, toCol);
    }
  }, [onGemClick, onSwipe, rows, cols, swipeThreshold]);

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
  }, [grid, rows, cols, cellSize, selectedGem, matchedGems, hintedGems]);

  return (
    <group>
      {/* Background plane for the grid */}
      <mesh position={[0, 0, -0.5]} receiveShadow>
        <planeGeometry args={[cols * cellSize + 0.2, rows * cellSize + 0.2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[Math.max(rows, cols) * cellSize, Math.max(rows, cols), '#333344', '#222233']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.4]}
      />

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
      {gems.map(({ id, gem, row, col, initialPosition, targetPosition, isSelected, isMatched, isHinted, isNew, special }) => (
        <Gem3D
          key={id}
          type={gem.type as GemType}
          special={special}
          position={initialPosition}
          targetPosition={targetPosition}
          isSelected={isSelected}
          isMatched={isMatched}
          isHinted={isHinted}
          isNew={isNew}
          onClick={() => onGemClick(row, col)}
          onPointerDown={(e) => handlePointerDown(row, col, e)}
          onPointerUp={(e) => handlePointerUp(row, col, e)}
        />
      ))}
    </group>
  );
}
