import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import type {
  CardDefinition,
  CardTier,
  CardType,
  PackDefinition,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  DailyQuest,
  GameSettings,
} from '../types';

// ============================================================
// Cache
// ============================================================

interface SheetsCache {
  cards: CardDefinition[] | null;
  packs: PackDefinition[] | null;
  expeditions: ExpeditionZone[] | null;
  typeSynergies: TypeSynergy[] | null;
  crossTypeSynergies: CrossTypeSynergy[] | null;
  dailyQuests: DailyQuest[] | null;
  settings: GameSettings | null;
  lastFetch: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  tickInterval: 1000,
  autoSaveInterval: 10000,
  maxCryptSlots: 7,
  essencePerLevelPercent: 0.05,
  offlineMaxHours: 8,
  offlineEssenceMultiplier: 0.5,
};

const cache: SheetsCache = {
  cards: null,
  packs: null,
  expeditions: null,
  typeSynergies: null,
  crossTypeSynergies: null,
  dailyQuests: null,
  settings: null,
  lastFetch: 0,
};

// ============================================================
// Fetch helper
// ============================================================

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

// ============================================================
// Parsers
// ============================================================

function parseCards(rows: Record<string, string>[]): CardDefinition[] {
  return rows
    .map((row) => ({
      id: row['id'] || '',
      name: row['name'] || '',
      type: (row['type'] || 'beast') as CardType,
      tier: (row['tier'] || 'twilight') as CardTier,
      baseGenerationAmount: parseFloat(row['baseGenerationAmount'] || row['baseEssenceRate'] || '1'),
      baseInterval: parseInt(row['baseInterval'] || row['interval'] || '30'),
      description: row['description'] || '',
      flavorText: row['flavorText'] || row['flavor'] || '',
      artUrl: row['artUrl'] || row['art'] || undefined,
    }))
    .filter((c) => c.id && c.name);
}

function parsePacks(rows: Record<string, string>[]): PackDefinition[] {
  return rows
    .map((row) => {
      const costCurrency = row['costCurrency'] || '';
      const costAmount = parseFloat(row['costAmount'] || '0');
      const cost = costCurrency
        ? { currency: costCurrency as keyof import('../types').Currencies, amount: costAmount }
        : null;

      // Parse tier weights from columns like tierWeight_twilight, tierWeight_dusk, etc.
      const tierWeights: Partial<Record<CardTier, number>> = {};
      const tiers: CardTier[] = ['twilight', 'dusk', 'midnight', 'umbral', 'eternal'];
      for (const tier of tiers) {
        const w = parseFloat(row[`tierWeight_${tier}`] || '0');
        if (w > 0) tierWeights[tier] = w;
      }

      return {
        id: row['id'] || '',
        name: row['name'] || '',
        description: row['description'] || '',
        cost,
        cardCount: parseInt(row['cardCount'] || '5'),
        tierWeights,
        guaranteed: row['guaranteed'] || undefined,
        isOneTime: row['isOneTime'] === 'true' || row['isOneTime'] === '1',
        isPremium: row['isPremium'] === 'true' || row['isPremium'] === '1',
      };
    })
    .filter((p) => p.id && p.name);
}

function parseExpeditions(rows: Record<string, string>[]): ExpeditionZone[] {
  return rows
    .map((row) => {
      const requiredTypesRaw = row['requiredTypes'] || '';
      const requiredTypes = requiredTypesRaw
        ? (requiredTypesRaw.split(',').map((t) => t.trim()) as CardType[])
        : undefined;

      return {
        id: row['id'] || '',
        name: row['name'] || '',
        description: row['description'] || '',
        unlockCL: parseInt(row['unlockCL'] || '1'),
        requirements: {
          minCards: parseInt(row['minCards'] || '1'),
          requiredTypes,
          requiredTier: row['requiredTier'] ? (row['requiredTier'] as CardTier) : undefined,
          requiredTierCount: row['requiredTierCount'] ? parseInt(row['requiredTierCount']) : undefined,
        },
        durationRange: [
          parseInt(row['durationMin'] || '900'),
          parseInt(row['durationMax'] || '3600'),
        ] as [number, number],
        rewards: {
          shadowEssence: row['rewardSEMin'] ? [parseInt(row['rewardSEMin']), parseInt(row['rewardSEMax'] || row['rewardSEMin'])] as [number, number] : undefined,
          soulShards: row['rewardSSMin'] ? [parseInt(row['rewardSSMin']), parseInt(row['rewardSSMax'] || row['rewardSSMin'])] as [number, number] : undefined,
          lunarCrystals: row['rewardLCMin'] ? [parseInt(row['rewardLCMin']), parseInt(row['rewardLCMax'] || row['rewardLCMin'])] as [number, number] : undefined,
          voidEnergy: row['rewardVEMin'] ? [parseInt(row['rewardVEMin']), parseInt(row['rewardVEMax'] || row['rewardVEMin'])] as [number, number] : undefined,
        },
        riskPercent: parseInt(row['riskPercent'] || '0'),
        riskEffect: (row['riskEffect'] || 'fatigue') as ExpeditionZone['riskEffect'],
        riskDuration: parseInt(row['riskDuration'] || '1800'),
      };
    })
    .filter((e) => e.id && e.name);
}

