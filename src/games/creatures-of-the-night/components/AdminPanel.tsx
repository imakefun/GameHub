import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, Loader2, AlertTriangle, FileDown } from 'lucide-react';

import { SHEETS_CONFIG } from '../config/sheets';
import { cards as localCards } from '../data/cards';
import { packs as localPacks } from '../data/packs';
import { expeditions as localExpeditions } from '../data/expeditions';
import {
  typeSynergies as localTypeSynergies,
  crossTypeSynergies as localCrossSynergies,
  featureUnlocks as localFeatureUnlocks,
  clRewards as localCLRewards,
  dailyQuestPool as localDailyQuestPool,
} from '../data/synergies';
import {
  typeUnlockCL as localTypeUnlockCL,
  cryptSlotUnlocks as localCryptSlotUnlocks,
} from '../data/clConfig';
import { lootTables as localLootTables } from '../data/lootTables';
import { settings as localSettings } from '../data/settings';

import {
  generateCardsFile,
  generatePacksFile,
  generateExpeditionsFile,
  generateSynergiesFile,
  generateSettingsFile,
  generateCLConfigFile,
  generateLootTablesFile,
  downloadFile,
} from './adminCodegen';

import type {
  CardDefinition,
  PackDefinition,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  CLReward,
  FeatureUnlock,
  DailyQuest,
  LootTableEntry,
  CardType,
  CryptSlotUnlock,
  GameSettings,
} from '../types';

// ============================================================
// Flattening helpers (local data → flat sheet rows for push)
// ============================================================

function flattenCard(c: CardDefinition): Record<string, string> {
  return {
    id: c.id, name: c.name, type: c.type, tier: c.tier,
    set: c.set ? String(c.set) : '',
    baseGenerationAmount: String(c.baseGenerationAmount),
    baseInterval: String(c.baseInterval),
    description: c.description, flavorText: c.flavorText,
    artUrl: c.artUrl || '',
  };
}

function flattenPack(p: PackDefinition): Record<string, string> {
  const row: Record<string, string> = {
    id: p.id, name: p.name, description: p.description,
    costCurrency: p.cost?.currency || '',
    costAmount: p.cost ? String(p.cost.amount) : '',
    cardCount: String(p.cardCount),
    tierWeight_twilight: String(p.tierWeights?.twilight || ''),
    tierWeight_dusk: String(p.tierWeights?.dusk || ''),
    tierWeight_midnight: String(p.tierWeights?.midnight || ''),
    tierWeight_umbral: String(p.tierWeights?.umbral || ''),
    tierWeight_eternal: String(p.tierWeights?.eternal || ''),
    guaranteed: p.guaranteed || '',
    typeBoost: p.typeBoost ? p.typeBoost.join(',') : '',
    requiredCL: p.requiredCL ? String(p.requiredCL) : '',
    availability: p.availability || '',
    expeditionId: p.expeditionId || '',
    isOneTime: p.isOneTime ? 'true' : '',
    isPremium: p.isPremium ? 'true' : '',
  };
  if (p.guarantees) {
    p.guarantees.forEach((g, i) => {
      const idx = i + 1;
      row[`guarantee${idx}_count`] = String(g.count);
      if (g.tier) row[`guarantee${idx}_tier`] = g.tier;
      if (g.minTier) row[`guarantee${idx}_minTier`] = g.minTier;
      if (g.types) row[`guarantee${idx}_types`] = g.types.join(',');
    });
  }
  return row;
}

function flattenExpedition(e: ExpeditionZone): Record<string, string> {
  return {
    id: e.id, name: e.name, description: e.description,
    unlockCL: String(e.unlockCL),
    minCards: String(e.requirements.minCards),
    minCardLevel: e.requirements.minCardLevel ? String(e.requirements.minCardLevel) : '',
    requiredTypes: e.requirements.requiredTypes ? e.requirements.requiredTypes.join(',') : '',
    requiredTier: e.requirements.requiredTier || '',
    requiredTierCount: e.requirements.requiredTierCount ? String(e.requirements.requiredTierCount) : '',
    duration: String(e.duration),
    rewardSEMin: e.rewards.shadowEssence ? String(e.rewards.shadowEssence[0]) : '',
    rewardSEMax: e.rewards.shadowEssence ? String(e.rewards.shadowEssence[1]) : '',
    rewardSSMin: e.rewards.soulShards ? String(e.rewards.soulShards[0]) : '',
    rewardSSMax: e.rewards.soulShards ? String(e.rewards.soulShards[1]) : '',
    rewardLCMin: e.rewards.lunarCrystals ? String(e.rewards.lunarCrystals[0]) : '',
    rewardLCMax: e.rewards.lunarCrystals ? String(e.rewards.lunarCrystals[1]) : '',
    rewardVEMin: e.rewards.voidEnergy ? String(e.rewards.voidEnergy[0]) : '',
    rewardVEMax: e.rewards.voidEnergy ? String(e.rewards.voidEnergy[1]) : '',
    riskPercent: String(e.riskPercent), riskEffect: e.riskEffect,
    riskDuration: String(e.riskDuration),
  };
}

