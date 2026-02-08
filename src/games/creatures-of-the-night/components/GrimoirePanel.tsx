import type { GameState, GameConfig } from '../types';
import { isNightTime } from '../hooks/useGameState';

interface GrimoirePanelProps {
  state: GameState;
  config: GameConfig;
  onClaimCLReward: (cl: number) => void;
  onCompleteQuest: (questIndex: number) => void;
  onClaimWeeklyReward: (tier: number) => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

function pointsForLevel(level: number): number {
  const x = 10 * level - 5;
  return (x * x - 25) / 20;
}

export function GrimoirePanel({
  state,
  config,
  onClaimCLReward,
  onCompleteQuest,
  onClaimWeeklyReward,
}: GrimoirePanelProps) {
  const night = isNightTime();
  const currentFloor = pointsForLevel(state.collectionLevel);
  const nextFloor = pointsForLevel(state.collectionLevel + 1);
  const progressInLevel = state.collectionLevelPoints - currentFloor;
  const levelRange = nextFloor - currentFloor;

  // Unclaimed CL rewards
  const unclaimedRewards = config.clRewards.filter(
    (r) => r.cl <= state.collectionLevel && !state.clRewardsClaimed.includes(r.cl)
  );

  // Weekly milestones
  const weeklyTiers = [3, 7, 10];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>📖</span> Grimoire
      </h2>

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
              style={{ width: night ? '100%' : '100%' }}
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
      </div>

      {/* Collection Level Progress */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <h3 className="font-semibold text-sm mb-2">Collection Level {state.collectionLevel}</h3>
        <div className="h-3 bg-surface-800 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            style={{ width: `${Math.min(100, (progressInLevel / levelRange) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-surface-400">
          {formatNumber(progressInLevel)} / {formatNumber(levelRange)} CL Points
        </p>

        {/* Unclaimed rewards */}
        {unclaimedRewards.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-amber-400 font-medium">Unclaimed Rewards:</p>
            {unclaimedRewards.map((reward) => (
              <button
                key={reward.cl}
                onClick={() => onClaimCLReward(reward.cl)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-xs"
              >
                <span>CL {reward.cl}: {reward.description}</span>
                <span className="text-amber-400 font-medium">Claim</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
                    quest.claimed
                      ? 'border-surface-700 opacity-50'
                      : complete
                      ? 'border-green-500/40 bg-green-500/5'
                      : 'border-surface-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{questDef.description}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      questDef.difficulty === 'hard'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {questDef.difficulty}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${(progress / questDef.target) * 100}%` }}
                    />
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
                    <button
                      onClick={() => onCompleteQuest(i)}
                      className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    >
                      Claim Reward
                    </button>
                  )}
                  {quest.claimed && (
                    <p className="mt-1 text-xs text-surface-500 text-center">Claimed</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <h3 className="font-semibold text-sm mb-2">Weekly Quests ({state.weeklyQuestCount}/10)</h3>
        <div className="space-y-2">
          {weeklyTiers.map((tier) => {
            const claimed = state.weeklyRewardsClaimed.includes(tier);
            const reached = state.weeklyQuestCount >= tier;
            const rewards: Record<number, string> = {
              3: '🌑 500 SE',
              7: '🌑 1000 SE + 🌙 2 LC',
              10: '🌑 2000 SE + 🌙 5 LC',
            };

            return (
              <div
                key={tier}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  claimed ? 'bg-surface-800/30 opacity-50' : reached ? 'bg-blue-500/10' : 'bg-surface-800/30'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    reached ? 'bg-blue-500 text-white' : 'bg-surface-700 text-surface-400'
                  }`}>
                    {tier}
                  </span>
                  <span>{rewards[tier]}</span>
                </div>
                {reached && !claimed && (
                  <button
                    onClick={() => onClaimWeeklyReward(tier)}
                    className="text-xs text-blue-400 font-medium hover:text-blue-300"
                  >
                    Claim
                  </button>
                )}
                {claimed && <span className="text-xs text-surface-500">Claimed</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 rounded-xl border border-surface-700/50">
        <h3 className="font-semibold text-sm mb-2">Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-surface-800/30 rounded-lg p-2">
            <p className="text-surface-500">Cards Owned</p>
            <p className="font-semibold">{state.ownedCards.length}</p>
          </div>
          <div className="bg-surface-800/30 rounded-lg p-2">
            <p className="text-surface-500">Tomes Opened</p>
            <p className="font-semibold">{state.playerStats.totalPacksOpened}</p>
          </div>
          <div className="bg-surface-800/30 rounded-lg p-2">
            <p className="text-surface-500">Essence Collected</p>
            <p className="font-semibold">{formatNumber(state.playerStats.totalEssenceCollected)}</p>
          </div>
          <div className="bg-surface-800/30 rounded-lg p-2">
            <p className="text-surface-500">Expeditions</p>
            <p className="font-semibold">{state.playerStats.totalExpeditionsCompleted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
