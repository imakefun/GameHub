import type { GameState } from '../../types';
import { staffTemplates } from '../../data';

interface Props { state: GameState | null }

export function StaffPage({ state }: Props) {
  const staff = state?.staff ?? [];

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
    totalDailyWage: staff.filter(s => s.role === template.role).reduce((s, m) => s + m.wage, 0),
  }));

  const totalDailyWages = staff.reduce((s, m) => s + m.wage, 0);

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
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Morale</div>
          <div className="text-lg font-bold text-amber-400">
            {staff.length > 0 ? (staff.reduce((s, m) => s + m.morale, 0) / staff.length).toFixed(1) : '—'}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Skill</div>
          <div className="text-lg font-bold text-cyan-400">
            {staff.length > 0 ? (staff.reduce((s, m) => s + m.skill, 0) / staff.length).toFixed(1) : '—'}
          </div>
        </div>
      </div>

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
                  <th className="py-2 pr-3 font-medium text-right">Skill</th>
                  <th className="py-2 pr-3 font-medium text-right">Morale</th>
                  <th className="py-2 pr-3 font-medium text-right">Wage</th>
                  <th className="py-2 font-medium text-right">Days</th>
                </tr>
              </thead>
              <tbody>
                {staff.sort((a, b) => a.role.localeCompare(b.role)).map(member => (
                  <tr key={member.id} className="border-b border-slate-800/20">
                    <td className="py-1.5 pr-3 text-slate-200">{member.name}</td>
                    <td className="py-1.5 pr-3 capitalize text-slate-400">{member.role}</td>
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
                    <td className="py-1.5 pr-3 text-right text-green-400">${member.wage}</td>
                    <td className="py-1.5 text-right text-slate-500">{member.daysEmployed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Staff Tuning Constants */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Staff Tuning Constants</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-x-6 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Skill gain per day</span><span className="text-white">+0.5</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Manager morale bonus</span><span className="text-white">+3/day</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Morale drift (above 50)</span><span className="text-white">-1/day</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Morale drift (below 50)</span><span className="text-white">+1/day</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Cashier capacity bonus</span><span className="text-white">+15% each</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">No-cashier penalty</span><span className="text-white">50% capacity</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Usher capacity bonus</span><span className="text-white">+5% each</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Manager effectiveness</span><span className="text-white">+10% all staff</span></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/30"><span className="text-slate-500">Concession worker bonus</span><span className="text-white">+25% sales cap</span></div>
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Janitor condition bonus</span><span className="text-white">+5 condition/day</span></div>
        </div>
      </section>
    </div>
  );
}