function flattenTypeSynergy(s: TypeSynergy): Record<string, string> {
  const row: Record<string, string> = { type: s.type, fullSetAbility: s.fullSetAbility || '' };
  s.thresholds.forEach((t, i) => {
    row[`threshold${i + 1}_count`] = String(t.count);
    row[`threshold${i + 1}_bonus`] = String(t.bonus);
  });
  return row;
}

function flattenCrossTypeSynergy(s: CrossTypeSynergy): Record<string, string> {
  return { id: s.id, name: s.name, type1: s.type1, type2: s.type2, primaryEffect: s.primaryEffect, bonusEffect: s.bonusEffect, productionBonus: String(s.productionBonus) };
}

function flattenCLReward(r: CLReward): Record<string, string> {
  return { cl: String(r.cl), type: r.type, amount: String(r.amount), description: r.description, cardId: r.cardId || '' };
}

function flattenFeatureUnlock(f: FeatureUnlock): Record<string, string> {
  return { cl: String(f.cl), feature: f.feature, description: f.description };
}

function flattenDailyQuest(q: DailyQuest): Record<string, string> {
  return { id: q.id, description: q.description, target: String(q.target), difficulty: q.difficulty, rewardSE: q.rewards.shadowEssence ? String(q.rewards.shadowEssence) : '', rewardSS: q.rewards.soulShards ? String(q.rewards.soulShards) : '', rewardLC: q.rewards.lunarCrystals ? String(q.rewards.lunarCrystals) : '' };
}

function flattenCLConfig(typeUnlockCL: Record<CardType, number>, cryptSlotUnlocks: CryptSlotUnlock[]): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (const [type, cl] of Object.entries(typeUnlockCL)) rows.push({ category: 'typeunlock', key: type, value: String(cl) });
  for (const s of cryptSlotUnlocks) rows.push({ category: 'cryptslot', key: String(s.slot), value: String(s.cl) });
  return rows;
}

function flattenLootTableEntry(e: LootTableEntry): Record<string, string> {
  return {
    packId: e.packId,
    slot: String(e.slot),
    cardPool: e.cardPool,
    weight: String(e.weight),
    newOnly: e.newOnly ? 'true' : '',
  };
}

function flattenSettings(settings: GameSettings): Record<string, string>[] {
  return Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
}

// ============================================================
// Push sheet definitions
// ============================================================

interface SheetDef {
  name: string;
  sheetTab: string;
  getRows: () => Record<string, string>[];
}

const SHEET_DEFS: SheetDef[] = [
  { name: 'Cards', sheetTab: 'Cards', getRows: () => localCards.map(flattenCard) },
  { name: 'Packs', sheetTab: 'Packs', getRows: () => localPacks.map(flattenPack) },
  { name: 'Expeditions', sheetTab: 'Expeditions', getRows: () => localExpeditions.map(flattenExpedition) },
  { name: 'Type Synergies', sheetTab: 'TypeSynergies', getRows: () => localTypeSynergies.map(flattenTypeSynergy) },
  { name: 'Cross-Type Synergies', sheetTab: 'CrossTypeSynergies', getRows: () => localCrossSynergies.map(flattenCrossTypeSynergy) },
  { name: 'Daily Quests', sheetTab: 'DailyQuests', getRows: () => localDailyQuestPool.map(flattenDailyQuest) },
  { name: 'CL Rewards', sheetTab: 'CLRewards', getRows: () => localCLRewards.map(flattenCLReward) },
  { name: 'Feature Unlocks', sheetTab: 'FeatureUnlocks', getRows: () => localFeatureUnlocks.map(flattenFeatureUnlock) },
  { name: 'CL Config', sheetTab: 'CLConfig', getRows: () => flattenCLConfig(localTypeUnlockCL, localCryptSlotUnlocks) },
  { name: 'Loot Tables', sheetTab: 'LootTables', getRows: () => localLootTables.map(flattenLootTableEntry) },
  { name: 'Settings', sheetTab: 'Settings', getRows: () => flattenSettings(localSettings) },
];

