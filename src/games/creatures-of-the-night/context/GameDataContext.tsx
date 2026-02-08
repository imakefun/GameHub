import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  CardDefinition,
  PackDefinition,
  ExpeditionZone,
  TypeSynergy,
  CrossTypeSynergy,
  FeatureUnlock,
  CLReward,
  DailyQuest,
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

interface GameDataContextType {
  config: GameConfig;
  isLoading: boolean;
  error: string | null;
  isUsingSheets: boolean;
  refresh: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CardDefinition[]>(localCards);
  const [packs] = useState<PackDefinition[]>(localPacks);
  const [expeditions] = useState<ExpeditionZone[]>(localExpeditions);
  const [typeSynergies] = useState<TypeSynergy[]>(localTypeSynergies);
  const [crossTypeSynergies] = useState<CrossTypeSynergy[]>(localCrossSynergies);
  const [featureUnlocks] = useState<FeatureUnlock[]>(localFeatureUnlocks);
  const [clRewards] = useState<CLReward[]>(localCLRewards);
  const [dailyQuestPool] = useState<DailyQuest[]>(localDailyQuestPool);
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
