// ============================================================
// Creatures of the Night - Type Definitions
// ============================================================

// --- Card Tiers ---
export type CardTier = 'twilight' | 'dusk' | 'midnight' | 'umbral' | 'eternal';

export const TIER_ORDER: CardTier[] = ['twilight', 'dusk', 'midnight', 'umbral', 'eternal'];

export const TIER_MAX_LEVEL: Record<CardTier, number> = {
  twilight: 20,
  dusk: 30,
  midnight: 40,
  umbral: 60,
  eternal: 80,
};

export const TIER_LABELS: Record<CardTier, string> = {
  twilight: 'Twilight',
  dusk: 'Dusk',
  midnight: 'Midnight',
  umbral: 'Umbral',
  eternal: 'Eternal',
};

export const TIER_COLORS: Record<CardTier, string> = {
  twilight: '#a78bfa',   // violet-400
  dusk: '#60a5fa',       // blue-400
  midnight: '#c084fc',   // purple-400
  umbral: '#f472b6',     // pink-400
  eternal: '#fbbf24',    // amber-400
};

// --- Card Types ---
export type CardType =
  | 'beast'
  | 'spirit'
  | 'shadow'
  | 'fae'
  | 'blood'
  | 'magic'
  | 'necromancy'
  | 'cursed'
  | 'lycanthrope'
  | 'undead'
  | 'stone'
  | 'infernal';

export const CARD_TYPE_INFO: Record<CardType, { label: string; emoji: string; description: string }> = {
  beast: { label: 'Beast', emoji: '🐺', description: 'Natural animals with supernatural enhancements' },
  spirit: { label: 'Spirit', emoji: '👻', description: 'Non-corporeal entities and ghosts' },
  shadow: { label: 'Shadow', emoji: '🌑', description: 'Beings composed of or controlling darkness' },
  fae: { label: 'Fae', emoji: '🧚', description: 'Fairy-like creatures with magical abilities' },
  blood: { label: 'Blood', emoji: '🩸', description: 'Vampiric entities and blood magic users' },
  magic: { label: 'Magic', emoji: '🔮', description: 'Witches, wizards, and magical constructs' },
  necromancy: { label: 'Necromancy', emoji: '💀', description: 'Death magic practitioners and their creations' },
  cursed: { label: 'Cursed', emoji: '🌀', description: 'Beings affected by supernatural curses' },
  lycanthrope: { label: 'Lycanthrope', emoji: '🐾', description: 'Werewolves and shape-shifters' },
  undead: { label: 'Undead', emoji: '🧟', description: 'Reanimated dead and corporeal spirits' },
  stone: { label: 'Stone', emoji: '🗿', description: 'Animated earth and mineral constructs' },
  infernal: { label: 'Infernal', emoji: '😈', description: 'Demons and hellish creatures' },
};

// --- Card Definition (from data/sheets) ---
export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  tier: CardTier;
  baseEssenceRate: number;       // essence per minute
  baseInterval: number;          // seconds between collections
  description: string;
  flavorText: string;
  artUrl?: string;               // optional card art path
}

// --- Owned Card Instance (player's copy) ---
export interface OwnedCard {
  definitionId: string;
  level: number;
  experience: number;
  placedInCrypt: boolean;
  lastCollected: number;         // timestamp
  accumulatedEssence: number;    // uncollected essence
  isOnExpedition: boolean;
}

// --- Currencies ---
export interface Currencies {
  shadowEssence: number;
  soulShards: number;
  lunarCrystals: number;
  voidEnergy: number;
}

// --- Pack Definitions ---
export interface PackDefinition {
  id: string;
  name: string;
  description: string;
  cost: { currency: keyof Currencies; amount: number };
  cardCount: number;
  tierWeights: Partial<Record<CardTier, number>>;  // percentage weights
  guaranteed?: string;           // description of guaranteed pull
  isFree?: boolean;
  isPremium?: boolean;
}

// --- Expedition Definitions ---
export interface ExpeditionZone {
  id: string;
  name: string;
  description: string;
  requirements: {
    minCards: number;
    minLevel: number;
    requiredTypes?: CardType[];
    requiredTier?: CardTier;
    requiredTierCount?: number;
  };
  duration: number;              // seconds
  rewards: {
    shadowEssence?: [number, number];     // [min, max]
    soulShards?: [number, number];
    lunarCrystals?: [number, number];
    voidEnergy?: [number, number];
    packId?: string;
  };
}

// --- Synergy Definitions ---
export interface TypeSynergy {
  type: CardType;
  thresholds: { count: number; bonus: number }[];
  fullSetAbility?: string;
}

export interface CrossTypeSynergy {
  id: string;
  name: string;
  type1: CardType;
  type2: CardType;
  primaryEffect: string;
  bonusEffect: string;
  productionBonus: number;       // percentage
}

// --- Player State ---
export interface PlayerStats {
  level: number;
  experience: number;
  totalEssenceCollected: number;
  totalPacksOpened: number;
  totalCardsCollected: number;
  totalExpeditionsCompleted: number;
  playTime: number;
  loginStreak: number;
  lastLoginDate: string;
}

// --- Active Expedition ---
export interface ActiveExpedition {
  zoneId: string;
  cardIds: number[];             // indices of ownedCards used
  startedAt: number;
  completesAt: number;
}

// --- Feature Unlocks ---
export interface FeatureUnlock {
  level: number;
  feature: string;
  description: string;
}

// --- Full Game State ---
export interface GameState {
  currencies: Currencies;
  ownedCards: OwnedCard[];
  cryptSlots: number;            // max cards placeable
  playerStats: PlayerStats;
  activeExpeditions: ActiveExpedition[];
  dailyFreePackAvailable: boolean;
  lastDailyReset: number;
  unlockedFeatures: string[];
  lastSaved: number;
  lastTick: number;
}

// --- Game Actions ---
export type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'COLLECT_CARD'; cardIndex: number }
  | { type: 'COLLECT_ALL' }
  | { type: 'PLACE_CARD'; cardIndex: number }
  | { type: 'REMOVE_CARD'; cardIndex: number }
  | { type: 'LEVEL_UP_CARD'; cardIndex: number }
  | { type: 'OPEN_PACK'; cards: CardDefinition[] }
  | { type: 'PURCHASE_PACK'; packId: string }
  | { type: 'CLAIM_DAILY_PACK' }
  | { type: 'START_EXPEDITION'; zoneId: string; cardIndices: number[] }
  | { type: 'COMPLETE_EXPEDITION'; expeditionIndex: number }
  | { type: 'ADD_CURRENCY'; currency: keyof Currencies; amount: number }
  | { type: 'GAIN_EXPERIENCE'; amount: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

// --- Game Config (provided by context) ---
export interface GameConfig {
  cards: CardDefinition[];
  packs: PackDefinition[];
  expeditions: ExpeditionZone[];
  typeSynergies: TypeSynergy[];
  crossTypeSynergies: CrossTypeSynergy[];
  featureUnlocks: FeatureUnlock[];
  settings: GameSettings;
}

export interface GameSettings {
  tickInterval: number;
  autoSaveInterval: number;
  maxCryptSlots: number;
  essencePerLevelMultiplier: number;
  levelUpBaseCost: number;
  levelUpCostMultiplier: number;
  experiencePerCollection: number;
  experiencePerPack: number;
  experiencePerLevelUp: number;
  duplicateShardValue: number;
  offlineEssenceMultiplier: number;
}
