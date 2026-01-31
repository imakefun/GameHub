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

// Unique clip-path shapes for each gem type
export const GEM_SHAPES: Record<GemType, string> = {
  ruby:     'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  sapphire: 'polygon(50% 2%, 96% 50%, 50% 98%, 4% 50%)',
  emerald:  'polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)',
  topaz:    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  amethyst: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  diamond:  'polygon(20% 0%, 80% 0%, 100% 32%, 65% 100%, 35% 100%, 0% 32%)',
  obsidian: 'polygon(38% 0%, 78% 0%, 100% 42%, 82% 100%, 12% 100%, 0% 55%)',
};

// Extra color data for 3D rendering layers
export const GEM_COLORS: Record<GemType, { light: string; dark: string; facet: string }> = {
  ruby:     { light: '#ff9999', dark: '#7f1d1d', facet: '#ff6b6b' },
  sapphire: { light: '#93bbff', dark: '#1e3a8a', facet: '#60a5fa' },
  emerald:  { light: '#86efac', dark: '#14532d', facet: '#4ade80' },
  topaz:    { light: '#fde68a', dark: '#92400e', facet: '#fbbf24' },
  amethyst: { light: '#d8b4fe', dark: '#581c87', facet: '#c084fc' },
  diamond:  { light: '#e0f2fe', dark: '#0c4a6e', facet: '#67e8f9' },
  obsidian: { light: '#9ca3af', dark: '#030712', facet: '#6b7280' },
};

export const ALL_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond', 'obsidian'];

export const BASIC_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz'];

export function getGemDef(type: GemType): GemDef {
  return GEM_DEFS[type];
}
