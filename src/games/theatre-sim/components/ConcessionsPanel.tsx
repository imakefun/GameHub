import type { GameState } from '../types';
import { concessionItems as allItems } from '../data';

interface Props {
  state: GameState;
  onUnlockItem: (itemId: string) => void;
  onUpgradeStand: () => void;
}

const categoryLabels: Record<string, string> = {
  snack: '🍿 Snacks',
  drink: '🥤 Drinks',
  combo: '🎬 Combos',
  premium: '🍷 Premium',
};

export function ConcessionsPanel({ state, onUnlockItem, onUpgradeStand }: Props) {
  const { concessionMenu, concessionStand } = state.theatre;
  const { money } = state.resources;

  const categories = ['snack', 'drink', 'combo', 'premium'] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Concessions</h3>
        <span className="text-sm text-slate-400">{concessionMenu.length} items on menu</span>
      </div>

      {/* Stand info */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Concession Stand</h4>
            <p className="text-xs text-slate-400">Level {concessionStand.level} • Capacity: {concessionStand.capacity}</p>
          </div>
          <button
            onClick={onUpgradeStand}
            disabled={money < concessionStand.upgradeCost}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              money >= concessionStand.upgradeCost
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Upgrade ${concessionStand.upgradeCost.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Menu items by category */}
      {categories.map(cat => {
        const items = allItems.filter(i => i.category === cat);
        return (
          <div key={cat}>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {categoryLabels[cat]}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map(item => {
                const isUnlocked = concessionMenu.includes(item.id);
                const margin = item.price - item.cost;
                const marginPct = ((margin / item.price) * 100).toFixed(0);

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-800/50 rounded-lg p-3 border transition-all ${
                      isUnlocked ? 'border-green-800/30' : 'border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <span className="text-sm font-medium text-white">{item.name}</span>
                          {isUnlocked && (
                            <span className="ml-1.5 text-[10px] text-green-400">ON MENU</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-500">Cost: ${item.cost.toFixed(2)}</span>
                      <span className="text-green-400">Sells: ${item.price.toFixed(2)}</span>
                      <span className="text-emerald-400">{marginPct}% margin</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Popularity</span>
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{ width: `${item.popularity}%` }}
                          />
                        </div>
                      </div>
                      {!isUnlocked && (
                        <button
                          onClick={() => onUnlockItem(item.id)}
                          disabled={money < item.unlockCost}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            money >= item.unlockCost
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {item.unlockCost === 0 ? 'Free' : `$${item.unlockCost.toLocaleString()}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
