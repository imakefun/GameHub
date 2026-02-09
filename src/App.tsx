import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { LeaderboardsPage } from './pages/LeaderboardsPage';
import { Alchemoji } from './games/alchemoji/Alchemoji';
import { FarmingSim } from './games/farming-sim/FarmingSim';
import { CapitalismSim } from './games/capitalism-sim/CapitalismSim';
import { GemMiner } from './games/gem-miner/GemMiner';
import { CreaturesOfTheNight } from './games/creatures-of-the-night/CreaturesOfTheNight';
import { AdminPanel } from './games/creatures-of-the-night/components/AdminPanel';

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
        <Route path="/play/farming-sim" element={<FarmingSim />} />
        <Route path="/play/capitalism-sim" element={<CapitalismSim />} />
        <Route path="/play/gem-miner" element={<GemMiner />} />
        <Route path="/play/creatures-of-the-night" element={<CreaturesOfTheNight />} />
        <Route path="/play/creatures-of-the-night/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
