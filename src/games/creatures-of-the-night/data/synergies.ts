import type { TypeSynergy, CrossTypeSynergy, FeatureUnlock, CLReward, DailyQuest, CardType } from '../types';
import { typeUnlockCL, cryptSlotUnlocks, clRoadPhase1 } from './clConfig';

// ============================================================
// Type Synergies (same-type bonuses)
// ============================================================
export const typeSynergies: TypeSynergy[] = [
  { type: 'beast', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Wild Fury: Double essence during full moon' },
  { type: 'spirit', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Ethereal Harvest: Collect from all at once' },
  { type: 'shadow', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Dark Veil: +100% night generation' },
  { type: 'fae', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Fairy Ring: Random bonus resources' },
  { type: 'blood', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Blood Ritual: Convert essence to shards' },
  { type: 'magic', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Arcane Surge: Boost all nearby cards' },
  { type: 'necromancy', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Undying Legion: Cards can\'t lose levels' },
  { type: 'cursed', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Curse Reversal: Negatives become positives' },
  { type: 'lycanthrope', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Pack Mentality: +200% during full moon' },
  { type: 'undead', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Deathless: Generate while game is closed' },
  { type: 'stone', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Immovable: No negative event effects' },
  { type: 'infernal', thresholds: [{ count: 3, bonus: 10 }, { count: 5, bonus: 25 }, { count: 8, bonus: 50 }], fullSetAbility: 'Hellfire: Burn excess for bonus rewards' },
];

// ============================================================
// Cross-Type Synergies (10 pairs from spec)
// ============================================================
export const crossTypeSynergies: CrossTypeSynergy[] = [
  {
    id: 'wild-hunt',
    name: 'Wild Hunt',
    type1: 'beast',
    type2: 'lycanthrope',
    primaryEffect: 'Expedition time -30%',
    bonusEffect: 'Increased resource generation during full moon events',
    productionBonus: 15,
  },
  {
    id: 'ghostly-legion',
    name: 'Ghostly Legion',
    type1: 'spirit',
    type2: 'undead',
    primaryEffect: '25% chance double resources',
    bonusEffect: 'Spirit resurrect damaged Undead cards',
    productionBonus: 25,
  },
  {
    id: 'hellish-contract',
    name: 'Hellish Contract',
    type1: 'blood',
    type2: 'infernal',
    primaryEffect: '+20% generation',
    bonusEffect: 'Blood gain fire, Infernal gain vampiric abilities',
    productionBonus: 20,
  },
  {
    id: 'living-darkness',
    name: 'Living Darkness',
    type1: 'shadow',
    type2: 'stone',
    primaryEffect: 'Offline extended to 12h',
    bonusEffect: 'Immune to expedition hazards',
    productionBonus: 15,
  },
  {
    id: 'arcane-enchantment',
    name: 'Arcane Enchantment',
    type1: 'magic',
    type2: 'fae',
    primaryEffect: 'Spell effects 50% longer',
    bonusEffect: 'Cards enchant others temporarily',
    productionBonus: 12,
  },
  {
    id: 'doom-pact',
    name: 'Doom Pact',
    type1: 'necromancy',
    type2: 'cursed',
    primaryEffect: 'Expedition rewards +25%',
    bonusEffect: 'Convert negatives into bonuses',
    productionBonus: 15,
  },
  {
    id: 'wild-enchantment',
    name: 'Wild Enchantment',
    type1: 'fae',
    type2: 'beast',
    primaryEffect: '20% chance Lunar Crystal on collect',
    bonusEffect: 'Fae gain natural armor, Beast gain enchantments',
    productionBonus: 12,
  },
  {
    id: 'midnight-hunters',
    name: 'Midnight Hunters',
    type1: 'shadow',
    type2: 'lycanthrope',
    primaryEffect: 'New moon +75% production',
    bonusEffect: '35% faster night expeditions',
    productionBonus: 18,
  },
  {
    id: 'hemomancy',
    name: 'Hemomancy',
    type1: 'blood',
    type2: 'magic',
    primaryEffect: '15% chance speed up timers',
    bonusEffect: 'Magic boost Blood production rates',
    productionBonus: 15,
  },
  {
    id: 'deaths-dominion',
    name: "Death's Dominion",
    type1: 'necromancy',
    type2: 'undead',
    primaryEffect: 'Undead generate Soul Shards',
    bonusEffect: '25% chance to instant collect all Undead',
    productionBonus: 18,
  },
];

// ============================================================
// Feature Unlocks by Collection Level (CL)
// ============================================================
// Type-unlock and crypt-slot entries are auto-derived from clConfig
// to avoid duplicating CL thresholds in multiple places.

const TYPE_LABELS: Record<CardType, string> = {
  beast: 'Beast', shadow: 'Shadow', spirit: 'Spirit', fae: 'Fae',
  blood: 'Blood', magic: 'Magic', necromancy: 'Necromancy', cursed: 'Cursed',
  lycanthrope: 'Lycanthrope', undead: 'Undead', stone: 'Stone', infernal: 'Infernal',
};

function buildFeatureUnlocks(): FeatureUnlock[] {
  const manual: FeatureUnlock[] = [
    // CL 1
    { cl: 1, feature: 'basic-collection', description: 'Collect resources from cards' },
    { cl: 1, feature: 'pack-opening', description: 'Open card tomes' },
    // CL 3
    { cl: 3, feature: 'shadowkeep', description: 'Collection screen unlocked' },
    // CL 5
    { cl: 5, feature: 'misty-woods', description: 'Misty Woods expedition unlocked' },
    // CL 7
    { cl: 7, feature: 'day-night-cycle', description: 'Day/Night cycle affects cards' },
    // CL 10
    { cl: 10, feature: 'dark-market', description: 'Dark Market trading unlocked' },
    // CL 20
    { cl: 20, feature: 'forgotten-graveyard', description: 'Forgotten Graveyard expedition unlocked' },
    // CL 30
    { cl: 30, feature: 'awakening', description: 'Card Awakening system unlocked' },
    // CL 40
    { cl: 40, feature: 'fae-wilds', description: 'Fae Wilds expedition unlocked' },
    // CL 60
    { cl: 60, feature: 'shadow-realm', description: 'Shadow Realm expedition unlocked' },
    // CL 80
    { cl: 80, feature: 'blood-temple', description: 'Blood Temple expedition unlocked' },
    // CL 100
    { cl: 100, feature: 'cursed-lands', description: 'Cursed Lands expedition unlocked' },
    { cl: 100, feature: 'ancient-catacombs', description: 'Ancient Catacombs expedition unlocked' },
    // CL 120
    { cl: 120, feature: 'infernal-depths', description: 'Infernal Depths expedition unlocked' },
    { cl: 120, feature: 'void-nexus', description: 'Void Nexus expedition unlocked' },
    // CL 130
    { cl: 130, feature: 'celestial-spire', description: 'Celestial Spire expedition unlocked' },
    // CL 150
    { cl: 150, feature: 'cosmic-void', description: 'Cosmic Void expedition unlocked' },
    { cl: 150, feature: 'primordial-void', description: 'Primordial Void expedition unlocked' },
  ];

  // Auto-derive type-unlock entries from clConfig.typeUnlockCL
  for (const [type, cl] of Object.entries(typeUnlockCL)) {
    const label = TYPE_LABELS[type as CardType] || type;
    manual.push({ cl, feature: `${type}-type`, description: `${label} cards available` });
  }

  // Auto-derive crypt-slot entries from clConfig.cryptSlotUnlocks
  for (const { cl, slot } of cryptSlotUnlocks) {
    manual.push({ cl, feature: `crypt-slot-${slot}`, description: `${ordinal(slot)} Crypt slot unlocked` });
  }

  return manual.sort((a, b) => a.cl - b.cl);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const featureUnlocks: FeatureUnlock[] = buildFeatureUnlocks();

// ============================================================
// Collection Level Rewards — CL Road
// ============================================================
// Phase 1 (CL 1-32): Card unlocks from Set 1
// Higher CL: Currency/tome rewards + future phases

function generateCLRewards(): CLReward[] {
  const rewards: CLReward[] = [];

  // Phase 1: CL Road card unlocks (CL 1-32)
  for (const entry of clRoadPhase1) {
    rewards.push({
      cl: entry.cl,
      type: 'card',
      amount: 1,
      description: entry.cardName,
      cardId: entry.cardId,
    });
  }

  // Essence boosts interspersed with card unlocks
  rewards.push({ cl: 3, type: 'shadowEssence', amount: 150, description: '150 Shadow Essence' });
  rewards.push({ cl: 5, type: 'shadowEssence', amount: 250, description: '250 Shadow Essence' });
  rewards.push({ cl: 7, type: 'shadowEssence', amount: 400, description: '400 Shadow Essence' });
  rewards.push({ cl: 9, type: 'shadowEssence', amount: 500, description: '500 Shadow Essence' });
  rewards.push({ cl: 11, type: 'shadowEssence', amount: 600, description: '600 Shadow Essence' });
  rewards.push({ cl: 13, type: 'shadowEssence', amount: 750, description: '750 Shadow Essence' });
  rewards.push({ cl: 15, type: 'soulShards', amount: 25, description: '25 Universal Soul Shards' });
  rewards.push({ cl: 17, type: 'shadowEssence', amount: 1000, description: '1000 Shadow Essence' });
  rewards.push({ cl: 19, type: 'shadowEssence', amount: 1200, description: '1200 Shadow Essence' });
  rewards.push({ cl: 21, type: 'soulShards', amount: 50, description: '50 Universal Soul Shards' });
  rewards.push({ cl: 23, type: 'lunarCrystals', amount: 3, description: '3 Lunar Crystals' });
  rewards.push({ cl: 25, type: 'tome', amount: 1, description: '1 Standard Tome' });
  rewards.push({ cl: 27, type: 'soulShards', amount: 75, description: '75 Universal Soul Shards' });
  rewards.push({ cl: 29, type: 'lunarCrystals', amount: 5, description: '5 Lunar Crystals' });
  rewards.push({ cl: 31, type: 'shadowEssence', amount: 2000, description: '2000 Shadow Essence' });

  // Higher CL rewards (beyond Phase 1)
  for (let cl = 35; cl <= 150; cl += 5) {
    rewards.push({ cl, type: 'tome', amount: 1, description: '1 Standard Tome' });
  }
  for (let cl = 40; cl <= 150; cl += 10) {
    rewards.push({ cl, type: 'soulShards', amount: 25, description: '25 Universal Soul Shards' });
  }
  for (let cl = 50; cl <= 150; cl += 25) {
    rewards.push({ cl, type: 'lunarCrystals', amount: 3, description: '3 Lunar Crystals' });
  }
  for (let cl = 50; cl <= 150; cl += 50) {
    rewards.push({ cl, type: 'premiumTome', amount: 1, description: '1 Premium Tome' });
  }

  return rewards.sort((a, b) => a.cl - b.cl);
}

export const clRewards: CLReward[] = generateCLRewards();

// ============================================================
// Daily Quest Pool
// ============================================================
export const dailyQuestPool: DailyQuest[] = [
  // Easy quests: 50-100 SE + 5-10 shards
  {
    id: 'collect-5-cards',
    description: 'Collect from 5 cards',
    target: 5,
    difficulty: 'easy',
    rewards: { shadowEssence: 75, soulShards: 8 },
  },
  {
    id: 'login-night',
    description: 'Log in during nighttime',
    target: 1,
    difficulty: 'easy',
    rewards: { shadowEssence: 50, soulShards: 5 },
  },
  {
    id: 'open-1-pack',
    description: 'Open 1 tome',
    target: 1,
    difficulty: 'easy',
    rewards: { shadowEssence: 100, soulShards: 10 },
  },
  {
    id: 'level-up-1',
    description: 'Level up a card',
    target: 1,
    difficulty: 'easy',
    rewards: { shadowEssence: 75, soulShards: 7 },
  },
  {
    id: 'collect-500-essence',
    description: 'Collect 500 Shadow Essence',
    target: 500,
    difficulty: 'easy',
    rewards: { shadowEssence: 80, soulShards: 8 },
  },
  {
    id: 'send-expedition',
    description: 'Send a card on expedition',
    target: 1,
    difficulty: 'easy',
    rewards: { shadowEssence: 100, soulShards: 10 },
  },
  // Hard quests: 500 SE + 20-50 shards + chance 1 LC
  {
    id: 'collect-15-cards',
    description: 'Collect from 15 cards',
    target: 15,
    difficulty: 'hard',
    rewards: { shadowEssence: 500, soulShards: 30, lunarCrystals: 1 },
  },
  {
    id: 'level-up-5',
    description: 'Level up 5 cards',
    target: 5,
    difficulty: 'hard',
    rewards: { shadowEssence: 500, soulShards: 40, lunarCrystals: 1 },
  },
  {
    id: 'collect-5000-essence',
    description: 'Collect 5000 Shadow Essence',
    target: 5000,
    difficulty: 'hard',
    rewards: { shadowEssence: 500, soulShards: 50, lunarCrystals: 1 },
  },
  {
    id: 'complete-3-expeditions',
    description: 'Complete 3 expeditions',
    target: 3,
    difficulty: 'hard',
    rewards: { shadowEssence: 500, soulShards: 35, lunarCrystals: 1 },
  },
];
