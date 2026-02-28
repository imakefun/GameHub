import type { GameState } from '../../types';
import { LEVEL_NAMES, LEVEL_THRESHOLDS, getFairWage } from '../../types';
import { staffTemplates, staffTraits } from '../../data';

interface Props { state: GameState | null }

export function StaffPage({ state }: Props) {
  const staff = state?.staff ?? [];
  const hiringPool = state?.hiringPool ?? [];

  const byRole = staffTemplates.map(template => ({
    ...template,
    hired: staff.filter(s => s.role === template.role),
    avgSkill: (() => {
      const matching = staff.filter(s => s.role === template.role);
      return matching.length > 0 ? matching.reduce((s, m) => s + m.skill, 0) / matching.length : 0;
    })(),
    avgMorale: (() => {
      const matching = staff.filter(s => s.role === template.role);
      return matching.length > 0 ? matching.reduce((s, m) => s + m.morale, 0) / matching.length : 0;
    })(),
    avgLevel: (() => {
      const matching = staff.filter(s => s.role === template.role);
      return matching.length > 0 ? matching.reduce((s, m) => s + m.level, 0) / matching.length : 0;
    })(),
    totalDailyWage: staff.filter(s => s.role === template.role).reduce((s, m) => s + m.wage, 0),
  }));

  const totalDailyWages = staff.reduce((s, m) => s + m.wage, 0);
  const raiseRequests = staff.filter(s => s.raiseRequestDay !== null);
  const underpaid = staff.filter(s => {
    const t = staffTemplates.find(st => st.role === s.role);
    return t ? s.wage < getFairWage(t.baseWage, s.level) : false;
  });

  // Level distribution
  const levelDist = [0, 0, 0, 0, 0];
  for (const s of staff) {
    if (s.level >= 1 && s.level <= 5) levelDist[s.level - 1]++;
  }

  // Trait distribution
  const traitCounts: Record<string, number> = {};
  for (const s of staff) {
    traitCounts[s.trait] = (traitCounts[s.trait] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Staff</div>
          <div className="text-lg font-bold">{staff.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Daily Wages</div>
          <div className="text-lg font-bold text-red-400">${totalDailyWages.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Raise Requests</div>
          <div className={`text-lg font-bold ${raiseRequests.length > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            {raiseRequests.length}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Underpaid</div>
          <div className={`text-lg font-bold ${underpaid.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {underpaid.length}
          </div>
        </div>
      </div>

      {/* Level Distribution */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Level Distribution</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="flex gap-3">
            {LEVEL_NAMES.map((name, i) => (
              <div key={name} className="flex-1 text-center">
                <div className="text-2xl font-bold text-white">{levelDist[i]}</div>
                <div className="text-[10px] text-slate-500">Lv.{i + 1}</div>
                <div className="text-[9px] text-slate-600">{name}</div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: staff.length > 0 ? `${(levelDist[i] / staff.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trait Distribution */}
      {Object.keys(traitCounts).length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3 text-slate-300">Trait Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(traitCounts).sort((a, b) => b[1] - a[1]).map(([traitId, count]) => {
              const trait = staffTraits.find(t => t.id === traitId);
              return (
                <div key={traitId} className="bg-slate-900/50 border border-slate-800/40 rounded-lg px-3 py-2">
                  <div className="text-xs text-white font-medium">{trait?.name ?? traitId}</div>
                  <div className="text-[10px] text-slate-500">{count} staff</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Role Templates (static data) */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Role Templates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 text-left border-b border-slate-800/40">
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium text-right">Base Wage</th>
                <th className="py-2 pr-3 font-medium text-right">Start Skill</th>
                <th className="py-2 pr-3 font-medium text-right">Max Skill</th>
                <th className="py-2 pr-3 font-medium">Effect</th>
              </tr>
            </thead>
            <tbody>
              {staffTemplates.map(t => (
                <tr key={t.role} className="border-b border-slate-800/20">
                  <td className="py-2 pr-3">
                    <span className="mr-1.5">{t.icon}</span>
                    <span className="text-slate-200 capitalize">{t.name}</span>
                  </td>
                  <td className="py-2 pr-3 text-right text-green-400">${t.baseWage}/day</td>
                  <td className="py-2 pr-3 text-right text-slate-400">{t.startingSkill}</td>
                  <td className="py-2 pr-3 text-right text-amber-400">{t.maxSkill}</td>
                  <td className="py-2 pr-3 text-slate-500 text-[10px]">{t.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-role breakdown with live data */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Role Breakdown (Live)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {byRole.map(role => (
            <div key={role.role} className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{role.icon}</span>
                  <div>
                    <div className="text-sm font-medium capitalize">{role.name}</div>
                    <div className="text-[10px] text-slate-600">{role.description}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-400">{role.hired.length}</div>
              </div>
              {role.hired.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Avg Level</span>
                    <span className="text-indigo-400">{role.avgLevel.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Avg Skill</span>
                    <span className="text-cyan-400">{role.avgSkill.toFixed(1)} / {role.maxSkill}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(role.avgSkill / role.maxSkill) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Avg Morale</span>
                    <span className="text-amber-400">{role.avgMorale.toFixed(1)} / 100</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${role.avgMorale}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Daily Wages</span>
                    <span className="text-red-400">${role.totalDailyWage}/day</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-600">No staff hired</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Staff Roster */}
      {staff.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3 text-slate-300">Staff Roster</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium text-right">Level</th>
                  <th className="py-2 pr-3 font-medium text-right">XP</th>
                  <th className="py-2 pr-3 font-medium text-right">Skill</th>
                  <th className="py-2 pr-3 font-medium text-right">Morale</th>
                  <th className="py-2 pr-3 font-medium text-right">Wage</th>
                  <th className="py-2 pr-3 font-medium text-right">Fair</th>
                  <th className="py-2 pr-3 font-medium">Trait</th>
                  <th className="py-2 font-medium text-right">Days</th>
                </tr>
              </thead>
              <tbody>
                {staff.sort((a, b) => a.role.localeCompare(b.role) || b.level - a.level).map(member => {
                  const template = staffTemplates.find(t => t.role === member.role);
                  const fairWage = template ? getFairWage(template.baseWage, member.level) : member.wage;
                  const trait = staffTraits.find(t => t.id === member.trait);
                  return (
                    <tr key={member.id} className={`border-b border-slate-800/20 ${member.raiseRequestDay !== null ? 'bg-amber-900/10' : ''}`}>
                      <td className="py-1.5 pr-3 text-slate-200">{member.name}</td>
                      <td className="py-1.5 pr-3 capitalize text-slate-400">{member.role}</td>
                      <td className="py-1.5 pr-3 text-right">
                        <span className="text-indigo-400">Lv.{member.level}</span>
                        <span className="text-[9px] text-slate-600 ml-1">{LEVEL_NAMES[member.level - 1]}</span>
                      </td>
                      <td className="py-1.5 pr-3 text-right text-slate-400">{Math.floor(member.experience)}</td>
                      <td className="py-1.5 pr-3 text-right">
                        <span className={member.skill >= 60 ? 'text-green-400' : member.skill >= 30 ? 'text-amber-400' : 'text-red-400'}>
                          {member.skill.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <span className={member.morale >= 60 ? 'text-green-400' : member.morale >= 30 ? 'text-amber-400' : 'text-red-400'}>
                          {member.morale.toFixed(1)}
                        </span>
                      </td>
                      <td className={`py-1.5 pr-3 text-right ${member.wage < fairWage ? 'text-red-400' : 'text-green-400'}`}>
                        ${member.wage}
                      </td>
                      <td className="py-1.5 pr-3 text-right text-slate-500">${fairWage}</td>
                      <td className="py-1.5 pr-3 text-slate-400">{trait?.name ?? member.trait}</td>
                      <td className="py-1.5 text-right text-slate-500">{member.daysEmployed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Hiring Pool */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">
          Hiring Pool ({hiringPool.length} candidates)
          {state && <span className="text-[10px] text-slate-600 ml-2">Last refreshed: Day {state.lastPoolRefresh}</span>}
        </h3>
        {hiringPool.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium text-right">Level</th>
                  <th className="py-2 pr-3 font-medium text-right">Skill</th>
                  <th className="py-2 pr-3 font-medium text-right">XP</th>
                  <th className="py-2 pr-3 font-medium text-right">Min Wage</th>
                  <th className="py-2 pr-3 font-medium">Trait</th>
                  <th className="py-2 font-medium text-right">Morale</th>
                </tr>
              </thead>
              <tbody>
                {hiringPool.sort((a, b) => a.role.localeCompare(b.role) || b.level - a.level).map(c => {
                  const trait = staffTraits.find(t => t.id === c.trait);
                  return (
                    <tr key={c.id} className="border-b border-slate-800/20">
                      <td className="py-1.5 pr-3 text-slate-200">{c.name}</td>
                      <td className="py-1.5 pr-3 capitalize text-slate-400">{c.role}</td>
                      <td className="py-1.5 pr-3 text-right text-indigo-400">Lv.{c.level}</td>
                      <td className="py-1.5 pr-3 text-right text-cyan-400">{Math.floor(c.skill)}</td>
                      <td className="py-1.5 pr-3 text-right text-slate-400">{Math.floor(c.experience)}</td>
                      <td className="py-1.5 pr-3 text-right text-amber-400">${c.minimumWage}</td>
                      <td className="py-1.5 pr-3 text-slate-400">{trait?.name ?? c.trait}</td>
                      <td className="py-1.5 text-right text-slate-400">{Math.floor(c.morale)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-[10px] text-slate-600">No candidates in pool</div>
        )}
      </section>

      {/* Leveling Constants */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Leveling & Pay Constants</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-x-6 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">XP thresholds</span><span className="text-white">{LEVEL_THRESHOLDS.join(', ')}</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Base XP/day</span><span className="text-white">1</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Fair wage formula</span><span className="text-white">base × (1 + (lvl-1)×0.25)</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Raise check interval</span><span className="text-white">Every 14 days</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Raise wait → quit</span><span className="text-white">7d wait, 15%/day</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Low morale quit</span><span className="text-white">&lt;20 morale, 10%/day</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Pool refresh</span><span className="text-white">Every 7 days</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Pool size</span><span className="text-white">2 per role (12 total)</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Manager morale bonus</span><span className="text-white">+5/day</span></div>
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Screen upgrade gate</span><span className="text-white">2+ unlocked screens</span></div>
        </div>
      </section>
    </div>
  );
}
