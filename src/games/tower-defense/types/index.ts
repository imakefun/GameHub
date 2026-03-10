// ============================================================
// Tower Defense – Type Definitions
// ============================================================

// --- Grid & Pathing ---

export interface GridCell {
  row: number;
  col: number;
  type: 'path' | 'buildable' | 'blocked' | 'start' | 'end';
  /** Optional decoration key for visual flavour */
  decoration?: string;
}

export interface PathPoint {
  row: number;
  col: number;
}

// --- Towers ---

export type TowerId =
  | 'archer'
  | 'mage'
  | 'cannon'
  | 'frost'
  | 'poison'
  | 'lightning'
  | 'sniper'
  | 'buff'
  | 'bomb'
  | 'nature';

export interface TowerDef {
  id: TowerId;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  range: number;
  damage: number;
  attackSpeed: number; // attacks per second
  /** Special ability description */
  special?: string;
  /** Splash radius (0 = single target) */
  splash: number;
  /** Slow amount 0-1 */
  slow: number;
  /** Slow duration ms */
  slowDuration: number;
  /** Damage over time per second */
  dot: number;
  /** Dot duration ms */
  dotDuration: number;
  /** Buff aura range (0 = none) */
  buffRange: number;
  /** Buff damage multiplier */
  buffMultiplier: number;
  /** Can target air? */
  canTargetAir: boolean;
  /** Max upgrade level (0-indexed) */
  maxLevel: number;
  /** Cost multiplier per upgrade level */
  upgradeCostMultiplier: number;
  /** Damage multiplier per upgrade level */
  upgradeDamageMultiplier: number;
  /** Unlock at world */
  unlockWorld: number;
  color: string;
}

export interface PlacedTower {
  id: string; // unique instance id
  towerId: TowerId;
  row: number;
  col: number;
  level: number; // 0 = base
  kills: number;
  lastAttackTime: number;
  /** Accumulated attack timer */
  attackTimer: number;
  targetEnemyId: string | null;
}

// --- Enemies ---

export type EnemyId =
  | 'slime'
  | 'goblin'
  | 'skeleton'
  | 'bat'
  | 'orc'
  | 'ghost'
  | 'spider'
  | 'golem'
  | 'dragon'
  | 'demon'
  | 'wolf'
  | 'mushroom'
  | 'troll'
  | 'wraith'
  | 'knight';

export interface EnemyDef {
  id: EnemyId;
  name: string;
  emoji: string;
  hp: number;
  speed: number; // cells per second
  reward: number; // gold on kill
  armor: number; // flat damage reduction
  isFlying: boolean;
  isBoss: boolean;
  /** Ability key */
  ability?: 'heal' | 'shield' | 'split' | 'stealth' | 'haste';
  color: string;
}

export interface ActiveEnemy {
  id: string;
  enemyId: EnemyId;
  hp: number;
  maxHp: number;
  /** Position along the path (0 = start, 1 = end) */
  pathProgress: number;
  speed: number;
  /** Current slow factor (1 = normal) */
  slowFactor: number;
  slowTimer: number;
  /** DOT damage remaining */
  dotDamage: number;
  dotTimer: number;
  /** True x,y pixel position */
  x: number;
  y: number;
  alive: boolean;
  reachedEnd: boolean;
  /** Stealth timer */
  stealthTimer: number;
  /** Shield HP (absorbs damage before main HP) */
  shieldHp: number;
}

// --- Waves ---

export interface WaveGroup {
  enemyId: EnemyId;
  count: number;
  interval: number; // ms between spawns
  delay: number; // ms delay before this group starts
  hpMultiplier?: number;
  speedMultiplier?: number;
}

export interface Wave {
  groups: WaveGroup[];
}

// --- Projectiles ---

export interface Projectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  targetId: string;
  towerId: TowerId;
  damage: number;
  progress: number; // 0-1
  speed: number;
  splash: number;
  slow: number;
  slowDuration: number;
  dot: number;
  dotDuration: number;
}

// --- Levels ---

export interface LevelDef {
  id: string;
  name: string;
  world: number;
  worldIndex: number; // position in world
  rows: number;
  cols: number;
  grid: GridCell[][];
  path: PathPoint[];
  waves: Wave[];
  startGold: number;
  startLives: number;
  /** Par time in seconds for 3 stars */
  parTime: number;
  /** Description shown on world map */
  description: string;
  /** Allowed tower types (empty = all) */
  allowedTowers?: TowerId[];
  /** Background theme */
  theme: WorldTheme;
}

