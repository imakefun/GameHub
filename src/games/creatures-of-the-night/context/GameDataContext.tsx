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
  WeeklyMilestone,
  LoginStreakMilestone,
} from '../types';
import {
  UPGRADE_COSTS,
  UPGRADE_TIER_PRODUCTION_BONUS,
  TIER_DUPLICATE_SHARDS,
  TYPE_SPECIALIZATIONS,
  LC_ESSENCE_RATE,
  LC_SHARDS_RATE,
  WEEKLY_MILESTONES,
  LOGIN_STREAK_MILESTONES,
  DAILY_QUEST_EASY_COUNT,
  DAILY_QUEST_HARD_COUNT,
  EXTRA_CRYPT_SLOT_LC_COST,
  MAX_PURCHASED_CRYPT_SLOTS,
  ETERNAL_DUPLICATE_VOID_ENERGY,
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
  disconnect: () => void;
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
  const [weeklyMilestones, setWeeklyMilestones] = useState<WeeklyMilestone[]>(WEEKLY_MILESTONES);
  const [loginStreakMilestones, setLoginStreakMilestones] = useState<LoginStreakMilestone[]>(LOGIN_STREAK_MILESTONES);
  const [dailyQuestEasyCount, setDailyQuestEasyCount] = useState<number>(DAILY_QUEST_EASY_COUNT);
  const [dailyQuestHardCount, setDailyQuestHardCount] = useState<number>(DAILY_QUEST_HARD_COUNT);
  const [extraCryptSlotLCCost, setExtraCryptSlotLCCost] = useState<number>(EXTRA_CRYPT_SLOT_LC_COST);
  const [maxPurchasedCryptSlots, setMaxPurchasedCryptSlots] = useState<number>(MAX_PURCHASED_CRYPT_SLOTS);
  const [eternalDuplicateVoidEnergy, setEternalDuplicateVoidEnergy] = useState<number>(ETERNAL_DUPLICATE_VOID_ENERGY);
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
      if (data.weeklyMilestones && data.weeklyMilestones.length > 0) setWeeklyMilestones(data.weeklyMilestones);
      if (data.loginStreakMilestones && data.loginStreakMilestones.length > 0) setLoginStreakMilestones(data.loginStreakMilestones);
      if (data.dailyQuestEasyCount != null) setDailyQuestEasyCount(data.dailyQuestEasyCount);
      if (data.dailyQuestHardCount != null) setDailyQuestHardCount(data.dailyQuestHardCount);
      if (data.extraCryptSlotLCCost != null) setExtraCryptSlotLCCost(data.extraCryptSlotLCCost);
      if (data.maxPurchasedCryptSlots != null) setMaxPurchasedCryptSlots(data.maxPurchasedCryptSlots);
      if (data.eternalDuplicateVoidEnergy != null) setEternalDuplicateVoidEnergy(data.eternalDuplicateVoidEnergy);
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

  const disconnect = () => {
    clearCache();
    setCards(localCardsWithArt);
    setPacks(localPacks);
    setExpeditions(localExpeditions);
    setTypeSynergies(localTypeSynergies);
    setCrossTypeSynergies(localCrossSynergies);
    setFeatureUnlocks(localFeatureUnlocks);
    setCLRewards(localCLRewards);
    setDailyQuestPool(localDailyQuestPool);
    setTypeUnlockCL(localTypeUnlockCL);
    setCryptSlotUnlocks(localCryptSlotUnlocks);
    setLootTables(localLootTables);
    setSettings(localSettings);
    setUpgradeCosts(UPGRADE_COSTS);
    setUpgradeTierProductionBonus(UPGRADE_TIER_PRODUCTION_BONUS);
    setTierDuplicateShards(TIER_DUPLICATE_SHARDS);
    setTypeSpecializations(TYPE_SPECIALIZATIONS);
    setLcEssenceRate(LC_ESSENCE_RATE);
    setLcShardsRate(LC_SHARDS_RATE);
    setWeeklyMilestones(WEEKLY_MILESTONES);
    setLoginStreakMilestones(LOGIN_STREAK_MILESTONES);
    setDailyQuestEasyCount(DAILY_QUEST_EASY_COUNT);
    setDailyQuestHardCount(DAILY_QUEST_HARD_COUNT);
    setExtraCryptSlotLCCost(EXTRA_CRYPT_SLOT_LC_COST);
    setMaxPurchasedCryptSlots(MAX_PURCHASED_CRYPT_SLOTS);
    setEternalDuplicateVoidEnergy(ETERNAL_DUPLICATE_VOID_ENERGY);
    setIsUsingSheets(false);
    setError(null);
    setLoadReport(null);
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
    weeklyMilestones,
    loginStreakMilestones,
    dailyQuestEasyCount,
    dailyQuestHardCount,
    extraCryptSlotLCCost,
    maxPurchasedCryptSlots,
    eternalDuplicateVoidEnergy,
  };

  return (
    <GameDataContext.Provider value={{ config, isLoading, error, isUsingSheets, loadReport, refresh, disconnect }}>
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
