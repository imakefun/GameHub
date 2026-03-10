import { useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, LevelDef, TowerId, PlacedTower, ActiveEnemy } from '../types';
import { getTowerDef, getTowerDamageAtLevel, getTowerUpgradeCost, getTowerSellValue } from '../data';
import { getEnemyDef } from '../data/enemies';

interface Props {
  state: GameState;
  level: LevelDef;
  onPlaceTower: (towerId: TowerId, row: number, col: number) => void;
  onSelectTower: (instanceId: string | null) => void;
  onSellTower: (instanceId: string) => void;
  onUpgradeTower: (instanceId: string) => void;
  showRanges: boolean;
}

const THEME_COLORS: Record<string, { path: string; buildable: string; blocked: string; bg: string; border: string }> = {
  forest: { path: '#4a3728', buildable: '#2d5a27', blocked: '#1a3a15', bg: '#1a2e1a', border: '#3a5a30' },
  desert: { path: '#8b7355', buildable: '#6b5a3a', blocked: '#4a3a20', bg: '#3a2e1a', border: '#7a6a4a' },
  ice: { path: '#6b8ba0', buildable: '#3a5a6a', blocked: '#2a3a4a', bg: '#1a2a3a', border: '#4a6a7a' },
  volcano: { path: '#5a3030', buildable: '#4a2020', blocked: '#3a1515', bg: '#2a1010', border: '#6a3030' },
  shadow: { path: '#4a3a5a', buildable: '#2a2035', blocked: '#1a1525', bg: '#100a15', border: '#3a2a4a' },
  crystal: { path: '#3a5a5a', buildable: '#2a4a4a', blocked: '#1a3535', bg: '#0a2525', border: '#3a5555' },
};

