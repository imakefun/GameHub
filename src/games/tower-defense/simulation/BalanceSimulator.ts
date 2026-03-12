// ============================================================
// Tower Defense – Balance Simulation & Monte Carlo Analysis
// Headless simulation engine for modeling difficulty and balance
// ============================================================

import type { LevelDef, TowerId, PlacedTower, ActiveEnemy, Wave } from '../types';
import { TOWER_DEFS, getTowerDef, getTowerDamageAtLevel } from '../data/towers';
import { getEnemyDef, ENEMY_DEFS } from '../data/enemies';
import { LEVELS, getLevelsForWorld } from '../data/levels';
import { WORLDS } from '../data/worlds';
import { buildSpawnQueue, spawnEnemy, getPositionAlongPath } from '../engine/gameEngine';

// ============================================================
// Simulation Types
// ============================================================

export interface SimulationConfig {
  /** Number of Monte Carlo iterations per level */
  iterations: number;
  /** Tower placement strategy */
  strategy: PlacementStrategy;
  /** Whether to upgrade towers */
  upgradePolicy: UpgradePolicy;
  /** Time step for simulation (ms) */
  timeStep: number;
  /** Max simulation time before abort (ms) */
  maxTime: number;
}

export type PlacementStrategy =
  | 'random'          // Random valid placements
  | 'path_adjacent'   // Prioritize cells adjacent to path
  | 'choke_point'     // Focus on choke points (path bends)
  | 'balanced'        // Mix of strategies
  | 'optimal';        // Heuristic-optimal placements

export type UpgradePolicy =
  | 'never'           // Never upgrade
  | 'max_first'       // Max one tower before placing new ones
  | 'balanced'        // Upgrade when cheaper than new tower
  | 'greedy';         // Upgrade as soon as affordable

export interface SimulationResult {
  levelId: string;
  levelName: string;
  world: number;
  iterations: number;
  winRate: number;
  averageLivesLost: number;
  averageStars: number;
  averageGoldRemaining: number;
  averageTowersPlaced: number;
  averageWaveSurvived: number;
  minLivesLost: number;
  maxLivesLost: number;
  medianStars: number;
  difficultyScore: number;      // 0-10, higher = harder
  balanceRating: string;        // 'too easy' | 'easy' | 'balanced' | 'hard' | 'too hard'
  goldEfficiency: number;       // How much of starting gold is typically used
  waveDifficultyProfile: number[];  // Difficulty rating per wave
  runs: SimRunResult[];
}

export interface SimRunResult {
  won: boolean;
  livesLost: number;
  stars: number;
  goldRemaining: number;
  towersPlaced: number;
  waveSurvived: number;
  totalDamageDealt: number;
  totalEnemiesKilled: number;
  totalEnemiesLeaked: number;
}

export interface MonteCarloReport {
  timestamp: number;
  config: SimulationConfig;
  results: SimulationResult[];
  overallBalance: OverallBalance;
}

export interface OverallBalance {
  averageWinRate: number;
  difficultyProgression: number[];  // Difficulty per level across all worlds
  worldDifficulties: { world: number; averageDifficulty: number }[];
  towerUsageRates: Record<string, number>;
  enemyLeakRates: Record<string, number>;
  balanceScore: number;    // 0-100, how well-balanced the game is overall
  recommendations: string[];
}

// ============================================================
// Default Configuration
// ============================================================

export const DEFAULT_SIM_CONFIG: SimulationConfig = {
  iterations: 100,
  strategy: 'balanced',
  upgradePolicy: 'balanced',
  timeStep: 50,  // 50ms steps
  maxTime: 600000,  // 10 minute max per level
};

// ============================================================
// Headless Simulation Engine
// ============================================================

interface SimState {
  gold: number;
  lives: number;
  maxLives: number;
  towers: PlacedTower[];
  enemies: ActiveEnemy[];
  spawnQueue: { enemyId: string; spawnTime: number; hpMult: number; speedMult: number }[];
  gameTime: number;
  waveIndex: number;
  totalDamageDealt: number;
  totalEnemiesKilled: number;
  totalEnemiesLeaked: number;
}

