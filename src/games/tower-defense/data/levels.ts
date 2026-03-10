import type { LevelDef, GridCell, PathPoint, Wave, WorldTheme } from '../types';

// Helper to create a grid
function makeGrid(rows: number, cols: number, pathCoords: [number, number][], startCoord: [number, number], endCoord: [number, number]): GridCell[][] {
  const pathSet = new Set(pathCoords.map(([r, c]) => `${r},${c}`));
  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      let type: GridCell['type'] = 'buildable';
      if (r === startCoord[0] && c === startCoord[1]) type = 'start';
      else if (r === endCoord[0] && c === endCoord[1]) type = 'end';
      else if (pathSet.has(key)) type = 'path';
      row.push({ row: r, col: c, type });
    }
    grid.push(row);
  }
  return grid;
}

function makePath(coords: [number, number][]): PathPoint[] {
  return coords.map(([row, col]) => ({ row, col }));
}

// Wave helpers
function w(enemyId: string, count: number, interval = 800, delay = 0, hpMult = 1, speedMult = 1): Wave['groups'][0] {
  return { enemyId: enemyId as any, count, interval, delay, hpMultiplier: hpMult, speedMultiplier: speedMult };
}

function wave(...groups: Wave['groups']): Wave {
  return { groups };
}

// ============================================================
// WORLD 1 – Whispering Woods (8 levels)
// ============================================================

const w1Path1: [number, number][] = [
  [0, 3], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [3, 6],
  [4, 6], [5, 6], [6, 6], [6, 5], [6, 4], [6, 3], [7, 3], [8, 3],
];

