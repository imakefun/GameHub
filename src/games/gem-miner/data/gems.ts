import type { GemDef, GemType } from '../types';

export const GEM_DEFS: Record<GemType, GemDef> = {
  ruby: {
    type: 'ruby',
    name: 'Ruby',
    emoji: '♦',
    color: '#dc2626',
    bgGradient: 'radial-gradient(circle at 35% 35%, #ff6b6b, #dc2626 40%, #991b1b 80%)',
    points: 10,
  },
  sapphire: {
    type: 'sapphire',
    name: 'Sapphire',
    emoji: '◆',
    color: '#2563eb',
    bgGradient: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb 40%, #1e40af 80%)',
    points: 10,
  },
  emerald: {
    type: 'emerald',
    name: 'Emerald',
    emoji: '◆',
    color: '#16a34a',
    bgGradient: 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a 40%, #15803d 80%)',
    points: 10,
  },
  topaz: {
    type: 'topaz',
    name: 'Topaz',
    emoji: '◆',
    color: '#d97706',
    bgGradient: 'radial-gradient(circle at 35% 35%, #fbbf24, #d97706 40%, #b45309 80%)',
    points: 10,
  },
  amethyst: {
    type: 'amethyst',
    name: 'Amethyst',
    emoji: '◆',
    color: '#9333ea',
    bgGradient: 'radial-gradient(circle at 35% 35%, #c084fc, #9333ea 40%, #7e22ce 80%)',
    points: 15,
  },
  diamond: {
    type: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    color: '#06b6d4',
    bgGradient: 'radial-gradient(circle at 35% 35%, #e0f2fe, #67e8f9 30%, #06b6d4 60%, #0891b2 80%)',
    points: 20,
  },
  obsidian: {
    type: 'obsidian',
    name: 'Obsidian',
    emoji: '◆',
    color: '#374151',
    bgGradient: 'radial-gradient(circle at 35% 35%, #6b7280, #374151 40%, #111827 80%)',
    points: 15,
  },
};

export const ALL_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'];

export const BASIC_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz'];

export function getGemDef(type: GemType): GemDef {
  return GEM_DEFS[type];
}
