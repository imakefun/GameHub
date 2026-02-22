import type { StaffMember, StaffRole } from '../types';
import { staffTemplates } from '../data';

interface Props {
  staff: StaffMember[];
  onHire: (role: StaffRole) => void;
  onFire: (staffId: string) => void;
}

export function StaffPanel({ staff, onHire, onFire }: Props) {
  const dailyWages = staff.reduce((sum, s) => sum + s.wage, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Staff Management</h3>
        <span className="text-sm text-slate-400">{staff.length} employed • ${dailyWages}/day</span>
      </div>

      {/* Hire new staff */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Hire Staff</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {staffTemplates.map(template => {
            const count = staff.filter(s => s.role === template.role).length;
            return (
              <button
                key={template.role}
                onClick={() => onHire(template.role)}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30 hover:border-blue-600/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{template.name}</p>
                    <p className="text-[10px] text-slate-500">({count} hired)</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mb-2 line-clamp-2">{template.effect}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400">${template.baseWage}/day</span>
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Hire
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current staff */}
      {staff.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Staff</h4>
          {staff.map(member => {
            const template = staffTemplates.find(t => t.role === member.role);
            return (
              <div
                key={member.id}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 flex items-center gap-3"
              >
                <span className="text-xl">{template?.icon ?? '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{member.name}</span>
                    <span className="text-xs text-slate-500">{template?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Skill</span>
                      <div className="w-12 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${member.skill}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{Math.floor(member.skill)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Morale</span>
                      <div className="w-12 bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            member.morale > 60 ? 'bg-green-500' :
                            member.morale > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${member.morale}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{member.daysEmployed}d</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-400">${member.wage}/day</p>
                  <button
                    onClick={() => onFire(member.id)}
                    className="text-[10px] text-red-400/60 hover:text-red-400 mt-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {staff.length === 0 && (
        <div className="text-center py-6">
          <p className="text-slate-500 text-sm">No staff hired yet. You'll need employees to run the theatre!</p>
          <p className="text-slate-600 text-xs mt-1">Start with a cashier and projectionist.</p>
        </div>
      )}
    </div>
  );
}
