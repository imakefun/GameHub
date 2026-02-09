import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { OwnedCard, GameConfig, CardType, CardDefinition, UpgradeTier } from '../types';
import {
  CARD_TYPE_INFO,
  UPGRADE_TIER_ORDER,
  UPGRADE_TIER_LABELS,
  UPGRADE_TIER_COLORS,
  UPGRADE_COSTS,
  LC_ESSENCE_RATE,
  LC_SHARDS_RATE,
} from '../types';
import { UpgradeReveal } from './UpgradeReveal';

interface CollectionPanelProps {
  ownedCards: OwnedCard[];
  config: GameConfig;
  cryptSlots: number;
  currencies: { shadowEssence: number; lunarCrystals: number };
  filter: 'all' | CardType;
  sort: 'type' | 'upgrade';
  onPlaceCard: (index: number) => void;
  onSwapCard: (removeIndex: number, placeIndex: number) => void;
  onRemoveCard: (index: number) => void;
  onUpgrade: (index: number, targetTier?: Exclude<UpgradeTier, 'base'>, useLunarCrystals?: boolean) => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

// Higher tiers get thicker, glowing borders
function borderStyle(tier: UpgradeTier, color: string) {
  const idx = UPGRADE_TIER_ORDER.indexOf(tier);
  if (idx <= 0) return { borderWidth: 1, borderColor: `${color}40`, boxShadow: 'none' };
  if (idx <= 2) return { borderWidth: 2, borderColor: `${color}60`, boxShadow: `0 0 8px ${color}20` };
  if (idx <= 4) return { borderWidth: 2, borderColor: `${color}80`, boxShadow: `0 0 16px ${color}30` };
  return { borderWidth: 3, borderColor: color, boxShadow: `0 0 24px ${color}40` };
}

// Compute cumulative costs from currentTier to targetTier
function getCumulativeCost(currentTier: UpgradeTier, targetTier: UpgradeTier) {
  const currentIdx = UPGRADE_TIER_ORDER.indexOf(currentTier);
  const targetIdx = UPGRADE_TIER_ORDER.indexOf(targetTier);
  let totalEssence = 0;
  let totalShards = 0;
  let totalCL = 0;
  for (let i = currentIdx + 1; i <= targetIdx; i++) {
    const tier = UPGRADE_TIER_ORDER[i] as Exclude<UpgradeTier, 'base'>;
    const c = UPGRADE_COSTS[tier];
    totalEssence += c.shadowEssence;
    totalShards += c.shards;
    totalCL += c.clGain;
  }
  return { totalEssence, totalShards, totalCL };
}

// Get all possible target tiers from current tier
function getAvailableTargetTiers(currentTier: UpgradeTier): Exclude<UpgradeTier, 'base'>[] {
  const currentIdx = UPGRADE_TIER_ORDER.indexOf(currentTier);
  return UPGRADE_TIER_ORDER.slice(currentIdx + 1) as Exclude<UpgradeTier, 'base'>[];
}

export function CollectionPanel({
  ownedCards,
  config,
  cryptSlots,
  currencies,
  filter,
  sort,
  onPlaceCard,
  onSwapCard,
  onRemoveCard,
  onUpgrade,
}: CollectionPanelProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [swapPickerCardIndex, setSwapPickerCardIndex] = useState<number | null>(null);
  const [upgradeReveal, setUpgradeReveal] = useState<{
    card: CardDefinition;
    fromTier: UpgradeTier;
    toTier: Exclude<UpgradeTier, 'base'>;
  } | null>(null);
  // Track selected target tier offset (0 = next tier, 1 = 2 tiers up, etc.)
  const [targetTierOffset, setTargetTierOffset] = useState(0);

  const cryptIsFull = ownedCards.filter((c) => c.placedInCrypt).length >= cryptSlots;

  const filteredCards = ownedCards
    .map((card, index) => {
      const def = config.cards.find((c) => c.id === card.definitionId);
      return def ? { card, def, index } : null;
    })
    .filter((item): item is NonNullable<typeof item> => {
      if (!item) return false;
      if (filter === 'all') return true;
      return item.def.type === filter;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'upgrade':
          return UPGRADE_TIER_ORDER.indexOf(b.card.upgradeTier) - UPGRADE_TIER_ORDER.indexOf(a.card.upgradeTier);
        case 'type':
          return a.def.type.localeCompare(b.def.type);
        default:
          return 0;
      }
    });

