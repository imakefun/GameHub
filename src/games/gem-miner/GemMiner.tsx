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
  TutorialPopup,
  getTutorialForLevel,
} from './components';
import { LEVELS } from './data';
import type { DesignerLevel } from './types';

export function GemMiner() {
  const {
    state,
    lastScore,
    failedSwap,
    isTestMode,
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
  } = useGameState();

  // Track the name of the level being tested
  const [testLevelName, setTestLevelName] = useState<string | null>(null);

  // Store the level being designed so it persists when returning from test
  const [designerLevel, setDesignerLevel] = useState<DesignerLevel | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  // Check for tutorials when level changes
  useEffect(() => {
    if (state.screen === 'playing' && state.currentLevel > 0) {
      const tutorial = getTutorialForLevel(state.currentLevel);
      if (tutorial) {
        // Small delay so the board renders first
        const timer = setTimeout(() => setActiveTutorial(tutorial), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [state.screen, state.currentLevel]);

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

  // Wrapper to handle play testing from designer (must be before conditional returns)
  const handlePlayTestFromDesigner = useCallback((level: DesignerLevel) => {
    setTestLevelName(level.name || 'Custom Level');
    setDesignerLevel(level); // Save the level so we can restore it after testing
    playDesignerLevel(level, 'designer');
  }, [playDesignerLevel]);

  // Wrapper to handle play testing from submitted levels (must be before conditional returns)
  const handlePlayFromSubmitted = useCallback((level: DesignerLevel) => {
    setTestLevelName(level.name || 'Community Level');
    playDesignerLevel(level, 'submittedLevels');
  }, [playDesignerLevel]);

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
        onPlayTest={handlePlayTestFromDesigner}
        onSubmit={submitLevel}
        initialLevel={designerLevel}
      />
    );
  }

  // Submitted Levels Screen
  if (state.screen === 'submittedLevels') {
    return (
      <SubmittedLevels
        onBack={goToLevelSelect}
        onPlay={handlePlayFromSubmitted}
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
        onBack={isTestMode ? returnFromTest : goToLevelSelect}
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
        isTestMode={isTestMode}
        levelName={isTestMode ? testLevelName || undefined : undefined}
        onReplay={resetLevel}
        onNext={nextLevel}
        onLevelSelect={isTestMode ? returnFromTest : goToLevelSelect}
      />

      {/* Tutorial Popup */}
      <TutorialPopup
        tutorialKey={activeTutorial}
        onClose={() => setActiveTutorial(null)}
      />
    </div>
  );
}
