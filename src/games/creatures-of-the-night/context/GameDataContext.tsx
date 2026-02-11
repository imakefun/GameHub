import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  CardDefinition,
  CardTier,
  CardType,
  PackDefinition,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  FeatureUnlock,
  CLReward,
  CryptSlotUnlock,
  DailyQuest,
  LootTableEntry,
  GameConfig,
  GameSettings,
  UpgradeTier,
  UpgradeCost,
  TypeSpecialization,
} from '../types';
import {
  UPGRADE_COSTS,
  UPGRADE_TIER_PRODUCTION_BONUS,
  TIER_DUPLICATE_SHARDS,
  TYPE_SPECIALIZATIONS,
  LC_ESSENCE_RATE,
  LC_SHARDS_RATE,
} from '../types';
import { fetchGameData, clearCache } from '../services/sheetsService';
import type { LoadReport } from '../services/sheetsService';
import { isSheetsConfigured } from '../config/sheets';

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

// Eagerly import all card art PNGs – Vite resolves these to hashed asset URLs at build time
const cardImageModules = import.meta.glob<string>('../assets/cards/*.png', {
  eager: true,
  import: 'default',
});

// Build a lookup: filename stem (e.g. "Owl") → resolved asset URL
const artByFilename: Record<string, string> = {};
for (const [path, url] of Object.entries(cardImageModules)) {
  const stem = path.split('/').pop()?.replace('.png', '');
  if (stem) artByFilename[stem] = url;
}

// Resolve card artUrl stems (e.g. "Rat") to Vite hashed asset URLs
function enrichArt(cards: CardDefinition[]): CardDefinition[] {
  return cards.map((card) => {
    if (!card.artUrl || card.artUrl.startsWith('http') || card.artUrl.startsWith('/')) return card;
    const url = artByFilename[card.artUrl];
    return url ? { ...card, artUrl: url } : card;
  });
}

const localCardsWithArt: CardDefinition[] = enrichArt(localCards);

interface GameDataContextType {
  config: GameConfig;
  isLoading: boolean;
  error: string | null;
  isUsingSheets: boolean;
  loadReport: LoadReport | null;
  refresh: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CardDefinition[]>(localCardsWithArt);
  const [packs, setPacks] = useState<PackDefinition[]>(localPacks);
  const [expeditions, setExpeditions] = useState<ExpeditionZone[]>(localExpeditions);
  const [typeSynergies, setTypeSynergies] = useState<TypeSynergy[]>(localTypeSynergies);
  const [crossTypeSynergies, setCrossTypeSynergies] = useState<CrossTypeSynergy[]>(localCrossSynergies);
  const [featureUnlocks, setFeatureUnlocks] = useState<FeatureUnlock[]>(localFeatureUnlocks);
  const [clRewards, setCLRewards] = useState<CLReward[]>(localCLRewards);
  const [dailyQuestPool, setDailyQuestPool] = useState<DailyQuest[]>(localDailyQuestPool);
  const [typeUnlockCL, setTypeUnlockCL] = useState<Record<CardType, number>>(localTypeUnlockCL);
  const [cryptSlotUnlocks, setCryptSlotUnlocks] = useState<CryptSlotUnlock[]>(localCryptSlotUnlocks);
  const [lootTables, setLootTables] = useState<LootTableEntry[]>(localLootTables);
  const [settings, setSettings] = useState<GameSettings>(localSettings);
  const [upgradeCosts, setUpgradeCosts] = useState<Record<Exclude<UpgradeTier, 'base'>, UpgradeCost>>(UPGRADE_COSTS);
  const [upgradeTierProductionBonus, setUpgradeTierProductionBonus] = useState<Record<UpgradeTier, number>>(UPGRADE_TIER_PRODUCTION_BONUS);
  const [tierDuplicateShards, setTierDuplicateShards] = useState<Record<CardTier, number>>(TIER_DUPLICATE_SHARDS);
  const [typeSpecializations, setTypeSpecializations] = useState<Record<CardType, TypeSpecialization>>(TYPE_SPECIALIZATIONS);
  const [lcEssenceRate, setLcEssenceRate] = useState<number>(LC_ESSENCE_RATE);
  const [lcShardsRate, setLcShardsRate] = useState<number>(LC_SHARDS_RATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSheets, setIsUsingSheets] = useState(false);
  const [loadReport, setLoadReport] = useState<LoadReport | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setLoadReport(null);

    if (!isSheetsConfigured()) {
      setIsLoading(false);
      setIsUsingSheets(false);
      return;
    }

    try {
      const data = await fetchGameData();
      setLoadReport(data.loadReport);
      if (data.cards.length > 0) {
        setCards(enrichArt(data.cards));
      }
      if (data.packs && data.packs.length > 0) {
        setPacks(data.packs);
      }
      if (data.expeditions && data.expeditions.length > 0) {
        setExpeditions(data.expeditions);
      }
      if (data.typeSynergies && data.typeSynergies.length > 0) {
        setTypeSynergies(data.typeSynergies);
      }
      if (data.crossTypeSynergies && data.crossTypeSynergies.length > 0) {
        setCrossTypeSynergies(data.crossTypeSynergies);
      }
      if (data.dailyQuests && data.dailyQuests.length > 0) {
        setDailyQuestPool(data.dailyQuests);
      }
      if (data.clRewards && data.clRewards.length > 0) {
        setCLRewards(data.clRewards);
      }
      if (data.featureUnlocks && data.featureUnlocks.length > 0) {
        setFeatureUnlocks(data.featureUnlocks);
      }
      if (data.typeUnlockCL) {
        setTypeUnlockCL(data.typeUnlockCL);
      }
      if (data.cryptSlotUnlocks) {
        setCryptSlotUnlocks(data.cryptSlotUnlocks);
      }
      if (data.lootTables && data.lootTables.length > 0) {
        setLootTables(data.lootTables);
      }
      setSettings(data.settings);
      if (data.upgradeTiers) {
        setUpgradeCosts(data.upgradeTiers.upgradeCosts);
        setUpgradeTierProductionBonus(data.upgradeTiers.upgradeTierProductionBonus);
        setTierDuplicateShards(data.upgradeTiers.tierDuplicateShards);
      }
      if (data.typeSpecializations) {
        setTypeSpecializations(data.typeSpecializations);
      }
      if (data.lcEssenceRate != null) setLcEssenceRate(data.lcEssenceRate);
      if (data.lcShardsRate != null) setLcShardsRate(data.lcShardsRate);
      setIsUsingSheets(true);
    } catch (err) {
      console.error('[Creatures] Using local data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
      setIsUsingSheets(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    clearCache();
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const config: GameConfig = {
    cards,
    packs,
    expeditions,
    typeSynergies,
    crossTypeSynergies,
    featureUnlocks,
    clRewards,
    dailyQuestPool,
    typeUnlockCL,
    cryptSlotUnlocks,
    lootTables,
    settings,
    upgradeCosts,
    upgradeTierProductionBonus,
    tierDuplicateShards,
    typeSpecializations,
    lcEssenceRate,
    lcShardsRate,
  };

  return (
    <GameDataContext.Provider value={{ config, isLoading, error, isUsingSheets, loadReport, refresh }}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData(): GameDataContextType {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
}
