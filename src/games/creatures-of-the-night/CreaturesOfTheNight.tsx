import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  RotateCcw,
  RefreshCw,
  Cloud,
  CloudOff,
  Database,
} from 'lucide-react';
import type { CardDefinition, CLReward, DailyQuest, CardType, UpgradeTier } from './types';
import { CARD_TYPE_INFO } from './types';
import { useGameState, STORAGE_KEY } from './hooks/useGameState';
import { Filter, ArrowUpDown } from 'lucide-react';
import { useGameData, GameDataProvider } from './context/GameDataContext';
import { ResourceBar } from './components/ResourceBar';
import { CryptBoard } from './components/CryptBoard';
import { CollectionPanel } from './components/CollectionPanel';
import { ShopPanel } from './components/ShopPanel';
import { ExpeditionPanel } from './components/ExpeditionPanel';
import { GrimoirePanel } from './components/GrimoirePanel';
import { PackOpening } from './components/PackOpening';
import { NewCardReveal } from './components/NewCardReveal';
import { RewardReveal } from './components/RewardReveal';
import { CLRoadPage } from './components/CLRoadPage';
import { QuestRewardReveal } from './components/QuestRewardReveal';
import { TutorialOverlay, TUTORIAL_STEP_COUNT } from './components/TutorialOverlay';
import { isNightTime, getLunarPhase } from './hooks/useGameState';

type Tab = 'crypt' | 'collection' | 'shop' | 'expeditions' | 'grimoire';

