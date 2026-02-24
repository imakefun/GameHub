import type { GameState } from '../../types';

interface Props { state: GameState | null }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold mb-3 text-slate-300">{title}</h3>
      {children}
    </section>
  );
}

function KV({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-800/30 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium ${color ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

/** Simple horizontal bar for proportional comparison */
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-500 w-28 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-4 bg-slate-800/60 rounded-full overflow-hidden relative">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white/70 font-medium">
          ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}

export function EconomyPage({ state }: Props) {
  if (!state) {
    return <div className="text-slate-500 text-sm py-8 text-center">No game data found.</div>;
  }

  const reports = state.dailyReports;
  const last30 = reports.slice(-30);

  // Revenue breakdown from financial history
  const latestFinancial = state.financialHistory[state.financialHistory.length - 1];

  // Loan stats
  const loan = state.loan;
  const loanPaid = loan.totalPaid;
  const principalPaid = loan.principal - loan.remaining;
  const interestPaid = loanPaid - principalPaid;
  const daysToPayoff = loan.paidOff ? 0 : Math.ceil(loan.remaining / (loan.dailyPayment - (loan.remaining * loan.interestRate / 365)));

  // Aggregate last 30 days
  const totalRev30 = last30.reduce((s, r) => s + r.totalRevenue, 0);
  const totalExp30 = last30.reduce((s, r) => s + r.expenses, 0);
  const totalProfit30 = last30.reduce((s, r) => s + r.profit, 0);
  const avgDailyRev = last30.length > 0 ? totalRev30 / last30.length : 0;
  const avgDailyExp = last30.length > 0 ? totalExp30 / last30.length : 0;

  // Chart: profit history (last 30 days as text bar chart)
  const maxAbsProfit = last30.length > 0 ? Math.max(...last30.map(r => Math.abs(r.profit)), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Key Constants */}
      <Section title="Economy Constants">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6">
          <KV label="Starting Cash" value="$100,000" color="text-green-400" />
          <KV label="Loan Principal" value="$600,000" color="text-red-400" />
          <KV label="Loan Interest Rate" value="8% APR" />
          <KV label="Daily Loan Payment" value="$500" />
          <KV label="Tick Interval" value="1,000ms" />
          <KV label="Hours per Tick" value="1" />
          <KV label="Base Customer Rate" value="8 per showtime" />
          <KV label="Maint. per Screen" value="$50/day" />
          <KV label="Concession Stand Upgrade" value="$1,000" />
        </div>
      </Section>

      {/* Current Financial Snapshot */}
      <Section title="Current Snapshot">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Cash on Hand</div>
            <div className="text-lg font-bold text-green-400">${state.resources.money.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Daily Revenue</div>
            <div className="text-lg font-bold text-cyan-400">${avgDailyRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Daily Expenses</div>
            <div className="text-lg font-bold text-red-400">${avgDailyExp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">30-Day Profit</div>
            <div className={`text-lg font-bold ${totalProfit30 >= 0 ? 'text-green-400' : 'text-red-400'}`}>${totalProfit30.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </Section>

      {/* Revenue Breakdown */}
      {latestFinancial && (
        <Section title="Latest Revenue / Expense Breakdown">
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Revenue</div>
            <HBar label="Tickets" value={latestFinancial.ticketRevenue} max={latestFinancial.totalRevenue || 1} color="bg-green-500" />
            <HBar label="Concessions" value={latestFinancial.concessionRevenue} max={latestFinancial.totalRevenue || 1} color="bg-pink-500" />
            <HBar label="Franchise" value={latestFinancial.franchiseRevenue} max={latestFinancial.totalRevenue || 1} color="bg-purple-500" />
            <div className="border-t border-slate-800/40 pt-2 mt-3">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Expenses</div>
              <HBar label="Staff Wages" value={latestFinancial.staffCosts} max={latestFinancial.totalExpenses || 1} color="bg-red-500" />
              <HBar label="Movie Licenses" value={latestFinancial.licenseCosts} max={latestFinancial.totalExpenses || 1} color="bg-orange-500" />
              <HBar label="Maintenance" value={latestFinancial.maintenanceCosts} max={latestFinancial.totalExpenses || 1} color="bg-yellow-500" />
            </div>
            <div className="border-t border-slate-800/40 pt-2 mt-2 flex justify-between text-xs font-semibold">
              <span className="text-green-400">Revenue: ${latestFinancial.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-red-400">Expenses: ${latestFinancial.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className={latestFinancial.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                Net: ${latestFinancial.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </Section>
      )}

      {/* Loan Status */}
      <Section title="Loan Status">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6">
            <KV label="Principal" value={`$${loan.principal.toLocaleString()}`} />
            <KV label="Remaining" value={loan.paidOff ? 'Paid Off' : `$${loan.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={loan.paidOff ? 'text-green-400' : 'text-red-400'} />
            <KV label="Total Paid" value={`$${loanPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <KV label="Interest Paid" value={`$${interestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-orange-400" />
            <KV label="Principal Repaid" value={`$${principalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-cyan-400" />
            <KV label="Daily Payment" value={`$${loan.dailyPayment}`} />
            <KV label="Est. Days to Payoff" value={loan.paidOff ? '—' : daysToPayoff.toLocaleString()} />
            <KV label="Status" value={loan.paidOff ? 'PAID OFF' : 'Active'} color={loan.paidOff ? 'text-green-400' : 'text-amber-400'} />
          </div>
          {/* Loan progress bar */}
          <div className="mt-3">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${loan.paidOff ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-amber-500'}`}
                style={{ width: `${loan.paidOff ? 100 : (principalPaid / loan.principal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 mt-1">
              <span>$0</span>
              <span>${(loan.principal / 2).toLocaleString()}</span>
              <span>${loan.principal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Daily Profit History (text chart) */}
      {last30.length > 0 && (
        <Section title={`Daily Profit — Last ${last30.length} Days`}>
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-0.5">
            {last30.map(report => {
              const pct = (report.profit / maxAbsProfit) * 50; // 50% = max bar width
              const isPositive = report.profit >= 0;
              return (
                <div key={report.day} className="flex items-center gap-2 h-5">
                  <span className="text-[9px] text-slate-600 w-10 text-right shrink-0">D{report.day}</span>
                  <div className="flex-1 flex items-center h-3">
                    {/* center line at 50% */}
                    <div className="relative w-full h-full">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700" />
                      {isPositive ? (
                        <div
                          className="absolute top-0 h-full bg-green-500/60 rounded-r"
                          style={{ left: '50%', width: `${Math.abs(pct)}%` }}
                        />
                      ) : (
                        <div
                          className="absolute top-0 h-full bg-red-500/60 rounded-l"
                          style={{ right: '50%', width: `${Math.abs(pct)}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] w-16 text-right shrink-0 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ${report.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Screen ticket pricing */}
      <Section title="Screen Quality → Ticket Price Multipliers">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left">
                <th className="py-1 font-medium">Quality</th>
                <th className="py-1 font-medium">Multiplier</th>
                <th className="py-1 font-medium">Base $8 → Effective</th>
              </tr>
            </thead>
            <tbody>
              {([['Basic', 1.0], ['Standard', 1.3], ['Premium', 1.8], ['IMAX', 2.5], ['Dolby', 2.8]] as const).map(([name, mult]) => (
                <tr key={name} className="border-t border-slate-800/30">
                  <td className="py-1.5 text-slate-300">{name}</td>
                  <td className="py-1.5 text-amber-400">×{mult}</td>
                  <td className="py-1.5 text-green-400">${(8 * mult).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
