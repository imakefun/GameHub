import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import type { Element, Recipe, Generator } from '../types';
import type { ElementTier } from '../types';

// Cache for fetched data
interface SheetsCache {
  elements: Element[] | null;
  recipes: Recipe[] | null;
  generators: Generator[] | null;
  settings: GameSettings | null;
  lastFetch: number;
}

export interface GameSettings {
  startingMoney: number;
  startingEnergy: number;
  upgradeCostBase: number;
  upgradeCostMultiplier: number;
  maxGeneratorLevel: number;
  tickInterval: number;
  marketUpdateInterval: number;
  autoSaveInterval: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  startingMoney: 50,
  startingEnergy: 100,
  upgradeCostBase: 100,
  upgradeCostMultiplier: 1.5,
  maxGeneratorLevel: 20,
  tickInterval: 100,
  marketUpdateInterval: 30000,
  autoSaveInterval: 10000,
};

const cache: SheetsCache = {
  elements: null,
  recipes: null,
  generators: null,
  settings: null,
  lastFetch: 0,
};

// Fetch data from a specific sheet
async function fetchSheet(sheetName: string): Promise<string[][]> {
  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets not configured');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${SHEETS_CONFIG.apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch sheet ${sheetName}: ${error}`);
  }

  const data = await response.json();
  return data.values || [];
}

// Parse Elements sheet
// Expected columns: id, name, emoji, tier, description, baseValue, isBase
function parseElements(rows: string[][]): Element[] {
  if (rows.length < 2) return []; // Need header + at least one row

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('name');
  const emojiIdx = headers.indexOf('emoji');
  const tierIdx = headers.indexOf('tier');
  const descIdx = headers.indexOf('description');
  const valueIdx = headers.indexOf('basevalue');
  const isBaseIdx = headers.indexOf('isbase');

  return rows.slice(1).map((row) => ({
    id: row[idIdx] || '',
    name: row[nameIdx] || '',
    emoji: row[emojiIdx] || '❓',
    tier: (parseInt(row[tierIdx]) || 1) as ElementTier,
    description: row[descIdx] || '',
    baseValue: parseInt(row[valueIdx]) || 5,
    isBase: row[isBaseIdx]?.toLowerCase() === 'true',
  })).filter((e) => e.id); // Filter out empty rows
}

// Parse Recipes sheet
// Expected columns: id, input1, amount1, input2, amount2, input3, amount3, outputId, outputAmount, energyCost
function parseRecipes(rows: string[][]): Recipe[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = headers.indexOf('id');
  const input1Idx = headers.indexOf('input1');
  const amount1Idx = headers.indexOf('amount1');
  const input2Idx = headers.indexOf('input2');
  const amount2Idx = headers.indexOf('amount2');
  const input3Idx = headers.indexOf('input3');
  const amount3Idx = headers.indexOf('amount3');
  const outputIdx = headers.indexOf('outputid');
  const outputAmountIdx = headers.indexOf('outputamount');
  const energyIdx = headers.indexOf('energycost');

  return rows.slice(1).map((row) => {
    const inputs: { elementId: string; amount: number }[] = [];

    if (row[input1Idx]) {
      inputs.push({
        elementId: row[input1Idx],
        amount: parseInt(row[amount1Idx]) || 1,
      });
    }
    if (row[input2Idx]) {
      inputs.push({
        elementId: row[input2Idx],
        amount: parseInt(row[amount2Idx]) || 1,
      });
    }
    if (row[input3Idx]) {
      inputs.push({
        elementId: row[input3Idx],
        amount: parseInt(row[amount3Idx]) || 1,
      });
    }

    return {
      id: row[idIdx] || '',
      inputs,
      output: {
        elementId: row[outputIdx] || '',
        amount: parseInt(row[outputAmountIdx]) || 1,
      },
      energyCost: parseInt(row[energyIdx]) || 10,
      discovered: false,
    };
  }).filter((r) => r.id && r.inputs.length > 0); // Filter out invalid rows
}

