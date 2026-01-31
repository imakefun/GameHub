import type {
  Cell, Grid, Position, Match, ClearedInfo, GemType, CellModifier,
  SpecialGemType, Level, PowerUpType,
} from '../types';
import { GEM_DEFS } from '../data/gems';

let gemIdCounter = 0;
export function nextGemId(): string {
  return `gem_${++gemIdCounter}`;
}

export function resetGemIdCounter(): void {
  gemIdCounter = 0;
}

// ============================================================
// Grid Creation
// ============================================================

function randomGem(available: GemType[]): GemType {
  return available[Math.floor(Math.random() * available.length)];
}

function wouldMatch(grid: Grid, row: number, col: number, gem: GemType): boolean {
  // Check horizontal
  if (col >= 2 &&
    grid[row][col - 1].gem === gem &&
    grid[row][col - 2].gem === gem) return true;
  // Check vertical
  if (row >= 2 &&
    grid[row - 1][col].gem === gem &&
    grid[row - 2][col].gem === gem) return true;
  return false;
}

export function createGrid(level: Level): Grid {
  resetGemIdCounter();
  const { rows, cols, cells } = level.layout;
  const grid: Grid = [];

  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      const layoutCell = cells?.[r]?.[c];
      const modifier: CellModifier = (layoutCell?.modifier) || 'none';

      if (modifier === 'bedrock') {
        row.push({
          gem: null,
          gemId: '',
          special: 'none',
          modifier: 'bedrock',
          row: r,
          col: c,
        });
      } else {
        // Pick a gem that doesn't create initial matches
        let gem = randomGem(level.availableGems);
        let attempts = 0;
        while (wouldMatch(grid.concat([row]), r, c, gem) && attempts < 50) {
          gem = randomGem(level.availableGems);
          attempts++;
        }
        row.push({
          gem,
          gemId: nextGemId(),
          special: 'none',
          modifier,
          row: r,
          col: c,
        });
      }
    }
    grid.push(row);
  }
  return grid;
}

// ============================================================
// Grid Utilities
// ============================================================

export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

