import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardDefinition, CardTier, GameConfig, OwnedCard, PackGuarantee } from '../types';
import { TIER_COLORS, TIER_LABELS, CARD_TYPE_INFO, TIER_ORDER } from '../types';

interface PackOpeningProps {
  config: GameConfig;
  ownedCards: OwnedCard[];
  collectionLevel: number;
  onClose: () => void;
  onConfirm: (cards: CardDefinition[]) => void;
  packId: string;
}

function tierAtLeast(cardTier: CardTier, minTier: CardTier): boolean {
  return TIER_ORDER.indexOf(cardTier) >= TIER_ORDER.indexOf(minTier);
}

function pickRandomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollCards(config: GameConfig, packId: string, collectionLevel: number): CardDefinition[] {
  const pack = config.packs.find((p) => p.id === packId);
  if (!pack) return [];

  // Filter cards to only include types the player has unlocked via CL
  const unlockedCards = config.cards.filter(
    (c) => collectionLevel >= (config.typeUnlockCL[c.type] ?? 1)
  );
  if (unlockedCards.length === 0) return [];

  const results: CardDefinition[] = [];
  const tierWeights = pack.tierWeights;
  const tiers = Object.entries(tierWeights) as [CardTier, number][];
  const totalWeight = tiers.reduce((sum, [, w]) => sum + w, 0);

  // Helper: pick a card from unlocked pool by tier, with optional type boost
  const pickCard = (forceTier?: CardTier): CardDefinition => {
    const tier = forceTier ?? pickTier();
    let pool = unlockedCards.filter((c) => c.tier === tier);

    // Apply type boost: double weight for boosted types
    if (pack.typeBoost && pack.typeBoost.length > 0 && pool.length > 0) {
      const boosted = pool.filter((c) => pack.typeBoost!.includes(c.type));
      const normal = pool.filter((c) => !pack.typeBoost!.includes(c.type));
      // Weighted pool: boosted cards appear 3x more
      pool = [...normal, ...boosted, ...boosted, ...boosted];
    }

    if (pool.length > 0) return pickRandomFrom(pool);
    // Fallback to any unlocked card
    return pickRandomFrom(unlockedCards);
  };

  const pickTier = (): CardTier => {
    let roll = Math.random() * totalWeight;
    for (const [tier, weight] of tiers) {
      roll -= weight;
      if (roll <= 0) return tier;
    }
    return tiers[0][0];
  };

  // --- Fill guaranteed slots first ---
  const guarantees = pack.guarantees ?? [];
  for (const g of guarantees) {
    for (let n = 0; n < g.count; n++) {
      const card = pickGuaranteed(g, unlockedCards, pack.typeBoost);
      if (card) results.push(card);
    }
  }

  // --- Fill remaining slots randomly ---
  while (results.length < pack.cardCount) {
    results.push(pickCard());
  }

  return results;
}

/** Pick a card that satisfies a guarantee rule */
function pickGuaranteed(
  g: PackGuarantee,
  unlockedCards: CardDefinition[],
  typeBoost?: string[],
): CardDefinition | null {
  let pool = [...unlockedCards];

  if (g.tier) {
    pool = pool.filter((c) => c.tier === g.tier);
  }
  if (g.minTier) {
    pool = pool.filter((c) => tierAtLeast(c.tier, g.minTier!));
  }
  if (g.types && g.types.length > 0) {
    pool = pool.filter((c) => g.types!.includes(c.type));
  }

  if (pool.length === 0) return null;

  // Apply type boost to guaranteed pool too
  if (typeBoost && typeBoost.length > 0) {
    const boosted = pool.filter((c) => typeBoost.includes(c.type));
    const normal = pool.filter((c) => !typeBoost.includes(c.type));
    if (boosted.length > 0) {
      pool = [...normal, ...boosted, ...boosted, ...boosted];
    }
  }

  return pickRandomFrom(pool);
}

const SHARD_RATES: Record<CardTier, number> = {
  twilight: 5,
  dusk: 15,
  midnight: 30,
  umbral: 60,
  eternal: 120,
};

