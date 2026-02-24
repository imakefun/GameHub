import type { GameState } from '../../types';
import { franchiseLocations, milestones } from '../../data';

interface Props { state: GameState | null }

export function FranchisePage({ state }: Props) {
  const liveLocations = state?.franchiseLocations ?? franchiseLocations.map(l => ({ ...l, owned: false, manager: null }));
  const ownedCount = liveLocations.filter(l => l.owned).length;
  const totalPurchaseCost = franchiseLocations.reduce((s, l) => s + l.purchaseCost, 0);
  const totalDailyExpenses = franchiseLocations.reduce((s, l) => s + l.dailyExpenses, 0);
  const totalScreens = franchiseLocations.reduce((s, l) => s + l.screens, 0);

  const achievedMilestones = state?.milestones ?? [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Franchises</div>
          <div className="text-lg font-bold">{ownedCount}/{franchiseLocations.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Buy Cost</div>
          <div className="text-lg font-bold text-amber-400">${totalPurchaseCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Screens</div>
          <div className="text-lg font-bold text-cyan-400">{totalScreens}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Daily Expenses</div>
          <div className="text-lg font-bold text-red-400">${totalDailyExpenses.toLocaleString()}/day</div>
        </div>
      </div>

      {/* Location cards */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Franchise Locations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {franchiseLocations.map(loc => {
            const live = liveLocations.find(l => l.id === loc.id);
            const owned = live?.owned ?? false;
            const dailyRev = loc.screens * 400;
            const dailyProfit = dailyRev - loc.dailyExpenses;
            const roiDays = dailyProfit > 0 ? Math.ceil(loc.purchaseCost / dailyProfit) : Infinity;
            const currentRep = state?.resources.reputation ?? 0;
            const canUnlock = currentRep >= loc.unlockReputation;

            return (
              <div
                key={loc.id}
                className={`rounded-xl border p-4 ${
                  owned
                    ? 'border-green-500/20 bg-green-500/5'
                    : canUnlock
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-slate-800/30 bg-slate-900/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{loc.name}</div>
                    <div className="text-[10px] text-slate-500">{loc.city}</div>
                  </div>
                  {owned ? (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Owned</span>
                  ) : canUnlock ? (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Available</span>
                  ) : (
                    <span className="text-[9px] bg-slate-700/30 text-slate-600 px-2 py-0.5 rounded">Locked</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-slate-500">Purchase</span><span className="text-amber-400">${loc.purchaseCost.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Unlock Rep</span><span className={canUnlock ? 'text-green-400' : 'text-red-400'}>{loc.unlockReputation}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Screens</span><span>{loc.screens}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Condition</span><span>{loc.condition}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Daily Exp</span><span className="text-red-400">${loc.dailyExpenses.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Daily Rev (est)</span><span className="text-green-400">${dailyRev.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Daily Profit</span><span className={dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}>${dailyProfit.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ROI</span><span className="text-cyan-400">{roiDays === Infinity ? '—' : `${roiDays} days`}</span></div>
                </div>

                {live?.manager && (
                  <div className="mt-2 text-[10px] text-slate-400">Manager assigned: <span className="text-amber-400">{live.manager}</span></div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Franchise revenue formula */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Franchise Revenue Formula</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Revenue per screen</span><span>$400/day</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Requires</span><span>Manager assigned</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Profit</span><span>(screens × $400) − dailyExpenses</span></div>
        </div>
      </section>

      {/* ROI comparison chart */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">ROI Comparison</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-1.5">
          {franchiseLocations.sort((a, b) => {
            const profitA = a.screens * 400 - a.dailyExpenses;
            const profitB = b.screens * 400 - b.dailyExpenses;
            const roiA = profitA > 0 ? a.purchaseCost / profitA : Infinity;
            const roiB = profitB > 0 ? b.purchaseCost / profitB : Infinity;
            return roiA - roiB;
          }).map(loc => {
            const dailyProfit = loc.screens * 400 - loc.dailyExpenses;
            const roi = dailyProfit > 0 ? Math.ceil(loc.purchaseCost / dailyProfit) : 9999;
            const maxRoi = 400; // reasonable max for bar scale
            return (
              <div key={loc.id} className="flex items-center gap-2 h-5">
                <span className="text-[9px] text-slate-500 w-32 shrink-0 text-right truncate">{loc.name}</span>
                <div className="flex-1 h-3 bg-slate-800/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-400/40 rounded-full" style={{ width: `${Math.min((roi / maxRoi) * 100, 100)}%` }} />
                </div>
                <span className="text-[9px] text-cyan-400 w-16 shrink-0 text-right">{roi} days</span>
              </div>
            );
          })}
          <div className="text-[10px] text-slate-600 mt-1">Shorter bar = faster return on investment</div>
        </div>
      </section>

      {/* Milestones */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Milestones <span className="text-[10px] text-slate-600">({achievedMilestones.length}/{milestones.length} achieved)</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left border-b border-slate-800/40">
                <th className="py-2 pr-3 font-medium">Milestone</th>
                <th className="py-2 pr-3 font-medium">Condition</th>
                <th className="py-2 pr-3 font-medium text-right">Rep</th>
                <th className="py-2 pr-3 font-medium text-right">Money</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map(m => {
                const achieved = achievedMilestones.includes(m.id);
                return (
                  <tr key={m.id} className={`border-b border-slate-800/20 ${achieved ? '' : 'opacity-50'}`}>
                    <td className="py-2 pr-3">
                      <span className="mr-1.5">{m.icon}</span>
                      <span className="text-slate-200">{m.name}</span>
                    </td>
                    <td className="py-2 pr-3 text-slate-500 text-[10px]">{m.condition}</td>
                    <td className="py-2 pr-3 text-right text-green-400">{m.reputationReward > 0 ? `+${m.reputationReward}` : '—'}</td>
                    <td className="py-2 pr-3 text-right text-amber-400">{m.moneyReward > 0 ? `$${m.moneyReward.toLocaleString()}` : '—'}</td>
                    <td className="py-2 text-center">
                      {achieved ? (
                        <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Achieved</span>
                      ) : (
                        <span className="text-[9px] bg-slate-700/40 text-slate-500 px-1.5 py-0.5 rounded">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