function inBounds(grid: Grid, row: number, col: number): boolean {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

function isSwappable(cell: Cell): boolean {
  return cell.modifier !== 'bedrock' && cell.modifier !== 'locked' && cell.gem !== null;
}

// ============================================================
// Match Finding
// ============================================================

export function findMatches(grid: Grid): Match[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const matches: Match[] = [];
  const visited = new Set<string>();

  // Find horizontal runs
  for (let r = 0; r < rows; r++) {
    let start = 0;
    for (let c = 1; c <= cols; c++) {
      const sameGem = c < cols &&
        grid[r][c].gem !== null &&
        grid[r][c].gem === grid[r][start].gem &&
        grid[r][c].modifier !== 'bedrock' &&
        grid[r][start].modifier !== 'bedrock';

      if (!sameGem) {
        const len = c - start;
        if (len >= 3 && grid[r][start].gem !== null) {
          const cells: Position[] = [];
          for (let i = start; i < c; i++) {
            cells.push({ row: r, col: i });
          }
          const type = len >= 5 ? 'five' : len === 4 ? 'four' : 'normal';
          matches.push({ cells, type, direction: 'horizontal' });
          cells.forEach(p => visited.add(`${p.row},${p.col}`));
        }
        start = c;
      }
    }
  }

  // Find vertical runs
  for (let c = 0; c < cols; c++) {
    let start = 0;
    for (let r = 1; r <= rows; r++) {
      const sameGem = r < rows &&
        grid[r][c].gem !== null &&
        grid[r][c].gem === grid[start][c].gem &&
        grid[r][c].modifier !== 'bedrock' &&
        grid[start][c].modifier !== 'bedrock';

      if (!sameGem) {
        const len = r - start;
        if (len >= 3 && grid[start][c].gem !== null) {
          const cells: Position[] = [];
          for (let i = start; i < r; i++) {
            cells.push({ row: i, col: c });
          }
          const type = len >= 5 ? 'five' : len === 4 ? 'four' : 'normal';
          matches.push({ cells, type, direction: 'vertical' });
          cells.forEach(p => visited.add(`${p.row},${p.col}`));
        }
        start = r;
      }
    }
  }

  // Detect L/T shapes: find cells that belong to both horizontal and vertical matches
  const cellMatchCount = new Map<string, { h: Match | null; v: Match | null }>();
  for (const match of matches) {
    for (const pos of match.cells) {
      const key = `${pos.row},${pos.col}`;
      if (!cellMatchCount.has(key)) {
        cellMatchCount.set(key, { h: null, v: null });
      }
      const entry = cellMatchCount.get(key)!;
      if (match.direction === 'horizontal') entry.h = match;
      if (match.direction === 'vertical') entry.v = match;
    }
  }

  // Mark L/T shapes
  for (const [, entry] of cellMatchCount) {
    if (entry.h && entry.v) {
      // Merge into an L/T shape match
      if (entry.h.type === 'normal') entry.h.type = 'l_shape';
      if (entry.v.type === 'normal') entry.v.type = 'l_shape';
    }
  }

  return matches;
}

// ============================================================
// Swap Validation
// ============================================================

export function isValidSwap(grid: Grid, from: Position, to: Position): boolean {
  if (!isAdjacent(from, to)) return false;
  if (!inBounds(grid, from.row, from.col) || !inBounds(grid, to.row, to.col)) return false;

  const cellA = grid[from.row][from.col];
  const cellB = grid[to.row][to.col];

  if (!isSwappable(cellA) || !isSwappable(cellB)) return false;

  // Prismatic gem can swap with anything
  if (cellA.special === 'prismatic' || cellB.special === 'prismatic') return true;

  // Try the swap and check for matches
  const testGrid = cloneGrid(grid);
  const tempGem = testGrid[from.row][from.col].gem;
  const tempSpecial = testGrid[from.row][from.col].special;
  const tempId = testGrid[from.row][from.col].gemId;

  testGrid[from.row][from.col].gem = testGrid[to.row][to.col].gem;
  testGrid[from.row][from.col].special = testGrid[to.row][to.col].special;
  testGrid[from.row][from.col].gemId = testGrid[to.row][to.col].gemId;

  testGrid[to.row][to.col].gem = tempGem;
  testGrid[to.row][to.col].special = tempSpecial;
  testGrid[to.row][to.col].gemId = tempId;

  return findMatches(testGrid).length > 0;
}

// ============================================================
// Execute Swap
// ============================================================

export function executeSwap(grid: Grid, from: Position, to: Position): Grid {
  const newGrid = cloneGrid(grid);
  const a = newGrid[from.row][from.col];
  const b = newGrid[to.row][to.col];

  const tempGem = a.gem;
  const tempSpecial = a.special;
  const tempId = a.gemId;

  a.gem = b.gem;
  a.special = b.special;
  a.gemId = b.gemId;

  b.gem = tempGem;
  b.special = tempSpecial;
  b.gemId = tempId;

  return newGrid;
}

// ============================================================
// Clear Matches
// ============================================================

export function emptyClearedInfo(): ClearedInfo {
  return {
    gemsCleared: {
      ruby: 0, sapphire: 0, emerald: 0, topaz: 0,
      amethyst: 0, diamond: 0, obsidian: 0,
    },
    totalCleared: 0,
    rocksDestroyed: 0,
    iceDestroyed: 0,
    dirtCleared: 0,
    locksOpened: 0,
    specialsTriggered: 0,
    score: 0,
  };
}

export function mergeClearedInfo(a: ClearedInfo, b: ClearedInfo): ClearedInfo {
  const result = emptyClearedInfo();
  for (const key of Object.keys(a.gemsCleared) as GemType[]) {
    result.gemsCleared[key] = a.gemsCleared[key] + b.gemsCleared[key];
  }
  result.totalCleared = a.totalCleared + b.totalCleared;
  result.rocksDestroyed = a.rocksDestroyed + b.rocksDestroyed;
  result.iceDestroyed = a.iceDestroyed + b.iceDestroyed;
  result.dirtCleared = a.dirtCleared + b.dirtCleared;
  result.locksOpened = a.locksOpened + b.locksOpened;
  result.specialsTriggered = a.specialsTriggered + b.specialsTriggered;
  result.score = a.score + b.score;
  return result;
}

function clearCell(grid: Grid, row: number, col: number, cleared: ClearedInfo): void {
  if (!inBounds(grid, row, col)) return;
  const cell = grid[row][col];
  if (cell.modifier === 'bedrock') return;

  if (cell.gem) {
    cleared.gemsCleared[cell.gem]++;
    cleared.totalCleared++;
    cleared.score += GEM_DEFS[cell.gem].points;
  }

  cell.gem = null;
  cell.gemId = '';
  cell.special = 'none';

  if (cell.modifier === 'ice') {
    cell.modifier = 'none';
    cleared.iceDestroyed++;
    cleared.score += 50;
  } else if (cell.modifier === 'dirt') {
    cell.modifier = 'none';
    cleared.dirtCleared++;
    cleared.score += 30;
  }
}

function affectAdjacentModifiers(grid: Grid, row: number, col: number, cleared: ClearedInfo): void {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (!inBounds(grid, nr, nc)) continue;
    const neighbor = grid[nr][nc];

    if (neighbor.modifier === 'rock') {
      neighbor.modifier = 'none';
      cleared.rocksDestroyed++;
      cleared.score += 100;
    } else if (neighbor.modifier === 'dirt') {
      neighbor.modifier = 'none';
      cleared.dirtCleared++;
      cleared.score += 30;
    } else if (neighbor.modifier === 'ice') {
      neighbor.modifier = 'none';
      cleared.iceDestroyed++;
      cleared.score += 50;
    } else if (neighbor.modifier === 'locked') {
      neighbor.modifier = 'none';
      cleared.locksOpened++;
      cleared.score += 40;
    }
  }
}