export function GameBoard({ state, level, onPlaceTower, onSelectTower, onSellTower, onUpgradeTower, showRanges }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const theme = THEME_COLORS[level.theme] || THEME_COLORS.forest;

  // Calculate cell size to fit the screen
  const cellSize = useMemo(() => {
    // Target size to fill available space
    return Math.min(44, Math.floor((window.innerWidth - 16) / level.cols));
  }, [level.cols]);

  const boardWidth = cellSize * level.cols;
  const boardHeight = cellSize * level.rows;

  const handleCellClick = useCallback((row: number, col: number) => {
    if (state.gameResult) return;

    // Check if there's a tower here
    const existingTower = state.towers.find(t => t.row === row && t.col === col);
    if (existingTower) {
      onSelectTower(existingTower.id);
      return;
    }

    // If placing a tower
    if (state.placingTowerId) {
      const cell = level.grid[row]?.[col];
      if (cell?.type === 'buildable') {
        onPlaceTower(state.placingTowerId, row, col);
      }
      return;
    }

    onSelectTower(null);
  }, [state.placingTowerId, state.towers, state.gameResult, level.grid, onPlaceTower, onSelectTower]);

  const selectedTower = state.towers.find(t => t.id === state.selectedTowerInstanceId);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={boardRef}
        className="relative select-none touch-none"
        style={{ width: boardWidth, height: boardHeight }}
      >
        {/* Grid cells */}
        {level.grid.map((row, r) =>
          row.map((cell, c) => {
            const tower = state.towers.find(t => t.row === r && t.col === c);
            const canPlace = state.placingTowerId && cell.type === 'buildable' && !tower;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className="absolute transition-colors"
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                  backgroundColor:
                    cell.type === 'path' || cell.type === 'start' || cell.type === 'end'
                      ? theme.path
                      : cell.type === 'blocked'
                        ? theme.blocked
                        : theme.buildable,
                  border: `1px solid ${theme.border}`,
                  cursor: canPlace ? 'pointer' : tower ? 'pointer' : 'default',
                  opacity: canPlace ? 0.8 : 1,
                }}
              >
                {/* Start/End markers */}
                {cell.type === 'start' && (
                  <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm">🚪</div>
                )}
                {cell.type === 'end' && (
                  <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm">🏠</div>
                )}

                {/* Placement ghost */}
                {canPlace && state.placingTowerId && (
                  <div className="w-full h-full flex items-center justify-center text-lg opacity-40">
                    {getTowerDef(state.placingTowerId).emoji}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Tower range rings */}
        {showRanges && selectedTower && (() => {
          const def = getTowerDef(selectedTower.towerId);
          const range = (def.range + selectedTower.level * 0.3) * cellSize;
          const cx = (selectedTower.col + 0.5) * cellSize;
          const cy = (selectedTower.row + 0.5) * cellSize;
          return (
            <div
              className="absolute rounded-full border-2 border-white/30 bg-white/5 pointer-events-none"
              style={{
                left: cx - range,
                top: cy - range,
                width: range * 2,
                height: range * 2,
              }}
            />
          );
        })()}

        {/* Buff tower range rings */}
        {showRanges && selectedTower && selectedTower.towerId === 'buff' && (() => {
          const def = getTowerDef('buff');
          const range = (def.buffRange + selectedTower.level * 0.3) * cellSize;
          const cx = (selectedTower.col + 0.5) * cellSize;
          const cy = (selectedTower.row + 0.5) * cellSize;
          return (
            <div
              className="absolute rounded-full border-2 border-pink-400/40 bg-pink-400/10 pointer-events-none"
              style={{
                left: cx - range,
                top: cy - range,
                width: range * 2,
                height: range * 2,
              }}
            />
          );
        })()}

        {/* Placed towers */}
        {state.towers.map(tower => {
          const def = getTowerDef(tower.towerId);
          const isSelected = tower.id === state.selectedTowerInstanceId;
          return (
            <motion.div
              key={tower.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute flex items-center justify-center pointer-events-none ${
                isSelected ? 'z-20' : 'z-10'
              }`}
              style={{
                left: tower.col * cellSize,
                top: tower.row * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            >
              <div className={`relative ${isSelected ? 'ring-2 ring-white rounded-lg' : ''}`}>
                <span className="text-lg sm:text-xl">{def.emoji}</span>
                {tower.level > 0 && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold"
                  >
                    {tower.level}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Enemies */}
        {state.enemies.filter(e => e.alive).map(enemy => {
          const def = getEnemyDef(enemy.enemyId);
          const hpPercent = enemy.hp / enemy.maxHp;
          const isSlow = enemy.slowTimer > 0;
          const isStealth = enemy.stealthTimer > 0;

          return (
            <motion.div
              key={enemy.id}
              className="absolute pointer-events-none z-30"
              style={{
                left: enemy.x * cellSize - cellSize * 0.4,
                top: enemy.y * cellSize - cellSize * 0.4,
                width: cellSize * 0.8,
                height: cellSize * 0.8,
                opacity: isStealth ? 0.3 : 1,
              }}
            >
              {/* HP bar */}
              <div className="absolute -top-2 left-0 right-0 h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${hpPercent * 100}%`,
                    backgroundColor: hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444',
                  }}
                />
              </div>
              {/* Shield bar */}
              {enemy.shieldHp > 0 && (
                <div className="absolute -top-3.5 left-0 right-0 h-1 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${(enemy.shieldHp / (enemy.maxHp * 0.3)) * 100}%` }}
                  />
                </div>
              )}
              {/* Enemy sprite */}
              <div className={`w-full h-full flex items-center justify-center text-base sm:text-lg ${isSlow ? 'text-cyan-300' : ''}`}>
                {def.emoji}
              </div>
              {/* Boss crown */}
              {def.isBoss && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px]">👑</div>
              )}
            </motion.div>
          );
        })}

        {/* Projectiles */}
        {state.projectiles.map(proj => {
          const x = proj.fromX + (proj.toX - proj.fromX) * proj.progress;
          const y = proj.fromY + (proj.toY - proj.fromY) * proj.progress;
          const def = getTowerDef(proj.towerId);
          return (
            <div
              key={proj.id}
              className="absolute w-2 h-2 rounded-full z-20 pointer-events-none"
              style={{
                left: x * cellSize - 4,
                top: y * cellSize - 4,
                backgroundColor: def.color,
                boxShadow: `0 0 6px ${def.color}`,
              }}
            />
          );
        })}

        {/* Floating texts */}
        <AnimatePresence>
          {state.floatingTexts.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute text-xs font-bold pointer-events-none z-40"
              style={{
                left: ft.x * cellSize,
                top: ft.y * cellSize,
                color: ft.color,
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected tower info */}
      <AnimatePresence>
        {selectedTower && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-2 bg-black/60 backdrop-blur-sm rounded-xl p-3 w-full max-w-sm"
          >
            <TowerInfo
              tower={selectedTower}
              gold={state.gold}
              onSell={() => onSellTower(selectedTower.id)}
              onUpgrade={() => onUpgradeTower(selectedTower.id)}
              onDeselect={() => onSelectTower(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TowerInfo({ tower, gold, onSell, onUpgrade, onDeselect }: {
  tower: PlacedTower;
  gold: number;
  onSell: () => void;
  onUpgrade: () => void;
  onDeselect: () => void;
}) {
  const def = getTowerDef(tower.towerId);
  const dmg = getTowerDamageAtLevel(def, tower.level);
  const upgradeCost = tower.level < def.maxLevel ? getTowerUpgradeCost(def, tower.level) : null;
  const sellValue = getTowerSellValue(def, tower.level);
  const canUpgrade = upgradeCost !== null && gold >= upgradeCost;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{def.emoji}</span>
          <div>
            <div className="text-white font-bold text-sm">
              {def.name} <span className="text-amber-400">Lv.{tower.level + 1}</span>
            </div>
            <div className="text-white/60 text-xs">
              {dmg} dmg · {def.attackSpeed}/s · {tower.kills} kills
            </div>
          </div>
        </div>
        <button onClick={onDeselect} className="text-white/40 text-sm px-2">✕</button>
      </div>
      <div className="flex gap-2">
        {upgradeCost !== null && (
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
              canUpgrade
                ? 'bg-emerald-600 text-white active:bg-emerald-700'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            Upgrade ({upgradeCost}g)
          </button>
        )}
        <button
          onClick={onSell}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-600/80 text-white active:bg-red-700"
        >
          Sell (+{sellValue}g)
        </button>
      </div>
    </div>
  );
}
