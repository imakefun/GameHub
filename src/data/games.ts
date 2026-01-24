import type { Game, LeaderboardEntry } from '../types/game';

export const games: Game[] = [
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    description: 'Defend Earth from waves of alien invaders in this classic arcade shooter. Dodge enemy fire and destroy all aliens before they reach the ground.',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop',
    category: 'arcade',
    tags: ['retro', 'shooter', 'classic'],
    playCount: 15420,
    rating: 4.8,
    featured: true,
    createdAt: '2024-01-15',
    difficulty: 'medium',
  },
  {
    id: 'tetris-classic',
    title: 'Tetris Classic',
    description: 'The timeless puzzle game. Rotate and place falling blocks to complete lines and score points. How long can you survive?',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=300&fit=crop',
    category: 'puzzle',
    tags: ['retro', 'blocks', 'classic'],
    playCount: 23150,
    rating: 4.9,
    featured: true,
    createdAt: '2024-01-10',
    difficulty: 'easy',
  },
  {
    id: 'neon-racer',
    title: 'Neon Racer',
    description: 'Race through futuristic neon-lit tracks at breakneck speeds. Collect power-ups and avoid obstacles in this high-octane action game.',
    thumbnail: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop',
    category: 'action',
    tags: ['racing', 'neon', 'fast'],
    playCount: 8930,
    rating: 4.5,
    featured: true,
    createdAt: '2024-02-01',
    difficulty: 'hard',
  },
  {
    id: 'chess-master',
    title: 'Chess Master',
    description: 'Challenge your mind with the ultimate strategy game. Play against AI opponents of varying difficulty or practice your openings.',
    thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop',
    category: 'strategy',
    tags: ['chess', 'board', 'classic'],
    playCount: 12340,
    rating: 4.7,
    featured: false,
    createdAt: '2024-01-20',
    difficulty: 'hard',
  },
  {
    id: 'bubble-pop',
    title: 'Bubble Pop',
    description: 'Match and pop colorful bubbles in this addictive casual game. Create chain reactions for massive scores!',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'casual',
    tags: ['match-3', 'colorful', 'relaxing'],
    playCount: 18760,
    rating: 4.4,
    featured: false,
    createdAt: '2024-02-05',
    difficulty: 'easy',
  },
  {
    id: 'dungeon-crawler',
    title: 'Dungeon Crawler',
    description: 'Explore mysterious dungeons, defeat monsters, and collect treasures. Each run is different with procedurally generated levels.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    category: 'adventure',
    tags: ['roguelike', 'rpg', 'dungeon'],
    playCount: 9870,
    rating: 4.6,
    featured: true,
    createdAt: '2024-02-10',
    difficulty: 'medium',
  },
  {
    id: 'snake-evolved',
    title: 'Snake Evolved',
    description: 'The classic snake game reimagined with modern graphics and new mechanics. Grow your snake and dominate the arena.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    category: 'arcade',
    tags: ['retro', 'snake', 'classic'],
    playCount: 14230,
    rating: 4.3,
    featured: false,
    createdAt: '2024-01-25',
    difficulty: 'easy',
  },
  {
    id: 'word-wizard',
    title: 'Word Wizard',
    description: 'Test your vocabulary in this challenging word puzzle game. Find hidden words and climb the leaderboards.',
    thumbnail: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400&h=300&fit=crop',
    category: 'puzzle',
    tags: ['words', 'educational', 'brain'],
    playCount: 7650,
    rating: 4.5,
    featured: false,
    createdAt: '2024-02-15',
    difficulty: 'medium',
  },
  {
    id: 'battle-tanks',
    title: 'Battle Tanks',
    description: 'Command your tank in intense multiplayer battles. Upgrade your arsenal and crush your opponents.',
    thumbnail: 'https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=400&h=300&fit=crop',
    category: 'multiplayer',
    tags: ['tanks', 'pvp', 'action'],
    playCount: 11240,
    rating: 4.6,
    featured: false,
    createdAt: '2024-02-20',
    difficulty: 'medium',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Train your brain with this classic memory game. Match pairs of cards and improve your concentration.',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop',
    category: 'casual',
    tags: ['memory', 'brain', 'cards'],
    playCount: 6890,
    rating: 4.2,
    featured: false,
    createdAt: '2024-02-25',
    difficulty: 'easy',
  },
  {
    id: 'asteroid-miner',
    title: 'Asteroid Miner',
    description: 'Mine valuable resources from asteroids while avoiding space hazards. Build your fleet and become a space tycoon.',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop',
    category: 'strategy',
    tags: ['space', 'mining', 'simulation'],
    playCount: 5430,
    rating: 4.4,
    featured: false,
    createdAt: '2024-03-01',
    difficulty: 'hard',
  },
  {
    id: 'ninja-dash',
    title: 'Ninja Dash',
    description: 'Run, jump, and slash through endless obstacles as a nimble ninja. Collect coins and unlock new characters.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    category: 'action',
    tags: ['runner', 'ninja', 'endless'],
    playCount: 16780,
    rating: 4.5,
    featured: false,
    createdAt: '2024-03-05',
    difficulty: 'medium',
  },
  {
    id: 'alchemoji',
    title: 'Alchemoji',
    description: 'An emoji crafting idle game! Manage generators, discover recipes, and forge new elements. Combine fire, water, earth, and air to create legendary creatures and celestial objects.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    category: 'idle',
    tags: ['crafting', 'idle', 'discovery', 'emoji'],
    playCount: 0,
    rating: 5.0,
    featured: true,
    createdAt: '2025-01-18',
    difficulty: 'easy',
    playUrl: '/play/alchemoji',
  },
  {
    id: 'farming-sim',
    title: 'Farm Valley',
    description: 'Build your dream farm! Plant crops, raise animals, grow fruit trees, and process goods. Complete orders for customers and trade with wandering merchants for premium prices.',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    category: 'idle',
    tags: ['farming', 'simulation', 'idle', 'crafting', 'management'],
    playCount: 0,
    rating: 5.0,
    featured: true,
    createdAt: '2025-01-24',
    difficulty: 'easy',
    playUrl: '/play/farming-sim',
  },
];

