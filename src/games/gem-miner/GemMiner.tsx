import { useGameState } from './hooks/useGameState';
import {
  GameBoard,
  GameHUD,
  PowerUpBar,
  WinLoseModal,
  LevelSelect,
  LevelDesigner,
} from './components';
import { LEVELS } from './data';

export function GemMiner() {
  const {
    state,
    lastScore,
    startLevel,
    goToLevelSelect,
    goToDesigner,
    handleCellClick,
    activatePowerUp,
    resetLevel,
    playDesignerLevel,
    nextLevel,
  } = useGameState();

  // Level Select Screen
  if (state.screen === 'levelSelect') {
    return (
      <LevelSelect
        levelStars={state.levelStars}
        onSelectLevel={startLevel}
        onDesigner={goToDesigner}
      />
    );
  }

  // Level Designer Screen
  if (state.screen === 'designer') {
    return (
      <LevelDesigner
        onBack={goToLevelSelect}
        onPlayTest={playDesignerLevel}
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
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col select-none">
      {/* HUD */}
      <GameHUD
        levelId={state.currentLevel}
        score={state.score}
        movesRemaining={state.movesRemaining}
        objectives={state.objectives}
        combo={state.combo}
        onBack={goToLevelSelect}
        onReset={resetLevel}
      />

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-2 py-2">
        {state.grid.length > 0 && (
          <GameBoard
            grid={state.grid}
            selectedCell={state.selectedCell}
            hintCells={state.hintCells}
            matchedCells={state.matchedCells}
            activePowerUp={state.activePowerUp}
            onCellClick={handleCellClick}
            isProcessing={state.isProcessing}
            combo={state.combo}
            lastScore={lastScore}
          />
        )}
      </div>

      {/* Power-Up Bar */}
      <PowerUpBar
        powerUps={state.powerUps}
        activePowerUp={state.activePowerUp}
        onActivate={activatePowerUp}
        isProcessing={state.isProcessing}
      />

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
