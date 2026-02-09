import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

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
import { settings as localSettings } from '../data/settings';

import type {
  CardDefinition,
  PackDefinition,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  CLReward,
  FeatureUnlock,
  DailyQuest,
  CardType,
  CryptSlotUnlock,
  GameSettings,
} from '../types';

// ============================================================
// Flattening helpers (match the sheet column format)
// ============================================================

function flattenCard(c: CardDefinition): Record<string, string> {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    tier: c.tier,
    set: c.set ? String(c.set) : '',
    baseGenerationAmount: String(c.baseGenerationAmount),
    baseInterval: String(c.baseInterval),
    description: c.description,
    flavorText: c.flavorText,
    artUrl: c.artUrl || '',
  };
}

function flattenPack(p: PackDefinition): Record<string, string> {
  const row: Record<string, string> = {
    id: p.id,
    name: p.name,
    description: p.description,
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
    id: e.id,
    name: e.name,
    description: e.description,
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
    riskPercent: String(e.riskPercent),
    riskEffect: e.riskEffect,
    riskDuration: String(e.riskDuration),
  };
}

function flattenTypeSynergy(s: TypeSynergy): Record<string, string> {
  const row: Record<string, string> = {
    type: s.type,
    fullSetAbility: s.fullSetAbility || '',
  };
  s.thresholds.forEach((t, i) => {
    const idx = i + 1;
    row[`threshold${idx}_count`] = String(t.count);
    row[`threshold${idx}_bonus`] = String(t.bonus);
  });
  return row;
}

function flattenCrossTypeSynergy(s: CrossTypeSynergy): Record<string, string> {
  return {
    id: s.id,
    name: s.name,
    type1: s.type1,
    type2: s.type2,
    primaryEffect: s.primaryEffect,
    bonusEffect: s.bonusEffect,
    productionBonus: String(s.productionBonus),
  };
}

function flattenCLReward(r: CLReward): Record<string, string> {
  return {
    cl: String(r.cl),
    type: r.type,
    amount: String(r.amount),
    description: r.description,
    cardId: r.cardId || '',
  };
}

function flattenFeatureUnlock(f: FeatureUnlock): Record<string, string> {
  return {
    cl: String(f.cl),
    feature: f.feature,
    description: f.description,
  };
}

function flattenDailyQuest(q: DailyQuest): Record<string, string> {
  return {
    id: q.id,
    description: q.description,
    target: String(q.target),
    difficulty: q.difficulty,
    rewardSE: q.rewards.shadowEssence ? String(q.rewards.shadowEssence) : '',
    rewardSS: q.rewards.soulShards ? String(q.rewards.soulShards) : '',
    rewardLC: q.rewards.lunarCrystals ? String(q.rewards.lunarCrystals) : '',
  };
}

function flattenCLConfig(
  typeUnlockCL: Record<CardType, number>,
  cryptSlotUnlocks: CryptSlotUnlock[],
): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (const [type, cl] of Object.entries(typeUnlockCL)) {
    rows.push({ category: 'typeunlock', key: type, value: String(cl) });
  }
  for (const s of cryptSlotUnlocks) {
    rows.push({ category: 'cryptslot', key: String(s.slot), value: String(s.cl) });
  }
  return rows;
}

function flattenSettings(settings: GameSettings): Record<string, string>[] {
  return Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

// ============================================================
// Sheet definitions
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
  { name: 'Settings', sheetTab: 'Settings', getRows: () => flattenSettings(localSettings) },
];

// ============================================================
// Component
// ============================================================

type SheetStatus = 'idle' | 'pushing' | 'success' | 'error';

interface SheetState {
  status: SheetStatus;
  message?: string;
}

export function AdminPanel() {
  const [apiUrl, setApiUrl] = useState(SHEETS_CONFIG.apiUrl);
  const [sheetStates, setSheetStates] = useState<Record<string, SheetState>>(
    () => Object.fromEntries(SHEET_DEFS.map((d) => [d.sheetTab, { status: 'idle' as SheetStatus }])),
  );
  const [pushingAll, setPushingAll] = useState(false);

  const updateSheetState = useCallback((tab: string, state: SheetState) => {
    setSheetStates((prev) => ({ ...prev, [tab]: state }));
  }, []);

  const pushSheet = useCallback(async (sheetTab: string, rows: Record<string, string>[]) => {
    if (!apiUrl) {
      updateSheetState(sheetTab, { status: 'error', message: 'No API URL configured' });
      return false;
    }

    updateSheetState(sheetTab, { status: 'pushing' });

    try {
      const url = `${apiUrl.replace(/\/$/, '')}?sheet=${encodeURIComponent(sheetTab)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows }),
      });

      if (!res.ok) {
        const text = await res.text();
        updateSheetState(sheetTab, { status: 'error', message: `${res.status}: ${text.slice(0, 200)}` });
        return false;
      }

      updateSheetState(sheetTab, { status: 'success', message: `${rows.length} rows pushed` });
      return true;
    } catch (err) {
      updateSheetState(sheetTab, {
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return false;
    }
  }, [apiUrl, updateSheetState]);

  const pushSingle = useCallback(async (def: SheetDef) => {
    const rows = def.getRows();
    await pushSheet(def.sheetTab, rows);
  }, [pushSheet]);

  const pushAll = useCallback(async () => {
    setPushingAll(true);
    for (const def of SHEET_DEFS) {
      const rows = def.getRows();
      const ok = await pushSheet(def.sheetTab, rows);
      if (!ok) break;
    }
    setPushingAll(false);
  }, [pushSheet]);

  const statusIcon = (status: SheetStatus) => {
    switch (status) {
      case 'pushing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 rounded-full border border-surface-600" />;
    }
  };

  return (
    <div
      className="min-h-screen pb-12"
      style={{ background: 'linear-gradient(180deg, #0a0015 0%, #1a0533 100%)' }}
    >
      {/* Header */}
      <header className="border-b border-purple-500/20 sticky top-0 z-50" style={{ background: 'rgba(10, 0, 21, 0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/play/creatures-of-the-night"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Admin: Push Data to SheetDB
            </h1>
            <p className="text-xs text-surface-500">Hidden admin page - pushes local data to your spreadsheet</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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

        {/* Warning */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-300/80">
            <p className="font-medium text-amber-300">This will append data to your spreadsheet.</p>
            <p className="mt-1">If the sheets already have data, clear them first to avoid duplicates.
              SheetDB POST appends rows — it does not replace existing content.</p>
          </div>
        </div>

        {/* Push All button */}
        <button
          onClick={pushAll}
          disabled={pushingAll || !apiUrl}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
        >
          {pushingAll ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Pushing all sheets...</>
          ) : (
            <><Upload className="w-4 h-4" /> Push All Sheets</>
          )}
        </button>

        {/* Sheet list */}
        <div className="space-y-2">
          {SHEET_DEFS.map((def) => {
            const rows = def.getRows();
            const state = sheetStates[def.sheetTab];
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
                  disabled={pushingAll || state.status === 'pushing' || !apiUrl}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700/50 hover:bg-surface-600/50 text-surface-300 transition-colors disabled:opacity-30"
                >
                  Push
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
