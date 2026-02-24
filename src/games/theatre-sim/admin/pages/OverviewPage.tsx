import type { GameState } from '../../types';

interface Props { state: GameState | null }

function StatCard({ label, value, sub, color = 'text-white' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max, label, color = 'bg-amber-500' }: { value: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
        <span>{label}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function OverviewPage({ state }: Props) {
  if (!state) {
    return <div className="text-slate-500 text-sm py-8 text-center">No game data found. Start a game to see the overview.</div>;
  }

  const activeScreens = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId);
  const unlockedScreens = state.theatre.screens.filter(s => s.unlocked);
  const totalStaff = state.staff.length;
  const completedTasks = state.theatre.restorationTasks.filter(t => t.completed).length;
  const totalTasks = state.theatre.restorationTasks.length;
  const unlockedConcessions = state.theatre.concessionMenu.length;
  const ownedFranchises = state.franchiseLocations.filter(f => f.owned).length;
  const totalFranchises = state.franchiseLocations.length;
  const lastReport = state.dailyReports[state.dailyReports.length - 1];
  const loanPct = state.loan.paidOff ? 100 : ((state.loan.principal - state.loan.remaining) / state.loan.principal) * 100;

  return (
    <div className="space-y-6">
      {/* Phase banner */}
      <div className={`rounded-xl border px-4 py-3 ${
        state.phase === 'restoration' ? 'border-orange-500/20 bg-orange-500/5' :
        state.phase === 'expansion' ? 'border-blue-500/20 bg-blue-500/5' :
        'border-purple-500/20 bg-purple-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Current Phase</span>
            <h3 className="text-lg font-bold capitalize">{state.phase}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">Day {state.time.day}</div>
            <div className="text-[10px] text-slate-500">Hour {state.time.hour}:00</div>
          </div>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Cash" value={`$${state.resources.money.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-green-400" />
        <StatCard label="Reputation" value={`${state.resources.reputation.toFixed(1)} / 100`} color="text-amber-400" />
        <StatCard label="Loan Remaining" value={state.loan.paidOff ? 'Paid Off' : `$${state.loan.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={state.loan.paidOff ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Total Revenue" value={`$${state.stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-cyan-400" />
      </div>

      {/* Screens overview */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Screens</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {state.theatre.screens.map(screen => (
            <div
              key={screen.id}
              className={`rounded-lg border px-3 py-2 text-xs ${
                !screen.unlocked
                  ? 'border-slate-800/30 bg-slate-900/30 text-slate-700'
                  : screen.currentMovieId
                  ? 'border-green-500/20 bg-green-500/5 text-green-300'
                  : 'border-slate-700/30 bg-slate-900/50 text-slate-400'
              }`}
            >
              <div className="font-medium">{screen.name}</div>
              <div className="flex justify-between mt-1 text-[10px]">
                <span>{screen.quality}</span>
                <span>Cond: {screen.condition.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>{screen.seats} seats</span>
                <span>${screen.ticketPrice}</span>
              </div>
              {!screen.unlocked && <div className="text-[10px] text-slate-700 mt-1">Locked</div>}
              {screen.upgrading && <div className="text-[10px] text-amber-400 mt-1">Upgrading...</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Progress bars */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Progression</h3>
        <div className="space-y-3 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <ProgressBar label={`Restoration (${completedTasks}/${totalTasks})`} value={completedTasks} max={totalTasks} color="bg-orange-500" />
          <ProgressBar label={`Screens Unlocked (${unlockedScreens.length}/${state.theatre.screens.length})`} value={unlockedScreens.length} max={state.theatre.screens.length} color="bg-blue-500" />
          <ProgressBar label={`Active Screens (${activeScreens.length}/${unlockedScreens.length})`} value={activeScreens.length} max={unlockedScreens.length} color="bg-green-500" />
          <ProgressBar label={`Concessions (${unlockedConcessions} items)`} value={unlockedConcessions} max={18} color="bg-pink-500" />
          <ProgressBar label={`Franchises (${ownedFranchises}/${totalFranchises})`} value={ownedFranchises} max={totalFranchises} color="bg-purple-500" />
          <ProgressBar label={`Loan Repaid`} value={loanPct} max={100} color={state.loan.paidOff ? 'bg-green-500' : 'bg-red-500'} />
          <ProgressBar label={`Reputation`} value={state.resources.reputation} max={100} color="bg-amber-500" />
        </div>
      </section>

      {/* Staff summary */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Staff ({totalStaff})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {['cashier', 'usher', 'projectionist', 'janitor', 'concessions', 'manager'].map(role => {
            const count = state.staff.filter(s => s.role === role).length;
            return (
              <div key={role} className="bg-slate-900/50 border border-slate-800/40 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold">{count}</div>
                <div className="text-[10px] text-slate-500 capitalize">{role === 'concessions' ? 'concession' : role}s</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest daily report */}
      {lastReport && (
        <section>
          <h3 className="text-sm font-semibold mb-3 text-slate-300">Last Daily Report (Day {lastReport.day})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Tickets Sold" value={lastReport.ticketsSold.toString()} />
            <StatCard label="Ticket Revenue" value={`$${lastReport.ticketRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-green-400" />
            <StatCard label="Concession Rev" value={`$${lastReport.concessionRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-pink-400" />
            <StatCard label="Net Profit" value={`$${lastReport.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={lastReport.profit >= 0 ? 'text-green-400' : 'text-red-400'} />
          </div>
        </section>
      )}

      {/* Lifetime stats */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Lifetime Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Tickets" value={state.stats.totalTicketsSold.toLocaleString()} />
          <StatCard label="Total Revenue" value={`$${state.stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <StatCard label="Peak Daily Rev" value={`$${state.stats.peakDailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <StatCard label="Peak Reputation" value={state.stats.peakReputation.toFixed(1)} />
          <StatCard label="Movies Shown" value={state.stats.totalMoviesShown.toLocaleString()} />
          <StatCard label="Staff Hired" value={state.stats.totalStaffHired.toLocaleString()} />
          <StatCard label="Upgrades Bought" value={state.stats.totalUpgradesPurchased.toLocaleString()} />
          <StatCard label="Days Played" value={state.stats.totalDaysPlayed.toLocaleString()} />
        </div>
      </section>
    </div>
  );
}
