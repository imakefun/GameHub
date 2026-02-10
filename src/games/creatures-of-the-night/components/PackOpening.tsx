import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardDefinition, CardTier, CardType, Currencies, GameConfig, LootTableEntry, OwnedCard, PackGuarantee, PackRewardResource } from '../types';
import { CARD_TYPE_INFO, TIER_ORDER, UPGRADE_TIER_COLORS } from '../types';

interface PackOpeningProps {
  config: GameConfig;
  ownedCards: OwnedCard[];
  collectionLevel: number;
  onClose: () => void;
  onConfirm: (cards: CardDefinition[], resourceRewards?: PackRewardResource[]) => void;
  packId: string;
}

// Display info for resource types
const RESOURCE_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  shadowEssence: { label: 'Shadow Essence', emoji: '\u{1F47B}', color: '#a78bfa' },
  soulShards: { label: 'Soul Shards', emoji: '\u{1F48E}', color: '#60a5fa' },
  lunarCrystals: { label: 'Lunar Crystals', emoji: '\u{1F319}', color: '#fbbf24' },
  voidEnergy: { label: 'Void Energy', emoji: '\u{1F30C}', color: '#c084fc' },
};

function tierAtLeast(cardTier: CardTier, minTier: CardTier): boolean {
  return TIER_ORDER.indexOf(cardTier) >= TIER_ORDER.indexOf(minTier);
}

function pickRandomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// Card Pool Filter — parses loot table cardPool expressions
// ============================================================

function applyCardPoolFilter(cards: CardDefinition[], cardPool: string): CardDefinition[] {
  const poolLower = cardPool.trim().toLowerCase();

  // "any" → no filter
  if (poolLower === 'any') return cards;

  // Specific card ID (no colon, no plus)
  if (!poolLower.includes(':') && !poolLower.includes('+')) {
    const match = cards.filter((c) => c.id === cardPool.trim());
    return match.length > 0 ? match : cards;
  }

  // Parse segments separated by "+"
  let pool = cards;
  const segments = poolLower.split('+').map((s) => s.trim());

  for (const seg of segments) {
    if (seg.startsWith('tier:')) {
      const tier = seg.slice(5) as CardTier;
      pool = pool.filter((c) => c.tier === tier);
    } else if (seg.startsWith('mintier:')) {
      const minTier = seg.slice(8) as CardTier;
      pool = pool.filter((c) => tierAtLeast(c.tier, minTier));
    } else if (seg.startsWith('type:')) {
      const types = seg.slice(5).split(',').map((t) => t.trim()) as CardType[];
      pool = pool.filter((c) => types.includes(c.type));
    }
  }

  return pool;
}

// ============================================================
// Resource quantity roller
// ============================================================

function rollQuantity(min: number, max: number, step?: number): number {
  const raw = min + Math.random() * (max - min);
  if (step && step > 0) {
    return Math.round(raw / step) * step;
  }
  return Math.round(raw);
}

// ============================================================
// Loot Table roller
// ============================================================

interface LootTableResult {
  cards: CardDefinition[];
  resources: PackRewardResource[];
}

function rollFromLootTable(
  entries: LootTableEntry[],
  allCards: CardDefinition[],
  ownedCardIds: Set<string>,
  cardCount: number,
): LootTableResult {
  const cards: CardDefinition[] = [];
  const resources: PackRewardResource[] = [];

  // Separate numbered slots from fill slots
  const numberedSlots = entries
    .filter((e) => typeof e.slot === 'number')
    .sort((a, b) => (a.slot as number) - (b.slot as number));
  const fillEntries = entries.filter((e) => e.slot === 'fill');

  // Helper: pick a card from a pool, respecting newOnly
  const pickFromPool = (pool: CardDefinition[], newOnly?: boolean): CardDefinition => {
    if (newOnly && pool.length > 0) {
      const newPool = pool.filter((c) => !ownedCardIds.has(c.id));
      if (newPool.length > 0) return pickRandomFrom(newPool);
    }
    return pickRandomFrom(pool);
  };

  // Helper: process a single entry
  const processEntry = (entry: LootTableEntry) => {
    const rt = entry.rewardType || 'card';
    if (rt !== 'card') {
      // Resource reward
      const min = entry.minQty ?? 0;
      const max = entry.maxQty ?? min;
      const amount = rollQuantity(min, max, entry.step);
      if (amount > 0) {
        resources.push({ resource: rt as keyof Currencies, amount });
      }
    } else {
      // Card reward
      const pool = applyCardPoolFilter(allCards, entry.cardPool);
      if (pool.length > 0) {
        cards.push(pickFromPool(pool, entry.newOnly));
      } else {
        cards.push(pickRandomFrom(allCards));
      }
    }
  };

  // 1. Process numbered slots
  for (const entry of numberedSlots) {
    processEntry(entry);
  }

  // 2. Fill remaining card slots using weighted random from fill entries
  const totalFillWeight = fillEntries.reduce((sum, e) => sum + e.weight, 0);

  while (cards.length < cardCount && fillEntries.length > 0 && totalFillWeight > 0) {
    // Pick a fill entry by weight
    let roll = Math.random() * totalFillWeight;
    let chosenEntry = fillEntries[0];
    for (const entry of fillEntries) {
      roll -= entry.weight;
      if (roll <= 0) {
        chosenEntry = entry;
        break;
      }
    }
    processEntry(chosenEntry);
  }

  return { cards, resources };
}

