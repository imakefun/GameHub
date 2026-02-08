import type { TypeSynergy, CrossTypeSynergy, FeatureUnlock, CLReward, DailyQuest } from '../types';

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
export const featureUnlocks: FeatureUnlock[] = [
  // CL 1
  { cl: 1, feature: 'basic-collection', description: 'Collect resources from cards' },
  { cl: 1, feature: 'pack-opening', description: 'Open card tomes' },
  { cl: 1, feature: 'beast-type', description: 'Beast cards available' },
  { cl: 1, feature: 'shadow-type', description: 'Shadow cards available' },
  { cl: 1, feature: 'spirit-type', description: 'Spirit cards available' },
  // CL 3
  { cl: 3, feature: 'shadowkeep', description: 'Collection screen unlocked' },
  // CL 5
  { cl: 5, feature: 'misty-woods', description: 'Misty Woods expedition unlocked' },
  // CL 7
  { cl: 7, feature: 'day-night-cycle', description: 'Day/Night cycle affects cards' },
  // CL 10
  { cl: 10, feature: 'dark-market', description: 'Dark Market trading unlocked' },
  { cl: 10, feature: 'blood-type', description: 'Blood cards available' },
  { cl: 10, feature: 'undead-type', description: 'Undead cards available' },
  // CL 15
  { cl: 15, feature: 'crypt-slot-4', description: '4th Crypt slot unlocked' },
  // CL 20
  { cl: 20, feature: 'forgotten-graveyard', description: 'Forgotten Graveyard expedition unlocked' },
  { cl: 20, feature: 'fae-type', description: 'Fae cards available' },
  { cl: 20, feature: 'magic-type', description: 'Magic cards available' },
  // CL 25
  { cl: 25, feature: 'crypt-slot-5', description: '5th Crypt slot unlocked' },
  // CL 30
  { cl: 30, feature: 'awakening', description: 'Card Awakening system unlocked' },
  { cl: 30, feature: 'lycanthrope-type', description: 'Lycanthrope cards available' },
  { cl: 30, feature: 'necromancy-type', description: 'Necromancy cards available' },
  // CL 40
  { cl: 40, feature: 'fae-wilds', description: 'Fae Wilds expedition unlocked' },
  { cl: 40, feature: 'cursed-type', description: 'Cursed cards available' },
  { cl: 40, feature: 'stone-type', description: 'Stone cards available' },
  // CL 50
  { cl: 50, feature: 'crypt-slot-6', description: '6th Crypt slot unlocked' },
  { cl: 50, feature: 'infernal-type', description: 'Infernal cards available' },
  // CL 60
  { cl: 60, feature: 'shadow-realm', description: 'Shadow Realm expedition unlocked' },
  // CL 75
  { cl: 75, feature: 'crypt-slot-7', description: '7th Crypt slot unlocked' },
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

// ============================================================
// Collection Level Rewards
// ============================================================
function generateCLRewards(): CLReward[] {
  const rewards: CLReward[] = [];

  // Early shadow essence boosts
  rewards.push({ cl: 2, type: 'shadowEssence', amount: 100, description: '100 Shadow Essence' });
  rewards.push({ cl: 3, type: 'shadowEssence', amount: 200, description: '200 Shadow Essence' });
  rewards.push({ cl: 4, type: 'shadowEssence', amount: 300, description: '300 Shadow Essence' });
  rewards.push({ cl: 6, type: 'shadowEssence', amount: 500, description: '500 Shadow Essence' });
  rewards.push({ cl: 8, type: 'shadowEssence', amount: 750, description: '750 Shadow Essence' });
  rewards.push({ cl: 9, type: 'shadowEssence', amount: 1000, description: '1000 Shadow Essence' });

  // Every 5 CL: 1 Standard Tome
  for (let cl = 5; cl <= 150; cl += 5) {
    rewards.push({ cl, type: 'tome', amount: 1, description: '1 Standard Tome' });
  }

  // Every 10 CL: 25 Universal Soul Shards
  for (let cl = 10; cl <= 150; cl += 10) {
    rewards.push({ cl, type: 'soulShards', amount: 25, description: '25 Universal Soul Shards' });
  }

  // Every 25 CL: 3 Lunar Crystals
  for (let cl = 25; cl <= 150; cl += 25) {
    rewards.push({ cl, type: 'lunarCrystals', amount: 3, description: '3 Lunar Crystals' });
  }

  // Every 50 CL: 1 Premium Tome
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