let simNextId = 100000;
function simId(): string {
  return `sim-${simNextId++}`;
}

function findBuildableCells(level: LevelDef): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      if (level.grid[r][c].type === 'buildable') {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

function isAdjacentToPath(row: number, col: number, level: LevelDef): boolean {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < level.rows && c >= 0 && c < level.cols) {
      const type = level.grid[r][c].type;
      if (type === 'path' || type === 'start' || type === 'end') return true;
    }
  }
  return false;
}

function isChokePoint(row: number, col: number, level: LevelDef): boolean {
  // A choke point is adjacent to a path bend (path cell with path neighbors in two different directions)
  if (!isAdjacentToPath(row, col, level)) return false;

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let pathNeighbors = 0;
  for (const [dr, dc] of dirs) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < level.rows && c >= 0 && c < level.cols) {
      const type = level.grid[r][c].type;
      if (type === 'path' || type === 'start' || type === 'end') pathNeighbors++;
    }
  }
  return pathNeighbors >= 2;
}

function selectTowerToPlace(
  availableGold: number,
  world: number,
  _strategy: PlacementStrategy,
): TowerId | null {
  const available = Object.values(TOWER_DEFS).filter(t =>
    t.unlockWorld <= world && t.cost <= availableGold
  );
  if (available.length === 0) return null;

  // Weight towards higher-value towers
  const weights = available.map(t => {
    let w = 1;
    if (t.damage > 0) w += t.damage * t.attackSpeed * 0.1;
    if (t.splash > 0) w *= 1.5;
    if (t.slow > 0) w *= 1.3;
    if (t.dot > 0) w *= 1.2;
    if (t.buffRange > 0) w *= 0.8;
    return w;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i].id;
  }
  return available[available.length - 1].id;
}

function selectPlacementCell(
  cells: { row: number; col: number }[],
  occupied: Set<string>,
  level: LevelDef,
  strategy: PlacementStrategy,
): { row: number; col: number } | null {
  const free = cells.filter(c => !occupied.has(`${c.row},${c.col}`));
  if (free.length === 0) return null;

  if (strategy === 'random') {
    return free[Math.floor(Math.random() * free.length)];
  }

  if (strategy === 'path_adjacent' || strategy === 'balanced' || strategy === 'optimal') {
    const adjacent = free.filter(c => isAdjacentToPath(c.row, c.col, level));
    if (adjacent.length > 0) {
      if (strategy === 'optimal') {
        const chokes = adjacent.filter(c => isChokePoint(c.row, c.col, level));
        if (chokes.length > 0) return chokes[Math.floor(Math.random() * chokes.length)];
      }
      return adjacent[Math.floor(Math.random() * adjacent.length)];
    }
  }

  if (strategy === 'choke_point') {
    const chokes = free.filter(c => isChokePoint(c.row, c.col, level));
    if (chokes.length > 0) return chokes[Math.floor(Math.random() * chokes.length)];
    const adjacent = free.filter(c => isAdjacentToPath(c.row, c.col, level));
    if (adjacent.length > 0) return adjacent[Math.floor(Math.random() * adjacent.length)];
  }

  return free[Math.floor(Math.random() * free.length)];
}