// ============================================================
// Legacy roller (fallback when no loot table exists for a pack)
// ============================================================

function rollCardsLegacy(
  pack: { cardCount: number; tierWeights: Partial<Record<CardTier, number>>; guarantees?: PackGuarantee[]; typeBoost?: CardType[] },
  unlockedCards: CardDefinition[],
): CardDefinition[] {
  const results: CardDefinition[] = [];
  const tierWeights = pack.tierWeights;
  const tiers = Object.entries(tierWeights) as [CardTier, number][];
  const totalWeight = tiers.reduce((sum, [, w]) => sum + w, 0);

  const pickTier = (): CardTier => {
    let roll = Math.random() * totalWeight;
    for (const [tier, weight] of tiers) {
      roll -= weight;
      if (roll <= 0) return tier;
    }
    return tiers[0][0];
  };

  const pickCard = (forceTier?: CardTier): CardDefinition => {
    const tier = forceTier ?? pickTier();
    let pool = unlockedCards.filter((c) => c.tier === tier);

    if (pack.typeBoost && pack.typeBoost.length > 0 && pool.length > 0) {
      const boosted = pool.filter((c) => pack.typeBoost!.includes(c.type));
      const normal = pool.filter((c) => !pack.typeBoost!.includes(c.type));
      pool = [...normal, ...boosted, ...boosted, ...boosted];
    }

    if (pool.length > 0) return pickRandomFrom(pool);
    return pickRandomFrom(unlockedCards);
  };

  // Fill guaranteed slots first
  const guarantees = pack.guarantees ?? [];
  for (const g of guarantees) {
    for (let n = 0; n < g.count; n++) {
      const card = pickGuaranteed(g, unlockedCards, pack.typeBoost);
      if (card) results.push(card);
    }
  }

  // Fill remaining slots randomly
  while (results.length < pack.cardCount) {
    results.push(pickCard());
  }

  return results;
}

/** Pick a card that satisfies a guarantee rule (legacy path) */
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

  if (typeBoost && typeBoost.length > 0) {
    const boosted = pool.filter((c) => typeBoost.includes(c.type));
    const normal = pool.filter((c) => !typeBoost.includes(c.type));
    if (boosted.length > 0) {
      pool = [...normal, ...boosted, ...boosted, ...boosted];
    }
  }

  return pickRandomFrom(pool);
}

// ============================================================
// Main rollLoot entry point
// ============================================================

