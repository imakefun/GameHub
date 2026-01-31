import { useReducer, useCallback, useRef, useEffect } from 'react';
import type {
  GameState, GameAction, Position, PowerUpType, ObjectiveProgress,
  ClearedInfo, Level, DesignerLevel,
} from '../types';
import { LEVELS, DEFAULT_POWERUPS } from '../data';
import {
  createGrid, executeSwap, isValidSwap, processBoard, findBestMove,
  hasValidMoves, shuffleBoard, applyPowerUp, checkObjectives, cloneGrid,
} from '../engine/matchEngine';

const STORAGE_KEY = 'gem-miner-save';

// ============================================================
// Persistence
// ============================================================

interface SaveData {
  levelStars: Record<number, number>;
  powerUps: Record<PowerUpType, number>;
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { levelStars: {}, powerUps: { ...DEFAULT_POWERUPS } };
}

function saveToDisk(state: GameState): void {
  const data: SaveData = {
    levelStars: state.levelStars,
    powerUps: state.powerUps,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ============================================================
// Initial State
// ============================================================

function createInitialState(): GameState {
  const save = loadSave();
  return {
    screen: 'levelSelect',
    grid: [],
    selectedCell: null,
    activePowerUp: null,
    currentLevel: 1,
    movesRemaining: 0,
    score: 0,
    objectives: [],
    powerUps: save.powerUps,
    levelStars: save.levelStars,
    animationPhase: 'idle',
    combo: 0,
    isProcessing: false,
    levelResult: 'none',
    hintCells: [],
    matchedCells: [],
    lastSwap: null,
  };
}

function initLevel(state: GameState, level: Level): GameState {
  const grid = createGrid(level);
  const objectives: ObjectiveProgress[] = level.objectives.map(obj => ({
    ...obj,
    current: 0,
  }));

  return {
    ...state,
    screen: 'playing',
    grid,
    selectedCell: null,
    activePowerUp: null,
    currentLevel: level.id,
    movesRemaining: level.maxMoves,
    score: 0,
    objectives,
    animationPhase: 'idle',
    combo: 0,
    isProcessing: false,
    levelResult: 'none',
    hintCells: [],
    matchedCells: [],
    lastSwap: null,
  };
}

// ============================================================
// Reducer
// ============================================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'START_LEVEL': {
      const level = LEVELS.find(l => l.id === action.level);
      if (!level) return state;
      return initLevel(state, level);
    }

    case 'SET_GRID':
      return { ...state, grid: action.grid };

    case 'SELECT_CELL':
      return { ...state, selectedCell: action.position, hintCells: [] };

    case 'CLEAR_SELECTION':
      return { ...state, selectedCell: null };

    case 'ACTIVATE_POWERUP':
      return { ...state, activePowerUp: action.powerUp, selectedCell: null };

    case 'DEACTIVATE_POWERUP':
      return { ...state, activePowerUp: null };

    case 'USE_POWERUP': {
      const count = state.powerUps[action.powerUp];
      if (count <= 0) return state;
      return {
        ...state,
        powerUps: { ...state.powerUps, [action.powerUp]: count - 1 },
        activePowerUp: null,
      };
    }

    case 'SWAP_GEMS':
      return {
        ...state,
        lastSwap: { from: action.from, to: action.to },
        selectedCell: null,
        hintCells: [],
      };

    case 'SET_ANIMATION_PHASE':
      return { ...state, animationPhase: action.phase };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };

    case 'ADD_SCORE':
      return { ...state, score: state.score + action.points };

    case 'DECREMENT_MOVES':
      return { ...state, movesRemaining: Math.max(0, state.movesRemaining - 1) };

    case 'UPDATE_OBJECTIVES': {
      const newObjectives = state.objectives.map(obj => {
        const updated = { ...obj };
        if (obj.type === 'score') {
          updated.current = state.score + action.cleared.score;
        } else if (obj.type === 'collect_gems' && obj.gemType) {
          updated.current = obj.current + (action.cleared.gemsCleared[obj.gemType] || 0);
        } else if (obj.type === 'clear_rocks') {
          updated.current = obj.current + action.cleared.rocksDestroyed;
        } else if (obj.type === 'clear_ice') {
          updated.current = obj.current + action.cleared.iceDestroyed;
        } else if (obj.type === 'clear_dirt') {
          updated.current = obj.current + action.cleared.dirtCleared;
        }
        return updated;
      });
      return { ...state, objectives: newObjectives };
    }

    case 'SET_COMBO':
      return { ...state, combo: action.combo };

    case 'SET_LEVEL_RESULT':
      return { ...state, levelResult: action.result };

    case 'SET_LEVEL_STARS': {
      const current = state.levelStars[action.level] || 0;
      return {
        ...state,
        levelStars: {
          ...state.levelStars,
          [action.level]: Math.max(current, action.stars),
        },
      };
    }

    case 'SET_HINT':
      return { ...state, hintCells: action.cells };

    case 'SET_MATCHED_CELLS':
      return { ...state, matchedCells: action.cells };

    case 'SET_LAST_SWAP':
      return { ...state, lastSwap: action.swap };

    case 'RESET_LEVEL': {
      const level = LEVELS.find(l => l.id === state.currentLevel);
      if (!level) return state;
      return initLevel(state, level);
    }

    case 'LOAD_DESIGNER_LEVEL': {
      const dl = action.level;
      const customLevel: Level = {
        id: 999,
        name: dl.name || 'Custom Level',
        description: dl.description || 'A custom designed level',
        depth: 0,
        layout: {
          rows: dl.rows,
          cols: dl.cols,
          cells: dl.grid.map(row => row.map(cell => ({
            modifier: cell.modifier,
          }))),
        },
        availableGems: dl.availableGems,
        objectives: dl.objectives,
        maxMoves: dl.maxMoves,
        starThresholds: dl.starThresholds,
        rewards: [],
      };
      return initLevel(state, customLevel);
    }

    case 'ADD_POWERUP_REWARD': {
      return {
        ...state,
        powerUps: {
          ...state.powerUps,
          [action.powerUp]: (state.powerUps[action.powerUp] || 0) + action.count,
        },
      };
    }

    default:
      return state;
  }
}

