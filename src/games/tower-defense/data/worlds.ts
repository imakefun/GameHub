import type { WorldDef } from '../types';

export const WORLDS: WorldDef[] = [
  {
    id: 1,
    name: 'Whispering Woods',
    theme: 'forest',
    emoji: '🌲',
    description: 'A peaceful forest, now overrun with slimes and goblins.',
    levelCount: 8,
    color: '#22c55e',
    bgGradient: 'from-green-900 via-emerald-950 to-green-950',
  },
  {
    id: 2,
    name: 'Scorching Sands',
    theme: 'desert',
    emoji: '🏜️',
    description: 'The desert hides ancient ruins and dangerous creatures.',
    levelCount: 8,
    color: '#f59e0b',
    bgGradient: 'from-amber-900 via-orange-950 to-yellow-950',
  },
  {
    id: 3,
    name: 'Frozen Peaks',
    theme: 'ice',
    emoji: '🏔️',
    description: 'Treacherous ice mountains where wraiths and wolves roam.',
    levelCount: 8,
    color: '#38bdf8',
    bgGradient: 'from-sky-900 via-cyan-950 to-blue-950',
  },
  {
    id: 4,
    name: 'Inferno Depths',
    theme: 'volcano',
    emoji: '🌋',
    description: 'The volcanic underworld is home to demons and dragons.',
    levelCount: 8,
    color: '#ef4444',
    bgGradient: 'from-red-900 via-red-950 to-orange-950',
  },
  {
    id: 5,
    name: 'Shadow Realm',
    theme: 'shadow',
    emoji: '🌑',
    description: 'The final frontier. Only the bravest survive the darkness.',
    levelCount: 8,
    color: '#a855f7',
    bgGradient: 'from-purple-900 via-violet-950 to-slate-950',
  },
  {
    id: 6,
    name: 'Crystal Caverns',
    theme: 'crystal',
    emoji: '💎',
    description: 'Bonus world! Challenging levels with unique mechanics.',
    levelCount: 5,
    color: '#06b6d4',
    bgGradient: 'from-cyan-900 via-teal-950 to-emerald-950',
  },
];

export function getWorld(id: number): WorldDef | undefined {
  return WORLDS.find(w => w.id === id);
}
