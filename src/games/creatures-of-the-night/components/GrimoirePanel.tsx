import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
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

// ============================================================
// Weekly reward icons / descriptions
// ============================================================

const TOME_DISPLAY: Record<string, { icon: string; name: string }> = {
  'standard-tome': { icon: '📖', name: 'Standard Tome' },
  'enhanced-tome': { icon: '📗', name: 'Enhanced Tome' },
  'premium-tome': { icon: '📕', name: 'Premium Tome' },
};

function getWeeklyRewardDisplay(rewards: { shadowEssence?: number; soulShards?: number; lunarCrystals?: number; tome?: string }) {
  // Primary display: pick the most valuable reward for the big icon
  if (rewards.tome) {
    const tome = TOME_DISPLAY[rewards.tome] || { icon: '📦', name: rewards.tome };
    return { icon: tome.icon, name: tome.name, description: 'Open for new cards and duplicates that convert to Soul Shards.' };
  }
  if (rewards.lunarCrystals) {
    return { icon: '🌙', name: `${rewards.lunarCrystals} Lunar Crystals`, description: 'Premium currency used to buy Tomes from the Market.' };
  }
  if (rewards.soulShards) {
    return { icon: '💎', name: `${rewards.soulShards} Soul Shards`, description: 'Used to upgrade cards in your Collection.' };
  }
  if (rewards.shadowEssence) {
    return { icon: '🌑', name: `${rewards.shadowEssence} Shadow Essence`, description: 'The core resource for summoning and upgrading.' };
  }
  return { icon: '🎁', name: 'Reward', description: '' };
}

function getRewardLines(rewards: { shadowEssence?: number; soulShards?: number; lunarCrystals?: number; tome?: string }): string[] {
  const lines: string[] = [];
  if (rewards.tome) {
    const tome = TOME_DISPLAY[rewards.tome] || { icon: '📦', name: rewards.tome };
    lines.push(`${tome.icon} ${tome.name}`);
  }
  if (rewards.soulShards) lines.push(`💎 ${rewards.soulShards} Soul Shards`);
  if (rewards.lunarCrystals) lines.push(`🌙 ${rewards.lunarCrystals} Lunar Crystals`);
  if (rewards.shadowEssence) lines.push(`🌑 ${rewards.shadowEssence} Shadow Essence`);
  return lines;
}

// ============================================================
// Weekly Reward Detail Modal
// ============================================================

