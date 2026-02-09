import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OwnedCard, GameConfig, CardType, CardDefinition, UpgradeTier } from '../types';
import {
  CARD_TYPE_INFO,
  UPGRADE_TIER_ORDER,
  UPGRADE_TIER_LABELS,
  UPGRADE_TIER_COLORS,
  UPGRADE_COSTS,
  UPGRADE_TIER_PRODUCTION_BONUS,
} from '../types';
import { CardComponent } from './CardComponent';
import { UpgradeReveal } from './UpgradeReveal';
import { getNextUpgradeTier, getEffectiveGeneration } from '../hooks/useGameState';

interface CollectionPanelProps {
  ownedCards: OwnedCard[];
  config: GameConfig;
  cryptSlots: number;
  currencies: { shadowEssence: number };
  onPlaceCard: (index: number) => void;
  onSwapCard: (removeIndex: number, placeIndex: number) => void;
  onRemoveCard: (index: number) => void;
  onUpgrade: (index: number) => void;
}

type FilterType = 'all' | CardType;
type SortType = 'type' | 'upgrade';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

export function CollectionPanel({
  ownedCards,
  config,
  cryptSlots,
  currencies,
  onPlaceCard,
  onSwapCard,
  onRemoveCard,
  onUpgrade,
}: CollectionPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('upgrade');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [swapPickerCardIndex, setSwapPickerCardIndex] = useState<number | null>(null);
  const [upgradeReveal, setUpgradeReveal] = useState<{
    card: CardDefinition;
    fromTier: UpgradeTier;
    toTier: Exclude<UpgradeTier, 'base'>;
  } | null>(null);

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

  const ownedTypes = new Set(
    ownedCards
      .map((c) => config.cards.find((d) => d.id === c.definitionId)?.type)
      .filter(Boolean)
  );

  const selectedItem = selectedCard !== null
    ? filteredCards.find((item) => item.index === selectedCard)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📚</span> Shadowkeep
          <span className="text-sm font-normal text-surface-400">
            ({ownedCards.length} cards)
          </span>
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-sm"
        >
          <option value="upgrade">Sort: Upgrade</option>
          <option value="type">Sort: Type</option>
        </select>
      </div>

      {/* Type filters */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
          }`}
        >
          All
        </button>
        {Object.entries(CARD_TYPE_INFO)
          .filter(([type]) => ownedTypes.has(type as CardType))
          .map(([type, info]) => (
            <button
              key={type}
              onClick={() => setFilter(type as FilterType)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
              }`}
            >
              {info.emoji} {info.label}
            </button>
          ))}
      </div>

      {/* Cards grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-8 text-surface-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-tutorial="collection-grid">
          {filteredCards.map(({ card, def, index }) => (
            <CardComponent
              key={`${def.id}-${index}`}
              card={card}
              definition={def}
              onClick={() => setSelectedCard(selectedCard === index ? null : index)}
            />
          ))}
        </div>
      )}

      {/* Card detail modal */}
      <AnimatePresence>
        {selectedItem && (() => {
          const { card, def, index } = selectedItem;
          const nextTier = getNextUpgradeTier(card.upgradeTier);
          const upgradeColor = UPGRADE_TIER_COLORS[card.upgradeTier];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setSelectedCard(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
                style={{
                  borderColor: `${upgradeColor}40`,
                  background: `linear-gradient(180deg, ${upgradeColor}15, rgba(15,23,42,0.98))`,
                }}
              >
                {/* Card header */}
                <div className="text-center">
                  {def.artUrl ? (
                    <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden mb-2">
                      <img src={def.artUrl} alt={def.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="text-5xl mb-2">
                      {CARD_TYPE_INFO[def.type].emoji}
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{def.name}</h3>
                </div>

                {/* Upgrade Tier Progress Bar */}
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {UPGRADE_TIER_ORDER.map((tier) => {
                      const tierIdx = UPGRADE_TIER_ORDER.indexOf(tier);
                      const currentIdx = UPGRADE_TIER_ORDER.indexOf(card.upgradeTier);
                      const isActive = tierIdx <= currentIdx;
                      const color = UPGRADE_TIER_COLORS[tier];

                      return (
                        <div
                          key={tier}
                          className="flex-1 h-2.5 rounded-sm transition-all relative group"
                          style={{
                            background: isActive ? color : 'rgba(255,255,255,0.08)',
                          }}
                          title={UPGRADE_TIER_LABELS[tier]}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-center font-medium" style={{ color: upgradeColor }}>
                    {UPGRADE_TIER_LABELS[card.upgradeTier]}
                    {nextTier && (
                      <span className="text-surface-500">
                        {' → '}{UPGRADE_TIER_LABELS[nextTier]}
                      </span>
                    )}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Type</p>
                    <p className="font-medium">
                      {CARD_TYPE_INFO[def.type].emoji}{' '}
                      {CARD_TYPE_INFO[def.type].label}
                    </p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Production</p>
                    <p className="font-medium">{getEffectiveGeneration(card, def).toFixed(1)} SE / {def.baseInterval}s</p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Soul Shards</p>
                    <p className="font-medium text-blue-400">{card.soulShards}</p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Status</p>
                    <p className="font-medium">
                      {card.isOnExpedition
                        ? 'Expedition'
                        : card.placedInCrypt
                        ? 'In Crypt'
                        : 'Stored'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-surface-300 italic text-center">
                  &ldquo;{def.flavorText}&rdquo;
                </p>

                {/* Upgrade Action */}
                <div className="space-y-2">
                  {nextTier ? (() => {
                    const cost = UPGRADE_COSTS[nextTier];
                    const canAffordShards = card.soulShards >= cost.shards;
                    const canAffordEssence = currencies.shadowEssence >= cost.shadowEssence;
                    const canUpgrade = canAffordShards && canAffordEssence;
                    const nextColor = UPGRADE_TIER_COLORS[nextTier];

                    return (
                      <>
                        <div
                          className="p-3 rounded-lg border"
                          style={{ borderColor: `${nextColor}30`, background: `${nextColor}08` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium" style={{ color: nextColor }}>
                              Upgrade to {UPGRADE_TIER_LABELS[nextTier]}
                            </span>
                            <span className="text-xs text-amber-400 font-medium">
                              +{cost.clGain} CL
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-1 ${canAffordEssence ? 'text-white' : 'text-red-400'}`}>
                              <span>🌑</span>
                              <span>{formatNumber(cost.shadowEssence)} Essence</span>
                            </div>
                            <div className={`flex items-center gap-1 ${canAffordShards ? 'text-white' : 'text-red-400'}`}>
                              <span>💎</span>
                              <span>{cost.shards} Shards</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-surface-500 mt-1">
                            Production bonus: x{UPGRADE_TIER_PRODUCTION_BONUS[card.upgradeTier].toFixed(2)} → x{UPGRADE_TIER_PRODUCTION_BONUS[nextTier].toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUpgradeReveal({ card: def, fromTier: card.upgradeTier, toTier: nextTier });
                            onUpgrade(index);
                            setSelectedCard(null);
                          }}
                          disabled={!canUpgrade}
                          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            canUpgrade
                              ? 'text-white'
                              : 'bg-surface-800 text-surface-500 cursor-not-allowed'
                          }`}
                          style={canUpgrade ? { background: `linear-gradient(135deg, ${nextColor}, ${nextColor}cc)` } : undefined}
                        >
                          {canUpgrade
                            ? `Upgrade to ${UPGRADE_TIER_LABELS[nextTier]}`
                            : !canAffordEssence
                            ? `Need ${formatNumber(cost.shadowEssence - currencies.shadowEssence)} more Essence`
                            : `Need ${cost.shards - card.soulShards} more Shards`}
                        </button>
                      </>
                    );
                  })() : (
                    <div className="text-center py-2">
                      <span className="text-xs font-medium" style={{ color: UPGRADE_TIER_COLORS.cosmic }}>
                        Maximum Upgrade (Cosmic)
                      </span>
                    </div>
                  )}

                  {/* Place/Remove */}
                  {!card.isOnExpedition && (
                    card.placedInCrypt ? (
                      <button
                        onClick={() => {
                          onRemoveCard(index);
                          setSelectedCard(null);
                        }}
                        className="w-full py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
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
                        className="w-full py-2.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      >
                        {cryptIsFull ? 'Swap into Crypt' : 'Place in Crypt'}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-full py-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors text-sm"
                >
                  Close
                </button>
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