function triggerSpecialGem(
  grid: Grid, row: number, col: number, special: SpecialGemType, cleared: ClearedInfo
): void {
  cleared.specialsTriggered++;
  cleared.score += 200;

  if (special === 'striped_h') {
    // Clear entire row
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[row][c].modifier !== 'bedrock' && grid[row][c].gem !== null) {
        clearCell(grid, row, c, cleared);
      }
    }
  } else if (special === 'striped_v') {
    // Clear entire column
    for (let r = 0; r < grid.length; r++) {
      if (grid[r][col].modifier !== 'bedrock' && grid[r][col].gem !== null) {
        clearCell(grid, r, col, cleared);
      }
    }
  } else if (special === 'bomb') {
    // Clear 3x3 area
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (inBounds(grid, nr, nc) && grid[nr][nc].modifier !== 'bedrock') {
          clearCell(grid, nr, nc, cleared);
        }
      }
    }
  } else if (special === 'prismatic') {
    // Clear all gems of the swapped type (or random if no swap context)
    // The gem type to clear is set by the swap partner
    const targetGem = grid[row][col].gem;
    if (targetGem) {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          if (grid[r][c].gem === targetGem && grid[r][c].modifier !== 'bedrock') {
            clearCell(grid, r, c, cleared);
          }
        }
      }
    }
  }
}

