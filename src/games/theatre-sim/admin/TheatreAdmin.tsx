import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, DollarSign, Film, Users, Popcorn, Wrench, HardHat, Building2, Clapperboard, Scale, Menu, X } from 'lucide-react';
import { OverviewPage } from './pages/OverviewPage';
import { EconomyPage } from './pages/EconomyPage';
import { MoviesPage } from './pages/MoviesPage';
import { StaffPage } from './pages/StaffPage';
import { ConcessionsPage } from './pages/ConcessionsPage';
import { UpgradesPage } from './pages/UpgradesPage';
import { RestorationPage } from './pages/RestorationPage';
import { FranchisePage } from './pages/FranchisePage';
import { CutscenesPage } from './pages/CutscenesPage';
import { BalancePage } from './pages/BalancePage';
import { useAdminState } from './useAdminState';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Game state snapshot' },
  { id: 'economy', label: 'Economy', icon: DollarSign, desc: 'Revenue, expenses, loan' },
  { id: 'movies', label: 'Movies', icon: Film, desc: 'Catalog & tier analysis' },
  { id: 'staff', label: 'Staff', icon: Users, desc: 'Roles, wages, efficiency' },
  { id: 'concessions', label: 'Concessions', icon: Popcorn, desc: 'Items & margins' },
  { id: 'upgrades', label: 'Upgrades', icon: Wrench, desc: 'Theatre & screen upgrades' },
  { id: 'restoration', label: 'Restoration', icon: HardHat, desc: 'Tasks & dependencies' },
  { id: 'franchise', label: 'Franchise', icon: Building2, desc: 'Locations & milestones' },
  { id: 'cutscenes', label: 'Cutscenes', icon: Clapperboard, desc: 'Narrative sequences' },
  { id: 'balance', label: 'Balance', icon: Scale, desc: 'Tuning & progression' },
] as const;

type PageId = typeof NAV_ITEMS[number]['id'];

export function TheatreAdmin() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const gameState = useAdminState();

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage state={gameState} />;
      case 'economy': return <EconomyPage state={gameState} />;
      case 'movies': return <MoviesPage state={gameState} />;
      case 'staff': return <StaffPage state={gameState} />;
      case 'concessions': return <ConcessionsPage state={gameState} />;
      case 'upgrades': return <UpgradesPage state={gameState} />;
      case 'restoration': return <RestorationPage state={gameState} />;
      case 'franchise': return <FranchisePage state={gameState} />;
      case 'cutscenes': return <CutscenesPage state={gameState} />;
      case 'balance': return <BalancePage state={gameState} />;
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.id === activePage)!;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-0'} flex-shrink-0 transition-all duration-200 overflow-hidden`}>
        <div className="w-56 h-screen sticky top-0 bg-slate-900/80 border-r border-slate-800/60 flex flex-col">
          {/* Sidebar header */}
          <div className="px-3 py-4 border-b border-slate-800/60">
            <Link
              to="/play/theatre-sim"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition-colors mb-2"
            >
              <ArrowLeft size={12} />
              Back to Game
            </Link>
            <h1 className="text-sm font-bold text-amber-400 tracking-wide">Theatre Admin</h1>
            <p className="text-[10px] text-slate-600 mt-0.5">Tuning & Balance Dashboard</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-all text-sm ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-amber-400' : 'text-slate-600'} />
                  <div>
                    <div className="font-medium leading-tight">{item.label}</div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-amber-400/60' : 'text-slate-600'}`}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Game status footer */}
          {gameState && (
            <div className="px-3 py-3 border-t border-slate-800/60 text-[10px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Day</span>
                <span className="text-slate-400">{gameState.time.day}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash</span>
                <span className="text-green-400">${gameState.resources.money.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Phase</span>
                <span className="text-amber-400 capitalize">{gameState.phase}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-500 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex items-center gap-2">
            <activeItem.icon size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold">{activeItem.label}</h2>
            <span className="text-xs text-slate-600">— {activeItem.desc}</span>
          </div>
          {!gameState && (
            <span className="ml-auto text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded">
              No save data — start a game first
            </span>
          )}
        </div>

        {/* Page content */}
        <div className="p-4 max-w-6xl">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
