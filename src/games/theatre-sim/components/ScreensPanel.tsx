import { useState } from 'react';
import type { Screen, ScreenQuality, LicensedMovie } from '../types';
import { movies as allMovies, screenUpgrades } from '../data';

interface Props {
  screens: Screen[];
  licensedMovies: LicensedMovie[];
  money: number;
  day: number;
  onAssignMovie: (screenId: string, movieId: string) => void;
  onRemoveMovie: (screenId: string) => void;
  onSetTicketPrice: (screenId: string, price: number) => void;
  onUpgradeScreen: (screenId: string, upgradeId: string) => void;
  onUnlockScreen: (screenId: string) => void;
  onRepairScreen: (screenId: string) => void;
  getUnlockCost: (index: number) => number;
  getRepairCost: (screen: Screen) => number;
}

const qualityColors: Record<ScreenQuality, string> = {
  basic: 'text-slate-400',
  standard: 'text-blue-400',
  premium: 'text-purple-400',
  imax: 'text-amber-400',
  dolby: 'text-red-400',
};

const qualityBg: Record<ScreenQuality, string> = {
  basic: 'bg-slate-700/50',
  standard: 'bg-blue-900/30',
  premium: 'bg-purple-900/30',
  imax: 'bg-amber-900/30',
  dolby: 'bg-red-900/30',
};

