import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import type { CardDefinition, CardTier, CardType, GameSettings } from '../types';

interface SheetsCache {
  cards: CardDefinition[] | null;
  settings: GameSettings | null;
  lastFetch: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  tickInterval: 1000,
  autoSaveInterval: 10000,
  maxCryptSlots: 12,
  essencePerLevelMultiplier: 0.08,
  levelUpBaseCost: 10,
  levelUpCostMultiplier: 1.15,
  experiencePerCollection: 5,
  experiencePerPack: 25,
  experiencePerLevelUp: 15,
  duplicateShardValue: 5,
  offlineEssenceMultiplier: 0.5,
};

const cache: SheetsCache = {
  cards: null,
  settings: null,
  lastFetch: 0,
};

async function fetchSheet(sheetName: string): Promise<Record<string, string>[]> {
  if (!isSheetsConfigured()) {
    throw new Error('Sheets not configured');
  }

  const baseUrl = SHEETS_CONFIG.apiUrl.replace(/\/$/, '');
  const url = `${baseUrl}?sheet=${encodeURIComponent(sheetName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet ${sheetName}: ${response.statusText}`);
  }

  return response.json();
}

function parseCards(rows: Record<string, string>[]): CardDefinition[] {
  return rows
    .map((row) => ({
      id: row['id'] || '',
      name: row['name'] || '',
      type: (row['type'] || 'beast') as CardType,
      tier: (row['tier'] || 'twilight') as CardTier,
      baseEssenceRate: parseFloat(row['baseEssenceRate'] || row['essencerate'] || '1'),
      baseInterval: parseInt(row['baseInterval'] || row['interval'] || '15'),
      description: row['description'] || '',
      flavorText: row['flavorText'] || row['flavor'] || '',
      artUrl: row['artUrl'] || row['art'] || undefined,
    }))
    .filter((c) => c.id && c.name);
}

function parseSettings(rows: Record<string, string>[]): GameSettings {
  const settings = { ...DEFAULT_SETTINGS };
  rows.forEach((row) => {
    const key = row['key']?.toLowerCase().trim();
    const value = row['value'];
    if (!key || !value) return;

    if (key in settings) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        (settings as Record<string, number>)[key] = num;
      }
    }
  });
  return settings;
}

export async function fetchGameData(): Promise<{
  cards: CardDefinition[];
  settings: GameSettings;
}> {
  const now = Date.now();
  if (cache.cards && cache.settings && now - cache.lastFetch < SHEETS_CONFIG.cacheDuration) {
    return { cards: cache.cards, settings: cache.settings };
  }

  if (!isSheetsConfigured()) {
    throw new Error('Sheets not configured. Set VITE_CREATURES_SHEETS_API.');
  }

  try {
    const [cardRows, settingsRows] = await Promise.all([
      fetchSheet(SHEETS_CONFIG.sheets.cards),
      fetchSheet(SHEETS_CONFIG.sheets.settings).catch(() => []),
    ]);

    const cards = parseCards(cardRows);
    const settings = parseSettings(settingsRows);

    cache.cards = cards;
    cache.settings = settings;
    cache.lastFetch = now;

    console.log(`[Creatures] Loaded from Sheets: ${cards.length} cards`);
    return { cards, settings };
  } catch (error) {
    console.error('[Creatures] Failed to fetch from Sheets:', error);
    throw error;
  }
}

export function clearCache(): void {
  cache.cards = null;
  cache.settings = null;
  cache.lastFetch = 0;
}

export { DEFAULT_SETTINGS };
