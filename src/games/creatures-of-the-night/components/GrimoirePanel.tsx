import type { GameState, GameConfig, CardType } from '../types';
import { CARD_TYPE_INFO } from '../types';
import { isNightTime, getLunarPhase, WEEKLY_MILESTONES, LOGIN_STREAK_MILESTONES } from '../hooks/useGameState';
import { clRoadPhase1 } from '../data/clConfig';

interface GrimoirePanelProps {
  state: GameState;
  config: GameConfig;
  onCompleteQuest: (questIndex: number) => void;
  onClaimWeeklyReward: (tier: number) => void;
  onClaimLoginStreakReward: (milestone: number) => void;
  onOpenCLRoad: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

const LUNAR_DISPLAY: Record<string, { emoji: string; label: string; effect: string }> = {
  new_moon: { emoji: '🌑', label: 'New Moon', effect: 'Shadow/Cursed +75%' },
  waxing: { emoji: '🌒', label: 'Waxing', effect: 'No special bonus' },
  full_moon: { emoji: '🌕', label: 'Full Moon', effect: 'All +10%, Lycanthrope +100%' },
  waning: { emoji: '🌘', label: 'Waning', effect: 'No special bonus' },
  blood_moon: { emoji: '🔴', label: 'Blood Moon', effect: 'Blood +200%, Lycanthrope +100%, Others +25%' },
  none: { emoji: '🌙', label: 'Normal', effect: '' },
};

function formatWeeklyReward(rewards: { shadowEssence?: number; soulShards?: number; lunarCrystals?: number; tome?: string }): string {
  const parts: string[] = [];
  if (rewards.tome) {
    const tomeNames: Record<string, string> = { 'standard-tome': 'Standard Tome', 'enhanced-tome': 'Enhanced Tome', 'premium-tome': 'Premium Tome' };
    parts.push(tomeNames[rewards.tome] || rewards.tome);
  }
  if (rewards.soulShards) parts.push(`${rewards.soulShards} Shards`);
  if (rewards.lunarCrystals) parts.push(`${rewards.lunarCrystals} LC`);
  return parts.join(' + ');
}

export function GrimoirePanel({
  state,
  config,
  onCompleteQuest,
  onClaimWeeklyReward,
  onClaimLoginStreakReward,
  onOpenCLRoad,
}: GrimoirePanelProps) {
  const night = isNightTime();
  const lunarPhase = getLunarPhase();
  const lunar = LUNAR_DISPLAY[lunarPhase] || LUNAR_DISPLAY.none;

  // All unclaimed CL rewards (cards + resources)
  const unclaimedRewards = config.clRewards.filter(
    (r) => r.cl <= state.collectionLevel && !state.clRewardsClaimed.includes(r.cl)
  );

  // Compute active synergies from crypt cards
  const cryptCards = state.ownedCards.filter((c) => c.placedInCrypt);
  const typeCounts: Partial<Record<CardType, number>> = {};
  cryptCards.forEach((c) => {
    const def = config.cards.find((d) => d.id === c.definitionId);
    if (def) typeCounts[def.type] = (typeCounts[def.type] || 0) + 1;
  });

  const activeTypeSynergies = config.typeSynergies
    .map((syn) => {
      const count = typeCounts[syn.type] || 0;
      const activeThresholds = syn.thresholds.filter((t) => count >= t.count);
      if (activeThresholds.length === 0) return null;
      const best = activeThresholds[activeThresholds.length - 1];
      return { type: syn.type, count, bonus: best.bonus, thresholds: syn.thresholds };
    })
    .filter(Boolean) as { type: CardType; count: number; bonus: number; thresholds: { count: number; bonus: number }[] }[];

  const activeCrossSynergies = config.crossTypeSynergies.filter(
    (syn) => (typeCounts[syn.type1] || 0) >= 1 && (typeCounts[syn.type2] || 0) >= 1
  );

  const maxWeekly = WEEKLY_MILESTONES[WEEKLY_MILESTONES.length - 1]?.quests || 25;
  const maxCLRoad = clRoadPhase1[clRoadPhase1.length - 1]?.cl || 32;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>📖</span> Grimoire
      </h2>

      {/* CL Road Card */}
      <button
        onClick={onOpenCLRoad}
        className="w-full p-4 rounded-xl border border-emerald-500/25 text-left transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
        style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.2) 0%, rgba(0, 20, 10, 0.3) 100%)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Collection Level Road
          </h3>
          <div className="flex items-center gap-2">
            {unclaimedRewards.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black">
                {unclaimedRewards.length} to claim
              </span>
            )}
            <span className="text-xs text-surface-500">&rsaquo;</span>
          </div>
        </div>
        <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (state.collectionLevel / maxCLRoad) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-surface-400">
          <span>CL <span className="text-emerald-400 font-bold">{state.collectionLevel}</span></span>
          <span>Phase 1: CL {maxCLRoad}</span>
        </div>
      </button>

      {/* Cosmic Cycle */}
      <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
        <h3 className="font-semibold text-sm mb-2">Cosmic Cycle</h3>
        <div className="flex items-center gap-4">
          <div className={`text-3xl ${night ? 'opacity-30' : ''}`}>☀️</div>
          <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                night
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: '100%' }}
            />
          </div>
          <div className={`text-3xl ${!night ? 'opacity-30' : ''}`}>🌙</div>
        </div>
        <p className="text-xs text-surface-400 mt-2 text-center">
          {night ? (
            <>Night: Shadow/Lycanthrope/Undead/Infernal +30%, Beast -10%</>
          ) : (
            <>Day: Beast/Stone/Magic +20%, Shadow/Lycanthrope/Undead -10%</>
          )}
        </p>
        <div className="mt-3 pt-3 border-t border-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lunar.emoji}</span>
            <div>
              <p className="text-sm font-medium">{lunar.label}</p>
              {lunar.effect && <p className="text-xs text-surface-400">{lunar.effect}</p>}
            </div>
          </div>
          <span className="text-xs text-surface-500">Lunar Phase</span>
        </div>
      </div>

      {/* Active Synergies */}
      {(activeTypeSynergies.length > 0 || activeCrossSynergies.length > 0) && (
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <h3 className="font-semibold text-sm mb-3">Active Synergies</h3>
          {activeTypeSynergies.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-xs text-surface-400 font-medium">Type Synergies</p>
              {activeTypeSynergies.map((syn) => (
                <div key={syn.type} className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span>{CARD_TYPE_INFO[syn.type].emoji}</span>
                    <span className="font-medium">{CARD_TYPE_INFO[syn.type].label}</span>
                    <span className="text-surface-400">({syn.count} in crypt)</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-medium">+{syn.bonus}%</span>
                </div>
              ))}
            </div>
          )}
          {activeCrossSynergies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-surface-400 font-medium">Cross-Type Synergies</p>
              {activeCrossSynergies.map((syn) => (
                <div key={syn.id} className="p-2 rounded-lg bg-cyan-500/10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{CARD_TYPE_INFO[syn.type1].emoji}</span>
                      <span>+</span>
                      <span>{CARD_TYPE_INFO[syn.type2].emoji}</span>
                      <span className="font-medium ml-1">{syn.name}</span>
                    </div>
                    <span className="text-cyan-400 font-medium">+{syn.productionBonus}%</span>
                  </div>
                  <p className="text-[10px] text-surface-400 mt-0.5">{syn.primaryEffect}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Quests */}
      <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
        <h3 className="font-semibold text-sm mb-3">Daily Quests</h3>
        {state.dailyQuests.length === 0 ? (
          <p className="text-xs text-surface-400">No quests available. Check back tomorrow!</p>
        ) : (
          <div className="space-y-2">
            {state.dailyQuests.map((quest, i) => {
              const questDef = config.dailyQuestPool.find((q) => q.id === quest.questId);
              if (!questDef) return null;
              const progress = Math.min(quest.progress, questDef.target);
              const complete = progress >= questDef.target;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    quest.claimed ? 'border-surface-700 opacity-50' : complete ? 'border-green-500/40 bg-green-500/5' : 'border-surface-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{questDef.description}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${questDef.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {questDef.difficulty}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${(progress / questDef.target) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{progress}/{questDef.target}</span>
                    <div className="flex gap-2">
                      {questDef.rewards.shadowEssence && <span>🌑 {questDef.rewards.shadowEssence}</span>}
                      {questDef.rewards.soulShards && <span>💎 {questDef.rewards.soulShards}</span>}
                      {questDef.rewards.lunarCrystals && <span>🌙 {questDef.rewards.lunarCrystals}</span>}
                    </div>
                  </div>
                  {complete && !quest.claimed && (
                    <button onClick={() => onCompleteQuest(i)} className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      Claim Reward
                    </button>
                  )}
                  {quest.claimed && <p className="mt-1 text-xs text-surface-500 text-center">Claimed</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <h3 className="font-semibold text-sm mb-2">Weekly Quests ({state.weeklyQuestCount}/{maxWeekly})</h3>
        <div className="space-y-2">
          {WEEKLY_MILESTONES.map((milestone) => {
            const claimed = state.weeklyRewardsClaimed.includes(milestone.quests);
            const reached = state.weeklyQuestCount >= milestone.quests;
            return (
              <div key={milestone.quests} className={`flex items-center justify-between p-2 rounded-lg ${claimed ? 'bg-surface-800/30 opacity-50' : reached ? 'bg-blue-500/10' : 'bg-surface-800/30'}`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${reached ? 'bg-blue-500 text-white' : 'bg-surface-700 text-surface-400'}`}>{milestone.quests}</span>
                  <span>{formatWeeklyReward(milestone.rewards)}</span>
                </div>
                {reached && !claimed && <button onClick={() => onClaimWeeklyReward(milestone.quests)} className="text-xs text-blue-400 font-medium hover:text-blue-300">Claim</button>}
                {claimed && <span className="text-xs text-surface-500">Claimed</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Streak */}
      {LOGIN_STREAK_MILESTONES.some((m) => !state.loginStreakRewardsClaimed.includes(m.days)) && (
        <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <h3 className="font-semibold text-sm mb-2">Login Streak: {state.playerStats.loginStreak} day{state.playerStats.loginStreak !== 1 ? 's' : ''}</h3>
          <div className="space-y-2">
            {LOGIN_STREAK_MILESTONES.map((m) => {
              const claimed = state.loginStreakRewardsClaimed.includes(m.days);
              const reached = state.playerStats.loginStreak >= m.days;
              return (
                <div key={m.days} className={`flex items-center justify-between p-2 rounded-lg ${claimed ? 'bg-surface-800/30 opacity-50' : reached ? 'bg-orange-500/10' : 'bg-surface-800/30'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${reached ? 'bg-orange-500 text-white' : 'bg-surface-700 text-surface-400'}`}>{m.days}</span>
                    <span>{m.lunarCrystals} Lunar Crystals</span>
                  </div>
                  {reached && !claimed && <button onClick={() => onClaimLoginStreakReward(m.days)} className="text-xs text-orange-400 font-medium hover:text-orange-300">Claim</button>}
                  {claimed && <span className="text-xs text-surface-500">Claimed</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 rounded-xl border border-surface-700/50">
        <h3 className="font-semibold text-sm mb-2">Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Cards Owned</p><p className="font-semibold">{state.ownedCards.length}</p></div>
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Tomes Opened</p><p className="font-semibold">{state.playerStats.totalPacksOpened}</p></div>
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Essence Collected</p><p className="font-semibold">{formatNumber(state.playerStats.totalEssenceCollected)}</p></div>
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Expeditions</p><p className="font-semibold">{state.playerStats.totalExpeditionsCompleted}</p></div>
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Login Streak</p><p className="font-semibold">{state.playerStats.loginStreak} day{state.playerStats.loginStreak !== 1 ? 's' : ''}</p></div>
          <div className="bg-surface-800/30 rounded-lg p-2"><p className="text-surface-500">Crypt Cards</p><p className="font-semibold">{cryptCards.length}/{state.cryptSlots}</p></div>
        </div>
      </div>
    </div>
  );
}
