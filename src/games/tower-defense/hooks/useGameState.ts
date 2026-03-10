import { useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  GameState, GameAction, Screen, TowerId, EditorState,
  GridCell, PathPoint, LevelDef, EditorTool, WorldTheme, WaveGroup,
} from '../types';
import { getLevelById, getTowerDef, getTowerUpgradeCost, getTowerSellValue } from '../data';
import { buildSpawnQueue, nextId, tick, calculateStars } from '../engine/gameEngine';

// ============================================================
// Local storage
// ============================================================

const SAVE_KEY = 'td-game-save';

function loadSave(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveToDisk(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      levelStars: state.levelStars,
      totalStarsEarned: state.totalStarsEarned,
      customLevels: state.customLevels,
      sfxEnabled: state.sfxEnabled,
      musicEnabled: state.musicEnabled,
      showRanges: state.showRanges,
    }));
  } catch { /* ignore */ }
}

// ============================================================
// Initial state
// ============================================================

function createInitialState(): GameState {
  const saved = loadSave();
  return {
    screen: 'title',
    selectedWorld: 1,
    levelStars: saved.levelStars ?? {},
    totalStarsEarned: saved.totalStarsEarned ?? 0,
    currentLevelId: null,
    gold: 0,
    lives: 0,
    maxLives: 0,
    score: 0,
    waveIndex: 0,
    waveActive: false,
    allWavesSpawned: false,
    towers: [],
    enemies: [],
    projectiles: [],
    selectedTowerInstanceId: null,
    placingTowerId: null,
    isPaused: false,
    gameSpeed: 1,
    gameResult: null,
    starsEarned: 0,
    spawnQueue: [],
    gameTime: 0,
    floatingTexts: [],
    editorState: null,
    customLevels: saved.customLevels ?? [],
    sfxEnabled: saved.sfxEnabled ?? true,
    musicEnabled: saved.musicEnabled ?? true,
    showRanges: saved.showRanges ?? true,
  };
}

// ============================================================
// Editor helpers
// ============================================================

function createBlankEditorState(rows = 9, cols = 8): EditorState {
  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({ row: r, col: c, type: 'buildable' });
    }
    grid.push(row);
  }
  return {
    name: 'Custom Level',
    rows, cols, grid,
    path: [],
    waves: [{ groups: [{ enemyId: 'slime', count: 5, interval: 1000, delay: 0 }] }],
    startGold: 150,
    startLives: 20,
    theme: 'forest',
    selectedTool: 'path',
    testMode: false,
  };
}

function editorStateFromLevel(level: LevelDef): EditorState {
  return {
    name: level.name,
    rows: level.rows,
    cols: level.cols,
    grid: level.grid.map(row => row.map(cell => ({ ...cell }))),
    path: [...level.path],
    waves: level.waves.map(w => ({ groups: w.groups.map(g => ({ ...g })) })),
    startGold: level.startGold,
    startLives: level.startLives,
    theme: level.theme,
    selectedTool: 'path',
    testMode: false,
  };
}

function recalculatePath(grid: GridCell[][]): PathPoint[] {
  // Find start
  let start: PathPoint | null = null;
  let end: PathPoint | null = null;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.type === 'start') start = { row: cell.row, col: cell.col };
      if (cell.type === 'end') end = { row: cell.row, col: cell.col };
    }
  }
  if (!start || !end) return [];

  // BFS to find path from start to end through path cells
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const queue: { point: PathPoint; path: PathPoint[] }[] = [{ point: start, path: [start] }];
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { point, path } = current;

    if (point.row === end.row && point.col === end.col) {
      return path;
    }

    const neighbors = [
      { row: point.row - 1, col: point.col },
      { row: point.row + 1, col: point.col },
      { row: point.row, col: point.col - 1 },
      { row: point.row, col: point.col + 1 },
    ];

    for (const n of neighbors) {
      if (n.row < 0 || n.row >= rows || n.col < 0 || n.col >= cols) continue;
      const key = `${n.row},${n.col}`;
      if (visited.has(key)) continue;
      const cell = grid[n.row][n.col];
      if (cell.type === 'path' || cell.type === 'end') {
        visited.add(key);
        queue.push({ point: n, path: [...path, n] });
      }
    }
  }

  return [];
}

