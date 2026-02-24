import type { GameState } from '../../types';
import { concessionItems as allConcessions } from '../../data';

interface Props { state: GameState | null }

export function ConcessionsPage({ state }: Props) {
  const unlockedIds = state?.theatre.concessionMenu ?? [];
  const categories = ['snack', 'drink', 'combo', 'premium'] as const;

  const byCategory = categories.map(cat => ({
    name: cat,
    items: allConcessions.filter(c => c.category === cat),
  }));

  const totalItems = allConcessions.length;
  const unlockedCount = unlockedIds.length;
  const avgMargin = allConcessions.reduce((s, c) => s + ((c.price - c.cost) / c.price), 0) / totalItems * 100;
  const bestMarginItem = [...allConcessions].sort((a, b) => ((b.price - b.cost) / b.price) - ((a.price - a.cost) / a.price))[0];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Items</div>
          <div className="text-lg font-bold">{totalItems}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Unlocked</div>
          <div className="text-lg font-bold text-green-400">{unlockedCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Margin</div>
          <div className="text-lg font-bold text-amber-400">{avgMargin.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Best Margin</div>
          <div className="text-lg font-bold text-pink-400">{bestMarginItem?.icon} {bestMarginItem?.name}</div>
        </div>
      </div>

      {/* Stand level */}
      {state && (
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Concession Stand</div>
              <div className="text-[10px] text-slate-500">Level {state.theatre.concessionStand.level} — Capacity {state.theatre.concessionStand.capacity}</div>
            </div>
            <div className="text-xs text-slate-400">
              Next upgrade: ${state.theatre.concessionStand.upgradeCost.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Category tables */}
      {byCategory.map(cat => (
        <section key={cat.name}>
          <h3 className="text-sm font-semibold mb-2 text-slate-300 capitalize">{cat.name}s <span className="text-[10px] text-slate-600">({cat.items.length} items)</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium text-right">Cost</th>
                  <th className="py-2 pr-3 font-medium text-right">Price</th>
                  <th className="py-2 pr-3 font-medium text-right">Margin</th>
                  <th className="py-2 pr-3 font-medium text-right">Pop.</th>
                  <th className="py-2 pr-3 font-medium text-right">Unlock $</th>
                  <th className="py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {cat.items.sort((a, b) => b.popularity - a.popularity).map(item => {
                  const margin = ((item.price - item.cost) / item.price) * 100;
                  const profit = item.price - item.cost;
                  const unlocked = unlockedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`border-b border-slate-800/20 ${!unlocked ? 'opacity-50' : ''}`}>
                      <td className="py-2 pr-3">
                        <span className="mr-1.5">{item.icon}</span>
                        <span className="text-slate-200">{item.name}</span>
                      </td>
                      <td className="py-2 pr-3 text-right text-red-400">${item.cost.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right text-green-400">${item.price.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right">
                        <span className={margin >= 85 ? 'text-green-400' : margin >= 75 ? 'text-amber-400' : 'text-red-400'}>
                          {margin.toFixed(0)}% (${profit.toFixed(2)})
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-400">{item.popularity}</td>
                      <td className="py-2 pr-3 text-right text-slate-400">${item.unlockCost.toLocaleString()}</td>
                      <td className="py-2 text-center">
                        {unlocked ? (
                          <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Active</span>
                        ) : (
                          <span className="text-[9px] bg-slate-700/40 text-slate-500 px-1.5 py-0.5 rounded">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Margin visualization */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">Profit per Item (sorted by margin)</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-1">
          {[...allConcessions].sort((a, b) => (b.price - b.cost) - (a.price - a.cost)).map(item => {
            const profit = item.price - item.cost;
            const maxProfit = Math.max(...allConcessions.map(c => c.price - c.cost));
            const pct = (profit / maxProfit) * 100;
            return (
              <div key={item.id} className="flex items-center gap-2 h-5">
                <span className="text-[9px] text-slate-500 w-28 shrink-0 text-right truncate">{item.icon} {item.name}</span>
                <div className="flex-1 h-3 bg-slate-800/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500/60 to-pink-400/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] text-green-400 w-14 shrink-0 text-right">${profit.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Concession tuning */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Concession Tuning Constants</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Base buy rate</span><span>40% of customers</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Per concession worker bonus</span><span>+10%</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Max buy rate cap</span><span>85%</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Pricing weighted by</span><span>Item popularity</span></div>
        </div>
      </section>
    </div>
  );
}
