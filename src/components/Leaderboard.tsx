import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import type { LeaderboardEntry } from '../types/game';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export function Leaderboard({ entries, title = 'Leaderboard' }: LeaderboardProps) {
  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-surface-500 font-bold">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/30';
      default:
        return 'bg-surface-800/30 border-surface-700/30';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-surface-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No scores yet. Be the first to play!</p>
        </div>
      ) : (
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {entries.map((entry) => (
            <motion.li
              key={entry.id}
              variants={item}
              whileHover={{ scale: 1.02, x: 4 }}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${getRankStyle(entry.rank)}`}
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{entry.playerName}</p>
                <p className="text-xs text-surface-500">
                  {new Date(entry.achievedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="font-bold text-lg gradient-text">{formatScore(entry.score)}</p>
                <p className="text-xs text-surface-500">points</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
