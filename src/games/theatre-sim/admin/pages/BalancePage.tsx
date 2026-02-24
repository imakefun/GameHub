import type { GameState } from '../../types';
import { concessionItems, theatreUpgrades, screenUpgrades, franchiseLocations, restorationTasks, OPENING_REQUIREMENTS } from '../../data';

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

export function BalancePage({ state }: Props) {
  // Core economy constants
  const LOAN_PRINCIPAL = 600000;
  const LOAN_DAILY_PAYMENT = 500;
  const LOAN_INTEREST_RATE = 0.08;
  const BASE_CUSTOMER_RATE = 8;
  const MAINT_PER_SCREEN = 50;

  // Restoration costs
  const requiredRestorationCost = OPENING_REQUIREMENTS.reduce((s, id) => {
    const task = restorationTasks.find(t => t.id === id);
    return s + (task?.cost ?? 0);
  }, 0);
  const allRestorationCost = restorationTasks.reduce((s, t) => s + t.cost, 0);

  // Screen unlock costs
  const screenUnlockCosts = [0, 5000, 12000, 20000, 35000, 50000];
  const allScreenUnlockCost = screenUnlockCosts.reduce((s, c) => s + c, 0);

  // Total upgrade costs
  const allTheatreUpgradeCost = theatreUpgrades.reduce((s, u) => s + u.cost, 0);
  const allScreenUpgradeCost = screenUpgrades.reduce((s, u) => s + u.cost, 0);

  // Concession unlock costs
  const allConcessionUnlockCost = concessionItems.reduce((s, c) => s + c.unlockCost, 0);

  // Franchise costs
  const allFranchiseCost = franchiseLocations.reduce((s, l) => s + l.purchaseCost, 0);

  // Grand total to "beat" the game
  const totalGameCost = allRestorationCost + allScreenUnlockCost + allTheatreUpgradeCost
    + (allScreenUpgradeCost * 6) + allConcessionUnlockCost + allFranchiseCost + LOAN_PRINCIPAL;

  // Revenue simulation: early game (1 screen, basic, 1 movie)
  const earlyDailyTickets = BASE_CUSTOMER_RATE * 3; // 3 showtimes
  const earlyTicketRev = earlyDailyTickets * 8; // $8 base price
  const earlyConcessionRev = earlyDailyTickets * 0.4 * 3.5; // 40% buy rate × avg price
  const earlyStaffCost = 80 + 120 + 65; // cashier + projectionist + janitor
  const earlyLicenseCost = 200 / 7; // cheapest movie per day
  const earlyDailyNet = earlyTicketRev + earlyConcessionRev - earlyStaffCost - earlyLicenseCost - MAINT_PER_SCREEN - LOAN_DAILY_PAYMENT;

  // Revenue simulation: mid game (3 screens, 1 standard, decent movies)
  const midCustomersPerShow = BASE_CUSTOMER_RATE * 1.3; // 65 pop movie / 50
  const midDailyTickets = midCustomersPerShow * 3 * 3; // 3 screens × 3 showtimes
  const midTicketRev = midDailyTickets * 10; // ~$10 avg price
  const midConcessionRev = midDailyTickets * 0.5 * 5; // 50% buy rate
  const midStaffCost = (80 * 2) + (120 * 3) + (65 * 2) + (75 * 2) + 200; // full team
  const midLicenseCost = (500 + 400 + 450) / 7;
  const midDailyNet = midTicketRev + midConcessionRev - midStaffCost - midLicenseCost - (MAINT_PER_SCREEN * 3) - LOAN_DAILY_PAYMENT;

  // Revenue simulation: late game (6 screens, premium+, blockbusters)
  const lateCustomersPerShow = BASE_CUSTOMER_RATE * 1.8 * 1.8; // premium × high pop
  const lateDailyTickets = lateCustomersPerShow * 3 * 6;
  const lateTicketRev = lateDailyTickets * 14; // ~$14 premium
  const lateConcessionRev = lateDailyTickets * 0.6 * 7; // 60% buy rate
  const lateStaffCost = (80 * 3) + (120 * 6) + (65 * 3) + (75 * 3) + (200 * 2) + (70 * 3);
  const lateLicenseCost = (1200 + 1400 + 1600 + 1100 + 1000 + 800) / 7;
  const franchiseRev = franchiseLocations.reduce((s, l) => s + l.screens * 400, 0);
  const franchiseExp = franchiseLocations.reduce((s, l) => s + l.dailyExpenses, 0);
  const lateDailyNet = lateTicketRev + lateConcessionRev + franchiseRev - lateStaffCost - lateLicenseCost - (MAINT_PER_SCREEN * 6) - franchiseExp;

  // Loan payoff estimate
  const dailyInterest = (LOAN_PRINCIPAL * LOAN_INTEREST_RATE) / 365;
  const netDailyPrincipal = LOAN_DAILY_PAYMENT - dailyInterest;
  const estimatedPayoffDays = Math.ceil(LOAN_PRINCIPAL / netDailyPrincipal);

  // Actual game progress
  const actualDay = state?.time.day ?? 0;
  const actualMoney = state?.resources.money ?? 0;
  const actualRep = state?.resources.reputation ?? 0;

  return (
    <div className="space-y-6">
      {/* Total Cost Breakdown */}
      <Section title="Total Game Cost Breakdown">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
          {[
            ['Restoration (all tasks)', allRestorationCost, 'text-orange-400'],
            ['Restoration (required only)', requiredRestorationCost, 'text-orange-300'],
            ['Screen Unlocks (all 6)', allScreenUnlockCost, 'text-blue-400'],
            ['Theatre Upgrades', allTheatreUpgradeCost, 'text-purple-400'],
            ['Screen Upgrades (all 6 to premium)', allScreenUpgradeCost * 6, 'text-cyan-400'],
            ['Concession Unlocks', allConcessionUnlockCost, 'text-pink-400'],
            ['Franchise Purchases', allFranchiseCost, 'text-amber-400'],
            ['Loan Repayment', LOAN_PRINCIPAL, 'text-red-400'],
          ].map(([label, cost, color]) => {
            const pct = (Number(cost) / totalGameCost) * 100;
            return (
              <div key={String(label)} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-44 shrink-0 text-right">{label as string}</span>
                <div className="flex-1 h-4 bg-slate-800/60 rounded-full overflow-hidden relative">
                  <div className={`h-full ${(color as string).replace('text-', 'bg-').replace('400', '500/50')} rounded-full`} style={{ width: `${pct}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white/70">
                    ${Number(cost).toLocaleString()} ({pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
          <div className="border-t border-slate-800/40 pt-2 flex justify-between text-xs font-bold">
            <span className="text-slate-400">Grand Total</span>
            <span className="text-white">${totalGameCost.toLocaleString()}</span>
          </div>
        </div>
      </Section>

      {/* Revenue Projections by Phase */}
      <Section title="Revenue Projections by Phase">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              phase: 'Early Game',
              desc: '1 screen, basic, starter movie',
              revenue: earlyTicketRev + earlyConcessionRev,
              expenses: earlyStaffCost + earlyLicenseCost + MAINT_PER_SCREEN + LOAN_DAILY_PAYMENT,
              net: earlyDailyNet,
              color: 'border-orange-500/20',
            },
            {
              phase: 'Mid Game',
              desc: '3 screens, mixed quality, mid-tier movies',
              revenue: midTicketRev + midConcessionRev,
              expenses: midStaffCost + midLicenseCost + (MAINT_PER_SCREEN * 3) + LOAN_DAILY_PAYMENT,
              net: midDailyNet,
              color: 'border-blue-500/20',
            },
            {
              phase: 'Late Game',
              desc: '6 screens, premium+, blockbusters + franchises',
              revenue: lateTicketRev + lateConcessionRev + franchiseRev,
              expenses: lateStaffCost + lateLicenseCost + (MAINT_PER_SCREEN * 6) + franchiseExp,
              net: lateDailyNet,
              color: 'border-purple-500/20',
            },
          ].map(proj => (
            <div key={proj.phase} className={`rounded-xl border ${proj.color} bg-slate-900/40 p-4`}>
              <div className="text-sm font-semibold mb-0.5">{proj.phase}</div>
              <div className="text-[10px] text-slate-500 mb-3">{proj.desc}</div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Revenue/day</span><span className="text-green-400">${Math.round(proj.revenue).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Expenses/day</span><span className="text-red-400">${Math.round(proj.expenses).toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-slate-800/30 pt-1"><span className="text-slate-400 font-medium">Net/day</span><span className={`font-bold ${proj.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>${Math.round(proj.net).toLocaleString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Customer Flow Multipliers */}
      <Section title="Customer Flow Formula">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-3 font-mono leading-relaxed">
            customers = BASE_RATE × (popularity / 50) × qualityMult × (1 + rep/100) × conditionMult × staffMult × eventMult
          </div>
          <div className="grid grid-cols-2 gap-x-6 text-xs">
            <KV label="Base Rate" value={`${BASE_CUSTOMER_RATE} per showtime`} />
            <KV label="Popularity scale" value="÷ 50 (so 80 pop = 1.6×)" />
            <KV label="Quality: Basic" value="×0.7 (of 1.0 = 0.7)" />
            <KV label="Quality: Premium" value="×0.7 (of 1.8 = 1.26)" />
            <KV label="Quality: IMAX" value="×0.7 (of 2.5 = 1.75)" />
            <KV label="Reputation bonus" value="×(1 + rep/100)" />
            <KV label="Condition penalty (<50)" value="×(0.5 + cond/100)" />
            <KV label="No cashier penalty" value="×0.5" />
            <KV label="Per cashier bonus" value="+15% capacity" />
            <KV label="Per usher bonus" value="+5%" />
            <KV label="Manager present" value="+10%" />
            <KV label="Seat cap" value="capped at screen seats" />
          </div>
        </div>
      </Section>

      {/* Condition & Reputation Decay */}
      <Section title="Condition & Reputation Mechanics">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-x-6 text-xs">
          <KV label="Active screen decay" value="-2 condition/day" color="text-red-400" />
          <KV label="Inactive screen decay" value="-0.5 condition/day" color="text-orange-400" />
          <KV label="Theatre decay (no janitor)" value="-3 condition/day" color="text-red-400" />
          <KV label="Per janitor repair" value="+5 condition/day" color="text-green-400" />
          <KV label="Rep decay (condition <30)" value="-1/day" color="text-red-400" />
          <KV label="Rep gain per showing" value="+0.1 (if cond >70)" color="text-green-400" />
        </div>
      </Section>

      {/* Loan Analysis */}
      <Section title="Loan Analysis">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-x-6 text-xs">
          <KV label="Principal" value={`$${LOAN_PRINCIPAL.toLocaleString()}`} />
          <KV label="APR" value={`${(LOAN_INTEREST_RATE * 100)}%`} />
          <KV label="Daily Payment" value={`$${LOAN_DAILY_PAYMENT}`} />
          <KV label="Daily Interest (at start)" value={`$${dailyInterest.toFixed(2)}`} />
          <KV label="Net Principal/day (at start)" value={`$${netDailyPrincipal.toFixed(2)}`} />
          <KV label="Est. days to payoff" value={estimatedPayoffDays.toLocaleString()} color="text-cyan-400" />
          <KV label="Total interest paid (est)" value={`$${Math.round(LOAN_DAILY_PAYMENT * estimatedPayoffDays - LOAN_PRINCIPAL).toLocaleString()}`} color="text-red-400" />
        </div>
      </Section>

      {/* Random Events */}
      <Section title="Random Events">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-2">5% chance per day (when theatre is open)</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left border-b border-slate-800/40">
                <th className="py-1.5 pr-3 font-medium">Event</th>
                <th className="py-1.5 pr-3 font-medium text-right">Duration</th>
                <th className="py-1.5 pr-3 font-medium">Effect</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Critic Review', days: 3, effect: '×1.3 customers' },
                { name: 'Heatwave', days: 2, effect: '×1.5 customers' },
                { name: 'Rainy Week', days: 5, effect: '×1.2 customers' },
                { name: 'Equipment Issue', days: 2, effect: '×1.5 costs' },
                { name: 'Viral Moment', days: 2, effect: '×1.8 customers, +3 rep' },
                { name: 'Holiday Rush', days: 4, effect: '×1.6 customers, ×1.2 revenue' },
              ].map(evt => (
                <tr key={evt.name} className="border-b border-slate-800/20">
                  <td className="py-1.5 pr-3 text-slate-300">{evt.name}</td>
                  <td className="py-1.5 pr-3 text-right text-slate-400">{evt.days}d</td>
                  <td className="py-1.5 pr-3 text-slate-500">{evt.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Phase Transition Conditions */}
      <Section title="Phase Transitions">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded">Restoration</span>
            <span className="text-slate-700 text-xs">→</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Expansion</span>
            <span className="text-xs text-slate-500">All {OPENING_REQUIREMENTS.length} required tasks completed</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Expansion</span>
            <span className="text-slate-700 text-xs">→</span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">Franchise</span>
            <span className="text-xs text-slate-500">Reputation ≥ 55 OR owns a franchise</span>
          </div>
        </div>
      </Section>

      {/* Live Progress (if game active) */}
      {state && (
        <Section title="Live Game Progress">
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 text-xs">
            <KV label="Current Day" value={`Day ${actualDay}`} color="text-white" />
            <KV label="Current Cash" value={`$${actualMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-green-400" />
            <KV label="Current Reputation" value={actualRep.toFixed(1)} color="text-amber-400" />
            <KV label="Phase" value={state.phase} color="text-cyan-400" />
            <KV label="Loan Remaining" value={state.loan.paidOff ? 'Paid Off' : `$${state.loan.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={state.loan.paidOff ? 'text-green-400' : 'text-red-400'} />
            <KV label="Financial History" value={`${state.financialHistory.length} entries`} />
            <KV label="Daily Reports" value={`${state.dailyReports.length} days`} />
            <KV label="Cutscenes Seen" value={`${state.cutscenesSeen.length} / 8`} />
          </div>
        </Section>
      )}

      {/* Staff cost analysis */}
      <Section title="Daily Staff Cost Scenarios">
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left border-b border-slate-800/40">
                <th className="py-1.5 pr-3 font-medium">Scenario</th>
                <th className="py-1.5 pr-3 font-medium text-right">Staff</th>
                <th className="py-1.5 pr-3 font-medium text-right">Daily Cost</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Minimal (1 screen)', staff: '1 cashier + 1 proj + 1 janitor', cost: 80 + 120 + 65 },
                { name: 'Small (2 screens)', staff: '1 cash + 2 proj + 1 jan + 1 conc', cost: 80 + 240 + 65 + 75 },
                { name: 'Medium (3-4 screens)', staff: '2 cash + 4 proj + 2 jan + 2 conc + 1 mgr', cost: 160 + 480 + 130 + 150 + 200 },
                { name: 'Full (6 screens)', staff: '3 cash + 6 proj + 3 jan + 3 conc + 2 mgr + 3 ush', cost: 240 + 720 + 195 + 225 + 400 + 210 },
              ].map(s => (
                <tr key={s.name} className="border-b border-slate-800/20">
                  <td className="py-1.5 pr-3 text-slate-300">{s.name}</td>
                  <td className="py-1.5 pr-3 text-right text-slate-500 text-[10px]">{s.staff}</td>
                  <td className="py-1.5 pr-3 text-right text-red-400">${s.cost.toLocaleString()}/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
