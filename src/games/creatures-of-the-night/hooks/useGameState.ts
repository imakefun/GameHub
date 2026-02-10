import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  GameAction,
  GameConfig,
  OwnedCard,
  CardDefinition,
  CardType,
  CosmicPhase,
  LunarPhase,
  UpgradeTier,
  ActiveExpedition,
  PackRewardResource,
} from '../types';
import {
  TIER_DUPLICATE_SHARDS,
  TYPE_SPECIALIZATIONS,
  UPGRADE_TIER_ORDER,
  UPGRADE_COSTS,
  UPGRADE_TIER_PRODUCTION_BONUS,
  LC_ESSENCE_RATE,
  LC_SHARDS_RATE,
} from '../types';

const STORAGE_KEY = 'creatures-of-the-night-save';

// LC cost to buy extra crypt slots beyond CL-unlocked ones
const EXTRA_CRYPT_SLOT_LC_COST = 15;
const MAX_PURCHASED_CRYPT_SLOTS = 3; // can buy up to 3 extra (max 10 total)

// Login streak milestones that grant Lunar Crystals
const LOGIN_STREAK_MILESTONES: { days: number; lunarCrystals: number }[] = [
  { days: 7, lunarCrystals: 5 },
  { days: 14, lunarCrystals: 5 },
  { days: 30, lunarCrystals: 15 },
  { days: 60, lunarCrystals: 20 },
  { days: 90, lunarCrystals: 30 },
];

export { LOGIN_STREAK_MILESTONES, EXTRA_CRYPT_SLOT_LC_COST, MAX_PURCHASED_CRYPT_SLOTS };

// Void energy from breaking Eternal duplicates
const ETERNAL_DUPLICATE_VOID_ENERGY = 10;

// Weekly milestone tiers per the spec: 5/10/15/20/25 quests
const WEEKLY_MILESTONES: {
  quests: number;
  rewards: { shadowEssence?: number; soulShards?: number; lunarCrystals?: number; tome?: string };
}[] = [
  { quests: 5, rewards: { tome: 'standard-tome' } },
  { quests: 10, rewards: { soulShards: 100, tome: 'standard-tome' } },
  { quests: 15, rewards: { soulShards: 200, tome: 'enhanced-tome' } },
  { quests: 20, rewards: { lunarCrystals: 3, tome: 'premium-tome' } },
  { quests: 25, rewards: { lunarCrystals: 5, tome: 'premium-tome' } },
];

export { WEEKLY_MILESTONES };

// ============================================================
// Exported Helpers
// ============================================================

/** True when local time is between 18:00 and 05:59. */
export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

/** Current cosmic phase based on local clock. */
export function getCosmicPhase(): CosmicPhase {
  return isNightTime() ? 'night' : 'day';
}

/**
 * Approximate lunar phase based on a known new moon reference date.
 * Lunar cycle ≈ 29.53 days.
 */
export function getLunarPhase(): LunarPhase {
  const SYNODIC_MONTH = 29.53059;
  // Known new moon: Jan 29, 2025 12:36 UTC
  const KNOWN_NEW_MOON = new Date('2025-01-29T12:36:00Z').getTime();
  const now = Date.now();
  const daysSinceNew = ((now - KNOWN_NEW_MOON) / 86_400_000) % SYNODIC_MONTH;
  const phase = daysSinceNew / SYNODIC_MONTH; // 0..1

  if (phase < 0.034 || phase >= 0.966) return 'new_moon';   // ~1 day
  if (phase < 0.466) return 'waxing';
  if (phase < 0.534) return 'full_moon';                     // ~2 days
  return 'waning';
  // blood_moon is a special event, not triggered by calendar
}

/**
 * Lunar bonus for a card type (fractional, additive with cosmic bonus).
 */
export function getLunarBonus(type: CardType): number {
  const spec = TYPE_SPECIALIZATIONS[type];
  let bonus = 0;
  const phase = getLunarPhase();

  if (phase === 'blood_moon') {
    if (type === 'blood') bonus += 2.0;
    else if (type === 'lycanthrope') bonus += 1.0;
    else bonus += 0.25;
  } else if (phase === 'full_moon') {
    bonus += 0.1;
    if (spec.fullMoonBonus) bonus += spec.fullMoonBonus;
  } else if (phase === 'new_moon') {
    if (type === 'shadow') bonus += 0.75;
    if (type === 'cursed') bonus += 0.75;
  }

  return bonus;
}

/**
 * Cosmic-cycle production bonus for a card type (fractional).
 */
export function getCosmicBonus(type: CardType): number {
  let bonus = 0;

  if (isNightTime()) {
    if (type === 'shadow' || type === 'lycanthrope' || type === 'undead' || type === 'infernal')
      bonus += 0.3;
    if (type === 'beast') bonus -= 0.1;
  } else {
    if (type === 'beast' || type === 'stone' || type === 'magic') bonus += 0.2;
    if (type === 'shadow' || type === 'lycanthrope' || type === 'undead')
      bonus -= 0.1;
  }

  bonus += getLunarBonus(type);
  return bonus;
}

/**
 * Get the next upgrade tier for a card, or null if already at max (cosmic).
 */
export function getNextUpgradeTier(current: UpgradeTier): Exclude<UpgradeTier, 'base'> | null {
  const idx = UPGRADE_TIER_ORDER.indexOf(current);
  if (idx < 0 || idx >= UPGRADE_TIER_ORDER.length - 1) return null;
  return UPGRADE_TIER_ORDER[idx + 1] as Exclude<UpgradeTier, 'base'>;
}

/**
 * Effective generation *amount* per collection event
 * (before cosmic / synergy / fatigue).
 * Uses upgrade tier production bonus instead of old level-based scaling.
 */
export function getEffectiveGeneration(
  card: OwnedCard,
  def: CardDefinition,
): number {
  const spec = TYPE_SPECIALIZATIONS[def.type];
  const upgradeBonus = UPGRADE_TIER_PRODUCTION_BONUS[card.upgradeTier];
  const amount = def.baseGenerationAmount * upgradeBonus * spec.amountMultiplier;
  return amount;
}

// ============================================================
// Internal Helpers
// ============================================================

function getCardDef(
  config: GameConfig,
  defId: string,
): CardDefinition | undefined {
  return config.cards.find((c) => c.id === defId);
}

