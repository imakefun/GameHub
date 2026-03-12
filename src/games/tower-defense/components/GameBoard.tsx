import { useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, LevelDef, TowerId, PlacedTower } from '../types';
import { getTowerDef, getTowerDamageAtLevel, getTowerUpgradeCost, getTowerSellValue } from '../data';
import { getEnemyDef } from '../data/enemies';
import { getSpriteUrl, getTerrainUrl } from '../assets/sprites';

interface Props {
  state: GameState;
  level: LevelDef;
  onPlaceTower: (towerId: TowerId, row: number, col: number) => void;
  onSelectTower: (instanceId: string | null) => void;
  onSellTower: (instanceId: string) => void;
  onUpgradeTower: (instanceId: string) => void;
  showRanges: boolean;
}

export function GameBoard({ state, level, onPlaceTower, onSelectTower, onSellTower, onUpgradeTower, showRanges }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate cell size to fit the screen
  const cellSize = useMemo(() => {
    return Math.min(48, Math.floor((window.innerWidth - 16) / level.cols));
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
        className="relative select-none touch-none rounded-lg overflow-hidden shadow-2xl"
        style={{ width: boardWidth, height: boardHeight }}
      >
        {/* Grid cells with SVG terrain */}
        {level.grid.map((row, r) =>
          row.map((cell, c) => {
            const tower = state.towers.find(t => t.row === r && t.col === c);
            const canPlace = state.placingTowerId && cell.type === 'buildable' && !tower;
            const terrainUrl = getTerrainUrl(
              level.theme,
              cell.type === 'start' || cell.type === 'end' ? 'path' : cell.type,
            );

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className="absolute transition-opacity"
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                  backgroundImage: terrainUrl ? `url("${terrainUrl}")` : undefined,
                  backgroundSize: 'cover',
                  cursor: canPlace ? 'pointer' : tower ? 'pointer' : 'default',
                  opacity: canPlace ? 0.8 : 1,
                }}
              >
                {/* Start/End markers */}
                {cell.type === 'start' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3/4 h-3/4 rounded bg-blue-600/60 flex items-center justify-center border border-blue-400/40">
                      <svg className="w-3/5 h-3/5 text-blue-200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" opacity="0.6"/>
                        <path d="M10 4l4 4-4 4z"/>
                      </svg>
                    </div>
                  </div>
                )}
                {cell.type === 'end' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3/4 h-3/4 rounded bg-red-600/60 flex items-center justify-center border border-red-400/40">
                      <svg className="w-3/5 h-3/5 text-red-200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Grid line overlay */}
                <div className="absolute inset-0 border border-white/5" />

                {/* Placement ghost */}
                {canPlace && state.placingTowerId && (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={getSpriteUrl('tower', state.placingTowerId)}
                      alt=""
                      className="w-3/4 h-3/4 opacity-40"
                    />
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
            <>
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: cx - range,
                  top: cy - range,
                  width: range * 2,
                  height: range * 2,
                  border: '2px solid rgba(255,255,255,0.25)',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                }}
              />
              {/* Buff range ring */}
              {selectedTower.towerId === 'buff' && (() => {
                const bDef = getTowerDef('buff');
                const bRange = (bDef.buffRange + selectedTower.level * 0.3) * cellSize;
                return (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: cx - bRange,
                      top: cy - bRange,
                      width: bRange * 2,
                      height: bRange * 2,
                      border: '2px solid rgba(244,114,182,0.35)',
                      background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
                    }}
                  />
                );
              })()}
            </>
          );
        })()}

        {/* Placed towers - SVG sprites */}
        {state.towers.map(tower => {
          const isSelected = tower.id === state.selectedTowerInstanceId;
          const spriteUrl = getSpriteUrl('tower', tower.towerId);
          return (
            <motion.div
              key={tower.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
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
              <div className={`relative ${isSelected ? 'ring-2 ring-white/60 rounded-lg shadow-lg shadow-white/20' : ''}`}
                style={{ width: cellSize * 0.85, height: cellSize * 0.85 }}
              >
                <img
                  src={spriteUrl}
                  alt=""
                  className="w-full h-full drop-shadow-md"
                />
                {/* Level badge */}
                {tower.level > 0 && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-amber-400 to-amber-600 text-[8px] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm border border-amber-300/50">
                    {tower.level}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Enemies - SVG sprites */}
        {state.enemies.filter(e => e.alive).map(enemy => {
          const def = getEnemyDef(enemy.enemyId);
          const hpPercent = enemy.hp / enemy.maxHp;
          const isSlow = enemy.slowTimer > 0;
          const isStealth = enemy.stealthTimer > 0;
          const spriteUrl = getSpriteUrl('enemy', enemy.enemyId);
          const enemySize = def.isBoss ? cellSize * 1.0 : cellSize * 0.75;

          return (
            <motion.div
              key={enemy.id}
              className="absolute pointer-events-none z-30"
              style={{
                left: enemy.x * cellSize - enemySize / 2,
                top: enemy.y * cellSize - enemySize / 2,
                width: enemySize,
                height: enemySize,
                opacity: isStealth ? 0.25 : 1,
                filter: isSlow ? 'hue-rotate(180deg) brightness(1.2)' : undefined,
              }}
            >
              {/* HP bar */}
              <div className="absolute -top-2.5 left-0 right-0 h-2 bg-black/60 rounded-full overflow-hidden border border-black/30">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${hpPercent * 100}%` }}
                  transition={{ duration: 0.15 }}
                  style={{
                    background: hpPercent > 0.5
                      ? 'linear-gradient(to right, #22c55e, #4ade80)'
                      : hpPercent > 0.25
                        ? 'linear-gradient(to right, #eab308, #fbbf24)'
                        : 'linear-gradient(to right, #dc2626, #ef4444)',
                  }}
                />
              </div>
              {/* Shield bar */}
              {enemy.shieldHp > 0 && (
                <div className="absolute -top-4.5 left-0 right-0 h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full"
                    style={{ width: `${(enemy.shieldHp / (enemy.maxHp * 0.3)) * 100}%` }}
                  />
                </div>
              )}
              {/* Enemy sprite */}
              <img
                src={spriteUrl}
                alt=""
                className="w-full h-full drop-shadow-md"
              />
              {/* Boss crown */}
              {def.isBoss && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <img src={getSpriteUrl('ui', 'crown')} alt="" className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Projectiles - enhanced with glow */}
        {state.projectiles.map(proj => {
          const x = proj.fromX + (proj.toX - proj.fromX) * proj.progress;
          const y = proj.fromY + (proj.toY - proj.fromY) * proj.progress;
          const def = getTowerDef(proj.towerId);
          return (
            <div
              key={proj.id}
              className="absolute rounded-full z-20 pointer-events-none"
              style={{
                left: x * cellSize - 3,
                top: y * cellSize - 3,
                width: 6,
                height: 6,
                backgroundColor: def.color,
                boxShadow: `0 0 8px ${def.color}, 0 0 3px ${def.color}`,
              }}
            />
          );
        })}

        {/* Floating texts - enhanced */}
        <AnimatePresence>
          {state.floatingTexts.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -24, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute text-xs font-extrabold pointer-events-none z-40"
              style={{
                left: ft.x * cellSize,
                top: ft.y * cellSize,
                color: ft.color,
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)',
              }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected tower info panel */}
      <AnimatePresence>
        {selectedTower && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-3 bg-black/70 backdrop-blur-md rounded-2xl p-4 w-full max-w-sm border border-white/10"
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
  const spriteUrl = getSpriteUrl('tower', tower.towerId);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1">
            <img src={spriteUrl} alt={def.name} className="w-full h-full" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">
              {def.name} <span className="text-amber-400 text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">Lv.{tower.level + 1}</span>
            </div>
            <div className="text-white/50 text-xs space-x-2">
              <span>{dmg} dmg</span>
              <span>·</span>
              <span>{def.attackSpeed}/s</span>
              <span>·</span>
              <span>{tower.kills} kills</span>
            </div>
          </div>
        </div>
        <button onClick={onDeselect} className="text-white/30 hover:text-white/60 text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors">✕</button>
      </div>
      {def.description && (
        <p className="text-white/40 text-xs mb-3 italic">{def.description}</p>
      )}
      <div className="flex gap-2">
        {upgradeCost !== null && (
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              canUpgrade
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow shadow-emerald-500/30 active:from-emerald-700'
                : 'bg-slate-700/50 text-slate-500'
            }`}
          >
            Upgrade ({upgradeCost}g)
          </button>
        )}
        <button
          onClick={onSell}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600/60 text-white active:bg-red-700/60 transition-colors"
        >
          Sell (+{sellValue}g)
        </button>
      </div>
    </div>
  );
}
