import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OwnedCard, GameConfig, CardType } from '../types';
import { CARD_TYPE_INFO, TIER_LABELS, TIER_COLORS, TIER_ORDER, TIER_MAX_LEVEL, AWAKENING_INFO, ASCENSION_COSTS } from '../types';
import { CardComponent } from './CardComponent';
import { levelUpCost } from '../hooks/useGameState';

interface CollectionPanelProps {
  ownedCards: OwnedCard[];
  config: GameConfig;
  onPlaceCard: (index: number) => void;
  onRemoveCard: (index: number) => void;
  onLevelUp: (index: number) => void;
  onAscend: (index: number) => void;
  onAwaken: (index: number) => void;
}

type FilterType = 'all' | CardType;
type SortType = 'type' | 'tier' | 'level';

export function CollectionPanel({
  ownedCards,
  config,
  onPlaceCard,
  onRemoveCard,
  onLevelUp,
  onAscend,
  onAwaken,
}: CollectionPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('tier');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

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
        case 'tier':
          return TIER_ORDER.indexOf(b.def.tier) - TIER_ORDER.indexOf(a.def.tier);
        case 'level':
          return b.card.level - a.card.level;
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
          <option value="tier">Sort: Tier</option>
          <option value="level">Sort: Level</option>
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
          const maxLevel = TIER_MAX_LEVEL[def.tier];
          const cost = levelUpCost(card.level, def.tier, config);
          const canLevelUp = card.soulShards >= cost && card.level < maxLevel;
          const atMaxLevel = card.level >= maxLevel;
          const tierIdx = TIER_ORDER.indexOf(def.tier);
          const canAscend = atMaxLevel && tierIdx < TIER_ORDER.length - 1;
          const awakeningInfo = AWAKENING_INFO[def.tier];
          const canAwaken = !card.awakened && card.level >= awakeningInfo.level;

          let ascensionCostInfo = null;
          if (canAscend) {
            const nextTier = TIER_ORDER[tierIdx + 1];
            const costKey = `${def.tier}->${nextTier}`;
            ascensionCostInfo = ASCENSION_COSTS[costKey];
          }

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
                  borderColor: `${TIER_COLORS[def.tier]}40`,
                  background: `linear-gradient(180deg, ${TIER_COLORS[def.tier]}15, rgba(15,23,42,0.98))`,
                }}
              >
                {/* Card header */}
                <div className="text-center">
                  <div className="text-5xl mb-2">
                    {CARD_TYPE_INFO[def.type].emoji}
                  </div>
                  <h3 className="text-xl font-bold">{def.name}</h3>
                  <p className="text-sm" style={{ color: TIER_COLORS[def.tier] }}>
                    {TIER_LABELS[def.tier]} - Level {card.level}/{maxLevel}
                    {card.awakened && ' ★ Awakened'}
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
                    <p className="text-surface-400 text-xs">Generation</p>
                    <p className="font-medium">{def.baseGenerationAmount} SE / {def.baseInterval}s</p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Soul Shards</p>
                    <p className="font-medium">💎 {card.soulShards}</p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Status</p>
                    <p className="font-medium">
                      {card.isOnExpedition
                        ? '⚔️ Expedition'
                        : card.placedInCrypt
                        ? '🏚️ In Crypt'
                        : '📦 Stored'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-surface-300 italic text-center">
                  &ldquo;{def.flavorText}&rdquo;
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  {/* Level up */}
                  {!atMaxLevel && (
                    <button
                      onClick={() => onLevelUp(index)}
                      disabled={!canLevelUp}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        canLevelUp
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                          : 'bg-surface-800 text-surface-500 cursor-not-allowed'
                      }`}
                    >
                      Level Up (💎 {cost} Soul Shards)
                    </button>
                  )}

                  {/* Ascend */}
                  {canAscend && ascensionCostInfo && (
                    <button
                      onClick={() => onAscend(index)}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-black"
                    >
                      Ascend to {TIER_LABELS[TIER_ORDER[tierIdx + 1]]}
                      <span className="block text-xs font-normal mt-0.5">
                        💎 {ascensionCostInfo.soulShards} / 🌑 {ascensionCostInfo.shadowEssence} / 🌙 {ascensionCostInfo.lunarCrystals}
                      </span>
                    </button>
                  )}

                  {/* Awaken */}
                  {canAwaken && (
                    <button
                      onClick={() => onAwaken(index)}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 text-black"
                    >
                      Awaken (+25% Generation)
                      <span className="block text-xs font-normal mt-0.5">
                        💎 {awakeningInfo.soulShards} / 🌑 {awakeningInfo.shadowEssence} / 🌙 {awakeningInfo.lunarCrystals}
                      </span>
                    </button>
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
                          onPlaceCard(index);
                          setSelectedCard(null);
                        }}
                        className="w-full py-2.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      >
                        Place in Crypt
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
    </div>
  );
}
