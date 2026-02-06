/**
 * Level Validation Module
 *
 * Provides comprehensive validation and sanitization for community-submitted levels
 * to prevent malicious data from being stored in the database.
 */

// Valid gem types that can appear in levels
const VALID_GEM_TYPES = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'] as const;
type GemType = typeof VALID_GEM_TYPES[number];

// Valid cell modifiers
const VALID_MODIFIERS = ['none', 'ice', 'dirt', 'rock', 'bedrock', 'locked'] as const;
type CellModifier = typeof VALID_MODIFIERS[number];

// Valid objective types
const VALID_OBJECTIVE_TYPES = ['score', 'collect_gems', 'clear_rocks', 'clear_ice', 'clear_dirt'] as const;
type ObjectiveType = typeof VALID_OBJECTIVE_TYPES[number];

// Constraints for level data
const CONSTRAINTS = {
  name: { minLength: 1, maxLength: 50 },
  description: { minLength: 0, maxLength: 200 },
  rows: { min: 5, max: 12 },
  cols: { min: 5, max: 12 },
  maxMoves: { min: 5, max: 100 },
  starThresholds: { min: 100, max: 1000000 },
  objectives: { min: 1, max: 5 },
  objectiveTarget: { min: 1, max: 100000 }, // Higher limit for score objectives
  availableGems: { min: 3, max: 7 },
};

interface DesignerCell {
  modifier: CellModifier;
  gem: GemType | null;
}

interface Objective {
  type: ObjectiveType;
  target: number;
  gemType?: GemType;
}

interface DesignerLevel {
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

interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: DesignerLevel;
}

/**
 * Sanitize a string to prevent XSS and injection attacks
 */
