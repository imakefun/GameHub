import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shuffle, Trash2, Play, RefreshCw } from 'lucide-react';
import type { DesignerLevel, SubmittedLevel } from '../types';
import { fetchSubmittedLevels, deleteSubmittedLevel } from '../data/submittedLevels';

interface SubmittedLevelsProps {
  onBack: () => void;
  onPlay: (level: DesignerLevel) => void;
}

export function SubmittedLevels({ onBack, onPlay }: SubmittedLevelsProps) {
  const [levels, setLevels] = useState<SubmittedLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchSubmittedLevels();
    setLevels(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteSubmittedLevel(id);
    setLevels(prev => prev.filter(l => l.id !== id));
  }, []);

  const handlePlayRandom = useCallback(() => {
    if (levels.length === 0) return;
    const level = levels[Math.floor(Math.random() * levels.length)];
    onPlay(level);
  }, [levels, onPlay]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-sm border-b border-stone-800">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-sm font-bold text-amber-400">Community Levels</h1>

          <button
            onClick={refresh}
            className="flex items-center gap-1 text-stone-500 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="text-xs">{levels.length}</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-20">
        {/* Play Random button */}
        {levels.length > 0 && (
          <motion.button
            onClick={handlePlayRandom}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm transition-all"
          >
            <Shuffle size={18} />
            <span>Play Random Level</span>
          </motion.button>
        )}

        {/* Loading state */}
        {loading && levels.length === 0 && (
          <div className="text-center py-16">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-stone-500" />
            <p className="text-stone-500 text-sm">Loading community levels...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && levels.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-stone-400 text-sm">No community levels yet.</p>
            <p className="text-stone-500 text-xs mt-1">Design a level and hit Submit to add it here!</p>
          </div>
        )}

        {/* Level list */}
        {levels.map((level, i) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/80 border border-stone-700/50"
          >
            {/* Level info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{level.name}</span>
                <span className="text-[10px] text-stone-600">{level.rows}x{level.cols}</span>
              </div>
              <div className="text-xs text-stone-500 truncate">{level.description}</div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-stone-600">{level.maxMoves} moves</span>
                <span className="text-[10px] text-stone-600">{level.availableGems.length} gems</span>
                <span className="text-[10px] text-stone-600">{formatDate(level.submittedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => onPlay(level)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium text-white transition-colors"
            >
              <Play size={14} />
              <span>Play</span>
            </button>
            <button
              onClick={() => handleDelete(level.id)}
              className="p-2 text-stone-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