// ============================================================
// Pull: file output definitions
// ============================================================

const SHEET_TABS = ['Cards', 'Packs', 'Expeditions', 'TypeSynergies', 'CrossTypeSynergies', 'DailyQuests', 'CLRewards', 'FeatureUnlocks', 'CLConfig', 'LootTables', 'Settings'] as const;

interface FileDef {
  name: string;
  filename: string;
  /** Which sheet tabs this file depends on */
  sheets: (typeof SHEET_TABS[number])[];
  generate: (data: Record<string, Record<string, string>[]>) => string;
}

const FILE_DEFS: FileDef[] = [
  {
    name: 'Cards',
    filename: 'cards.ts',
    sheets: ['Cards'],
    generate: (d) => generateCardsFile(d.Cards),
  },
  {
    name: 'Packs',
    filename: 'packs.ts',
    sheets: ['Packs'],
    generate: (d) => generatePacksFile(d.Packs),
  },
  {
    name: 'Expeditions',
    filename: 'expeditions.ts',
    sheets: ['Expeditions'],
    generate: (d) => generateExpeditionsFile(d.Expeditions),
  },
  {
    name: 'Synergies + Rewards',
    filename: 'synergies.ts',
    sheets: ['TypeSynergies', 'CrossTypeSynergies', 'FeatureUnlocks', 'CLRewards', 'DailyQuests'],
    generate: (d) => generateSynergiesFile(d.TypeSynergies, d.CrossTypeSynergies, d.FeatureUnlocks, d.CLRewards, d.DailyQuests),
  },
  {
    name: 'Settings',
    filename: 'settings.ts',
    sheets: ['Settings'],
    generate: (d) => generateSettingsFile(d.Settings),
  },
  {
    name: 'CL Config',
    filename: 'clConfig.ts',
    sheets: ['CLConfig', 'CLRewards'],
    generate: (d) => generateCLConfigFile(d.CLConfig, d.CLRewards),
  },
  {
    name: 'Loot Tables',
    filename: 'lootTables.ts',
    sheets: ['LootTables'],
    generate: (d) => generateLootTablesFile(d.LootTables),
  },
];

// ============================================================
// Component
// ============================================================

type OpStatus = 'idle' | 'working' | 'success' | 'error';

interface ItemState {
  status: OpStatus;
  message?: string;
}

