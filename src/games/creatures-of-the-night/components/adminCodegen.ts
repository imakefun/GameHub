// ============================================================
// Code generation: SheetDB rows → local TypeScript data files
// ============================================================

type Row = Record<string, string>;

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

/** Convert any JS value to a TypeScript literal string. */
function toTS(value: unknown, indent = 0, forceInline = false): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${esc(value)}'`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Primitives / tuples → always inline
    if (value.every(v => typeof v !== 'object' || v === null)) {
      return `[${value.map(v => toTS(v, 0, true)).join(', ')}]`;
    }
    if (forceInline) {
      return `[${value.map(v => toTS(v, 0, true)).join(', ')}]`;
    }
    const items = value.map(v => `${inner}${toTS(v, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const inlineParts = entries.map(([k, v]) => `${k}: ${toTS(v, 0, true)}`);
    const inlineStr = `{ ${inlineParts.join(', ')} }`;
    if (forceInline || inlineStr.length < 100) return inlineStr;
    const lines = entries.map(([k, v]) => `${inner}${k}: ${toTS(v, indent + 1)}`);
    return `{\n${lines.join(',\n')},\n${pad}}`;
  }

  return String(value);
}

// ============================================================
// De-flatten helpers (sheet row → typed object for serialization)
// ============================================================

function num(s: string | undefined, fallback = 0): number {
  const n = parseFloat(s || '');
  return isNaN(n) ? fallback : n;
}

function int(s: string | undefined, fallback = 0): number {
  const n = parseInt(s || '', 10);
  return isNaN(n) ? fallback : n;
}

function deflateCard(r: Row, includeSet: boolean) {
  const card: Record<string, unknown> = {
    id: r.id,
    name: r.name,
    type: r.type,
    tier: r.tier,
  };
  if (includeSet) card.set = 1;
  card.baseGenerationAmount = num(r.baseGenerationAmount, 1);
  card.baseInterval = int(r.baseInterval, 30);
  card.description = r.description || '';
  card.flavorText = r.flavorText || '';
  return card;
}

function deflatePack(r: Row) {
  const pack: Record<string, unknown> = {
    id: r.id,
    name: r.name,
    description: r.description || '',
  };

  if (r.costCurrency) {
    pack.cost = { currency: r.costCurrency, amount: num(r.costAmount) };
  } else {
    pack.cost = null;
  }

  pack.cardCount = int(r.cardCount, 5);

  const tw: Record<string, number> = {};
  for (const tier of ['twilight', 'dusk', 'midnight', 'umbral', 'eternal']) {
    const w = num(r[`tierWeight_${tier}`]);
    if (w > 0) tw[tier] = w;
  }
  pack.tierWeights = tw;

  if (r.guaranteed) pack.guaranteed = r.guaranteed;

  const guarantees: Record<string, unknown>[] = [];
  for (let i = 1; i <= 5; i++) {
    const count = int(r[`guarantee${i}_count`]);
    if (count <= 0) continue;
    const g: Record<string, unknown> = { count };
    if (r[`guarantee${i}_tier`]) g.tier = r[`guarantee${i}_tier`];
    if (r[`guarantee${i}_minTier`]) g.minTier = r[`guarantee${i}_minTier`];
    if (r[`guarantee${i}_types`]) g.types = r[`guarantee${i}_types`].split(',').map(t => t.trim());
    guarantees.push(g);
  }
  if (guarantees.length > 0) pack.guarantees = guarantees;

  if (r.typeBoost) pack.typeBoost = r.typeBoost.split(',').map(t => t.trim());
  if (r.isOneTime === 'true' || r.isOneTime === '1') pack.isOneTime = true;
  if (r.isPremium === 'true' || r.isPremium === '1') pack.isPremium = true;
  if (r.availability) pack.availability = r.availability;
  if (r.expeditionId) pack.expeditionId = r.expeditionId;
  if (r.requiredCL) pack.requiredCL = int(r.requiredCL);

  return pack;
}

function deflateExpedition(r: Row) {
  const reqs: Record<string, unknown> = { minCards: int(r.minCards, 1) };
  if (r.minCardLevel) reqs.minCardLevel = int(r.minCardLevel);
  if (r.requiredTypes) reqs.requiredTypes = r.requiredTypes.split(',').map(t => t.trim());
  if (r.requiredTier) reqs.requiredTier = r.requiredTier;
  if (r.requiredTierCount) reqs.requiredTierCount = int(r.requiredTierCount);

  const rewards: Record<string, unknown> = {};
  if (r.rewardSEMin) rewards.shadowEssence = [int(r.rewardSEMin), int(r.rewardSEMax || r.rewardSEMin)];
  if (r.rewardSSMin) rewards.soulShards = [int(r.rewardSSMin), int(r.rewardSSMax || r.rewardSSMin)];
  if (r.rewardLCMin) rewards.lunarCrystals = [int(r.rewardLCMin), int(r.rewardLCMax || r.rewardLCMin)];
  if (r.rewardVEMin) rewards.voidEnergy = [int(r.rewardVEMin), int(r.rewardVEMax || r.rewardVEMin)];

  return {
    id: r.id,
    name: r.name,
    description: r.description || '',
    unlockCL: int(r.unlockCL, 1),
    requirements: reqs,
    duration: int(r.duration, 900),
    rewards,
    riskPercent: int(r.riskPercent),
    riskEffect: r.riskEffect || 'fatigue',
    riskDuration: int(r.riskDuration, 1800),
  };
}

function deflateTypeSynergy(r: Row) {
  const thresholds: { count: number; bonus: number }[] = [];
  for (let i = 1; i <= 5; i++) {
    const count = int(r[`threshold${i}_count`]);
    const bonus = int(r[`threshold${i}_bonus`]);
    if (count > 0) thresholds.push({ count, bonus });
  }
  const syn: Record<string, unknown> = { type: r.type, thresholds };
  if (r.fullSetAbility) syn.fullSetAbility = r.fullSetAbility;
  return syn;
}

function deflateCrossTypeSynergy(r: Row) {
  return {
    id: r.id,
    name: r.name,
    type1: r.type1,
    type2: r.type2,
    primaryEffect: r.primaryEffect || '',
    bonusEffect: r.bonusEffect || '',
    productionBonus: num(r.productionBonus),
  };
}

function deflateDailyQuest(r: Row) {
  const rewards: Record<string, number> = {};
  if (r.rewardSE) rewards.shadowEssence = int(r.rewardSE);
  if (r.rewardSS) rewards.soulShards = int(r.rewardSS);
  if (r.rewardLC) rewards.lunarCrystals = int(r.rewardLC);
  return {
    id: r.id,
    description: r.description || '',
    target: int(r.target, 1),
    difficulty: r.difficulty || 'easy',
    rewards,
  };
}

function deflateCLReward(r: Row) {
  const reward: Record<string, unknown> = {
    cl: int(r.cl),
    type: r.type || 'shadowEssence',
    amount: int(r.amount),
    description: r.description || '',
  };
  if (r.cardId) reward.cardId = r.cardId;
  return reward;
}

function deflateFeatureUnlock(r: Row) {
  return {
    cl: int(r.cl),
    feature: r.feature || '',
    description: r.description || '',
  };
}

// ============================================================
// File generators
// ============================================================

export function generateCardsFile(rows: Row[]): string {
  const set1 = rows.filter(r => r.set === '1');
  const legacy = rows.filter(r => r.set !== '1');

  let s = "import type { CardDefinition } from '../types';\n\n";
  s += "// ============================================================\n";
  s += "// Set 1 — Starter & CL Road Phase 1 Cards (CL 1-32)\n";
  s += "// ============================================================\n";
  s += "export const set1Cards: CardDefinition[] = [\n";
  for (const r of set1) s += `  ${toTS(deflateCard(r, true), 1, true)},\n`;
  s += "];\n\n";

  s += "// ============================================================\n";
  s += "// Legacy Cards\n";
  s += "// ============================================================\n";
  s += "const legacyCards: CardDefinition[] = [\n";
  for (const r of legacy) s += `  ${toTS(deflateCard(r, false), 1, true)},\n`;
  s += "];\n\n";

  s += "export const cards: CardDefinition[] = [...set1Cards, ...legacyCards];\n\n";
  s += "export function getCardById(id: string): CardDefinition | undefined {\n";
  s += "  return cards.find(c => c.id === id);\n}\n\n";
  s += "export function getCardsByType(type: string): CardDefinition[] {\n";
  s += "  return cards.filter(c => c.type === type);\n}\n\n";
  s += "export function getCardsByTier(tier: string): CardDefinition[] {\n";
  s += "  return cards.filter(c => c.tier === tier);\n}\n";

  return s;
}

export function generatePacksFile(rows: Row[]): string {
  const packs = rows.filter(r => r.id).map(deflatePack);
  let s = "import type { PackDefinition } from '../types';\n\n";
  s += "export const packs: PackDefinition[] = [\n";
  for (const p of packs) s += `  ${toTS(p, 1)},\n`;
  s += "];\n";
  return s;
}

export function generateExpeditionsFile(rows: Row[]): string {
  const exps = rows.filter(r => r.id).map(deflateExpedition);
  let s = "import type { ExpeditionZone } from '../types';\n\n";
  s += "export const expeditions: ExpeditionZone[] = [\n";
  for (const e of exps) s += `  ${toTS(e, 1)},\n`;
  s += "];\n";
  return s;
}

export function generateSynergiesFile(
  typeSynRows: Row[],
  crossRows: Row[],
  featureRows: Row[],
  clRewardRows: Row[],
  questRows: Row[],
): string {
  const typeSyns = typeSynRows.filter(r => r.type).map(deflateTypeSynergy);
  const crossSyns = crossRows.filter(r => r.id).map(deflateCrossTypeSynergy);
  const features = featureRows.filter(r => r.feature).map(deflateFeatureUnlock);
  const clRewards = clRewardRows
    .filter(r => int(r.cl) > 0 && (int(r.amount) > 0 || r.type === 'card'))
    .map(deflateCLReward)
    .sort((a, b) => (a.cl as number) - (b.cl as number));
  const quests = questRows.filter(r => r.id).map(deflateDailyQuest);

  let s = "import type { TypeSynergy, CrossTypeSynergy, FeatureUnlock, CLReward, DailyQuest } from '../types';\n\n";

  s += "// ============================================================\n";
  s += "// Type Synergies (same-type bonuses)\n";
  s += "// ============================================================\n";
  s += "export const typeSynergies: TypeSynergy[] = [\n";
  for (const ts of typeSyns) s += `  ${toTS(ts, 1, true)},\n`;
  s += "];\n\n";

  s += "// ============================================================\n";
  s += "// Cross-Type Synergies (dual-type combos)\n";
  s += "// ============================================================\n";
  s += "export const crossTypeSynergies: CrossTypeSynergy[] = [\n";
  for (const cs of crossSyns) s += `  ${toTS(cs, 1)},\n`;
  s += "];\n\n";

  s += "// ============================================================\n";
  s += "// Feature Unlocks\n";
  s += "// ============================================================\n";
  s += "export const featureUnlocks: FeatureUnlock[] = [\n";
  for (const f of features) s += `  ${toTS(f, 1, true)},\n`;
  s += "];\n\n";

  s += "// ============================================================\n";
  s += "// CL Rewards\n";
  s += "// ============================================================\n";
  s += "export const clRewards: CLReward[] = [\n";
  for (const r of clRewards) s += `  ${toTS(r, 1, true)},\n`;
  s += "];\n\n";

  s += "// ============================================================\n";
  s += "// Daily Quest Pool\n";
  s += "// ============================================================\n";
  s += "export const dailyQuestPool: DailyQuest[] = [\n";
  for (const q of quests) s += `  ${toTS(q, 1)},\n`;
  s += "];\n";

  return s;
}

export function generateSettingsFile(rows: Row[]): string {
  const obj: Record<string, number> = {};
  for (const r of rows) {
    if (!r.key) continue;
    const v = parseFloat(r.value || '0');
    if (!isNaN(v)) obj[r.key] = v;
  }

  let s = "import type { GameSettings } from '../types';\n\n";
  s += `export const settings: GameSettings = ${toTS(obj, 0)};\n`;
  return s;
}

export function generateCLConfigFile(clConfigRows: Row[], clRewardRows: Row[]): string {
  // Type unlock CL
  const types: [string, number][] = [];
  const slots: { cl: number; slot: number }[] = [];

  for (const r of clConfigRows) {
    const cat = (r.category || '').trim().toLowerCase();
    const key = (r.key || '').trim();
    const value = num(r.value);
    if (!cat || !key) continue;
    if (cat === 'typeunlock' || cat === 'type_unlock') {
      types.push([key, value]);
    } else if (cat === 'cryptslot' || cat === 'crypt_slot') {
      slots.push({ cl: value, slot: int(r.key) });
    }
  }
  slots.sort((a, b) => a.cl - b.cl);

  // CL Road Phase 1: extract from CLRewards where type === 'card'
  const cardRewards = clRewardRows
    .filter(r => r.type === 'card' && r.cardId)
    .map(r => ({ cl: int(r.cl), cardId: r.cardId, cardName: r.description || r.cardId }))
    .sort((a, b) => a.cl - b.cl);

  let s = "import type { CardType, CryptSlotUnlock } from '../types';\n\n";

  // typeUnlockCL
  s += "// CL threshold at which each card type appears in packs\n";
  s += "export const typeUnlockCL: Record<CardType, number> = {\n";
  for (const [type, cl] of types) s += `  ${type}: ${cl},\n`;
  s += "};\n\n";

  // cryptSlotUnlocks
  s += "// CL thresholds that unlock additional crypt slots (start with 3)\n";
  s += "export const cryptSlotUnlocks: CryptSlotUnlock[] = [\n";
  for (const sl of slots) s += `  { cl: ${sl.cl}, slot: ${sl.slot} },\n`;
  s += "];\n\n";

  // clRoadPhase1
  s += "// ============================================================\n";
  s += "// CL Road Phase 1: Starter (CL 1-32)\n";
  s += "// ============================================================\n";
  s += "export interface CLRoadEntry {\n  cl: number;\n  cardId: string;\n  cardName: string;\n}\n\n";
  s += "export const clRoadPhase1: CLRoadEntry[] = [\n";
  for (const cr of cardRewards) {
    s += `  { cl: ${cr.cl}, cardId: '${esc(cr.cardId)}', cardName: '${esc(cr.cardName)}' },\n`;
  }
  s += "];\n";

  return s;
}

// ============================================================
// Loot Tables
// ============================================================

function deflateLootTableEntry(r: Row) {
  const entry: Record<string, unknown> = {
    packId: r.packId,
    slot: (r.slot || '').toLowerCase() === 'fill' ? 'fill' : int(r.slot, 1),
    cardPool: r.cardPool || 'any',
    weight: num(r.weight, 1),
  };
  if (r.newOnly === 'true' || r.newOnly === '1') entry.newOnly = true;
  return entry;
}

export function generateLootTablesFile(rows: Row[]): string {
  const entries = rows.filter(r => r.packId).map(deflateLootTableEntry);
  let s = "import type { LootTableEntry } from '../types';\n\n";
  s += "export const lootTables: LootTableEntry[] = [\n";
  for (const e of entries) s += `  ${toTS(e, 1, true)},\n`;
  s += "];\n";
  return s;
}

/** Trigger a browser file download. */
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
