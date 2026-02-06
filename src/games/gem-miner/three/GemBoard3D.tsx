import { useRef, useCallback, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Gem, GemType } from '../types';
import { Gem3D } from './Gem3D';

interface GemBoard3DProps {
  grid: (Gem | null)[][];
  selectedGem: { row: number; col: number } | null;
  matchedGems: Set<string>;
  onGemClick: (row: number, col: number) => void;
  onSwipe: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  cellSize?: number;
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
  onGemClick,
  onSwipe,
  cellSize = 1,
}: GemBoard3DProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Track swipe gesture
  const swipeStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const swipeThreshold = cellSize * 0.4; // 40% of cell size to trigger swipe

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

  // Flatten grid and create gem instances
  const gems = useMemo(() => {
    const result: {
      id: string;
      gem: Gem;
      row: number;
      col: number;
      position: [number, number, number];
      isSelected: boolean;
      isMatched: boolean;
    }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gem = grid[row][col];
        if (!gem) continue;

        const position = gridToWorld(row, col, rows, cols, cellSize);
        const isSelected = selectedGem?.row === row && selectedGem?.col === col;
        const isMatched = matchedGems.has(gem.id);

        result.push({
          id: gem.id,
          gem,
          row,
          col,
          position,
          isSelected,
          isMatched,
        });
      }
    }

    return result;
  }, [grid, rows, cols, cellSize, selectedGem, matchedGems]);

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

      {/* Gems */}
      {gems.map(({ id, gem, row, col, position, isSelected, isMatched }) => (
        <Gem3D
          key={id}
          type={gem.type as GemType}
          position={position}
          targetPosition={position}
          isSelected={isSelected}
          isMatched={isMatched}
          isNew={false}
          onClick={() => onGemClick(row, col)}
          onPointerDown={(e) => handlePointerDown(row, col, e)}
          onPointerUp={(e) => handlePointerUp(row, col, e)}
        />
      ))}
    </group>
  );
}
