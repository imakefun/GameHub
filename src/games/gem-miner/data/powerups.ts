import type { PowerUpDef, PowerUpType } from '../types';

export const POWERUP_DEFS: Record<PowerUpType, PowerUpDef> = {
  dynamite: {
    type: 'dynamite',
    name: 'Dynamite',
    emoji: '🧨',
    description: 'Blasts a 3×3 area, clearing gems and breaking obstacles',
    needsTarget: true,
  },
  pickaxe: {
    type: 'pickaxe',
    name: 'Pickaxe',
    emoji: '⛏️',
    description: 'Destroys any single cell, even rock or ice',
    needsTarget: true,
  },
  drill: {
    type: 'drill',
    name: 'Drill',
    emoji: '🔩',
    description: 'Clears an entire column from top to bottom',
    needsTarget: true,
  },
  earthquake: {
    type: 'earthquake',
    name: 'Earthquake',
    emoji: '🌋',
    description: 'Shuffles all gems on the board',
    needsTarget: false,
  },
  lantern: {
    type: 'lantern',
    name: 'Lantern',
    emoji: '🔦',
    description: 'Reveals the best available move',
    needsTarget: false,
  },
};

export const ALL_POWERUP_TYPES: PowerUpType[] = ['dynamite', 'pickaxe', 'drill', 'earthquake', 'lantern'];

export const DEFAULT_POWERUPS: Record<PowerUpType, number> = {
  dynamite: 3,
  pickaxe: 5,
  drill: 2,
  earthquake: 2,
  lantern: 3,
};