export function ScreensPanel({
  screens, licensedMovies, money, day,
  onAssignMovie, onRemoveMovie, onSetTicketPrice,
  onUpgradeScreen, onUnlockScreen, onRepairScreen,
  getUnlockCost, getRepairCost,
}: Props) {
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [showMoviePicker, setShowMoviePicker] = useState<string | null>(null);

  const activeScreens = screens.filter(s => s.unlocked && s.currentMovieId && !s.upgrading).length;
  const totalUnlocked = screens.filter(s => s.unlocked).length;
  const licensedIds = licensedMovies.map(lm => lm.movieId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Screens</h3>
        <span className="text-sm text-slate-400">{activeScreens} active</span>
      </div>

      <div className="grid gap-3">
        {screens.map((screen, index) => {
          const movie = screen.currentMovieId ? allMovies.find(m => m.id === screen.currentMovieId) : null;
          const licensed = screen.currentMovieId ? licensedMovies.find(lm => lm.movieId === screen.currentMovieId) : null;
          const daysLeft = licensed ? licensed.expiresDay - day : 0;
          const isSelected = selectedScreen === screen.id;
          const upgrades = screenUpgrades.filter(u => u.fromQuality === screen.quality);
          const repairCost = screen.unlocked ? getRepairCost(screen) : 0;

          if (!screen.unlocked) {
            const cost = getUnlockCost(index);
            return (
              <div key={screen.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl opacity-40">🔒</span>
                    <div>
                      <span className="text-slate-500 font-medium">{screen.name}</span>
                      <p className="text-xs text-slate-600">{screen.seats} seats</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUnlockScreen(screen.id)}
                    disabled={money < cost}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      money >= cost
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Unlock ${cost.toLocaleString()}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={screen.id}
              className={`rounded-xl border transition-all ${
                screen.upgrading
                  ? 'bg-yellow-900/10 border-yellow-800/30'
                  : isSelected
                  ? `${qualityBg[screen.quality]} border-slate-600`
                  : `bg-slate-800/50 border-slate-700/30 hover:border-slate-600/50`
              }`}
            >
              {/* Screen header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setSelectedScreen(isSelected ? null : screen.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{screen.upgrading ? '🚧' : movie ? '📽️' : '🎬'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{screen.name}</span>
                        <span className={`text-xs font-medium uppercase ${qualityColors[screen.quality]}`}>
                          {screen.quality}
                        </span>
                      </div>
                      {screen.upgrading ? (
                        <p className="text-xs text-yellow-400">
                          Upgrading... {screen.upgradeCompletesAt ? `${screen.upgradeCompletesAt - day}d left` : ''}
                        </p>
                      ) : movie ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400">
                            {movie.icon} {movie.title} — ${screen.ticketPrice.toFixed(2)}/ticket
                          </p>
                          {daysLeft > 0 && daysLeft <= 7 && (
                            <span className={`text-[10px] px-1 py-0.5 rounded ${
                              daysLeft <= 3 ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/40 text-amber-400'
                            }`}>
                              {daysLeft}d left
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No movie assigned</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{screen.seats} seats</p>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              screen.condition > 60 ? 'bg-green-500' :
                              screen.condition > 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${screen.condition}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{Math.floor(screen.condition)}%</span>
                      </div>
                    </div>
                    <span className="text-slate-500 text-sm">{isSelected ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isSelected && !screen.upgrading && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-3">
                  {/* Movie assignment */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {movie ? (
                      <>
                        <span className="text-sm text-slate-300">Now showing: {movie.icon} {movie.title}</span>
                        {licensed && (
                          <span className={`text-xs ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-slate-500'}`}>
                            (expires in {daysLeft}d)
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveMovie(screen.id)}
                          className="text-xs px-2 py-1 bg-red-900/40 text-red-400 rounded hover:bg-red-900/60"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowMoviePicker(showMoviePicker === screen.id ? null : screen.id)}
                        className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                      >
                        Assign Movie
                      </button>
                    )}
                  </div>

                  {/* Movie picker */}
                  {showMoviePicker === screen.id && licensedIds.length > 0 && (
                    <div className="bg-slate-900/50 rounded-lg p-2 space-y-1">
                      {licensedMovies.map(lm => {
                        const m = allMovies.find(mv => mv.id === lm.movieId);
                        if (!m) return null;
                        const isAssigned = screens.some(s => s.currentMovieId === lm.movieId);
                        const lmDaysLeft = lm.expiresDay - day;
                        return (
                          <button
                            key={lm.movieId}
                            onClick={() => { onAssignMovie(screen.id, lm.movieId); setShowMoviePicker(null); }}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-slate-700/50 text-left"
                          >
                            <span>{m.icon}</span>
                            <span className="text-sm text-white flex-1">{m.title}</span>
                            <span className="text-xs text-slate-400">Pop: {m.popularity}</span>
                            <span className={`text-[10px] ${lmDaysLeft <= 7 ? 'text-amber-400' : 'text-slate-500'}`}>
                              {lmDaysLeft}d
                            </span>
                            {isAssigned && <span className="text-[10px] text-yellow-500">SHOWING</span>}
                          </button>
                        );
                      })}
                      {licensedIds.length === 0 && (
                        <p className="text-xs text-slate-500 p-2">No movies licensed. Visit the Movies tab.</p>
                      )}
                    </div>
                  )}

                  {/* Ticket price */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Ticket Price:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSetTicketPrice(screen.id, screen.ticketPrice - 1)}
                        className="w-6 h-6 rounded bg-slate-700 text-white text-sm hover:bg-slate-600 flex items-center justify-center"
                      >−</button>
                      <span className="text-white font-medium w-12 text-center">${screen.ticketPrice.toFixed(0)}</span>
                      <button
                        onClick={() => onSetTicketPrice(screen.id, screen.ticketPrice + 1)}
                        className="w-6 h-6 rounded bg-slate-700 text-white text-sm hover:bg-slate-600 flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Showtimes */}
                  <div>
                    <span className="text-sm text-slate-400">Showtimes:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {screen.showtimeHours.map(h => (
                        <span key={h} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                          {h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Repair */}
                  {screen.condition < 90 && (
                    <button
                      onClick={() => onRepairScreen(screen.id)}
                      disabled={money < repairCost}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        money >= repairCost
                          ? 'bg-green-700 hover:bg-green-600 text-white'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      🔧 Repair to 100% — ${repairCost.toLocaleString()}
                    </button>
                  )}

                  {/* Screen upgrades */}
                  {upgrades.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Available Upgrades</span>
                      {totalUnlocked < 2 ? (
                        <p className="text-xs text-amber-400/70 italic">Unlock a second screen to access upgrades.</p>
                      ) : (
                        upgrades.map(upgrade => (
                          <div key={upgrade.id} className="flex items-center justify-between bg-slate-900/40 rounded-lg p-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{upgrade.icon}</span>
                                <span className="text-sm font-medium text-white">{upgrade.name}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{upgrade.description}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{upgrade.daysToComplete} days • {upgrade.seatsChange > 0 ? '+' : ''}{upgrade.seatsChange} seats</p>
                            </div>
                            <button
                              onClick={() => onUpgradeScreen(screen.id, upgrade.id)}
                              disabled={money < upgrade.cost}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ml-3 ${
                                money >= upgrade.cost
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              ${upgrade.cost.toLocaleString()}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