function simulateTick(state: SimState, level: LevelDef, dt: number): void {
  const dtSec = dt / 1000;
  const dtMs = dt;
  const cellSize = 1;

  // Spawn
  const toSpawn: typeof state.spawnQueue = [];
  state.spawnQueue = state.spawnQueue.filter(entry => {
    if (entry.spawnTime <= state.gameTime) {
      toSpawn.push(entry);
      return false;
    }
    return true;
  });

  for (const entry of toSpawn) {
    const enemy = spawnEnemy(entry.enemyId, level.path, cellSize, entry.hpMult, entry.speedMult);
    enemy.id = simId();
    state.enemies.push(enemy);
  }

  // Move enemies
  const pathLen = level.path.length - 1;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    // Slow timer
    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= dtMs;
      if (enemy.slowTimer <= 0) {
        enemy.slowFactor = 1;
        enemy.slowTimer = 0;
      }
    }

    // DOT
    if (enemy.dotTimer > 0) {
      const dotDmg = (enemy.dotDamage / enemy.dotTimer) * dtMs;
      enemy.hp -= dotDmg;
      enemy.dotTimer -= dtMs;
      if (enemy.dotTimer <= 0) {
        enemy.dotDamage = 0;
        enemy.dotTimer = 0;
      }
    }

    // Move
    const speedPerSec = enemy.speed * enemy.slowFactor;
    const progressPerSec = speedPerSec / Math.max(pathLen, 1);
    enemy.pathProgress += progressPerSec * dtSec;

    if (enemy.pathProgress >= 1) {
      enemy.pathProgress = 1;
      enemy.alive = false;
      enemy.reachedEnd = true;
      state.lives--;
      state.totalEnemiesLeaked++;
    }

    const pos = getPositionAlongPath(level.path, Math.min(enemy.pathProgress, 1), cellSize);
    enemy.x = pos.x;
    enemy.y = pos.y;

    // Kill check
    if (enemy.hp <= 0 && enemy.alive) {
      enemy.alive = false;
      if (!enemy.reachedEnd) {
        const def = getEnemyDef(enemy.enemyId);
        state.gold += def.reward;
        state.totalEnemiesKilled++;
      }
    }
  }

  // Heal ability
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'heal') {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.02 * dtSec);
    }
  }

  // Shield ability
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'shield' && enemy.shieldHp <= 0) {
      if (Math.random() < 0.01 * dtSec) {
        enemy.shieldHp = Math.round(enemy.maxHp * 0.3);
      }
    }
  }

  // Tower attacks
  for (const tower of state.towers) {
    const def = getTowerDef(tower.towerId);
    if (def.damage === 0) continue;

    tower.attackTimer += dtMs;
    const attackInterval = 1000 / def.attackSpeed;

    if (tower.attackTimer >= attackInterval) {
      tower.attackTimer -= attackInterval;

      const towerX = (tower.col + 0.5) * cellSize;
      const towerY = (tower.row + 0.5) * cellSize;
      const range = (def.range + tower.level * 0.3) * cellSize;

      // Buff multiplier
      let buffMult = 1;
      for (const other of state.towers) {
        if (other.towerId === 'buff') {
          const bDef = getTowerDef('buff');
          const bx = (other.col + 0.5) * cellSize;
          const by = (other.row + 0.5) * cellSize;
          const bRange = (bDef.buffRange + other.level * 0.3) * cellSize;
          const d = Math.sqrt((towerX - bx) ** 2 + (towerY - by) ** 2);
          if (d <= bRange) {
            buffMult *= bDef.buffMultiplier + other.level * 0.05;
          }
        }
      }

      // Find target
      let bestEnemy: ActiveEnemy | null = null;
      let bestProgress = -1;

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        if (enemy.stealthTimer > 0) continue;
        const eDef = getEnemyDef(enemy.enemyId);
        if (eDef.isFlying && !def.canTargetAir) continue;

        const d = Math.sqrt((towerX - enemy.x) ** 2 + (towerY - enemy.y) ** 2);
        if (d <= range && enemy.pathProgress > bestProgress) {
          bestProgress = enemy.pathProgress;
          bestEnemy = enemy;
        }
      }

      if (bestEnemy) {
        const dmg = getTowerDamageAtLevel(def, tower.level) * buffMult;
        let actualDmg = Math.max(1, dmg - getEnemyDef(bestEnemy.enemyId).armor);

        // Shield absorption
        if (bestEnemy.shieldHp > 0) {
          const absorbed = Math.min(bestEnemy.shieldHp, actualDmg);
          bestEnemy.shieldHp -= absorbed;
          actualDmg -= absorbed;
        }

        bestEnemy.hp -= actualDmg;
        state.totalDamageDealt += actualDmg;

        // Apply slow
        if (def.slow > 0) {
          bestEnemy.slowFactor = 1 - def.slow;
          bestEnemy.slowTimer = def.slowDuration;
        }

        // Apply DOT
        if (def.dot > 0) {
          bestEnemy.dotDamage = def.dot * (1 + tower.level * 0.3);
          bestEnemy.dotTimer = def.dotDuration;
        }

        // Splash
        if (def.splash > 0) {
          for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.id === bestEnemy.id) continue;
            const d = Math.sqrt((bestEnemy.x - enemy.x) ** 2 + (bestEnemy.y - enemy.y) ** 2);
            if (d <= def.splash * cellSize) {
              const falloff = 1 - (d / (def.splash * cellSize)) * 0.5;
              const sDmg = Math.max(1, dmg * falloff - getEnemyDef(enemy.enemyId).armor);
              enemy.hp -= sDmg;
              state.totalDamageDealt += sDmg;
            }
          }
        }

        // Lightning chain
        if (tower.towerId === 'lightning') {
          let lastX = bestEnemy.x;
          let lastY = bestEnemy.y;
          const chained = new Set([bestEnemy.id]);
          for (let i = 0; i < 2; i++) {
            let nearest: ActiveEnemy | null = null;
            let nearestDist = Infinity;
            for (const enemy of state.enemies) {
              if (!enemy.alive || chained.has(enemy.id)) continue;
              const d = Math.sqrt((lastX - enemy.x) ** 2 + (lastY - enemy.y) ** 2);
              if (d < nearestDist && d < 2 * cellSize) {
                nearestDist = d;
                nearest = enemy;
              }
            }
            if (nearest) {
              chained.add(nearest.id);
              const chainDmg = Math.max(1, dmg * 0.5 - getEnemyDef(nearest.enemyId).armor);
              nearest.hp -= chainDmg;
              state.totalDamageDealt += chainDmg;
              lastX = nearest.x;
              lastY = nearest.y;
            }
          }
        }
      }
    }
  }

  // Nature gold
  for (const tower of state.towers) {
    if (tower.towerId === 'nature') {
      state.gold += 2 * (1 + tower.level * 0.5) * dtSec;
    }
  }

  // Clean dead, handle splits
  const newEnemies: ActiveEnemy[] = [];
  for (const enemy of state.enemies) {
    if (!enemy.alive && enemy.hp <= 0 && !enemy.reachedEnd) {
      const def = getEnemyDef(enemy.enemyId);
      if (def.ability === 'split') {
        for (let i = 0; i < 2; i++) {
          const child: ActiveEnemy = {
            id: simId(),
            enemyId: 'slime',
            hp: Math.round(enemy.maxHp * 0.3),
            maxHp: Math.round(enemy.maxHp * 0.3),
            pathProgress: enemy.pathProgress,
            speed: enemy.speed * 1.3,
            slowFactor: 1,
            slowTimer: 0,
            dotDamage: 0,
            dotTimer: 0,
            x: enemy.x + (i === 0 ? -0.2 : 0.2),
            y: enemy.y,
            alive: true,
            reachedEnd: false,
            stealthTimer: 0,
            shieldHp: 0,
          };
          newEnemies.push(child);
        }
      }
    }
  }

  state.enemies = state.enemies.filter(e => e.alive).concat(newEnemies);
  state.gameTime += dtMs;
}