/** Effective collection interval in seconds (type-spec + night modifier). */
function effectiveInterval(def: CardDefinition): number {
  const spec = TYPE_SPECIALIZATIONS[def.type];
  let interval = def.baseInterval * spec.intervalMultiplier;
  if (isNightTime() && spec.nightIntervalMultiplier) {
    interval *= spec.nightIntervalMultiplier;
  }
  if (spec.randomIntervalVariance) {
    interval *= 1 + (Math.random() * 2 - 1) * spec.randomIntervalVariance;
  }
  return Math.max(1, interval);
}

function getPlacedTypeCounts(
  ownedCards: OwnedCard[],
  config: GameConfig,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of ownedCards) {
    if (!c.placedInCrypt) continue;
    const def = getCardDef(config, c.definitionId);
    if (def) counts[def.type] = (counts[def.type] || 0) + 1;
  }
  return counts;
}

function getSynergyBonus(
  ownedCards: OwnedCard[],
  cardType: CardType,
  config: GameConfig,
): number {
  const counts = getPlacedTypeCounts(ownedCards, config);
  let bonus = 0;

  const ts = config.typeSynergies.find((s) => s.type === cardType);
  if (ts) {
    const count = counts[cardType] || 0;
    for (const th of ts.thresholds) {
      if (count >= th.count) bonus = th.bonus;
    }
  }

  for (const cross of config.crossTypeSynergies) {
    if (
      (cross.type1 === cardType || cross.type2 === cardType) &&
      (counts[cross.type1] || 0) > 0 &&
      (counts[cross.type2] || 0) > 0
    ) {
      bonus += cross.productionBonus;
    }
  }

  return bonus;
}

function cryptSlotsForCL(cl: number, max: number, unlocks: GameConfig['cryptSlotUnlocks']): number {
  let slots = 3;
  for (const u of unlocks) {
    if (cl >= u.cl) slots = u.slot;
  }
  return Math.min(slots, max);
}

/** Recompute crypt slots and feature unlocks after CL change. */
function deriveCLFields(
  cl: number,
  config: GameConfig,
  currentUnlocks: string[],
  purchasedCryptSlots: number = 0,
): Pick<GameState, 'cryptSlots' | 'unlockedFeatures'> {
  const baseSlots = cryptSlotsForCL(cl, config.settings.maxCryptSlots, config.cryptSlotUnlocks);
  const slots = Math.min(baseSlots + purchasedCryptSlots, config.settings.maxCryptSlots + MAX_PURCHASED_CRYPT_SLOTS);
  const unlocks = [...currentUnlocks];
  for (const fu of config.featureUnlocks) {
    if (cl >= fu.cl && !unlocks.includes(fu.feature)) {
      unlocks.push(fu.feature);
    }
  }
  return { cryptSlots: slots, unlockedFeatures: unlocks };
}

/** Full per-second rate for a placed card (all multipliers). */
function cardRatePerSecond(
  card: OwnedCard,
  def: CardDefinition,
  config: GameConfig,
  ownedCards: OwnedCard[],
  now: number,
): number {
  const amount = getEffectiveGeneration(card, def);
  const interval = effectiveInterval(def);
  let rate = amount / interval;

  rate *= 1 + getCosmicBonus(def.type);
  rate *= 1 + getSynergyBonus(ownedCards, def.type, config) / 100;

  if (card.fatigueUntil && now < card.fatigueUntil) {
    rate *= 0.5;
  }

  return rate;
}

/**
 * Apply per-collection specialization effects (failChance, randomVariance,
 * doubleChance).
 */
function applyCollectionEffects(amount: number, type: CardType): number {
  const spec = TYPE_SPECIALIZATIONS[type];

  if (spec.failChance && Math.random() < spec.failChance) return 0;

  let result = amount;

  if (spec.randomVariance) {
    result *= 1 + (Math.random() * 2 - 1) * spec.randomVariance;
  }

  if (spec.doubleChance && Math.random() < spec.doubleChance) {
    result *= 2;
  }

  return result;
}

// ============================================================
// Daily Quest Helpers
// ============================================================

