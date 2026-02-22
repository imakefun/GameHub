import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import {
  RestorationPanel,
  ScreensPanel,
  StaffPanel,
  MoviesPanel,
  ConcessionsPanel,
  UpgradesPanel,
  FinancialsPanel,
  FranchisePanel,
} from './components';

type Tab = 'restoration' | 'screens' | 'staff' | 'movies' | 'concessions' | 'upgrades' | 'financials' | 'franchise';

interface TabDef {
  id: Tab;
  label: string;
  icon: string;
  phase: ('restoration' | 'expansion' | 'franchise')[];
}

const allTabs: TabDef[] = [
  { id: 'restoration', label: 'Restore', icon: '🔨', phase: ['restoration'] },
  { id: 'screens', label: 'Screens', icon: '📽️', phase: ['expansion', 'franchise'] },
  { id: 'movies', label: 'Movies', icon: '🎬', phase: ['expansion', 'franchise'] },
  { id: 'staff', label: 'Staff', icon: '👥', phase: ['restoration', 'expansion', 'franchise'] },
  { id: 'concessions', label: 'Food', icon: '🍿', phase: ['expansion', 'franchise'] },
  { id: 'upgrades', label: 'Upgrades', icon: '⬆️', phase: ['expansion', 'franchise'] },
  { id: 'financials', label: 'Finance', icon: '📊', phase: ['expansion', 'franchise'] },
  { id: 'franchise', label: 'Empire', icon: '🏢', phase: ['franchise'] },
];

const phaseLabels = {
  restoration: { label: 'Restoration', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  expansion: { label: 'Expansion', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  franchise: { label: 'Empire', color: 'text-purple-400', bg: 'bg-purple-900/20' },
};

export function TheatreSim() {
  const {
    state,
    startRestoration,
    assignMovie,
    removeMovie,
    setTicketPrice,
    upgradeScreen,
    unlockScreen,
    repairScreen,
    hireStaff,
    fireStaff,
    licenseMovie,
    dropMovie,
    unlockConcession,
    upgradeConcessionStand,
    purchaseUpgrade,
    purchaseFranchise,
    assignFranchiseManager,
    dismissMessage,
    resetGame,
    getUnlockScreenCost,
    getRepairCost,
  } = useGameState();

  const availableTabs = allTabs.filter(t => t.phase.includes(state.phase));
  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0]?.id ?? 'restoration');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // If current tab isn't available in this phase, switch to first available
  if (!availableTabs.find(t => t.id === activeTab)) {
    const newTab = availableTabs[0]?.id ?? 'restoration';
    if (newTab !== activeTab) setActiveTab(newTab);
  }

  const phase = phaseLabels[state.phase];
  const recentMessages = state.messageLog.slice(-5).reverse();
  const unreadCount = state.messageLog.filter(m => m.type === 'milestone' || m.type === 'success').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header row */}
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <Link
                to="/games"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <h1 className="text-sm font-bold text-white hidden sm:block">Starlight Cinema</h1>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${phase.color} ${phase.bg}`}>
                {phase.label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Resources */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-400 font-medium">
                  💰 ${Math.floor(state.resources.money).toLocaleString()}
                </span>
                <span className="text-blue-400 font-medium">
                  ⭐ {Math.floor(state.resources.reputation)}
                </span>
                <span className="text-slate-400 text-xs">
                  Day {state.time.day} • {state.time.hour > 12 ? `${state.time.hour - 12}pm` : state.time.hour === 12 ? '12pm' : `${state.time.hour}am`}
                </span>
              </div>

              {/* Messages */}
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="relative text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-lg">📋</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] flex items-center justify-center">
                    {Math.min(unreadCount, 9)}
                  </span>
                )}
              </button>

              {/* Reset */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Reset game"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active events banner */}
          {state.activeEvents.length > 0 && (
            <div className="pb-2">
              {state.activeEvents.map(event => (
                <div
                  key={event.id}
                  className="text-xs bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5"
                >
                  <span>{event.icon}</span>
                  <span>{event.title}</span>
                  <span className="text-amber-400/60">({event.duration - (state.time.day - event.startDay)}d left)</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages panel (slide-out) */}
      {showMessages && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMessages(false)} />
          <div className="relative w-80 max-w-full bg-slate-900 border-l border-slate-800 overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Event Log</h3>
              <button onClick={() => setShowMessages(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {state.messageLog.slice().reverse().map(msg => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg text-sm ${
                    msg.type === 'milestone' ? 'bg-amber-900/20 border border-amber-800/30' :
                    msg.type === 'success' ? 'bg-green-900/20 border border-green-800/30' :
                    msg.type === 'warning' ? 'bg-red-900/20 border border-red-800/30' :
                    'bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{msg.icon}</span>
                    <div>
                      <p className="text-slate-300 text-xs">{msg.text}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Day {msg.day}</p>
                    </div>
                  </div>
                </div>
              ))}
              {state.messageLog.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No events yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Latest messages toast */}
        {recentMessages.length > 0 && recentMessages[0].type !== 'info' && (
          <div className="mb-4">
            <div
              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                recentMessages[0].type === 'milestone'
                  ? 'bg-amber-900/20 border border-amber-800/30 text-amber-200'
                  : recentMessages[0].type === 'success'
                  ? 'bg-green-900/20 border border-green-800/30 text-green-200'
                  : 'bg-slate-800/50 text-slate-300'
              }`}
            >
              <span>{recentMessages[0].icon}</span>
              <span className="flex-1">{recentMessages[0].text}</span>
              <button
                onClick={() => dismissMessage(recentMessages[0].id)}
                className="text-slate-400 hover:text-white ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'restoration' && (
          <RestorationPanel
            tasks={state.theatre.restorationTasks}
            money={state.resources.money}
            time={state.time}
            onStartTask={startRestoration}
          />
        )}
        {activeTab === 'screens' && (
          <ScreensPanel
            screens={state.theatre.screens}
            currentMovies={state.currentMovies}
            money={state.resources.money}
            day={state.time.day}
            onAssignMovie={assignMovie}
            onRemoveMovie={removeMovie}
            onSetTicketPrice={setTicketPrice}
            onUpgradeScreen={upgradeScreen}
            onUnlockScreen={unlockScreen}
            onRepairScreen={repairScreen}
            getUnlockCost={getUnlockScreenCost}
            getRepairCost={getRepairCost}
          />
        )}
        {activeTab === 'staff' && (
          <StaffPanel
            staff={state.staff}
            onHire={hireStaff}
            onFire={fireStaff}
          />
        )}
        {activeTab === 'movies' && (
          <MoviesPanel
            state={state}
            onLicenseMovie={licenseMovie}
            onDropMovie={dropMovie}
          />
        )}
        {activeTab === 'concessions' && (
          <ConcessionsPanel
            state={state}
            onUnlockItem={unlockConcession}
            onUpgradeStand={upgradeConcessionStand}
          />
        )}
        {activeTab === 'upgrades' && (
          <UpgradesPanel
            state={state}
            onPurchaseUpgrade={purchaseUpgrade}
          />
        )}
        {activeTab === 'financials' && (
          <FinancialsPanel state={state} />
        )}
        {activeTab === 'franchise' && (
          <FranchisePanel
            state={state}
            onPurchaseFranchise={purchaseFranchise}
            onAssignManager={assignFranchiseManager}
          />
        )}
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Reset Game?</h3>
            <p className="text-sm text-slate-400 mb-4">
              This will erase all progress and start from scratch. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetGame(); setShowResetConfirm(false); }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm font-medium"
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
