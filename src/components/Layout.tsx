import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/games?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="glass mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-surface-400 text-sm">
              GameHub - Your destination for quality games
            </p>
            <div className="flex items-center gap-4 text-surface-500 text-sm">
              <span>Built with React + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
