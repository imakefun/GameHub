import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import { settings as localSettings } from '../data/settings';
import type {
  CardDefinition,
  CardTier,
  CardType,
  PackDefinition,
  PackAvailability,
  PackGuarantee,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  CLReward,
  FeatureUnlock,
  CryptSlotUnlock,
  DailyQuest,
  LootTableEntry,
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
  clRewards: CLReward[] | null;
  featureUnlocks: FeatureUnlock[] | null;
  typeUnlockCL: Record<CardType, number> | null;
  cryptSlotUnlocks: CryptSlotUnlock[] | null;
  lootTables: LootTableEntry[] | null;
  settings: GameSettings | null;
  lastFetch: number;
}

const DEFAULT_SETTINGS: GameSettings = { ...localSettings };

const cache: SheetsCache = {
  cards: null,
  packs: null,
  expeditions: null,
  typeSynergies: null,
  crossTypeSynergies: null,
  dailyQuests: null,
  clRewards: null,
  featureUnlocks: null,
  typeUnlockCL: null,
  cryptSlotUnlocks: null,
  lootTables: null,
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
      set: row['set'] ? parseInt(row['set']) : undefined,
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

      // Parse guarantees from columns: guarantee1_tier, guarantee1_minTier, guarantee1_types, guarantee1_count, etc.
      const guarantees: PackGuarantee[] = [];
      for (let i = 1; i <= 5; i++) {
        const count = parseInt(row[`guarantee${i}_count`] || '0');
        if (count <= 0) continue;
        const g: PackGuarantee = { count };
        if (row[`guarantee${i}_tier`]) g.tier = row[`guarantee${i}_tier`] as CardTier;
        if (row[`guarantee${i}_minTier`]) g.minTier = row[`guarantee${i}_minTier`] as CardTier;
        if (row[`guarantee${i}_types`]) {
          g.types = row[`guarantee${i}_types`].split(',').map((t) => t.trim()) as CardType[];
        }
        guarantees.push(g);
      }

      const typeBoostRaw = row['typeBoost'] || '';
      const typeBoost = typeBoostRaw
        ? (typeBoostRaw.split(',').map((t) => t.trim()) as CardType[])
        : undefined;

      return {
        id: row['id'] || '',
        name: row['name'] || '',
        description: row['description'] || '',
        cost,
        cardCount: parseInt(row['cardCount'] || '5'),
        tierWeights,
        guaranteed: row['guaranteed'] || undefined,
        guarantees: guarantees.length > 0 ? guarantees : undefined,
        typeBoost,
        requiredCL: row['requiredCL'] ? parseInt(row['requiredCL']) : undefined,
        availability: (row['availability'] || undefined) as PackAvailability | undefined,
        expeditionId: row['expeditionId'] || undefined,
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
          minCardLevel: row['minCardLevel'] ? parseInt(row['minCardLevel']) : undefined,
          requiredTypes,
          requiredTier: row['requiredTier'] ? (row['requiredTier'] as CardTier) : undefined,
          requiredTierCount: row['requiredTierCount'] ? parseInt(row['requiredTierCount']) : undefined,
        },
        duration: parseInt(row['duration'] || row['durationMin'] || '900'),
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

function parseCLRewards(rows: Record<string, string>[]): CLReward[] {
  return rows
    .map((row) => ({
      cl: parseInt(row['cl'] || '0'),
      type: (row['type'] || 'shadowEssence') as CLReward['type'],
      amount: parseInt(row['amount'] || '0'),
      description: row['description'] || '',
      cardId: row['cardId'] || undefined,
    }))
    .filter((r) => r.cl > 0 && (r.amount > 0 || r.type === 'card'));
}

function parseFeatureUnlocks(rows: Record<string, string>[]): FeatureUnlock[] {
  return rows
    .map((row) => ({
      cl: parseInt(row['cl'] || '0'),
      feature: row['feature'] || '',
      description: row['description'] || '',
    }))
    .filter((f) => f.cl > 0 && f.feature);
}

// CLConfig sheet: key/value rows for type unlock CLs, crypt slot unlocks
// Expected rows: category (typeUnlock|cryptSlot), key, value
function parseCLConfig(rows: Record<string, string>[]): {
  typeUnlockCL: Record<CardType, number> | null;
  cryptSlotUnlocks: CryptSlotUnlock[] | null;
} {
  const typeUnlocks: Partial<Record<CardType, number>> = {};
  const slotUnlocks: CryptSlotUnlock[] = [];

  for (const row of rows) {
    const category = (row['category'] || '').trim().toLowerCase();
    const key = (row['key'] || '').trim().toLowerCase();
    const value = parseFloat(row['value'] || '0');
    if (!category || !key || isNaN(value)) continue;

    if (category === 'typeunlock' || category === 'type_unlock') {
      typeUnlocks[key as CardType] = value;
    } else if (category === 'cryptslot' || category === 'crypt_slot') {
      slotUnlocks.push({ cl: value, slot: parseInt(key) });
    }
  }

  const hasTypeUnlocks = Object.keys(typeUnlocks).length > 0;
  const hasCryptSlots = slotUnlocks.length > 0;

  return {
    typeUnlockCL: hasTypeUnlocks ? typeUnlocks as Record<CardType, number> : null,
    cryptSlotUnlocks: hasCryptSlots ? slotUnlocks.sort((a, b) => a.cl - b.cl) : null,
  };
}

function parseLootTables(rows: Record<string, string>[]): LootTableEntry[] {
  return rows
    .map((row) => {
      const slotRaw = (row['slot'] || '').trim().toLowerCase();
      const slot: number | 'fill' = slotRaw === 'fill' ? 'fill' : parseInt(slotRaw || '0');
      const entry: LootTableEntry = {
        packId: row['packId'] || '',
        slot,
        cardPool: row['cardPool'] || 'any',
        weight: parseFloat(row['weight'] || '1'),
      };
      if (row['newOnly'] === 'true' || row['newOnly'] === '1') entry.newOnly = true;
      if (row['rewardType'] && row['rewardType'] !== 'card') {
        entry.rewardType = row['rewardType'] as LootTableEntry['rewardType'];
      }
      if (row['minQty']) entry.minQty = parseFloat(row['minQty']);
      if (row['maxQty']) entry.maxQty = parseFloat(row['maxQty']);
      if (row['step']) entry.step = parseFloat(row['step']);
      return entry;
    })
    .filter((e) => e.packId && (e.slot === 'fill' || (typeof e.slot === 'number' && e.slot > 0)));
}

// ============================================================
// Public API
// ============================================================

export interface SheetLoadEntry {
  name: string;
  count: number;
  source: 'sheets' | 'local';
  error?: string;
}

export interface LoadReport {
  entries: SheetLoadEntry[];
  cached: boolean;
}

export interface GameSheetData {
  cards: CardDefinition[];
  packs: PackDefinition[] | null;
  expeditions: ExpeditionZone[] | null;
  typeSynergies: TypeSynergy[] | null;
  crossTypeSynergies: CrossTypeSynergy[] | null;
  dailyQuests: DailyQuest[] | null;
  clRewards: CLReward[] | null;
  featureUnlocks: FeatureUnlock[] | null;
  typeUnlockCL: Record<CardType, number> | null;
  cryptSlotUnlocks: CryptSlotUnlock[] | null;
  lootTables: LootTableEntry[] | null;
  settings: GameSettings;
  loadReport: LoadReport;
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
      clRewards: cache.clRewards,
      featureUnlocks: cache.featureUnlocks,
      typeUnlockCL: cache.typeUnlockCL,
      cryptSlotUnlocks: cache.cryptSlotUnlocks,
      lootTables: cache.lootTables,
      settings: cache.settings,
      loadReport: { entries: [], cached: true },
    };
  }

  if (!isSheetsConfigured()) {
    throw new Error('Sheets not configured. Set VITE_CREATURES_SHEETS_API.');
  }

  const entries: SheetLoadEntry[] = [];
  const errors: Record<string, string> = {};

  try {
    const [
      cardRows,
      packRows,
      expeditionRows,
      typeSynergyRows,
      crossTypeSynergyRows,
      dailyQuestRows,
      clRewardRows,
      featureUnlockRows,
      clConfigRows,
      settingsRows,
      lootTableRows,
    ] = await Promise.all([
      fetchSheet(SHEETS_CONFIG.sheets.cards),
      fetchSheet(SHEETS_CONFIG.sheets.packs).catch((e: Error) => { errors['Packs'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.expeditions).catch((e: Error) => { errors['Expeditions'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.typeSynergies).catch((e: Error) => { errors['Type Synergies'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.crossTypeSynergies).catch((e: Error) => { errors['Cross-Type Synergies'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.dailyQuests).catch((e: Error) => { errors['Daily Quests'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.clRewards).catch((e: Error) => { errors['CL Rewards'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.featureUnlocks).catch((e: Error) => { errors['Feature Unlocks'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.clConfig).catch((e: Error) => { errors['CL Config'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.settings).catch((e: Error) => { errors['Settings'] = e.message; return []; }),
      fetchSheet(SHEETS_CONFIG.sheets.lootTables).catch((e: Error) => { errors['Loot Tables'] = e.message; return []; }),
    ]);

    const cards = parseCards(cardRows);
    const packs = packRows.length > 0 ? parsePacks(packRows) : null;
    const expeditions = expeditionRows.length > 0 ? parseExpeditions(expeditionRows) : null;
    const typeSynergies = typeSynergyRows.length > 0 ? parseTypeSynergies(typeSynergyRows) : null;
    const crossTypeSynergies = crossTypeSynergyRows.length > 0 ? parseCrossTypeSynergies(crossTypeSynergyRows) : null;
    const dailyQuests = dailyQuestRows.length > 0 ? parseDailyQuests(dailyQuestRows) : null;
    const clRewards = clRewardRows.length > 0 ? parseCLRewards(clRewardRows) : null;
    const featureUnlocks = featureUnlockRows.length > 0 ? parseFeatureUnlocks(featureUnlockRows) : null;
    const clConfig = clConfigRows.length > 0 ? parseCLConfig(clConfigRows) : { typeUnlockCL: null, cryptSlotUnlocks: null };
    const lootTables = lootTableRows.length > 0 ? parseLootTables(lootTableRows) : null;
    const settings = parseSettings(settingsRows);

    // Build load report
    const track = (name: string, parsed: unknown[] | null, rawRows: unknown[]) => {
      if (errors[name]) {
        entries.push({ name, count: 0, source: 'local', error: errors[name] });
      } else if (parsed && parsed.length > 0) {
        entries.push({ name, count: parsed.length, source: 'sheets' });
      } else if (rawRows.length === 0) {
        entries.push({ name, count: 0, source: 'local' });
      } else {
        entries.push({ name, count: 0, source: 'local', error: `${rawRows.length} rows fetched but 0 parsed` });
      }
    };

    track('Cards', cards.length > 0 ? cards : null, cardRows);
    track('Packs', packs, packRows);
    track('Expeditions', expeditions, expeditionRows);
    track('Type Synergies', typeSynergies, typeSynergyRows);
    track('Cross-Type Synergies', crossTypeSynergies, crossTypeSynergyRows);
    track('Daily Quests', dailyQuests, dailyQuestRows);
    track('CL Rewards', clRewards, clRewardRows);
    track('Feature Unlocks', featureUnlocks, featureUnlockRows);
    track('CL Config', clConfig.typeUnlockCL ? Object.keys(clConfig.typeUnlockCL) : null, clConfigRows);
    track('Loot Tables', lootTables, lootTableRows);

    cache.cards = cards;
    cache.packs = packs;
    cache.expeditions = expeditions;
    cache.typeSynergies = typeSynergies;
    cache.crossTypeSynergies = crossTypeSynergies;
    cache.dailyQuests = dailyQuests;
    cache.clRewards = clRewards;
    cache.featureUnlocks = featureUnlocks;
    cache.typeUnlockCL = clConfig.typeUnlockCL;
    cache.cryptSlotUnlocks = clConfig.cryptSlotUnlocks;
    cache.lootTables = lootTables;
    cache.settings = settings;
    cache.lastFetch = now;

    const report: LoadReport = { entries, cached: false };
    const sheetsCount = entries.filter(e => e.source === 'sheets').length;
    const errorCount = entries.filter(e => e.error).length;
    console.log(`[Creatures] Sheets load: ${sheetsCount}/${entries.length} from sheets, ${errorCount} errors`);
    for (const e of entries) {
      if (e.error) console.warn(`  [${e.name}] ${e.error}`);
      else if (e.source === 'sheets') console.log(`  [${e.name}] ${e.count} items from sheets`);
      else console.log(`  [${e.name}] using local fallback`);
    }

    return {
      cards, packs, expeditions, typeSynergies, crossTypeSynergies, dailyQuests,
      clRewards, featureUnlocks,
      typeUnlockCL: clConfig.typeUnlockCL,
      cryptSlotUnlocks: clConfig.cryptSlotUnlocks,
      lootTables,
      settings,
      loadReport: report,
    };
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
  cache.clRewards = null;
  cache.featureUnlocks = null;
  cache.typeUnlockCL = null;
  cache.cryptSlotUnlocks = null;
  cache.lootTables = null;
  cache.settings = null;
  cache.lastFetch = 0;
}

