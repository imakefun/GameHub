import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Element, Recipe, Generator } from '../types';
import { fetchGameData, DEFAULT_SETTINGS, clearCache } from '../services/sheetsService';
import type { GameSettings } from '../services/sheetsService';
import { isSheetsConfigured } from '../config/sheets';

// Import local fallback data
import { elements as localElements } from '../data/elements';
import { recipes as localRecipes } from '../data/recipes';
import { generators as localGenerators } from '../data/generators';

interface GameDataContextType {
  elements: Record<string, Element>;
  recipes: Recipe[];
  generators: Generator[];
  settings: GameSettings;
  isLoading: boolean;
  error: string | null;
  isUsingSheets: boolean;
  refresh: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

interface GameDataProviderProps {
  children: ReactNode;
}

export function GameDataProvider({ children }: GameDataProviderProps) {
  const [elements, setElements] = useState<Record<string, Element>>(localElements);
  const [recipes, setRecipes] = useState<Recipe[]>(localRecipes);
  const [generators, setGenerators] = useState<Generator[]>(localGenerators);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSheets, setIsUsingSheets] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    if (!isSheetsConfigured()) {
      console.log('[Alchemoji] Google Sheets not configured, using local data');
      setIsLoading(false);
      setIsUsingSheets(false);
      return;
    }

    try {
      const data = await fetchGameData();

      // Convert elements array to record
      const elementsRecord: Record<string, Element> = {};
      data.elements.forEach((el) => {
        elementsRecord[el.id] = el;
      });

      setElements(elementsRecord);
      setRecipes(data.recipes);
      setGenerators(data.generators);
      setSettings(data.settings);
      setIsUsingSheets(true);
      setError(null);
    } catch (err) {
      console.error('[Alchemoji] Error loading from sheets, using local data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game data');
      // Keep using local data as fallback
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

  return (
    <GameDataContext.Provider
      value={{
        elements,
        recipes,
        generators,
        settings,
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