export function clearMatches(grid: Grid, matches: Match[]): { grid: Grid; cleared: ClearedInfo; specialsCreated: Position[] } {
  const newGrid = cloneGrid(grid);
  const cleared = emptyClearedInfo();
  const specialsCreated: Position[] = [];

  // Collect all cells to clear and determine special gem creation
  const cellsToClear = new Set<string>();
  const specialCreationPoints: { pos: Position; special: SpecialGemType; gem: GemType }[] = [];

  for (const match of matches) {
    // Determine if this match creates a special gem
    let specialType: SpecialGemType = 'none';
    if (match.type === 'five') {
      specialType = 'prismatic';
    } else if (match.type === 'four') {
      specialType = match.direction === 'horizontal' ? 'striped_v' : 'striped_h';
    } else if (match.type === 'l_shape' || match.type === 't_shape') {
      specialType = 'bomb';
    }

    // Mark cells for clearing
    for (const pos of match.cells) {
      cellsToClear.add(`${pos.row},${pos.col}`);
    }

    // Pick creation point for special gem (middle of the match)
    if (specialType !== 'none') {
      const midIdx = Math.floor(match.cells.length / 2);
      const midPos = match.cells[midIdx];
      const gem = newGrid[midPos.row][midPos.col].gem;
      if (gem) {
        specialCreationPoints.push({ pos: midPos, special: specialType, gem });
      }
    }
  }

  // First trigger any existing special gems in the match
  for (const key of cellsToClear) {
    const [r, c] = key.split(',').map(Number);
    const cell = newGrid[r][c];
    if (cell.special !== 'none') {
      triggerSpecialGem(newGrid, r, c, cell.special, cleared);
    }
  }

  // Clear matched cells
  for (const key of cellsToClear) {
    const [r, c] = key.split(',').map(Number);
    if (newGrid[r][c].gem !== null) {
      affectAdjacentModifiers(newGrid, r, c, cleared);
      clearCell(newGrid, r, c, cleared);
    }
  }

  // Create special gems at creation points
  for (const { pos, special, gem } of specialCreationPoints) {
    const cell = newGrid[pos.row][pos.col];
    cell.gem = gem;
    cell.gemId = nextGemId();
    cell.special = special;
    specialsCreated.push(pos);
    // Don't count this gem as cleared since we're putting it back
    cleared.gemsCleared[gem]--;
    cleared.totalCleared--;
  }

  return { grid: newGrid, cleared, specialsCreated };
}

// ============================================================
// Gravity & Refill
// ============================================================

export function applyGravity(grid: Grid): Grid {
  const newGrid = cloneGrid(grid);
  const cols = newGrid[0].length;
  const rows = newGrid.length;

  for (let c = 0; c < cols; c++) {
    // Process column bottom-up
    let writeRow = rows - 1;

    // Find the lowest empty space, move gems down
    for (let r = rows - 1; r >= 0; r--) {
      if (newGrid[r][c].modifier === 'bedrock') {
        // Bedrock is immovable - process the segment above it
        // Fill gaps above bedrock separately
        writeRow = r - 1;
        continue;
      }
    }

    // Simplified gravity: for each column, compact non-null gems downward
    // respecting bedrock as barriers
    const segments: { start: number; end: number }[] = [];
    let segStart = 0;
    for (let r = 0; r <= rows; r++) {
      if (r === rows || newGrid[r][c].modifier === 'bedrock') {
        if (r > segStart) {
          segments.push({ start: segStart, end: r - 1 });
        }
        segStart = r + 1;
      }
    }

    for (const seg of segments) {
      // Collect gems in this segment
      const gems: { gem: GemType; gemId: string; special: SpecialGemType }[] = [];
      for (let r = seg.start; r <= seg.end; r++) {
        if (newGrid[r][c].gem !== null) {
          gems.push({
            gem: newGrid[r][c].gem!,
            gemId: newGrid[r][c].gemId,
            special: newGrid[r][c].special,
          });
        }
      }

      // Place gems at the bottom of the segment
      writeRow = seg.end;
      for (let i = gems.length - 1; i >= 0; i--) {
        newGrid[writeRow][c].gem = gems[i].gem;
        newGrid[writeRow][c].gemId = gems[i].gemId;
        newGrid[writeRow][c].special = gems[i].special;
        writeRow--;
      }

      // Fill the rest with empty
      for (let r = seg.start; r <= writeRow; r++) {
        newGrid[r][c].gem = null;
        newGrid[r][c].gemId = '';
        newGrid[r][c].special = 'none';
      }
    }
  }

  // Update positions
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newGrid[r][c].row = r;
      newGrid[r][c].col = c;
    }
  }

  return newGrid;
}

export function refillGrid(grid: Grid, availableGems: GemType[]): Grid {
  const newGrid = cloneGrid(grid);
  const rows = newGrid.length;
  const cols = newGrid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = newGrid[r][c];
      if (cell.gem === null && cell.modifier !== 'bedrock') {
        cell.gem = randomGem(availableGems);
        cell.gemId = nextGemId();
        cell.special = 'none';
      }
    }
  }

  return newGrid;
}

