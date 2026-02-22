import type { GameState } from '../types';
import { theatreUpgrades } from '../data';

interface Props {
  state: GameState;
  onPurchaseUpgrade: (upgradeId: string) => void;
}

const categoryLabels: Record<string, string> = {
  lobby: '🏠 Lobby',
  exterior: '🏛️ Exterior',
  restrooms: '🚻 Restrooms',
  parking: '🅿️ Parking',
  accessibility: '♿ Accessibility',
};

export function UpgradesPanel({ state, onPurchaseUpgrade }: Props) {
  const { upgrades } = state.theatre;
  const { money } = state.resources;
  const categories = ['lobby', 'exterior', 'restrooms', 'parking', 'accessibility'] as const;

  const totalPurchased = upgrades.length;
  const totalAvailable = theatreUpgrades.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Theatre Upgrades</h3>
        <span className="text-sm text-slate-400">{totalPurchased}/{totalAvailable} purchased</span>
      </div>

      {/* Theatre condition */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Theatre Condition</span>
          <span className={`text-sm font-medium ${
            state.theatre.condition > 70 ? 'text-green-400' :
            state.theatre.condition > 40 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {Math.floor(state.theatre.condition)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              state.theatre.condition > 70 ? 'bg-green-500' :
              state.theatre.condition > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${state.theatre.condition}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Hire janitors to maintain condition. Low condition hurts reputation.</p>
      </div>

      {/* Upgrades by category */}
      {categories.map(cat => {
        const catUpgrades = theatreUpgrades.filter(u => u.category === cat);
        if (catUpgrades.length === 0) return null;
        return (
          <div key={cat}>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {categoryLabels[cat]}
            </h4>
            <div className="space-y-2">
              {catUpgrades.map(upgrade => {
                const purchased = upgrades.includes(upgrade.id);
                const prereqMet = !upgrade.prerequisite || upgrades.includes(upgrade.prerequisite);
                const canAfford = money >= upgrade.cost;
                const canBuy = !purchased && prereqMet && canAfford;

                return (
                  <div
                    key={upgrade.id}
                    className={`bg-slate-800/50 rounded-lg p-3 border transition-all ${
                      purchased
                        ? 'border-green-800/30 opacity-70'
                        : canBuy
                        ? 'border-slate-700/30 hover:border-blue-600/50'
                        : 'border-slate-700/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl">{upgrade.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${purchased ? 'text-green-400' : 'text-white'}`}>
                              {upgrade.name}
                            </span>
                            {purchased && <span className="text-green-400 text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-slate-400">{upgrade.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            {upgrade.reputationBonus > 0 && (
                              <span className="text-blue-400">+{upgrade.reputationBonus} rep</span>
                            )}
                            {upgrade.customerCapacityBonus > 0 && (
                              <span className="text-green-400">+{upgrade.customerCapacityBonus} capacity</span>
                            )}
                            {!prereqMet && upgrade.prerequisite && (
                              <span className="text-red-400">
                                Requires: {theatreUpgrades.find(u => u.id === upgrade.prerequisite)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!purchased && (
                        <button
                          onClick={() => onPurchaseUpgrade(upgrade.id)}
                          disabled={!canBuy}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                            canBuy
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          ${upgrade.cost.toLocaleString()}
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
