import type { GameState } from '../../types';
import { restorationTasks, OPENING_REQUIREMENTS } from '../../data';

interface Props { state: GameState | null }

export function RestorationPage({ state }: Props) {
  const liveTasks = state?.theatre.restorationTasks ?? restorationTasks;
  const completedCount = liveTasks.filter(t => t.completed).length;
  const inProgressCount = liveTasks.filter(t => t.inProgress && !t.completed).length;
  const totalCost = restorationTasks.reduce((s, t) => s + t.cost, 0);
  const spentSoFar = liveTasks.filter(t => t.completed || t.inProgress).reduce((s, t) => s + t.cost, 0);
  const totalRepReward = restorationTasks.reduce((s, t) => s + t.reputationReward, 0);

  const categories = ['structural', 'equipment', 'aesthetic', 'safety'] as const;
  const byCat = categories.map(cat => ({
    name: cat,
    tasks: restorationTasks.filter(t => t.category === cat),
  }));

  // Build dependency tree
  const roots = restorationTasks.filter(t => !t.prerequisite);
  function getChildren(parentId: string): typeof restorationTasks {
    return restorationTasks.filter(t => t.prerequisite === parentId);
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Tasks</div>
          <div className="text-lg font-bold">{completedCount}/{liveTasks.length}</div>
          <div className="text-[10px] text-slate-500">{inProgressCount} in progress</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Cost</div>
          <div className="text-lg font-bold text-amber-400">${totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Spent So Far</div>
          <div className="text-lg font-bold text-red-400">${spentSoFar.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Rep Reward</div>
          <div className="text-lg font-bold text-green-400">+{totalRepReward}</div>
        </div>
      </div>

      {/* Opening Requirements */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">Opening Requirements <span className="text-[10px] text-slate-600">({OPENING_REQUIREMENTS.length} required)</span></h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OPENING_REQUIREMENTS.map(id => {
              const task = restorationTasks.find(t => t.id === id);
              const liveTask = liveTasks.find(t => t.id === id);
              const completed = liveTask?.completed ?? false;
              return (
                <div key={id} className={`rounded-lg border px-3 py-2 text-xs ${
                  completed ? 'border-green-500/20 bg-green-500/5' : 'border-slate-800/30 bg-slate-900/30'
                }`}>
                  <span className="mr-1">{completed ? '✓' : '○'}</span>
                  <span className={completed ? 'text-green-400' : 'text-slate-400'}>{task?.name ?? id}</span>
                  <div className="text-[10px] text-slate-600 mt-0.5">${task?.cost.toLocaleString()} · {task?.daysToComplete}d</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-slate-600">
            Minimum cost to open: ${OPENING_REQUIREMENTS.reduce((s, id) => {
              const task = restorationTasks.find(t => t.id === id);
              return s + (task?.cost ?? 0);
            }, 0).toLocaleString()}
          </div>
        </div>
      </section>

      {/* Dependency tree */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Dependency Tree</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-3">
          {roots.map(root => {
            const children = getChildren(root.id);
            const liveRoot = liveTasks.find(t => t.id === root.id);
            return (
              <div key={root.id}>
                <div className={`flex items-center gap-2 text-xs ${liveRoot?.completed ? 'text-green-400' : liveRoot?.inProgress ? 'text-amber-400' : 'text-slate-400'}`}>
                  <span>{root.icon}</span>
                  <span className="font-medium">{root.name}</span>
                  <span className="text-[10px] text-slate-600">${root.cost.toLocaleString()} · {root.daysToComplete}d · +{root.reputationReward} rep</span>
                  {OPENING_REQUIREMENTS.includes(root.id) && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded">Required</span>}
                </div>
                {children.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-slate-800/40 pl-3">
                    {children.map(child => {
                      const liveChild = liveTasks.find(t => t.id === child.id);
                      const grandchildren = getChildren(child.id);
                      return (
                        <div key={child.id}>
                          <div className={`flex items-center gap-2 text-xs ${liveChild?.completed ? 'text-green-400' : liveChild?.inProgress ? 'text-amber-400' : 'text-slate-500'}`}>
                            <span>{child.icon}</span>
                            <span>{child.name}</span>
                            <span className="text-[10px] text-slate-600">${child.cost.toLocaleString()} · {child.daysToComplete}d · +{child.reputationReward} rep</span>
                            {OPENING_REQUIREMENTS.includes(child.id) && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded">Required</span>}
                          </div>
                          {grandchildren.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1 border-l border-slate-800/40 pl-3">
                              {grandchildren.map(gc => {
                                const liveGc = liveTasks.find(t => t.id === gc.id);
                                return (
                                  <div key={gc.id} className={`flex items-center gap-2 text-xs ${liveGc?.completed ? 'text-green-400' : liveGc?.inProgress ? 'text-amber-400' : 'text-slate-600'}`}>
                                    <span>{gc.icon}</span>
                                    <span>{gc.name}</span>
                                    <span className="text-[10px] text-slate-600">${gc.cost.toLocaleString()} · {gc.daysToComplete}d · +{gc.reputationReward} rep</span>
                                    {OPENING_REQUIREMENTS.includes(gc.id) && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded">Required</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* By Category */}
      {byCat.map(cat => (
        <section key={cat.name}>
          <h3 className="text-sm font-semibold mb-2 text-slate-300 capitalize">{cat.name} <span className="text-[10px] text-slate-600">({cat.tasks.length})</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Task</th>
                  <th className="py-2 pr-3 font-medium text-right">Cost</th>
                  <th className="py-2 pr-3 font-medium text-right">Days</th>
                  <th className="py-2 pr-3 font-medium text-right">Rep</th>
                  <th className="py-2 pr-3 font-medium">Requires</th>
                  <th className="py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {cat.tasks.map(task => {
                  const live = liveTasks.find(t => t.id === task.id);
                  const prereqName = task.prerequisite ? restorationTasks.find(t => t.id === task.prerequisite)?.name : null;
                  return (
                    <tr key={task.id} className="border-b border-slate-800/20">
                      <td className="py-2 pr-3">
                        <span className="mr-1.5">{task.icon}</span>
                        <span className="text-slate-200">{task.name}</span>
                        {OPENING_REQUIREMENTS.includes(task.id) && <span className="ml-1 text-[9px] text-amber-400">*</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-amber-400">${task.cost.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right text-slate-400">{task.daysToComplete}</td>
                      <td className="py-2 pr-3 text-right text-green-400">+{task.reputationReward}</td>
                      <td className="py-2 pr-3 text-slate-500">{prereqName ?? '—'}</td>
                      <td className="py-2 text-center">
                        {live?.completed ? (
                          <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Done</span>
                        ) : live?.inProgress ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Building</span>
                        ) : (
                          <span className="text-[9px] bg-slate-700/40 text-slate-500 px-1.5 py-0.5 rounded">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Narrative texts */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Narrative Texts</h3>
        <div className="space-y-2">
          {restorationTasks.map(task => (
            <div key={task.id} className="bg-slate-900/40 border border-slate-800/40 rounded-xl px-4 py-3">
              <div className="text-xs font-medium text-slate-300 mb-1">{task.icon} {task.name}</div>
              <p className="text-[11px] text-slate-500 italic leading-relaxed">{task.narrativeText}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
