import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OwnedCard, GameConfig, CardType } from '../types';
import { CARD_TYPE_INFO, UPGRADE_TIER_LABELS, UPGRADE_TIER_COLORS } from '../types';
import { CardComponent } from './CardComponent';

interface CryptBoardProps {
  ownedCards: OwnedCard[];
  cryptSlots: number;
  config: GameConfig;
  lunarCrystals: number;
  purchasedCryptSlots: number;
  onCollect: (index: number) => void;
  onCollectAll: () => void;
  onRemoveCard: (index: number) => void;
  onBuyCryptSlot: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

const MAX_PURCHASED = 3;
const SLOT_LC_COST = 15;

export function CryptBoard({
  ownedCards,
  cryptSlots,
  config,
  lunarCrystals,
  purchasedCryptSlots,
  onCollect,
  onCollectAll,
  onRemoveCard,
  onBuyCryptSlot,
}: CryptBoardProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const placedCards = ownedCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.placedInCrypt);

  const totalPending = ownedCards
    .filter((c) => c.placedInCrypt)
    .reduce((sum, c) => sum + c.accumulatedEssence, 0);

  // Compute active synergies for the crypt summary
  const typeCounts: Partial<Record<CardType, number>> = {};
  placedCards.forEach(({ card }) => {
    const def = config.cards.find((c) => c.id === card.definitionId);
    if (def) typeCounts[def.type] = (typeCounts[def.type] || 0) + 1;
  });

  const activeTypeSynergies = config.typeSynergies
    .map((syn) => {
      const count = typeCounts[syn.type] || 0;
      const active = syn.thresholds.filter((t) => count >= t.count);
      if (active.length === 0) return null;
      return { type: syn.type, bonus: active[active.length - 1].bonus };
    })
    .filter(Boolean) as { type: CardType; bonus: number }[];

  const activeCrossSynergies = config.crossTypeSynergies.filter(
    (syn) => (typeCounts[syn.type1] || 0) >= 1 && (typeCounts[syn.type2] || 0) >= 1
  );

  return (
    <div className="space-y-4" data-tutorial="crypt-board">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏚️</span> The Crypt
          </h2>
          <p className="text-xs text-surface-400">
            {placedCards.length}/{cryptSlots} slots filled
          </p>
        </div>
        {totalPending >= 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCollectAll}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
          >
            Collect All ({formatNumber(totalPending)} 🌑)
          </motion.button>
        )}
      </div>

      {/* Active synergies ribbon */}
      {(activeTypeSynergies.length > 0 || activeCrossSynergies.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {activeTypeSynergies.map((syn) => (
            <div
              key={syn.type}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs"
            >
              <span>{CARD_TYPE_INFO[syn.type].emoji}</span>
              <span className="text-cyan-400">+{syn.bonus}%</span>
            </div>
          ))}
          {activeCrossSynergies.map((syn) => (
            <div
              key={syn.id}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs"
              title={`${syn.name}: ${syn.primaryEffect}`}
            >
              <span>{CARD_TYPE_INFO[syn.type1].emoji}</span>
              <span className="text-surface-500">+</span>
              <span>{CARD_TYPE_INFO[syn.type2].emoji}</span>
              <span className="text-purple-400">+{syn.productionBonus}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Card Grid */}
      {placedCards.length === 0 ? (
        <div className="text-center py-12 text-surface-400">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="font-medium">Your crypt is empty</p>
          <p className="text-sm mt-1">Place cards from your collection to start generating Shadow Essence</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {placedCards.map(({ card, index }) => {
            const def = config.cards.find((c) => c.id === card.definitionId);
            if (!def) return null;
            return (
              <div key={index} className="relative group">
                <CardComponent
                  card={card}
                  definition={def}
                  showEssence
                  onCollect={() => onCollect(index)}
                  onClick={() => setSelectedCardIndex(index)}
                />
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: cryptSlots - placedCards.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-auto min-h-[200px] rounded-xl border-2 border-dashed border-surface-700/50 flex items-center justify-center text-surface-600"
            >
              <div className="text-center">
                <p className="text-2xl mb-1">+</p>
                <p className="text-xs">Empty Slot</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy extra crypt slot */}
      {purchasedCryptSlots < MAX_PURCHASED && (
        <button
          onClick={onBuyCryptSlot}
          disabled={lunarCrystals < SLOT_LC_COST}
          className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            lunarCrystals >= SLOT_LC_COST
              ? 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300'
              : 'border-surface-700 bg-surface-800/30 text-surface-500 cursor-not-allowed'
          }`}
        >
          Buy Extra Slot ({SLOT_LC_COST} 🌙) &mdash; {purchasedCryptSlots}/{MAX_PURCHASED} purchased
        </button>
      )}

      {/* Card detail modal */}
      <AnimatePresence>
        {selectedCardIndex !== null && (() => {
          const card = ownedCards[selectedCardIndex];
          const def = card ? config.cards.find((c) => c.id === card.definitionId) : null;
          if (!card || !def) return null;
          const hasEssence = card.accumulatedEssence >= 1;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setSelectedCardIndex(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
                style={{
                  borderColor: `${UPGRADE_TIER_COLORS[card.upgradeTier]}40`,
                  background: `linear-gradient(180deg, ${UPGRADE_TIER_COLORS[card.upgradeTier]}15, rgba(15,23,42,0.98))`,
                }}
              >
                {/* Card header */}
                <div className="text-center">
                  {def.artUrl ? (
                    <img
                      src={def.artUrl}
                      alt={def.name}
                      className="w-32 h-40 object-cover rounded-lg mx-auto mb-2"
                    />
                  ) : (
                    <div className="text-5xl mb-2">{CARD_TYPE_INFO[def.type].emoji}</div>
                  )}
                  <h3 className="text-xl font-bold">{def.name}</h3>
                  <p className="text-sm" style={{ color: UPGRADE_TIER_COLORS[card.upgradeTier] }}>
                    {UPGRADE_TIER_LABELS[card.upgradeTier]}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Type</p>
                    <p className="font-medium">
                      {CARD_TYPE_INFO[def.type].emoji} {CARD_TYPE_INFO[def.type].label}
                    </p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Generation</p>
                    <p className="font-medium">
                      {def.baseGenerationAmount} SE / {def.baseInterval}s
                    </p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Soul Shards</p>
                    <p className="font-medium">{card.soulShards}</p>
                  </div>
                  <div className="bg-surface-800/60 rounded-lg p-2.5">
                    <p className="text-surface-400 text-xs">Pending Essence</p>
                    <p className="font-medium">{formatNumber(card.accumulatedEssence)}</p>
                  </div>
                </div>

                {/* Flavor text */}
                <p className="text-sm text-surface-300 italic text-center">
                  &ldquo;{def.flavorText}&rdquo;
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  {hasEssence && (
                    <button
                      onClick={() => {
                        onCollect(selectedCardIndex);
                        setSelectedCardIndex(null);
                      }}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${UPGRADE_TIER_COLORS[card.upgradeTier]}, ${UPGRADE_TIER_COLORS[card.upgradeTier]}aa)`,
                        color: '#000',
                      }}
                    >
                      Collect {formatNumber(card.accumulatedEssence)} Shadow Essence
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onRemoveCard(selectedCardIndex);
                      setSelectedCardIndex(null);
                    }}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Remove from Crypt
                  </button>
                </div>

                <button
                  onClick={() => setSelectedCardIndex(null)}
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