function sanitizeString(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove null bytes and control characters (except newlines/tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim and limit length
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate and sanitize a number within constraints
 */
function validateNumber(input: unknown, min: number, max: number): number | null {
  if (typeof input !== 'number' || !Number.isFinite(input)) return null;
  const num = Math.floor(input);
  if (num < min || num > max) return null;
  return num;
}

/**
 * Check if a value is a valid gem type
 */
function isValidGemType(value: unknown): value is GemType {
  return typeof value === 'string' && VALID_GEM_TYPES.includes(value as GemType);
}

/**
 * Check if a value is a valid modifier
 */
function isValidModifier(value: unknown): value is CellModifier {
  return typeof value === 'string' && VALID_MODIFIERS.includes(value as CellModifier);
}

/**
 * Check if a value is a valid objective type
 */
function isValidObjectiveType(value: unknown): value is ObjectiveType {
  return typeof value === 'string' && VALID_OBJECTIVE_TYPES.includes(value as ObjectiveType);
}

/**
 * Validate a single cell
 */
function validateCell(cell: unknown): DesignerCell | null {
  if (!cell || typeof cell !== 'object') return null;

  const c = cell as Record<string, unknown>;

  // Validate modifier
  if (!isValidModifier(c.modifier)) return null;

  // Validate gem (can be null or a valid gem type)
  if (c.gem !== null && !isValidGemType(c.gem)) return null;

  return {
    modifier: c.modifier,
    gem: c.gem as GemType | null,
  };
}

/**
 * Validate a single objective
 */
function validateObjective(obj: unknown): Objective | null {
  if (!obj || typeof obj !== 'object') return null;

  const o = obj as Record<string, unknown>;

  // Validate type
  if (!isValidObjectiveType(o.type)) return null;

  // Validate target
  const target = validateNumber(o.target, CONSTRAINTS.objectiveTarget.min, CONSTRAINTS.objectiveTarget.max);
  if (target === null) return null;

  // Validate gemType for collect_gems objectives
  if (o.type === 'collect_gems') {
    if (!isValidGemType(o.gemType)) return null;
    return { type: o.type, target, gemType: o.gemType };
  }

  return { type: o.type, target };
}

/**
 * Validate the grid structure and contents
 */
function validateGrid(grid: unknown, rows: number, cols: number): DesignerCell[][] | null {
  if (!Array.isArray(grid)) return null;
  if (grid.length !== rows) return null;

  const validatedGrid: DesignerCell[][] = [];

  for (let r = 0; r < rows; r++) {
    if (!Array.isArray(grid[r]) || grid[r].length !== cols) return null;

    const validatedRow: DesignerCell[] = [];
    for (let c = 0; c < cols; c++) {
      const cell = validateCell(grid[r][c]);
      if (cell === null) return null;
      validatedRow.push(cell);
    }
    validatedGrid.push(validatedRow);
  }

  return validatedGrid;
}

/**
 * Main validation function for submitted levels
 */
export function validateLevel(input: unknown): ValidationResult {
  const errors: string[] = [];

  // Check basic structure
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Invalid level data: not an object'] };
  }

  const level = input as Record<string, unknown>;

  // Validate and sanitize name
  const name = sanitizeString(level.name, CONSTRAINTS.name.maxLength);
  if (name.length < CONSTRAINTS.name.minLength) {
    errors.push(`Name must be at least ${CONSTRAINTS.name.minLength} characters`);
  }

  // Validate and sanitize description
  const description = sanitizeString(level.description, CONSTRAINTS.description.maxLength);

  // Validate rows
  const rows = validateNumber(level.rows, CONSTRAINTS.rows.min, CONSTRAINTS.rows.max);
  if (rows === null) {
    errors.push(`Rows must be between ${CONSTRAINTS.rows.min} and ${CONSTRAINTS.rows.max}`);
  }

  // Validate cols
  const cols = validateNumber(level.cols, CONSTRAINTS.cols.min, CONSTRAINTS.cols.max);
  if (cols === null) {
    errors.push(`Columns must be between ${CONSTRAINTS.cols.min} and ${CONSTRAINTS.cols.max}`);
  }

  // Validate maxMoves
  const maxMoves = validateNumber(level.maxMoves, CONSTRAINTS.maxMoves.min, CONSTRAINTS.maxMoves.max);
  if (maxMoves === null) {
    errors.push(`Max moves must be between ${CONSTRAINTS.maxMoves.min} and ${CONSTRAINTS.maxMoves.max}`);
  }

  // Validate starThresholds
  let starThresholds: [number, number, number] | null = null;
  if (Array.isArray(level.starThresholds) && level.starThresholds.length === 3) {
    const [s1, s2, s3] = level.starThresholds;
    const v1 = validateNumber(s1, CONSTRAINTS.starThresholds.min, CONSTRAINTS.starThresholds.max);
    const v2 = validateNumber(s2, CONSTRAINTS.starThresholds.min, CONSTRAINTS.starThresholds.max);
    const v3 = validateNumber(s3, CONSTRAINTS.starThresholds.min, CONSTRAINTS.starThresholds.max);

    if (v1 !== null && v2 !== null && v3 !== null && v1 <= v2 && v2 <= v3) {
      starThresholds = [v1, v2, v3];
    } else {
      errors.push('Star thresholds must be 3 ascending numbers');
    }
  } else {
    errors.push('Star thresholds must be an array of 3 numbers');
  }

  // Validate availableGems
  let availableGems: GemType[] = [];
  if (Array.isArray(level.availableGems)) {
    availableGems = level.availableGems.filter(isValidGemType);
    // Remove duplicates
    availableGems = [...new Set(availableGems)];

    if (availableGems.length < CONSTRAINTS.availableGems.min) {
      errors.push(`Must have at least ${CONSTRAINTS.availableGems.min} gem types`);
    }
    if (availableGems.length > CONSTRAINTS.availableGems.max) {
      errors.push(`Cannot have more than ${CONSTRAINTS.availableGems.max} gem types`);
    }
  } else {
    errors.push('Available gems must be an array');
  }

  // Validate objectives
  let objectives: Objective[] = [];
  if (Array.isArray(level.objectives)) {
    for (const obj of level.objectives) {
      const validated = validateObjective(obj);
      if (validated) {
        // Check that collect_gems objectives reference available gems
        if (validated.type === 'collect_gems' && validated.gemType) {
          if (!availableGems.includes(validated.gemType)) {
            errors.push(`Objective references unavailable gem type: ${validated.gemType}`);
            continue;
          }
        }
        objectives.push(validated);
      }
    }

    if (objectives.length < CONSTRAINTS.objectives.min) {
      errors.push(`Must have at least ${CONSTRAINTS.objectives.min} objective`);
    }
    if (objectives.length > CONSTRAINTS.objectives.max) {
      errors.push(`Cannot have more than ${CONSTRAINTS.objectives.max} objectives`);
    }
  } else {
    errors.push('Objectives must be an array');
  }

  // Validate grid (only if rows/cols are valid)
  let grid: DesignerCell[][] | null = null;
  if (rows !== null && cols !== null) {
    grid = validateGrid(level.grid, rows, cols);
    if (grid === null) {
      errors.push('Grid structure is invalid');
    }
  }

  // Return validation result
  if (errors.length > 0 || rows === null || cols === null || maxMoves === null ||
      starThresholds === null || grid === null) {
    return { valid: false, errors };
  }

  const sanitized: DesignerLevel = {
    name,
    description,
    rows,
    cols,
    grid,
    availableGems,
    objectives,
    maxMoves,
    starThresholds,
  };

  return { valid: true, errors: [], sanitized };
}

/**
 * Validate a level ID format
 */
export function isValidLevelId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  // IDs should match the format: sub_<timestamp>_<random>
  return /^sub_\d+_[a-z0-9]+$/.test(id);
}
