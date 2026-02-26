import { useState } from 'react';
import type { StaffMember, StaffRole, StaffCandidate } from '../types';
import { LEVEL_NAMES, getXpToNextLevel, getFairWage } from '../types';
import { staffTemplates, staffTraits } from '../data';

interface Props {
  staff: StaffMember[];
  hiringPool: StaffCandidate[];
  day: number;
  onHireFromPool: (candidateId: string) => void;
  onFire: (staffId: string) => void;
  onGrantRaise: (staffId: string) => void;
  onDenyRaise: (staffId: string) => void;
  onRefreshPool: () => void;
}

type StaffTab = 'team' | 'hiring';

const levelColors = ['', 'text-slate-400', 'text-blue-400', 'text-green-400', 'text-purple-400', 'text-amber-400'];

function TraitBadge({ traitId }: { traitId: string }) {
  const trait = staffTraits.find(t => t.id === traitId);
  if (!trait) return null;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 cursor-help"
      title={`${trait.name}: ${trait.description} (${trait.effect})`}
    >
      {trait.name}
    </span>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <span className={`text-[10px] font-medium ${levelColors[level] || 'text-white'}`}>
      Lv.{level} {LEVEL_NAMES[level - 1]}
    </span>
  );
}

function XpBar({ experience, level }: { experience: number; level: number }) {
  const nextThreshold = getXpToNextLevel(level);
  if (nextThreshold === null) {
    return <span className="text-[9px] text-amber-400">MAX</span>;
  }
  const prevThreshold = level > 1 ? getXpToNextLevel(level - 1) ?? 0 : 0;
  const current = experience - prevThreshold;
  const needed = nextThreshold - prevThreshold;
  const pct = needed > 0 ? Math.min((current / needed) * 100, 100) : 100;
  return (
    <div className="flex items-center gap-1 flex-1">
      <div className="w-16 bg-slate-700 rounded-full h-1.5">
        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] text-slate-500">{Math.floor(current)}/{needed}</span>
    </div>
  );
}

