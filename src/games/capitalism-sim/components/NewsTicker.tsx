// Late Stage Capitalism Simulator - News Ticker

import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import type { NewsItem } from '../types';

interface NewsTickerProps {
  news: NewsItem[];
}

function getNewsColor(category: NewsItem['category']): string {
  switch (category) {
    case 'acquisition': return 'text-green-400';
    case 'layoff': return 'text-orange-400';
    case 'bankruptcy': return 'text-red-400';
    case 'scandal': return 'text-red-400';
    case 'profit': return 'text-green-400';
    case 'market': return 'text-blue-400';
    default: return 'text-surface-400';
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsTicker({ news }: NewsTickerProps) {
  if (news.length === 0) {
    return (
      <div className="bg-surface-800 rounded-lg border border-surface-700 p-4">
        <div className="flex items-center gap-2 text-surface-400">
          <Newspaper className="w-5 h-5" />
          <span className="text-sm">No news yet. Make some headlines!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-700 overflow-hidden">
      <div className="p-3 border-b border-surface-700 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary-400" />
        <span className="font-medium">Breaking News</span>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {news.slice(0, 20).map((item, index) => (
          <motion.div
            key={item.id}
            initial={index === 0 ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 py-3 border-b border-surface-700/50 last:border-0 hover:bg-surface-750 transition-colors"
          >
            <p className={`text-sm ${getNewsColor(item.category)}`}>
              {item.headline}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              {formatTimeAgo(item.timestamp)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