function CreaturesGame() {
  const { config, isLoading, error, isUsingSheets, loadReport, refresh, disconnect } = useGameData();
  const {
    state,
    collectCard,
    collectAll,
    placeCard,
    swapCard,
    removeCard,
    upgradeCard,
    openPack,
    purchasePack,
    claimStarterTome,
    startExpedition,
    collectExpedition,
    completeQuest,
    claimCLReward,
    claimWeeklyReward,
    rushExpedition,
    buyCryptSlot,
    claimLoginStreakReward,
    dismissPackReward,
    setTutorialStep,
    completeTutorial,
    resetGame,
  } = useGameState(config);

  const [activeTab, setActiveTab] = useState<Tab>('crypt');
  const [showSettings, setShowSettings] = useState(false);
  const [showCLRoad, setShowCLRoad] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<'all' | CardType>('all');
  const [collectionSort, setCollectionSort] = useState<'type' | 'upgrade'>('upgrade');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [revealingCard, setRevealingCard] = useState<CardDefinition | null>(null);
  const [revealingReward, setRevealingReward] = useState<CLReward | null>(null);
  const [revealingQuestReward, setRevealingQuestReward] = useState<DailyQuest | null>(null);
  const [shardTargetCardName, setShardTargetCardName] = useState<string | null>(null);

  // Pick a random owned card and resolve its display name
  const pickShardTarget = useCallback(() => {
    const cards = state.ownedCards;
    if (cards.length === 0) return { index: undefined, name: undefined };
    const idx = Math.floor(Math.random() * cards.length);
    const def = config.cards.find((c) => c.id === cards[idx].definitionId);
    return { index: idx, name: def?.name };
  }, [state.ownedCards, config.cards]);

  // ---- Upgrade → CL Road animation flow ----
  const clBeforeUpgradeRef = useRef(state.collectionLevel);
  const [clRoadAnimation, setClRoadAnimation] = useState<{ clFrom: number; clTo: number } | null>(null);

  // Wraps upgradeCard: capture CL *before* dispatch so we can animate the gain
  const handleUpgrade = useCallback(
    (index: number, targetTier?: Exclude<UpgradeTier, 'base'>, useLunarCrystals?: boolean) => {
      clBeforeUpgradeRef.current = state.collectionLevel;
      upgradeCard(index, targetTier, useLunarCrystals);
    },
    [state.collectionLevel, upgradeCard],
  );

  // Called when UpgradeReveal "Continue" is clicked → opens CL Road with animation
  const handleUpgradeFlowNext = useCallback(() => {
    const clFrom = clBeforeUpgradeRef.current;
    const clTo = state.collectionLevel;
    if (clTo > clFrom) {
      setClRoadAnimation({ clFrom, clTo });
      setShowCLRoad(true);
    }
  }, [state.collectionLevel]);

  // Wrap claimCLReward: show a celebration overlay for every reward type
  const handleClaimCLReward = useCallback(
    (cl: number) => {
      const reward = config.clRewards.find((r) => r.cl === cl);
      if (!reward) {
        claimCLReward(cl);
        return;
      }

      // For soulShard rewards, pick the target card for both reducer and display
      if (reward.type === 'soulShards') {
        const target = pickShardTarget();
        claimCLReward(cl, target.index);
        setShardTargetCardName(target.name ?? null);
        setRevealingReward(reward);
        return;
      }

      // Claim immediately so state updates; overlay shows on top
      claimCLReward(cl);

      if (reward.type === 'card' && reward.cardId) {
        const cardDef = config.cards.find((c) => c.id === reward.cardId);
        if (cardDef) {
          setRevealingCard(cardDef);
          return;
        }
      }

      // Non-card rewards get their own celebration
      setShardTargetCardName(null);
      setRevealingReward(reward);
    },
    [config.clRewards, config.cards, claimCLReward, pickShardTarget],
  );

  // Wrap completeQuest: show a celebration overlay for quest rewards
  const handleCompleteQuest = useCallback(
    (questIndex: number) => {
      const quest = state.dailyQuests[questIndex];
      if (!quest) return;
      const questDef = config.dailyQuestPool.find((q) => q.id === quest.questId);
      if (!questDef) {
        completeQuest(questIndex);
        return;
      }

      // Pick shard target if this quest rewards shards
      let targetName: string | undefined;
      let targetIndex: number | undefined;
      if (questDef.rewards.soulShards) {
        const target = pickShardTarget();
        targetName = target.name;
        targetIndex = target.index;
      }

      completeQuest(questIndex, targetIndex);
      setShardTargetCardName(targetName ?? null);
      setRevealingQuestReward(questDef);
    },
    [state.dailyQuests, config.dailyQuestPool, completeQuest, pickShardTarget],
  );

  // Tutorial: force tab switch from TutorialOverlay
  const handleTutorialForceTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  // Tutorial: auto-advance interactive steps when game state conditions are met
  useEffect(() => {
    if (state.tutorialCompleted) return;
    const step = state.tutorialStep;

    // Step 3 (claim tome): advance when starter tome claimed AND cards collected from pack
    if (step === 3 && state.starterTomeClaimed && state.ownedCards.length > 1) {
      setTutorialStep(4);
    }

    // Step 5 (place a card): advance when a second card is placed in crypt
    if (step === 5 && state.ownedCards.filter((c) => c.placedInCrypt).length >= 2) {
      setTutorialStep(6);
    }
  }, [
    state.tutorialCompleted,
    state.tutorialStep,
    state.starterTomeClaimed,
    state.ownedCards,
    setTutorialStep,
  ]);

  const night = isNightTime();
  const lunarPhase = getLunarPhase();
  const lunarEmoji: Record<string, string> = {
    new_moon: '🌑', waxing: '🌒', full_moon: '🌕', waning: '🌘', blood_moon: '🔴', none: '🌙',
  };

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
          <button
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone!')) {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }
            }}
            className="mt-6 flex items-center gap-2 px-4 py-2 mx-auto bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Progress
          </button>
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
            <div className="flex items-center gap-2">
              {/* Cosmic Cycle Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-purple-500/20 text-xs">
                <span title={night ? 'Night Phase' : 'Day Phase'}>{night ? '🌙' : '☀️'}</span>
                {(lunarPhase === 'new_moon' || lunarPhase === 'full_moon' || lunarPhase === 'blood_moon') && (
                  <span title={lunarPhase.replace('_', ' ')}>{lunarEmoji[lunarPhase]}</span>
                )}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-surface-400" />
              </button>
            </div>
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
      {!error && loadReport && !loadReport.cached && loadReport.entries.some(e => e.error) && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400 flex items-center gap-2">
            <span>
              Sheets loaded ({loadReport.entries.filter(e => e.source === 'sheets').length}/{loadReport.entries.length}) —
              {' '}{loadReport.entries.filter(e => e.error).map(e => e.name).join(', ')} fell back to local
            </span>
            <button onClick={refresh} className="ml-auto p-1 hover:bg-amber-500/20 rounded transition-colors flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ResourceBar
          currencies={state.currencies}
          collectionLevel={state.collectionLevel}
        />
      </div>

      {/* Tab Navigation */}
      <div
        className="sticky top-[60px] z-40 border-b border-purple-500/10"
        style={{ background: 'rgba(10, 0, 21, 0.8)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowFilterMenu(false); }}
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

            {/* Filter & Sort buttons - shown when on collection tab */}
            {activeTab === 'collection' && (
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    collectionFilter !== 'all'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                      : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {collectionFilter === 'all' ? 'Filter' : CARD_TYPE_INFO[collectionFilter].emoji}
                </button>
                <button
                  onClick={() => setCollectionSort(collectionSort === 'upgrade' ? 'type' : 'upgrade')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 transition-all"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{collectionSort === 'upgrade' ? 'Tier' : 'Type'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter dropdown for collection tab */}
          {activeTab === 'collection' && showFilterMenu && (() => {
            const ownedTypes = new Set(
              state.ownedCards
                .map((c) => config.cards.find((d) => d.id === c.definitionId)?.type)
                .filter(Boolean)
            );
            return (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-2 flex gap-1.5 flex-wrap"
              >
                <button
                  onClick={() => { setCollectionFilter('all'); setShowFilterMenu(false); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    collectionFilter === 'all'
                      ? 'bg-purple-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  All
                </button>
                {Object.entries(CARD_TYPE_INFO)
                  .filter(([type]) => ownedTypes.has(type as CardType))
                  .map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => { setCollectionFilter(type as CardType); setShowFilterMenu(false); }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        collectionFilter === type
                          ? 'bg-purple-500 text-white'
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  ))}
              </motion.div>
            );
          })()}
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
                lunarCrystals={state.currencies.lunarCrystals}
                purchasedCryptSlots={state.purchasedCryptSlots}
                onCollect={collectCard}
                onCollectAll={collectAll}
                onRemoveCard={removeCard}
                onBuyCryptSlot={buyCryptSlot}
              />
            )}
            {activeTab === 'collection' && (
              <CollectionPanel
                ownedCards={state.ownedCards}
                config={config}
                cryptSlots={state.cryptSlots}
                currencies={state.currencies}
                filter={collectionFilter}
                sort={collectionSort}
                onPlaceCard={placeCard}
                onSwapCard={swapCard}
                onRemoveCard={removeCard}
                onUpgrade={handleUpgrade}
                onUpgradeFlowNext={handleUpgradeFlowNext}
              />
            )}
            {activeTab === 'shop' && (
              <ShopPanel
                currencies={state.currencies}
                config={config}
                ownedCards={state.ownedCards}
                collectionLevel={state.collectionLevel}
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
                completedExpeditions={state.completedExpeditions}
                lunarCrystals={state.currencies.lunarCrystals}
                onStartExpedition={startExpedition}
                onCollectExpedition={collectExpedition}
                onRushExpedition={rushExpedition}
              />
            )}
            {activeTab === 'grimoire' && (
              <GrimoirePanel
                state={state}
                config={config}
                onCompleteQuest={handleCompleteQuest}
                onClaimWeeklyReward={claimWeeklyReward}
                onClaimLoginStreakReward={claimLoginStreakReward}
                onOpenCLRoad={() => setShowCLRoad(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tutorial Overlay */}
      {!state.tutorialCompleted && (
        <TutorialOverlay
          step={state.tutorialStep}
          onNext={() => {
            if (state.tutorialStep >= TUTORIAL_STEP_COUNT - 1) {
              completeTutorial();
            } else {
              setTutorialStep(state.tutorialStep + 1);
            }
          }}
          onSkip={completeTutorial}
          forceTab={handleTutorialForceTab}
        />
      )}

      {/* CL Road Overlay */}
      <AnimatePresence>
        {showCLRoad && (
          <CLRoadPage
            state={state}
            config={config}
            onClaimReward={handleClaimCLReward}
            onClose={() => {
              setShowCLRoad(false);
              setClRoadAnimation(null);
            }}
            animation={clRoadAnimation ?? undefined}
          />
        )}
      </AnimatePresence>

      {/* Expedition Pack Reward Overlay */}
      <AnimatePresence>
        {state.pendingPackRewards.length > 0 && (
          <PackOpening
            config={config}
            ownedCards={state.ownedCards}
            collectionLevel={state.collectionLevel}
            packId={state.pendingPackRewards[0]}
            onClose={() => dismissPackReward(state.pendingPackRewards[0])}
            onConfirm={(cards, resourceRewards) => {
              openPack(cards, state.pendingPackRewards[0], resourceRewards);
              dismissPackReward(state.pendingPackRewards[0]);
            }}
          />
        )}
      </AnimatePresence>

      {/* New Card Reveal Overlay */}
      <AnimatePresence>
        {revealingCard && (
          <NewCardReveal
            card={revealingCard}
            onDismiss={() => setRevealingCard(null)}
          />
        )}
      </AnimatePresence>

      {/* Reward Reveal Overlay */}
      <AnimatePresence>
        {revealingReward && (
          <RewardReveal
            reward={revealingReward}
            shardTargetCardName={shardTargetCardName ?? undefined}
            onDismiss={() => { setRevealingReward(null); setShardTargetCardName(null); }}
          />
        )}
      </AnimatePresence>

      {/* Quest Reward Reveal Overlay */}
      <AnimatePresence>
        {revealingQuestReward && (
          <QuestRewardReveal
            questDescription={revealingQuestReward.description}
            rewards={revealingQuestReward.rewards}
            shardTargetCardName={shardTargetCardName ?? undefined}
            onDismiss={() => { setRevealingQuestReward(null); setShardTargetCardName(null); }}
          />
        )}
      </AnimatePresence>

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
              <div className="mb-4 p-3 bg-surface-800/30 rounded-lg space-y-2">
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
                  <div className="ml-auto flex items-center gap-1">
                    {isUsingSheets && (
                      <button
                        onClick={disconnect}
                        title="Disconnect from sheets and use local data"
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-surface-400 hover:text-red-400"
                      >
                        <CloudOff className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={refresh} title="Reconnect to sheets" className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {loadReport && !loadReport.cached && loadReport.entries.length > 0 && (
                  <div className="border-t border-purple-500/10 pt-2 space-y-1">
                    <p className="text-xs font-medium text-surface-400 mb-1">
                      Load Report ({loadReport.entries.filter(e => e.source === 'sheets').length}/{loadReport.entries.length} from sheets)
                    </p>
                    {loadReport.entries.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          entry.error ? 'bg-red-400' : entry.source === 'sheets' ? 'bg-green-400' : 'bg-surface-500'
                        }`} />
                        <span className="text-surface-300 flex-1 truncate">{entry.name}</span>
                        {entry.error ? (
                          <span className="text-red-400 truncate max-w-[140px]" title={entry.error}>
                            {entry.error}
                          </span>
                        ) : entry.source === 'sheets' ? (
                          <span className="text-green-400/70">{entry.count}</span>
                        ) : (
                          <span className="text-surface-500">local</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
