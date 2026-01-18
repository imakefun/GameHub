import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ChevronRight, Gamepad2 } from 'lucide-react';
import { games, leaderboards } from '../data/games';

export function LeaderboardsPage() {

  // Get all games that have leaderboards
  const gamesWithLeaderboards = games.filter((game) => leaderboards[game.id]?.length > 0);

  // Get global top players (across all games)
  const globalTopPlayers = Object.entries(leaderboards)
    .flatMap(([gameId, entries]) =>
      entries.map((entry) => ({
        ...entry,
        gameTitle: games.find((g) => g.id === gameId)?.title || 'Unknown',
      }))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-surface-500 font-bold">
            {rank}
          </span>
        );
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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Leaderboards
          </h1>
          <p className="text-surface-400 mt-2">See who's dominating the competition</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Global Top Players */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Global Top Players</h2>
              </div>

              <div className="space-y-3">
                {globalTopPlayers.map((player, index) => (
                  <motion.div
                    key={`${player.gameId}-${player.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankStyle(
                      index + 1
                    )}`}
                  >
                    {/* Rank */}
                    <div className="w-10 flex justify-center">{getRankIcon(index + 1)}</div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{player.playerName}</p>
                      <Link
                        to={`/games/${player.gameId}`}
                        className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {player.gameTitle}
                      </Link>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="font-bold text-xl gradient-text">
                        {player.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-surface-500">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Game Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">By Game</h2>
              </div>

              <div className="space-y-2">
                {gamesWithLeaderboards.map((game) => {
                  const topScore = leaderboards[game.id]?.[0];
                  return (
                    <Link key={game.id} to={`/games/${game.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/50 hover:border-primary-500/30 transition-all"
                      >
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{game.title}</p>
                          {topScore && (
                            <p className="text-sm text-surface-400">
                              Top: {topScore.playerName} - {topScore.score.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-500" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Individual Game Leaderboards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">All Game Rankings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesWithLeaderboards.map((game) => {
              const entries = leaderboards[game.id] || [];
              return (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl overflow-hidden"
                >
                  {/* Game Header */}
                  <Link to={`/games/${game.id}`}>
                    <div className="relative h-32">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-900 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <h3 className="font-bold text-white">{game.title}</h3>
                      </div>
                    </div>
                  </Link>

                  {/* Top 5 */}
                  <div className="p-4">
                    <div className="space-y-2">
                      {entries.slice(0, 5).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-6 text-center">
                            {entry.rank <= 3 ? (
                              getRankIcon(entry.rank)
                            ) : (
                              <span className="text-surface-500 font-medium">{entry.rank}</span>
                            )}
                          </span>
                          <span className="flex-1 text-white truncate">{entry.playerName}</span>
                          <span className="text-surface-400 font-medium">
                            {entry.score.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/games/${game.id}`}
                      className="mt-4 flex items-center justify-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View all rankings
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
