import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, X, Menu } from 'lucide-react';
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
  ReviewsPanel,
  Cutscene,
} from './components';
import { cutscenes } from './data';
import { getDayNameShort } from './types';

type Tab = 'restoration' | 'screens' | 'staff' | 'movies' | 'concessions' | 'upgrades' | 'financials' | 'reviews' | 'franchise';

interface TabDef {
  id: Tab;
  label: string;
  icon: string;
  description: string;
  phase: ('restoration' | 'expansion' | 'franchise')[];
}

const allTabs: TabDef[] = [
  { id: 'restoration', label: 'Restore', icon: '🔨', description: 'Repair and restore the theatre', phase: ['restoration'] },
  { id: 'screens', label: 'Screens', icon: '📽️', description: 'Manage auditoriums & showtimes', phase: ['expansion', 'franchise'] },
  { id: 'movies', label: 'Movies', icon: '🎬', description: 'License films to show', phase: ['expansion', 'franchise'] },
  { id: 'staff', label: 'Staff', icon: '👥', description: 'Hire and manage employees', phase: ['restoration', 'expansion', 'franchise'] },
  { id: 'concessions', label: 'Concessions', icon: '🍿', description: 'Food, drinks & combos', phase: ['expansion', 'franchise'] },
  { id: 'upgrades', label: 'Upgrades', icon: '⬆️', description: 'Improve your theatre', phase: ['expansion', 'franchise'] },
  { id: 'reviews', label: 'Reviews', icon: '⭐', description: 'Customer ratings & feedback', phase: ['expansion', 'franchise'] },
  { id: 'financials', label: 'Financials', icon: '📊', description: 'Revenue, expenses & loan', phase: ['expansion', 'franchise'] },
  { id: 'franchise', label: 'Empire', icon: '🏢', description: 'Expand to new locations', phase: ['franchise'] },
];