function getTodayMidnight(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function assignDailyQuests(
  pool: GameConfig['dailyQuestPool'],
): GameState['dailyQuests'] {
  const easy = pool.filter((q) => q.difficulty === 'easy');
  const hard = pool.filter((q) => q.difficulty === 'hard');

  const shuffled = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const picked = [
    ...shuffled(easy).slice(0, 4),
    ...shuffled(hard).slice(0, 2),
  ];

  return picked.map((q) => ({
    questId: q.id,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

function trackQuestProgress(
  quests: GameState['dailyQuests'],
  pool: GameConfig['dailyQuestPool'],
  trigger: string,
  amount: number = 1,
): GameState['dailyQuests'] {
  return quests.map((q) => {
    if (q.claimed || q.completed) return q;

    const def = pool.find((p) => p.id === q.questId);
    if (!def) return q;

    let matches = false;
    if (trigger === 'collect_card' && def.id.includes('collect')) matches = true;
    if (trigger === 'level_up' && def.id.includes('level')) matches = true;
    if (trigger === 'upgrade' && def.id.includes('level')) matches = true; // upgrade counts as level-up for quests
    if (trigger === 'open_pack' && def.id.includes('pack')) matches = true;
    if (trigger === 'expedition' && def.id.includes('expedition')) matches = true;
    if (trigger === 'essence' && def.id.includes('essence')) matches = true;
    if (trigger === 'login_night' && def.id.includes('night')) matches = true;

    if (!matches) return q;

    const newProgress = Math.min(q.progress + amount, def.target);
    return {
      ...q,
      progress: newProgress,
      completed: newProgress >= def.target,
    };
  });
}

// ============================================================
// Save Migration — convert old saves to new format
// ============================================================

function migrateOwnedCard(card: Record<string, unknown>): OwnedCard {
  // Old format had: level, awakened. New format has: upgradeTier.
  if ('upgradeTier' in card && typeof card.upgradeTier === 'string') {
    return card as unknown as OwnedCard;
  }

  // Migrate: estimate upgrade tier from old level
  const oldLevel = typeof card.level === 'number' ? card.level : 1;
  let upgradeTier: UpgradeTier = 'base';
  if (oldLevel >= 40) upgradeTier = 'cosmic';
  else if (oldLevel >= 30) upgradeTier = 'eternal';
  else if (oldLevel >= 20) upgradeTier = 'umbral';
  else if (oldLevel >= 15) upgradeTier = 'midnight';
  else if (oldLevel >= 10) upgradeTier = 'dusk';
  else if (oldLevel >= 5) upgradeTier = 'twilight';

  return {
    definitionId: card.definitionId as string,
    upgradeTier,
    soulShards: typeof card.soulShards === 'number' ? card.soulShards : 0,
    placedInCrypt: typeof card.placedInCrypt === 'boolean' ? card.placedInCrypt : false,
    lastCollected: typeof card.lastCollected === 'number' ? card.lastCollected : Date.now(),
    accumulatedEssence: typeof card.accumulatedEssence === 'number' ? card.accumulatedEssence : 0,
    isOnExpedition: typeof card.isOnExpedition === 'boolean' ? card.isOnExpedition : false,
    expeditionReturnTime: card.expeditionReturnTime as number | undefined,
    fatigueUntil: card.fatigueUntil as number | undefined,
  };
}

// ============================================================
// Initial State
// ============================================================

function createInitialState(config: GameConfig): GameState {
  // Start with Rat, Bat, and Owl from Set 1
  const starterIds = ['set1-rat', 'set1-bat', 'set1-owl'];
  const starterOwned: OwnedCard[] = starterIds
    .map((id) => config.cards.find((c) => c.id === id))
    .filter((c): c is CardDefinition => !!c)
    .map((def, idx) => ({
      definitionId: def.id,
      upgradeTier: 'base' as UpgradeTier,
      soulShards: 0,
      placedInCrypt: idx === 0, // Place Rat in crypt by default
      lastCollected: Date.now(),
      accumulatedEssence: 0,
      isOnExpedition: false,
    }));

  // Each starter card discovered grants +1 CL
  const startingCL = starterOwned.length;
  const startClFields = deriveCLFields(startingCL, config, ['basic-collection'], 0);

  return {
    currencies: { shadowEssence: 0, lunarCrystals: 5, voidEnergy: 0 },
    ownedCards: starterOwned,
    cryptSlots: startClFields.cryptSlots,
    collectionLevel: startingCL,
    clRewardsClaimed: [],
    playerStats: {
      totalEssenceCollected: 0,
      totalPacksOpened: 0,
      totalCardsCollected: starterOwned.length,
      totalExpeditionsCompleted: 0,
      playTime: 0,
      loginStreak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
    },
    activeExpeditions: [],
    completedExpeditions: [],
    starterTomeClaimed: false,
    unlockedFeatures: startClFields.unlockedFeatures,
    dailyQuests: assignDailyQuests(config.dailyQuestPool),
    dailyQuestsLastReset: getTodayMidnight(),
    weeklyQuestCount: 0,
    weeklyRewardsClaimed: [],
    loginStreakRewardsClaimed: [],
    purchasedCryptSlots: 0,
    pendingPackRewards: [],
    tutorialCompleted: false,
    tutorialStep: 0,
    lastSaved: Date.now(),
    lastTick: Date.now(),
  };
}

// ============================================================
// Reducer
// ============================================================

function createGameReducer(config: GameConfig) {
  return function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      // ======================== TICK ========================
      case 'TICK': {
        const { now } = action;
        const elapsed = (now - state.lastTick) / 1000;
        if (elapsed <= 0) return { ...state, lastTick: now };

        // --- Daily quest reset at midnight ---
        let dailyQuests = state.dailyQuests;
        let dailyQuestsLastReset = state.dailyQuestsLastReset;
        let weeklyQuestCount = state.weeklyQuestCount;
        let weeklyRewardsClaimed = state.weeklyRewardsClaimed;

        const todayMidnight = getTodayMidnight();
        if (todayMidnight > dailyQuestsLastReset) {
          dailyQuests = assignDailyQuests(config.dailyQuestPool);
          dailyQuestsLastReset = todayMidnight;

          const dayOfWeek = new Date(now).getDay();
          if (dayOfWeek === 1 && new Date(state.dailyQuestsLastReset).getDay() !== 1) {
            weeklyQuestCount = 0;
            weeklyRewardsClaimed = [];
          }
        }

        // --- Track night login quest ---
        if (isNightTime()) {
          dailyQuests = trackQuestProgress(dailyQuests, config.dailyQuestPool, 'login_night');
        }

        // --- Accumulate essence for placed cards ---
        let updatedCards: OwnedCard[] = state.ownedCards.map((card) => {
          if (!card.placedInCrypt || card.isOnExpedition) return card;
          if (card.expeditionReturnTime && now < card.expeditionReturnTime)
            return card;

          const def = getCardDef(config, card.definitionId);
          if (!def) return card;

          const rate = cardRatePerSecond(
            card,
            def,
            config,
            state.ownedCards,
            now,
          );

          return {
            ...card,
            accumulatedEssence: card.accumulatedEssence + rate * elapsed,
          };
        });

        // --- Move finished expeditions to completedExpeditions (no auto-collect) ---
        const finishedIndices: number[] = [];
        const newlyCompleted: ActiveExpedition[] = [];

        state.activeExpeditions.forEach((exp, idx) => {
          if (now < exp.completesAt) return;
          finishedIndices.push(idx);
          newlyCompleted.push(exp);
        });

        // --- Expire fatigue / expedition-return timers ---
        updatedCards = updatedCards.map((card) => {
          let c = card;
          if (c.fatigueUntil && now >= c.fatigueUntil) {
            c = { ...c, fatigueUntil: undefined };
          }
          if (c.expeditionReturnTime && now >= c.expeditionReturnTime) {
            c = { ...c, isOnExpedition: false, expeditionReturnTime: undefined };
          }
          return c;
        });

        return {
          ...state,
          ownedCards: updatedCards,
          activeExpeditions: state.activeExpeditions.filter(
            (_, i) => !finishedIndices.includes(i),
          ),
          completedExpeditions: [
            ...state.completedExpeditions,
            ...newlyCompleted,
          ],
          dailyQuests,
          dailyQuestsLastReset,
          weeklyQuestCount,
          weeklyRewardsClaimed,
          playerStats: {
            ...state.playerStats,
            playTime: state.playerStats.playTime + elapsed,
          },
          lastTick: now,
        };
      }

      // ======================== COLLECT_CARD ========================
      case 'COLLECT_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card || card.accumulatedEssence < 1) return state;

        const def = getCardDef(config, card.definitionId);
        if (!def) return state;

        const collected = Math.max(
          0,
          Math.floor(applyCollectionEffects(card.accumulatedEssence, def.type)),
        );

        let dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'collect_card');
        dq = trackQuestProgress(dq, config.dailyQuestPool, 'essence', collected);

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence + collected,
          },
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, accumulatedEssence: 0, lastCollected: Date.now() }
              : c,
          ),
          dailyQuests: dq,
          playerStats: {
            ...state.playerStats,
            totalEssenceCollected:
              state.playerStats.totalEssenceCollected + collected,
          },
        };
      }

      // ======================== COLLECT_ALL ========================
      case 'COLLECT_ALL': {
        let total = 0;
        let cardsCollected = 0;
        const newCards = state.ownedCards.map((card) => {
          if (!card.placedInCrypt || card.accumulatedEssence < 1) return card;
          const def = getCardDef(config, card.definitionId);
          const raw = def
            ? applyCollectionEffects(card.accumulatedEssence, def.type)
            : card.accumulatedEssence;
          const amt = Math.max(0, Math.floor(raw));
          total += amt;
          cardsCollected++;
          return { ...card, accumulatedEssence: 0, lastCollected: Date.now() };
        });

        if (total === 0) return state;

        let dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'collect_card', cardsCollected);
        dq = trackQuestProgress(dq, config.dailyQuestPool, 'essence', total);

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence + total,
          },
          ownedCards: newCards,
          dailyQuests: dq,
          playerStats: {
            ...state.playerStats,
            totalEssenceCollected:
              state.playerStats.totalEssenceCollected + total,
          },
        };
      }

      // ======================== PLACE_CARD ========================
      case 'PLACE_CARD': {
        const placed = state.ownedCards.filter((c) => c.placedInCrypt).length;
        if (placed >= state.cryptSlots) return state;

        const card = state.ownedCards[action.cardIndex];
        if (!card || card.placedInCrypt || card.isOnExpedition) return state;
        if (card.expeditionReturnTime && Date.now() < card.expeditionReturnTime)
          return state;

        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? {
                  ...c,
                  placedInCrypt: true,
                  lastCollected: Date.now(),
                  accumulatedEssence: 0,
                }
              : c,
          ),
        };
      }

      // ======================== SWAP_CARD ========================
      case 'SWAP_CARD': {
        const toRemove = state.ownedCards[action.removeIndex];
        const toPlace = state.ownedCards[action.placeIndex];
        if (!toRemove || !toRemove.placedInCrypt) return state;
        if (!toPlace || toPlace.placedInCrypt || toPlace.isOnExpedition) return state;

        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) => {
            if (i === action.removeIndex) return { ...c, placedInCrypt: false };
            if (i === action.placeIndex)
              return { ...c, placedInCrypt: true, lastCollected: Date.now(), accumulatedEssence: 0 };
            return c;
          }),
        };
      }

      // ======================== REMOVE_CARD ========================
      case 'REMOVE_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card || !card.placedInCrypt) return state;

        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, placedInCrypt: false }
              : c,
          ),
        };
      }

      // ======================== UPGRADE_CARD ========================
      case 'UPGRADE_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card) return state;

        // Determine which tiers to upgrade through
        const currentIdx = UPGRADE_TIER_ORDER.indexOf(card.upgradeTier);
        const targetTier = action.targetTier ?? getNextUpgradeTier(card.upgradeTier);
        if (!targetTier) return state; // already at cosmic
        const targetIdx = UPGRADE_TIER_ORDER.indexOf(targetTier);
        if (targetIdx <= currentIdx) return state;

        // Sum cumulative costs across all tiers being upgraded
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

        // Check affordability — with optional lunar crystal fallback
        const essenceShort = Math.max(0, totalEssence - state.currencies.shadowEssence);
        const shardsShort = Math.max(0, totalShards - card.soulShards);

        if (essenceShort > 0 || shardsShort > 0) {
          if (!action.useLunarCrystals) return state;
          // Calculate LC needed to cover shortfalls
          const lcForEssence = Math.ceil(essenceShort / LC_ESSENCE_RATE);
          const lcForShards = Math.ceil(shardsShort / LC_SHARDS_RATE);
          const lcNeeded = lcForEssence + lcForShards;
          if (state.currencies.lunarCrystals < lcNeeded) return state;

          // Spend LC and convert to resources, then deduct costs
          const essenceFromLC = lcForEssence * LC_ESSENCE_RATE;
          const shardsFromLC = lcForShards * LC_SHARDS_RATE;

          const newCL = state.collectionLevel + totalCL;
          const newCards = state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, upgradeTier: targetTier, soulShards: c.soulShards + shardsFromLC - totalShards }
              : c,
          );
          const clFields = deriveCLFields(newCL, config, state.unlockedFeatures, state.purchasedCryptSlots);
          const dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'upgrade');

          return {
            ...state,
            currencies: {
              ...state.currencies,
              shadowEssence: state.currencies.shadowEssence + essenceFromLC - totalEssence,
              lunarCrystals: state.currencies.lunarCrystals - lcNeeded,
            },
            ownedCards: newCards,
            collectionLevel: newCL,
            dailyQuests: dq,
            ...clFields,
          };
        }

        // Standard upgrade — can afford everything
        const newCL = state.collectionLevel + totalCL;
        const newCards = state.ownedCards.map((c, i) =>
          i === action.cardIndex
            ? { ...c, upgradeTier: targetTier, soulShards: c.soulShards - totalShards }
            : c,
        );
        const clFields = deriveCLFields(newCL, config, state.unlockedFeatures, state.purchasedCryptSlots);
        const dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'upgrade');

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence - totalEssence,
          },
          ownedCards: newCards,
          collectionLevel: newCL,
          dailyQuests: dq,
          ...clFields,
        };
      }

      // ======================== OPEN_PACK ========================
      case 'OPEN_PACK': {
        const newOwned: OwnedCard[] = [];
        let cards = [...state.ownedCards];
        let voidEnergyGained = 0;

        for (const cardDef of action.cards) {
          const existIdx = cards.findIndex(
            (c) => c.definitionId === cardDef.id,
          );
          const newIdx = newOwned.findIndex(
            (c) => c.definitionId === cardDef.id,
          );

          if (existIdx >= 0) {
            if (cardDef.tier === 'eternal') {
              voidEnergyGained += ETERNAL_DUPLICATE_VOID_ENERGY;
            }
            const shards = TIER_DUPLICATE_SHARDS[cardDef.tier];
            cards[existIdx] = {
              ...cards[existIdx],
              soulShards: cards[existIdx].soulShards + shards,
            };
          } else if (newIdx >= 0) {
            if (cardDef.tier === 'eternal') {
              voidEnergyGained += ETERNAL_DUPLICATE_VOID_ENERGY;
            }
            const shards = TIER_DUPLICATE_SHARDS[cardDef.tier];
            newOwned[newIdx] = {
              ...newOwned[newIdx],
              soulShards: newOwned[newIdx].soulShards + shards,
            };
          } else {
            newOwned.push({
              definitionId: cardDef.id,
              upgradeTier: 'base',
              soulShards: 0,
              placedInCrypt: false,
              lastCollected: Date.now(),
              accumulatedEssence: 0,
              isOnExpedition: false,
            });
          }
        }

        // Apply resource rewards from loot table
        let resourceSE = 0;
        let resourceLC = 0;
        let resourceVE = 0;
        let resourceSS = 0;
        if (action.resourceRewards) {
          for (const rr of action.resourceRewards) {
            switch (rr.resource) {
              case 'shadowEssence': resourceSE += rr.amount; break;
              case 'lunarCrystals': resourceLC += rr.amount; break;
              case 'voidEnergy': resourceVE += rr.amount; break;
            }
          }
          // soulShards not in Currencies — distribute to a random owned card
          resourceSS = action.resourceRewards
            .filter(rr => rr.resource === 'soulShards' as string)
            .reduce((sum, rr) => sum + rr.amount, 0);
        }

        const allCards = [...cards, ...newOwned];
        if (resourceSS > 0 && allCards.length > 0) {
          const shardIdx = Math.floor(Math.random() * allCards.length);
          allCards[shardIdx] = {
            ...allCards[shardIdx],
            soulShards: allCards[shardIdx].soulShards + resourceSS,
          };
        }

        const dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'open_pack');

        // New card discoveries grant +1 CL each
        const packNewCards = newOwned.length;
        const packNewCL = state.collectionLevel + packNewCards;
        const packClFields = packNewCards > 0
          ? deriveCLFields(packNewCL, config, state.unlockedFeatures, state.purchasedCryptSlots)
          : {};

        return {
          ...state,
          currencies: {
            shadowEssence: state.currencies.shadowEssence + resourceSE,
            lunarCrystals: state.currencies.lunarCrystals + resourceLC,
            voidEnergy: state.currencies.voidEnergy + voidEnergyGained + resourceVE,
          },
          ownedCards: allCards,
          collectionLevel: packNewCL,
          ...packClFields,
          dailyQuests: dq,
          playerStats: {
            ...state.playerStats,
            totalPacksOpened: state.playerStats.totalPacksOpened + 1,
            totalCardsCollected:
              state.playerStats.totalCardsCollected + newOwned.length,
          },
        };
      }

      // ======================== PURCHASE_PACK ========================
      case 'PURCHASE_PACK': {
        const pack = config.packs.find((p) => p.id === action.packId);
        if (!pack || !pack.cost) return state;

        const { currency, amount } = pack.cost;
        if (state.currencies[currency] < amount) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            [currency]: state.currencies[currency] - amount,
          },
        };
      }

      // ======================== CLAIM_STARTER_TOME ========================
      case 'CLAIM_STARTER_TOME': {
        if (state.starterTomeClaimed) return state;
        return {
          ...state,
          starterTomeClaimed: true,
          pendingPackRewards: [...state.pendingPackRewards, 'starter-tome'],
        };
      }

      // ======================== START_EXPEDITION ========================
      case 'START_EXPEDITION': {
        const zone = config.expeditions.find((z) => z.id === action.zoneId);
        if (!zone) return state;

        // Prevent sending cards that are placed in the crypt
        const validIndices = action.cardIndices.filter((i) => {
          const c = state.ownedCards[i];
          return c && !c.isOnExpedition && !c.placedInCrypt;
        });
        if (validIndices.length < zone.requirements.minCards) return state;

        const dq = trackQuestProgress(state.dailyQuests, config.dailyQuestPool, 'expedition');

        const now = Date.now();
        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) =>
            validIndices.includes(i)
              ? { ...c, isOnExpedition: true }
              : c,
          ),
          activeExpeditions: [
            ...state.activeExpeditions,
            {
              zoneId: zone.id,
              cardIds: validIndices,
              startedAt: now,
              completesAt: now + zone.duration * 1000,
            },
          ],
          dailyQuests: dq,
        };
      }

      // ======================== COMPLETE_QUEST ========================
      case 'COMPLETE_QUEST': {
        const quest = state.dailyQuests[action.questIndex];
        if (!quest || quest.claimed) return state;

        const qDef = config.dailyQuestPool.find(
          (q) => q.id === quest.questId,
        );
        if (!qDef || quest.progress < qDef.target) return state;

        const newCur = { ...state.currencies };
        if (qDef.rewards.shadowEssence)
          newCur.shadowEssence += qDef.rewards.shadowEssence;
        if (qDef.rewards.lunarCrystals)
          newCur.lunarCrystals += qDef.rewards.lunarCrystals;

        let newCards = [...state.ownedCards];
        if (qDef.rewards.soulShards && newCards.length > 0) {
          const ri = action.shardTargetIndex != null && action.shardTargetIndex < newCards.length
            ? action.shardTargetIndex
            : Math.floor(Math.random() * newCards.length);
          newCards[ri] = {
            ...newCards[ri],
            soulShards: newCards[ri].soulShards + qDef.rewards.soulShards,
          };
        }

        return {
          ...state,
          currencies: newCur,
          ownedCards: newCards,
          dailyQuests: state.dailyQuests.map((q, i) =>
            i === action.questIndex ? { ...q, claimed: true } : q,
          ),
          weeklyQuestCount: state.weeklyQuestCount + 1,
        };
      }

      // ======================== CLAIM_CL_REWARD ========================
      case 'CLAIM_CL_REWARD': {
        if (state.clRewardsClaimed.includes(action.cl)) return state;
        if (state.collectionLevel < action.cl) return state;

        const reward = config.clRewards.find((r) => r.cl === action.cl);
        if (!reward) return state;

        const newCur = { ...state.currencies };
        let newCards = [...state.ownedCards];

        switch (reward.type) {
          case 'shadowEssence':
            newCur.shadowEssence += reward.amount;
            break;
          case 'lunarCrystals':
            newCur.lunarCrystals += reward.amount;
            break;
          case 'soulShards':
            if (newCards.length > 0) {
              const shardTarget = action.shardTargetIndex != null && action.shardTargetIndex < newCards.length
                ? action.shardTargetIndex
                : Math.floor(Math.random() * newCards.length);
              newCards[shardTarget] = {
                ...newCards[shardTarget],
                soulShards: newCards[shardTarget].soulShards + reward.amount,
              };
            }
            break;
          case 'card': {
            // Unlock a new card from the CL Road
            if (reward.cardId) {
              const alreadyOwned = newCards.some((c) => c.definitionId === reward.cardId);
              if (!alreadyOwned) {
                const cardDef = config.cards.find((c) => c.id === reward.cardId);
                if (cardDef) {
                  newCards = [
                    ...newCards,
                    {
                      definitionId: cardDef.id,
                      upgradeTier: 'base' as UpgradeTier,
                      soulShards: 0,
                      placedInCrypt: false,
                      lastCollected: Date.now(),
                      accumulatedEssence: 0,
                      isOnExpedition: false,
                    },
                  ];
                }
              }
            }
            break;
          }
          // tome / premiumTome / special are handled by the UI layer
        }

        // New card discoveries grant +1 CL each
        const discoveredCards = reward.type === 'card' ? 1 : 0;
        const newCLAfterClaim = state.collectionLevel + discoveredCards;
        const clFieldsClaim = discoveredCards > 0
          ? deriveCLFields(newCLAfterClaim, config, state.unlockedFeatures, state.purchasedCryptSlots)
          : {};

        return {
          ...state,
          currencies: newCur,
          ownedCards: newCards,
          clRewardsClaimed: [...state.clRewardsClaimed, action.cl],
          collectionLevel: newCLAfterClaim,
          ...clFieldsClaim,
          playerStats: {
            ...state.playerStats,
            totalCardsCollected:
              reward.type === 'card'
                ? state.playerStats.totalCardsCollected + 1
                : state.playerStats.totalCardsCollected,
          },
        };
      }

      // ======================== CLAIM_WEEKLY_REWARD ========================
      case 'CLAIM_WEEKLY_REWARD': {
        if (state.weeklyRewardsClaimed.includes(action.tier)) return state;

        const milestone = WEEKLY_MILESTONES.find((m) => m.quests === action.tier);
        if (!milestone || state.weeklyQuestCount < milestone.quests) return state;

        const newCur = { ...state.currencies };
        let newCards = [...state.ownedCards];

        if (milestone.rewards.shadowEssence)
          newCur.shadowEssence += milestone.rewards.shadowEssence;
        if (milestone.rewards.lunarCrystals)
          newCur.lunarCrystals += milestone.rewards.lunarCrystals;
        if (milestone.rewards.soulShards && newCards.length > 0) {
          const per = Math.floor(milestone.rewards.soulShards / newCards.length);
          let rem = milestone.rewards.soulShards - per * newCards.length;
          newCards = newCards.map((c) => {
            const bonus = rem > 0 ? 1 : 0;
            if (rem > 0) rem--;
            return { ...c, soulShards: c.soulShards + per + bonus };
          });
        }

        return {
          ...state,
          currencies: newCur,
          ownedCards: newCards,
          weeklyRewardsClaimed: [
            ...state.weeklyRewardsClaimed,
            action.tier,
          ],
        };
      }

      // ======================== COLLECT_EXPEDITION ========================
      case 'COLLECT_EXPEDITION': {
        const exp = state.completedExpeditions[action.expeditionIndex];
        if (!exp) return state;

        const zone = config.expeditions.find((z) => z.id === exp.zoneId);
        if (!zone) return state;

        const now = Date.now();
        const newCurrencies = { ...state.currencies };

        if (zone.rewards.shadowEssence) {
          const [min, max] = zone.rewards.shadowEssence;
          newCurrencies.shadowEssence += min + Math.random() * (max - min);
        }
        if (zone.rewards.lunarCrystals) {
          const [min, max] = zone.rewards.lunarCrystals;
          newCurrencies.lunarCrystals += Math.floor(min + Math.random() * (max - min));
        }
        if (zone.rewards.voidEnergy) {
          const [min, max] = zone.rewards.voidEnergy;
          newCurrencies.voidEnergy += Math.floor(min + Math.random() * (max - min));
        }

        let collectCards = [...state.ownedCards];

        if (zone.rewards.soulShards) {
          const [min, max] = zone.rewards.soulShards;
          const total = Math.floor(min + Math.random() * (max - min));
          const per = Math.floor(total / exp.cardIds.length);
          let rem = total - per * exp.cardIds.length;
          for (const ci of exp.cardIds) {
            if (!collectCards[ci]) continue;
            const bonus = rem > 0 ? 1 : 0;
            if (rem > 0) rem--;
            collectCards[ci] = {
              ...collectCards[ci],
              soulShards: collectCards[ci].soulShards + per + bonus,
            };
          }
        }

        const newPackRewards: string[] = [];
        const expPack = config.packs.find(
          (p) => p.availability === 'expedition' && p.expeditionId === exp.zoneId,
        );
        if (expPack) {
          newPackRewards.push(expPack.id);
        }

        // Apply risk effects
        if (Math.random() * 100 < zone.riskPercent) {
          const riskEnd = now + zone.riskDuration * 1000;
          for (const ci of exp.cardIds) {
            if (!collectCards[ci]) continue;
            switch (zone.riskEffect) {
              case 'fatigue':
              case 'damage':
              case 'curse':
                collectCards[ci] = { ...collectCards[ci], fatigueUntil: riskEnd };
                break;
              case 'card_loss':
                collectCards[ci] = {
                  ...collectCards[ci],
                  expeditionReturnTime: riskEnd,
                  placedInCrypt: false,
                };
                break;
            }
          }
        }

        // Return cards (unless card_loss)
        for (const ci of exp.cardIds) {
          if (collectCards[ci] && !collectCards[ci].expeditionReturnTime) {
            collectCards[ci] = { ...collectCards[ci], isOnExpedition: false };
          }
        }

        const dqCollect = trackQuestProgress(
          state.dailyQuests, config.dailyQuestPool, 'expedition',
        );

        return {
          ...state,
          ownedCards: collectCards,
          currencies: newCurrencies,
          completedExpeditions: state.completedExpeditions.filter(
            (_, i) => i !== action.expeditionIndex,
          ),
          pendingPackRewards: [...state.pendingPackRewards, ...newPackRewards],
          dailyQuests: dqCollect,
          playerStats: {
            ...state.playerStats,
            totalExpeditionsCompleted: state.playerStats.totalExpeditionsCompleted + 1,
          },
        };
      }

      // ======================== RUSH_EXPEDITION ========================
      case 'RUSH_EXPEDITION': {
        const exp = state.activeExpeditions[action.expeditionIndex];
        if (!exp) return state;

        const remaining = Math.max(0, (exp.completesAt - Date.now()) / 1000);
        if (remaining <= 0) return state;
        const lcCost = Math.max(1, Math.ceil(remaining / 600));
        if (state.currencies.lunarCrystals < lcCost) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            lunarCrystals: state.currencies.lunarCrystals - lcCost,
          },
          activeExpeditions: state.activeExpeditions.map((e, i) =>
            i === action.expeditionIndex
              ? { ...e, completesAt: Date.now() }
              : e,
          ),
        };
      }

      // ======================== BUY_CRYPT_SLOT ========================
      case 'BUY_CRYPT_SLOT': {
        if (state.purchasedCryptSlots >= MAX_PURCHASED_CRYPT_SLOTS) return state;
        if (state.currencies.lunarCrystals < EXTRA_CRYPT_SLOT_LC_COST) return state;

        const newPurchased = state.purchasedCryptSlots + 1;
        const clFields = deriveCLFields(
          state.collectionLevel,
          config,
          state.unlockedFeatures,
          newPurchased,
        );

        return {
          ...state,
          currencies: {
            ...state.currencies,
            lunarCrystals: state.currencies.lunarCrystals - EXTRA_CRYPT_SLOT_LC_COST,
          },
          purchasedCryptSlots: newPurchased,
          cryptSlots: clFields.cryptSlots,
        };
      }

      // ======================== CLAIM_LOGIN_STREAK_REWARD ========================
      case 'CLAIM_LOGIN_STREAK_REWARD': {
        const { milestone } = action;
        if (state.loginStreakRewardsClaimed.includes(milestone)) return state;

        const streakReward = LOGIN_STREAK_MILESTONES.find((m) => m.days === milestone);
        if (!streakReward) return state;
        if (state.playerStats.loginStreak < milestone) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            lunarCrystals: state.currencies.lunarCrystals + streakReward.lunarCrystals,
          },
          loginStreakRewardsClaimed: [...state.loginStreakRewardsClaimed, milestone],
        };
      }

      // ======================== TUTORIAL ========================
      case 'SET_TUTORIAL_STEP':
        return { ...state, tutorialStep: action.step };

      case 'COMPLETE_TUTORIAL':
        return { ...state, tutorialCompleted: true };

      // ======================== DISMISS_PACK_REWARD ========================
      case 'DISMISS_PACK_REWARD': {
        const idx = state.pendingPackRewards.indexOf(action.packId);
        if (idx === -1) return state;
        const remaining = [...state.pendingPackRewards];
        remaining.splice(idx, 1);
        return { ...state, pendingPackRewards: remaining };
      }

      // ======================== PERSISTENCE ========================
      case 'LOAD_GAME':
        return action.state;

      case 'RESET_GAME':
        localStorage.removeItem(STORAGE_KEY);
        return createInitialState(config);

      default:
        return state;
    }
  };
}

