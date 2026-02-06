import { useReducer, useCallback, useRef, useEffect, useState } from 'react';
import type {
  GameState, GameAction, Position, PowerUpType, ObjectiveProgress,
  ClearedInfo, Level, DesignerLevel, Grid, GemType,
} from '../types';
import { LEVELS, DEFAULT_POWERUPS } from '../data';
import { submitLevel as submitLevelApi, SubmissionError } from '../data/submittedLevels';
import {
  createGrid, executeSwap, isValidSwap, canAttemptSwap, findMatches, clearMatches,
  applyGravity, refillGrid, emptyClearedInfo, mergeClearedInfo,
  findBestMove, hasValidMoves, shuffleBoard,
  applyPowerUp, checkObjectives, cloneGrid,
} from '../engine/matchEngine';
import { soundEngine } from '../systems/SoundEngine';

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
      const newState = initLevel(state, customLevel);
      // Store the source screen for returning after test
      return { ...newState, testSource: action.source || 'designer' } as GameState;
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
  const [lastScore, setLastScore] = useState(0);
  const [failedSwap, setFailedSwap] = useState<{ from: Position; to: Position } | null>(null);

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

  // Helper: clear existing board gems, wait for the visual clear, then run action.
  // On level change / restart this gives a visible "wipe → fresh board" transition.
  const clearAndRun = useCallback((action: () => void) => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
    processingRef.current = false;

    if (state.grid.length > 0) {
      const clearedGrid: Grid = state.grid.map(row =>
        row.map(cell => ({ ...cell, gem: null, gemId: '', special: 'none' as const }))
      );
      dispatch({ type: 'SET_GRID', grid: clearedGrid });
      schedule(() => action(), 300);
    } else {
      action();
    }
  }, [state.grid, schedule]);

  const startLevel = useCallback((levelId: number) => {
    clearAndRun(() => {
      dispatch({ type: 'START_LEVEL', level: levelId });
      setLastScore(0);
      soundEngine.play('levelStart');
      soundEngine.startMusic();
    });
  }, [clearAndRun]);

  const goToLevelSelect = useCallback(() => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
    processingRef.current = false;
    soundEngine.stopMusic();
    dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' });
  }, []);

  const goToDesigner = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'designer' });
  }, []);

  const goToSubmittedLevels = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'submittedLevels' });
  }, []);

  const submitLevel = useCallback(async (level: DesignerLevel): Promise<{ success: boolean; error?: string; details?: string[] }> => {
    try {
      await submitLevelApi(level);
      return { success: true };
    } catch (err) {
      if (err instanceof SubmissionError) {
        return { success: false, error: err.message, details: err.details };
      }
      return { success: false, error: 'Failed to submit level. Please try again.' };
    }
  }, []);

  const checkEndCondition = useCallback((totalScore: number, movesLeft: number) => {
    const objectivesMet = checkObjectives(state.objectives);

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

  const checkEndConditionFromState = useCallback((totalScore: number, movesLeft: number, lastCleared: ClearedInfo) => {
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

  // Step-by-step cascade: find matches → highlight → clear → gravity → repeat
  // Each step is rendered so gravity drops and chain reactions are visible.
  const runCascade = useCallback((
    startGrid: Grid,
    gems: GemType[],
    onComplete: (totalCleared: ClearedInfo, finalGrid: Grid) => void,
  ) => {
    let cascadeCount = 0;
    let totalCleared = emptyClearedInfo();
    let currentGrid = startGrid;

    const step = () => {
      const matches = findMatches(currentGrid);

      if (matches.length === 0) {
        // No more matches — cascade is done
        dispatch({ type: 'SET_COMBO', combo: 0 });

        let finalGrid = currentGrid;
        if (!hasValidMoves(finalGrid)) {
          finalGrid = shuffleBoard(finalGrid, gems);
          dispatch({ type: 'SET_GRID', grid: finalGrid });
        }

        schedule(() => onComplete(totalCleared, finalGrid), 120);
        return;
      }

      cascadeCount++;
      dispatch({ type: 'SET_COMBO', combo: cascadeCount });

      // Show matched cells
      const matchedPositions = matches.flatMap(m => m.cells);
      dispatch({ type: 'SET_MATCHED_CELLS', cells: matchedPositions });

      // Play sounds
      if (cascadeCount >= 3) soundEngine.play('matchSuper');
      else if (cascadeCount >= 2) { soundEngine.play('matchBig'); soundEngine.play('cascade'); }
      else soundEngine.play('match');
      if (cascadeCount >= 2) soundEngine.play('combo');

      // Progressive speedup: each successive cascade has shorter delays
      // Industry standard: ~200-250ms per phase, speed up slightly with combos
      const matchDelay = Math.max(150, 220 - (cascadeCount - 1) * 20);
      const gravityDelay = Math.max(180, 280 - (cascadeCount - 1) * 25);

      // Wait for match highlight animation to play out
      schedule(() => {
        const { grid: clearedGrid, cleared } = clearMatches(currentGrid, matches);

        const multiplier = 1 + (cascadeCount - 1) * 0.5;
        cleared.score = Math.round(cleared.score * multiplier);
        totalCleared = mergeClearedInfo(totalCleared, cleared);

        dispatch({ type: 'ADD_SCORE', points: cleared.score });
        dispatch({ type: 'UPDATE_OBJECTIVES', cleared });
        setLastScore(cleared.score);

        if (cleared.rocksDestroyed > 0) soundEngine.play('rockBreak');
        if (cleared.iceDestroyed > 0) soundEngine.play('iceBreak');
        if (cleared.dirtCleared > 0) soundEngine.play('dirtClear');

        // Apply gravity and refill — triggers the visible drop animation
        const gravityGrid = applyGravity(clearedGrid);
        currentGrid = refillGrid(gravityGrid, gems);

        dispatch({ type: 'SET_GRID', grid: currentGrid });
        dispatch({ type: 'SET_MATCHED_CELLS', cells: [] });

        // Wait for gravity drop spring animation to fully settle
        schedule(() => step(), gravityDelay);
      }, matchDelay);
    };

    step();
  }, [schedule]);

  // Internal: execute a validated swap between two adjacent cells and process cascades
  const performSwap = useCallback((from: Position, to: Position) => {
    soundEngine.play('swap');
    processingRef.current = true;
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    dispatch({ type: 'SWAP_GEMS', from, to });
    dispatch({ type: 'DECREMENT_MOVES' });

    const swappedGrid = executeSwap(cloneGrid(state.grid), from, to);
    dispatch({ type: 'SET_GRID', grid: swappedGrid });

    const level = LEVELS.find(l => l.id === state.currentLevel);
    const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];

    // Wait for swap animation to finish, then start cascade
    // Industry standard swap duration is ~250ms
    schedule(() => {
      runCascade(swappedGrid, gems, (totalCleared) => {
        processingRef.current = false;
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        dispatch({ type: 'SET_LAST_SWAP', swap: null });

        const newScore = state.score + totalCleared.score;
        const newMoves = state.movesRemaining - 1;
        checkEndConditionFromState(newScore, newMoves, totalCleared);
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.grid, state.currentLevel, state.score, state.movesRemaining, schedule, runCascade, checkEndConditionFromState]);

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

      // Play power-up specific sounds
      if (powerUp === 'dynamite') soundEngine.play('powerUpDynamite');
      else if (powerUp === 'drill') soundEngine.play('powerUpDrill');
      else soundEngine.play('powerUpUse');

      const level = LEVELS.find(l => l.id === state.currentLevel);
      const gems = level?.availableGems || ['ruby', 'sapphire', 'emerald', 'topaz'];

      const { grid: newGrid, cleared } = applyPowerUp(state.grid, powerUp, pos, gems);
      dispatch({ type: 'ADD_SCORE', points: cleared.score });
      dispatch({ type: 'UPDATE_OBJECTIVES', cleared });
      dispatch({ type: 'SET_GRID', grid: newGrid });
      setLastScore(cleared.score);

      // Process cascades after power-up effect settles
      schedule(() => {
        runCascade(newGrid, gems, (cascadeCleared) => {
          processingRef.current = false;
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
          checkEndCondition(state.score + cleared.score + cascadeCleared.score, state.movesRemaining);
        });
      }, 150);

      return;
    }

    // Normal cell selection / swap
    if (!state.selectedCell) {
      // Select the cell
      const cell = state.grid[pos.row]?.[pos.col];
      if (!cell || cell.modifier === 'bedrock' || cell.gem === null) return;
      soundEngine.play('select');
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

    // Check if cells are adjacent and can be swapped
    if (!canAttemptSwap(state.grid, from, to)) {
      // Not adjacent - select the new cell instead
      const cell = state.grid[pos.row]?.[pos.col];
      if (cell && cell.modifier !== 'bedrock' && cell.gem !== null) {
        soundEngine.play('select');
        dispatch({ type: 'SELECT_CELL', position: pos });
      } else {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
      return;
    }

    // Adjacent cells - attempt the swap
    if (!isValidSwap(state.grid, from, to)) {
      // Adjacent but won't create matches - do failed swap animation
      soundEngine.play('swap');
      dispatch({ type: 'CLEAR_SELECTION' });
      processingRef.current = true;
      dispatch({ type: 'SET_PROCESSING', isProcessing: true });

      // Swap visually
      const swappedGrid = executeSwap(cloneGrid(state.grid), from, to);
      dispatch({ type: 'SET_GRID', grid: swappedGrid });

      // After short delay, swap back with shake
      schedule(() => {
        soundEngine.play('badSwap');
        setFailedSwap({ from, to });
        const originalGrid = executeSwap(cloneGrid(swappedGrid), from, to);
        dispatch({ type: 'SET_GRID', grid: originalGrid });

        // Clear failed swap state after animation
        schedule(() => {
          setFailedSwap(null);
          processingRef.current = false;
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        }, 200);
      }, 120);
      return;
    }

    // Execute valid swap
    performSwap(from, to);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.grid, state.selectedCell, state.activePowerUp, state.currentLevel, state.score, state.movesRemaining, state.objectives, performSwap]);

  // Direct swap handler for swipe gestures (bypasses cell selection)
  const handleSwap = useCallback((from: Position, to: Position) => {
    if (processingRef.current) return;
    if (state.activePowerUp) return;

    const fromCell = state.grid[from.row]?.[from.col];
    const toCell = state.grid[to.row]?.[to.col];
    if (!fromCell?.gem || !toCell?.gem) return;
    if (fromCell.modifier === 'bedrock' || toCell.modifier === 'bedrock') return;

    if (!canAttemptSwap(state.grid, from, to)) {
      return;
    }

    if (!isValidSwap(state.grid, from, to)) {
      // Adjacent but won't create matches - do failed swap animation
      soundEngine.play('swap');
      dispatch({ type: 'CLEAR_SELECTION' });
      processingRef.current = true;
      dispatch({ type: 'SET_PROCESSING', isProcessing: true });

      // Swap visually
      const swappedGrid = executeSwap(cloneGrid(state.grid), from, to);
      dispatch({ type: 'SET_GRID', grid: swappedGrid });

      // After short delay, swap back with shake
      schedule(() => {
        soundEngine.play('badSwap');
        setFailedSwap({ from, to });
        const originalGrid = executeSwap(cloneGrid(swappedGrid), from, to);
        dispatch({ type: 'SET_GRID', grid: originalGrid });

        // Clear failed swap state after animation
        schedule(() => {
          setFailedSwap(null);
          processingRef.current = false;
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        }, 200);
      }, 120);
      return;
    }

    dispatch({ type: 'CLEAR_SELECTION' });
    performSwap(from, to);
  }, [state.grid, state.activePowerUp, performSwap, schedule]);

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
    clearAndRun(() => {
      dispatch({ type: 'RESET_LEVEL' });
      setLastScore(0);
      soundEngine.play('levelStart');
      soundEngine.startMusic();
    });
  }, [clearAndRun]);

  const playDesignerLevel = useCallback((level: DesignerLevel, source: 'designer' | 'submittedLevels' = 'designer') => {
    clearAndRun(() => {
      dispatch({ type: 'LOAD_DESIGNER_LEVEL', level, source });
      setLastScore(0);
      soundEngine.play('levelStart');
      soundEngine.startMusic();
    });
  }, [clearAndRun]);

  const returnFromTest = useCallback(() => {
    // Return to the screen we came from when testing
    const source = state.testSource || 'designer';
    dispatch({ type: 'SET_SCREEN', screen: source });
  }, [state.testSource]);

  const nextLevel = useCallback(() => {
    const nextId = state.currentLevel + 1;
    const level = LEVELS.find(l => l.id === nextId);
    if (level) {
      startLevel(nextId);
    } else {
      goToLevelSelect();
    }
  }, [state.currentLevel, startLevel, goToLevelSelect]);

  // Check if we're in test mode (playing a custom level)
  const isTestMode = state.currentLevel === 999;

  return {
    state,
    lastScore,
    failedSwap,
    isTestMode,
    dispatch,
    startLevel,
    goToLevelSelect,
    goToDesigner,
    goToSubmittedLevels,
    submitLevel,
    handleCellClick,
    handleSwap,
    activatePowerUp,
    resetLevel,
    playDesignerLevel,
    returnFromTest,
    nextLevel,
  };
}