export const leaderboards: Record<string, LeaderboardEntry[]> = {
  'space-invaders': [
    { id: '1', gameId: 'space-invaders', playerName: 'NeoX', score: 125000, achievedAt: '2024-03-10', rank: 1 },
    { id: '2', gameId: 'space-invaders', playerName: 'StarSlayer', score: 118500, achievedAt: '2024-03-09', rank: 2 },
    { id: '3', gameId: 'space-invaders', playerName: 'CosmicKing', score: 112000, achievedAt: '2024-03-08', rank: 3 },
    { id: '4', gameId: 'space-invaders', playerName: 'PixelHero', score: 98750, achievedAt: '2024-03-07', rank: 4 },
    { id: '5', gameId: 'space-invaders', playerName: 'RetroGamer', score: 95200, achievedAt: '2024-03-06', rank: 5 },
    { id: '6', gameId: 'space-invaders', playerName: 'SpaceAce', score: 89000, achievedAt: '2024-03-05', rank: 6 },
    { id: '7', gameId: 'space-invaders', playerName: 'BlasterPro', score: 85500, achievedAt: '2024-03-04', rank: 7 },
    { id: '8', gameId: 'space-invaders', playerName: 'GalaxyQueen', score: 82100, achievedAt: '2024-03-03', rank: 8 },
    { id: '9', gameId: 'space-invaders', playerName: 'AlienHunter', score: 78900, achievedAt: '2024-03-02', rank: 9 },
    { id: '10', gameId: 'space-invaders', playerName: 'VoidWalker', score: 75000, achievedAt: '2024-03-01', rank: 10 },
  ],
  'tetris-classic': [
    { id: '1', gameId: 'tetris-classic', playerName: 'BlockMaster', score: 999999, achievedAt: '2024-03-10', rank: 1 },
    { id: '2', gameId: 'tetris-classic', playerName: 'TetrisGod', score: 875000, achievedAt: '2024-03-09', rank: 2 },
    { id: '3', gameId: 'tetris-classic', playerName: 'LineKing', score: 720000, achievedAt: '2024-03-08', rank: 3 },
    { id: '4', gameId: 'tetris-classic', playerName: 'PuzzlePro', score: 650000, achievedAt: '2024-03-07', rank: 4 },
    { id: '5', gameId: 'tetris-classic', playerName: 'StackAttack', score: 580000, achievedAt: '2024-03-06', rank: 5 },
  ],
  'neon-racer': [
    { id: '1', gameId: 'neon-racer', playerName: 'SpeedDemon', score: 9999, achievedAt: '2024-03-10', rank: 1 },
    { id: '2', gameId: 'neon-racer', playerName: 'NeonNinja', score: 9750, achievedAt: '2024-03-09', rank: 2 },
    { id: '3', gameId: 'neon-racer', playerName: 'TurboKing', score: 9500, achievedAt: '2024-03-08', rank: 3 },
    { id: '4', gameId: 'neon-racer', playerName: 'RoadRunner', score: 9250, achievedAt: '2024-03-07', rank: 4 },
    { id: '5', gameId: 'neon-racer', playerName: 'DriftMaster', score: 9000, achievedAt: '2024-03-06', rank: 5 },
  ],
};

export const getGameById = (id: string): Game | undefined => {
  return games.find((game) => game.id === id);
};

export const getLeaderboard = (gameId: string): LeaderboardEntry[] => {
  return leaderboards[gameId] || [];
};

export const getFeaturedGames = (): Game[] => {
  return games.filter((game) => game.featured);
};

export const getGamesByCategory = (category: string): Game[] => {
  if (category === 'all') return games;
  return games.filter((game) => game.category === category);
};

export const searchGames = (query: string): Game[] => {
  const lowerQuery = query.toLowerCase();
  return games.filter(
    (game) =>
      game.title.toLowerCase().includes(lowerQuery) ||
      game.description.toLowerCase().includes(lowerQuery) ||
      game.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
