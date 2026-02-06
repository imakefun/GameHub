import { useGameState } from './hooks/useGameState';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameBoard,
  GameHUD,
  PowerUpBar,
  WinLoseModal,
  LevelSelect,
  LevelDesigner,
  SubmittedLevels,
} from './components';
import { LEVELS } from './data';

export function GemMiner() {
  const {
    state,
    lastScore,
    failedSwap,
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
    nextLevel,
  } = useGameState();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Level Select Screen
  if (state.screen === 'levelSelect') {
    return (
      <LevelSelect
        levelStars={state.levelStars}
        onSelectLevel={startLevel}
        onDesigner={goToDesigner}
        onSubmittedLevels={goToSubmittedLevels}
      />
    );
  }

  // Level Designer Screen
  if (state.screen === 'designer') {
    return (
      <LevelDesigner
        onBack={goToLevelSelect}
        onPlayTest={playDesignerLevel}
        onSubmit={submitLevel}
      />
    );
  }

  // Submitted Levels Screen
  if (state.screen === 'submittedLevels') {
    return (
      <SubmittedLevels
        onBack={goToLevelSelect}
        onPlay={playDesignerLevel}
      />
    );
  }

  // Playing Screen
  const currentLevel = LEVELS.find(l => l.id === state.currentLevel);
  const stars = state.levelStars[state.currentLevel] || 0;
  const currentStars = currentLevel
    ? state.score >= currentLevel.starThresholds[2] ? 3
    : state.score >= currentLevel.starThresholds[1] ? 2
    : state.score >= currentLevel.starThresholds[0] ? 1
    : 0
    : 0;

  return (
    <div
      ref={containerRef}
      className="h-dvh bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col select-none overflow-hidden"
    >
      {/* HUD */}
      <GameHUD
        levelId={state.currentLevel}
        score={state.score}
        movesRemaining={state.movesRemaining}
        objectives={state.objectives}
        combo={state.combo}
        onBack={goToLevelSelect}
        onReset={resetLevel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-1 py-0 min-h-0">
        {state.grid.length > 0 && (
          <GameBoard
            grid={state.grid}
            selectedCell={state.selectedCell}
            hintCells={state.hintCells}
            matchedCells={state.matchedCells}
            activePowerUp={state.activePowerUp}
            onCellClick={handleCellClick}
            onSwap={handleSwap}
            isProcessing={state.isProcessing}
            combo={state.combo}
            lastScore={lastScore}
            failedSwap={failedSwap}
          />
        )}
      </div>

      {/* Power-Up Bar - compact in fullscreen */}
      <div className={isFullscreen ? 'scale-90 origin-bottom' : ''}>
        <PowerUpBar
          powerUps={state.powerUps}
          activePowerUp={state.activePowerUp}
          onActivate={activatePowerUp}
          isProcessing={state.isProcessing}
        />
      </div>

      {/* Win/Lose Modal */}
      <WinLoseModal
        result={state.levelResult}
        levelId={state.currentLevel}
        score={state.score}
        objectives={state.objectives}
        stars={Math.max(currentStars, stars)}
        onReplay={resetLevel}
        onNext={nextLevel}
        onLevelSelect={goToLevelSelect}
      />
    </div>
  );
}