function simulateLevel(
  level: LevelDef,
  config: SimulationConfig,
): SimRunResult {
  const buildableCells = findBuildableCells(level);
  const occupied = new Set<string>();

  const simState: SimState = {
    gold: level.startGold,
    lives: level.startLives,
    maxLives: level.startLives,
    towers: [],
    enemies: [],
    spawnQueue: [],
    gameTime: 0,
    waveIndex: 0,
    totalDamageDealt: 0,
    totalEnemiesKilled: 0,
    totalEnemiesLeaked: 0,
  };

  const world = level.world || 1;

  // Place initial towers with starting gold
  for (let attempt = 0; attempt < 20 && simState.gold >= 50; attempt++) {
    const towerId = selectTowerToPlace(simState.gold, world, config.strategy);
    if (!towerId) break;
    const def = getTowerDef(towerId);
    if (def.cost > simState.gold) break;

    const cell = selectPlacementCell(buildableCells, occupied, level, config.strategy);
    if (!cell) break;

    occupied.add(`${cell.row},${cell.col}`);
    simState.towers.push({
      id: simId(),
      towerId,
      row: cell.row,
      col: cell.col,
      level: 0,
      kills: 0,
      lastAttackTime: 0,
      attackTimer: 0,
      targetEnemyId: null,
    });
    simState.gold -= def.cost;
  }

  // Simulate waves
  for (let w = 0; w < level.waves.length; w++) {
    if (simState.lives <= 0) break;

    simState.waveIndex = w;
    const queue = buildSpawnQueue(level.waves, w);
    simState.spawnQueue = queue.map(e => ({ ...e, spawnTime: e.spawnTime + simState.gameTime }));

    // Run wave until complete
    let waveTimeout = 0;
    while (
      (simState.spawnQueue.length > 0 || simState.enemies.filter(e => e.alive).length > 0) &&
      simState.lives > 0 &&
      waveTimeout < config.maxTime
    ) {
      simulateTick(simState, level, config.timeStep);
      waveTimeout += config.timeStep;

      // Between-wave tower placement/upgrades
      if (simState.spawnQueue.length === 0 && simState.enemies.filter(e => e.alive).length === 0) {
        break;
      }
    }

    // Between waves: place more towers or upgrade
    if (simState.lives > 0) {
      // Upgrade existing towers
      if (config.upgradePolicy !== 'never') {
        for (const tower of simState.towers) {
          const def = getTowerDef(tower.towerId);
          if (tower.level < def.maxLevel) {
            const upgCost = Math.round(def.cost * Math.pow(def.upgradeCostMultiplier, tower.level + 1));
            if (config.upgradePolicy === 'greedy' && simState.gold >= upgCost) {
              tower.level++;
              simState.gold -= upgCost;
            } else if (config.upgradePolicy === 'balanced' && simState.gold >= upgCost && upgCost < 100) {
              tower.level++;
              simState.gold -= upgCost;
            }
          }
        }
      }

      // Place new towers
      for (let attempt = 0; attempt < 5 && simState.gold >= 50; attempt++) {
        const towerId = selectTowerToPlace(simState.gold, world, config.strategy);
        if (!towerId) break;
        const def = getTowerDef(towerId);
        if (def.cost > simState.gold) break;

        const cell = selectPlacementCell(buildableCells, occupied, level, config.strategy);
        if (!cell) break;

        occupied.add(`${cell.row},${cell.col}`);
        simState.towers.push({
          id: simId(),
          towerId,
          row: cell.row,
          col: cell.col,
          level: 0,
          kills: 0,
          lastAttackTime: 0,
          attackTimer: 0,
          targetEnemyId: null,
        });
        simState.gold -= def.cost;
      }
    }
  }

  const won = simState.lives > 0;
  const livesLost = simState.maxLives - simState.lives;
  const livesRatio = simState.lives / simState.maxLives;
  const stars = won ? (livesRatio >= 0.8 ? 3 : livesRatio >= 0.4 ? 2 : 1) : 0;

  return {
    won,
    livesLost,
    stars,
    goldRemaining: Math.floor(simState.gold),
    towersPlaced: simState.towers.length,
    waveSurvived: simState.waveIndex + 1,
    totalDamageDealt: Math.floor(simState.totalDamageDealt),
    totalEnemiesKilled: simState.totalEnemiesKilled,
    totalEnemiesLeaked: simState.totalEnemiesLeaked,
  };
}

