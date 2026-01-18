import { motion } from 'framer-motion';
import { Zap, Brain, Puzzle, Heart, Compass, Users, Gamepad, LayoutGrid, Clock } from 'lucide-react';
import { categoryInfo } from '../types/game';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  all: LayoutGrid,
  arcade: Gamepad,
  puzzle: Puzzle,
  action: Zap,
  strategy: Brain,
  adventure: Compass,
  casual: Heart,
  multiplayer: Users,
  idle: Clock,
};

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Games' },
    ...Object.entries(categoryInfo).map(([id, info]) => ({
      id,
      label: info.label,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = categoryIcons[category.id] || LayoutGrid;
        const isSelected = selected === category.id;

        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-surface-800/50 text-surface-300 hover:bg-surface-700/50 hover:text-white border border-surface-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.label}
            {isSelected && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
