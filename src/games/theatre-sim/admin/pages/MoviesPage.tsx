import type { GameState } from '../../types';
import { movies as allMovies } from '../../data';

interface Props { state: GameState | null }

export function MoviesPage({ state }: Props) {
  // Group by reputation tier
  const tiers = [
    { label: 'Tier 1 — Starter', range: [0, 10], color: 'border-slate-600/30' },
    { label: 'Tier 2 — Rising', range: [11, 30], color: 'border-blue-500/20' },
    { label: 'Tier 3 — Prestige', range: [31, 50], color: 'border-purple-500/20' },
    { label: 'Tier 4 — Blockbuster', range: [51, 100], color: 'border-amber-500/20' },
  ];

  const currentRep = state?.resources.reputation ?? 0;
  const currentDay = state?.time.day ?? 1;
  const licensedMovies = state?.licensedMovies ?? [];
  const licensedIds = licensedMovies.map(lm => lm.movieId);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Movies</div>
          <div className="text-lg font-bold">{allMovies.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Available Now</div>
          <div className="text-lg font-bold text-green-400">
            {allMovies.filter(m => m.minReputation <= currentRep && currentDay >= m.releaseWeek * 7).length}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Currently Licensed</div>
          <div className="text-lg font-bold text-cyan-400">{licensedMovies.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg License Cost</div>
          <div className="text-lg font-bold text-amber-400">${Math.round(allMovies.reduce((s, m) => s + m.licenseCost, 0) / allMovies.length)}</div>
        </div>
      </div>

      {/* Active licenses */}
      {licensedMovies.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2 text-slate-300">Active Licenses</h3>
          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
            <div className="space-y-2">
              {licensedMovies.map(lm => {
                const movie = allMovies.find(m => m.id === lm.movieId);
                if (!movie) return null;
                const daysLeft = lm.expiresDay - currentDay;
                const totalDays = lm.expiresDay - lm.licensedDay;
                const progress = totalDays > 0 ? (currentDay - lm.licensedDay) / totalDays : 1;
                const currentPop = Math.floor(movie.popularity * Math.max(0.4, 1 - progress * 0.6));
                return (
                  <div key={lm.movieId} className="flex items-center gap-3 text-xs">
                    <span>{movie.icon}</span>
                    <span className="text-slate-200 w-32 truncate">{movie.title}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${daysLeft <= 3 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${(1 - progress) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-500 w-12 text-right">{daysLeft}d</span>
                    <span className="text-slate-500 w-16 text-right">Pop: {currentPop}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tier breakdown */}
      {tiers.map(tier => {
        const movies = allMovies.filter(m => m.minReputation >= tier.range[0] && m.minReputation <= tier.range[1]);
        if (movies.length === 0) return null;
        return (
          <section key={tier.label}>
            <h3 className="text-sm font-semibold mb-2 text-slate-300">{tier.label} <span className="text-[10px] text-slate-600">({movies.length} movies)</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-600 text-left border-b border-slate-800/40">
                    <th className="py-2 pr-3 font-medium">Movie</th>
                    <th className="py-2 pr-3 font-medium">Genre</th>
                    <th className="py-2 pr-3 font-medium text-right">Pop.</th>
                    <th className="py-2 pr-3 font-medium text-right">Rating</th>
                    <th className="py-2 pr-3 font-medium text-right">License Cost</th>
                    <th className="py-2 pr-3 font-medium text-right">Duration</th>
                    <th className="py-2 pr-3 font-medium text-right">Min Rep</th>
                    <th className="py-2 pr-3 font-medium text-right">Week</th>
                    <th className="py-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.sort((a, b) => a.releaseWeek - b.releaseWeek || a.minReputation - b.minReputation).map(movie => {
                    const unlocked = currentRep >= movie.minReputation && currentDay >= movie.releaseWeek * 7;
                    const licensed = licensedIds.includes(movie.id);
                    const lm = licensedMovies.find(l => l.movieId === movie.id);
                    return (
                      <tr key={movie.id} className={`border-b border-slate-800/20 ${!unlocked ? 'opacity-40' : ''}`}>
                        <td className="py-2 pr-3">
                          <span className="mr-1.5">{movie.icon}</span>
                          <span className="text-slate-200">{movie.title}</span>
                        </td>
                        <td className="py-2 pr-3 capitalize text-slate-400">{movie.genre}</td>
                        <td className="py-2 pr-3 text-right">
                          <span className={`${movie.popularity >= 80 ? 'text-amber-400' : movie.popularity >= 60 ? 'text-green-400' : 'text-slate-400'}`}>
                            {movie.popularity}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right text-yellow-400">{'★'.repeat(movie.qualityRating)}{'☆'.repeat(5 - movie.qualityRating)}</td>
                        <td className="py-2 pr-3 text-right text-green-400">${movie.licenseCost.toLocaleString()}</td>
                        <td className="py-2 pr-3 text-right text-slate-400">{movie.durationWeeks}w</td>
                        <td className="py-2 pr-3 text-right">{movie.minReputation}</td>
                        <td className="py-2 pr-3 text-right text-slate-500">{movie.releaseWeek}</td>
                        <td className="py-2 text-center">
                          {licensed && lm ? (
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                              {lm.expiresDay - currentDay}d left
                            </span>
                          ) : unlocked ? (
                            <span className="text-[9px] bg-slate-700/40 text-slate-400 px-1.5 py-0.5 rounded">Available</span>
                          ) : (
                            <span className="text-[9px] bg-red-500/10 text-red-400/60 px-1.5 py-0.5 rounded">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* Popularity vs Cost scatter (text-based) */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-slate-300">Popularity vs License Cost</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-1">
          {allMovies.sort((a, b) => b.popularity - a.popularity).map(movie => {
            const maxCost = Math.max(...allMovies.map(m => m.licenseCost));
            const costPct = (movie.licenseCost / maxCost) * 100;
            const popPct = movie.popularity;
            return (
              <div key={movie.id} className="flex items-center gap-2 h-5">
                <span className="text-[9px] text-slate-500 w-28 shrink-0 text-right truncate">{movie.icon} {movie.title}</span>
                <div className="flex-1 h-3 bg-slate-800/60 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 h-full bg-cyan-500/30 rounded-full" style={{ width: `${popPct}%` }} />
                  <div className="absolute top-0 h-full bg-amber-500/40 rounded-full" style={{ width: `${costPct}%`, left: 0 }} />
                </div>
                <span className="text-[9px] text-slate-500 w-20 shrink-0">
                  P:{movie.popularity} C:${movie.licenseCost}
                </span>
              </div>
            );
          })}
          <div className="flex gap-4 mt-2 text-[9px] text-slate-600">
            <span><span className="inline-block w-3 h-2 bg-cyan-500/30 rounded mr-1" />Popularity</span>
            <span><span className="inline-block w-3 h-2 bg-amber-500/40 rounded mr-1" />Cost</span>
          </div>
        </div>
      </section>
    </div>
  );
}