export type WorldTheme = 'forest' | 'desert' | 'ice' | 'volcano' | 'shadow' | 'crystal';

export interface WorldDef {
  id: number;
  name: string;
  theme: WorldTheme;
  emoji: string;
  description: string;
  levelCount: number;
  color: string;
  bgGradient: string;
}

// --- Saga Map ---

export interface MapNode {
  levelId: string;
  x: number; // 0-100 percentage position
  y: number;
  /** Connections to other node levelIds */
  connections: string[];
}

// --- Level Editor ---

export interface EditorState {
  name: string;
  rows: number;
  cols: number;
  grid: GridCell[][];
  path: PathPoint[];
  waves: Wave[];
  startGold: number;
  startLives: number;
  theme: WorldTheme;
  selectedTool: EditorTool;
  testMode: boolean;
}

export type EditorTool = 'path' | 'buildable' | 'blocked' | 'start' | 'end' | 'erase' | 'decoration';

// --- Game State ---

export type Screen = 'title' | 'worldMap' | 'playing' | 'editor' | 'towerSelect' | 'settings';

export interface GameState {
  screen: Screen;
  // World Map
  selectedWorld: number;
  /** levelId -> stars (0-3) */
  levelStars: Record<string, number>;
  totalStarsEarned: number;

  // In-Game
  currentLevelId: string | null;
  gold: number;
  lives: number;
  maxLives: number;
  score: number;
  waveIndex: number;
  waveActive: boolean;
  /** Are all waves complete? */
  allWavesSpawned: boolean;
  towers: PlacedTower[];
  enemies: ActiveEnemy[];
  projectiles: Projectile[];
  selectedTowerInstanceId: string | null;
  /** Tower the player wants to place */
  placingTowerId: TowerId | null;
  isPaused: boolean;
  gameSpeed: number; // 1 or 2
  gameResult: 'playing' | 'won' | 'lost' | null;
  /** Stars earned this level */
  starsEarned: number;

  // Spawn state
  spawnQueue: { enemyId: EnemyId; spawnTime: number; hpMult: number; speedMult: number }[];
  gameTime: number; // ms elapsed

  // Floating text
  floatingTexts: FloatingText[];

  // Editor
  editorState: EditorState | null;
  customLevels: LevelDef[];

  // Settings
  sfxEnabled: boolean;
  musicEnabled: boolean;
  showRanges: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

// --- Actions ---

export type GameAction =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SELECT_WORLD'; world: number }
  | { type: 'START_LEVEL'; levelId: string }
  | { type: 'PLACE_TOWER'; towerId: TowerId; row: number; col: number }
  | { type: 'SELL_TOWER'; instanceId: string }
  | { type: 'UPGRADE_TOWER'; instanceId: string }
  | { type: 'SELECT_TOWER_INSTANCE'; instanceId: string | null }
  | { type: 'SET_PLACING'; towerId: TowerId | null }
  | { type: 'START_WAVE' }
  | { type: 'TICK'; dt: number }
  | { type: 'PAUSE'; paused: boolean }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'GAME_OVER'; result: 'won' | 'lost' }
  | { type: 'EXIT_LEVEL' }
  | { type: 'TOGGLE_SFX' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_RANGES' }
  // Editor
  | { type: 'OPEN_EDITOR'; level?: LevelDef }
  | { type: 'EDITOR_SET_TOOL'; tool: EditorTool }
  | { type: 'EDITOR_PAINT'; row: number; col: number }
  | { type: 'EDITOR_SET_NAME'; name: string }
  | { type: 'EDITOR_RESIZE'; rows: number; cols: number }
  | { type: 'EDITOR_SET_THEME'; theme: WorldTheme }
  | { type: 'EDITOR_ADD_WAVE' }
  | { type: 'EDITOR_REMOVE_WAVE'; index: number }
  | { type: 'EDITOR_UPDATE_WAVE_GROUP'; waveIndex: number; groupIndex: number; group: Partial<WaveGroup> }
  | { type: 'EDITOR_ADD_WAVE_GROUP'; waveIndex: number }
  | { type: 'EDITOR_REMOVE_WAVE_GROUP'; waveIndex: number; groupIndex: number }
  | { type: 'EDITOR_SET_GOLD'; gold: number }
  | { type: 'EDITOR_SET_LIVES'; lives: number }
  | { type: 'EDITOR_TEST' }
  | { type: 'EDITOR_SAVE' }
  | { type: 'EDITOR_EXIT' }
  | { type: 'DELETE_CUSTOM_LEVEL'; levelId: string }
  | { type: 'LOAD_SAVE' };
