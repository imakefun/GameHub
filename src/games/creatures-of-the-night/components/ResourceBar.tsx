import { motion } from 'framer-motion';
import type { Currencies } from '../types';

interface ResourceBarProps {
  currencies: Currencies;
  playerLevel: number;
  experience: number;
  experienceNeeded: number;
}

const resources = [
  { key: 'shadowEssence' as const, label: 'Shadow Essence', icon: '🌑', color: 'from-purple-500 to-indigo-600' },
  { key: 'soulShards' as const, label: 'Soul Shards', icon: '💎', color: 'from-blue-500 to-cyan-600' },
  { key: 'lunarCrystals' as const, label: 'Lunar Crystals', icon: '🌙', color: 'from-amber-500 to-yellow-500' },
  { key: 'voidEnergy' as const, label: 'Void Energy', icon: '🔮', color: 'from-pink-500 to-purple-600' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

export function ResourceBar({ currencies, playerLevel, experience, experienceNeeded }: ResourceBarProps) {
  const expPercent = Math.min(100, (experience / experienceNeeded) * 100);

  return (
    <div className="space-y-3">
      {/* Level bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
          <span className="text-amber-400 font-bold text-sm">Lv.{playerLevel}</span>
        </div>
        <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-surface-400 w-20 text-right">
          {formatNumber(experience)}/{formatNumber(experienceNeeded)}
        </span>
      </div>

      {/* Currency row */}
      <div className="grid grid-cols-4 gap-2">
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
