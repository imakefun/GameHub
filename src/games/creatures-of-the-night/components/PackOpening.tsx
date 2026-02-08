import { useState } from 'react';
import { motion } from 'framer-motion';
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

export function PackOpening({ config, ownedCards, collectionLevel, onClose, onConfirm, packId }: PackOpeningProps) {
  const [phase, setPhase] = useState<'sealed' | 'revealing' | 'done'>('sealed');
  const [cards, setCards] = useState<CardDefinition[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  const pack = config.packs.find((p) => p.id === packId);

  const handleOpen = () => {
    const rolled = rollCards(config, packId, collectionLevel);
    // Sort by tier (highest last for drama)
    rolled.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
    setCards(rolled);
    setPhase('revealing');
    setRevealedCount(0);

    // Auto-reveal cards one by one
    rolled.forEach((_, i) => {
      setTimeout(() => {
        setRevealedCount(i + 1);
        if (i === rolled.length - 1) {
          setTimeout(() => setPhase('done'), 300);
        }
      }, (i + 1) * 400);
    });
  };

  const handleConfirm = () => {
    onConfirm(cards);
    onClose();
  };

  const isNewCard = (cardDef: CardDefinition) =>
    !ownedCards.some((c) => c.definitionId === cardDef.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={phase === 'done' ? handleConfirm : undefined}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        {/* Pack name */}
        <h2 className="text-center text-xl font-bold mb-4">
          {pack?.name || 'Card Pack'}
        </h2>

        {phase === 'sealed' && (
          <motion.div className="text-center space-y-6">
            {/* Sealed pack visual */}
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
                <p className="text-5xl mb-2">📦</p>
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
          </motion.div>
        )}

        {(phase === 'revealing' || phase === 'done') && (
          <div className="space-y-4">
            {/* Revealed cards */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {cards.map((card, i) => {
                const revealed = i < revealedCount;
                const isNew = isNewCard(card);
                const tierColor = TIER_COLORS[card.tier];

                return (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={
                      revealed
                        ? { rotateY: 0, opacity: 1 }
                        : { rotateY: 180, opacity: 0.3 }
                    }
                    transition={{ duration: 0.3, delay: revealed ? 0 : 0 }}
                    className="relative rounded-xl border p-2 text-center"
                    style={{
                      borderColor: revealed ? `${tierColor}60` : 'rgba(255,255,255,0.1)',
                      background: revealed
                        ? `linear-gradient(180deg, ${tierColor}20, rgba(0,0,0,0.4))`
                        : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    {revealed ? (
                      <>
                        {isNew && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            NEW
                          </div>
                        )}
                        {!isNew && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            +💎
                          </div>
                        )}
                        <div className="text-2xl mb-1">
                          {CARD_TYPE_INFO[card.type].emoji}
                        </div>
                        <p className="text-[10px] font-medium truncate">{card.name}</p>
                        <p
                          className="text-[9px]"
                          style={{ color: tierColor }}
                        >
                          {TIER_LABELS[card.tier]}
                        </p>
                      </>
                    ) : (
                      <div className="text-2xl py-2">❓</div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                {/* Summary */}
                <div className="text-sm text-surface-400">
                  {cards.filter((c) => isNewCard(c)).length} new cards,{' '}
                  {cards.filter((c) => !isNewCard(c)).length} duplicates (converted to Soul Shards)
                </div>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                >
                  Collect Cards
                </button>
              </motion.div>
            )}
          </div>
        )}

        {phase === 'sealed' && (
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-sm text-surface-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export { rollCards };
