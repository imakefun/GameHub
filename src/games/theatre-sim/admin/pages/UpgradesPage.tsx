import type { GameState } from '../../types';
import { theatreUpgrades, screenUpgrades } from '../../data';

interface Props { state: GameState | null }

export function UpgradesPage({ state }: Props) {
  const purchasedIds = state?.theatre.upgrades ?? [];
  const categories = ['lobby', 'exterior', 'restrooms', 'parking', 'accessibility'] as const;

  const byCat = categories.map(cat => ({
    name: cat,
    upgrades: theatreUpgrades.filter(u => u.category === cat),
  }));

  const totalUpgrades = theatreUpgrades.length;
  const purchasedCount = purchasedIds.length;
  const totalCost = theatreUpgrades.reduce((s, u) => s + u.cost, 0);
  const totalRepBonus = theatreUpgrades.reduce((s, u) => s + u.reputationBonus, 0);
  const totalCapBonus = theatreUpgrades.reduce((s, u) => s + (u.customerCapacityBonus ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Theatre Upgrades</div>
          <div className="text-lg font-bold">{purchasedCount}/{totalUpgrades}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Cost (All)</div>
          <div className="text-lg font-bold text-amber-400">${totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Rep Bonus</div>
          <div className="text-lg font-bold text-green-400">+{totalRepBonus}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Capacity Bonus</div>
          <div className="text-lg font-bold text-cyan-400">+{totalCapBonus}</div>
        </div>
      </div>

      {/* Theatre Upgrades by Category */}
      {byCat.map(cat => (
        <section key={cat.name}>
          <h3 className="text-sm font-semibold mb-2 text-slate-300 capitalize">{cat.name} <span className="text-[10px] text-slate-600">({cat.upgrades.length} upgrades)</span></h3>
          <div className="space-y-2">
            {cat.upgrades.map(upgrade => {
              const purchased = purchasedIds.includes(upgrade.id);
              const prereqMet = !upgrade.prerequisite || purchasedIds.includes(upgrade.prerequisite);
              const prereqUpgrade = upgrade.prerequisite ? theatreUpgrades.find(u => u.id === upgrade.prerequisite) : null;
              return (
                <div
                  key={upgrade.id}
                  className={`rounded-xl border px-4 py-3 ${
                    purchased
                      ? 'border-green-500/20 bg-green-500/5'
                      : prereqMet
                      ? 'border-slate-700/30 bg-slate-900/40'
                      : 'border-slate-800/20 bg-slate-900/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{upgrade.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{upgrade.name}</div>
                        <div className="text-[10px] text-slate-500">{upgrade.description}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm font-bold text-amber-400">${upgrade.cost.toLocaleString()}</div>
                      {purchased && <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Purchased</span>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                    <span>Rep: <span className="text-green-400">+{upgrade.reputationBonus}</span></span>
                    {(upgrade.customerCapacityBonus ?? 0) > 0 && (
                      <span>Capacity: <span className="text-cyan-400">+{upgrade.customerCapacityBonus}</span></span>
                    )}
                    {prereqUpgrade && (
                      <span>Requires: <span className={prereqMet ? 'text-green-400' : 'text-red-400'}>{prereqUpgrade.name}</span></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Prerequisite Chain Visualization */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Upgrade Prerequisite Chains</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-3">
          {categories.map(cat => {
            const upgrades = theatreUpgrades.filter(u => u.category === cat);
            // Build chain by following prerequisites
            const roots = upgrades.filter(u => !u.prerequisite || !upgrades.find(o => o.id === u.prerequisite));
            const chains: typeof upgrades[] = [];
            for (const root of roots) {
              const chain = [root];
              let current = root;
              while (true) {
                const next = upgrades.find(u => u.prerequisite === current.id);
                if (!next) break;
                chain.push(next);
                current = next;
              }
              chains.push(chain);
            }
            return (
              <div key={cat}>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 capitalize">{cat}</div>
                {chains.map((chain, ci) => (
                  <div key={ci} className="flex items-center gap-1 flex-wrap">
                    {chain.map((u, i) => (
                      <div key={u.id} className="flex items-center gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          purchasedIds.includes(u.id)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-800/60 text-slate-500'
                        }`}>
                          {u.icon} {u.name} (${u.cost.toLocaleString()})
                        </span>
                        {i < chain.length - 1 && <span className="text-slate-700 text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Screen Upgrades */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Screen Quality Upgrades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left border-b border-slate-800/40">
                <th className="py-2 pr-3 font-medium">Upgrade</th>
                <th className="py-2 pr-3 font-medium">Path</th>
                <th className="py-2 pr-3 font-medium text-right">Cost</th>
                <th className="py-2 pr-3 font-medium text-right">Days</th>
                <th className="py-2 pr-3 font-medium text-right">Seats Δ</th>
                <th className="py-2 font-medium text-right">Price Mult</th>
              </tr>
            </thead>
            <tbody>
              {screenUpgrades.map(u => (
                <tr key={u.id} className="border-b border-slate-800/20">
                  <td className="py-2 pr-3">
                    <span className="mr-1.5">{u.icon}</span>
                    <span className="text-slate-200">{u.name}</span>
                  </td>
                  <td className="py-2 pr-3 text-slate-400 capitalize">{u.fromQuality} → {u.toQuality}</td>
                  <td className="py-2 pr-3 text-right text-amber-400">${u.cost.toLocaleString()}</td>
                  <td className="py-2 pr-3 text-right text-slate-400">{u.daysToComplete}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className={u.seatsChange > 0 ? 'text-green-400' : u.seatsChange < 0 ? 'text-red-400' : 'text-slate-500'}>
                      {u.seatsChange > 0 ? '+' : ''}{u.seatsChange}
                    </span>
                  </td>
                  <td className="py-2 text-right text-cyan-400">×{u.ticketPriceMultiplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quality progression visualization */}
        <div className="mt-4 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Quality Progression Path</div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {['basic', 'standard', 'premium'].map((q, i) => (
              <div key={q} className="flex items-center gap-2">
                <span className="bg-slate-800/60 text-slate-300 px-2.5 py-1 rounded capitalize">{q}</span>
                {i < 2 && <span className="text-slate-700">→</span>}
              </div>
            ))}
            <span className="text-slate-700">→</span>
            <div className="flex flex-col gap-1">
              <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded text-[10px]">IMAX ($25k, 10d)</span>
              <span className="bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded text-[10px]">Dolby ($30k, 12d)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Screen unlock costs */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Screen Unlock Costs</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            {[0, 5000, 12000, 20000, 35000, 50000].map((cost, i) => {
              const unlocked = state ? state.theatre.screens[i]?.unlocked : false;
              return (
                <div key={i} className={`rounded-lg px-3 py-2 border ${unlocked ? 'border-green-500/20 bg-green-500/5' : 'border-slate-800/30 bg-slate-900/30'}`}>
                  <div className="font-medium">Screen {i + 1}</div>
                  <div className={`text-[10px] ${cost === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                    {cost === 0 ? 'Free' : `$${cost.toLocaleString()}`}
                  </div>
                  {unlocked && <div className="text-[9px] text-green-400 mt-0.5">Unlocked</div>}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-600 mt-2 text-center">
            Total to unlock all: ${(0 + 5000 + 12000 + 20000 + 35000 + 50000).toLocaleString()}
          </div>
        </div>
      </section>
    </div>
  );
}
