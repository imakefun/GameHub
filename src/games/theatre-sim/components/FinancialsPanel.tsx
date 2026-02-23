import type { GameState } from '../types';

interface Props {
  state: GameState;
}

export function FinancialsPanel({ state }: Props) {
  const { financialHistory, stats } = state;
  const latest = financialHistory[financialHistory.length - 1];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Financial Overview</h3>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total Revenue', value: `$${Math.floor(stats.totalRevenue).toLocaleString()}`, color: 'text-green-400' },
          { label: 'Peak Daily', value: `$${Math.floor(stats.peakDailyRevenue).toLocaleString()}`, color: 'text-blue-400' },
          { label: 'Tickets Sold', value: stats.totalTicketsSold.toLocaleString(), color: 'text-amber-400' },
          { label: 'Days Played', value: stats.totalDaysPlayed.toString(), color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's P&L */}
      {latest && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Daily Breakdown (Day {state.time.day})
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ticket Revenue</span>
              <span className="text-green-400">+${latest.ticketRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Concession Revenue</span>
              <span className="text-green-400">+${latest.concessionRevenue.toLocaleString()}</span>
            </div>
            {latest.franchiseRevenue > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Franchise Revenue</span>
                <span className="text-green-400">+${latest.franchiseRevenue.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-700/50 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Staff Costs</span>
                <span className="text-red-400">-${latest.staffCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">License Costs</span>
                <span className="text-red-400">-${latest.licenseCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Maintenance</span>
                <span className="text-red-400">-${latest.maintenanceCosts.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t border-slate-700/50 pt-2">
              <div className="flex justify-between text-base font-bold">
                <span className="text-white">Net Profit</span>
                <span className={latest.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {latest.netProfit >= 0 ? '+' : ''}${Math.floor(latest.netProfit).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit history chart (text-based) */}
      {financialHistory.length > 1 && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Profit History (Last {financialHistory.length} days)
          </h4>
          <div className="flex items-end gap-1 h-24">
            {financialHistory.slice(-20).map((entry, i) => {
              const maxVal = Math.max(1, ...financialHistory.slice(-20).map(e => Math.abs(e.netProfit)));
              const height = Math.abs(entry.netProfit) / maxVal;
              const isProfit = entry.netProfit >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end h-full">
                  <div
                    className={`rounded-t transition-all ${isProfit ? 'bg-green-500/70' : 'bg-red-500/70'}`}
                    style={{ height: `${Math.max(2, height * 100)}%` }}
                    title={`$${Math.floor(entry.netProfit)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>Older</span>
            <span>Recent</span>
          </div>
        </div>
      )}

      {/* Loan Status */}
      <div className={`rounded-xl p-4 border ${
        state.loan.paidOff
          ? 'bg-green-900/10 border-green-800/30'
          : 'bg-slate-800/50 border-slate-700/50'
      }`}>
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          {state.loan.paidOff ? '🎉 Loan — Paid Off!' : '🏦 Loan Status'}
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Original Loan</span>
            <span className="text-white">${state.loan.principal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total Paid</span>
            <span className="text-green-400">${Math.floor(state.loan.totalPaid).toLocaleString()}</span>
          </div>
          {!state.loan.paidOff && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Remaining</span>
                <span className="text-red-400">${Math.floor(state.loan.remaining).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Daily Payment</span>
                <span className="text-amber-400">${state.loan.dailyPayment}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Interest Rate</span>
                <span className="text-slate-300">{(state.loan.interestRate * 100).toFixed(1)}% APR</span>
              </div>
            </>
          )}
          <div className="pt-1">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  state.loan.paidOff ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 via-amber-500 to-green-500'
                }`}
                style={{ width: `${state.loan.paidOff ? 100 : ((state.loan.principal - state.loan.remaining) / state.loan.principal) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-center">
              {state.loan.paidOff
                ? 'The Starlight is yours, free and clear!'
                : `${(((state.loan.principal - state.loan.remaining) / state.loan.principal) * 100).toFixed(1)}% paid off`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Game stats */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Lifetime Statistics
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ['Movies Licensed', stats.totalMoviesShown],
            ['Staff Hired', stats.totalStaffHired],
            ['Upgrades Purchased', stats.totalUpgradesPurchased],
            ['Peak Reputation', Math.floor(stats.peakReputation)],
            ['Franchises Owned', stats.franchisesOwned],
            ['Concessions Sold', stats.totalConcessionsSold],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-slate-500">{label}</span>
              <span className="text-white">{(value as number).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {!latest && (
        <p className="text-sm text-slate-500 text-center py-6">
          Financial data will appear once the theatre is open and operating.
        </p>
      )}
    </div>
  );
}
