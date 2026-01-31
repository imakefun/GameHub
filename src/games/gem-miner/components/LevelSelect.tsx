import { motion } from 'framer-motion';
import { ArrowLeft, Pickaxe, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEVELS } from '../data/levels';

interface LevelSelectProps {
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onDesigner: () => void;
}

function StarIcons({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-[10px] ${i <= count ? 'opacity-100' : 'opacity-20'}`}>
          ⭐
        </span>
      ))}
    </div>
  );
}

// Group levels by zones
const ZONES = [
  { name: 'Surface', range: [1, 3], color: '#78716c', emoji: '⛏️' },
  { name: 'Crystal Caves', range: [4, 6], color: '#06b6d4', emoji: '🧊' },
  { name: 'Rocky Depths', range: [7, 9], color: '#a8a29e', emoji: '🪨' },
  { name: 'Obsidian Caverns', range: [10, 12], color: '#374151', emoji: '🌋' },
  { name: 'The Motherload', range: [13, 15], color: '#d97706', emoji: '💎' },
];

export function LevelSelect({ levelStars, onSelectLevel, onDesigner }: LevelSelectProps) {
  const navigate = useNavigate();

  // A level is unlocked if it's level 1 or the previous level has stars
  const isUnlocked = (levelId: number): boolean => {
    if (levelId === 1) return true;
    return (levelStars[levelId - 1] || 0) > 0;
  };

  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const maxStars = LEVELS.length * 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-sm border-b border-stone-800">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <Pickaxe size={20} className="text-amber-500" />
            <h1 className="text-lg font-bold text-amber-400">Gem Miner</h1>
          </div>

          <button
            onClick={onDesigner}
            className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-stone-800"
          >
            <Wrench size={16} />
            <span className="text-xs">Design</span>
          </button>
        </div>

        {/* Star progress */}
        <div className="max-w-md mx-auto px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">⭐ {totalStars}/{maxStars}</span>
            <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${(totalStars / maxStars) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level list by zone */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-6 pb-20">
        {ZONES.map((zone, zi) => {
          const zoneLevels = LEVELS.filter(l => l.id >= zone.range[0] && l.id <= zone.range[1]);

          return (
            <motion.div
              key={zone.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: zi * 0.1 }}
            >
              {/* Zone header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{zone.emoji}</span>
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: zone.color }}>
                  {zone.name}
                </h2>
                <div className="flex-1 h-px" style={{ background: zone.color, opacity: 0.3 }} />
              </div>

              {/* Level cards */}
              <div className="space-y-2">
                {zoneLevels.map((level) => {
                  const unlocked = isUnlocked(level.id);
                  const stars = levelStars[level.id] || 0;

                  return (
                    <motion.button
                      key={level.id}
                      onClick={() => unlocked && onSelectLevel(level.id)}
                      disabled={!unlocked}
                      whileTap={unlocked ? { scale: 0.98 } : undefined}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        unlocked
                          ? 'bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-amber-700/30 active:bg-stone-700'
                          : 'bg-stone-900/50 border border-stone-800/30 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Level number */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          stars > 0
                            ? 'bg-amber-600/20 text-amber-400 border border-amber-600/40'
                            : unlocked
                            ? 'bg-stone-700 text-stone-300 border border-stone-600'
                            : 'bg-stone-800 text-stone-600 border border-stone-700'
                        }`}
                      >
                        {unlocked ? level.id : '🔒'}
                      </div>

                      {/* Level info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-stone-600'}`}>
                            {level.name}
                          </span>
                          <span className="text-[10px] text-stone-600">{level.depth}m</span>
                        </div>
                        <div className="text-xs text-stone-500 truncate">{level.description}</div>
                        {stars > 0 && <StarIcons count={stars} />}
                      </div>

                      {/* Objectives preview */}
                      <div className="flex flex-col items-end gap-0.5">
                        {level.objectives.slice(0, 2).map((obj, i) => (
                          <span key={i} className="text-[10px] text-stone-600">
                            {obj.type === 'score' ? `${obj.target} pts` :
                             obj.type === 'collect_gems' ? `${obj.target} ${obj.gemType}` :
                             obj.type === 'clear_rocks' ? `${obj.target} rocks` :
                             obj.type === 'clear_ice' ? `${obj.target} ice` :
                             obj.type === 'clear_dirt' ? `${obj.target} dirt` : ''}
                          </span>
                        ))}
                        <span className="text-[10px] text-stone-600">{level.maxMoves} moves</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
