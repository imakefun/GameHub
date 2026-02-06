import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { soundEngine } from '../systems/SoundEngine';

// Tutorial definitions for each mechanic introduction
export const TUTORIALS: Record<string, {
  title: string;
  description: string;
  icon: string;
  tips: string[];
}> = {
  // Basic mechanics
  basics: {
    title: 'Welcome to Gem Miner!',
    description: 'Match 3 or more gems of the same type to collect them and score points.',
    icon: '💎',
    tips: [
      'Swipe or tap to swap adjacent gems',
      'Match 4+ gems for special gems',
      'Complete objectives before running out of moves',
    ],
  },
  collect_gems: {
    title: 'Collection Goal',
    description: 'Some levels require collecting specific gem types.',
    icon: '🎯',
    tips: [
      'Check the objective bar to see which gems to collect',
      'Focus on matching the required gem colors',
      'Every match of that gem counts toward your goal',
    ],
  },

  // Blockers
  ice: {
    title: 'Ice Blocks',
    description: 'Gems trapped in ice cannot be swapped! Match adjacent gems to break the ice.',
    icon: '🧊',
    tips: [
      'Ice blocks freeze gems in place',
      'Match gems NEXT TO ice to break it',
      'Some ice has multiple layers',
    ],
  },
  dirt: {
    title: 'Dirt Tiles',
    description: 'Dirt covers the board. Match gems ON TOP of dirt to clear it.',
    icon: '🟫',
    tips: [
      'Dirt is cleared when you match on it',
      'Clear dirt to reveal more of the board',
      'Cascading matches clear dirt efficiently',
    ],
  },
  rock: {
    title: 'Rock Obstacles',
    description: 'Boulders block the board. Match adjacent gems to break rocks.',
    icon: '🪨',
    tips: [
      'Rocks cannot be moved or swapped',
      'Match gems NEXT TO rocks to destroy them',
      'Power-ups are very effective against rocks',
    ],
  },
  locked: {
    title: 'Locked Gems',
    description: 'Some gems are locked in chains! Match adjacent gems to unlock them.',
    icon: '🔒',
    tips: [
      'Locked gems cannot be swapped',
      'Match adjacent gems to free them',
      'Once unlocked, they behave normally',
    ],
  },
  bedrock: {
    title: 'Bedrock',
    description: 'Unbreakable bedrock shapes the playing field. Work around it!',
    icon: '⬛',
    tips: [
      'Bedrock CANNOT be destroyed',
      'Plan your moves around bedrock positions',
      'Use bedrock walls to your advantage',
    ],
  },

  // New gems
  amethyst: {
    title: 'Amethyst Gem',
    description: 'A new purple gem joins your collection!',
    icon: '🟣',
    tips: [
      'More gem types means more variety',
      'Matches may be harder to find',
      'Look for cascading opportunities',
    ],
  },
  diamond: {
    title: 'Diamond Gem',
    description: 'Rare and valuable diamonds appear in deeper mines!',
    icon: '💎',
    tips: [
      'Diamonds are worth extra points',
      'They appear less frequently',
      'Collect them for big bonuses',
    ],
  },
  obsidian: {
    title: 'Obsidian Gem',
    description: 'Dark obsidian gems from the volcanic depths!',
    icon: '⚫',
    tips: [
      'Obsidian is the rarest gem type',
      'Having 7 gem types is challenging',
      'Plan your matches carefully',
    ],
  },

  // Special gems
  special_gems: {
    title: 'Special Gems',
    description: 'Match 4+ gems to create powerful special gems!',
    icon: '⭐',
    tips: [
      'Match 4 in a row: Striped gem (clears row/column)',
      'Match in L or T shape: Bomb gem (3x3 explosion)',
      'Match 5 in a row: Prismatic gem (clears all of one color)',
    ],
  },

  // Power-ups
  powerups: {
    title: 'Power-Ups',
    description: 'Use mining tools to help clear tough obstacles!',
    icon: '🔧',
    tips: [
      'Pickaxe: Destroy a single cell',
      'Dynamite: Clear a 3x3 area',
      'Drill: Clear an entire column',
      'Earthquake: Shuffle the board',
      'Lantern: Show a hint',
    ],
  },
};

// Track which tutorials have been shown (persisted in localStorage)
const TUTORIAL_STORAGE_KEY = 'gem-miner-tutorials-seen';

export function getSeenTutorials(): Set<string> {
  try {
    const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function markTutorialSeen(key: string): void {
  const seen = getSeenTutorials();
  seen.add(key);
  localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify([...seen]));
}

export function resetTutorials(): void {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
}

interface TutorialPopupProps {
  tutorialKey: string | null;
  onClose: () => void;
}

export function TutorialPopup({ tutorialKey, onClose }: TutorialPopupProps) {
  const tutorial = tutorialKey ? TUTORIALS[tutorialKey] : null;

  const handleClose = () => {
    if (tutorialKey) {
      markTutorialSeen(tutorialKey);
    }
    soundEngine.play('buttonClick');
    onClose();
  };

  return (
    <AnimatePresence>
      {tutorial && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-700"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-stone-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <motion.div
              className="text-5xl text-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            >
              {tutorial.icon}
            </motion.div>

            {/* Title */}
            <h2 className="text-xl font-bold text-amber-400 text-center mb-2">
              {tutorial.title}
            </h2>

            {/* Description */}
            <p className="text-stone-300 text-center mb-4">
              {tutorial.description}
            </p>

            {/* Tips */}
            <div className="space-y-2 mb-6">
              {tutorial.tips.map((tip, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 text-sm text-stone-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </motion.div>
              ))}
            </div>

            {/* Got it button */}
            <motion.button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got it!
            </motion.button>

            {/* Skip hint */}
            <p className="text-xs text-stone-600 text-center mt-3">
              Tap anywhere to skip
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to determine which tutorial should show for a level
export function getTutorialForLevel(levelId: number): string | null {
  const seen = getSeenTutorials();

  // Define tutorial triggers by level
  const levelTutorials: Record<number, string> = {
    1: 'basics',
    4: 'collect_gems',
    6: 'ice',
    11: 'dirt',
    21: 'rock',
    27: 'amethyst',
    31: 'locked',
    37: 'diamond',
    41: 'bedrock',
    47: 'obsidian',
    5: 'special_gems',
    3: 'powerups',
  };

  const tutorial = levelTutorials[levelId];
  if (tutorial && !seen.has(tutorial)) {
    return tutorial;
  }

  return null;
}