// ============================================================
// Hook
// ============================================================

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const processingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Save on changes to persistent data
  useEffect(() => {
    saveToDisk(state);
  }, [state.levelStars, state.powerUps]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutRef.current.push(t);
    return t;
  }, []);

  // --- Actions ---

  const startLevel = useCallback((levelId: number) => {
    dispatch({ type: 'START_LEVEL', level: levelId });
  }, []);

  const goToLevelSelect = useCallback(() => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
    processingRef.current = false;
    dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' });
  }, []);

  const goToDesigner = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'designer' });
  }, []);

  const handleCellClick = useCallback((pos: Position) => {
    if (processingRef.current) return;

    // If a power-up is active, apply it
    if (state.activePowerUp) {
      const powerUp = state.activePowerUp;

      if (powerUp === 'lantern') {
        // Show hint
        dispatch({ type: 'USE_POWERUP', powerUp });
        const move = findBestMove(state.grid);
        if (move) {
          dispatch({ type: 'SET_HINT', cells: [move.from, move.to] });
          schedule(() => dispatch({ type: 'SET_HINT', cells: [] }), 3000);
        }
        return;
      }

      if (powerUp === 'earthquake') {
        dispatch({ type: 'USE_POWERUP', powerUp });
        const level = LEVELS.find(l => l.id === state.currentLevel);
        const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];
        const newGrid = shuffleBoard(state.grid, gems);
        dispatch({ type: 'SET_GRID', grid: newGrid });
        return;
      }

      // Target-based power-ups
      dispatch({ type: 'USE_POWERUP', powerUp });
      processingRef.current = true;
      dispatch({ type: 'SET_PROCESSING', isProcessing: true });

      const level = LEVELS.find(l => l.id === state.currentLevel);
      const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];

      const { grid: newGrid, cleared } = applyPowerUp(state.grid, powerUp, pos, gems);
      dispatch({ type: 'ADD_SCORE', points: cleared.score });
      dispatch({ type: 'UPDATE_OBJECTIVES', cleared });
      dispatch({ type: 'SET_GRID', grid: newGrid });

      // Process cascades
      schedule(() => {
        const result = processBoard(newGrid, gems);
        if (result.cascadeCount > 0) {
          dispatch({ type: 'ADD_SCORE', points: result.totalCleared.score });
          dispatch({ type: 'UPDATE_OBJECTIVES', cleared: result.totalCleared });
          dispatch({ type: 'SET_GRID', grid: result.grid });
        }

        schedule(() => {
          processingRef.current = false;
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
          // Check win/lose
          checkEndCondition(state.score + cleared.score + result.totalCleared.score, state.movesRemaining);
        }, 200);
      }, 300);

      return;
    }

    // Normal cell selection / swap
    if (!state.selectedCell) {
      // Select the cell
      const cell = state.grid[pos.row]?.[pos.col];
      if (!cell || cell.modifier === 'bedrock' || cell.gem === null) return;
      dispatch({ type: 'SELECT_CELL', position: pos });
      return;
    }

    // Same cell - deselect
    if (state.selectedCell.row === pos.row && state.selectedCell.col === pos.col) {
      dispatch({ type: 'CLEAR_SELECTION' });
      return;
    }

    // Try to swap
    const from = state.selectedCell;
    const to = pos;

    if (!isValidSwap(state.grid, from, to)) {
      // Not a valid swap - select the new cell instead
      const cell = state.grid[pos.row]?.[pos.col];
      if (cell && cell.modifier !== 'bedrock' && cell.gem !== null) {
        dispatch({ type: 'SELECT_CELL', position: pos });
      } else {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
      return;
    }

    // Execute swap
    processingRef.current = true;
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    dispatch({ type: 'SWAP_GEMS', from, to });
    dispatch({ type: 'DECREMENT_MOVES' });

    const swappedGrid = executeSwap(cloneGrid(state.grid), from, to);
    dispatch({ type: 'SET_GRID', grid: swappedGrid });

    const level = LEVELS.find(l => l.id === state.currentLevel);
    const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];

    // Process matches with cascade
    schedule(() => {
      const result = processBoard(swappedGrid, gems);

      if (result.cascadeCount > 0) {
        dispatch({ type: 'SET_COMBO', combo: result.cascadeCount });
        dispatch({ type: 'ADD_SCORE', points: result.totalCleared.score });
        dispatch({ type: 'UPDATE_OBJECTIVES', cleared: result.totalCleared });

        // Animate matched cells for each cascade step
        if (result.allMatchedCells.length > 0) {
          dispatch({ type: 'SET_MATCHED_CELLS', cells: result.allMatchedCells[0] });
        }
      }

      schedule(() => {
        dispatch({ type: 'SET_GRID', grid: result.grid });
        dispatch({ type: 'SET_MATCHED_CELLS', cells: [] });
        dispatch({ type: 'SET_COMBO', combo: 0 });

        // Ensure board has valid moves
        let finalGrid = result.grid;
        if (!hasValidMoves(finalGrid)) {
          finalGrid = shuffleBoard(finalGrid, gems);
          dispatch({ type: 'SET_GRID', grid: finalGrid });
        }

        schedule(() => {
          processingRef.current = false;
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
          dispatch({ type: 'SET_LAST_SWAP', swap: null });

          // Check win/lose after the move resolves
          const newScore = state.score + result.totalCleared.score;
          const newMoves = state.movesRemaining - 1;
          checkEndConditionFromState(newScore, newMoves, result.totalCleared);
        }, 150);
      }, 350);
    }, 250);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.grid, state.selectedCell, state.activePowerUp, state.currentLevel, state.score, state.movesRemaining, state.objectives]);

  const checkEndCondition = useCallback((totalScore: number, movesLeft: number) => {
    // Re-read objectives from state to get latest
    const objectivesMet = checkObjectives(state.objectives);

    if (objectivesMet) {
      // Win!
      const level = LEVELS.find(l => l.id === state.currentLevel);
      if (level) {
        const stars = totalScore >= level.starThresholds[2] ? 3
          : totalScore >= level.starThresholds[1] ? 2
          : totalScore >= level.starThresholds[0] ? 1 : 1;
        dispatch({ type: 'SET_LEVEL_STARS', level: level.id, stars });

        // Award rewards
        for (const reward of level.rewards) {
          if (reward.powerUp && reward.count) {
            dispatch({ type: 'ADD_POWERUP_REWARD', powerUp: reward.powerUp, count: reward.count });
          }
        }
      }
      dispatch({ type: 'SET_LEVEL_RESULT', result: 'win' });
    } else if (movesLeft <= 0) {
      dispatch({ type: 'SET_LEVEL_RESULT', result: 'lose' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.objectives, state.currentLevel]);

  const checkEndConditionFromState = useCallback((totalScore: number, movesLeft: number, lastCleared: ClearedInfo) => {
    // Check with the updated objectives
    const updatedObjectives = state.objectives.map(obj => {
      const updated = { ...obj };
      if (obj.type === 'score') {
        updated.current = totalScore;
      } else if (obj.type === 'collect_gems' && obj.gemType) {
        updated.current = obj.current + (lastCleared.gemsCleared[obj.gemType] || 0);
      } else if (obj.type === 'clear_rocks') {
        updated.current = obj.current + lastCleared.rocksDestroyed;
      } else if (obj.type === 'clear_ice') {
        updated.current = obj.current + lastCleared.iceDestroyed;
      } else if (obj.type === 'clear_dirt') {
        updated.current = obj.current + lastCleared.dirtCleared;
      }
      return updated;
    });

    const objectivesMet = checkObjectives(updatedObjectives);

    if (objectivesMet) {
      const level = LEVELS.find(l => l.id === state.currentLevel);
      if (level) {
        const stars = totalScore >= level.starThresholds[2] ? 3
          : totalScore >= level.starThresholds[1] ? 2
          : totalScore >= level.starThresholds[0] ? 1 : 1;
        dispatch({ type: 'SET_LEVEL_STARS', level: level.id, stars });

        for (const reward of level.rewards) {
          if (reward.powerUp && reward.count) {
            dispatch({ type: 'ADD_POWERUP_REWARD', powerUp: reward.powerUp, count: reward.count });
          }
        }
      }
      dispatch({ type: 'SET_LEVEL_RESULT', result: 'win' });
    } else if (movesLeft <= 0) {
      dispatch({ type: 'SET_LEVEL_RESULT', result: 'lose' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.objectives, state.currentLevel]);

  const activatePowerUp = useCallback((powerUp: PowerUpType) => {
    if (state.powerUps[powerUp] <= 0) return;

    if (state.activePowerUp === powerUp) {
      dispatch({ type: 'DEACTIVATE_POWERUP' });
      return;
    }

    dispatch({ type: 'ACTIVATE_POWERUP', powerUp });

    // Non-target power-ups activate immediately
    if (powerUp === 'earthquake') {
      dispatch({ type: 'USE_POWERUP', powerUp });
      const level = LEVELS.find(l => l.id === state.currentLevel);
      const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];
      const newGrid = shuffleBoard(state.grid, gems);
      dispatch({ type: 'SET_GRID', grid: newGrid });
      dispatch({ type: 'DEACTIVATE_POWERUP' });
    } else if (powerUp === 'lantern') {
      dispatch({ type: 'USE_POWERUP', powerUp });
      const move = findBestMove(state.grid);
      if (move) {
        dispatch({ type: 'SET_HINT', cells: [move.from, move.to] });
        schedule(() => dispatch({ type: 'SET_HINT', cells: [] }), 3000);
      }
      dispatch({ type: 'DEACTIVATE_POWERUP' });
    }
  }, [state.powerUps, state.activePowerUp, state.grid, state.currentLevel, schedule]);

  const resetLevel = useCallback(() => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
    processingRef.current = false;
    dispatch({ type: 'RESET_LEVEL' });
  }, []);

  const playDesignerLevel = useCallback((level: DesignerLevel) => {
    dispatch({ type: 'LOAD_DESIGNER_LEVEL', level });
  }, []);

  const nextLevel = useCallback(() => {
    const nextId = state.currentLevel + 1;
    const level = LEVELS.find(l => l.id === nextId);
    if (level) {
      startLevel(nextId);
    } else {
      goToLevelSelect();
    }
  }, [state.currentLevel, startLevel, goToLevelSelect]);

  return {
    state,
    dispatch,
    startLevel,
    goToLevelSelect,
    goToDesigner,
    handleCellClick,
    activatePowerUp,
    resetLevel,
    playDesignerLevel,
    nextLevel,
  };
}
