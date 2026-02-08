import type { PackDefinition } from '../types';

export const packs: PackDefinition[] = [
  {
    id: 'starter-tome',
    name: 'Starter Tome',
    description: 'A free introductory tome for new summoners. Only Beast, Shadow, Spirit types.',
    cost: null,
    cardCount: 5,
    tierWeights: { twilight: 100 },
    isOneTime: true,
  },
  {
    id: 'standard-tome',
    name: 'Standard Tome',
    description: 'A standard collection of nocturnal creatures',
    cost: { currency: 'shadowEssence', amount: 100 },
    cardCount: 5,
    tierWeights: { twilight: 80, dusk: 15, midnight: 5 },
  },
  {
    id: 'enhanced-tome',
    name: 'Enhanced Tome',
    description: 'A curated tome with stronger creatures guaranteed',
    cost: { currency: 'shadowEssence', amount: 300 },
    cardCount: 5,
    tierWeights: { twilight: 50, dusk: 30, midnight: 15, umbral: 5 },
    guaranteed: 'At least one Dusk or higher',
  },
  {
    id: 'premium-tome',
    name: 'Premium Tome',
    description: 'A rare tome containing the most powerful creatures of the night',
    cost: { currency: 'lunarCrystals', amount: 10 },
    cardCount: 5,
    tierWeights: { dusk: 20, midnight: 40, umbral: 30, eternal: 10 },
    guaranteed: 'At least one Umbral or Eternal',
    isPremium: true,
  },
];
