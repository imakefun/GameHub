import type { CardType, CryptSlotUnlock } from '../types';

// CL threshold at which each card type appears in packs
export const typeUnlockCL: Record<CardType, number> = {
  beast: 1,
  shadow: 1,
  spirit: 1,
  lycanthrope: 1,     // Available early in Set 1 CL road
  blood: 10,
  undead: 10,
  fae: 20,
  magic: 20,
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

// ============================================================
// CL Road Phase 1: Starter (CL 1–32)
// ============================================================
// Players start with Rat, Bat, and Owl beast cards unlocked.
// Upon increasing collection level they unlock new cards from Set 1.
export interface CLRoadEntry {
  cl: number;
  cardId: string;
  cardName: string;
}

export const clRoadPhase1: CLRoadEntry[] = [
  { cl: 1,  cardId: 'set1-shadow-imp',        cardName: 'Shadow Imp' },
  { cl: 2,  cardId: 'set1-moon-touched',       cardName: 'Moon-Touched' },
  { cl: 4,  cardId: 'set1-shadow-rat',         cardName: 'Shadow Rat' },
  { cl: 6,  cardId: 'set1-partial-shifter',    cardName: 'Partial Shifter' },
  { cl: 8,  cardId: 'set1-darkness-wisp',      cardName: 'Darkness Wisp' },
  { cl: 10, cardId: 'set1-werewolf-pup',       cardName: 'Werewolf Pup' },
  { cl: 12, cardId: 'set1-dusk-hound',         cardName: 'Dusk Hound' },
  { cl: 14, cardId: 'set1-moonlight-stalker',  cardName: 'Moonlight Stalker' },
  { cl: 16, cardId: 'set1-wolf-kin',           cardName: 'Wolf Kin' },
  { cl: 18, cardId: 'set1-umbral-stalker',     cardName: 'Umbral Stalker' },
  { cl: 20, cardId: 'set1-night-stalker',      cardName: 'Night Stalker' },
  { cl: 22, cardId: 'set1-moon-hunter',        cardName: 'Moon Hunter' },
  { cl: 24, cardId: 'set1-shadow-weaver',      cardName: 'Shadow Weaver' },
  { cl: 26, cardId: 'set1-mist-panther',       cardName: 'Mist Panther' },
  { cl: 28, cardId: 'set1-pack-runner',        cardName: 'Pack Runner' },
  { cl: 30, cardId: 'set1-night-shroud',       cardName: 'Night Shroud' },
  { cl: 32, cardId: 'set1-dire-wolf',          cardName: 'Dire Wolf' },
];
