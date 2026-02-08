import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  RotateCcw,
  RefreshCw,
  Cloud,
  Database,
} from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { useGameData, GameDataProvider } from './context/GameDataContext';
import { ResourceBar } from './components/ResourceBar';
import { CryptBoard } from './components/CryptBoard';
import { CollectionPanel } from './components/CollectionPanel';
import { ShopPanel } from './components/ShopPanel';
import { ExpeditionPanel } from './components/ExpeditionPanel';
import { GrimoirePanel } from './components/GrimoirePanel';
import { isNightTime } from './hooks/useGameState';

type Tab = 'crypt' | 'collection' | 'shop' | 'expeditions' | 'grimoire';

function CreaturesGame() {
  const { config, isLoading, error, isUsingSheets, refresh } = useGameData();
  const {
    state,
    collectCard,
    collectAll,
    placeCard,
    removeCard,
    levelUpCard,
    ascendCard,
    awakenCard,
    openPack,
    purchasePack,
    claimStarterTome,
    startExpedition,
    completeQuest,
    claimCLReward,
    claimWeeklyReward,
    resetGame,
  } = useGameState(config);

  const [activeTab, setActiveTab] = useState<Tab>('crypt');
  const [showSettings, setShowSettings] = useState(false);

  const night = isNightTime();

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'crypt', label: 'Crypt', icon: '🏚️' },
    {
      id: 'collection',
      label: 'Cards',
      icon: '📚',
      badge: state.ownedCards.filter((c) => !c.placedInCrypt && !c.isOnExpedition).length,
    },
    {
      id: 'shop',
      label: 'Market',
      icon: '🏪',
      badge: !state.starterTomeClaimed ? 1 : undefined,
    },
    {
      id: 'expeditions',
      label: 'Quests',
      icon: '⚔️',
      badge: state.activeExpeditions.length || undefined,
    },
    {
      id: 'grimoire',
      label: 'Grimoire',
      icon: '📖',
      badge: config.clRewards.filter(
        (r) => r.cl <= state.collectionLevel && !state.clRewardsClaimed.includes(r.cl)
      ).length || undefined,
    },
  ];

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a0015 0%, #1a0533 100%)' }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🌑
          </motion.div>
          <p className="text-purple-300">Awakening the creatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: night
        ? 'linear-gradient(180deg, #050010 0%, #0f0025 50%, #050010 100%)'
        : 'linear-gradient(180deg, #0a0015 0%, #1a0533 50%, #0a0015 100%)'
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20" style={{ background: 'rgba(10, 0, 21, 0.85)', backdropFilter: 'blur(12px)' }}>
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
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">{night ? '🌙' : '🌑'}</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Creatures of the Night
                  </span>
                  {isUsingSheets && (
                    <Cloud className="w-3.5 h-3.5 text-green-400" />
                  )}
                </h1>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-surface-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm flex items-center justify-between">
            <span>Using local data: {error}</span>
            <button onClick={refresh} className="p-1 hover:bg-yellow-500/20 rounded transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ResourceBar
          currencies={state.currencies}
          collectionLevel={state.collectionLevel}
          collectionLevelPoints={state.collectionLevelPoints}
        />
      </div>

      {/* Tab Navigation */}
      <div
        className="sticky top-[60px] z-40 border-b border-purple-500/10"
        style={{ background: 'rgba(10, 0, 21, 0.8)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
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
            {activeTab === 'crypt' && (
              <CryptBoard
                ownedCards={state.ownedCards}
                cryptSlots={state.cryptSlots}
                config={config}
                onCollect={collectCard}
                onCollectAll={collectAll}
                onRemoveCard={removeCard}
              />
            )}
            {activeTab === 'collection' && (
              <CollectionPanel
                ownedCards={state.ownedCards}
                config={config}
                onPlaceCard={placeCard}
                onRemoveCard={removeCard}
                onLevelUp={levelUpCard}
                onAscend={ascendCard}
                onAwaken={awakenCard}
              />
            )}
            {activeTab === 'shop' && (
              <ShopPanel
                currencies={state.currencies}
                config={config}
                ownedCards={state.ownedCards}
                starterTomeClaimed={state.starterTomeClaimed}
                onPurchasePack={purchasePack}
                onOpenPack={openPack}
                onClaimStarterTome={claimStarterTome}
              />
            )}
            {activeTab === 'expeditions' && (
              <ExpeditionPanel
                ownedCards={state.ownedCards}
                config={config}
                collectionLevel={state.collectionLevel}
                activeExpeditions={state.activeExpeditions}
                onStartExpedition={startExpedition}
              />
            )}
            {activeTab === 'grimoire' && (
              <GrimoirePanel
                state={state}
                config={config}
                onClaimCLReward={claimCLReward}
                onCompleteQuest={completeQuest}
                onClaimWeeklyReward={claimWeeklyReward}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-md mx-4 border border-purple-500/20"
              style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0a0015 100%)' }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </h2>

              {/* Data source */}
              <div className="mb-4 p-3 bg-surface-800/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {isUsingSheets ? (
                    <>
                      <Cloud className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Google Sheets connected</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-surface-400" />
                      <span className="text-surface-400">Using local data</span>
                    </>
                  )}
                  <button onClick={refresh} className="ml-auto p-1.5 hover:bg-white/10 rounded transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-6">
                <h3 className="font-semibold text-surface-400">Statistics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Play Time</p>
                    <p className="font-semibold">{formatTime(state.playerStats.playTime)}</p>
                  </div>
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Collection Level</p>
                    <p className="font-semibold">CL {state.collectionLevel}</p>
                  </div>
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Cards Collected</p>
                    <p className="font-semibold">{state.playerStats.totalCardsCollected}</p>
                  </div>
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Tomes Opened</p>
                    <p className="font-semibold">{state.playerStats.totalPacksOpened}</p>
                  </div>
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Essence Collected</p>
                    <p className="font-semibold">{Math.floor(state.playerStats.totalEssenceCollected).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-surface-500 text-xs">Game Data</p>
                    <p className="font-semibold">{config.cards.length} cards</p>
                  </div>
                </div>
              </div>

              {/* Reset */}
              <div className="border-t border-purple-500/20 pt-4">
                <button
                  onClick={() => {
                    if (confirm('Reset all progress? This cannot be undone!')) {
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

              <button
                onClick={() => setShowSettings(false)}
                className="mt-4 w-full py-2 bg-surface-700/50 hover:bg-surface-600/50 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CreaturesOfTheNight() {
  return (
    <GameDataProvider>
      <CreaturesGame />
    </GameDataProvider>
  );
}
