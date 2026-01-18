export type GameCategory =
  | 'arcade'
  | 'puzzle'
  | 'action'
  | 'strategy'
  | 'adventure'
  | 'casual'
  | 'multiplayer';

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: GameCategory;
  tags: string[];
  playCount: number;
  rating: number;
  featured: boolean;
  createdAt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  playerName: string;
  score: number;
  achievedAt: string;
  rank: number;
}

export interface GameStats {
  totalPlays: number;
  uniquePlayers: number;
  avgScore: number;
  highScore: number;
}

export const categoryInfo: Record<GameCategory, { label: string; color: string; icon: string }> = {
  arcade: { label: 'Arcade', color: 'bg-yellow-500', icon: 'Joystick' },
  puzzle: { label: 'Puzzle', color: 'bg-blue-500', icon: 'Puzzle' },
  action: { label: 'Action', color: 'bg-red-500', icon: 'Zap' },
  strategy: { label: 'Strategy', color: 'bg-green-500', icon: 'Brain' },
  adventure: { label: 'Adventure', color: 'bg-purple-500', icon: 'Compass' },
  casual: { label: 'Casual', color: 'bg-pink-500', icon: 'Heart' },
  multiplayer: { label: 'Multiplayer', color: 'bg-orange-500', icon: 'Users' },
};
