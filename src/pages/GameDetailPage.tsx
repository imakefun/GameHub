import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  ArrowLeft,
  Star,
  Users,
  Calendar,
  Tag,
  Zap,
  Brain,
  Puzzle,
  Heart,
  Compass,
  Gamepad,
} from 'lucide-react';
import { Leaderboard } from '../components/Leaderboard';
import { GameCard } from '../components/GameCard';
import { getGameById, getLeaderboard, getGamesByCategory } from '../data/games';
import { categoryInfo } from '../types/game';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  arcade: Gamepad,
  puzzle: Puzzle,
  action: Zap,
  strategy: Brain,
  adventure: Compass,
  casual: Heart,
  multiplayer: Users,
};

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const game = id ? getGameById(id) : undefined;
  const leaderboard = id ? getLeaderboard(id) : [];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gamepad className="w-16 h-16 mx-auto mb-4 text-surface-600" />
          <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-surface-400 mb-6">The game you're looking for doesn't exist.</p>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[game.category] || Gamepad;
  const category = categoryInfo[game.category];
  const relatedGames = getGamesByCategory(game.category)
    .filter((g) => g.id !== game.id)
    .slice(0, 4);

  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    hard: 'text-red-400 bg-red-400/10 border-red-400/30',
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link to="/games">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-white font-medium hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start gap-4 mb-6">
                {/* Category Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white ${category.color}`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {category.label}
                </span>

                {/* Featured Badge */}
                {game.featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                    Featured
                  </span>
                )}

                {/* Difficulty */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[game.difficulty]}`}
                >
                  {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{game.title}</h1>

              <p className="text-lg text-surface-300 mb-6">{game.description}</p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{game.rating}</span>
                  <span className="text-surface-400">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-semibold">{game.playCount.toLocaleString()}</span>
                  <span className="text-surface-400">Plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-surface-400" />
                  <span className="text-surface-400">
                    Added {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <Tag className="w-4 h-4 text-surface-500" />
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-surface-700/50 text-surface-300 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
              >
                <Play className="w-6 h-6 fill-current" />
                Play Now
              </motion.button>
            </motion.div>

            {/* How to Play */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
              <div className="prose prose-invert max-w-none">
                <ul className="space-y-2 text-surface-300">
                  <li>Use arrow keys or WASD to move</li>
                  <li>Press Space to perform action</li>
                  <li>Collect power-ups to boost your score</li>
                  <li>Avoid obstacles and enemies</li>
                  <li>Beat the high score to climb the leaderboard!</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Leaderboard entries={leaderboard} title="Top Scores" />
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Game Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Total Plays</span>
                  <span className="text-white font-semibold">{game.playCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Average Rating</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    {game.rating}
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">High Score</span>
                  <span className="text-white font-semibold">
                    {leaderboard[0]?.score.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Difficulty</span>
                  <span className={`font-semibold capitalize ${
                    game.difficulty === 'easy' ? 'text-green-400' :
                    game.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">More {category.label} Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGames.map((relatedGame) => (
                <GameCard key={relatedGame.id} game={relatedGame} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
