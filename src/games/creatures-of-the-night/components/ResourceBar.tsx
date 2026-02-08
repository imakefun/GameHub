import { motion } from 'framer-motion';
import type { Currencies } from '../types';

interface ResourceBarProps {
  currencies: Currencies;
  collectionLevel: number;
  collectionLevelPoints: number;
}

const resources = [
  { key: 'shadowEssence' as const, label: 'Shadow Essence', icon: '🌑', color: 'from-purple-500 to-indigo-600' },
  { key: 'lunarCrystals' as const, label: 'Lunar Crystals', icon: '🌙', color: 'from-amber-500 to-yellow-500' },
  { key: 'voidEnergy' as const, label: 'Void Energy', icon: '🔮', color: 'from-pink-500 to-purple-600' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

function pointsForLevel(level: number): number {
  const x = 10 * level - 5;
  return (x * x - 25) / 20;
}

export function ResourceBar({ currencies, collectionLevel, collectionLevelPoints }: ResourceBarProps) {
  const currentFloor = pointsForLevel(collectionLevel);
  const nextFloor = pointsForLevel(collectionLevel + 1);
  const progressInLevel = collectionLevelPoints - currentFloor;
  const levelRange = nextFloor - currentFloor;
  const clPercent = Math.min(100, (progressInLevel / levelRange) * 100);

  return (
    <div className="space-y-3" data-tutorial="resource-bar">
      {/* Collection Level bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
          <span className="text-amber-400 font-bold text-sm">CL {collectionLevel}</span>
        </div>
        <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${clPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-surface-400 w-20 text-right">
          {formatNumber(progressInLevel)}/{formatNumber(levelRange)}
        </span>
      </div>

      {/* Currency row */}
      <div className="grid grid-cols-3 gap-2">
        {resources.map((r) => (
          <div
            key={r.key}
            className="flex items-center gap-1.5 bg-surface-800/60 rounded-lg px-2.5 py-2 border border-surface-700/50"
            title={r.label}
          >
            <span className="text-base">{r.icon}</span>
            <span className="text-sm font-semibold text-white truncate">
              {formatNumber(currencies[r.key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