function parseTypeSynergies(rows: Record<string, string>[]): TypeSynergy[] {
  return rows
    .map((row) => {
      const thresholds: { count: number; bonus: number }[] = [];
      // Parse thresholds from columns: threshold1_count, threshold1_bonus, etc.
      for (let i = 1; i <= 5; i++) {
        const count = parseInt(row[`threshold${i}_count`] || '0');
        const bonus = parseInt(row[`threshold${i}_bonus`] || '0');
        if (count > 0) thresholds.push({ count, bonus });
      }

      return {
        type: (row['type'] || '') as CardType,
        thresholds,
        fullSetAbility: row['fullSetAbility'] || undefined,
      };
    })
    .filter((s) => s.type && s.thresholds.length > 0);
}

function parseCrossTypeSynergies(rows: Record<string, string>[]): CrossTypeSynergy[] {
  return rows
    .map((row) => ({
      id: row['id'] || '',
      name: row['name'] || '',
      type1: (row['type1'] || '') as CardType,
      type2: (row['type2'] || '') as CardType,
      primaryEffect: row['primaryEffect'] || '',
      bonusEffect: row['bonusEffect'] || '',
      productionBonus: parseFloat(row['productionBonus'] || '0'),
    }))
    .filter((s) => s.id && s.type1 && s.type2);
}

function parseDailyQuests(rows: Record<string, string>[]): DailyQuest[] {
  return rows
    .map((row) => ({
      id: row['id'] || '',
      description: row['description'] || '',
      target: parseInt(row['target'] || '1'),
      difficulty: (row['difficulty'] || 'easy') as DailyQuest['difficulty'],
      rewards: {
        shadowEssence: row['rewardSE'] ? parseInt(row['rewardSE']) : undefined,
        soulShards: row['rewardSS'] ? parseInt(row['rewardSS']) : undefined,
        lunarCrystals: row['rewardLC'] ? parseInt(row['rewardLC']) : undefined,
      },
    }))
    .filter((q) => q.id && q.description);
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

// ============================================================
// Public API
// ============================================================

export interface GameSheetData {
  cards: CardDefinition[];
  packs: PackDefinition[] | null;
  expeditions: ExpeditionZone[] | null;
  typeSynergies: TypeSynergy[] | null;
  crossTypeSynergies: CrossTypeSynergy[] | null;
  dailyQuests: DailyQuest[] | null;
  settings: GameSettings;
}

export async function fetchGameData(): Promise<GameSheetData> {
  const now = Date.now();
  if (
    cache.cards &&
    cache.settings &&
    now - cache.lastFetch < SHEETS_CONFIG.cacheDuration
  ) {
    return {
      cards: cache.cards,
      packs: cache.packs,
      expeditions: cache.expeditions,
      typeSynergies: cache.typeSynergies,
      crossTypeSynergies: cache.crossTypeSynergies,
      dailyQuests: cache.dailyQuests,
      settings: cache.settings,
    };
  }

  if (!isSheetsConfigured()) {
    throw new Error('Sheets not configured. Set VITE_CREATURES_SHEETS_API.');
  }

  try {
    const [
      cardRows,
      packRows,
      expeditionRows,
      typeSynergyRows,
      crossTypeSynergyRows,
      dailyQuestRows,
      settingsRows,
    ] = await Promise.all([
      fetchSheet(SHEETS_CONFIG.sheets.cards),
      fetchSheet(SHEETS_CONFIG.sheets.packs).catch(() => []),
      fetchSheet(SHEETS_CONFIG.sheets.expeditions).catch(() => []),
      fetchSheet(SHEETS_CONFIG.sheets.typeSynergies).catch(() => []),
      fetchSheet(SHEETS_CONFIG.sheets.crossTypeSynergies).catch(() => []),
      fetchSheet(SHEETS_CONFIG.sheets.dailyQuests).catch(() => []),
      fetchSheet(SHEETS_CONFIG.sheets.settings).catch(() => []),
    ]);

    const cards = parseCards(cardRows);
    const packs = packRows.length > 0 ? parsePacks(packRows) : null;
    const expeditions = expeditionRows.length > 0 ? parseExpeditions(expeditionRows) : null;
    const typeSynergies = typeSynergyRows.length > 0 ? parseTypeSynergies(typeSynergyRows) : null;
    const crossTypeSynergies = crossTypeSynergyRows.length > 0 ? parseCrossTypeSynergies(crossTypeSynergyRows) : null;
    const dailyQuests = dailyQuestRows.length > 0 ? parseDailyQuests(dailyQuestRows) : null;
    const settings = parseSettings(settingsRows);

    cache.cards = cards;
    cache.packs = packs;
    cache.expeditions = expeditions;
    cache.typeSynergies = typeSynergies;
    cache.crossTypeSynergies = crossTypeSynergies;
    cache.dailyQuests = dailyQuests;
    cache.settings = settings;
    cache.lastFetch = now;

    console.log(`[Creatures] Loaded from Sheets: ${cards.length} cards, ${packs?.length ?? 0} packs, ${expeditions?.length ?? 0} expeditions`);
    return { cards, packs, expeditions, typeSynergies, crossTypeSynergies, dailyQuests, settings };
  } catch (error) {
    console.error('[Creatures] Failed to fetch from Sheets:', error);
    throw error;
  }
}

export function clearCache(): void {
  cache.cards = null;
  cache.packs = null;
  cache.expeditions = null;
  cache.typeSynergies = null;
  cache.crossTypeSynergies = null;
  cache.dailyQuests = null;
  cache.settings = null;
  cache.lastFetch = 0;
}

export { DEFAULT_SETTINGS };
