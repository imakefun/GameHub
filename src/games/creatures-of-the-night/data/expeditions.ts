import type { ExpeditionZone } from '../types';

export const expeditions: ExpeditionZone[] = [
  {
    id: 'misty-woods',
    name: 'Misty Woods',
    description: 'A fog-shrouded forest teeming with minor creatures',
    requirements: { minCards: 2, minLevel: 1 },
    duration: 300, // 5 min
    rewards: {
      shadowEssence: [50, 150],
      soulShards: [5, 15],
    },
  },
  {
    id: 'forgotten-graveyard',
    name: 'Forgotten Graveyard',
    description: 'An ancient burial ground where the dead stir',
    requirements: { minCards: 3, minLevel: 5 },
    duration: 600, // 10 min
    rewards: {
      shadowEssence: [100, 300],
      soulShards: [15, 40],
    },
  },
  {
    id: 'fae-wilds',
    name: 'Fae Wilds',
    description: 'An enchanted realm where the fae hold court',
    requirements: { minCards: 3, minLevel: 10 },
    duration: 900, // 15 min
    rewards: {
      shadowEssence: [150, 400],
      soulShards: [20, 50],
      lunarCrystals: [1, 3],
    },
  },
  {
    id: 'shadow-realm',
    name: 'Shadow Realm',
    description: 'A dimension of living darkness',
    requirements: { minCards: 4, minLevel: 15, requiredTypes: ['shadow'] },
    duration: 1800, // 30 min
    rewards: {
      shadowEssence: [300, 800],
      soulShards: [30, 80],
      lunarCrystals: [2, 5],
    },
  },
  {
    id: 'blood-temple',
    name: 'Blood Temple',
    description: 'A crimson cathedral of vampiric power',
    requirements: { minCards: 4, minLevel: 20, requiredTypes: ['blood'] },
    duration: 3600, // 1 hr
    rewards: {
      shadowEssence: [500, 1200],
      soulShards: [50, 120],
      lunarCrystals: [3, 8],
    },
  },
  {
    id: 'cursed-lands',
    name: 'Cursed Lands',
    description: 'A blighted wasteland of curses and malice',
    requirements: { minCards: 5, minLevel: 25 },
    duration: 5400, // 1.5 hr
    rewards: {
      shadowEssence: [800, 2000],
      soulShards: [80, 200],
      lunarCrystals: [5, 12],
    },
  },
  {
    id: 'infernal-depths',
    name: 'Infernal Depths',
    description: 'The burning pits of the lower planes',
    requirements: { minCards: 5, minLevel: 30, requiredTypes: ['infernal'] },
    duration: 7200, // 2 hr
    rewards: {
      shadowEssence: [1000, 3000],
      soulShards: [100, 250],
      lunarCrystals: [8, 20],
    },
  },
  {
    id: 'cosmic-void',
    name: 'Cosmic Void',
    description: 'The space between dimensions',
    requirements: { minCards: 6, minLevel: 40, requiredTier: 'eternal', requiredTierCount: 1 },
    duration: 14400, // 4 hr
    rewards: {
      shadowEssence: [2000, 5000],
      soulShards: [200, 500],
      lunarCrystals: [15, 30],
      voidEnergy: [1, 5],
    },
  },
];