// ============================================================
// Hook
// ============================================================

export function useGameState(config: GameConfig) {
  const configRef = useRef(config);
  configRef.current = config;

  const [state, dispatch] = useReducer(
    createGameReducer(config),
    config,
    (cfg) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, unknown>;
          const initial = createInitialState(cfg);
          const restored: GameState = {
            ...initial,
            ...(parsed as Partial<GameState>),
            lastTick: Date.now(),
          };

          // Migrate owned cards from old format
          if (Array.isArray(parsed.ownedCards)) {
            restored.ownedCards = (parsed.ownedCards as Record<string, unknown>[]).map(migrateOwnedCard);
          }

          // Migrate: remove old collectionLevelPoints if present, use collectionLevel directly
          if (typeof (parsed as Record<string, unknown>).collectionLevelPoints === 'number' && restored.collectionLevel === 0) {
            // Old saves had a quadratic CL system; approximate CL from points
            const pts = (parsed as Record<string, unknown>).collectionLevelPoints as number;
            if (pts > 0) {
              restored.collectionLevel = Math.floor((5 + Math.sqrt(25 + 20 * pts)) / 10);
            }
          }

          // Login streak tracking
          const today = new Date().toISOString().split('T')[0];
          const lastLogin = restored.playerStats?.lastLoginDate || '';
          if (lastLogin !== today) {
            const yesterday = new Date(Date.now() - 86_400_000)
              .toISOString()
              .split('T')[0];
            restored.playerStats = {
              ...restored.playerStats,
              lastLoginDate: today,
              loginStreak:
                lastLogin === yesterday
                  ? (restored.playerStats.loginStreak || 1) + 1
                  : 1,
            };
          }

          // Daily quest reset if needed
          const todayMidnight = getTodayMidnight();
          if (todayMidnight > restored.dailyQuestsLastReset) {
            restored.dailyQuests = assignDailyQuests(cfg.dailyQuestPool);
            restored.dailyQuestsLastReset = todayMidnight;
          }

          if (!restored.dailyQuests || restored.dailyQuests.length === 0) {
            restored.dailyQuests = assignDailyQuests(cfg.dailyQuestPool);
            restored.dailyQuestsLastReset = todayMidnight;
          }

          // Offline essence (capped at offlineMaxHours)
          const maxOffline = cfg.settings.offlineMaxHours * 3600;
          const lastTick = typeof parsed.lastTick === 'number' ? parsed.lastTick : Date.now();
          const offlineSec = Math.min(
            (Date.now() - lastTick) / 1000,
            maxOffline,
          );

          if (offlineSec > 5) {
            restored.ownedCards = restored.ownedCards.map((card) => {
              if (!card.placedInCrypt || card.isOnExpedition) return card;
              if (
                card.expeditionReturnTime &&
                Date.now() < card.expeditionReturnTime
              )
                return card;

              const def = getCardDef(cfg, card.definitionId);
              if (!def) return card;

              const amount = getEffectiveGeneration(card, def);
              const interval = effectiveInterval(def);
              const rate = amount / interval;
              const offlineEssence =
                rate * offlineSec * cfg.settings.offlineEssenceMultiplier;

              return {
                ...card,
                accumulatedEssence: card.accumulatedEssence + offlineEssence,
              };
            });
          }

          return restored;
        }
      } catch (e) {
        console.error('Failed to load save:', e);
      }
      return createInitialState(cfg);
    },
  );

  const lastSaveRef = useRef(Date.now());

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      dispatch({ type: 'TICK', now });

      if (
        now - lastSaveRef.current >
        configRef.current.settings.autoSaveInterval
      ) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...state, lastSaved: now }),
        );
        lastSaveRef.current = now;
      }
    }, configRef.current.settings.tickInterval);

    return () => clearInterval(interval);
  }, [state]);

  // Save on unmount
  useEffect(() => {
    return () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, lastSaved: Date.now() }),
      );
    };
  }, [state]);

  // ---- Public API ----

  const collectCard = useCallback(
    (cardIndex: number) => dispatch({ type: 'COLLECT_CARD', cardIndex }),
    [],
  );

  const collectAll = useCallback(
    () => dispatch({ type: 'COLLECT_ALL' }),
    [],
  );

  const placeCard = useCallback(
    (cardIndex: number) => dispatch({ type: 'PLACE_CARD', cardIndex }),
    [],
  );

  const swapCard = useCallback(
    (removeIndex: number, placeIndex: number) =>
      dispatch({ type: 'SWAP_CARD', removeIndex, placeIndex }),
    [],
  );

  const removeCard = useCallback(
    (cardIndex: number) => dispatch({ type: 'REMOVE_CARD', cardIndex }),
    [],
  );

  const upgradeCard = useCallback(
    (cardIndex: number, targetTier?: Exclude<UpgradeTier, 'base'>, useLunarCrystals?: boolean) =>
      dispatch({ type: 'UPGRADE_CARD', cardIndex, targetTier, useLunarCrystals }),
    [],
  );

  const openPack = useCallback(
    (cards: CardDefinition[], packId: string, resourceRewards?: PackRewardResource[]) =>
      dispatch({ type: 'OPEN_PACK', cards, resourceRewards, packId }),
    [],
  );

  const purchasePack = useCallback(
    (packId: string) => dispatch({ type: 'PURCHASE_PACK', packId }),
    [],
  );

  const claimStarterTome = useCallback(
    () => dispatch({ type: 'CLAIM_STARTER_TOME' }),
    [],
  );

  const startExpedition = useCallback(
    (zoneId: string, cardIndices: number[]) =>
      dispatch({ type: 'START_EXPEDITION', zoneId, cardIndices }),
    [],
  );

  const completeQuest = useCallback(
    (questIndex: number, shardTargetIndex?: number) =>
      dispatch({ type: 'COMPLETE_QUEST', questIndex, shardTargetIndex }),
    [],
  );

  const claimCLReward = useCallback(
    (cl: number, shardTargetIndex?: number) =>
      dispatch({ type: 'CLAIM_CL_REWARD', cl, shardTargetIndex }),
    [],
  );

  const claimWeeklyReward = useCallback(
    (tier: number) => dispatch({ type: 'CLAIM_WEEKLY_REWARD', tier }),
    [],
  );

  const setTutorialStep = useCallback(
    (step: number) => dispatch({ type: 'SET_TUTORIAL_STEP', step }),
    [],
  );

  const completeTutorial = useCallback(
    () => dispatch({ type: 'COMPLETE_TUTORIAL' }),
    [],
  );

  const collectExpedition = useCallback(
    (expeditionIndex: number) =>
      dispatch({ type: 'COLLECT_EXPEDITION', expeditionIndex }),
    [],
  );

  const rushExpedition = useCallback(
    (expeditionIndex: number) =>
      dispatch({ type: 'RUSH_EXPEDITION', expeditionIndex }),
    [],
  );

  const buyCryptSlot = useCallback(
    () => dispatch({ type: 'BUY_CRYPT_SLOT' }),
    [],
  );

  const claimLoginStreakReward = useCallback(
    (milestone: number) =>
      dispatch({ type: 'CLAIM_LOGIN_STREAK_REWARD', milestone }),
    [],
  );

  const dismissPackReward = useCallback(
    (packId: string) => dispatch({ type: 'DISMISS_PACK_REWARD', packId }),
    [],
  );

  const loadGame = useCallback(
    (gameState: GameState) =>
      dispatch({ type: 'LOAD_GAME', state: gameState }),
    [],
  );

  const resetGame = useCallback(
    () => dispatch({ type: 'RESET_GAME' }),
    [],
  );

  return {
    state,
    dispatch,
    collectCard,
    collectAll,
    placeCard,
    swapCard,
    removeCard,
    upgradeCard,
    openPack,
    purchasePack,
    claimStarterTome,
    startExpedition,
    collectExpedition,
    completeQuest,
    claimCLReward,
    claimWeeklyReward,
    rushExpedition,
    buyCryptSlot,
    claimLoginStreakReward,
    dismissPackReward,
    setTutorialStep,
    completeTutorial,
    loadGame,
    resetGame,
  };
}
