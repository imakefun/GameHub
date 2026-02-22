import type { RestorationTask, GameTime } from '../types';
import { OPENING_REQUIREMENTS } from '../data';

interface Props {
  tasks: RestorationTask[];
  money: number;
  time: GameTime;
  onStartTask: (taskId: string) => void;
}

export function RestorationPanel({ tasks, money, time, onStartTask }: Props) {
  const completedCount = tasks.filter(t => t.completed).length;
  const requiredComplete = OPENING_REQUIREMENTS.filter(id =>
    tasks.find(t => t.id === id)?.completed
  ).length;
  const totalRequired = OPENING_REQUIREMENTS.length;

  const categories = ['safety', 'structural', 'equipment', 'aesthetic'] as const;
  const categoryLabels: Record<string, string> = {
    safety: '🛡️ Safety & Permits',
    structural: '🏗️ Structural',
    equipment: '⚙️ Equipment',
    aesthetic: '🎨 Aesthetic',
  };

  function getTaskStatus(task: RestorationTask): { label: string; color: string } {
    if (task.completed) return { label: 'Complete', color: 'text-green-400' };
    if (task.inProgress) {
      const daysLeft = task.startedDay !== null
        ? Math.max(0, task.daysToComplete - (time.day - task.startedDay))
        : task.daysToComplete;
      return { label: `${daysLeft}d remaining`, color: 'text-yellow-400' };
    }
    if (task.prerequisite) {
      const prereq = tasks.find(t => t.id === task.prerequisite);
      if (!prereq?.completed) return { label: `Requires: ${prereq?.name ?? 'unknown'}`, color: 'text-slate-500' };
    }
    if (money < task.cost) return { label: 'Not enough funds', color: 'text-red-400' };
    return { label: 'Ready', color: 'text-blue-400' };
  }

  function canStart(task: RestorationTask): boolean {
    if (task.completed || task.inProgress) return false;
    if (task.prerequisite) {
      const prereq = tasks.find(t => t.id === task.prerequisite);
      if (!prereq?.completed) return false;
    }
    if (money < task.cost) return false;
    // Check if another of same category is in progress
    const sameInProgress = tasks.some(t => t.inProgress && t.category === task.category);
    if (sameInProgress) return false;
    return true;
  }

  const isRequired = (id: string) => OPENING_REQUIREMENTS.includes(id);

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Theatre Restoration</h3>
          <span className="text-sm text-slate-400">{completedCount}/{tasks.length} tasks done</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Opening requirements:</span>
          <span className={requiredComplete === totalRequired ? 'text-green-400 font-bold' : 'text-amber-400'}>
            {requiredComplete}/{totalRequired}
          </span>
          {requiredComplete === totalRequired && (
            <span className="text-green-400 ml-2">✓ Ready to open!</span>
          )}
        </div>
      </div>

      {/* Narrative intro */}
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 rounded-xl p-4 border border-amber-800/30">
        <p className="text-amber-200/80 text-sm italic leading-relaxed">
          You stand in the dusty lobby of the old Starlight Cinema. Cobwebs drape the ticket booth,
          the seats are torn, and the projector hasn't run in years. But you can see what this place
          could be. Time to roll up your sleeves.
        </p>
      </div>

      {/* Tasks by category */}
      {categories.map(cat => {
        const catTasks = tasks.filter(t => t.category === cat);
        if (catTasks.length === 0) return null;
        return (
          <div key={cat}>
            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {categoryLabels[cat]}
            </h4>
            <div className="space-y-2">
              {catTasks.map(task => {
                const status = getTaskStatus(task);
                const can = canStart(task);
                const required = isRequired(task.id);
                return (
                  <div
                    key={task.id}
                    className={`bg-slate-800/50 rounded-lg p-3 border transition-all ${
                      task.completed
                        ? 'border-green-800/30 opacity-70'
                        : task.inProgress
                        ? 'border-yellow-700/50 bg-yellow-900/10'
                        : can
                        ? 'border-blue-700/50 hover:border-blue-600/70'
                        : 'border-slate-700/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{task.icon}</span>
                          <span className={`font-medium ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                            {task.name}
                          </span>
                          {required && !task.completed && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-900/50 text-red-300 rounded-full font-medium">
                              REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{task.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs">
                          <span className="text-amber-400">${task.cost.toLocaleString()}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{task.daysToComplete}d</span>
                          <span className="text-slate-500">•</span>
                          <span className={status.color}>{status.label}</span>
                        </div>
                      </div>
                      {!task.completed && !task.inProgress && (
                        <button
                          onClick={() => onStartTask(task.id)}
                          disabled={!can}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            can
                              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Start
                        </button>
                      )}
                      {task.inProgress && (
                        <div className="flex items-center gap-1.5 text-yellow-400">
                          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Working</span>
                        </div>
                      )}
                      {task.completed && (
                        <span className="text-green-400 text-lg">✓</span>
                      )}
                    </div>

                    {/* Show narrative text for completed tasks */}
                    {task.completed && (
                      <p className="text-xs text-green-300/60 mt-2 italic pl-8">
                        {task.narrativeText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
