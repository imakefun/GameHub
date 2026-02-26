import type { Movie } from '../types';

export const movies: Movie[] = [
  // === Wave 1: Available from the start (Week 0) ===
  { id: 'retro-nights', title: 'Retro Nights', genre: 'comedy', icon: '😂', popularity: 45, licenseCost: 200, minReputation: 0, releaseWeek: 0, durationWeeks: 4, qualityRating: 3 },
  { id: 'whispers-in-dark', title: 'Whispers in the Dark', genre: 'horror', icon: '👻', popularity: 50, licenseCost: 250, minReputation: 0, releaseWeek: 0, durationWeeks: 3, qualityRating: 3 },
  { id: 'love-letter', title: 'The Love Letter', genre: 'romance', icon: '💕', popularity: 40, licenseCost: 180, minReputation: 0, releaseWeek: 0, durationWeeks: 4, qualityRating: 2 },
  { id: 'tiny-adventures', title: 'Tiny Adventures', genre: 'animation', icon: '🧸', popularity: 55, licenseCost: 300, minReputation: 5, releaseWeek: 0, durationWeeks: 5, qualityRating: 3 },

  // === Wave 2: Week 2 ===
  { id: 'night-patrol', title: 'Night Patrol', genre: 'action', icon: '🔫', popularity: 48, licenseCost: 280, minReputation: 0, releaseWeek: 2, durationWeeks: 3, qualityRating: 3 },
  { id: 'the-recipe', title: 'The Recipe', genre: 'comedy', icon: '👨‍🍳', popularity: 42, licenseCost: 220, minReputation: 0, releaseWeek: 2, durationWeeks: 4, qualityRating: 3 },

  // === Wave 3: Week 4 ===
  { id: 'cold-case', title: 'Cold Case', genre: 'thriller', icon: '🔍', popularity: 52, licenseCost: 320, minReputation: 10, releaseWeek: 4, durationWeeks: 3, qualityRating: 3 },
  { id: 'summer-breeze', title: 'Summer Breeze', genre: 'romance', icon: '🌊', popularity: 44, licenseCost: 240, minReputation: 5, releaseWeek: 4, durationWeeks: 4, qualityRating: 3 },
  { id: 'bug-life', title: 'A Bug\'s World', genre: 'animation', icon: '🐛', popularity: 58, licenseCost: 350, minReputation: 10, releaseWeek: 4, durationWeeks: 5, qualityRating: 4 },

  // === Wave 4: Week 7 ===
  { id: 'steel-horizon', title: 'Steel Horizon', genre: 'action', icon: '💥', popularity: 65, licenseCost: 500, minReputation: 20, releaseWeek: 7, durationWeeks: 4, qualityRating: 4 },
  { id: 'the-verdict', title: 'The Verdict', genre: 'drama', icon: '⚖️', popularity: 55, licenseCost: 400, minReputation: 20, releaseWeek: 7, durationWeeks: 5, qualityRating: 4 },
  { id: 'crimson-chase', title: 'Crimson Chase', genre: 'thriller', icon: '🔪', popularity: 58, licenseCost: 380, minReputation: 15, releaseWeek: 7, durationWeeks: 3, qualityRating: 3 },

  // === Wave 5: Week 10 ===
  { id: 'space-cadets', title: 'Space Cadets', genre: 'comedy', icon: '🚀', popularity: 52, licenseCost: 360, minReputation: 15, releaseWeek: 10, durationWeeks: 4, qualityRating: 3 },
  { id: 'the-haunting', title: 'The Haunting of Elm Manor', genre: 'horror', icon: '🏚️', popularity: 56, licenseCost: 400, minReputation: 15, releaseWeek: 10, durationWeeks: 3, qualityRating: 4 },
  { id: 'lost-in-paris', title: 'Lost in Paris', genre: 'romance', icon: '🗼', popularity: 50, licenseCost: 340, minReputation: 15, releaseWeek: 10, durationWeeks: 4, qualityRating: 4 },

  // === Wave 6: Week 14 ===
  { id: 'quantum-rift', title: 'Quantum Rift', genre: 'scifi', icon: '🌀', popularity: 60, licenseCost: 450, minReputation: 25, releaseWeek: 14, durationWeeks: 4, qualityRating: 4 },
  { id: 'laugh-riot', title: 'Laugh Riot', genre: 'comedy', icon: '🤣', popularity: 60, licenseCost: 420, minReputation: 20, releaseWeek: 14, durationWeeks: 3, qualityRating: 3 },
  { id: 'robot-pals', title: 'Robot Pals', genre: 'animation', icon: '🤖', popularity: 70, licenseCost: 550, minReputation: 25, releaseWeek: 14, durationWeeks: 5, qualityRating: 4 },

  // === Wave 7: Week 18 ===
  { id: 'deep-blue', title: 'Deep Blue', genre: 'thriller', icon: '🦈', popularity: 62, licenseCost: 480, minReputation: 25, releaseWeek: 18, durationWeeks: 3, qualityRating: 4 },
  { id: 'rebel-road', title: 'Rebel Road', genre: 'action', icon: '🏍️', popularity: 64, licenseCost: 520, minReputation: 25, releaseWeek: 18, durationWeeks: 4, qualityRating: 4 },
  { id: 'family-recipe', title: 'The Family Recipe', genre: 'drama', icon: '🍝', popularity: 48, licenseCost: 360, minReputation: 20, releaseWeek: 18, durationWeeks: 5, qualityRating: 4 },

  // === Wave 8: Week 21 ===
  { id: 'broken-strings', title: 'Broken Strings', genre: 'drama', icon: '🎻', popularity: 65, licenseCost: 600, minReputation: 35, releaseWeek: 21, durationWeeks: 5, qualityRating: 5 },
  { id: 'camp-nightmare', title: 'Camp Nightmare', genre: 'horror', icon: '🏕️', popularity: 70, licenseCost: 650, minReputation: 35, releaseWeek: 21, durationWeeks: 3, qualityRating: 4 },
  { id: 'forever-yours', title: 'Forever Yours', genre: 'romance', icon: '💍', popularity: 62, licenseCost: 500, minReputation: 30, releaseWeek: 21, durationWeeks: 4, qualityRating: 4 },

  // === Wave 9: Week 25 ===
  { id: 'iron-justice', title: 'Iron Justice', genre: 'action', icon: '🛡️', popularity: 72, licenseCost: 700, minReputation: 35, releaseWeek: 25, durationWeeks: 4, qualityRating: 4 },
  { id: 'pixel-heroes', title: 'Pixel Heroes', genre: 'animation', icon: '🎮', popularity: 68, licenseCost: 620, minReputation: 30, releaseWeek: 25, durationWeeks: 5, qualityRating: 4 },
  { id: 'mind-games', title: 'Mind Games', genre: 'thriller', icon: '🧠', popularity: 66, licenseCost: 580, minReputation: 30, releaseWeek: 25, durationWeeks: 3, qualityRating: 4 },

  // === Wave 10: Week 28 ===
  { id: 'galactic-war', title: 'Galactic War', genre: 'scifi', icon: '⚔️', popularity: 80, licenseCost: 900, minReputation: 40, releaseWeek: 28, durationWeeks: 5, qualityRating: 5 },
  { id: 'midnight-heist', title: 'Midnight Heist', genre: 'action', icon: '🎭', popularity: 75, licenseCost: 800, minReputation: 40, releaseWeek: 28, durationWeeks: 4, qualityRating: 4 },

  // === Wave 11: Week 32 ===
  { id: 'neon-nights', title: 'Neon Nights', genre: 'scifi', icon: '🌃', popularity: 72, licenseCost: 750, minReputation: 40, releaseWeek: 32, durationWeeks: 4, qualityRating: 4 },
  { id: 'last-summer', title: 'Last Summer', genre: 'drama', icon: '☀️', popularity: 60, licenseCost: 550, minReputation: 35, releaseWeek: 32, durationWeeks: 4, qualityRating: 4 },
  { id: 'howl', title: 'Howl', genre: 'horror', icon: '🐺', popularity: 74, licenseCost: 720, minReputation: 35, releaseWeek: 32, durationWeeks: 3, qualityRating: 5 },

  // === Wave 12: Week 35 ===
  { id: 'the-last-laugh', title: 'The Last Laugh', genre: 'comedy', icon: '🎪', popularity: 85, licenseCost: 1100, minReputation: 55, releaseWeek: 35, durationWeeks: 4, qualityRating: 5 },
  { id: 'shadow-syndicate', title: 'Shadow Syndicate', genre: 'thriller', icon: '🕵️', popularity: 82, licenseCost: 1000, minReputation: 55, releaseWeek: 35, durationWeeks: 3, qualityRating: 5 },

  // === Wave 13: Week 39 ===
  { id: 'ocean-kingdom', title: 'Ocean Kingdom', genre: 'animation', icon: '🐠', popularity: 78, licenseCost: 880, minReputation: 50, releaseWeek: 39, durationWeeks: 5, qualityRating: 5 },
  { id: 'final-stand', title: 'Final Stand', genre: 'action', icon: '🏴', popularity: 84, licenseCost: 1050, minReputation: 50, releaseWeek: 39, durationWeeks: 4, qualityRating: 5 },
  { id: 'heartstrings', title: 'Heartstrings', genre: 'romance', icon: '🎵', popularity: 68, licenseCost: 700, minReputation: 45, releaseWeek: 39, durationWeeks: 4, qualityRating: 5 },

  // === Wave 14: Week 42 — Blockbusters ===
  { id: 'titan-rising', title: 'Titan Rising', genre: 'action', icon: '⚡', popularity: 90, licenseCost: 1400, minReputation: 60, releaseWeek: 42, durationWeeks: 5, qualityRating: 5 },
  { id: 'dreamworld', title: 'Dreamworld', genre: 'animation', icon: '✨', popularity: 92, licenseCost: 1600, minReputation: 65, releaseWeek: 42, durationWeeks: 6, qualityRating: 5 },

  // === Wave 15: Week 46 ===
  { id: 'code-red', title: 'Code Red', genre: 'thriller', icon: '🚨', popularity: 86, licenseCost: 1200, minReputation: 60, releaseWeek: 46, durationWeeks: 3, qualityRating: 5 },
  { id: 'the-great-escape', title: 'The Great Escape', genre: 'comedy', icon: '🎈', popularity: 80, licenseCost: 1050, minReputation: 55, releaseWeek: 46, durationWeeks: 4, qualityRating: 5 },

  // === Wave 16: Week 49 — Late-game blockbusters ===
  { id: 'beyond-the-stars', title: 'Beyond the Stars', genre: 'scifi', icon: '🌌', popularity: 95, licenseCost: 1800, minReputation: 70, releaseWeek: 49, durationWeeks: 5, qualityRating: 5 },
  { id: 'legacy', title: 'Legacy', genre: 'drama', icon: '👑', popularity: 88, licenseCost: 1500, minReputation: 65, releaseWeek: 49, durationWeeks: 5, qualityRating: 5 },

  // === Wave 17: Week 52+ — Endgame ===
  { id: 'infinity-dawn', title: 'Infinity Dawn', genre: 'scifi', icon: '🌅', popularity: 94, licenseCost: 1700, minReputation: 75, releaseWeek: 52, durationWeeks: 5, qualityRating: 5 },
  { id: 'world-tour', title: 'World Tour', genre: 'animation', icon: '🌍', popularity: 90, licenseCost: 1500, minReputation: 70, releaseWeek: 55, durationWeeks: 6, qualityRating: 5 },
  { id: 'the-finale', title: 'The Finale', genre: 'action', icon: '💫', popularity: 96, licenseCost: 2000, minReputation: 80, releaseWeek: 58, durationWeeks: 4, qualityRating: 5 },
];
