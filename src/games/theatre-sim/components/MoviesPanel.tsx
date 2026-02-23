import type { GameState } from '../types';
import { movies as allMovies } from '../data';

interface Props {
  state: GameState;
  onLicenseMovie: (movieId: string) => void;
  onDropMovie: (movieId: string) => void;
}

const genreColors: Record<string, string> = {
  action: 'bg-red-900/40 text-red-300',
  comedy: 'bg-yellow-900/40 text-yellow-300',
  drama: 'bg-blue-900/40 text-blue-300',
  horror: 'bg-purple-900/40 text-purple-300',
  scifi: 'bg-cyan-900/40 text-cyan-300',
  animation: 'bg-green-900/40 text-green-300',
  romance: 'bg-pink-900/40 text-pink-300',
  thriller: 'bg-orange-900/40 text-orange-300',
};

export function MoviesPanel({ state, onLicenseMovie, onDropMovie }: Props) {
  const { currentMovies, resources } = state;
  const weeklyLicenseCost = currentMovies.reduce((sum, mid) => {
    const movie = allMovies.find(m => m.id === mid);
    return sum + (movie?.licenseCost ?? 0);
  }, 0);

  // Filter available movies based on reputation and release week
  const availableMovies = allMovies.filter(m =>
    !currentMovies.includes(m.id) &&
    resources.reputation >= m.minReputation &&
    state.time.day >= m.releaseWeek * 7
  );

  const licensedMovies = currentMovies
    .map(id => allMovies.find(m => m.id === id))
    .filter(Boolean) as typeof allMovies;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Movies</h3>
        <span className="text-sm text-amber-400">${weeklyLicenseCost.toLocaleString()}/week in licenses</span>
      </div>

      {/* Currently licensed */}
      {licensedMovies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Licensed Movies</h4>
          <div className="space-y-2">
            {licensedMovies.map(movie => {
              const screenCount = state.theatre.screens.filter(s => s.currentMovieId === movie.id).length;
              return (
                <div
                  key={movie.id}
                  className="bg-slate-800/50 rounded-lg p-3 border border-green-800/30 flex items-center gap-3"
                >
                  <span className="text-2xl">{movie.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{movie.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${genreColors[movie.genre]}`}>
                        {movie.genre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-slate-400">Pop: {movie.popularity}</span>
                      <span className="text-slate-400">{'★'.repeat(movie.qualityRating)}</span>
                      <span className="text-amber-400">${movie.licenseCost}/week</span>
                      {screenCount > 0 && (
                        <span className="text-green-400">Showing on {screenCount} screen{screenCount > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDropMovie(movie.id)}
                    className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
                  >
                    Drop
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available to license */}
      <div>
        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Available to License ({availableMovies.length})
        </h4>
        {availableMovies.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No new movies available. Increase your reputation to attract better films!
          </p>
        ) : (
          <div className="space-y-2">
            {availableMovies.map(movie => (
              <div
                key={movie.id}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 flex items-center gap-3 hover:border-slate-600/50 transition-all"
              >
                <span className="text-2xl">{movie.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{movie.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${genreColors[movie.genre]}`}>
                      {movie.genre}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-400">Popularity: {movie.popularity}</span>
                    <span className="text-slate-400">{'★'.repeat(movie.qualityRating)}{'☆'.repeat(5 - movie.qualityRating)}</span>
                    <span className="text-amber-400">${movie.licenseCost}/week</span>
                  </div>
                </div>
                <button
                  onClick={() => onLicenseMovie(movie.id)}
                  disabled={resources.money < movie.licenseCost}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    resources.money >= movie.licenseCost
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  License
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked movies preview */}
      {(() => {
        const locked = allMovies.filter(m =>
          !currentMovies.includes(m.id) &&
          (resources.reputation < m.minReputation || state.time.day < m.releaseWeek * 7)
        );
        if (locked.length === 0) return null;
        return (
          <div>
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Coming Soon ({locked.length})
            </h4>
            <div className="space-y-1">
              {locked.slice(0, 5).map(movie => (
                <div
                  key={movie.id}
                  className="bg-slate-800/20 rounded-lg p-2 border border-slate-700/20 flex items-center gap-2 opacity-50"
                >
                  <span className="text-lg">{movie.icon}</span>
                  <span className="text-sm text-slate-500 flex-1">{movie.title}</span>
                  <span className="text-[10px] text-slate-600">
                    {resources.reputation < movie.minReputation
                      ? `Need ${movie.minReputation} rep`
                      : `Week ${movie.releaseWeek}`
                    }
                  </span>
                </div>
              ))}
              {locked.length > 5 && (
                <p className="text-xs text-slate-600 text-center">...and {locked.length - 5} more</p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
