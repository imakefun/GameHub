import { useCallback, useMemo, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { TitleScreen, WorldMap, GameBoard, GameHUD, ResultModal, LevelEditor, SettingsScreen, GemShop } from './components';
import { getLevelById, LEVELS } from './data';
import { audioManager, THEME_TO_MUSIC } from './audio/AudioManager';

export function TowerDefense() {
  const {
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
    toggleSfx,
    toggleMusic,
    toggleRanges,
  } = useGameState();

  // Initialize audio
  useEffect(() => {
    audioManager.initialize();
    audioManager.preloadAll();
  }, []);

  // Sync audio settings
  useEffect(() => {
    audioManager.setSfxEnabled(state.sfxEnabled);
    audioManager.setMusicEnabled(state.musicEnabled);
  }, [state.sfxEnabled, state.musicEnabled]);

  // Play contextual music
  useEffect(() => {
    if (state.screen === 'title') {
      audioManager.playMusic('title_theme');
    } else if (state.screen === 'worldMap') {
      audioManager.playMusic('world_map');
    } else if (state.screen === 'editor') {
      audioManager.playMusic('editor_theme');
    } else if (state.screen === 'playing' && currentLevel) {
      const musicTrack = THEME_TO_MUSIC[currentLevel.theme] || 'battle_forest';
      audioManager.playMusic(musicTrack);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen]);

  // Pause/resume music on game pause
  useEffect(() => {
    if (state.isPaused) {
      audioManager.pauseMusic();
    } else {
      audioManager.resumeMusic();
    }
  }, [state.isPaused]);

  // Get current level def
  const currentLevel = useMemo(() => {
    if (!state.currentLevelId) return null;
    return getLevelById(state.currentLevelId)
      ?? state.customLevels.find(l => l.id === state.currentLevelId)
      ?? null;
  }, [state.currentLevelId, state.customLevels]);

  // Detect game over
  useEffect(() => {
    if (state.gameResult === 'won' || state.gameResult === 'lost') {
      gameOver(state.gameResult);
      // Play result SFX
      if (state.gameResult === 'won') {
        audioManager.playSfx('level_win');
        audioManager.playMusic('victory_fanfare');
      } else {
        audioManager.playSfx('level_lose');
        audioManager.playMusic('defeat_theme');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameResult, gameOver]);

  // Find next level
  const nextLevelId = useMemo(() => {
    if (!currentLevel) return null;
    const idx = LEVELS.findIndex(l => l.id === currentLevel.id);
    if (idx >= 0 && idx < LEVELS.length - 1) {
      return LEVELS[idx + 1].id;
    }
    return null;
  }, [currentLevel]);

  const handleRetry = useCallback(() => {
    if (state.currentLevelId) {
      startLevel(state.currentLevelId);
    }
  }, [state.currentLevelId, startLevel]);

  const handleNextLevel = useCallback(() => {
    if (nextLevelId) {
      startLevel(nextLevelId);
    }
  }, [nextLevelId, startLevel]);

  const handleEditorExit = useCallback(() => {
    if (state.editorState?.testMode) {
      editorExit();
    } else if (state.screen === 'editor') {
      editorExit();
    } else {
      exitLevel();
    }
  }, [state.screen, state.editorState, editorExit, exitLevel]);

  // --- Render based on screen ---

  if (state.screen === 'title') {
    return (
      <TitleScreen
        totalStars={state.totalStarsEarned}
        onPlay={() => setScreen('worldMap')}
        onEditor={() => openEditor()}
        onSettings={() => setScreen('settings')}
        onShop={() => setScreen('shop')}
      />
    );
  }

  if (state.screen === 'shop') {
    return (
      <GemShop onBack={() => setScreen('title')} />
    );
  }

  if (state.screen === 'settings') {
    return (
      <SettingsScreen
        sfxEnabled={state.sfxEnabled}
        musicEnabled={state.musicEnabled}
        showRanges={state.showRanges}
        onToggleSfx={toggleSfx}
        onToggleMusic={toggleMusic}
        onToggleRanges={toggleRanges}
        onBack={() => setScreen('title')}
      />
    );
  }

  if (state.screen === 'worldMap') {
    return (
      <WorldMap
        selectedWorld={state.selectedWorld}
        levelStars={state.levelStars}
        totalStars={state.totalStarsEarned}
        customLevels={state.customLevels}
        onSelectWorld={selectWorld}
        onStartLevel={startLevel}
        onBack={() => setScreen('title')}
        onEditor={() => openEditor()}
        onDeleteCustomLevel={deleteCustomLevel}
      />
    );
  }

  if (state.screen === 'editor' && state.editorState) {
    return (
      <LevelEditor
        editorState={state.editorState}
        onSetTool={editorSetTool}
        onPaint={editorPaint}
        onSetName={editorSetName}
        onResize={editorResize}
        onSetTheme={editorSetTheme}
        onAddWave={editorAddWave}
        onRemoveWave={editorRemoveWave}
        onUpdateWaveGroup={editorUpdateWaveGroup}
        onAddWaveGroup={editorAddWaveGroup}
        onRemoveWaveGroup={editorRemoveWaveGroup}
        onSetGold={editorSetGold}
        onSetLives={editorSetLives}
        onTest={editorTest}
        onSave={editorSave}
        onExit={editorExit}
      />
    );
  }

  if (state.screen === 'playing' && currentLevel) {
    const themeGradients: Record<string, string> = {
      forest: 'from-green-950 via-emerald-950 to-green-950',
      desert: 'from-amber-950 via-orange-950 to-amber-950',
      ice: 'from-sky-950 via-cyan-950 to-sky-950',
      volcano: 'from-red-950 via-orange-950 to-red-950',
      shadow: 'from-purple-950 via-violet-950 to-purple-950',
      crystal: 'from-cyan-950 via-teal-950 to-cyan-950',
    };

    return (
      <div className={`min-h-[100dvh] flex flex-col bg-gradient-to-b ${themeGradients[currentLevel.theme] || themeGradients.forest} p-2`}>
        {/* HUD */}
        <GameHUD
          state={state}
          level={currentLevel}
          onStartWave={startWave}
          onSetPlacing={setPlacing}
          onPause={pause}
          onSetSpeed={setSpeed}
          onExit={state.editorState?.testMode ? handleEditorExit : exitLevel}
        />

        {/* Game board */}
        <div className="flex-1 flex items-center justify-center py-2 overflow-auto">
          <GameBoard
            state={state}
            level={currentLevel}
            onPlaceTower={placeTower}
            onSelectTower={selectTowerInstance}
            onSellTower={sellTower}
            onUpgradeTower={upgradeTower}
            showRanges={state.showRanges}
          />
        </div>

        {/* Result modal */}
        {(state.gameResult === 'won' || state.gameResult === 'lost') && (
          <ResultModal
            result={state.gameResult}
            stars={state.starsEarned}
            score={state.score}
            livesLeft={state.lives}
            maxLives={state.maxLives}
            onRetry={state.editorState?.testMode ? handleEditorExit : handleRetry}
            onExit={state.editorState?.testMode ? handleEditorExit : exitLevel}
            onNextLevel={!state.editorState?.testMode && nextLevelId ? handleNextLevel : null}
          />
        )}
      </div>
    );
  }

  // Fallback
  return (
    <TitleScreen
      totalStars={state.totalStarsEarned}
      onPlay={() => setScreen('worldMap')}
      onEditor={() => openEditor()}
      onSettings={() => setScreen('settings')}
      onShop={() => setScreen('shop')}
    />
  );
}