// ============================================================
// Monte Carlo Runner
// ============================================================

export function runSimulation(
  level: LevelDef,
  config: SimulationConfig = DEFAULT_SIM_CONFIG,
): SimulationResult {
  const runs: SimRunResult[] = [];

  for (let i = 0; i < config.iterations; i++) {
    runs.push(simulateLevel(level, config));
  }

  const wins = runs.filter(r => r.won);
  const winRate = wins.length / runs.length;
  const avgLivesLost = runs.reduce((s, r) => s + r.livesLost, 0) / runs.length;
  const avgStars = runs.reduce((s, r) => s + r.stars, 0) / runs.length;
  const avgGold = runs.reduce((s, r) => s + r.goldRemaining, 0) / runs.length;
  const avgTowers = runs.reduce((s, r) => s + r.towersPlaced, 0) / runs.length;
  const avgWaveSurvived = runs.reduce((s, r) => s + r.waveSurvived, 0) / runs.length;

  const livesLostValues = runs.map(r => r.livesLost).sort((a, b) => a - b);
  const starsValues = runs.map(r => r.stars).sort((a, b) => a - b);

  // Calculate difficulty score (0-10)
  const difficultyScore = Math.min(10, Math.max(0,
    (1 - winRate) * 5 +
    (avgLivesLost / level.startLives) * 3 +
    (1 - avgStars / 3) * 2
  ));

  // Balance rating
  let balanceRating: string;
  if (winRate >= 0.95 && avgStars >= 2.5) balanceRating = 'too easy';
  else if (winRate >= 0.8 && avgStars >= 2) balanceRating = 'easy';
  else if (winRate >= 0.4 && winRate <= 0.8) balanceRating = 'balanced';
  else if (winRate >= 0.15) balanceRating = 'hard';
  else balanceRating = 'too hard';

  // Wave difficulty profile
  const waveDifficultyProfile = level.waves.map(wave => {
    let totalHp = 0;
    let totalSpeed = 0;
    let count = 0;
    for (const group of wave.groups) {
      const def = getEnemyDef(group.enemyId);
      const hp = def.hp * (group.hpMultiplier ?? 1);
      totalHp += hp * group.count;
      totalSpeed += def.speed * (group.speedMultiplier ?? 1) * group.count;
      count += group.count;
    }
    return count > 0 ? (totalHp / count) * (totalSpeed / count) / 100 : 0;
  });

  return {
    levelId: level.id,
    levelName: level.name,
    world: level.world,
    iterations: config.iterations,
    winRate,
    averageLivesLost: avgLivesLost,
    averageStars: avgStars,
    averageGoldRemaining: avgGold,
    averageTowersPlaced: avgTowers,
    averageWaveSurvived: avgWaveSurvived,
    minLivesLost: livesLostValues[0],
    maxLivesLost: livesLostValues[livesLostValues.length - 1],
    medianStars: starsValues[Math.floor(starsValues.length / 2)],
    difficultyScore,
    balanceRating,
    goldEfficiency: 1 - (avgGold / level.startGold),
    waveDifficultyProfile,
    runs,
  };
}

