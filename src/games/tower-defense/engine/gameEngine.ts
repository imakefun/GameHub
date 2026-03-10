import type {
  GameState, ActiveEnemy, PlacedTower, Projectile, FloatingText,
  LevelDef, Wave, PathPoint,
} from '../types';
import { getTowerDef, getTowerDamageAtLevel, getEnemyDef } from '../data';

// ============================================================
// Coordinate helpers
// ============================================================

const CELL_SIZE = 1; // 1 unit per cell for calculations

export function pathPointToPixel(point: PathPoint, cellSize: number): { x: number; y: number } {
  return {
    x: (point.col + 0.5) * cellSize,
    y: (point.row + 0.5) * cellSize,
  };
}

export function getPositionAlongPath(path: PathPoint[], progress: number, cellSize: number): { x: number; y: number } {
  if (path.length < 2) return pathPointToPixel(path[0], cellSize);

  const totalSegments = path.length - 1;
  const rawIndex = progress * totalSegments;
  const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
  const segProgress = rawIndex - segIndex;

  const from = pathPointToPixel(path[segIndex], cellSize);
  const to = pathPointToPixel(path[Math.min(segIndex + 1, path.length - 1)], cellSize);

  return {
    x: from.x + (to.x - from.x) * segProgress,
    y: from.y + (to.y - from.y) * segProgress,
  };
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

let _nextId = 0;
export function nextId(): string {
  return `e${++_nextId}`;
}

// ============================================================
// Spawn enemies from wave queue
// ============================================================

export function buildSpawnQueue(waves: Wave[], startWaveIndex: number): GameState['spawnQueue'] {
  const wave = waves[startWaveIndex];
  if (!wave) return [];

  const queue: GameState['spawnQueue'] = [];
  for (const group of wave.groups) {
    for (let i = 0; i < group.count; i++) {
      queue.push({
        enemyId: group.enemyId,
        spawnTime: group.delay + i * group.interval,
        hpMult: group.hpMultiplier ?? 1,
        speedMult: group.speedMultiplier ?? 1,
      });
    }
  }
  // Sort by spawn time
  queue.sort((a, b) => a.spawnTime - b.spawnTime);
  return queue;
}

export function spawnEnemy(
  enemyId: string,
  path: PathPoint[],
  cellSize: number,
  hpMult: number,
  speedMult: number,
): ActiveEnemy {
  const def = getEnemyDef(enemyId);
  const pos = getPositionAlongPath(path, 0, cellSize);
  return {
    id: nextId(),
    enemyId: def.id,
    hp: Math.round(def.hp * hpMult),
    maxHp: Math.round(def.hp * hpMult),
    pathProgress: 0,
    speed: def.speed * speedMult,
    slowFactor: 1,
    slowTimer: 0,
    dotDamage: 0,
    dotTimer: 0,
    x: pos.x,
    y: pos.y,
    alive: true,
    reachedEnd: false,
    stealthTimer: 0,
    shieldHp: 0,
  };
}

// ============================================================
// Game tick – the core simulation loop
// ============================================================

export interface TickResult {
  enemies: ActiveEnemy[];
  towers: PlacedTower[];
  projectiles: Projectile[];
  gold: number;
  lives: number;
  score: number;
  spawnQueue: GameState['spawnQueue'];
  gameTime: number;
  allWavesSpawned: boolean;
  floatingTexts: FloatingText[];
  gameResult: 'playing' | 'won' | 'lost' | null;
}

export function tick(state: GameState, dt: number, level: LevelDef): TickResult {
  const dtSec = (dt / 1000) * state.gameSpeed;
  const dtMs = dt * state.gameSpeed;
  const cellSize = CELL_SIZE;
  const gameTime = state.gameTime + dtMs;

  let gold = state.gold;
  let lives = state.lives;
  let score = state.score;
  const floatingTexts = [...state.floatingTexts].filter(t => gameTime - t.createdAt < 1000);

  // Clone arrays
  let enemies = state.enemies.map(e => ({ ...e }));
  const towers = state.towers.map(t => ({ ...t }));
  let projectiles = state.projectiles.map(p => ({ ...p }));
  let spawnQueue = [...state.spawnQueue];
  let allWavesSpawned = state.allWavesSpawned;

  // --- Spawn enemies ---
  const toSpawn: typeof spawnQueue = [];
  const remaining: typeof spawnQueue = [];
  for (const entry of spawnQueue) {
    if (entry.spawnTime <= gameTime - (state.gameTime - (state.waveActive ? 0 : gameTime))) {
      // Use accumulated game time for spawning
      if (gameTime >= state.gameTime + entry.spawnTime - state.gameTime + dtMs) {
        toSpawn.push(entry);
      } else {
        remaining.push(entry);
      }
    } else {
      remaining.push(entry);
    }
  }

  // Simpler approach: spawn based on absolute time since wave started
  spawnQueue = [];
  for (const entry of state.spawnQueue) {
    if (entry.spawnTime <= gameTime) {
      const enemy = spawnEnemy(entry.enemyId, level.path, cellSize, entry.hpMult, entry.speedMult);
      enemies.push(enemy);
    } else {
      spawnQueue.push(entry);
    }
  }

  if (spawnQueue.length === 0 && state.spawnQueue.length > 0) {
    // All enemies for this wave have been spawned
  }

  // --- Move enemies ---
  const pathLen = level.path.length - 1;
  for (const enemy of enemies) {
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

    // Stealth
    if (enemy.stealthTimer > 0) {
      enemy.stealthTimer -= dtMs;
    }

    // Move along path
    const speedPerSec = enemy.speed * enemy.slowFactor;
    const progressPerSec = speedPerSec / Math.max(pathLen, 1);
    enemy.pathProgress += progressPerSec * dtSec;

    if (enemy.pathProgress >= 1) {
      enemy.pathProgress = 1;
      enemy.alive = false;
      enemy.reachedEnd = true;
      lives -= 1;
    }

    // Update pixel position
    const pos = getPositionAlongPath(level.path, Math.min(enemy.pathProgress, 1), cellSize);
    enemy.x = pos.x;
    enemy.y = pos.y;

    // Kill check
    if (enemy.hp <= 0) {
      enemy.alive = false;
      if (!enemy.reachedEnd) {
        const def = getEnemyDef(enemy.enemyId);
        gold += def.reward;
        score += def.reward * 10;
        floatingTexts.push({
          id: nextId(),
          x: enemy.x,
          y: enemy.y,
          text: `+${def.reward}`,
          color: '#fbbf24',
          createdAt: gameTime,
        });
      }
    }
  }

  // --- Nature tower gold generation ---
  for (const tower of towers) {
    if (tower.towerId === 'nature') {
      const level2 = tower.level;
      const goldPerSec = 2 * (1 + level2 * 0.5);
      gold += goldPerSec * dtSec;
    }
  }

  // --- Tower attacks ---
  for (const tower of towers) {
    const def = getTowerDef(tower.towerId);
    if (def.damage === 0 && def.buffRange === 0) continue; // skip non-attacking towers
    if (def.damage === 0) continue; // buff towers don't attack

    tower.attackTimer += dtMs;
    const attackInterval = 1000 / def.attackSpeed;

    if (tower.attackTimer >= attackInterval) {
      tower.attackTimer -= attackInterval;

      // Find target
      const towerX = (tower.col + 0.5) * cellSize;
      const towerY = (tower.row + 0.5) * cellSize;
      const range = (def.range + tower.level * 0.3) * cellSize;

      // Calculate buff multiplier from nearby buff towers
      let buffMult = 1;
      for (const other of towers) {
        if (other.towerId === 'buff') {
          const bDef = getTowerDef('buff');
          const bx = (other.col + 0.5) * cellSize;
          const by = (other.row + 0.5) * cellSize;
          const bRange = (bDef.buffRange + other.level * 0.3) * cellSize;
          if (dist(towerX, towerY, bx, by) <= bRange) {
            buffMult *= bDef.buffMultiplier + other.level * 0.05;
          }
        }
      }

      // Find best target (furthest along path within range)
      let bestEnemy: ActiveEnemy | null = null;
      let bestProgress = -1;

      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (enemy.stealthTimer > 0) continue;
        const eDef = getEnemyDef(enemy.enemyId);
        if (eDef.isFlying && !def.canTargetAir) continue;

        const d = dist(towerX, towerY, enemy.x, enemy.y);
        if (d <= range && enemy.pathProgress > bestProgress) {
          bestProgress = enemy.pathProgress;
          bestEnemy = enemy;
        }
      }

      if (bestEnemy) {
        tower.targetEnemyId = bestEnemy.id;
        const dmg = getTowerDamageAtLevel(def, tower.level) * buffMult;

        projectiles.push({
          id: nextId(),
          fromX: towerX,
          fromY: towerY,
          toX: bestEnemy.x,
          toY: bestEnemy.y,
          targetId: bestEnemy.id,
          towerId: tower.towerId,
          damage: dmg,
          progress: 0,
          speed: 8,
          splash: def.splash * cellSize,
          slow: def.slow,
          slowDuration: def.slowDuration,
          dot: def.dot * (1 + tower.level * 0.3),
          dotDuration: def.dotDuration,
        });
      }
    }
  }

  // --- Move projectiles ---
  const hitProjectiles: Projectile[] = [];
  const activeProjectiles: Projectile[] = [];

  for (const proj of projectiles) {
    proj.progress += proj.speed * dtSec;
    if (proj.progress >= 1) {
      hitProjectiles.push(proj);
    } else {
      activeProjectiles.push(proj);
    }
  }
  projectiles = activeProjectiles;

  // --- Apply projectile hits ---
  for (const proj of hitProjectiles) {
    if (proj.splash > 0) {
      // Splash damage
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const d = dist(proj.toX, proj.toY, enemy.x, enemy.y);
        if (d <= proj.splash) {
          const falloff = 1 - (d / proj.splash) * 0.5; // 50% falloff at edge
          applyDamage(enemy, proj.damage * falloff, proj, towers, gameTime, floatingTexts);
        }
      }
    } else {
      // Single target
      const target = enemies.find(e => e.id === proj.targetId && e.alive);
      if (target) {
        applyDamage(target, proj.damage, proj, towers, gameTime, floatingTexts);
      }
    }

    // Lightning chain
    if (proj.towerId === 'lightning') {
      const target = enemies.find(e => e.id === proj.targetId);
      if (target) {
        let chainCount = 2;
        const chained = new Set([proj.targetId]);
        let lastX = target.x;
        let lastY = target.y;

        for (let i = 0; i < chainCount; i++) {
          let nearest: ActiveEnemy | null = null;
          let nearestDist = Infinity;
          for (const enemy of enemies) {
            if (!enemy.alive || chained.has(enemy.id)) continue;
            const d = dist(lastX, lastY, enemy.x, enemy.y);
            if (d < nearestDist && d < 2 * cellSize) {
              nearestDist = d;
              nearest = enemy;
            }
          }
          if (nearest) {
            chained.add(nearest.id);
            applyDamage(nearest, proj.damage * 0.5, proj, towers, gameTime, floatingTexts);
            lastX = nearest.x;
            lastY = nearest.y;
          }
        }
      }
    }
  }

  // --- Remove dead enemies and track kills ---
  const deadIds = new Set<string>();
  for (const enemy of enemies) {
    if (!enemy.alive && enemy.hp <= 0 && !enemy.reachedEnd) {
      deadIds.add(enemy.id);
    }
  }

  // Track kills on towers
  for (const tower of towers) {
    if (tower.targetEnemyId && deadIds.has(tower.targetEnemyId)) {
      tower.kills += 1;
    }
  }

  // Mushroom split mechanic
  const newEnemies: ActiveEnemy[] = [];
  for (const enemy of enemies) {
    if (!enemy.alive && enemy.hp <= 0 && !enemy.reachedEnd) {
      const def = getEnemyDef(enemy.enemyId);
      if (def.ability === 'split') {
        // Spawn 2 smaller copies
        for (let i = 0; i < 2; i++) {
          const child: ActiveEnemy = {
            id: nextId(),
            enemyId: 'slime', // splits into slimes
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

  enemies = enemies.filter(e => e.alive).concat(newEnemies);

  // --- Heal ability (trolls/demons heal nearby enemies) ---
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'heal') {
      // Heal self slowly
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.02 * dtSec);
    }
  }

  // --- Shield ability ---
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'shield' && enemy.shieldHp <= 0) {
      // Regenerate shield periodically
      if (Math.random() < 0.01 * dtSec) {
        enemy.shieldHp = Math.round(enemy.maxHp * 0.3);
      }
    }
  }

  // --- Stealth ability ---
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'stealth' && enemy.stealthTimer <= 0) {
      if (Math.random() < 0.1 * dtSec) {
        enemy.stealthTimer = 2000;
      }
    }
  }

  // --- Haste ability ---
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const def = getEnemyDef(enemy.enemyId);
    if (def.ability === 'haste') {
      if (Math.random() < 0.05 * dtSec) {
        enemy.speed = def.speed * 2;
        setTimeout(() => { enemy.speed = def.speed; }, 1500);
      }
    }
  }

  // --- Check game result ---
  let gameResult: 'playing' | 'won' | 'lost' | null = state.gameResult;
  if (lives <= 0) {
    gameResult = 'lost';
    lives = 0;
  } else if (
    spawnQueue.length === 0 &&
    enemies.filter(e => e.alive).length === 0 &&
    state.waveActive &&
    allWavesSpawned
  ) {
    gameResult = 'won';
  }

  // Round gold
  gold = Math.floor(gold);

  return {
    enemies,
    towers,
    projectiles,
    gold,
    lives,
    score,
    spawnQueue,
    gameTime,
    allWavesSpawned,
    floatingTexts,
    gameResult,
  };
}

function applyDamage(
  enemy: ActiveEnemy,
  damage: number,
  proj: Projectile,
  _towers: PlacedTower[],
  _gameTime: number,
  _floatingTexts: FloatingText[],
) {
  const def = getEnemyDef(enemy.enemyId);
  let dmg = Math.max(1, damage - def.armor);

  // Shield absorbs first
  if (enemy.shieldHp > 0) {
    const absorbed = Math.min(enemy.shieldHp, dmg);
    enemy.shieldHp -= absorbed;
    dmg -= absorbed;
  }

  enemy.hp -= dmg;

  // Apply slow
  if (proj.slow > 0) {
    enemy.slowFactor = 1 - proj.slow;
    enemy.slowTimer = proj.slowDuration;
  }

  // Apply DOT
  if (proj.dot > 0) {
    enemy.dotDamage = proj.dot;
    enemy.dotTimer = proj.dotDuration;
  }
}

// ============================================================
// Star calculation
// ============================================================

export function calculateStars(lives: number, maxLives: number): number {
  const ratio = lives / maxLives;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}