function rollLoot(config: GameConfig, packId: string, collectionLevel: number, ownedCards?: OwnedCard[]): LootTableResult {
  const pack = config.packs.find((p) => p.id === packId);
  if (!pack) return { cards: [], resources: [] };

  // Filter cards to only include types the player has unlocked via CL
  const unlockedCards = config.cards.filter(
    (c) => collectionLevel >= (config.typeUnlockCL[c.type] ?? 1)
  );
  if (unlockedCards.length === 0) return { cards: [], resources: [] };

  // Check for loot table entries for this pack
  const lootEntries = config.lootTables.filter((e) => e.packId === packId);

  if (lootEntries.length > 0) {
    // Use loot table system
    const ownedCardIds = new Set(ownedCards?.map((c) => c.definitionId) ?? []);
    return rollFromLootTable(lootEntries, unlockedCards, ownedCardIds, pack.cardCount);
  }

  // Fallback to legacy tier-weight system (card-only)
  return { cards: rollCardsLegacy(pack, unlockedCards), resources: [] };
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
  const [resourceRewards, setResourceRewards] = useState<PackRewardResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Total reveal items = cards + resources
  const totalItems = cards.length + resourceRewards.length;

  const pack = config.packs.find((p) => p.id === packId);

  const handleOpen = () => {
    const result = rollLoot(config, packId, collectionLevel, ownedCards);
    // Sort cards by tier (highest last for drama)
    result.cards.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
    setCards(result.cards);
    setResourceRewards(result.resources);
    setCurrentIndex(0);
    setPhase('revealing');
  };

  const handleTap = useCallback(() => {
    if (phase !== 'revealing') return;

    // Advance to next item or finish
    if (currentIndex < totalItems - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase('done');
    }
  }, [phase, currentIndex, totalItems]);

  const handleConfirm = () => {
    onConfirm(cards, resourceRewards.length > 0 ? resourceRewards : undefined);
    onClose();
  };

  const isNewCard = (cardDef: CardDefinition) =>
    !ownedCards.some((c) => c.definitionId === cardDef.id);

  // Current item: could be a card or a resource
  const isShowingCard = currentIndex < cards.length;
  const currentCard = isShowingCard ? cards[currentIndex] : null;
  const currentResource = !isShowingCard ? resourceRewards[currentIndex - cards.length] : null;

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

        {/* === REVEALING PHASE — one item at a time === */}
        {phase === 'revealing' && (currentCard || currentResource) && (
          <div className="flex flex-col items-center w-full max-w-xs" onClick={handleTap}>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: totalItems }).map((_, i) => (
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
                {currentIndex + 1}/{totalItems}
              </span>
            </div>

            {/* Reveal area */}
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
                  {currentCard ? (
                    <RevealedCard card={currentCard} isNew={isNewCard(currentCard)} />
                  ) : currentResource ? (
                    <RevealedResource reward={currentResource} />
                  ) : null}
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
              {currentIndex < totalItems - 1 ? 'Tap for next' : 'Tap to finish'}
            </motion.p>
          </div>
        )}

        {/* === DONE PHASE — summary of all rewards === */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card summary grid */}
            {cards.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {cards.map((card, i) => {
                  const isNew = isNewCard(card);
                  const cardColor = UPGRADE_TIER_COLORS.base;
                  return (
                    <div
                      key={i}
                      className="relative rounded-xl border overflow-hidden"
                      style={{
                        borderColor: `${cardColor}60`,
                        background: `linear-gradient(180deg, ${cardColor}20, rgba(0,0,0,0.4))`,
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
                        <p className="text-[8px] text-center text-surface-400">
                          {CARD_TYPE_INFO[card.type].label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resource rewards summary */}
            {resourceRewards.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {resourceRewards.map((rr, i) => {
                  const info = RESOURCE_INFO[rr.resource];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                      style={{
                        borderColor: `${info?.color ?? '#9ca3af'}40`,
                        background: `${info?.color ?? '#9ca3af'}15`,
                      }}
                    >
                      <span className="text-lg">{info?.emoji ?? '?'}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: info?.color ?? '#fff' }}>
                          +{rr.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-surface-400">{info?.label ?? rr.resource}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary text */}
            {cards.length > 0 && (
              <div className="text-center text-sm text-surface-400">
                {cards.filter((c) => isNewCard(c)).length} new cards,{' '}
                {cards.filter((c) => !isNewCard(c)).length} duplicates (converted to Soul Shards)
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' }}
            >
              {cards.length > 0 ? 'Collect Rewards' : 'Claim Rewards'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/** Large resource reveal view */
function RevealedResource({ reward }: { reward: PackRewardResource }) {
  const info = RESOURCE_INFO[reward.resource] ?? { label: reward.resource, emoji: '?', color: '#9ca3af' };
  return (
    <motion.div
      className="w-full rounded-2xl border-2 overflow-hidden cursor-pointer py-10"
      style={{
        borderColor: `${info.color}70`,
        background: `linear-gradient(180deg, ${info.color}20 0%, rgba(0,0,0,0.5) 100%)`,
        boxShadow: `0 0 40px ${info.color}30, 0 0 80px ${info.color}15`,
      }}
    >
      <div className="text-center space-y-4">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="inline-block text-7xl"
        >
          {info.emoji}
        </motion.span>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-bold"
          style={{ color: info.color }}
        >
          +{reward.amount.toLocaleString()}
        </motion.p>
        <p className="text-sm text-surface-300 font-medium">{info.label}</p>
      </div>
    </motion.div>
  );
}

/** Large single-card reveal view */
function RevealedCard({ card, isNew }: { card: CardDefinition; isNew: boolean }) {
  const cardColor = UPGRADE_TIER_COLORS.base;
  const typeInfo = CARD_TYPE_INFO[card.type];

  return (
    <motion.div
      className="w-full rounded-2xl border-2 overflow-hidden cursor-pointer"
      style={{
        borderColor: `${cardColor}70`,
        background: `linear-gradient(180deg, ${cardColor}20 0%, rgba(0,0,0,0.5) 100%)`,
        boxShadow: `0 0 40px ${cardColor}30, 0 0 80px ${cardColor}15`,
      }}
    >
      {/* Badge */}
      <div className="flex justify-between items-start px-4 pt-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: `${cardColor}30`, color: cardColor }}
        >
          {typeInfo.emoji} {typeInfo.label}
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
            borderColor: `${cardColor}30`,
            background: `linear-gradient(135deg, ${cardColor}10, rgba(0,0,0,0.4))`,
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
            style={{ background: `${cardColor}20`, color: cardColor }}
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

export { rollLoot };