export function PackOpening({ config, ownedCards, collectionLevel, onClose, onConfirm, packId }: PackOpeningProps) {
  const [phase, setPhase] = useState<'sealed' | 'revealing' | 'done'>('sealed');
  const [cards, setCards] = useState<CardDefinition[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pack = config.packs.find((p) => p.id === packId);

  const handleOpen = () => {
    const rolled = rollCards(config, packId, collectionLevel);
    // Sort by tier (highest last for drama)
    rolled.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
    setCards(rolled);
    setCurrentIndex(0);
    setPhase('revealing');
  };

  const handleTap = useCallback(() => {
    if (phase !== 'revealing') return;

    // Advance to next card or finish
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase('done');
    }
  }, [phase, currentIndex, cards.length]);

  const handleConfirm = () => {
    onConfirm(cards);
    onClose();
  };

  const isNewCard = (cardDef: CardDefinition) =>
    !ownedCards.some((c) => c.definitionId === cardDef.id);

  const currentCard = cards[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={phase === 'done' ? handleConfirm : undefined}
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pack name */}
        <h2 className="text-center text-xl font-bold mb-4 text-white">
          {pack?.name || 'Card Pack'}
        </h2>

        {/* === SEALED PHASE === */}
        {phase === 'sealed' && (
          <motion.div className="text-center space-y-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto w-48 h-64 rounded-2xl border-2 border-purple-500/50 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a0533 100%)',
                boxShadow: '0 0 40px rgba(147, 51, 234, 0.3)',
              }}
            >
              <div className="text-center">
                <p className="text-5xl mb-2">{'\u{1F4E6}'}</p>
                <p className="text-purple-300 text-sm font-medium">{pack?.cardCount} Cards</p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="px-8 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)' }}
            >
              Open Pack
            </motion.button>

            <button
              onClick={onClose}
              className="block mx-auto mt-2 py-2 text-sm text-surface-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* === REVEALING PHASE — one card at a time === */}
        {phase === 'revealing' && currentCard && (
          <div className="flex flex-col items-center w-full max-w-xs" onClick={handleTap}>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < currentIndex
                      ? 'w-3 bg-purple-400'
                      : i === currentIndex
                        ? 'w-5 bg-purple-300'
                        : 'w-3 bg-surface-700'
                  }`}
                />
              ))}
              <span className="text-xs text-surface-500 ml-1">
                {currentIndex + 1}/{cards.length}
              </span>
            </div>

            {/* Card reveal area */}
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <RevealedCard card={currentCard} isNew={isNewCard(currentCard)} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tap hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-surface-500 text-sm mt-4 animate-pulse"
            >
              {currentIndex < cards.length - 1 ? 'Tap for next card' : 'Tap to finish'}
            </motion.p>
          </div>
        )}

        {/* === DONE PHASE — summary of all cards === */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Summary grid — compact thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {cards.map((card, i) => {
                const isNew = isNewCard(card);
                const tierColor = TIER_COLORS[card.tier];
                return (
                  <div
                    key={i}
                    className="relative rounded-xl border overflow-hidden"
                    style={{
                      borderColor: `${tierColor}60`,
                      background: `linear-gradient(180deg, ${tierColor}20, rgba(0,0,0,0.4))`,
                    }}
                  >
                    {isNew ? (
                      <div className="absolute top-0.5 right-0.5 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full z-10">
                        NEW
                      </div>
                    ) : (
                      <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full z-10">
                        +{SHARD_RATES[card.tier]}
                      </div>
                    )}
                    <div className="aspect-square flex items-center justify-center">
                      {card.artUrl ? (
                        <img src={card.artUrl} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{CARD_TYPE_INFO[card.type].emoji}</span>
                      )}
                    </div>
                    <div className="px-1 pb-1">
                      <p className="text-[9px] font-medium truncate text-center">{card.name}</p>
                      <p className="text-[8px] text-center" style={{ color: tierColor }}>
                        {TIER_LABELS[card.tier]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary text */}
            <div className="text-center text-sm text-surface-400">
              {cards.filter((c) => isNewCard(c)).length} new cards,{' '}
              {cards.filter((c) => !isNewCard(c)).length} duplicates (converted to Soul Shards)
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' }}
            >
              Collect Cards
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/** Large single-card reveal view */
function RevealedCard({ card, isNew }: { card: CardDefinition; isNew: boolean }) {
  const tierColor = TIER_COLORS[card.tier];
  const typeInfo = CARD_TYPE_INFO[card.type];

  return (
    <motion.div
      className="w-full rounded-2xl border-2 overflow-hidden cursor-pointer"
      style={{
        borderColor: `${tierColor}70`,
        background: `linear-gradient(180deg, ${tierColor}20 0%, rgba(0,0,0,0.5) 100%)`,
        boxShadow: `0 0 40px ${tierColor}30, 0 0 80px ${tierColor}15`,
      }}
    >
      {/* Badge */}
      <div className="flex justify-between items-start px-4 pt-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: `${tierColor}30`, color: tierColor }}
        >
          {TIER_LABELS[card.tier]}
        </span>
        {isNew ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500 text-white">
            NEW CARD
          </span>
        ) : (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/90 text-white">
            +{SHARD_RATES[card.tier]} Shards
          </span>
        )}
      </div>

      {/* Art */}
      <div className="px-4 py-3">
        <div
          className="w-full aspect-[3/4] rounded-xl overflow-hidden border flex items-center justify-center"
          style={{
            borderColor: `${tierColor}30`,
            background: `linear-gradient(135deg, ${tierColor}10, rgba(0,0,0,0.4))`,
          }}
        >
          {card.artUrl ? (
            <img src={card.artUrl} alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{typeInfo.emoji}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 text-center">
        <h3 className="text-xl font-bold text-white mb-1">{card.name}</h3>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: `${tierColor}20`, color: tierColor }}
          >
            {typeInfo.emoji} {typeInfo.label}
          </span>
        </div>
        {card.flavorText && (
          <p className="text-xs text-surface-400 italic mt-2">
            &ldquo;{card.flavorText}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
}

export { rollCards };
