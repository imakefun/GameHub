import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Play, Users, Zap, Brain, Puzzle, Heart, Compass, Gamepad, Clock } from 'lucide-react';
import type { Game } from '../types/game';
import { categoryInfo } from '../types/game';

interface GameCardProps {
  game: Game;
  featured?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  arcade: Gamepad,
  puzzle: Puzzle,
  action: Zap,
  strategy: Brain,
  adventure: Compass,
  casual: Heart,
  multiplayer: Users,
  idle: Clock,
};

export function GameCard({ game, featured = false }: GameCardProps) {
  const CategoryIcon = categoryIcons[game.category] || Gamepad;
  const category = categoryInfo[game.category];

  const formatPlayCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-red-400 bg-red-400/10',
  };

  return (
    <Link to={`/games/${game.id}`}>
      <motion.article
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`group relative rounded-2xl overflow-hidden bg-surface-800/50 border border-surface-700/50 hover:border-primary-500/50 transition-all duration-300 ${
          featured ? 'md:col-span-2 md:row-span-2' : ''
        }`}
      >
        {/* Image */}
        <div className={`relative overflow-hidden ${featured ? 'h-64 md:h-80' : 'h-48'}`}>
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent" />

          {/* Play button overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-4 rounded-full bg-primary-500 text-white glow"
            >
              <Play className="w-8 h-8 fill-current" />
            </motion.div>
          </motion.div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${category.color}`}
            >
              <CategoryIcon className="w-3 h-3" />
              {category.label}
            </span>
          </div>

          {/* Featured badge */}
          {game.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors line-clamp-1">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 text-yellow-400 shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{game.rating}</span>
            </div>
          </div>

          <p className="text-surface-400 text-sm line-clamp-2 mb-3">{game.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-surface-500 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {formatPlayCount(game.playCount)}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[game.difficulty]}`}>
                {game.difficulty}
              </span>
            </div>

            {/* Tags */}
            <div className="hidden sm:flex items-center gap-1">
              {game.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-surface-700/50 text-surface-400 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10" />
        </div>
      </motion.article>
    </Link>
  );
}
