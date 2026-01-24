import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Crop,
  Animal,
  Tree,
  Machine,
  Product,
  LevelConfig,
  GameSettings,
} from '../types';
import { fetchGameData, DEFAULT_SETTINGS, clearCache } from '../services/sheetsService';
import { isSheetsConfigured } from '../config/sheets';

// Import local fallback data
import {
  crops as localCrops,
  animals as localAnimals,
  trees as localTrees,
  machines as localMachines,
  products as localProducts,
  levels as localLevels,
  defaultSettings as localSettings,
} from '../data';

interface GameDataContextType {
  crops: Crop[];
  animals: Animal[];
  trees: Tree[];
  machines: Machine[];
  products: Product[];
  levels: LevelConfig[];
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
  const [crops, setCrops] = useState<Crop[]>(localCrops);
  const [animals, setAnimals] = useState<Animal[]>(localAnimals);
  const [trees, setTrees] = useState<Tree[]>(localTrees);
  const [machines, setMachines] = useState<Machine[]>(localMachines);
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [levels, setLevels] = useState<LevelConfig[]>(localLevels);
  const [settings, setSettings] = useState<GameSettings>(localSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSheets, setIsUsingSheets] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    if (!isSheetsConfigured()) {
      console.log('[Farm Valley] Google Sheets not configured, using local data');
      setIsLoading(false);
      setIsUsingSheets(false);
      return;
    }

    try {
      const data = await fetchGameData();

      setCrops(data.crops);
      setAnimals(data.animals);
      setTrees(data.trees);
      setMachines(data.machines);
      setProducts(data.products);
      setLevels(data.levels);
      setSettings(data.settings);
      setIsUsingSheets(true);
      setError(null);
    } catch (err) {
      console.error('[Farm Valley] Error loading from sheets, using local data:', err);
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
        crops,
        animals,
        trees,
        machines,
        products,
        levels,
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

// Re-export DEFAULT_SETTINGS for convenience
export { DEFAULT_SETTINGS };
