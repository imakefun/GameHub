import type { GameState } from '../../types';
import { cutscenes } from '../../data';

interface Props { state: GameState | null }

const moodColors: Record<string, string> = {
  neutral: 'bg-slate-700/30 text-slate-400',
  dramatic: 'bg-red-500/10 text-red-400',
  hopeful: 'bg-amber-500/10 text-amber-400',
  tense: 'bg-blue-500/10 text-blue-400',
  triumphant: 'bg-yellow-500/10 text-yellow-400',
};

export function CutscenesPage({ state }: Props) {
  const seenIds = state?.cutscenesSeen ?? [];
  const activeCutscene = state?.activeCutscene ?? null;
  const totalBeats = cutscenes.reduce((s, c) => s + c.beats.length, 0);
  const totalWithImages = cutscenes.reduce((s, c) => s + c.beats.filter(b => b.imageSrc).length, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Sequences</div>
          <div className="text-lg font-bold">{cutscenes.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Beats</div>
          <div className="text-lg font-bold text-cyan-400">{totalBeats}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Seen by Player</div>
          <div className="text-lg font-bold text-green-400">{seenIds.length}/{cutscenes.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Images Assigned</div>
          <div className="text-lg font-bold text-amber-400">{totalWithImages}/{totalBeats}</div>
        </div>
      </div>

      {/* Active cutscene */}
      {activeCutscene && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1">Currently Playing</div>
          <div className="text-sm font-bold text-amber-400">{activeCutscene}</div>
        </div>
      )}

      {/* All sequences */}
      {cutscenes.map(seq => {
        const seen = seenIds.includes(seq.id);
        const isActive = activeCutscene === seq.id;
        return (
          <section key={seq.id}>
            <div className={`rounded-xl border ${
              isActive ? 'border-amber-500/30 bg-amber-500/5' :
              seen ? 'border-green-500/20 bg-green-500/5' :
              'border-slate-800/40 bg-slate-900/40'
            }`}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-800/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{seq.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">ID: {seq.id}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{seq.beats.length} beats</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">Trigger: {seq.triggerCondition}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isActive && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Playing</span>}
                  {seen && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Seen</span>}
                  {!seen && !isActive && <span className="text-[9px] bg-slate-700/30 text-slate-600 px-2 py-0.5 rounded">Unseen</span>}
                </div>
              </div>

              {/* Beats */}
              <div className="p-4 space-y-3">
                {seq.beats.map((beat, i) => (
                  <div key={i} className="flex gap-3">
                    {/* Beat number */}
                    <div className="w-6 h-6 rounded-full bg-slate-800/60 flex items-center justify-center text-[10px] text-slate-500 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Speaker + mood */}
                      <div className="flex items-center gap-2 mb-1">
                        {beat.speaker && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-900/20 px-1.5 py-0.5 rounded">
                            {beat.speaker}
                          </span>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${moodColors[beat.mood ?? 'neutral']}`}>
                          {beat.mood ?? 'neutral'}
                        </span>
                      </div>
                      {/* Text */}
                      <p className="text-xs text-slate-300 leading-relaxed">{beat.text}</p>
                      {/* Image info */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className={`text-[10px] px-2 py-0.5 rounded ${
                          beat.imageSrc ? 'bg-green-500/10 text-green-400' : 'bg-slate-800/40 text-slate-600'
                        }`}>
                          {beat.imageSrc ? `Image: ${beat.imageSrc}` : `Placeholder: "${beat.imagePlaceholder}"`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Image coverage summary */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Image Asset Coverage</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
          {cutscenes.map(seq => {
            const withImage = seq.beats.filter(b => b.imageSrc).length;
            const total = seq.beats.length;
            const pct = total > 0 ? (withImage / total) * 100 : 0;
            return (
              <div key={seq.id} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-32 shrink-0 text-right truncate">{seq.title}</span>
                <div className="flex-1 h-3 bg-slate-800/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-700'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 w-14 shrink-0 text-right">{withImage}/{total}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