const w1Path2: [number, number][] = [
  [0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
  [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2],
  [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6],
];

const w1Path3: [number, number][] = [
  [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 5], [3, 5], [4, 5], [5, 5], [5, 6], [5, 7], [6, 7], [7, 7],
];

const w1Path4: [number, number][] = [
  [0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1],
  [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6],
  [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2], [8, 2],
];

const w1Path5: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [4, 2],
  [4, 3], [4, 4], [4, 5], [4, 6], [3, 6], [2, 6], [2, 7],
  [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [6, 4],
  [7, 4], [8, 4],
];

const w1Path6: [number, number][] = [
  [0, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2],
  [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1],
  [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [8, 7],
];

const w1Path7: [number, number][] = [
  [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [1, 4], [1, 5], [1, 6],
  [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [4, 3], [5, 3],
  [6, 3], [6, 4], [6, 5], [6, 6], [7, 6], [8, 6],
];

const w1Path8: [number, number][] = [
  [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3],
  [2, 3], [3, 3], [3, 4], [3, 5], [2, 5], [1, 5], [1, 6], [1, 7],
  [2, 7], [3, 7], [4, 7], [5, 7], [5, 6], [5, 5], [5, 4],
  [6, 4], [7, 4], [7, 3], [7, 2], [7, 1], [8, 1],
];

function buildLevel(
  id: string, name: string, world: number, worldIndex: number,
  rows: number, cols: number,
  pathCoords: [number, number][],
  waves: Wave[], startGold: number, startLives: number,
  parTime: number, description: string, theme: WorldTheme,
): LevelDef {
  const startCoord = pathCoords[0];
  const endCoord = pathCoords[pathCoords.length - 1];
  return {
    id, name, world, worldIndex, rows, cols,
    grid: makeGrid(rows, cols, pathCoords, startCoord, endCoord),
    path: makePath(pathCoords),
    waves, startGold, startLives, parTime, description, theme,
  };
}

export const LEVELS: LevelDef[] = [
  // --- World 1: Whispering Woods ---
  buildLevel('w1-1', 'First Steps', 1, 0, 9, 8, w1Path1,
    [
      wave([w('slime', 6, 1200)]),
      wave([w('slime', 10, 1000)]),
      wave([w('slime', 8, 800), w('goblin', 3, 1000, 2000)]),
    ],
    100, 20, 90, 'Learn the basics. Place towers to stop the slimes!', 'forest'),

  buildLevel('w1-2', 'Goblin Scouts', 1, 1, 9, 8, w1Path2,
    [
      wave([w('slime', 5, 1000), w('goblin', 3, 900, 1500)]),
      wave([w('goblin', 8, 800)]),
      wave([w('goblin', 6, 700), w('slime', 8, 600, 1000)]),
      wave([w('goblin', 12, 600)]),
    ],
    120, 20, 100, 'Goblins are faster. You\'ll need quicker towers!', 'forest'),

  buildLevel('w1-3', 'The Winding Path', 1, 2, 8, 8, w1Path3,
    [
      wave([w('slime', 8, 900)]),
      wave([w('goblin', 6, 800), w('slime', 6, 700, 1500)]),
      wave([w('skeleton', 4, 1200)]),
      wave([w('goblin', 10, 600), w('skeleton', 4, 1000, 2000)]),
    ],
    130, 18, 110, 'A longer path with more build space.', 'forest'),

  buildLevel('w1-4', 'Bony Ambush', 1, 3, 9, 8, w1Path4,
    [
      wave([w('skeleton', 5, 1200)]),
      wave([w('slime', 10, 600), w('skeleton', 5, 1000, 1000)]),
      wave([w('goblin', 8, 700), w('skeleton', 6, 900, 2000)]),
      wave([w('skeleton', 10, 800), w('goblin', 6, 600, 3000)]),
      wave([w('skeleton', 8, 600), w('slime', 15, 400, 1000)]),
    ],
    150, 18, 120, 'Skeletons have armor. Use mages for splash damage!', 'forest'),

  buildLevel('w1-5', 'Night Wings', 1, 4, 9, 8, w1Path5,
    [
      wave([w('bat', 8, 700)]),
      wave([w('goblin', 6, 800), w('bat', 6, 600, 1500)]),
      wave([w('bat', 12, 500)]),
      wave([w('skeleton', 5, 1000), w('bat', 8, 600, 2000)]),
      wave([w('bat', 15, 400), w('goblin', 8, 600, 1000)]),
    ],
    160, 15, 120, 'Bats are flying enemies. Archers and mages can target them!', 'forest'),

  buildLevel('w1-6', 'Forest Gauntlet', 1, 5, 9, 8, w1Path6,
    [
      wave([w('slime', 10, 600)]),
      wave([w('goblin', 8, 700), w('skeleton', 4, 1000, 1500)]),
      wave([w('bat', 8, 600), w('goblin', 6, 700, 2000)]),
      wave([w('skeleton', 8, 800), w('bat', 6, 600, 1500), w('slime', 10, 400, 3000)]),
      wave([w('goblin', 12, 500), w('skeleton', 8, 700, 2000), w('bat', 8, 500, 4000)]),
      wave([w('slime', 20, 300), w('goblin', 10, 500, 1000), w('skeleton', 6, 800, 3000)]),
    ],
    180, 15, 150, 'A long and winding path. Make every tower count!', 'forest'),

  buildLevel('w1-7', 'Orc Trouble', 1, 6, 9, 8, w1Path7,
    [
      wave([w('goblin', 8, 700), w('slime', 6, 600, 1500)]),
      wave([w('orc', 3, 2000)]),
      wave([w('skeleton', 8, 800), w('orc', 2, 2500, 3000)]),
      wave([w('bat', 10, 500), w('orc', 3, 2000, 2000)]),
      wave([w('orc', 5, 1500), w('goblin', 10, 500, 1000)]),
      wave([w('orc', 4, 1500), w('skeleton', 8, 700, 2000), w('bat', 6, 500, 4000)]),
    ],
    200, 15, 140, 'Orcs are tough and armored. Bring heavy hitters!', 'forest'),

  buildLevel('w1-8', 'Forest Guardian', 1, 7, 9, 8, w1Path8,
    [
      wave([w('slime', 12, 500), w('goblin', 8, 600, 2000)]),
      wave([w('skeleton', 8, 800), w('bat', 8, 600, 1500)]),
      wave([w('orc', 4, 1500), w('goblin', 10, 500, 2000)]),
      wave([w('bat', 12, 400), w('skeleton', 6, 700, 2000), w('orc', 3, 2000, 4000)]),
      wave([w('orc', 6, 1200), w('slime', 20, 300, 1000)]),
      wave([w('goblin', 15, 400), w('orc', 5, 1200, 3000)]),
      wave([w('golem', 1, 5000), w('orc', 4, 1500, 2000), w('skeleton', 8, 600, 4000)]),
    ],
    220, 15, 180, 'The Stone Golem guards the forest exit. Defeat it to proceed!', 'forest'),

  // --- World 2: Scorching Sands ---
  ...generateWorld2Levels(),

  // --- World 3: Frozen Peaks ---
  ...generateWorld3Levels(),

  // --- World 4: Inferno Depths ---
  ...generateWorld4Levels(),

  // --- World 5: Shadow Realm ---
  ...generateWorld5Levels(),

  // --- World 6: Crystal Caverns ---
  ...generateWorld6Levels(),
];

// World 2 generator
function generateWorld2Levels(): LevelDef[] {
  const paths: [number, number][][] = [
    // w2-1: simple S-curve
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [2, 3], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6]],
    // w2-2
    [[0, 6], [1, 6], [1, 5], [1, 4], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2], [7, 3], [7, 4], [8, 4]],
    // w2-3: zigzag
    [[0, 3], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [8, 5]],
    // w2-4
    [[4, 0], [4, 1], [3, 1], [2, 1], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7]],
    // w2-5
    [[0, 1], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [4, 4], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5]],
    // w2-6
    [[0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [3, 6], [2, 6], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [6, 4], [6, 3], [7, 3], [8, 3]],
    // w2-7
    [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [1, 4], [1, 5], [1, 6], [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5], [6, 6], [7, 6], [8, 6]],
    // w2-8 boss
    [[0, 4], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]],
  ];

  const waveData: Wave[][] = [
    // w2-1
    [wave([w('goblin', 8, 800)]), wave([w('spider', 6, 700)]), wave([w('goblin', 10, 600), w('spider', 4, 800, 2000)]), wave([w('skeleton', 6, 800), w('spider', 6, 700, 1500)])],
    // w2-2
    [wave([w('spider', 8, 700)]), wave([w('wolf', 6, 600)]), wave([w('spider', 8, 600), w('wolf', 4, 700, 1500)]), wave([w('skeleton', 6, 800), w('wolf', 6, 600, 2000)]), wave([w('orc', 3, 1500), w('wolf', 8, 500, 1000)])],
    // w2-3
    [wave([w('wolf', 6, 600)]), wave([w('skeleton', 8, 800), w('wolf', 4, 600, 2000)]), wave([w('orc', 3, 1800), w('goblin', 10, 500, 1000)]), wave([w('wolf', 10, 500), w('spider', 8, 600, 1500)]), wave([w('orc', 5, 1500), w('wolf', 8, 500, 2000)])],
    // w2-4
    [wave([w('mushroom', 5, 1200)]), wave([w('spider', 8, 700), w('mushroom', 4, 1000, 2000)]), wave([w('wolf', 8, 600), w('mushroom', 4, 1000, 1500)]), wave([w('orc', 4, 1500), w('mushroom', 6, 900, 2000)]), wave([w('mushroom', 8, 800), w('orc', 4, 1200, 3000)])],
    // w2-5
    [wave([w('goblin', 12, 500)]), wave([w('bat', 10, 500), w('spider', 6, 700, 1500)]), wave([w('orc', 4, 1500), w('bat', 8, 500, 1000)]), wave([w('wolf', 10, 500), w('skeleton', 8, 700, 2000)]), wave([w('spider', 10, 500), w('orc', 5, 1200, 2000), w('bat', 8, 500, 3000)])],
    // w2-6
    [wave([w('skeleton', 8, 800), w('spider', 6, 700, 1500)]), wave([w('wolf', 8, 600), w('bat', 6, 500, 2000)]), wave([w('orc', 5, 1200), w('mushroom', 4, 1000, 2000)]), wave([w('knight', 3, 2000), w('skeleton', 8, 700, 1000)]), wave([w('wolf', 12, 400), w('orc', 5, 1200, 2000)]), wave([w('knight', 4, 1800), w('spider', 10, 500, 1000), w('bat', 8, 500, 3000)])],
    // w2-7
    [wave([w('knight', 3, 2000)]), wave([w('spider', 10, 500), w('knight', 3, 1800, 2000)]), wave([w('orc', 5, 1200), w('wolf', 8, 500, 1500)]), wave([w('mushroom', 6, 900), w('knight', 4, 1500, 2000)]), wave([w('bat', 12, 400), w('orc', 5, 1200, 2000), w('knight', 3, 1800, 4000)]), wave([w('wolf', 15, 400), w('knight', 5, 1500, 2000)])],
    // w2-8 boss
    [wave([w('spider', 10, 600), w('wolf', 6, 700, 2000)]), wave([w('orc', 5, 1200), w('knight', 3, 1800, 2000)]), wave([w('mushroom', 6, 900), w('bat', 10, 500, 1500)]), wave([w('knight', 5, 1500), w('orc', 5, 1200, 2000)]), wave([w('wolf', 12, 400), w('skeleton', 10, 600, 1000), w('spider', 8, 500, 3000)]), wave([w('knight', 4, 1500), w('orc', 6, 1000, 2000)]), wave([w('dragon', 1, 5000), w('bat', 10, 400, 2000), w('knight', 4, 1500, 4000)])],
  ];

  const names = ['Desert Entry', 'Oasis Defense', 'Sand Zigzag', 'Fungi Fields', 'Crosswinds', 'The Long March', 'Knight\'s Passage', 'Dragon\'s Lair'];
  const descs = [
    'The desert begins. Watch for spiders!',
    'Wolves hunt in the dunes.',
    'A twisting path through the sands.',
    'Mushroom enemies split when killed!',
    'Flying enemies swarm from above.',
    'The longest desert path. Hold the line!',
    'Dark Knights have heavy armor and shields.',
    'A dragon emerges! Your greatest challenge yet.',
  ];

  return paths.map((path, i) => buildLevel(
    `w2-${i + 1}`, names[i], 2, i,
    i === 0 ? 8 : 9, i === 3 ? 8 : 8, path,
    waveData[i],
    150 + i * 20, 15 - Math.floor(i / 3),
    100 + i * 15, descs[i], 'desert',
  ));
}

