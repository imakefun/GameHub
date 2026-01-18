import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { games, getFeaturedGames, leaderboards } from '../data/games';

export function HomePage() {
  const featuredGames = getFeaturedGames();
  const popularGames = [...games].sort((a, b) => b.playCount - a.playCount).slice(0, 4);
  const topPlayers = Object.values(leaderboards)
    .flat()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Welcome to the ultimate game hub
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Play, Compete, and{' '}
              <span className="gradient-text">Dominate</span>
            </h1>

            <p className="text-xl text-surface-300 max-w-2xl mx-auto mb-8">
              Discover our curated collection of quality games. Challenge yourself,
              climb the leaderboards, and become a legend.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/games">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
                >
                  Browse Games
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/leaderboards">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-800 text-white font-semibold border border-surface-700 hover:border-surface-600 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboards
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-400" />
                Featured Games
              </h2>
              <p className="text-surface-400 mt-1">Hand-picked games for the best experience</p>
            </div>
            <Link
              to="/games?featured=true"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.slice(0, 4).map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              >
                <GameCard game={game} featured={index === 0} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="py-16 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent-400" />
                Most Popular
              </h2>
              <p className="text-surface-400 mt-1">Games everyone is playing right now</p>
            </div>
            <Link
              to="/games?sort=popular"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard game={game} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Hall of Fame
            </h2>
            <p className="text-surface-400 mt-1">Top players across all games</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`glass rounded-2xl p-6 text-center ${
                  index === 0 ? 'bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/30' : ''
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white'
                      : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white'
                          : 'bg-surface-700 text-surface-300'
                  }`}
                >
                  {index + 1}
                </div>
                <h3 className="font-bold text-white mb-1">{player.playerName}</h3>
                <p className="text-2xl font-bold gradient-text">{player.score.toLocaleString()}</p>
                <p className="text-xs text-surface-500 mt-1">points</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
              <p className="text-surface-300 mb-8 max-w-xl mx-auto">
                Jump into our collection of {games.length} amazing games. New games added regularly!
              </p>
              <Link to="/games">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
                >
                  Start Playing Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