// ============================================================
// Board Processing (Full cascade)
// ============================================================

export function processBoard(
  grid: Grid,
  availableGems: GemType[],
  maxCascades = 20
): { grid: Grid; totalCleared: ClearedInfo; cascadeCount: number; allMatchedCells: Position[][] } {
  let currentGrid = cloneGrid(grid);
  let totalCleared = emptyClearedInfo();
  let cascadeCount = 0;
  const allMatchedCells: Position[][] = [];

  for (let i = 0; i < maxCascades; i++) {
    const matches = findMatches(currentGrid);
    if (matches.length === 0) break;

    // Collect all matched cell positions for this cascade
    const matchedPositions: Position[] = [];
    for (const m of matches) {
      matchedPositions.push(...m.cells);
    }
    allMatchedCells.push(matchedPositions);

    const { grid: clearedGrid, cleared } = clearMatches(currentGrid, matches);

    // Apply cascade multiplier to score
    const multiplier = 1 + cascadeCount * 0.5;
    cleared.score = Math.round(cleared.score * multiplier);

    totalCleared = mergeClearedInfo(totalCleared, cleared);
    currentGrid = applyGravity(clearedGrid);
    currentGrid = refillGrid(currentGrid, availableGems);
    cascadeCount++;
  }

  return { grid: currentGrid, totalCleared, cascadeCount, allMatchedCells };
}

// ============================================================
// Valid Moves Check
// ============================================================

export function hasValidMoves(grid: Grid): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Try swap right
      if (c + 1 < cols && isValidSwap(grid, { row: r, col: c }, { row: r, col: c + 1 })) {
        return true;
      }
      // Try swap down
      if (r + 1 < rows && isValidSwap(grid, { row: r, col: c }, { row: r + 1, col: c })) {
        return true;
      }
    }
  }
  return false;
}

export function findBestMove(grid: Grid): { from: Position; to: Position } | null {
  const rows = grid.length;
  const cols = grid[0].length;
  let bestMove: { from: Position; to: Position } | null = null;
  let bestScore = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const swaps: Position[] = [];
      if (c + 1 < cols) swaps.push({ row: r, col: c + 1 });
      if (r + 1 < rows) swaps.push({ row: r + 1, col: c });

      for (const to of swaps) {
        const from = { row: r, col: c };
        if (isValidSwap(grid, from, to)) {
          const swapped = executeSwap(cloneGrid(grid), from, to);
          const matches = findMatches(swapped);
          let score = 0;
          for (const m of matches) {
            score += m.cells.length * (m.type === 'five' ? 5 : m.type === 'four' ? 3 : 1);
          }
          if (score > bestScore) {
            bestScore = score;
            bestMove = { from, to };
          }
        }
      }
    }
  }

  return bestMove;
}

// ============================================================
// Shuffle Board
// ============================================================

export function shuffleBoard(grid: Grid, availableGems: GemType[]): Grid {
  const newGrid = cloneGrid(grid);
  const rows = newGrid.length;
  const cols = newGrid[0].length;

  // Collect movable gems
  const gems: { gem: GemType; special: SpecialGemType }[] = [];
  const positions: Position[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = newGrid[r][c];
      if (cell.gem !== null && cell.modifier !== 'bedrock' && cell.modifier !== 'locked') {
        gems.push({ gem: cell.gem, special: cell.special });
        positions.push({ row: r, col: c });
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = gems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gems[i], gems[j]] = [gems[j], gems[i]];
  }

  // Place back
  for (let i = 0; i < positions.length; i++) {
    const { row, col } = positions[i];
    newGrid[row][col].gem = gems[i].gem;
    newGrid[row][col].special = gems[i].special;
    newGrid[row][col].gemId = nextGemId();
  }

  // If still no valid moves, regenerate
  if (!hasValidMoves(newGrid)) {
    for (const pos of positions) {
      newGrid[pos.row][pos.col].gem = randomGem(availableGems);
      newGrid[pos.row][pos.col].gemId = nextGemId();
      newGrid[pos.row][pos.col].special = 'none';
    }
  }

  return newGrid;
}