  const selectedItem = selectedCard !== null
    ? filteredCards.find((item) => item.index === selectedCard)
    : null;

  return (
    <div className="space-y-3">
      {/* Cards grid - Marvel Snap style 4-column art-focused */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 text-surface-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" data-tutorial="collection-grid">
          {filteredCards.map(({ card, def, index }) => {
            const upgradeColor = UPGRADE_TIER_COLORS[card.upgradeTier];
            const typeInfo = CARD_TYPE_INFO[def.type];
            const border = borderStyle(card.upgradeTier, upgradeColor);
            const isFatigued = card.fatigueUntil && Date.now() < card.fatigueUntil;

            return (
              <motion.button
                key={`${def.id}-${index}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCard(selectedCard === index ? null : index);
                  setTargetTierOffset(0);
                }}
                className="relative rounded-xl overflow-hidden transition-all"
                style={{
                  borderWidth: border.borderWidth,
                  borderStyle: 'solid',
                  borderColor: border.borderColor,
                  boxShadow: border.boxShadow,
                  opacity: isFatigued ? 0.6 : 1,
                }}
              >
                {/* Card art */}
                <div
                  className="aspect-[3/4] flex items-center justify-center"
                  style={{
                    background: `linear-gradient(180deg, ${upgradeColor}15 0%, rgba(0,0,0,0.5) 100%)`,
                  }}
                >
                  {def.artUrl ? (
                    <img
                      src={def.artUrl}
                      alt={def.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{typeInfo.emoji}</span>
                  )}
                </div>

                {/* Upgrade tier indicator - top right */}
                {card.upgradeTier !== 'base' && (
                  <div
                    className="absolute top-1 right-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${upgradeColor}60`, color: upgradeColor }}
                  >
                    {UPGRADE_TIER_LABELS[card.upgradeTier]}
                  </div>
                )}

                {/* Status badges - top left */}
                {card.isOnExpedition && (
                  <div className="absolute top-1 left-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/70 text-blue-100">
                    ⚔️
                  </div>
                )}
                {card.placedInCrypt && !card.isOnExpedition && (
                  <div className="absolute top-1 left-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/70 text-purple-100">
                    🏚️
                  </div>
                )}

                {/* Card name overlay at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1.5 py-1.5 text-center"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  }}
                >
                  <p className="text-[11px] font-semibold leading-tight truncate text-white drop-shadow-lg">
                    {def.name}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Card detail / upgrade modal - Marvel Snap style */}
      <AnimatePresence>
        {selectedItem && (() => {
          const { card, def, index } = selectedItem;
          const upgradeColor = UPGRADE_TIER_COLORS[card.upgradeTier];
          const availableTiers = getAvailableTargetTiers(card.upgradeTier);
          const isMaxed = availableTiers.length === 0;
          const clampedOffset = Math.min(targetTierOffset, availableTiers.length - 1);
          const chosenTargetTier = isMaxed ? null : availableTiers[Math.max(0, clampedOffset)];
          const targetColor = chosenTargetTier ? UPGRADE_TIER_COLORS[chosenTargetTier] : upgradeColor;

          // Cumulative costs for selected target
          const costs = chosenTargetTier
            ? getCumulativeCost(card.upgradeTier, chosenTargetTier)
            : { totalEssence: 0, totalShards: 0, totalCL: 0 };

          // Affordability
          const canAffordEssence = currencies.shadowEssence >= costs.totalEssence;
          const canAffordShards = card.soulShards >= costs.totalShards;
          const canAfford = canAffordEssence && canAffordShards;

          // LC needed to cover shortfalls
          const essenceShort = Math.max(0, costs.totalEssence - currencies.shadowEssence);
          const shardsShort = Math.max(0, costs.totalShards - card.soulShards);
          const lcForEssence = Math.ceil(essenceShort / LC_ESSENCE_RATE);
          const lcForShards = Math.ceil(shardsShort / LC_SHARDS_RATE);
          const lcNeeded = lcForEssence + lcForShards;
          const canAffordWithLC = !canAfford && currencies.lunarCrystals >= lcNeeded;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedCard(null)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto"
                style={{
                  background: `linear-gradient(180deg, ${targetColor}10 0%, rgba(8,0,18,0.98) 40%)`,
                }}
              >
                {/* Large card art - hero section */}
                <div className="relative">
                  <div
                    className="aspect-[4/5] flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${targetColor}20 0%, transparent 100%)`,
                    }}
                  >
                    {def.artUrl ? (
                      <img
                        src={def.artUrl}
                        alt={def.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-8xl">{CARD_TYPE_INFO[def.type].emoji}</span>
                    )}

                    {/* Upgrade tier colored border frame */}
                    <div
                      className="absolute inset-2 rounded-xl pointer-events-none"
                      style={{
                        border: `3px solid ${targetColor}60`,
                        boxShadow: `inset 0 0 30px ${targetColor}15, 0 0 20px ${targetColor}20`,
                      }}
                    />
                  </div>

                  {/* CL gain badge - bottom left over art */}
                  {chosenTargetTier && costs.totalCL > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/90 text-white font-bold text-sm shadow-lg">
                      <span className="text-green-200">+{costs.totalCL}</span>
                      <span className="text-green-100 text-xs font-medium">CL</span>
                    </div>
                  )}

                  {/* Current tier badge - top right */}
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${upgradeColor}80`, color: 'white' }}
                  >
                    {UPGRADE_TIER_LABELS[card.upgradeTier]}
                  </div>

                  {/* Card name overlay at bottom of art */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-4 pt-10 pb-3 text-center"
                    style={{
                      background: 'linear-gradient(transparent, rgba(8,0,18,0.95))',
                    }}
                  >
                    <h3 className="text-2xl font-black tracking-wide text-white drop-shadow-lg uppercase">
                      {def.name}
                    </h3>
                  </div>
                </div>

                {/* Upgrade controls section */}
                <div className="px-5 pb-5 pt-2 space-y-4">
                  {!isMaxed && chosenTargetTier ? (
                    <>
                      {/* "UPGRADE CARD TO:" with +/- tier selector */}
                      <div className="text-center">
                        <p className="text-xs text-surface-400 uppercase tracking-widest mb-2 font-medium">
                          Upgrade Card To:
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setTargetTierOffset(Math.max(0, clampedOffset - 1))}
                            disabled={clampedOffset <= 0}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all border border-surface-600 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10"
                            style={{
                              background: clampedOffset > 0 ? `${targetColor}15` : undefined,
                              borderColor: clampedOffset > 0 ? `${targetColor}40` : undefined,
                            }}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="min-w-[140px] text-center">
                            <p
                              className="text-xl font-black uppercase tracking-wide"
                              style={{ color: targetColor }}
                            >
                              {UPGRADE_TIER_LABELS[chosenTargetTier]}
                            </p>
                          </div>
                          <button
                            onClick={() => setTargetTierOffset(Math.min(availableTiers.length - 1, clampedOffset + 1))}
                            disabled={clampedOffset >= availableTiers.length - 1}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all border border-surface-600 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10"
                            style={{
                              background: clampedOffset < availableTiers.length - 1 ? `${targetColor}15` : undefined,
                              borderColor: clampedOffset < availableTiers.length - 1 ? `${targetColor}40` : undefined,
                            }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Upgrade button with costs */}
                      {canAfford ? (
                        <button
                          onClick={() => {
                            setUpgradeReveal({ card: def, fromTier: card.upgradeTier, toTier: chosenTargetTier });
                            onUpgrade(index, chosenTargetTier);
                            setSelectedCard(null);
                          }}
                          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all text-white"
                          style={{
                            background: `linear-gradient(135deg, ${targetColor}, ${targetColor}bb)`,
                            boxShadow: `0 4px 20px ${targetColor}40`,
                          }}
                        >
                          <div className="flex items-center justify-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <span>🌑</span>
                              <span>{formatNumber(costs.totalEssence)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span>💎</span>
                              <span>{costs.totalShards}</span>
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {/* Costs display with red for unaffordable */}
                          <div
                            className="w-full py-3 rounded-xl border"
                            style={{ borderColor: `${targetColor}30`, background: `${targetColor}08` }}
                          >
                            <div className="flex items-center justify-center gap-4 text-sm font-semibold">
                              <span className={`flex items-center gap-1.5 ${canAffordEssence ? 'text-white' : 'text-red-400'}`}>
                                <span>🌑</span>
                                <span>{formatNumber(costs.totalEssence)}</span>
                              </span>
                              <span className={`flex items-center gap-1.5 ${canAffordShards ? 'text-white' : 'text-red-400'}`}>
                                <span>💎</span>
                                <span>{costs.totalShards}</span>
                              </span>
                            </div>
                          </div>

                          {/* LC fallback button */}
                          {canAffordWithLC ? (
                            <button
                              onClick={() => {
                                setUpgradeReveal({ card: def, fromTier: card.upgradeTier, toTier: chosenTargetTier });
                                onUpgrade(index, chosenTargetTier, true);
                                setSelectedCard(null);
                              }}
                              className="w-full py-3 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                              style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span>🔮</span>
                                <span>Spend {lcNeeded} Lunar Crystal{lcNeeded > 1 ? 's' : ''} to cover</span>
                              </div>
                            </button>
                          ) : (
                            <div className="text-center py-1">
                              <p className="text-xs text-surface-500">
                                {!canAffordEssence && !canAffordShards
                                  ? `Need ${formatNumber(essenceShort)} more Essence & ${shardsShort} more Shards`
                                  : !canAffordEssence
                                  ? `Need ${formatNumber(essenceShort)} more Essence`
                                  : `Need ${shardsShort} more Shards`}
                              </p>
                              {lcNeeded > 0 && currencies.lunarCrystals < lcNeeded && (
                                <p className="text-[10px] text-surface-600 mt-0.5">
                                  {lcNeeded} LC needed ({currencies.lunarCrystals} available)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ color: UPGRADE_TIER_COLORS.cosmic }}
                      >
                        Maximum Upgrade (Cosmic)
                      </span>
                    </div>
                  )}

                  {/* Place/Remove - secondary actions */}
                  {!card.isOnExpedition && (
                    card.placedInCrypt ? (
                      <button
                        onClick={() => {
                          onRemoveCard(index);
                          setSelectedCard(null);
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors border border-red-500/20"
                      >
                        Remove from Crypt
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (cryptIsFull) {
                            setSwapPickerCardIndex(index);
                          } else {
                            onPlaceCard(index);
                            setSelectedCard(null);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 transition-colors border border-purple-500/20"
                      >
                        {cryptIsFull ? 'Swap into Crypt' : 'Place in Crypt'}
                      </button>
                    )
                  )}

                  {/* Cancel button */}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-surface-800/80 hover:bg-surface-700 transition-colors border border-surface-700"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Upgrade Reveal Overlay */}
      <AnimatePresence>
        {upgradeReveal && (
          <UpgradeReveal
            card={upgradeReveal.card}
            fromTier={upgradeReveal.fromTier}
            toTier={upgradeReveal.toTier}
            onDismiss={() => setUpgradeReveal(null)}
          />
        )}
      </AnimatePresence>

      {/* Swap picker modal */}
      <AnimatePresence>
        {swapPickerCardIndex !== null && (() => {
          const newCard = ownedCards[swapPickerCardIndex];
          const newDef = newCard
            ? config.cards.find((c) => c.id === newCard.definitionId)
            : null;
          if (!newCard || !newDef) return null;

          const placedCards = ownedCards
            .map((card, idx) => ({
              card,
              idx,
              def: config.cards.find((c) => c.id === card.definitionId),
            }))
            .filter(
              (item): item is typeof item & { def: NonNullable<typeof item.def> } =>
                !!item.def && item.card.placedInCrypt,
            );

          const newUpgradeColor = UPGRADE_TIER_COLORS[newCard.upgradeTier];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[52] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setSwapPickerCardIndex(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border border-purple-500/30 p-5 max-h-[85vh] overflow-y-auto"
                style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0a0015 100%)' }}
              >
                <h3 className="text-lg font-bold text-center mb-1">Crypt Full</h3>
                <p className="text-sm text-surface-400 text-center mb-4">
                  Choose a card to replace
                </p>

                {/* New card being placed */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border mb-4"
                  style={{
                    borderColor: `${newUpgradeColor}50`,
                    background: `linear-gradient(135deg, ${newUpgradeColor}15, transparent)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${newUpgradeColor}20` }}
                  >
                    {newDef.artUrl ? (
                      <img src={newDef.artUrl} alt={newDef.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{CARD_TYPE_INFO[newDef.type].emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{newDef.name}</p>
                    <p className="text-xs" style={{ color: newUpgradeColor }}>
                      {UPGRADE_TIER_LABELS[newCard.upgradeTier]}
                    </p>
                    <p className="text-xs text-surface-400">
                      {CARD_TYPE_INFO[newDef.type].emoji} {CARD_TYPE_INFO[newDef.type].label}
                      {' \u2022 '}{newDef.baseGenerationAmount} SE / {newDef.baseInterval}s
                    </p>
                  </div>
                  <span className="text-xs text-green-400 font-semibold flex-shrink-0">IN</span>
                </div>

                <p className="text-xs text-surface-500 mb-2 uppercase tracking-wider">
                  Currently in Crypt
                </p>

                {/* Placed cards list */}
                <div className="space-y-2">
                  {placedCards.map(({ card: placed, idx, def: placedDef }) => {
                    const hasEssence = placed.accumulatedEssence >= 1;
                    const placedUpgradeColor = UPGRADE_TIER_COLORS[placed.upgradeTier];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onSwapCard(idx, swapPickerCardIndex);
                          setSwapPickerCardIndex(null);
                          setSelectedCard(null);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-red-500/50 hover:bg-red-500/5 text-left"
                        style={{
                          borderColor: `${placedUpgradeColor}30`,
                          background: `linear-gradient(135deg, ${placedUpgradeColor}08, transparent)`,
                        }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                          style={{ background: `${placedUpgradeColor}20` }}
                        >
                          {placedDef.artUrl ? (
                            <img src={placedDef.artUrl} alt={placedDef.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{CARD_TYPE_INFO[placedDef.type].emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{placedDef.name}</p>
                          <p className="text-xs" style={{ color: placedUpgradeColor }}>
                            {UPGRADE_TIER_LABELS[placed.upgradeTier]}
                          </p>
                          <p className="text-xs text-surface-400">
                            {CARD_TYPE_INFO[placedDef.type].emoji} {CARD_TYPE_INFO[placedDef.type].label}
                            {' \u2022 '}{placedDef.baseGenerationAmount} SE / {placedDef.baseInterval}s
                          </p>
                          {hasEssence && (
                            <p className="text-xs text-amber-400 mt-0.5">
                              {Math.floor(placed.accumulatedEssence)} SE pending
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-red-400 font-semibold flex-shrink-0">OUT</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSwapPickerCardIndex(null)}
                  className="w-full mt-4 py-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
