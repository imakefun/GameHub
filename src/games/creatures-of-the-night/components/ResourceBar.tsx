import type { Currencies } from '../types';

interface ResourceBarProps {
  currencies: Currencies;
  collectionLevel: number;
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

export function ResourceBar({ currencies, collectionLevel }: ResourceBarProps) {
  return (
    <div className="space-y-3" data-tutorial="resource-bar">
      {/* Collection Level display (linear) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
          <span className="text-amber-400 font-bold text-sm">CL {collectionLevel}</span>
        </div>
        <span className="text-xs text-surface-400">
          Collection Level
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