export function runFullMonteCarloAnalysis(
  config: SimulationConfig = DEFAULT_SIM_CONFIG,
  levelFilter?: string[],
): MonteCarloReport {
  const levelsToSim = levelFilter
    ? LEVELS.filter(l => levelFilter.includes(l.id))
    : LEVELS;

  const results: SimulationResult[] = [];
  for (const level of levelsToSim) {
    results.push(runSimulation(level, config));
  }

  // Aggregate analysis
  const avgWinRate = results.reduce((s, r) => s + r.winRate, 0) / results.length;

  const difficultyProgression = results.map(r => r.difficultyScore);

  const worldDifficulties = WORLDS.map(w => {
    const worldResults = results.filter(r => r.world === w.id);
    const avg = worldResults.length > 0
      ? worldResults.reduce((s, r) => s + r.difficultyScore, 0) / worldResults.length
      : 0;
    return { world: w.id, averageDifficulty: avg };
  });

  // Tower usage from all runs
  const towerUsage: Record<string, number> = {};
  let totalTowers = 0;
  // We count towers placed by available tower pool across runs
  for (const id of Object.keys(TOWER_DEFS)) {
    towerUsage[id] = 0;
  }
  for (const result of results) {
    totalTowers += result.runs.length * result.averageTowersPlaced;
  }

  // Enemy leak rates
  const enemyLeakRates: Record<string, number> = {};
  for (const id of Object.keys(ENEMY_DEFS)) {
    enemyLeakRates[id] = 0;
  }

  // Balance score (0-100)
  // Good balance: progressive difficulty, 40-80% win rates, variety of strategies
  let balanceScore = 50;

  // Reward progressive difficulty
  let isProgressive = true;
  for (let i = 1; i < difficultyProgression.length; i++) {
    if (difficultyProgression[i] < difficultyProgression[i - 1] - 2) {
      isProgressive = false;
      break;
    }
  }
  if (isProgressive) balanceScore += 15;

  // Reward moderate win rates
  if (avgWinRate >= 0.4 && avgWinRate <= 0.8) balanceScore += 20;
  else if (avgWinRate >= 0.3 && avgWinRate <= 0.9) balanceScore += 10;

  // Reward world difficulty progression
  let worldProgressive = true;
  for (let i = 1; i < worldDifficulties.length; i++) {
    if (worldDifficulties[i].averageDifficulty < worldDifficulties[i - 1].averageDifficulty - 1) {
      worldProgressive = false;
      break;
    }
  }
  if (worldProgressive) balanceScore += 15;

  // Generate recommendations
  const recommendations: string[] = [];
  for (const result of results) {
    if (result.winRate > 0.95) {
      recommendations.push(`${result.levelId} (${result.levelName}): Too easy - consider adding more enemies or reducing starting gold`);
    }
    if (result.winRate < 0.1) {
      recommendations.push(`${result.levelId} (${result.levelName}): Too hard - consider reducing enemy HP or adding more starting gold`);
    }
  }

  if (avgWinRate > 0.85) {
    recommendations.push('Overall: Game may be too easy. Consider increasing enemy scaling in later worlds.');
  }
  if (avgWinRate < 0.3) {
    recommendations.push('Overall: Game may be too hard. Consider reducing enemy stats or increasing starting resources.');
  }

  return {
    timestamp: Date.now(),
    config,
    results,
    overallBalance: {
      averageWinRate: avgWinRate,
      difficultyProgression,
      worldDifficulties,
      towerUsageRates: towerUsage,
      enemyLeakRates,
      balanceScore: Math.min(100, Math.max(0, balanceScore)),
      recommendations,
    },
  };
}