const phaseLabels = {
  restoration: { label: 'Restoration', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800/30' },
  expansion: { label: 'Expansion', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/30' },
  franchise: { label: 'Empire', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-800/30' },
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
    completeCutscene,
    resetGame,
    getUnlockScreenCost,
    getRepairCost,
  } = useGameState();

  const availableTabs = allTabs.filter(t => t.phase.includes(state.phase));
  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0]?.id ?? 'restoration');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // If current tab isn't available in this phase, switch to first available
  if (!availableTabs.find(t => t.id === activeTab)) {
    const newTab = availableTabs[0]?.id ?? 'restoration';
    if (newTab !== activeTab) setActiveTab(newTab);
  }

  const phase = phaseLabels[state.phase];
  const recentMessages = state.messageLog.slice(-5).reverse();
  const unreadCount = state.messageLog.filter(m => m.type === 'milestone' || m.type === 'success').length;

  // Active cutscene
  const activeCutsceneData = state.activeCutscene
    ? cutscenes.find(c => c.id === state.activeCutscene)
    : null;

  // Cutscene fade-to-black state machine
  // hidden → fadingToBlack → cutscenePlaying → fadingFromBlack → hidden
  const [cutscenePhase, setCutscenePhase] = useState<
    'hidden' | 'fadingToBlack' | 'cutscenePlaying' | 'fadingFromBlack'
  >(activeCutsceneData ? 'cutscenePlaying' : 'hidden');
  const prevCutsceneId = useRef(state.activeCutscene);

  // Detect when a new cutscene is triggered → fade to black first
  useEffect(() => {
    if (state.activeCutscene && state.activeCutscene !== prevCutsceneId.current) {
      prevCutsceneId.current = state.activeCutscene;
      setCutscenePhase('fadingToBlack');
      const t = setTimeout(() => setCutscenePhase('cutscenePlaying'), 600);
      return () => clearTimeout(t);
    }
    // Handle initial load with an active cutscene
    if (state.activeCutscene && prevCutsceneId.current === state.activeCutscene && cutscenePhase === 'hidden') {
      prevCutsceneId.current = state.activeCutscene;
      setCutscenePhase('fadingToBlack');
      const t = setTimeout(() => setCutscenePhase('cutscenePlaying'), 600);
      return () => clearTimeout(t);
    }
  }, [state.activeCutscene, cutscenePhase]);

  const handleCutsceneComplete = () => {
    const id = state.activeCutscene;
    // Fade cutscene to black, then dismiss and fade back to game
    setCutscenePhase('fadingFromBlack');
    setTimeout(() => {
      if (id) completeCutscene(id);
      prevCutsceneId.current = null;
      // Small delay to let the game render underneath before fading in
      setTimeout(() => setCutscenePhase('hidden'), 50);
    }, 600);
  };

  const showBlackOverlay = cutscenePhase === 'fadingToBlack' || cutscenePhase === 'fadingFromBlack';
  const showCutscene = cutscenePhase === 'cutscenePlaying' && activeCutsceneData;

  // Loan progress
  const loanProgress = state.loan.paidOff
    ? 100
    : ((state.loan.principal - state.loan.remaining) / state.loan.principal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Fade-to-black overlay */}
      <div
        className={`fixed inset-0 z-[99] bg-black pointer-events-none transition-opacity duration-500 ${
          showBlackOverlay ? 'opacity-100' : cutscenePhase === 'cutscenePlaying' ? 'opacity-0' : 'opacity-0'
        }`}
        style={{ display: cutscenePhase === 'hidden' ? 'none' : undefined }}
      />

      {/* Active Cutscene Overlay */}
      {showCutscene && (
        <Cutscene
          sequence={activeCutsceneData}
          onComplete={handleCutsceneComplete}
        />
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header row */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                to="/games"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎭</span>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-bold text-white leading-tight">Starlight Cinema</h1>
                  <span className={`text-[10px] font-medium ${phase.color}`}>
                    {phase.label} Phase
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Resources */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-green-400 font-bold text-sm">
                  ${Math.floor(state.resources.money).toLocaleString()}
                </span>
                {!state.loan.paidOff && (
                  <span className="text-[9px] text-red-400/70">
                    Loan: ${Math.floor(state.loan.remaining).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex flex-col items-center">
                <span className="text-blue-400 font-medium text-sm">
                  ⭐ {Math.floor(state.resources.reputation)}
                </span>
                <span className="text-[9px] text-slate-500">rep</span>
              </div>
              {state.overallRating > 0 && state.reviews.length > 0 && (
                <>
                  <div className="w-px h-6 bg-slate-700" />
                  <div className="flex flex-col items-center">
                    <span className="text-yellow-400 font-medium text-sm">
                      {state.overallRating.toFixed(1)}★
                    </span>
                    <span className="text-[9px] text-slate-500">rating</span>
                  </div>
                </>
              )}
              <div className="w-px h-6 bg-slate-700 hidden sm:block" />
              <span className="text-slate-400 text-xs hidden sm:block">
                {getDayNameShort(state.time.day)} Day {state.time.day} • {state.time.hour > 12 ? `${state.time.hour - 12}pm` : state.time.hour === 12 ? '12pm' : `${state.time.hour}am`}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Messages */}
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <span className="text-lg">📋</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full text-[7px] flex items-center justify-center font-bold">
                    {Math.min(unreadCount, 9)}
                  </span>
                )}
              </button>

              {/* Nav menu toggle */}
              <button
                onClick={() => setShowNav(!showNav)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loan progress bar (compact) */}
          {!state.loan.paidOff && (
            <div className="pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 w-8">Loan</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${loanProgress}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 w-10 text-right">{loanProgress.toFixed(1)}%</span>
              </div>
            </div>
          )}

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

          {/* Inline tab bar (horizontal scroll on mobile) */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowNav(false); }}
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

      {/* Navigation sidebar (slide-out) */}
      {showNav && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNav(false)} />
          <div className="relative w-72 max-w-full bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎭</span>
                <h3 className="text-sm font-bold text-white">Navigation</h3>
              </div>
              <button onClick={() => setShowNav(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Game info */}
            <div className="p-4 border-b border-slate-800/50">
              <div className={`rounded-lg p-3 ${phase.bg} border ${phase.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${phase.color}`}>
                    {phase.label} Phase
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Day {state.time.day} • {state.time.hour > 12 ? `${state.time.hour - 12}pm` : state.time.hour === 12 ? '12pm' : `${state.time.hour}am`}
                </p>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Cash</span>
                  <span className="text-green-400 font-medium">${Math.floor(state.resources.money).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Reputation</span>
                  <span className="text-blue-400 font-medium">{Math.floor(state.resources.reputation)}/100</span>
                </div>
                {!state.loan.paidOff && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Loan Remaining</span>
                    <span className="text-red-400 font-medium">${Math.floor(state.loan.remaining).toLocaleString()}</span>
                  </div>
                )}
                {state.loan.paidOff && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Loan</span>
                    <span className="text-green-400 font-medium">Paid Off!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation links */}
            <div className="p-3 flex-1">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium px-2 mb-2">Manage</p>
              <div className="space-y-0.5">
                {availableTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setShowNav(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-700/80 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-lg w-6 text-center">{tab.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{tab.label}</p>
                      <p className="text-[10px] text-slate-500">{tab.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="p-4 border-t border-slate-800/50 space-y-2">
              <button
                onClick={() => { setShowResetConfirm(true); setShowNav(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-900/10 transition-all text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Game</span>
              </button>
              <Link
                to="/games"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to GameHub</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Messages panel (slide-out) */}
      {showMessages && (
        <div className="fixed inset-0 z-[60] flex justify-end">
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
            licensedMovies={state.licensedMovies}
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
        {activeTab === 'reviews' && (
          <ReviewsPanel state={state} />
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Reset Game?</h3>
            <p className="text-sm text-slate-400 mb-4">
              This will erase all progress and start from scratch. This cannot be undone.
              You'll see the opening cutscene again.
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