// Parse Generators sheet
// Expected columns: id, name, emoji, description, tier, produces (comma-separated elementId:amount), baseEnergyCost, baseCooldown, unlockCost, unlocked
function parseGenerators(rows: string[][]): Generator[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('name');
  const emojiIdx = headers.indexOf('emoji');
  const descIdx = headers.indexOf('description');
  const tierIdx = headers.indexOf('tier');
  const producesIdx = headers.indexOf('produces');
  const energyIdx = headers.indexOf('baseenergycost');
  const cooldownIdx = headers.indexOf('basecooldown');
  const unlockCostIdx = headers.indexOf('unlockcost');
  const unlockedIdx = headers.indexOf('unlocked');

  return rows.slice(1).map((row) => {
    // Parse produces format: "fire:1,water:2"
    const producesStr = row[producesIdx] || '';
    const produces = producesStr.split(',').map((p) => {
      const [elementId, amount] = p.trim().split(':');
      return {
        elementId: elementId?.trim() || '',
        baseAmount: parseInt(amount) || 1,
      };
    }).filter((p) => p.elementId);

    return {
      id: row[idIdx] || '',
      name: row[nameIdx] || '',
      emoji: row[emojiIdx] || '⚙️',
      description: row[descIdx] || '',
      tier: (parseInt(row[tierIdx]) || 1) as ElementTier,
      produces,
      baseEnergyCost: parseInt(row[energyIdx]) || 0,
      baseCooldown: parseInt(row[cooldownIdx]) || 3,
      unlockCost: parseInt(row[unlockCostIdx]) || 0,
      unlocked: row[unlockedIdx]?.toLowerCase() === 'true',
    };
  }).filter((g) => g.id); // Filter out empty rows
}

// Parse Settings sheet
// Expected format: key-value pairs in columns A and B
function parseSettings(rows: string[][]): GameSettings {
  const settings = { ...DEFAULT_SETTINGS };

  rows.forEach((row) => {
    const key = row[0]?.toLowerCase().trim();
    const value = row[1];

    switch (key) {
      case 'startingmoney':
        settings.startingMoney = parseInt(value) || DEFAULT_SETTINGS.startingMoney;
        break;
      case 'startingenergy':
        settings.startingEnergy = parseInt(value) || DEFAULT_SETTINGS.startingEnergy;
        break;
      case 'upgradecostbase':
        settings.upgradeCostBase = parseInt(value) || DEFAULT_SETTINGS.upgradeCostBase;
        break;
      case 'upgradecostmultiplier':
        settings.upgradeCostMultiplier = parseFloat(value) || DEFAULT_SETTINGS.upgradeCostMultiplier;
        break;
      case 'maxgeneratorlevel':
        settings.maxGeneratorLevel = parseInt(value) || DEFAULT_SETTINGS.maxGeneratorLevel;
        break;
      case 'tickinterval':
        settings.tickInterval = parseInt(value) || DEFAULT_SETTINGS.tickInterval;
        break;
      case 'marketupdateinterval':
        settings.marketUpdateInterval = parseInt(value) || DEFAULT_SETTINGS.marketUpdateInterval;
        break;
      case 'autosaveinterval':
        settings.autoSaveInterval = parseInt(value) || DEFAULT_SETTINGS.autoSaveInterval;
        break;
    }
  });

  return settings;
}

// Main function to fetch all game data
export async function fetchGameData(): Promise<{
  elements: Element[];
  recipes: Recipe[];
  generators: Generator[];
  settings: GameSettings;
}> {
  // Check cache
  const now = Date.now();
  if (
    cache.elements &&
    cache.recipes &&
    cache.generators &&
    cache.settings &&
    now - cache.lastFetch < SHEETS_CONFIG.cacheDuration
  ) {
    return {
      elements: cache.elements,
      recipes: cache.recipes,
      generators: cache.generators,
      settings: cache.settings,
    };
  }

  if (!isSheetsConfigured()) {
    throw new Error('Google Sheets not configured. Set VITE_GOOGLE_SHEETS_API_KEY and VITE_ALCHEMOJI_SHEET_ID environment variables.');
  }

  try {
    // Fetch all sheets in parallel
    const [elementsRows, recipesRows, generatorsRows, settingsRows] = await Promise.all([
      fetchSheet(SHEETS_CONFIG.sheets.elements),
      fetchSheet(SHEETS_CONFIG.sheets.recipes),
      fetchSheet(SHEETS_CONFIG.sheets.generators),
      fetchSheet(SHEETS_CONFIG.sheets.settings),
    ]);

    // Parse data
    const elements = parseElements(elementsRows);
    const recipes = parseRecipes(recipesRows);
    const generators = parseGenerators(generatorsRows);
    const settings = parseSettings(settingsRows);

    // Update cache
    cache.elements = elements;
    cache.recipes = recipes;
    cache.generators = generators;
    cache.settings = settings;
    cache.lastFetch = now;

    console.log(`[Alchemoji] Loaded from Google Sheets: ${elements.length} elements, ${recipes.length} recipes, ${generators.length} generators`);

    return { elements, recipes, generators, settings };
  } catch (error) {
    console.error('[Alchemoji] Failed to fetch from Google Sheets:', error);
    throw error;
  }
}

// Clear the cache (useful for forcing a refresh)
export function clearCache(): void {
  cache.elements = null;
  cache.recipes = null;
  cache.generators = null;
  cache.settings = null;
  cache.lastFetch = 0;
}

// Export default settings for fallback
export { DEFAULT_SETTINGS };
