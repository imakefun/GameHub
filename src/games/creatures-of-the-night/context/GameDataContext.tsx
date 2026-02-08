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
  LevelCostConfig,
  GameConfig,
  GameSettings,
} from '../types';
import { fetchGameData, DEFAULT_SETTINGS, clearCache } from '../services/sheetsService';
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
import { levelCosts as localLevelCosts } from '../data/levelCosts';
import {
  clTierMultipliers as localCLTierMultipliers,
  typeUnlockCL as localTypeUnlockCL,
  cryptSlotUnlocks as localCryptSlotUnlocks,
} from '../data/clConfig';
import cardArtMap from '../data/cardArtMap';

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

// Enrich local cards with art URLs using the mapping
const localCardsWithArt: CardDefinition[] = localCards.map((card) => {
  if (card.artUrl) return card; // already has art (e.g. from Sheets)
  const filename = cardArtMap[card.id];
  const url = filename ? artByFilename[filename] : undefined;
  return url ? { ...card, artUrl: url } : card;
});

interface GameDataContextType {
  config: GameConfig;
  isLoading: boolean;
  error: string | null;
  isUsingSheets: boolean;
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
  const [levelCosts, setLevelCosts] = useState<LevelCostConfig[]>(localLevelCosts);
  const [clTierMultipliers, setCLTierMultipliers] = useState<Record<CardTier, number>>(localCLTierMultipliers);
  const [typeUnlockCL, setTypeUnlockCL] = useState<Record<CardType, number>>(localTypeUnlockCL);
  const [cryptSlotUnlocks, setCryptSlotUnlocks] = useState<CryptSlotUnlock[]>(localCryptSlotUnlocks);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSheets, setIsUsingSheets] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    if (!isSheetsConfigured()) {
      setIsLoading(false);
      setIsUsingSheets(false);
      return;
    }

    try {
      const data = await fetchGameData();
      if (data.cards.length > 0) {
        setCards(data.cards);
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
      if (data.levelCosts && data.levelCosts.length > 0) {
        setLevelCosts(data.levelCosts);
      }
      if (data.clRewards && data.clRewards.length > 0) {
        setCLRewards(data.clRewards);
      }
      if (data.featureUnlocks && data.featureUnlocks.length > 0) {
        setFeatureUnlocks(data.featureUnlocks);
      }
      if (data.clTierMultipliers) {
        setCLTierMultipliers(data.clTierMultipliers);
      }
      if (data.typeUnlockCL) {
        setTypeUnlockCL(data.typeUnlockCL);
      }
      if (data.cryptSlotUnlocks) {
        setCryptSlotUnlocks(data.cryptSlotUnlocks);
      }
      setSettings(data.settings);
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
    levelCosts,
    clTierMultipliers,
    typeUnlockCL,
    cryptSlotUnlocks,
    settings,
  };

  return (
    <GameDataContext.Provider value={{ config, isLoading, error, isUsingSheets, refresh }}>
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
