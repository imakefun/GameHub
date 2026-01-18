import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, RotateCcw, Book, Beaker, Store, Cog, RefreshCw, Database, Cloud } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { useGameData, GameDataProvider } from './context/GameDataContext';
import { ResourceBar } from './components/ResourceBar';
import { GeneratorPanel } from './components/GeneratorPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { RecipeBook } from './components/RecipeBook';
import { MarketPanel } from './components/MarketPanel';
import { DiscoveryPopup } from './components/DiscoveryPopup';

type Tab = 'craft' | 'generators' | 'recipes' | 'market';

function AlchemojiGame() {
  const { elements, recipes, generators, settings, isLoading, error, isUsingSheets, refresh } = useGameData();

  const {
    state,
    produce,
    tryCraft,
    craft,
    sell,
    upgradeGenerator,
    unlockGenerator,
    toggleAuto,
    resetGame,
    clearCraftResult,
    config,
  } = useGameState({ elements, recipes, generators, settings });

  const [activeTab, setActiveTab] = useState<Tab>('craft');
  const [showSettings, setShowSettings] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'craft', label: 'Craft', icon: <Beaker className="w-4 h-4" /> },
    { id: 'generators', label: 'Generators', icon: <Cog className="w-4 h-4" /> },
    { id: 'recipes', label: 'Recipes', icon: <Book className="w-4 h-4" /> },
    { id: 'market', label: 'Market', icon: <Store className="w-4 h-4" /> },
  ];

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🧪
          </motion.div>
          <p className="text-surface-400">Loading game data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/games"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🧪</span> Alchemoji
                  {isUsingSheets && (
                    <span title="Using Google Sheets">
                      <Cloud className="w-4 h-4 text-green-400" />
                    </span>
                  )}
                </h1>
                <p className="text-xs text-surface-400">
                  {state.stats.recipesDiscovered}/{config.recipes.length} recipes discovered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm flex items-center justify-between">
            <span>Using local data: {error}</span>
            <button
              onClick={refresh}
              className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ResourceBar resources={state.resources} />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[60px] z-40 bg-surface-950/80 backdrop-blur-sm border-b border-surface-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'recipes' && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {state.discoveredRecipes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'craft' && (
              <InventoryPanel
                inventory={state.inventory}
                elements={config.elements}
                craftResult={state.lastCraftResult}
                onTryCraft={tryCraft}
              />
            )}
            {activeTab === 'generators' && (
              <GeneratorPanel
                ownedGenerators={state.generators}
                resources={state.resources}
                generators={config.generators}
                elements={config.elements}
                settings={config.settings}
                onProduce={produce}
                onUpgrade={upgradeGenerator}
                onUnlock={unlockGenerator}
                onToggleAuto={toggleAuto}
              />
            )}
            {activeTab === 'recipes' && (
              <RecipeBook
                discoveredRecipes={state.discoveredRecipes}
                inventory={state.inventory}
                resources={state.resources}
                recipes={config.recipes}
                elements={config.elements}
                onCraft={craft}
              />
            )}
            {activeTab === 'market' && (
              <MarketPanel
                inventory={state.inventory}
                marketPrices={state.marketPrices}
                elements={config.elements}
                onSell={sell}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </h2>

              {/* Data Source */}
              <div className="mb-4 p-3 bg-surface-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {isUsingSheets ? (
                    <>
                      <Cloud className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Using Google Sheets</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-surface-400" />
                      <span className="text-surface-400">Using local data</span>
                    </>
                  )}
                  <button
                    onClick={refresh}
                    className="ml-auto p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Refresh data from sheets"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-6">
                <h3 className="font-semibold text-surface-400">Statistics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-surface-800/50 rounded-lg">
                    <p className="text-surface-400">Play Time</p>
                    <p className="font-semibold">{formatTime(state.stats.playTime)}</p>
                  </div>
                  <div className="p-3 bg-surface-800/50 rounded-lg">
                    <p className="text-surface-400">Recipes Found</p>
                    <p className="font-semibold">
                      {state.stats.recipesDiscovered}/{config.recipes.length}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-800/50 rounded-lg">
                    <p className="text-surface-400">Elements Crafted</p>
                    <p className="font-semibold">{state.stats.totalElementsCrafted}</p>
                  </div>
                  <div className="p-3 bg-surface-800/50 rounded-lg">
                    <p className="text-surface-400">Money Earned</p>
                    <p className="font-semibold">${state.stats.totalMoneyEarned.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Game Data Info */}
              <div className="mb-4 text-xs text-surface-500">
                <p>Elements: {Object.keys(config.elements).length} | Recipes: {config.recipes.length} | Generators: {config.generators.length}</p>
              </div>

              {/* Reset Button */}
              <div className="border-t border-surface-700 pt-4">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
                      resetGame();
                      setShowSettings(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Progress
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="mt-4 w-full py-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery Popup */}
      <DiscoveryPopup
        craftResult={state.lastCraftResult}
        onClose={clearCraftResult}
      />
    </div>
  );
}

// Wrapper component with provider
export function Alchemoji() {
  return (
    <GameDataProvider>
      <AlchemojiGame />
    </GameDataProvider>
  );
}