export function AdminPanel() {
  const [apiUrl, setApiUrl] = useState(SHEETS_CONFIG.apiUrl);

  // Push state
  const [pushStates, setPushStates] = useState<Record<string, ItemState>>(
    () => Object.fromEntries(SHEET_DEFS.map((d) => [d.sheetTab, { status: 'idle' as OpStatus }])),
  );
  const [pushingAll, setPushingAll] = useState(false);

  // Pull state
  const [pulling, setPulling] = useState(false);
  const [pullStates, setPullStates] = useState<Record<string, ItemState>>(
    () => Object.fromEntries(SHEET_TABS.map((t) => [t, { status: 'idle' as OpStatus }])),
  );
  const pulledData = useRef<Record<string, Record<string, string>[]>>({});
  const [pullComplete, setPullComplete] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  // ---- Shared helpers ----

  const statusIcon = (status: OpStatus) => {
    switch (status) {
      case 'working': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 rounded-full border border-surface-600" />;
    }
  };

  // ---- Push logic ----

  const updatePushState = useCallback((tab: string, state: ItemState) => {
    setPushStates((prev) => ({ ...prev, [tab]: state }));
  }, []);

  const pushSheet = useCallback(async (sheetTab: string, rows: Record<string, string>[]) => {
    if (!apiUrl) { updatePushState(sheetTab, { status: 'error', message: 'No API URL' }); return false; }
    updatePushState(sheetTab, { status: 'working', message: 'Clearing existing rows...' });
    const base = apiUrl.replace(/\/$/, '');
    try {
      // Step 1: Delete all existing rows (keeps header row intact)
      const delRes = await fetch(`${base}/all?sheet=${encodeURIComponent(sheetTab)}`, { method: 'DELETE' });
      if (!delRes.ok) { const text = await delRes.text(); updatePushState(sheetTab, { status: 'error', message: `Delete failed ${delRes.status}: ${text.slice(0, 200)}` }); return false; }

      // Step 2: Post new rows
      updatePushState(sheetTab, { status: 'working', message: `Pushing ${rows.length} rows...` });
      const postRes = await fetch(`${base}?sheet=${encodeURIComponent(sheetTab)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: rows }) });
      if (!postRes.ok) { const text = await postRes.text(); updatePushState(sheetTab, { status: 'error', message: `Post failed ${postRes.status}: ${text.slice(0, 200)}` }); return false; }
      updatePushState(sheetTab, { status: 'success', message: `${rows.length} rows synced` });
      return true;
    } catch (err) { updatePushState(sheetTab, { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' }); return false; }
  }, [apiUrl, updatePushState]);

  const pushSingle = useCallback(async (def: SheetDef) => { await pushSheet(def.sheetTab, def.getRows()); }, [pushSheet]);

  const pushAll = useCallback(async () => {
    setPushingAll(true);
    for (const def of SHEET_DEFS) { if (!(await pushSheet(def.sheetTab, def.getRows()))) break; }
    setPushingAll(false);
  }, [pushSheet]);

  // ---- Pull logic ----

  const updatePullState = useCallback((tab: string, state: ItemState) => {
    setPullStates((prev) => ({ ...prev, [tab]: state }));
  }, []);

  const fetchSheetTab = useCallback(async (sheetName: string): Promise<Record<string, string>[] | null> => {
    if (!apiUrl) { updatePullState(sheetName, { status: 'error', message: 'No API URL' }); return null; }
    updatePullState(sheetName, { status: 'working' });
    try {
      const url = `${apiUrl.replace(/\/$/, '')}?sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      if (!res.ok) { updatePullState(sheetName, { status: 'error', message: `${res.status}: ${res.statusText}` }); return null; }
      const rows = await res.json();
      updatePullState(sheetName, { status: 'success', message: `${rows.length} rows` });
      return rows;
    } catch (err) { updatePullState(sheetName, { status: 'error', message: err instanceof Error ? err.message : 'Network error' }); return null; }
  }, [apiUrl, updatePullState]);

  const pullAll = useCallback(async () => {
    setPulling(true);
    setPullComplete(false);
    setFileContents({});
    pulledData.current = {};

    let ok = true;
    for (const tab of SHEET_TABS) {
      const rows = await fetchSheetTab(tab);
      if (!rows) { ok = false; break; }
      pulledData.current[tab] = rows;
    }

    if (ok) {
      // Generate all files
      const files: Record<string, string> = {};
      for (const def of FILE_DEFS) {
        try {
          files[def.filename] = def.generate(pulledData.current);
        } catch (err) {
          files[def.filename] = `// ERROR generating ${def.filename}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        }
      }
      setFileContents(files);
      setPullComplete(true);
    }

    setPulling(false);
  }, [fetchSheetTab]);

  const downloadSingle = useCallback((filename: string) => {
    const content = fileContents[filename];
    if (content) downloadFile(filename, content);
  }, [fileContents]);

  const downloadAll = useCallback(() => {
    for (const def of FILE_DEFS) {
      const content = fileContents[def.filename];
      if (content) downloadFile(def.filename, content);
    }
  }, [fileContents]);

  // ---- Render ----

  return (
    <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(180deg, #0a0015 0%, #1a0533 100%)' }}>
      {/* Header */}
      <header className="border-b border-purple-500/20 sticky top-0 z-50" style={{ background: 'rgba(10, 0, 21, 0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/play/creatures-of-the-night" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Admin: SheetDB Data Manager
            </h1>
            <p className="text-xs text-surface-500">Push local data to sheets or pull sheet data to local files</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* API URL */}
        <div className="rounded-xl border border-purple-500/20 p-4" style={{ background: 'rgba(30, 10, 60, 0.5)' }}>
          <label className="block text-sm font-medium text-surface-300 mb-2">SheetDB API URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://sheetdb.io/api/v1/YOUR_API_ID"
            className="w-full px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-600 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-purple-500"
          />
          {!apiUrl && (
            <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>No API URL set. Paste your SheetDB endpoint above, or set VITE_CREATURES_SHEETS_API in your environment.</span>
            </div>
          )}
          {apiUrl && SHEETS_CONFIG.apiUrl && (
            <p className="text-xs text-green-400/70 mt-1">Using configured environment URL</p>
          )}
        </div>

        {/* ============================================================ */}
        {/* PULL SECTION */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            Import from SheetDB
          </h2>
          <p className="text-xs text-surface-500 mb-4">
            Fetch the latest data from your spreadsheet and download updated local data files.
            Drop the downloaded files into <code className="text-surface-400">src/games/creatures-of-the-night/data/</code> to update the fallback data.
          </p>

          <button
            onClick={pullAll}
            disabled={pulling || !apiUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white mb-3"
          >
            {pulling ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Fetching all sheets...</>
            ) : (
              <><Download className="w-4 h-4" /> Pull All from SheetDB</>
            )}
          </button>

          {/* Fetch status per sheet tab */}
          <div className="space-y-1.5 mb-4">
            {SHEET_TABS.map((tab) => {
              const state = pullStates[tab];
              return (
                <div key={tab} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(30, 10, 60, 0.2)' }}>
                  {statusIcon(state.status)}
                  <span className="text-xs text-surface-300 flex-1">{tab}</span>
                  {state.message && (
                    <span className={`text-xs ${state.status === 'error' ? 'text-red-400' : 'text-green-400/70'}`}>
                      {state.message}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Generated files - download */}
          {pullComplete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-green-400">Generated Files</h3>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" /> Download All
                </button>
              </div>
              {FILE_DEFS.map((def) => {
                const content = fileContents[def.filename];
                const lines = content ? content.split('\n').length : 0;
                const hasError = content?.startsWith('// ERROR');
                return (
                  <div
                    key={def.filename}
                    className="flex items-center gap-3 rounded-xl border border-purple-500/15 px-4 py-3"
                    style={{ background: 'rgba(30, 10, 60, 0.3)' }}
                  >
                    {hasError
                      ? <XCircle className="w-4 h-4 text-red-400" />
                      : <CheckCircle className="w-4 h-4 text-green-400" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white font-mono">{def.filename}</span>
                        <span className="text-xs text-surface-500">{def.name}</span>
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">{lines} lines</p>
                    </div>
                    <button
                      onClick={() => downloadSingle(def.filename)}
                      disabled={hasError}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 transition-colors disabled:opacity-30"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Divider */}
        <hr className="border-purple-500/15" />

        {/* ============================================================ */}
        {/* PUSH SECTION */}
        {/* ============================================================ */}
        <section>
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            Push to SheetDB
          </h2>
          <p className="text-xs text-surface-500 mb-4">
            Push the current local data files to your spreadsheet. Existing rows are cleared and replaced.
          </p>

          <button
            onClick={pushAll}
            disabled={pushingAll || !apiUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white mb-3"
          >
            {pushingAll ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Pushing all sheets...</>
            ) : (
              <><Upload className="w-4 h-4" /> Push All Sheets</>
            )}
          </button>

          <div className="space-y-2">
            {SHEET_DEFS.map((def) => {
              const rows = def.getRows();
              const state = pushStates[def.sheetTab];
              return (
                <div
                  key={def.sheetTab}
                  className="flex items-center gap-3 rounded-xl border border-purple-500/15 px-4 py-3"
                  style={{ background: 'rgba(30, 10, 60, 0.3)' }}
                >
                  {statusIcon(state.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{def.name}</span>
                      <span className="text-xs text-surface-500">({rows.length} rows)</span>
                    </div>
                    {state.message && (
                      <p className={`text-xs mt-0.5 truncate ${state.status === 'error' ? 'text-red-400' : 'text-green-400/70'}`}>
                        {state.message}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => pushSingle(def)}
                    disabled={pushingAll || state.status === 'working' || !apiUrl}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700/50 hover:bg-surface-600/50 text-surface-300 transition-colors disabled:opacity-30"
                  >
                    Push
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