// World 3 generator
function generateWorld3Levels(): LevelDef[] {
  const paths: [number, number][][] = [
    [[0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5]],
    [[0, 6], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3], [8, 3]],
    [[4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3], [8, 3]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [2, 3], [3, 3], [4, 3], [4, 4], [4, 5], [3, 5], [2, 5], [2, 6], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [6, 4], [7, 4], [8, 4]],
    [[0, 3], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [3, 5], [2, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [6, 5], [6, 4], [6, 3], [7, 3], [8, 3]],
    [[0, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]],
    [[0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [3, 6], [2, 6], [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [7, 5], [8, 5]],
    [[0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [5, 6], [4, 6], [3, 6], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [8, 3]],
  ];

  const waveData: Wave[][] = [
    [wave([w('wolf', 8, 700)]), wave([w('ghost', 4, 1000)]), wave([w('wolf', 10, 600), w('ghost', 4, 900, 2000)]), wave([w('skeleton', 8, 700), w('wolf', 6, 600, 2000)])],
    [wave([w('ghost', 6, 800)]), wave([w('wraith', 4, 900)]), wave([w('wolf', 10, 500), w('ghost', 6, 700, 1500)]), wave([w('wraith', 5, 800), w('skeleton', 8, 600, 2000)]), wave([w('orc', 4, 1200), w('wraith', 6, 700, 2000)])],
    [wave([w('wolf', 12, 500)]), wave([w('ghost', 6, 700), w('bat', 8, 500, 1500)]), wave([w('wraith', 6, 700), w('wolf', 8, 500, 1500)]), wave([w('knight', 4, 1500), w('ghost', 6, 700, 2000)]), wave([w('orc', 5, 1200), w('wraith', 6, 600, 2000), w('wolf', 8, 500, 3000)])],
    [wave([w('skeleton', 10, 600), w('ghost', 4, 800, 2000)]), wave([w('troll', 2, 2500)]), wave([w('wolf', 10, 500), w('troll', 2, 2500, 2000)]), wave([w('wraith', 8, 600), w('knight', 4, 1500, 2000)]), wave([w('troll', 3, 2000), w('ghost', 8, 600, 1500)]), wave([w('knight', 5, 1200), w('troll', 3, 2000, 3000)])],
    [wave([w('bat', 12, 400), w('ghost', 6, 700, 2000)]), wave([w('knight', 4, 1500), w('wraith', 6, 700, 1500)]), wave([w('orc', 6, 1000), w('wolf', 10, 500, 1500)]), wave([w('troll', 3, 2000), w('bat', 10, 400, 1000)]), wave([w('wraith', 8, 600), w('knight', 5, 1200, 2000)]), wave([w('troll', 4, 1800), w('ghost', 8, 600, 2000)])],
    [wave([w('wolf', 15, 400)]), wave([w('ghost', 8, 600), w('wraith', 6, 700, 2000)]), wave([w('knight', 5, 1200), w('troll', 3, 1800, 2000)]), wave([w('orc', 6, 1000), w('wolf', 10, 500, 1500), w('bat', 8, 500, 3000)]), wave([w('wraith', 8, 600), w('troll', 4, 1500, 2000)]), wave([w('knight', 6, 1200), w('ghost', 8, 500, 2000), w('wolf', 10, 400, 4000)])],
    [wave([w('troll', 3, 2000), w('wolf', 8, 600, 1000)]), wave([w('wraith', 8, 600), w('ghost', 6, 700, 1500)]), wave([w('knight', 6, 1200), w('orc', 5, 1200, 2000)]), wave([w('troll', 4, 1500), w('wolf', 12, 400, 1000)]), wave([w('bat', 15, 350), w('wraith', 8, 500, 2000), w('ghost', 6, 600, 4000)]), wave([w('knight', 6, 1000), w('troll', 4, 1500, 2000)]), wave([w('orc', 8, 1000), w('troll', 5, 1500, 2000)])],
    [wave([w('wolf', 12, 500), w('ghost', 6, 700, 2000)]), wave([w('knight', 5, 1200), w('wraith', 6, 700, 1500)]), wave([w('troll', 4, 1500), w('orc', 6, 1000, 2000)]), wave([w('wraith', 10, 500), w('bat', 12, 400, 1500)]), wave([w('knight', 6, 1200), w('troll', 4, 1500, 2000), w('wolf', 10, 500, 3000)]), wave([w('orc', 8, 1000), w('ghost', 8, 600, 1500)]), wave([w('golem', 2, 4000), w('knight', 5, 1200, 3000), w('troll', 3, 1800, 5000)])],
  ];

  const names = ['Frostbite Pass', 'Phantom Trail', 'The Frozen River', 'Troll Bridge', 'Blizzard Run', 'Icewind Maze', 'Wraith\'s Domain', 'Twin Golems'];
  const descs = [
    'Welcome to the frozen peaks. Dress warm!',
    'Ghosts phase through obstacles. Target air!',
    'A frozen river creates a natural path.',
    'Trolls regenerate health. Kill them fast!',
    'A blizzard of flying enemies approaches.',
    'The longest maze in the mountains.',
    'Wraiths cloak themselves in shadow.',
    'Two golems guard the mountain pass!',
  ];

  return paths.map((path, i) => buildLevel(
    `w3-${i + 1}`, names[i], 3, i,
    9, 8, path, waveData[i],
    180 + i * 25, 12 - Math.floor(i / 4),
    110 + i * 15, descs[i], 'ice',
  ));
}

// World 4 generator
function generateWorld4Levels(): LevelDef[] {
  const paths: [number, number][][] = [
    [[0, 3], [1, 3], [2, 3], [2, 4], [2, 5], [3, 5], [4, 5], [4, 4], [4, 3], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [7, 4], [8, 4]],
    [[0, 7], [1, 7], [1, 6], [1, 5], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [6, 5], [7, 5], [8, 5]],
    [[4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [2, 5], [1, 5], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [6, 5], [6, 4], [7, 4], [8, 4]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [2, 5], [2, 6], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3], [7, 4], [7, 5], [8, 5]],
    [[0, 4], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]],
    [[0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2]],
    [[0, 5], [1, 5], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [6, 6], [5, 6], [4, 6], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7]],
    [[0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 7], [5, 7], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [8, 7]],
  ];

  const waveData: Wave[][] = [
    [wave([w('skeleton', 10, 600, 0, 1.5)]), wave([w('orc', 5, 1200, 0, 1.5)]), wave([w('knight', 4, 1500, 0, 1.5), w('skeleton', 8, 600, 2000, 1.5)]), wave([w('troll', 3, 2000, 0, 1.5), w('orc', 5, 1000, 2000, 1.5)])],
    [wave([w('spider', 12, 500, 0, 1.5)]), wave([w('mushroom', 6, 900, 0, 1.5), w('spider', 8, 600, 1500, 1.5)]), wave([w('orc', 6, 1000, 0, 1.5), w('knight', 3, 1500, 2000, 1.5)]), wave([w('troll', 3, 1800, 0, 1.5), w('spider', 10, 500, 1000, 1.5)]), wave([w('knight', 5, 1200, 0, 1.5), w('mushroom', 6, 800, 2000, 1.5)])],
    [wave([w('orc', 6, 1000, 0, 1.8)]), wave([w('troll', 3, 1800, 0, 1.8), w('knight', 4, 1500, 2000, 1.8)]), wave([w('bat', 15, 400, 0, 1.5), w('ghost', 8, 600, 1500, 1.5)]), wave([w('knight', 6, 1200, 0, 1.8), w('troll', 4, 1500, 2000, 1.8)]), wave([w('wraith', 8, 600, 0, 1.5), w('orc', 6, 1000, 1500, 1.8)])],
    [wave([w('knight', 5, 1200, 0, 2)]), wave([w('troll', 4, 1500, 0, 2), w('orc', 6, 1000, 2000, 2)]), wave([w('wraith', 8, 600, 0, 1.5), w('ghost', 8, 600, 1500, 1.5)]), wave([w('mushroom', 8, 800, 0, 2), w('knight', 4, 1200, 2000, 2)]), wave([w('troll', 5, 1500, 0, 2), w('wraith', 6, 700, 2000, 1.5)]), wave([w('knight', 6, 1000, 0, 2), w('orc', 8, 800, 2000, 2)])],
    [wave([w('orc', 8, 800, 0, 2)]), wave([w('knight', 6, 1000, 0, 2), w('troll', 3, 1800, 2000, 2)]), wave([w('ghost', 10, 500, 0, 1.5), w('wraith', 8, 600, 1500, 1.5)]), wave([w('mushroom', 8, 700, 0, 2), w('orc', 6, 1000, 2000, 2)]), wave([w('troll', 5, 1200, 0, 2), w('knight', 5, 1200, 2000, 2), w('wraith', 6, 700, 4000, 1.5)]), wave([w('knight', 8, 1000, 0, 2), w('troll', 5, 1200, 2000, 2)])],
    [wave([w('troll', 4, 1500, 0, 2.2)]), wave([w('knight', 6, 1000, 0, 2.2), w('orc', 8, 800, 2000, 2.2)]), wave([w('wraith', 10, 500, 0, 1.8), w('bat', 12, 400, 1500, 1.8)]), wave([w('mushroom', 10, 700, 0, 2.2), w('troll', 4, 1500, 2000, 2.2)]), wave([w('golem', 1, 5000, 0, 1.5), w('knight', 5, 1200, 3000, 2.2)]), wave([w('knight', 8, 1000, 0, 2.2), w('troll', 5, 1200, 2000, 2.2), w('wraith', 6, 700, 4000, 1.8)])],
    [wave([w('knight', 6, 1000, 0, 2.5)]), wave([w('troll', 5, 1200, 0, 2.5), w('orc', 8, 800, 2000, 2.5)]), wave([w('wraith', 10, 500, 0, 2), w('ghost', 8, 600, 1500, 2)]), wave([w('golem', 2, 4000, 0, 1.5), w('knight', 5, 1200, 3000, 2.5)]), wave([w('troll', 6, 1000, 0, 2.5), w('knight', 6, 1000, 2000, 2.5), w('orc', 8, 800, 4000, 2.5)]), wave([w('wraith', 10, 500, 0, 2), w('troll', 5, 1200, 2000, 2.5)]), wave([w('golem', 2, 3500, 0, 2), w('knight', 8, 1000, 2000, 2.5), w('troll', 5, 1200, 4000, 2.5)])],
    [wave([w('knight', 8, 1000, 0, 2.5)]), wave([w('troll', 5, 1200, 0, 2.5), w('wraith', 8, 600, 2000, 2)]), wave([w('golem', 2, 3500, 0, 2), w('orc', 8, 800, 2000, 2.5)]), wave([w('ghost', 12, 400, 0, 2), w('bat', 12, 400, 1500, 2)]), wave([w('knight', 10, 800, 0, 2.5), w('troll', 6, 1000, 2000, 2.5)]), wave([w('golem', 3, 3000, 0, 2), w('wraith', 10, 500, 2000, 2)]), wave([w('troll', 6, 1000, 0, 3), w('knight', 8, 800, 2000, 3)]), wave([w('demon', 1, 6000), w('golem', 2, 4000, 3000, 2), w('knight', 6, 1000, 5000, 2.5)])],
  ];

  const names = ['Lava Flow', 'Ember Trail', 'Fire Spiral', 'Molten Maze', 'Inferno Highway', 'Hellfire Turns', 'Demon\'s Path', 'Demon Lord\'s Throne'];
  const descs = [
    'Enemies are tougher in the volcanic depths!',
    'The heat makes enemies stronger.',
    'A spiraling path through the lava.',
    'Navigate the maze of molten rock.',
    'A long highway through the inferno.',
    'Twisting turns through hellfire.',
    'Demons and golems guard this path.',
    'Face the Demon Lord himself!',
  ];

  return paths.map((path, i) => buildLevel(
    `w4-${i + 1}`, names[i], 4, i,
    9, 8, path, waveData[i],
    220 + i * 30, 10 - Math.floor(i / 4),
    120 + i * 15, descs[i], 'volcano',
  ));
}

// World 5 generator
function generateWorld5Levels(): LevelDef[] {
  const paths: [number, number][][] = [
    [[0, 4], [1, 4], [1, 3], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3], [8, 3]],
    [[0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [4, 3], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5]],
    [[4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [8, 4]],
    [[0, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [2, 3], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [6, 7], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2]],
    [[0, 3], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [2, 6], [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]],
    [[0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [4, 3], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [6, 5], [5, 5], [5, 6], [5, 7], [4, 7], [3, 7], [3, 6], [3, 5], [2, 5], [2, 6], [2, 7], [1, 7], [0, 7]],
    [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [2, 7], [3, 7], [3, 6], [3, 5], [3, 4], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [6, 7], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [7, 1], [8, 1]],
  ];

  const waveData: Wave[][] = [
    [wave([w('wraith', 8, 600, 0, 2)]), wave([w('ghost', 10, 500, 0, 2), w('wraith', 6, 700, 2000, 2)]), wave([w('knight', 5, 1200, 0, 2.5), w('troll', 3, 1800, 2000, 2.5)]), wave([w('wraith', 10, 500, 0, 2), w('knight', 5, 1200, 2000, 2.5)]), wave([w('troll', 5, 1200, 0, 2.5), w('ghost', 8, 600, 2000, 2)])],
    [wave([w('ghost', 12, 400, 0, 2)]), wave([w('knight', 6, 1000, 0, 3), w('wraith', 8, 600, 2000, 2)]), wave([w('troll', 5, 1200, 0, 3), w('orc', 8, 800, 2000, 3)]), wave([w('golem', 2, 3500, 0, 2), w('wraith', 8, 500, 2000, 2)]), wave([w('knight', 8, 1000, 0, 3), w('troll', 5, 1200, 2000, 3)]), wave([w('golem', 2, 3000, 0, 2.5), w('ghost', 10, 500, 2000, 2)])],
    [wave([w('wraith', 10, 500, 0, 2.5)]), wave([w('troll', 5, 1200, 0, 3), w('knight', 6, 1000, 2000, 3)]), wave([w('golem', 2, 3500, 0, 2), w('orc', 8, 800, 2000, 3)]), wave([w('ghost', 12, 400, 0, 2), w('bat', 15, 350, 1500, 2)]), wave([w('knight', 8, 1000, 0, 3), w('troll', 5, 1200, 2000, 3), w('wraith', 8, 600, 4000, 2.5)]), wave([w('golem', 3, 3000, 0, 2.5), w('knight', 6, 1000, 3000, 3)])],
    [wave([w('knight', 8, 1000, 0, 3)]), wave([w('troll', 5, 1200, 0, 3), w('wraith', 10, 500, 2000, 2.5)]), wave([w('golem', 3, 3000, 0, 2.5), w('ghost', 10, 500, 2000, 2)]), wave([w('knight', 10, 800, 0, 3), w('troll', 6, 1000, 2000, 3)]), wave([w('wraith', 12, 400, 0, 2.5), w('bat', 15, 350, 1500, 2)]), wave([w('golem', 3, 2500, 0, 3), w('knight', 8, 1000, 3000, 3)]), wave([w('dragon', 1, 5000, 0, 2), w('troll', 5, 1200, 3000, 3)])],
    [wave([w('troll', 6, 1000, 0, 3.5)]), wave([w('knight', 8, 1000, 0, 3.5), w('wraith', 10, 500, 2000, 3)]), wave([w('golem', 3, 3000, 0, 3), w('ghost', 12, 400, 2000, 2.5)]), wave([w('dragon', 1, 4500, 0, 2), w('knight', 6, 1000, 3000, 3.5)]), wave([w('troll', 6, 1000, 0, 3.5), w('golem', 3, 2500, 2000, 3)]), wave([w('wraith', 12, 400, 0, 3), w('knight', 8, 800, 2000, 3.5)]), wave([w('dragon', 1, 4000, 0, 2.5), w('golem', 3, 2500, 3000, 3)])],
    [wave([w('golem', 3, 3000, 0, 3)]), wave([w('knight', 10, 800, 0, 3.5), w('troll', 6, 1000, 2000, 3.5)]), wave([w('wraith', 12, 400, 0, 3), w('ghost', 12, 400, 1500, 2.5)]), wave([w('dragon', 2, 4000, 0, 2.5), w('golem', 3, 2500, 3000, 3)]), wave([w('troll', 8, 1000, 0, 3.5), w('knight', 8, 1000, 2000, 3.5)]), wave([w('golem', 4, 2500, 0, 3), w('wraith', 10, 500, 2000, 3)]), wave([w('dragon', 2, 3500, 0, 3), w('knight', 8, 800, 3000, 3.5), w('troll', 6, 1000, 5000, 3.5)])],
    [wave([w('knight', 10, 800, 0, 4)]), wave([w('troll', 8, 1000, 0, 4), w('golem', 3, 2500, 2000, 3)]), wave([w('dragon', 2, 3500, 0, 3), w('wraith', 12, 400, 2000, 3)]), wave([w('golem', 4, 2500, 0, 3), w('knight', 10, 800, 2000, 4)]), wave([w('troll', 8, 1000, 0, 4), w('dragon', 2, 3000, 2000, 3)]), wave([w('knight', 12, 700, 0, 4), w('golem', 4, 2500, 2000, 3), w('wraith', 10, 500, 4000, 3)]), wave([w('dragon', 3, 3000, 0, 3), w('golem', 4, 2500, 3000, 3.5)])],
    [wave([w('golem', 4, 2500, 0, 3.5)]), wave([w('dragon', 2, 3500, 0, 3), w('knight', 10, 800, 2000, 4)]), wave([w('troll', 8, 1000, 0, 4), w('wraith', 12, 400, 1500, 3.5)]), wave([w('golem', 5, 2000, 0, 3.5), w('dragon', 2, 3000, 3000, 3)]), wave([w('knight', 12, 700, 0, 4), w('troll', 8, 1000, 2000, 4)]), wave([w('dragon', 3, 3000, 0, 3.5), w('golem', 4, 2500, 3000, 3.5)]), wave([w('knight', 15, 600, 0, 4), w('troll', 8, 1000, 2000, 4), w('wraith', 12, 400, 4000, 3.5)]), wave([w('demon', 2, 5000), w('dragon', 3, 3000, 3000, 3), w('golem', 4, 2500, 5000, 3.5)])],
  ];

  const names = ['Shadow Gate', 'Dark Passage', 'Void Spiral', 'Serpentine Shadows', 'Nightmare Path', 'The Endless Dark', 'Shadow Labyrinth', 'The Final Stand'];
  const descs = [
    'The Shadow Realm. Enemies are extremely powerful.',
    'Darkness conceals many dangers.',
    'A void spirals deeper into the shadows.',
    'The path serpentines through utter darkness.',
    'A nightmare made real. Can you survive?',
    'The darkness seems to go on forever.',
    'Lost in a labyrinth of shadow.',
    'The ultimate battle. Defeat the Demon Lords!',
  ];

  return paths.map((path, i) => buildLevel(
    `w5-${i + 1}`, names[i], 5, i,
    9, 8, path, waveData[i],
    280 + i * 30, 8 - Math.floor(i / 4),
    140 + i * 15, descs[i], 'shadow',
  ));
}

// World 6 generator (bonus)
function generateWorld6Levels(): LevelDef[] {
  const paths: [number, number][][] = [
    // Tight spiral
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [7, 1], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [4, 2], [4, 3], [4, 4]],
    // Double back
    [[0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [8, 7]],
    // Cross pattern
    [[0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [3, 6], [2, 6], [2, 5], [2, 4], [1, 4], [1, 5], [1, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [6, 4], [6, 3], [7, 3], [8, 3]],
    // Dense zigzag
    [[0, 0], [1, 0], [1, 1], [1, 2], [0, 2], [0, 3], [0, 4], [1, 4], [1, 5], [0, 5], [0, 6], [0, 7], [1, 7], [2, 7], [2, 6], [2, 5], [2, 4], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [7, 1], [8, 1]],
    // The gauntlet
    [[0, 4], [1, 4], [1, 3], [1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 7], [5, 7], [5, 6], [5, 5], [5, 4], [5, 3], [5, 2], [5, 1], [5, 0], [6, 0], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [8, 7]],
  ];

  const waveData: Wave[][] = [
    // Special challenge: speed rush
    [wave([w('goblin', 20, 300, 0, 2, 2)]), wave([w('wolf', 15, 400, 0, 2, 2), w('spider', 10, 500, 2000, 2, 2)]), wave([w('bat', 20, 300, 0, 1.5, 2.5)]), wave([w('goblin', 25, 250, 0, 2.5, 2), w('wolf', 15, 350, 1500, 2.5, 2)]), wave([w('spider', 20, 300, 0, 3, 2.5), w('bat', 15, 300, 1000, 2, 2.5)])],
    // Tank rush
    [wave([w('orc', 8, 1000, 0, 3)]), wave([w('knight', 6, 1200, 0, 3), w('troll', 4, 1500, 2000, 3)]), wave([w('golem', 3, 3000, 0, 2.5)]), wave([w('troll', 6, 1000, 0, 3), w('golem', 3, 2500, 3000, 2.5)]), wave([w('knight', 8, 1000, 0, 3.5), w('golem', 4, 2000, 2000, 3)]), wave([w('golem', 5, 2000, 0, 3), w('troll', 6, 1200, 3000, 3.5)])],
    // Air assault
    [wave([w('bat', 15, 400, 0, 2)]), wave([w('ghost', 10, 600, 0, 2), w('bat', 12, 400, 1500, 2)]), wave([w('wraith', 8, 700, 0, 2.5), w('ghost', 10, 500, 2000, 2)]), wave([w('bat', 20, 300, 0, 2.5), w('wraith', 8, 600, 1500, 2.5)]), wave([w('dragon', 2, 4000, 0, 2), w('bat', 15, 350, 2000, 2.5), w('ghost', 10, 500, 4000, 2)]), wave([w('dragon', 3, 3500, 0, 2.5), w('wraith', 10, 500, 2000, 3)])],
    // Everything at once
    [wave([w('slime', 25, 250, 0, 3)]), wave([w('goblin', 15, 400, 0, 3), w('skeleton', 10, 600, 1500, 3)]), wave([w('orc', 6, 1000, 0, 3), w('bat', 12, 400, 1500, 2), w('spider', 8, 600, 3000, 3)]), wave([w('troll', 4, 1500, 0, 3.5), w('knight', 6, 1000, 2000, 3.5), w('wraith', 8, 600, 4000, 3)]), wave([w('golem', 3, 2500, 0, 3), w('dragon', 2, 3500, 3000, 2.5)]), wave([w('knight', 10, 800, 0, 4), w('troll', 6, 1000, 2000, 4), w('wraith', 10, 500, 4000, 3.5)]), wave([w('demon', 1, 6000, 0, 2), w('dragon', 3, 3000, 3000, 3), w('golem', 4, 2500, 5000, 3.5)])],
    // Ultimate challenge
    [wave([w('orc', 10, 800, 0, 4)]), wave([w('troll', 6, 1000, 0, 4), w('knight', 8, 800, 2000, 4)]), wave([w('golem', 4, 2500, 0, 3.5), w('dragon', 2, 3500, 3000, 3)]), wave([w('wraith', 15, 400, 0, 3.5), w('ghost', 12, 400, 1500, 3)]), wave([w('knight', 12, 700, 0, 4.5), w('troll', 8, 1000, 2000, 4.5), w('golem', 4, 2500, 4000, 3.5)]), wave([w('dragon', 3, 3000, 0, 3.5), w('golem', 4, 2500, 3000, 3.5), w('wraith', 10, 500, 5000, 3.5)]), wave([w('knight', 15, 600, 0, 5), w('troll', 10, 800, 2000, 5)]), wave([w('demon', 3, 4000), w('dragon', 4, 3000, 3000, 3.5), w('golem', 5, 2000, 5000, 4)])],
  ];

  const names = ['Speed Rush', 'Tank Parade', 'Air Assault', 'Crystal Chaos', 'The Gauntlet'];
  const descs = [
    'Fast enemies flood the spiral! Slow them down!',
    'Nothing but tanks. Bring your heaviest hitters!',
    'The skies darken with flying enemies.',
    'Every enemy type at once. Pure chaos!',
    'The ultimate challenge. Can you 3-star it?',
  ];

  return paths.map((path, i) => buildLevel(
    `w6-${i + 1}`, names[i], 6, i,
    9, 8, path, waveData[i],
    350 + i * 40, 5,
    180 + i * 20, descs[i], 'crystal',
  ));
}

export function getLevelById(id: string): LevelDef | undefined {
  return LEVELS.find(l => l.id === id);
}

export function getLevelsForWorld(world: number): LevelDef[] {
  return LEVELS.filter(l => l.world === world);
}
