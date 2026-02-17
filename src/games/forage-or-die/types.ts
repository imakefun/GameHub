export type GameState = 'title' | 'playing' | 'outcome' | 'gameover' | 'victory';

export interface PlayerStats {
  hunger: number;
  health: number;
  hydration: number;
}

export interface ForageOption {
  name: string;
  emoji: string;
  accentColor: string;
  description: string;
  fact: string;
  effects: {
    hunger: number;
    health: number;
    hydration: number;
  };
  outcome: string;
  safe: boolean;
}

export interface Encounter {
  id: number;
  biome: string;
  description: string;
  optionA: ForageOption;
  optionB: ForageOption;
}

export interface JournalEntry {
  day: number;
  biome: string;
  species: string;
  safe: boolean;
  fact: string;
  emoji: string;
}