export function StaffPanel({
  staff, hiringPool, day,
  onHireFromPool, onFire, onGrantRaise, onDenyRaise, onRefreshPool,
}: Props) {
  const [tab, setTab] = useState<StaffTab>('team');
  const [filterRole, setFilterRole] = useState<StaffRole | 'all'>('all');
  const [confirmFire, setConfirmFire] = useState<string | null>(null);

  const dailyWages = staff.reduce((sum, s) => sum + s.wage, 0);
  const raiseRequests = staff.filter(s => s.raiseRequestDay !== null);

  const filteredPool = filterRole === 'all'
    ? hiringPool
    : hiringPool.filter(c => c.role === filterRole);

  const filteredStaff = filterRole === 'all'
    ? staff
    : staff.filter(s => s.role === filterRole);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Staff Management</h3>
        <span className="text-sm text-slate-400">{staff.length} employed • ${dailyWages}/day</span>
      </div>

      {/* Raise request alerts */}
      {raiseRequests.length > 0 && (
        <div className="space-y-2">
          {raiseRequests.map(member => {
            const template = staffTemplates.find(t => t.role === member.role);
            const fairWage = template ? getFairWage(template.baseWage, member.level) : member.wage;
            const daysWaiting = day - (member.raiseRequestDay ?? day);
            return (
              <div
                key={member.id}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  daysWaiting >= 5 ? 'bg-red-900/20 border-red-800/40' : 'bg-amber-900/20 border-amber-800/40'
                }`}
              >
                <span className="text-xl">💰</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-slate-400"> ({template?.name})</span>
                    <span className="text-slate-500 text-xs"> wants a raise</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Current: ${member.wage}/day → Fair: ${fairWage}/day
                    {daysWaiting >= 5 && <span className="text-red-400 ml-2">May quit soon!</span>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onGrantRaise(member.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-700 hover:bg-green-600 text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onDenyRaise(member.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-900/50 hover:bg-red-800/50 text-red-300"
                  >
                    Deny
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={() => setTab('team')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'team' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Team ({staff.length})
        </button>
        <button
          onClick={() => setTab('hiring')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'hiring' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          📋 Hiring ({hiringPool.length})
        </button>
      </div>

      {/* Role filter */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
            filterRole === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        {staffTemplates.map(t => (
          <button
            key={t.role}
            onClick={() => setFilterRole(t.role)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              filterRole === t.role ? 'bg-slate-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      {/* ===== TEAM TAB ===== */}
      {tab === 'team' && (
        <div className="space-y-2">
          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">
                {staff.length === 0
                  ? "No staff hired yet. Browse the Hiring tab to find candidates!"
                  : "No staff in this role."}
              </p>
              {staff.length === 0 && (
                <p className="text-slate-600 text-xs mt-1">Start with a cashier and projectionist.</p>
              )}
            </div>
          )}

          {filteredStaff.map(member => {
            const template = staffTemplates.find(t => t.role === member.role);
            const fairWage = template ? getFairWage(template.baseWage, member.level) : member.wage;
            const isUnderpaid = member.wage < fairWage;
            const hasRaise = member.raiseRequestDay !== null;

            return (
              <div
                key={member.id}
                className={`rounded-xl border transition-all ${
                  hasRaise ? 'bg-amber-900/10 border-amber-800/30' : 'bg-slate-800/50 border-slate-700/30'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{template?.icon ?? '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{member.name}</span>
                        <span className="text-xs text-slate-500">{template?.name}</span>
                        <LevelBadge level={member.level} />
                        <TraitBadge traitId={member.trait} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* XP progress */}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-500">XP</span>
                          <XpBar experience={member.experience} level={member.level} />
                        </div>
                        {/* Skill */}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-500">Skill</span>
                          <div className="w-12 bg-slate-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${member.skill}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400">{Math.floor(member.skill)}</span>
                        </div>
                        {/* Morale */}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-500">Morale</span>
                          <div className="w-10 bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                member.morale > 60 ? 'bg-green-500' :
                                member.morale > 30 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${member.morale}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-medium ${isUnderpaid ? 'text-red-400' : 'text-amber-400'}`}>
                        ${member.wage}/day
                      </p>
                      {isUnderpaid && (
                        <p className="text-[9px] text-red-400/70">fair: ${fairWage}</p>
                      )}
                      <p className="text-[9px] text-slate-500 mt-0.5">{member.daysEmployed}d employed</p>
                      {confirmFire === member.id ? (
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => { onFire(member.id); setConfirmFire(null); }}
                            className="text-[9px] text-red-400 hover:text-red-300"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmFire(null)}
                            className="text-[9px] text-slate-500 hover:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmFire(member.id)}
                          className="text-[9px] text-red-400/50 hover:text-red-400 mt-1 transition-colors"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== HIRING TAB ===== */}
      {tab === 'hiring' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {hiringPool.length} candidates available. Pool refreshes weekly.
            </p>
            <button
              onClick={onRefreshPool}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
            >
              🔄 Refresh Pool
            </button>
          </div>

          {filteredPool.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No candidates for this role. Try refreshing the pool.</p>
            </div>
          )}

          {filteredPool.map(candidate => {
            const template = staffTemplates.find(t => t.role === candidate.role);
            const trait = staffTraits.find(t => t.id === candidate.trait);
            return (
              <div
                key={candidate.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{template?.icon ?? '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{candidate.name}</span>
                        <span className="text-xs text-slate-500">{template?.name}</span>
                        <LevelBadge level={candidate.level} />
                      </div>

                      {/* Trait */}
                      {trait && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800/30">
                            {trait.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{trait.description}</span>
                        </div>
                      )}

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 mt-2.5">
                        <div>
                          <span className="text-[9px] text-slate-500 block">Skill</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(candidate.skill / (template?.maxSkill ?? 100)) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-300 w-6 text-right">{Math.floor(candidate.skill)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">Experience</span>
                          <span className="text-[10px] text-slate-300">{Math.floor(candidate.experience)} XP</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">Morale</span>
                          <span className={`text-[10px] ${candidate.morale > 60 ? 'text-green-400' : candidate.morale > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {Math.floor(candidate.morale)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hire button */}
                    <div className="shrink-0 text-right">
                      <button
                        onClick={() => onHireFromPool(candidate.id)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all"
                      >
                        Hire
                      </button>
                      <p className="text-xs text-amber-400 mt-1">${candidate.minimumWage}/day</p>
                    </div>
                  </div>

                  {/* Role effect reminder */}
                  {template && (
                    <div className="mt-2 pt-2 border-t border-slate-700/30">
                      <span className="text-[10px] text-slate-500">{template.effect}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