// ============================================================
// Power-Up Application
// ============================================================

export function applyPowerUp(
  grid: Grid,
  powerUp: PowerUpType,
  target: Position,
  availableGems: GemType[]
): { grid: Grid; cleared: ClearedInfo } {
  let newGrid = cloneGrid(grid);
  const cleared = emptyClearedInfo();

  switch (powerUp) {
    case 'dynamite': {
      // Clear 3x3 area
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = target.row + dr;
          const nc = target.col + dc;
          if (inBounds(newGrid, nr, nc)) {
            const cell = newGrid[nr][nc];
            if (cell.modifier === 'bedrock') continue;
            if (cell.modifier === 'rock') {
              cell.modifier = 'none';
              cleared.rocksDestroyed++;
              cleared.score += 100;
            }
            if (cell.modifier === 'ice') {
              cell.modifier = 'none';
              cleared.iceDestroyed++;
              cleared.score += 50;
            }
            if (cell.modifier === 'dirt') {
              cell.modifier = 'none';
              cleared.dirtCleared++;
              cleared.score += 30;
            }
            if (cell.modifier === 'locked') {
              cell.modifier = 'none';
              cleared.locksOpened++;
              cleared.score += 40;
            }
            if (cell.special !== 'none') {
              triggerSpecialGem(newGrid, nr, nc, cell.special, cleared);
            }
            clearCell(newGrid, nr, nc, cleared);
          }
        }
      }
      break;
    }
    case 'pickaxe': {
      // Destroy single cell
      const cell = newGrid[target.row][target.col];
      if (cell.modifier !== 'bedrock') {
        if (cell.modifier === 'rock') {
          cell.modifier = 'none';
          cleared.rocksDestroyed++;
          cleared.score += 100;
        }
        if (cell.modifier === 'ice') {
          cell.modifier = 'none';
          cleared.iceDestroyed++;
          cleared.score += 50;
        }
        if (cell.modifier === 'dirt') {
          cell.modifier = 'none';
          cleared.dirtCleared++;
          cleared.score += 30;
        }
        if (cell.modifier === 'locked') {
          cell.modifier = 'none';
          cleared.locksOpened++;
          cleared.score += 40;
        }
        if (cell.special !== 'none') {
          triggerSpecialGem(newGrid, target.row, target.col, cell.special, cleared);
        }
        clearCell(newGrid, target.row, target.col, cleared);
      }
      break;
    }
    case 'drill': {
      // Clear entire column
      for (let r = 0; r < newGrid.length; r++) {
        const cell = newGrid[r][target.col];
        if (cell.modifier === 'bedrock') continue;
        if (cell.modifier === 'rock') {
          cell.modifier = 'none';
          cleared.rocksDestroyed++;
          cleared.score += 100;
        }
        if (cell.modifier === 'ice') {
          cell.modifier = 'none';
          cleared.iceDestroyed++;
          cleared.score += 50;
        }
        if (cell.modifier === 'dirt') {
          cell.modifier = 'none';
          cleared.dirtCleared++;
          cleared.score += 30;
        }
        if (cell.modifier === 'locked') {
          cell.modifier = 'none';
          cleared.locksOpened++;
          cleared.score += 40;
        }
        if (cell.special !== 'none') {
          triggerSpecialGem(newGrid, r, target.col, cell.special, cleared);
        }
        clearCell(newGrid, r, target.col, cleared);
      }
      break;
    }
    case 'earthquake': {
      newGrid = shuffleBoard(newGrid, availableGems);
      cleared.score += 50;
      break;
    }
    case 'lantern': {
      // Handled in UI, no grid changes
      break;
    }
  }

  // Apply gravity and refill after power-up
  if (powerUp !== 'earthquake' && powerUp !== 'lantern') {
    newGrid = applyGravity(newGrid);
    newGrid = refillGrid(newGrid, availableGems);
  }

  return { grid: newGrid, cleared };
}

// ============================================================
// Win/Lose Checking
// ============================================================

export function checkObjectives(
  objectives: { type: string; target: number; gemType?: GemType; current: number }[]
): boolean {
  return objectives.every(obj => obj.current >= obj.target);
}
