// Late Stage Capitalism Simulator - Game Data Context

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TargetCompany, Strategy, GameEvent, GameSettings } from '../types';
import { companies, strategies, events, defaultSettings } from '../data';
import { fetchAllGameData, clearCache, type GameData } from '../services/sheetsService';
import { isSheetsConfigured } from '../config/sheets';

interface GameDataContextType {
  companies: TargetCompany[];
  strategies: Strategy[];
  events: GameEvent[];
  settings: GameSettings;
  isLoading: boolean;
  error: string | null;
  isUsingSheets: boolean;
  refresh: () => Promise<void>;
}

const fallbackData: GameData = {
  companies,
  strategies,
  events,
  settings: defaultSettings,
};

const GameDataContext = createContext<GameDataContextType>({
  ...fallbackData,
  isLoading: false,
  error: null,
  isUsingSheets: false,
  refresh: async () => {},
});

interface GameDataProviderProps {
  children: ReactNode;
}

export function GameDataProvider({ children }: GameDataProviderProps) {
  const [data, setData] = useState<GameData>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSheets, setIsUsingSheets] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const gameData = await fetchAllGameData(fallbackData);
      setData(gameData);
      setIsUsingSheets(isSheetsConfigured());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load game data';
      setError(message);
      setData(fallbackData);
      setIsUsingSheets(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    clearCache();
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <GameDataContext.Provider
      value={{
        ...data,
        isLoading,
        error,
        isUsingSheets,
        refresh,
      }}
    >
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
