import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { LeaderboardsPage } from './pages/LeaderboardsPage';
import { Alchemoji } from './games/alchemoji/Alchemoji';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="games/:id" element={<GameDetailPage />} />
          <Route path="leaderboards" element={<LeaderboardsPage />} />
        </Route>
        {/* Playable Games */}
        <Route path="/play/alchemoji" element={<Alchemoji />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