// ============================================================
// Quick Analysis Helpers
// ============================================================

export function analyzeLevel(levelId: string, iterations = 50): SimulationResult | null {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return null;
  return runSimulation(level, { ...DEFAULT_SIM_CONFIG, iterations });
}

export function analyzeWorld(worldId: number, iterations = 30): SimulationResult[] {
  const levels = getLevelsForWorld(worldId);
  return levels.map(level => runSimulation(level, { ...DEFAULT_SIM_CONFIG, iterations }));
}

export function quickBalanceCheck(iterations = 20): {
  summary: string;
  worldScores: { world: string; difficulty: number; winRate: number }[];
  problematicLevels: { id: string; name: string; issue: string }[];
} {
  const report = runFullMonteCarloAnalysis({ ...DEFAULT_SIM_CONFIG, iterations });

  const worldScores = WORLDS.map(w => {
    const wd = report.overallBalance.worldDifficulties.find(d => d.world === w.id);
    const worldResults = report.results.filter(r => r.world === w.id);
    const wr = worldResults.length > 0
      ? worldResults.reduce((s, r) => s + r.winRate, 0) / worldResults.length
      : 0;
    return {
      world: w.name,
      difficulty: wd?.averageDifficulty ?? 0,
      winRate: wr,
    };
  });

  const problematicLevels = report.results
    .filter(r => r.winRate > 0.95 || r.winRate < 0.1)
    .map(r => ({
      id: r.levelId,
      name: r.levelName,
      issue: r.winRate > 0.95 ? 'Too easy' : 'Too hard',
    }));

  return {
    summary: `Balance Score: ${report.overallBalance.balanceScore}/100 | Avg Win Rate: ${(report.overallBalance.averageWinRate * 100).toFixed(1)}%`,
    worldScores,
    problematicLevels,
  };
}