function WeeklyRewardDetail({
  milestoneIndex,
  weeklyQuestCount,
  weeklyRewardsClaimed,
  onClaimReward,
  onNavigate,
  onClose,
}: {
  milestoneIndex: number;
  weeklyQuestCount: number;
  weeklyRewardsClaimed: number[];
  onClaimReward: (tier: number) => void;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const milestone = WEEKLY_MILESTONES[milestoneIndex];
  if (!milestone) return null;

  const reached = weeklyQuestCount >= milestone.quests;
  const claimed = weeklyRewardsClaimed.includes(milestone.quests);
  const claimable = reached && !claimed;
  const display = getWeeklyRewardDisplay(milestone.rewards);
  const rewardLines = getRewardLines(milestone.rewards);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm mx-4 flex flex-col items-center"
      >
        {/* Nav arrows + reward icon */}
        <div className="relative w-full flex items-center justify-center mb-4" style={{ minHeight: 160 }}>
          {/* Left arrow */}
          {milestoneIndex > 0 && (
            <button
              onClick={() => onNavigate(milestoneIndex - 1)}
              className="absolute left-0 z-10 w-12 h-12 rounded-xl flex items-center justify-center border-2 border-blue-500/30 hover:bg-blue-500/20 transition-colors"
              style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 58, 138, 0.3))' }}
            >
              <ChevronLeft className="w-6 h-6 text-blue-300" />
            </button>
          )}

          {/* Reward icon */}
          <motion.div
            key={milestoneIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="flex items-center justify-center"
          >
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center border-2"
              style={{
                borderColor: claimed ? 'rgba(100, 116, 139, 0.4)' : claimable ? 'rgba(56, 189, 248, 0.5)' : 'rgba(100, 116, 139, 0.3)',
                background: claimed
                  ? 'radial-gradient(circle, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)'
                  : claimable
                  ? 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%)'
                  : 'radial-gradient(circle, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%)',
                boxShadow: claimable
                  ? '0 0 40px rgba(56, 189, 248, 0.3), 0 0 80px rgba(56, 189, 248, 0.1)'
                  : 'none',
                filter: !reached && !claimed ? 'grayscale(0.6) brightness(0.5)' : claimed ? 'brightness(0.7)' : 'none',
              }}
            >
              <span className="text-6xl">{display.icon}</span>
            </div>
          </motion.div>

          {/* Right arrow */}
          {milestoneIndex < WEEKLY_MILESTONES.length - 1 && (
            <button
              onClick={() => onNavigate(milestoneIndex + 1)}
              className="absolute right-0 z-10 w-12 h-12 rounded-xl flex items-center justify-center border-2 border-blue-500/30 hover:bg-blue-500/20 transition-colors"
              style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 58, 138, 0.3))' }}
            >
              <ChevronRight className="w-6 h-6 text-blue-300" />
            </button>
          )}
        </div>

        {/* Info card */}
        <div
          className="w-full rounded-2xl border border-blue-500/20 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)' }}
        >
          <div className="px-5 pt-5 pb-3 text-center">
            <h3
              className="text-xl font-black mb-1"
              style={{ textShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}
            >
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                {rewardLines.length <= 1 ? display.name : 'Milestone Rewards'}
              </span>
            </h3>
            {rewardLines.length > 1 ? (
              <div className="space-y-1 mt-2">
                {rewardLines.map((line, i) => (
                  <p key={i} className="text-sm text-surface-300">{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-surface-400">{display.description}</p>
            )}
          </div>

          {/* Status bar */}
          <div
            className="mx-4 mb-4 px-4 py-2.5 rounded-xl flex items-center gap-3"
            style={{ background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(30, 41, 59, 0.3) 100%)' }}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
                claimed
                  ? 'border-green-500/50 bg-green-500/20 text-green-400'
                  : reached
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                  : 'border-surface-600 bg-surface-700/50 text-surface-400'
              }`}
            >
              {Math.min(weeklyQuestCount, milestone.quests)}/{milestone.quests}
            </div>
            <span className="text-sm text-surface-300">
              {claimed ? 'Reward claimed!' : reached ? 'Ready to claim!' : 'Complete Daily Missions'}
            </span>
          </div>

          {/* Claim button */}
          {claimable && (
            <div className="px-4 pb-4">
              <button
                onClick={() => { onClaimReward(milestone.quests); onClose(); }}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all"
                style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}
              >
                Claim Reward
              </button>
            </div>
          )}

          {/* Page indicator */}
          <div className="flex justify-center gap-1.5 pb-4">
            {WEEKLY_MILESTONES.map((_, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === milestoneIndex ? 'w-5 bg-cyan-400' : 'w-2 bg-surface-600 hover:bg-surface-500'
                }`}
              />
            ))}
            <span className="text-[10px] text-surface-500 ml-1.5">
              {milestoneIndex + 1}/{WEEKLY_MILESTONES.length}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors hover:bg-red-500/30"
          style={{
            background: 'linear-gradient(135deg, #991b1b, #dc2626)',
            borderColor: 'rgba(248, 113, 113, 0.3)',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
          }}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================

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

  // Weekly reward detail modal
  const [weeklyDetailIndex, setWeeklyDetailIndex] = useState<number | null>(null);
  const weeklyClaimableCount = WEEKLY_MILESTONES.filter(
    (m) => state.weeklyQuestCount >= m.quests && !state.weeklyRewardsClaimed.includes(m.quests),
  ).length;

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

      {/* Weekly Challenge Progress Bar */}
      <div
        className="p-4 rounded-xl border border-blue-500/20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(15, 23, 42, 0.3) 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-black text-sm uppercase tracking-wider"
            style={{ textShadow: '0 0 12px rgba(56, 189, 248, 0.3)' }}
          >
            <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
              Weekly Challenge
            </span>
          </h3>
          <div className="flex items-center gap-2">
            {weeklyClaimableCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-black animate-pulse">
                {weeklyClaimableCount} to claim
              </span>
            )}
            <span className="text-xs font-bold text-surface-300">
              {state.weeklyQuestCount}/{maxWeekly}
            </span>
          </div>
        </div>

        {/* Progress bar with milestone nodes */}
        <div className="relative pt-8 pb-6">
          {/* Track background */}
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-2 bg-surface-700/60 rounded-full" />
          {/* Track fill */}
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-700"
            style={{
              width: `calc(${Math.min(100, (state.weeklyQuestCount / maxWeekly) * 100)}% * (100% - 24px) / 100%)`,
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
            }}
          />

          {/* Milestone nodes */}
          <div className="relative flex items-center justify-between px-0">
            {WEEKLY_MILESTONES.map((milestone, i) => {
              const claimed = state.weeklyRewardsClaimed.includes(milestone.quests);
              const reached = state.weeklyQuestCount >= milestone.quests;
              const claimable = reached && !claimed;

              return (
                <button
                  key={milestone.quests}
                  onClick={() => setWeeklyDetailIndex(i)}
                  className="relative flex flex-col items-center group"
                  style={{ width: `${100 / WEEKLY_MILESTONES.length}%` }}
                >
                  {/* Badge */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      claimable
                        ? 'border-cyan-300 shadow-lg'
                        : claimed
                        ? 'border-cyan-500/40'
                        : reached
                        ? 'border-blue-400/50'
                        : 'border-surface-600/60'
                    }`}
                    style={{
                      background: claimable
                        ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                        : claimed
                        ? 'linear-gradient(135deg, #164e63, #155e75)'
                        : reached
                        ? 'linear-gradient(135deg, #1e3a5f, #1e40af)'
                        : 'linear-gradient(135deg, #1f2937, #111827)',
                      boxShadow: claimable
                        ? '0 0 16px rgba(6, 182, 212, 0.5), 0 0 32px rgba(6, 182, 212, 0.2)'
                        : 'none',
                    }}
                  >
                    {claimed ? (
                      <Check className="w-5 h-5 text-cyan-300" strokeWidth={3} />
                    ) : !reached ? (
                      <Lock className="w-3.5 h-3.5 text-surface-500" />
                    ) : (
                      <span className="text-lg">🎁</span>
                    )}
                  </div>

                  {/* Claimable pulse ring */}
                  {claimable && (
                    <div
                      className="absolute z-0 w-10 h-10 rounded-full animate-ping"
                      style={{
                        top: 0,
                        background: 'rgba(6, 182, 212, 0.2)',
                        animationDuration: '2s',
                      }}
                    />
                  )}

                  {/* Quest count label */}
                  <span
                    className={`mt-1.5 text-[10px] font-bold ${
                      reached ? 'text-cyan-400' : 'text-surface-500'
                    }`}
                  >
                    {milestone.quests}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Reward Detail Modal */}
      <AnimatePresence>
        {weeklyDetailIndex !== null && (
          <WeeklyRewardDetail
            milestoneIndex={weeklyDetailIndex}
            weeklyQuestCount={state.weeklyQuestCount}
            weeklyRewardsClaimed={state.weeklyRewardsClaimed}
            onClaimReward={onClaimWeeklyReward}
            onNavigate={setWeeklyDetailIndex}
            onClose={() => setWeeklyDetailIndex(null)}
          />
        )}
      </AnimatePresence>

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