// ============================================================
// Reducer
// ============================================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SELECT_WORLD':
      return { ...state, selectedWorld: action.world };

    case 'START_LEVEL': {
      const level = getLevelById(action.levelId) ?? state.customLevels.find(l => l.id === action.levelId);
      if (!level) return state;
      return {
        ...state,
        screen: 'playing',
        currentLevelId: action.levelId,
        gold: level.startGold,
        lives: level.startLives,
        maxLives: level.startLives,
        score: 0,
        waveIndex: 0,
        waveActive: false,
        allWavesSpawned: false,
        towers: [],
        enemies: [],
        projectiles: [],
        selectedTowerInstanceId: null,
        placingTowerId: null,
        isPaused: false,
        gameSpeed: 1,
        gameResult: null,
        starsEarned: 0,
        spawnQueue: [],
        gameTime: 0,
        floatingTexts: [],
      };
    }

    case 'PLACE_TOWER': {
      const def = getTowerDef(action.towerId);
      if (!def || state.gold < def.cost) return state;

      const level = getLevelById(state.currentLevelId!) ?? state.customLevels.find(l => l.id === state.currentLevelId);
      if (!level) return state;

      // Check cell is buildable
      const cell = level.grid[action.row]?.[action.col];
      if (!cell || cell.type !== 'buildable') return state;

      // Check no tower already there
      if (state.towers.some(t => t.row === action.row && t.col === action.col)) return state;

      const tower = {
        id: nextId(),
        towerId: action.towerId,
        row: action.row,
        col: action.col,
        level: 0,
        kills: 0,
        lastAttackTime: 0,
        attackTimer: 0,
        targetEnemyId: null,
      };

      return {
        ...state,
        gold: state.gold - def.cost,
        towers: [...state.towers, tower],
        placingTowerId: null,
      };
    }

    case 'SELL_TOWER': {
      const tower = state.towers.find(t => t.id === action.instanceId);
      if (!tower) return state;
      const def = getTowerDef(tower.towerId);
      const sellValue = getTowerSellValue(def, tower.level);
      return {
        ...state,
        gold: state.gold + sellValue,
        towers: state.towers.filter(t => t.id !== action.instanceId),
        selectedTowerInstanceId: null,
      };
    }

    case 'UPGRADE_TOWER': {
      const tower = state.towers.find(t => t.id === action.instanceId);
      if (!tower) return state;
      const def = getTowerDef(tower.towerId);
      if (tower.level >= def.maxLevel) return state;
      const cost = getTowerUpgradeCost(def, tower.level);
      if (state.gold < cost) return state;
      return {
        ...state,
        gold: state.gold - cost,
        towers: state.towers.map(t =>
          t.id === action.instanceId ? { ...t, level: t.level + 1 } : t
        ),
      };
    }

    case 'SELECT_TOWER_INSTANCE':
      return { ...state, selectedTowerInstanceId: action.instanceId, placingTowerId: null };

    case 'SET_PLACING':
      return { ...state, placingTowerId: action.towerId, selectedTowerInstanceId: null };

    case 'START_WAVE': {
      if (state.waveActive) return state;
      const level = getLevelById(state.currentLevelId!) ?? state.customLevels.find(l => l.id === state.currentLevelId);
      if (!level) return state;
      if (state.waveIndex >= level.waves.length) return state;

      const queue = buildSpawnQueue(level.waves, state.waveIndex);
      // Offset spawn times by current game time
      const offsetQueue = queue.map(e => ({ ...e, spawnTime: e.spawnTime + state.gameTime }));

      const isLast = state.waveIndex >= level.waves.length - 1;

      return {
        ...state,
        waveActive: true,
        spawnQueue: offsetQueue,
        waveIndex: state.waveIndex + 1,
        allWavesSpawned: isLast,
      };
    }

    case 'TICK': {
      if (state.isPaused || !state.waveActive || state.gameResult) return state;
      const level = getLevelById(state.currentLevelId!) ?? state.customLevels.find(l => l.id === state.currentLevelId);
      if (!level) return state;

      const result = tick(state, action.dt, level);

      // Check if wave is complete (no enemies left, no spawns left, wave was active)
      let waveActive: boolean = state.waveActive;
      if (result.spawnQueue.length === 0 && result.enemies.filter(e => e.alive).length === 0 && !state.allWavesSpawned) {
        waveActive = false;
      }

      return {
        ...state,
        enemies: result.enemies,
        towers: result.towers,
        projectiles: result.projectiles,
        gold: result.gold,
        lives: result.lives,
        score: result.score,
        spawnQueue: result.spawnQueue,
        gameTime: result.gameTime,
        floatingTexts: result.floatingTexts,
        gameResult: result.gameResult,
        waveActive,
        starsEarned: result.gameResult === 'won' ? calculateStars(result.lives, state.maxLives) : 0,
      };
    }

    case 'PAUSE':
      return { ...state, isPaused: action.paused };

    case 'SET_SPEED':
      return { ...state, gameSpeed: action.speed };

    case 'GAME_OVER': {
      // Save stars
      const newStars = { ...state.levelStars };
      if (action.result === 'won' && state.currentLevelId) {
        const earned = calculateStars(state.lives, state.maxLives);
        const prev = newStars[state.currentLevelId] ?? 0;
        if (earned > prev) {
          newStars[state.currentLevelId] = earned;
        }
      }
      const total = Object.values(newStars).reduce((a, b) => a + b, 0);
      return {
        ...state,
        gameResult: action.result,
        levelStars: newStars,
        totalStarsEarned: total,
        starsEarned: action.result === 'won' ? calculateStars(state.lives, state.maxLives) : 0,
      };
    }

    case 'EXIT_LEVEL':
      return {
        ...state,
        screen: 'worldMap',
        currentLevelId: null,
        gameResult: null,
        towers: [],
        enemies: [],
        projectiles: [],
        spawnQueue: [],
        floatingTexts: [],
      };

    case 'TOGGLE_SFX':
      return { ...state, sfxEnabled: !state.sfxEnabled };
    case 'TOGGLE_MUSIC':
      return { ...state, musicEnabled: !state.musicEnabled };
    case 'TOGGLE_RANGES':
      return { ...state, showRanges: !state.showRanges };

    // --- Editor ---
    case 'OPEN_EDITOR': {
      const editorState = action.level
        ? editorStateFromLevel(action.level)
        : createBlankEditorState();
      return { ...state, screen: 'editor', editorState };
    }

    case 'EDITOR_SET_TOOL': {
      if (!state.editorState) return state;
      return { ...state, editorState: { ...state.editorState, selectedTool: action.tool } };
    }

    case 'EDITOR_PAINT': {
      if (!state.editorState) return state;
      const es = state.editorState;
      const { row, col } = action;
      if (row < 0 || row >= es.rows || col < 0 || col >= es.cols) return state;

      const newGrid = es.grid.map(r => r.map(c => ({ ...c })));
      const tool = es.selectedTool;

      if (tool === 'start') {
        // Remove any existing start
        for (const r of newGrid) for (const c of r) if (c.type === 'start') c.type = 'buildable';
        newGrid[row][col].type = 'start';
      } else if (tool === 'end') {
        for (const r of newGrid) for (const c of r) if (c.type === 'end') c.type = 'buildable';
        newGrid[row][col].type = 'end';
      } else if (tool === 'erase') {
        newGrid[row][col].type = 'buildable';
      } else {
        newGrid[row][col].type = tool as GridCell['type'];
      }

      const newPath = recalculatePath(newGrid);

      return {
        ...state,
        editorState: { ...es, grid: newGrid, path: newPath },
      };
    }

    case 'EDITOR_SET_NAME':
      if (!state.editorState) return state;
      return { ...state, editorState: { ...state.editorState, name: action.name } };

    case 'EDITOR_RESIZE': {
      if (!state.editorState) return state;
      const newEs = createBlankEditorState(action.rows, action.cols);
      newEs.name = state.editorState.name;
      newEs.waves = state.editorState.waves;
      newEs.startGold = state.editorState.startGold;
      newEs.startLives = state.editorState.startLives;
      newEs.theme = state.editorState.theme;
      return { ...state, editorState: newEs };
    }

    case 'EDITOR_SET_THEME':
      if (!state.editorState) return state;
      return { ...state, editorState: { ...state.editorState, theme: action.theme } };

    case 'EDITOR_ADD_WAVE': {
      if (!state.editorState) return state;
      const waves = [...state.editorState.waves, { groups: [{ enemyId: 'slime' as any, count: 5, interval: 1000, delay: 0 }] }];
      return { ...state, editorState: { ...state.editorState, waves } };
    }

    case 'EDITOR_REMOVE_WAVE': {
      if (!state.editorState) return state;
      const waves = state.editorState.waves.filter((_, i) => i !== action.index);
      return { ...state, editorState: { ...state.editorState, waves } };
    }

    case 'EDITOR_UPDATE_WAVE_GROUP': {
      if (!state.editorState) return state;
      const waves = state.editorState.waves.map((w, wi) => {
        if (wi !== action.waveIndex) return w;
        return {
          groups: w.groups.map((g, gi) => {
            if (gi !== action.groupIndex) return g;
            return { ...g, ...action.group };
          }),
        };
      });
      return { ...state, editorState: { ...state.editorState, waves } };
    }

    case 'EDITOR_ADD_WAVE_GROUP': {
      if (!state.editorState) return state;
      const waves = state.editorState.waves.map((w, wi) => {
        if (wi !== action.waveIndex) return w;
        return { groups: [...w.groups, { enemyId: 'slime' as any, count: 5, interval: 1000, delay: 0 }] };
      });
      return { ...state, editorState: { ...state.editorState, waves } };
    }

    case 'EDITOR_REMOVE_WAVE_GROUP': {
      if (!state.editorState) return state;
      const waves = state.editorState.waves.map((w, wi) => {
        if (wi !== action.waveIndex) return w;
        return { groups: w.groups.filter((_, gi) => gi !== action.groupIndex) };
      });
      return { ...state, editorState: { ...state.editorState, waves } };
    }

    case 'EDITOR_SET_GOLD':
      if (!state.editorState) return state;
      return { ...state, editorState: { ...state.editorState, startGold: action.gold } };

    case 'EDITOR_SET_LIVES':
      if (!state.editorState) return state;
      return { ...state, editorState: { ...state.editorState, startLives: action.lives } };

    case 'EDITOR_TEST': {
      if (!state.editorState) return state;
      const es = state.editorState;
      if (es.path.length < 2) return state;
      // Build a temporary level and start it
      const tempLevel: LevelDef = {
        id: 'editor-test',
        name: es.name,
        world: 0,
        worldIndex: 0,
        rows: es.rows,
        cols: es.cols,
        grid: es.grid,
        path: es.path,
        waves: es.waves,
        startGold: es.startGold,
        startLives: es.startLives,
        parTime: 999,
        description: 'Test level',
        theme: es.theme,
      };
      return {
        ...state,
        screen: 'playing',
        currentLevelId: 'editor-test',
        gold: tempLevel.startGold,
        lives: tempLevel.startLives,
        maxLives: tempLevel.startLives,
        score: 0,
        waveIndex: 0,
        waveActive: false,
        allWavesSpawned: false,
        towers: [],
        enemies: [],
        projectiles: [],
        selectedTowerInstanceId: null,
        placingTowerId: null,
        isPaused: false,
        gameSpeed: 1,
        gameResult: null,
        starsEarned: 0,
        spawnQueue: [],
        gameTime: 0,
        floatingTexts: [],
        customLevels: [
          ...state.customLevels.filter(l => l.id !== 'editor-test'),
          tempLevel,
        ],
        editorState: { ...es, testMode: true },
      };
    }

    case 'EDITOR_SAVE': {
      if (!state.editorState) return state;
      const es = state.editorState;
      if (es.path.length < 2) return state;

      const id = `custom-${Date.now()}`;
      const newLevel: LevelDef = {
        id,
        name: es.name,
        world: 99,
        worldIndex: state.customLevels.length,
        rows: es.rows,
        cols: es.cols,
        grid: es.grid,
        path: es.path,
        waves: es.waves,
        startGold: es.startGold,
        startLives: es.startLives,
        parTime: 999,
        description: 'Custom level',
        theme: es.theme,
      };

      return {
        ...state,
        customLevels: [...state.customLevels, newLevel],
      };
    }

    case 'EDITOR_EXIT':
      return {
        ...state,
        screen: state.editorState?.testMode ? 'editor' : 'worldMap',
        editorState: state.editorState?.testMode
          ? { ...state.editorState!, testMode: false }
          : null,
        currentLevelId: null,
        gameResult: null,
        towers: [],
        enemies: [],
        projectiles: [],
        spawnQueue: [],
        floatingTexts: [],
      };

    case 'DELETE_CUSTOM_LEVEL':
      return {
        ...state,
        customLevels: state.customLevels.filter(l => l.id !== action.levelId),
      };

    case 'LOAD_SAVE': {
      const saved = loadSave();
      return {
        ...state,
        levelStars: saved.levelStars ?? state.levelStars,
        totalStarsEarned: saved.totalStarsEarned ?? state.totalStarsEarned,
        customLevels: saved.customLevels ?? state.customLevels,
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
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Save on important state changes
  useEffect(() => {
    saveToDisk(state);
  }, [state.levelStars, state.totalStarsEarned, state.customLevels, state.sfxEnabled, state.musicEnabled, state.showRanges]);

  // Game loop
  useEffect(() => {
    if (state.screen !== 'playing' || state.isPaused || state.gameResult) {
      lastTimeRef.current = 0;
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const dt = Math.min(time - lastTimeRef.current, 100); // cap at 100ms
      lastTimeRef.current = time;

      if (dt > 0 && state.waveActive) {
        dispatch({ type: 'TICK', dt });
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state.screen, state.isPaused, state.gameResult, state.waveActive]);

  // Action creators
  const setScreen = useCallback((screen: Screen) => dispatch({ type: 'SET_SCREEN', screen }), []);
  const selectWorld = useCallback((world: number) => dispatch({ type: 'SELECT_WORLD', world }), []);
  const startLevel = useCallback((levelId: string) => dispatch({ type: 'START_LEVEL', levelId }), []);
  const placeTower = useCallback((towerId: TowerId, row: number, col: number) => dispatch({ type: 'PLACE_TOWER', towerId, row, col }), []);
  const sellTower = useCallback((instanceId: string) => dispatch({ type: 'SELL_TOWER', instanceId }), []);
  const upgradeTower = useCallback((instanceId: string) => dispatch({ type: 'UPGRADE_TOWER', instanceId }), []);
  const selectTowerInstance = useCallback((instanceId: string | null) => dispatch({ type: 'SELECT_TOWER_INSTANCE', instanceId }), []);
  const setPlacing = useCallback((towerId: TowerId | null) => dispatch({ type: 'SET_PLACING', towerId }), []);
  const startWave = useCallback(() => dispatch({ type: 'START_WAVE' }), []);
  const pause = useCallback((paused: boolean) => dispatch({ type: 'PAUSE', paused }), []);
  const setSpeed = useCallback((speed: number) => dispatch({ type: 'SET_SPEED', speed }), []);
  const exitLevel = useCallback(() => dispatch({ type: 'EXIT_LEVEL' }), []);
  const openEditor = useCallback((level?: LevelDef) => dispatch({ type: 'OPEN_EDITOR', level }), []);
  const editorSetTool = useCallback((tool: EditorTool) => dispatch({ type: 'EDITOR_SET_TOOL', tool }), []);
  const editorPaint = useCallback((row: number, col: number) => dispatch({ type: 'EDITOR_PAINT', row, col }), []);
  const editorSetName = useCallback((name: string) => dispatch({ type: 'EDITOR_SET_NAME', name }), []);
  const editorResize = useCallback((rows: number, cols: number) => dispatch({ type: 'EDITOR_RESIZE', rows, cols }), []);
  const editorSetTheme = useCallback((theme: WorldTheme) => dispatch({ type: 'EDITOR_SET_THEME', theme }), []);
  const editorAddWave = useCallback(() => dispatch({ type: 'EDITOR_ADD_WAVE' }), []);
  const editorRemoveWave = useCallback((index: number) => dispatch({ type: 'EDITOR_REMOVE_WAVE', index }), []);
  const editorUpdateWaveGroup = useCallback((waveIndex: number, groupIndex: number, group: Partial<WaveGroup>) => dispatch({ type: 'EDITOR_UPDATE_WAVE_GROUP', waveIndex, groupIndex, group }), []);
  const editorAddWaveGroup = useCallback((waveIndex: number) => dispatch({ type: 'EDITOR_ADD_WAVE_GROUP', waveIndex }), []);
  const editorRemoveWaveGroup = useCallback((waveIndex: number, groupIndex: number) => dispatch({ type: 'EDITOR_REMOVE_WAVE_GROUP', waveIndex, groupIndex }), []);
  const editorSetGold = useCallback((gold: number) => dispatch({ type: 'EDITOR_SET_GOLD', gold }), []);
  const editorSetLives = useCallback((lives: number) => dispatch({ type: 'EDITOR_SET_LIVES', lives }), []);
  const editorTest = useCallback(() => dispatch({ type: 'EDITOR_TEST' }), []);
  const editorSave = useCallback(() => dispatch({ type: 'EDITOR_SAVE' }), []);
  const editorExit = useCallback(() => dispatch({ type: 'EDITOR_EXIT' }), []);
  const deleteCustomLevel = useCallback((levelId: string) => dispatch({ type: 'DELETE_CUSTOM_LEVEL', levelId }), []);
  const gameOver = useCallback((result: 'won' | 'lost') => dispatch({ type: 'GAME_OVER', result }), []);

  return {
    state,
    setScreen,
    selectWorld,
    startLevel,
    placeTower,
    sellTower,
    upgradeTower,
    selectTowerInstance,
    setPlacing,
    startWave,
    pause,
    setSpeed,
    exitLevel,
    openEditor,
    editorSetTool,
    editorPaint,
    editorSetName,
    editorResize,
    editorSetTheme,
    editorAddWave,
    editorRemoveWave,
    editorUpdateWaveGroup,
    editorAddWaveGroup,
    editorRemoveWaveGroup,
    editorSetGold,
    editorSetLives,
    editorTest,
    editorSave,
    editorExit,
    deleteCustomLevel,
    gameOver,
  };
}
