import type { DesignerLevel, SubmittedLevel } from '../types';

const STORAGE_KEY = 'gem-miner-submitted-levels';

export function loadSubmittedLevels(): SubmittedLevel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return [];
}

export function saveSubmittedLevel(level: DesignerLevel): SubmittedLevel {
  const levels = loadSubmittedLevels();
  const submitted: SubmittedLevel = {
    ...level,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: Date.now(),
  };
  levels.push(submitted);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  return submitted;
}

export function deleteSubmittedLevel(id: string): void {
  const levels = loadSubmittedLevels().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

export function getRandomSubmittedLevel(): SubmittedLevel | null {
  const levels = loadSubmittedLevels();
  if (levels.length === 0) return null;
  return levels[Math.floor(Math.random() * levels.length)];
}
