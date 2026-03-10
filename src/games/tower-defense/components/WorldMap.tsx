import { motion, AnimatePresence } from 'framer-motion';
import { WORLDS } from '../data/worlds';
import { getLevelsForWorld } from '../data/levels';
import type { LevelDef } from '../types';

interface Props {
  selectedWorld: number;
  levelStars: Record<string, number>;
  totalStars: number;
  customLevels: LevelDef[];
  onSelectWorld: (world: number) => void;
  onStartLevel: (levelId: string) => void;
  onBack: () => void;
  onEditor: () => void;
  onDeleteCustomLevel: (id: string) => void;
}

const THEME_COLORS: Record<string, { bg: string; node: string; path: string }> = {
  forest: { bg: 'from-green-900 via-emerald-950 to-green-950', node: 'bg-emerald-600', path: 'border-emerald-700' },
  desert: { bg: 'from-amber-900 via-orange-950 to-yellow-950', node: 'bg-amber-600', path: 'border-amber-700' },
  ice: { bg: 'from-sky-900 via-cyan-950 to-blue-950', node: 'bg-sky-500', path: 'border-sky-600' },
  volcano: { bg: 'from-red-900 via-red-950 to-orange-950', node: 'bg-red-600', path: 'border-red-700' },
  shadow: { bg: 'from-purple-900 via-violet-950 to-slate-950', node: 'bg-purple-600', path: 'border-purple-700' },
  crystal: { bg: 'from-cyan-900 via-teal-950 to-emerald-950', node: 'bg-cyan-500', path: 'border-cyan-600' },
};

function isLevelUnlocked(_levelId: string, world: number, worldIndex: number, levelStars: Record<string, number>): boolean {
  // First level of first world is always unlocked
  if (world === 1 && worldIndex === 0) return true;

  // First level of a world: need at least 1 star on the previous world's last level
  if (worldIndex === 0) {
    const prevWorld = world - 1;
    const prevLevels = getLevelsForWorld(prevWorld);
    if (prevLevels.length === 0) return false;
    const lastLevel = prevLevels[prevLevels.length - 1];
    return (levelStars[lastLevel.id] ?? 0) > 0;
  }

  // Need at least 1 star on previous level in same world
  const worldLevels = getLevelsForWorld(world);
  const prevLevel = worldLevels[worldIndex - 1];
  if (!prevLevel) return false;
  return (levelStars[prevLevel.id] ?? 0) > 0;
}

function Stars({ count, size = 'text-sm' }: { count: number; size?: string }) {
  return (
    <span className={size}>
      {[1, 2, 3].map(i => (
        <span key={i} className={i <= count ? 'text-amber-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  );
}

export function WorldMap({
  selectedWorld, levelStars, totalStars, customLevels,
  onSelectWorld, onStartLevel, onBack, onEditor, onDeleteCustomLevel,
}: Props) {
  const world = WORLDS.find(w => w.id === selectedWorld);
  const levels = selectedWorld === 99
    ? customLevels
    : getLevelsForWorld(selectedWorld);
  const theme = world ? THEME_COLORS[world.theme] : THEME_COLORS.forest;

  // Check if custom levels world should show
  const showCustom = customLevels.length > 0;

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-gradient-to-b ${theme.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          ← Back
        </button>
        <div className="text-amber-300 font-bold text-sm">
          ⭐ {totalStars}
        </div>
        <button
          onClick={onEditor}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          ✏️ Editor
        </button>
      </div>

      {/* World selector - horizontal scroll */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
        {WORLDS.map(w => {
          const wLevels = getLevelsForWorld(w.id);
          const wStars = wLevels.reduce((sum, l) => sum + (levelStars[l.id] ?? 0), 0);
          const maxStars = wLevels.length * 3;
          const isActive = selectedWorld === w.id;

          return (
            <button
              key={w.id}
              onClick={() => onSelectWorld(w.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white/20 text-white ring-2 ring-white/40 scale-105'
                  : 'bg-white/5 text-white/60'
              }`}
            >
              <span className="text-lg">{w.emoji}</span>
              <div className="mt-0.5">{w.name}</div>
              <div className="text-amber-400">{wStars}/{maxStars} ⭐</div>
            </button>
          );
        })}
        {showCustom && (
          <button
            onClick={() => onSelectWorld(99)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedWorld === 99
                ? 'bg-white/20 text-white ring-2 ring-white/40 scale-105'
                : 'bg-white/5 text-white/60'
            }`}
          >
            <span className="text-lg">🔧</span>
            <div className="mt-0.5">Custom</div>
            <div className="text-amber-400">{customLevels.length} levels</div>
          </button>
        )}
      </div>

      {/* World info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWorld}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="px-4 py-2"
        >
          <h2 className="text-xl font-bold text-white">
            {selectedWorld === 99 ? '🔧 Custom Levels' : `${world?.emoji} ${world?.name}`}
          </h2>
          <p className="text-white/60 text-sm">
            {selectedWorld === 99 ? 'Your created levels' : world?.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Level nodes - saga style vertical scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="relative max-w-sm mx-auto">
          {/* Connecting path line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full" />

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWorld}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {levels.map((level, i) => {
                const stars = levelStars[level.id] ?? 0;
                const unlocked = selectedWorld === 99 || isLevelUnlocked(level.id, level.world, level.worldIndex, levelStars);
                const isLeft = i % 2 === 0;

                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative flex items-center gap-3 mb-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    {/* Node */}
                    <div className="flex-1" />
                    <button
                      onClick={() => unlocked && onStartLevel(level.id)}
                      disabled={!unlocked}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg ${
                        unlocked
                          ? `${theme.node} text-white active:scale-95 hover:brightness-110`
                          : 'bg-slate-700 text-slate-500'
                      } ${stars === 3 ? 'ring-2 ring-amber-400/50' : ''}`}
                    >
                      {unlocked ? (
                        <>
                          <span className="text-lg font-bold">{level.worldIndex + 1}</span>
                          <Stars count={stars} size="text-[10px]" />
                        </>
                      ) : (
                        <span className="text-xl">🔒</span>
                      )}
                      {/* Boss indicator */}
                      {level.waves.some(w => w.groups.some(g => {
                        const enemyId = g.enemyId;
                        return enemyId === 'golem' || enemyId === 'dragon' || enemyId === 'demon';
                      })) && unlocked && (
                        <div className="absolute -top-1 -right-1 text-xs bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                          👑
                        </div>
                      )}
                    </button>
                    <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                      <div className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {level.name}
                      </div>
                      {unlocked && (
                        <div className="text-xs text-white/50">
                          {level.waves.length} waves
                        </div>
                      )}
                      {selectedWorld === 99 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteCustomLevel(level.id); }}
                          className="text-xs text-red-400 mt-0.5"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {levels.length === 0 && selectedWorld === 99 && (
            <div className="text-center text-white/50 mt-12">
              <p className="text-4xl mb-3">🔧</p>
              <p>No custom levels yet!</p>
              <p className="text-sm mt-1">Use the editor to create your first level.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
