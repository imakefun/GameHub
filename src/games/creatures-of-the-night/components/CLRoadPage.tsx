import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Lock, Check } from 'lucide-react';
import type { GameState, GameConfig, CLReward, UpgradeTier } from '../types';
import { UPGRADE_COSTS, UPGRADE_TIER_LABELS, UPGRADE_TIER_COLORS } from '../types';

// ============================================================
// Reward display config
// ============================================================

const REWARD_VIS: Record<string, { icon: string; color: string; glow: string }> = {
  shadowEssence: { icon: '🌑', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' },
  soulShards: { icon: '💎', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
  lunarCrystals: { icon: '🌙', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  tome: { icon: '📖', color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  premiumTome: { icon: '📕', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
  card: { icon: '🃏', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.3)' },
  special: { icon: '✨', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
};

// ============================================================
// Help Modal
// ============================================================

const UPGRADE_TIERS: Exclude<UpgradeTier, 'base'>[] = ['twilight', 'dusk', 'midnight', 'umbral', 'eternal', 'cosmic'];

function HelpModal({ onClose }: { onClose: () => void }) {
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
        className="w-full max-w-sm mx-4 rounded-2xl border border-emerald-500/30 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1a15 0%, #061210 100%)' }}
      >
        {/* Help icon */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="w-12 h-12 rounded-full bg-surface-700/60 border-2 border-emerald-500/40 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-xl font-black text-center tracking-wider uppercase pb-1"
          style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
        >
          <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Collection Level
          </span>
        </h2>
        <p className="text-xs text-center text-surface-400 pb-4">
          Upgrade your cards to increase your<br />
          <span className="text-emerald-400 font-semibold">Collection Level</span>:
        </p>

        {/* Tier list */}
        <div className="px-5 pb-4 space-y-2">
          {UPGRADE_TIERS.map((tier) => {
            const cost = UPGRADE_COSTS[tier];
            return (
              <div
                key={tier}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  borderLeft: `3px solid ${UPGRADE_TIER_COLORS[tier]}`,
                }}
              >
                <span className="text-sm">
                  Upgrade to{' '}
                  <span className="font-bold" style={{ color: UPGRADE_TIER_COLORS[tier] }}>
                    {UPGRADE_TIER_LABELS[tier]}
                  </span>
                </span>
                <span
                  className="text-sm font-black px-2.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                  }}
                >
                  +{cost.clGain}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer text */}
        <p className="text-xs text-center text-surface-400 px-6 pb-4">
          Increase your <span className="text-emerald-400 font-semibold">Collection Level</span> to
          earn amazing rewards and new cards!
        </p>

        {/* Got It button */}
        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}
          >
            Got It!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Reward Platform Node
// ============================================================

function RewardPlatform({
  reward,
  rState,
  onClaim,
}: {
  reward: CLReward;
  rState: 'claimed' | 'claimable' | 'locked';
  onClaim: () => void;
}) {
  const vis = REWARD_VIS[reward.type] || REWARD_VIS.special;

  const label = (() => {
    switch (reward.type) {
      case 'card': return reward.description;
      case 'shadowEssence': return `${reward.amount} Essence`;
      case 'soulShards': return `${reward.amount} Shards`;
      case 'lunarCrystals': return `${reward.amount} Crystals`;
      case 'tome': return 'Standard Tome';
      case 'premiumTome': return 'Premium Tome';
      default: return reward.description;
    }
  })();

  const isLocked = rState === 'locked';
  const isClaimed = rState === 'claimed';
  const isClaimable = rState === 'claimable';

  return (
    <button
      onClick={isClaimable ? onClaim : undefined}
      disabled={!isClaimable}
      className={`relative flex flex-col items-center transition-all w-[120px] ${
        isClaimable ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Platform glow (claimable only) */}
      {isClaimable && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${vis.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Icon circle */}
      <div
        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
          isClaimable
            ? 'border-emerald-400/60 shadow-lg'
            : isClaimed
            ? 'border-surface-600/40'
            : 'border-surface-700/40'
        }`}
        style={{
          background: isLocked
            ? 'radial-gradient(circle, rgba(30, 30, 40, 0.6) 0%, rgba(15, 15, 25, 0.8) 100%)'
            : `radial-gradient(circle, ${vis.glow.replace('0.3', '0.15')} 0%, rgba(15, 15, 25, 0.8) 100%)`,
          boxShadow: isClaimable
            ? `0 0 20px ${vis.glow}, inset 0 0 12px ${vis.glow.replace('0.3', '0.1')}`
            : isClaimed
            ? `0 0 8px ${vis.glow.replace('0.3', '0.1')}`
            : 'none',
          filter: isLocked ? 'grayscale(0.7) brightness(0.5)' : isClaimed ? 'brightness(0.65)' : 'none',
        }}
      >
        <span className="text-2xl">{vis.icon}</span>
      </div>

      {/* Platform base ellipse */}
      <div
        className="w-20 h-2.5 rounded-[50%] -mt-1 relative z-0"
        style={{
          background: isClaimable
            ? `radial-gradient(ellipse, ${vis.glow.replace('0.3', '0.4')} 0%, transparent 70%)`
            : isLocked
            ? 'radial-gradient(ellipse, rgba(50, 50, 60, 0.3) 0%, transparent 70%)'
            : `radial-gradient(ellipse, ${vis.glow.replace('0.3', '0.15')} 0%, transparent 70%)`,
        }}
      />

      {/* Label */}
      <p
        className={`text-[11px] font-semibold mt-0.5 text-center leading-tight ${
          isClaimable ? 'text-white' : isClaimed ? 'text-surface-500' : 'text-surface-600'
        }`}
      >
        {label}
      </p>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute top-0 right-2 z-20">
          <div className="w-5 h-5 rounded-full bg-surface-800/90 border border-surface-600 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-surface-400" />
          </div>
        </div>
      )}

      {/* Claimed checkmark */}
      {isClaimed && (
        <div className="absolute -top-0.5 -right-0.5 z-20">
          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center border border-cyan-300/50">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
      )}
    </button>
  );
}

// ============================================================
// Main CL Road Page
// ============================================================

interface CLRoadPageProps {
  state: GameState;
  config: GameConfig;
  onClaimReward: (cl: number) => void;
  onClose: () => void;
}

export function CLRoadPage({ state, config, onClaimReward, onClose }: CLRoadPageProps) {
  const [showHelp, setShowHelp] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);

  // Sort rewards low→high, then reverse for display (high CL at top)
  const rewards = [...config.clRewards].sort((a, b) => a.cl - b.cl);
  const reversedRewards = [...rewards].reverse();

  // Next unclaimed reward above current CL
  const nextUnclaimed = rewards.find(
    (r) => r.cl > state.collectionLevel,
  );
  const clToNext = nextUnclaimed ? nextUnclaimed.cl - state.collectionLevel : 0;

  // Unclaimed but claimable count
  const claimableCount = rewards.filter(
    (r) => r.cl <= state.collectionLevel && !state.clRewardsClaimed.includes(r.cl),
  ).length;

  // Auto-scroll to current CL marker on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const getRewardState = (r: CLReward): 'claimed' | 'claimable' | 'locked' => {
    if (state.clRewardsClaimed.includes(r.cl)) return 'claimed';
    if (state.collectionLevel >= r.cl) return 'claimable';
    return 'locked';
  };

  // Find where to put the current CL marker in the reversed list.
  // It goes just before the first non-locked item (= the transition point).
  const markerIndex = reversedRewards.findIndex((r) => getRewardState(r) !== 'locked');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[45] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #001a0a 0%, #001510 40%, #081218 100%)',
      }}
    >
      {/* Subtle diagonal light rays */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 40px, rgba(34, 197, 94, 0.5) 40px, rgba(34, 197, 94, 0.5) 41px)',
        }}
      />

      {/* ===== Header ===== */}
      <header
        className="relative z-10 px-4 py-3 flex items-center"
        style={{
          background: 'rgba(0, 18, 10, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
        }}
      >
        <div className="flex-1 text-center">
          <h1
            className="text-xl font-black tracking-wider uppercase"
            style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
          >
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Collection Level
            </span>
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            {claimableCount > 0 ? (
              <span className="text-emerald-400 font-semibold">
                {claimableCount} reward{claimableCount !== 1 ? 's' : ''} to claim!
              </span>
            ) : nextUnclaimed ? (
              <>
                Next reward in:{' '}
                <span className="text-emerald-300 font-bold">
                  {clToNext} CL
                </span>
              </>
            ) : (
              <span className="text-surface-500">All rewards claimed!</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/15 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-emerald-400" />
        </button>
      </header>

      {/* ===== Scrollable Timeline ===== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-md mx-auto px-2 py-6">
          {reversedRewards.map((reward, i) => {
            const rState = getRewardState(reward);
            // Use position in the ORIGINAL sorted array for side alternation
            const origIdx = rewards.indexOf(reward);
            const side = origIdx % 2 === 0 ? 'left' : 'right';
            const isReached = rState !== 'locked';
            const showMarker = i === markerIndex;

            // Line above = toward higher CL = green only if the node above is also reached
            const prevReached = i > 0 && getRewardState(reversedRewards[i - 1]) !== 'locked';

            return (
              <div key={`${reward.cl}-${reward.type}-${i}`}>
                {/* Current CL marker */}
                {showMarker && (
                  <div ref={currentRef} className="flex justify-center py-3 relative">
                    {/* Connecting line segments */}
                    <div className="absolute left-1/2 -translate-x-0.5 top-0 h-3 w-1 bg-surface-700/30" />
                    <div className="absolute left-1/2 -translate-x-0.5 bottom-0 h-3 w-1 bg-emerald-500/50" />

                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 px-5 py-2 rounded-xl font-black text-lg flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        color: '#000',
                      }}
                    >
                      <span className="text-emerald-900">⚡</span>
                      <span>{state.collectionLevel.toLocaleString()}</span>
                    </motion.div>
                  </div>
                )}

                {/* Timeline Row */}
                <div className="flex items-center" style={{ minHeight: '90px' }}>
                  {/* Left content */}
                  <div className="flex-1 flex justify-end">
                    {side === 'left' && (
                      <RewardPlatform
                        reward={reward}
                        rState={rState}
                        onClaim={() => onClaimReward(reward.cl)}
                      />
                    )}
                  </div>

                  {/* Center line + CL badge */}
                  <div className="relative flex flex-col items-center w-12 self-stretch">
                    {/* Top half of line */}
                    <div
                      className={`flex-1 w-1 ${
                        i === 0 && !showMarker
                          ? 'bg-transparent'
                          : prevReached && isReached
                          ? 'bg-emerald-500/50'
                          : isReached
                          ? 'bg-gradient-to-t from-emerald-500/50 to-surface-700/30'
                          : 'bg-surface-700/30'
                      }`}
                    />
                    {/* CL Badge */}
                    <div
                      className={`z-10 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 transition-all ${
                        rState === 'claimable'
                          ? 'border-emerald-300 shadow-lg'
                          : isReached
                          ? 'border-emerald-500/50'
                          : 'border-surface-600/60'
                      }`}
                      style={{
                        background: rState === 'claimable'
                          ? 'linear-gradient(135deg, #059669, #10b981)'
                          : isReached
                          ? 'linear-gradient(135deg, #065f46, #064e3b)'
                          : 'linear-gradient(135deg, #1f2937, #111827)',
                        color: rState === 'claimable'
                          ? '#000'
                          : isReached
                          ? '#6ee7b7'
                          : '#6b7280',
                        boxShadow: rState === 'claimable'
                          ? '0 0 12px rgba(16, 185, 129, 0.5)'
                          : 'none',
                      }}
                    >
                      {reward.cl}
                    </div>
                    {/* Bottom half of line */}
                    <div
                      className={`flex-1 w-1 ${
                        i === reversedRewards.length - 1
                          ? 'bg-transparent'
                          : isReached
                          ? 'bg-emerald-500/50'
                          : 'bg-surface-700/30'
                      }`}
                    />
                  </div>

                  {/* Right content */}
                  <div className="flex-1">
                    {side === 'right' && (
                      <RewardPlatform
                        reward={reward}
                        rState={rState}
                        onClaim={() => onClaimReward(reward.cl)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* If all rewards are locked, show marker at the very bottom */}
          {markerIndex === -1 && (
            <div ref={currentRef} className="flex justify-center py-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-5 py-2 rounded-xl font-black text-lg flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: '#000',
                }}
              >
                <span className="text-emerald-900">⚡</span>
                <span>{state.collectionLevel.toLocaleString()}</span>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Close Button ===== */}
      <div
        className="relative z-10 flex justify-center pb-6 pt-4"
        style={{
          background: 'linear-gradient(to top, rgba(0, 18, 10, 0.98) 40%, transparent)',
        }}
      >
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-colors hover:bg-red-500/30"
          style={{
            background: 'linear-gradient(135deg, #991b1b, #dc2626)',
            borderColor: 'rgba(248, 113, 113, 0.3)',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
          }}
        >
          <X className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* ===== Help Modal ===== */}
      <AnimatePresence>
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
