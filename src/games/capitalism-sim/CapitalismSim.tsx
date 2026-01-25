// Late Stage Capitalism Simulator - Main Game Component

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Briefcase,
  BookOpen,
  BarChart3,
  RefreshCw,
  HelpCircle,
  X
} from 'lucide-react';
import { GameDataProvider, useGameData } from './context/GameDataContext';
import { useGameState } from './hooks/useGameState';
import {
  ResourceBar,
  PortfolioPanel,
  TargetsPanel,
  EventModal,
  NewsTicker,
  StatsPanel,
} from './components';
import { tips } from './data/settings';

type TabId = 'portfolio' | 'targets' | 'stats';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'targets', label: 'Acquisitions', icon: <Target className="w-5 h-5" /> },
  { id: 'stats', label: 'Statistics', icon: <BarChart3 className="w-5 h-5" /> },
];

function LoadingScreen() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-6">💰</div>
        <h1 className="text-2xl font-bold text-primary-400 mb-2">Late Stage Capitalism Simulator</h1>
        <p className="text-surface-400 mb-8">Loading the PE playbook...</p>
        <div className="w-48 h-2 bg-surface-700 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <p className="text-sm text-surface-500 mt-8 max-w-md italic">"{randomTip}"</p>
      </motion.div>
    </div>
  );
}

function TutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface-800 rounded-xl border border-surface-700 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-surface-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Welcome to Private Equity</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-primary-400 mb-2">Your Mission</h3>
            <p className="text-surface-300">
              You are the managing partner of <strong>Vulture Capital Partners</strong>. Your job is to
              acquire struggling companies, extract as much value as possible, and either sell them
              for a profit or let them collapse into bankruptcy.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary-400 mb-2">How to Play</h3>
            <ul className="space-y-3 text-surface-300">
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span><strong>Acquire Companies:</strong> Browse available targets and make acquisition offers. Use debt financing to leverage your capital.</span>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span><strong>Execute Strategies:</strong> Apply PE tactics like layoffs, debt loading, dividend recaps, and asset stripping to extract value.</span>
              </li>
              <li className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong>Manage Portfolio:</strong> Monitor your companies' health. Sell them for profit or let them go bankrupt when you've extracted enough.</span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span><strong>Track Progress:</strong> Watch your statistics grow. Earn achievements for your "accomplishments."</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-900 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-surface-400">
              <li>• Use debt to acquire companies - the company pays for itself!</li>
              <li>• Layoffs boost short-term profits but hurt morale and brand value</li>
              <li>• Sale-leasebacks provide instant cash but increase long-term costs</li>
              <li>• Keep an eye on your reputation - too low and deals get harder</li>
              <li>• Random events can help or hurt - respond wisely</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
            >
              Start Extracting Value
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GameContent() {
  const { companies, strategies, events, settings, isLoading, error, refresh } = useGameData();
  const gameState = useGameState({ companies, strategies, events, settings });
  const {
    state,
    makeOffer,
    cancelDeal,
    sellCompany,
    declareBankruptcy,
    handleEventChoice,
    dismissEvent,
    completeTutorial,
    resetGame,
    refreshTargets,
    loadDebt,
    takeDividend,
    reduceWorkforce,
    cutQuality,
    sellAssets,
    extractFees,
    saleLeaseback,
    maxDebtPercent,
  } = gameState;

  // Bundle management actions for the portfolio panel
  const managementActions = {
    loadDebt,
    takeDividend,
    reduceWorkforce,
    cutQuality,
    sellAssets,
    extractFees,
    saleLeaseback,
  };

  const [activeTab, setActiveTab] = useState<TabId>('targets');
  const [showTutorial, setShowTutorial] = useState(!state.tutorialCompleted);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-400 mb-2">Error Loading Game</h1>
        <p className="text-surface-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Resource Bar */}
      <ResourceBar
        fund={state.fund}
        stats={state.stats}
        currentMonth={state.currentMonth}
        currentYear={state.currentYear}
        portfolioSize={state.portfolio.length}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 bg-surface-850 border-r border-surface-700 p-4">
          <div className="flex lg:flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors flex-1 lg:flex-none ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-surface-700 text-surface-400'
                }`}
              >
                {tab.icon}
                <span className="hidden lg:inline font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* News Ticker (Desktop) */}
          <div className="hidden lg:block mt-6">
            <NewsTicker news={state.newsHistory} />
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex flex-col gap-2 mt-6 pt-6 border-t border-surface-700">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Game
            </button>
          </div>
        </nav>

        {/* Main Panel */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'portfolio' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Portfolio Companies</h2>
                  <PortfolioPanel
                    portfolio={state.portfolio}
                    onSellCompany={sellCompany}
                    onDeclareBankruptcy={declareBankruptcy}
                    managementActions={managementActions}
                  />
                </div>
              )}

              {activeTab === 'targets' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Acquisition Targets</h2>
                  <TargetsPanel
                    targets={state.availableTargets}
                    pendingDeals={state.pendingDeals}
                    capital={state.fund.capital}
                    maxDebtPercent={maxDebtPercent}
                    onMakeOffer={makeOffer}
                    onCancelDeal={cancelDeal}
                    onRefreshTargets={refreshTargets}
                  />
                </div>
              )}

              {activeTab === 'stats' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Fund Statistics</h2>
                  <StatsPanel stats={state.stats} fund={state.fund} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* News Ticker (Mobile) */}
        <div className="lg:hidden p-4 border-t border-surface-700">
          <NewsTicker news={state.newsHistory} />
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        activeEvent={state.activeEvent}
        portfolio={state.portfolio}
        onChoice={handleEventChoice}
        onDismiss={dismissEvent}
      />

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-surface-800 rounded-xl border border-surface-700 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Reset Game?</h3>
              <p className="text-surface-400 mb-6">
                This will erase all progress and start a new fund. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResetConfirm(false);
                    setShowTutorial(true);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CapitalismSim() {
  return (
    <GameDataProvider>
      <GameContent />
    </GameDataProvider>
  );
}
