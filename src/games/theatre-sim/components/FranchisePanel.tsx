import type { GameState } from '../types';
import { milestones as allMilestones } from '../data';

interface Props {
  state: GameState;
  onPurchaseFranchise: (locationId: string) => void;
  onAssignManager: (locationId: string, managerId: string) => void;
}

export function FranchisePanel({ state, onPurchaseFranchise, onAssignManager }: Props) {
  const { franchiseLocations, resources, staff, milestones } = state;
  const ownedCount = franchiseLocations.filter(f => f.owned).length;

  // Managers that can be assigned (high-skill staff not already managing)
  const assignedManagerIds = franchiseLocations.filter(f => f.manager).map(f => f.manager);
  const availableManagers = staff.filter(
    s => s.role === 'manager' && !assignedManagerIds.includes(s.id)
  );

  const totalFranchiseIncome = franchiseLocations
    .filter(f => f.owned && f.manager)
    .reduce((sum, f) => sum + f.dailyRevenue - f.dailyExpenses, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Theatre Empire</h3>
        <span className="text-sm text-slate-400">
          {ownedCount} location{ownedCount !== 1 ? 's' : ''} • ${Math.floor(totalFranchiseIncome).toLocaleString()}/day
        </span>
      </div>

      {/* Empire overview */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 rounded-xl p-4 border border-purple-800/30">
        <p className="text-purple-200/80 text-sm leading-relaxed">
          Your theatre has become a local institution. Now it's time to think bigger.
          Acquire struggling theatres across the region and build a cinema empire.
          Each location needs a manager to generate revenue.
        </p>
      </div>

      {/* Franchise locations */}
      <div className="space-y-3">
        {franchiseLocations.map(location => {
          const canUnlock = resources.reputation >= location.unlockReputation;
          const canAfford = resources.money >= location.purchaseCost;
          const dailyProfit = location.dailyRevenue - location.dailyExpenses;

          if (!canUnlock && !location.owned) {
            return (
              <div
                key={location.id}
                className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/20 opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <span className="text-slate-500 font-medium">{location.name}</span>
                      <p className="text-xs text-slate-600">{location.city} • {location.screens} screens</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">Need {location.unlockReputation} reputation</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={location.id}
              className={`rounded-xl p-4 border transition-all ${
                location.owned
                  ? 'bg-slate-800/50 border-green-800/30'
                  : 'bg-slate-800/50 border-slate-700/30 hover:border-blue-600/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{location.owned ? '🏢' : '🏚️'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{location.name}</span>
                      {location.owned && <span className="text-[10px] text-green-400 font-medium">OWNED</span>}
                    </div>
                    <p className="text-xs text-slate-400">{location.city} • {location.screens} screens</p>
                    {location.owned && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-400">Condition: {location.condition}%</span>
                        <span className="text-slate-400">Rep: {location.reputation}</span>
                        {location.manager ? (
                          <span className={`${dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${dailyProfit >= 0 ? '+' : ''}{Math.floor(dailyProfit).toLocaleString()}/day
                          </span>
                        ) : (
                          <span className="text-yellow-400">Needs manager</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {!location.owned && (
                    <button
                      onClick={() => onPurchaseFranchise(location.id)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                        canAfford
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Buy ${location.purchaseCost.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>

              {/* Manager assignment */}
              {location.owned && !location.manager && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  {availableManagers.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400">Assign a manager:</span>
                      {availableManagers.map(mgr => (
                        <button
                          key={mgr.id}
                          onClick={() => onAssignManager(location.id, mgr.id)}
                          className="w-full flex items-center gap-2 p-2 rounded bg-slate-900/50 hover:bg-slate-700/50 text-left"
                        >
                          <span>👔</span>
                          <span className="text-sm text-white">{mgr.name}</span>
                          <span className="text-xs text-slate-400">Skill: {Math.floor(mgr.skill)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-yellow-400/70">
                      Hire a manager from the Staff tab to run this location.
                    </p>
                  )}
                </div>
              )}

              {location.owned && location.manager && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">👔</span>
                  <span className="text-xs text-slate-400">
                    Managed by {staff.find(s => s.id === location.manager)?.name ?? 'Manager'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div>
        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Milestones ({milestones.length}/{allMilestones.length})
        </h4>
        <div className="space-y-1">
          {allMilestones.map(m => {
            const achieved = milestones.includes(m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  achieved ? 'bg-green-900/10' : 'bg-slate-800/20'
                }`}
              >
                <span className={`text-lg ${achieved ? '' : 'grayscale opacity-40'}`}>{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${achieved ? 'text-green-400' : 'text-slate-500'}`}>
                    {m.name}
                  </span>
                  <p className="text-[10px] text-slate-600">{m.description}</p>
                </div>
                {achieved && <span className="text-green-400 text-sm">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
