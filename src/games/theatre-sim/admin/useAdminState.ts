import { useState, useEffect } from 'react';
import type { GameState } from '../types';

const STORAGE_KEY = 'theatre-sim-save';
const POLL_INTERVAL = 2000;

/** Reads the live game state from localStorage, polling every 2s */
export function useAdminState(): GameState | null {
  const [state, setState] = useState<GameState | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch { /* ignore */ }
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return state;
}
