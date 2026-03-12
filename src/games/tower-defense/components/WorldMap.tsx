import { motion, AnimatePresence } from 'framer-motion';
import { WORLDS } from '../data/worlds';
import { getLevelsForWorld } from '../data/levels';
import type { LevelDef } from '../types';
import { getSpriteUrl } from '../assets/sprites';
import { monetizationManager } from '../systems/monetization';

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

const THEME_COLORS: Record<string, { bg: string; nodeBg: string }> = {
  forest: { bg: 'from-green-900 via-emerald-950 to-green-950', nodeBg: '#059669' },
  desert: { bg: 'from-amber-900 via-orange-950 to-yellow-950', nodeBg: '#d97706' },
  ice: { bg: 'from-sky-900 via-cyan-950 to-blue-950', nodeBg: '#0ea5e9' },
  volcano: { bg: 'from-red-900 via-red-950 to-orange-950', nodeBg: '#dc2626' },
  shadow: { bg: 'from-purple-900 via-violet-950 to-slate-950', nodeBg: '#9333ea' },
  crystal: { bg: 'from-cyan-900 via-teal-950 to-emerald-950', nodeBg: '#06b6d4' },
};

function isLevelUnlocked(_levelId: string, world: number, worldIndex: number, levelStars: Record<string, number>): boolean {
  if (world === 1 && worldIndex === 0) return true;
  if (worldIndex === 0) {
    const prevWorld = world - 1;
    const prevLevels = getLevelsForWorld(prevWorld);
    if (prevLevels.length === 0) return false;
    const lastLevel = prevLevels[prevLevels.length - 1];
    return (levelStars[lastLevel.id] ?? 0) > 0;
  }
  const worldLevels = getLevelsForWorld(world);
  const prevLevel = worldLevels[worldIndex - 1];
  if (!prevLevel) return false;
  return (levelStars[prevLevel.id] ?? 0) > 0;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3].map(i => (
        <img
          key={i}
          src={getSpriteUrl('ui', i <= count ? 'star' : 'starEmpty')}
          alt=""
          className="w-3 h-3"
        />
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

  const showCustom = customLevels.length > 0;
  const gems = monetizationManager.getGems();
  const gemIconUrl = getSpriteUrl('ui', 'gem');

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <img src={getSpriteUrl('ui', 'star')} alt="" className="w-4 h-4" />
            <span className="text-amber-300 font-bold text-sm">{totalStars}</span>
          </div>
          {gems > 0 && (
            <div className="flex items-center gap-1">
              <img src={gemIconUrl} alt="" className="w-4 h-4" />
              <span className="text-purple-300 font-bold text-sm">{gems}</span>
            </div>
          )}
        </div>
        <button
          onClick={onEditor}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          Editor
        </button>
      </div>

      {/* World selector */}
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
                  ? 'bg-white/20 text-white ring-2 ring-white/30 scale-105 shadow-lg'
                  : 'bg-white/5 text-white/50'
              }`}
            >
              <span className="text-lg">{w.emoji}</span>
              <div className="mt-0.5">{w.name}</div>
              <div className="text-amber-400 flex items-center gap-0.5 justify-center">
                {wStars}/{maxStars}
                <img src={getSpriteUrl('ui', 'star')} alt="" className="w-2.5 h-2.5" />
              </div>
            </button>
          );
        })}
        {showCustom && (
          <button
            onClick={() => onSelectWorld(99)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedWorld === 99
                ? 'bg-white/20 text-white ring-2 ring-white/30 scale-105'
                : 'bg-white/5 text-white/50'
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
          <p className="text-white/50 text-sm">
            {selectedWorld === 99 ? 'Your created levels' : world?.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Level nodes */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="relative max-w-sm mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 rounded-full"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' }}
          />

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
                const hasBoss = level.waves.some(w => w.groups.some(g => {
                  return g.enemyId === 'golem' || g.enemyId === 'dragon' || g.enemyId === 'demon';
                }));

                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`relative flex items-center gap-3 mb-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className="flex-1" />
                    <button
                      onClick={() => unlocked && onStartLevel(level.id)}
                      disabled={!unlocked}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg ${
                        unlocked
                          ? 'text-white active:scale-95 hover:brightness-110'
                          : 'bg-slate-700/80 text-slate-500'
                      } ${stars === 3 ? 'ring-2 ring-amber-400/40' : ''}`}
                      style={unlocked ? { backgroundColor: theme.nodeBg } : undefined}
                    >
                      {unlocked ? (
                        <>
                          <span className="text-lg font-bold drop-shadow">{level.worldIndex + 1}</span>
                          <StarDisplay count={stars} />
                        </>
                      ) : (
                        <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C9.24 2 7 4.24 7 7v3H5v12h14V10h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
                        </svg>
                      )}
                      {hasBoss && unlocked && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <img src={getSpriteUrl('ui', 'crown')} alt="boss" className="w-5 h-5 drop-shadow" />
                        </div>
                      )}
                    </button>
                    <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                      <div className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {level.name}
                      </div>
                      {unlocked && (
                        <div className="text-xs text-white/40">
                          {level.waves.length} waves
                        </div>
                      )}
                      {selectedWorld === 99 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteCustomLevel(level.id); }}
                          className="text-xs text-red-400/70 hover:text-red-400 mt-0.5 transition-colors"
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
            <div className="text-center text-white/40 mt-12">
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
