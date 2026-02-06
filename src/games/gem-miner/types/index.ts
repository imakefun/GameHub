// ============================================================
// Gem Miner - Match 3 Puzzle Game Types
// ============================================================

// --- Gem Types ---
export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'diamond' | 'obsidian';

// Gem interface for 3D rendering (includes special type and modifier)
export interface Gem {
  id: string;
  type: GemType;
  special: SpecialGemType;
  modifier: CellModifier;
  row: number;
  col: number;
}

export type SpecialGemType = 'none' | 'striped_h' | 'striped_v' | 'bomb' | 'prismatic';

export interface GemDef {
  type: GemType;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  points: number;
}

// --- Cell & Grid Types ---
export type CellModifier = 'none' | 'ice' | 'dirt' | 'rock' | 'bedrock' | 'locked';

export interface Cell {
  gem: GemType | null;
  gemId: string;
  special: SpecialGemType;
  modifier: CellModifier;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

export type Grid = Cell[][];

// --- Match Types ---
export interface Match {
  cells: Position[];
  type: 'normal' | 'four' | 'five' | 'l_shape' | 't_shape';
  direction: 'horizontal' | 'vertical' | 'shape';
}

export interface ClearedInfo {
  gemsCleared: Record<GemType, number>;
  totalCleared: number;
  rocksDestroyed: number;
  iceDestroyed: number;
  dirtCleared: number;
  locksOpened: number;
  specialsTriggered: number;
  score: number;
}

export interface Movement {
  gemId: string;
  from: Position;
  to: Position;
}

// --- Power-Up Types ---
export type PowerUpType = 'dynamite' | 'pickaxe' | 'drill' | 'earthquake' | 'lantern';

export interface PowerUpDef {
  type: PowerUpType;
  name: string;
  emoji: string;
  description: string;
  needsTarget: boolean;
}

// --- Level & Objective Types ---
export type ObjectiveType = 'score' | 'collect_gems' | 'clear_rocks' | 'clear_ice' | 'clear_dirt';

export interface Objective {
  type: ObjectiveType;
  target: number;
  gemType?: GemType; // for collect_gems
}

export interface ObjectiveProgress extends Objective {
  current: number;
}

export interface LevelLayout {
  rows: number;
  cols: number;
  cells?: Partial<Cell>[][]; // sparse layout for special cells
}

export interface LevelReward {
  powerUp?: PowerUpType;
  count?: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  depth: number; // thematic mining depth in meters
  layout: LevelLayout;
  availableGems: GemType[];
  objectives: Objective[];
  maxMoves: number;
  starThresholds: [number, number, number]; // 1-star, 2-star, 3-star score thresholds
  rewards: LevelReward[];
}

// --- Game State Types ---
export type Screen = 'levelSelect' | 'playing' | 'designer' | 'submittedLevels';
export type AnimationPhase = 'idle' | 'swapping' | 'matching' | 'falling' | 'refilling' | 'cascading';
export type LevelResult = 'none' | 'win' | 'lose';

export interface GameState {
  screen: Screen;
  grid: Grid;
  selectedCell: Position | null;
  activePowerUp: PowerUpType | null;
  currentLevel: number;
  movesRemaining: number;
  score: number;
  objectives: ObjectiveProgress[];
  powerUps: Record<PowerUpType, number>;
  levelStars: Record<number, number>;
  animationPhase: AnimationPhase;
  combo: number;
  isProcessing: boolean;
  levelResult: LevelResult;
  hintCells: Position[];
  matchedCells: Position[];
  lastSwap: { from: Position; to: Position } | null;
}

// --- Designer Types ---
export interface DesignerCell {
  modifier: CellModifier;
  gem: GemType | null;
}

export interface DesignerLevel {
  name: string;
  description: string;
  rows: number;
  cols: number;
  grid: DesignerCell[][];
  availableGems: GemType[];
  objectives: Objective[];
  maxMoves: number;
  starThresholds: [number, number, number];
}

export interface SubmittedLevel extends DesignerLevel {
  id: string;
  submittedAt: number;
}

// --- Action Types ---
export type GameAction =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'START_LEVEL'; level: number }
  | { type: 'SET_GRID'; grid: Grid }
  | { type: 'SELECT_CELL'; position: Position }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ACTIVATE_POWERUP'; powerUp: PowerUpType }
  | { type: 'DEACTIVATE_POWERUP' }
  | { type: 'USE_POWERUP'; powerUp: PowerUpType }
  | { type: 'SWAP_GEMS'; from: Position; to: Position }
  | { type: 'SET_ANIMATION_PHASE'; phase: AnimationPhase }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'DECREMENT_MOVES' }
  | { type: 'UPDATE_OBJECTIVES'; cleared: ClearedInfo }
  | { type: 'SET_COMBO'; combo: number }
  | { type: 'SET_LEVEL_RESULT'; result: LevelResult }
  | { type: 'SET_LEVEL_STARS'; level: number; stars: number }
  | { type: 'SET_HINT'; cells: Position[] }
  | { type: 'SET_MATCHED_CELLS'; cells: Position[] }
  | { type: 'SET_LAST_SWAP'; swap: { from: Position; to: Position } | null }
  | { type: 'RESET_LEVEL' }
  | { type: 'LOAD_DESIGNER_LEVEL'; level: DesignerLevel }
  | { type: 'ADD_POWERUP_REWARD'; powerUp: PowerUpType; count: number };
