import type { DesignerLevel, SubmittedLevel } from '../types';

const API = '/api/community-levels';
// Static file served from public/ — used as GET fallback in production builds
const STATIC = import.meta.env.BASE_URL + 'community-levels.json';

export async function fetchSubmittedLevels(): Promise<SubmittedLevel[]> {
  try {
    // Try the API first (dev server), fall back to static JSON (production)
    const res = await fetch(API);
    if (res.ok) return res.json();
    const fallback = await fetch(STATIC);
    if (fallback.ok) return fallback.json();
  } catch {
    try {
      const fallback = await fetch(STATIC);
      if (fallback.ok) return fallback.json();
    } catch { /* offline / broken */ }
  }
  return [];
}

export async function submitLevel(level: DesignerLevel): Promise<SubmittedLevel> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(level),
  });
  if (!res.ok) throw new Error('Failed to submit level');
  return res.json();
}

export async function deleteSubmittedLevel(id: string): Promise<void> {
  await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}
