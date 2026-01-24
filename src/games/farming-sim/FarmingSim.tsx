import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, HelpCircle, X, Cloud, RefreshCw } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import {
  ResourceBar,
  FieldsPanel,
  BarnPanel,
  OrchardPanel,
  FactoryPanel,
  SignpostPanel,
  MarketPanel,
  InventoryPanel,
} from './components';
import { GameDataProvider, useGameData } from './context/GameDataContext';
import type { GameConfig } from './types';
import { getXpForLevel } from './types';

type Tab = 'fields' | 'barn' | 'orchard' | 'factory' | 'orders' | 'market' | 'inventory';

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: 'fields', label: 'Fields', emoji: '🌱' },
  { id: 'barn', label: 'Barn', emoji: '🏠' },
  { id: 'orchard', label: 'Orchard', emoji: '🌳' },
  { id: 'factory', label: 'Factory', emoji: '🏭' },
  { id: 'orders', label: 'Orders', emoji: '🪧' },
  { id: 'market', label: 'Market', emoji: '🏪' },
  { id: 'inventory', label: 'Items', emoji: '🎒' },
];

function FarmingSimContent() {
  const [activeTab, setActiveTab] = useState<Tab>('fields');
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Get game data from context (with sheets fallback)
  const {
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
  } = useGameData();

  // Build game config from context data
  const gameConfig: GameConfig = {
    crops,
    animals,
    trees,
    machines,
    products,
    levels,
    settings,
  };

  const {
    state,
    plantCrop,
    harvestCrop,
    buyAnimal,
    collectProduct,
    feedAnimal,
    plantTree,
    harvestFruit,
    buyMachine,
    startProcessing,
    collectProcessed,
    completeOrder,
    dismissOrder,
    refreshOrders: _refreshOrders,
    serveCustomer,
    sellItem,
    resetGame,
  } = useGameState(gameConfig);

  // Count notifications for tabs
  const readyFields = state.fields.filter(f => f.isReady).length;
  const readyPens = state.animalPens.filter(p => p.isReady).length;
  const hungryPens = state.animalPens.filter(p => p.animalId && !p.isFed).length;
  const readyOrchards = state.orchards.filter(o => o.isReady).length;
  const readyMachines = state.machineSlots.filter(s => s.isReady).length;
  const pendingOrders = state.orders.length;
  const waitingCustomers = state.wanderingCustomers.length;

  const getNotificationCount = (tab: Tab): number => {
    switch (tab) {
      case 'fields': return readyFields;
      case 'barn': return readyPens + hungryPens;
      case 'orchard': return readyOrchards;
      case 'factory': return readyMachines;
      case 'orders': return pendingOrders;
      case 'market': return waitingCustomers;
      default: return 0;
    }
  };

  // XP progress calculation
  const currentLevelXp = getXpForLevel(state.progress.level);
  const nextLevelXp = getXpForLevel(state.progress.level + 1);
  const xpInCurrentLevel = state.progress.xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const xpProgress = xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 100;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌾</div>
          <div className="text-white text-xl font-bold">Loading Farm Valley...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400">
      {/* Error Banner */}
      {error && (
        <div className="bg-amber-500 text-amber-900 px-4 py-2 text-sm text-center">
          Using local data: {error}
          <button onClick={refresh} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 rounded-lg bg-green-900/50 hover:bg-green-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🌾</span> Farm Valley
                  {isUsingSheets && (
                    <span title="Using Google Sheets data">
                      <Cloud className="w-4 h-4 text-green-300" />
                    </span>
                  )}
                </h1>
                <div className="text-xs text-green-200">
                  Time played: {formatTime(state.stats.playTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Level Badge */}
              <div className="bg-amber-500 text-amber-900 px-3 py-1 rounded-lg font-bold text-sm">
                Lv.{state.progress.level}
              </div>
              {isUsingSheets && (
                <button
                  onClick={refresh}
                  className="p-2 rounded-lg bg-green-900/50 hover:bg-green-900 transition-colors"
                  title="Refresh data from Google Sheets"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
              )}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg bg-green-900/50 hover:bg-green-900 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-lg bg-red-900/50 hover:bg-red-900 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-green-200 mb-1">
              <span>Level {state.progress.level}</span>
              <span>{xpInCurrentLevel} / {xpNeededForLevel} XP</span>
            </div>
            <div className="h-2 bg-green-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Resources */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <ResourceBar resources={state.resources} maxEnergy={gameConfig.settings.maxEnergy} />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 mb-3">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const notifCount = getNotificationCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-green-800 shadow-lg'
                    : 'bg-white/30 text-white hover:bg-white/50'
                  }
                `}
              >
                <span className="mr-1">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                    {notifCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'fields' && (
          <FieldsPanel
            fields={state.fields}
            crops={gameConfig.crops}
            resources={state.resources}
            inventory={state.inventory}
            playerLevel={state.progress.level}
            onPlant={plantCrop}
            onHarvest={harvestCrop}
          />
        )}

        {activeTab === 'barn' && (
          <BarnPanel
            pens={state.animalPens}
            animals={gameConfig.animals}
            products={gameConfig.products}
            resources={state.resources}
            inventory={state.inventory}
            playerLevel={state.progress.level}
            onBuyAnimal={buyAnimal}
            onCollect={collectProduct}
            onFeed={feedAnimal}
          />
        )}

        {activeTab === 'orchard' && (
          <OrchardPanel
            orchards={state.orchards}
            trees={gameConfig.trees}
            resources={state.resources}
            playerLevel={state.progress.level}
            onPlantTree={plantTree}
            onHarvest={harvestFruit}
          />
        )}

        {activeTab === 'factory' && (
          <FactoryPanel
            machineSlots={state.machineSlots}
            machines={gameConfig.machines}
            products={gameConfig.products}
            resources={state.resources}
            inventory={state.inventory}
            playerLevel={state.progress.level}
            onBuyMachine={buyMachine}
            onStartProcessing={startProcessing}
            onCollect={collectProcessed}
          />
        )}

        {activeTab === 'orders' && (
          <SignpostPanel
            orders={state.orders}
            products={gameConfig.products}
            inventory={state.inventory}
            lastRefresh={state.lastOrderRefresh}
            refreshInterval={gameConfig.settings.orderRefreshInterval}
            onComplete={completeOrder}
            onDismiss={dismissOrder}
          />
        )}

        {activeTab === 'market' && (
          <MarketPanel
            customers={state.wanderingCustomers}
            products={gameConfig.products}
            inventory={state.inventory}
            onServeCustomer={serveCustomer}
            onSellItem={sellItem}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel
            inventory={state.inventory}
            products={gameConfig.products}
          />
        )}

        {/* Stats Summary */}
        <div className="mt-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white mb-2">📊 Farm Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/20 rounded p-2">
              <div className="text-white/70">Total XP</div>
              <div className="text-white font-bold">{state.stats.totalXpEarned.toLocaleString()}</div>
            </div>
            <div className="bg-white/20 rounded p-2">
              <div className="text-white/70">Money Earned</div>
              <div className="text-white font-bold">${state.stats.totalMoneyEarned.toLocaleString()}</div>
            </div>
            <div className="bg-white/20 rounded p-2">
              <div className="text-white/70">Orders Completed</div>
              <div className="text-white font-bold">{state.stats.totalOrdersCompleted}</div>
            </div>
            <div className="bg-white/20 rounded p-2">
              <div className="text-white/70">Goods Processed</div>
              <div className="text-white font-bold">{state.stats.totalGoodsProcessed}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">🌾 How to Play</h2>
              <button onClick={() => setShowHelp(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <section>
                <h3 className="font-bold mb-1">⭐ Leveling Up</h3>
                <p>Earn XP by harvesting crops, collecting animal products, processing goods, and completing orders. Level up to unlock new items and slots!</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🌱 Fields</h3>
                <p>Plant seeds and wait for crops to grow. Tap ready crops to harvest them. New crops unlock as you level up.</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🏠 Barn</h3>
                <p>Buy animals to produce goods. Animals need to be fed with the right feed (made in the Feed Mill) before they'll produce!</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🌳 Orchard</h3>
                <p>Plant fruit trees. They take time to mature but produce fruit forever!</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🏭 Factory</h3>
                <p>Buy machines to process raw materials. Start with the Feed Mill to make animal feed!</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🪧 Orders</h3>
                <p>Complete customer orders for money and XP. Orders refresh every few minutes. Higher levels get harder orders with better rewards!</p>
              </section>
              <section>
                <h3 className="font-bold mb-1">🏪 Market</h3>
                <p>Wandering traders pay premium prices! Or quick-sell items at base value.</p>
              </section>
              {isUsingSheets && (
                <section className="bg-green-50 p-2 rounded">
                  <h3 className="font-bold mb-1 flex items-center gap-1">
                    <Cloud className="w-4 h-4" /> Google Sheets
                  </h3>
                  <p>Game data is being loaded from Google Sheets. Use the refresh button to reload data.</p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
            <span className="text-4xl block mb-4">⚠️</span>
            <h2 className="text-lg font-bold mb-2">Reset Game?</h2>
            <p className="text-gray-600 mb-4">This will delete all your progress and start fresh.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main export wraps content with provider
export function FarmingSim() {
  return (
    <GameDataProvider>
      <FarmingSimContent />
    </GameDataProvider>
  );
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}
