import type { CardTier, CardType, CryptSlotUnlock } from '../types';

// CL points per card level-up, by tier
export const clTierMultipliers: Record<CardTier, number> = {
  twilight: 1,
  dusk: 1.5,
  midnight: 2,
  umbral: 3,
  eternal: 5,
};

// CL threshold at which each card type appears in packs
export const typeUnlockCL: Record<CardType, number> = {
  beast: 1,
  shadow: 1,
  spirit: 1,
  blood: 10,
  undead: 10,
  fae: 20,
  magic: 20,
  lycanthrope: 30,
  necromancy: 30,
  cursed: 40,
  stone: 40,
  infernal: 50,
};

// CL thresholds that unlock additional crypt slots (start with 3)
export const cryptSlotUnlocks: CryptSlotUnlock[] = [
  { cl: 15, slot: 4 },
  { cl: 25, slot: 5 },
  { cl: 50, slot: 6 },
  { cl: 75, slot: 7 },
];
