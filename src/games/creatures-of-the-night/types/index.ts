// ============================================================
// Creatures of the Night - Type Definitions
// ============================================================

// --- Card Tiers (rarity / power classification) ---
export type CardTier = 'twilight' | 'dusk' | 'midnight' | 'umbral' | 'eternal';

export const TIER_ORDER: CardTier[] = ['twilight', 'dusk', 'midnight', 'umbral', 'eternal'];

export const TIER_LABELS: Record<CardTier, string> = {
  twilight: 'Twilight',
  dusk: 'Dusk',
  midnight: 'Midnight',
  umbral: 'Umbral',
  eternal: 'Eternal',
};

export const TIER_COLORS: Record<CardTier, string> = {
  twilight: '#a78bfa',
  dusk: '#60a5fa',
  midnight: '#c084fc',
  umbral: '#f472b6',
  eternal: '#fbbf24',
};

// Duplicate → Soul Shard conversion rates
export const TIER_DUPLICATE_SHARDS: Record<CardTier, number> = {
  twilight: 5,
  dusk: 15,
  midnight: 30,
  umbral: 60,
  eternal: 120,
};

// --- Upgrade Tiers (card visual quality / progression) ---
// In the Marvel Snap-style system, cards are upgraded through 6 tiers.
// Each upgrade costs Shadow Essence + card-specific Shards and increases Collection Level.
export type UpgradeTier = 'base' | 'twilight' | 'dusk' | 'midnight' | 'umbral' | 'eternal' | 'cosmic';

export const UPGRADE_TIER_ORDER: UpgradeTier[] = ['base', 'twilight', 'dusk', 'midnight', 'umbral', 'eternal', 'cosmic'];

export const UPGRADE_TIER_LABELS: Record<UpgradeTier, string> = {
  base: 'Base',
  twilight: 'Twilight',
  dusk: 'Dusk',
  midnight: 'Midnight',
  umbral: 'Umbral',
  eternal: 'Eternal',
  cosmic: 'Cosmic',
};

export const UPGRADE_TIER_COLORS: Record<UpgradeTier, string> = {
  base: '#9ca3af',
  twilight: '#a78bfa',
  dusk: '#60a5fa',
  midnight: '#c084fc',
  umbral: '#f472b6',
  eternal: '#fbbf24',
  cosmic: '#f43f5e',
};

export interface UpgradeCost {
  shadowEssence: number;
  shards: number;
  clGain: number;
}

export const UPGRADE_COSTS: Record<Exclude<UpgradeTier, 'base'>, UpgradeCost> = {
  twilight: { shadowEssence: 25, shards: 5, clGain: 1 },
  dusk: { shadowEssence: 100, shards: 10, clGain: 2 },
  midnight: { shadowEssence: 200, shards: 20, clGain: 4 },
  umbral: { shadowEssence: 300, shards: 30, clGain: 6 },
  eternal: { shadowEssence: 400, shards: 40, clGain: 8 },
  cosmic: { shadowEssence: 500, shards: 50, clGain: 10 },
};

// Production bonus per upgrade tier (modest boost to reward upgrading)
export const UPGRADE_TIER_PRODUCTION_BONUS: Record<UpgradeTier, number> = {
  base: 1.0,
  twilight: 1.05,
  dusk: 1.10,
  midnight: 1.20,
  umbral: 1.30,
  eternal: 1.45,
  cosmic: 1.65,
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

// Card type specialization modifiers
export interface TypeSpecialization {
  amountMultiplier: number;      // base amount modifier
  intervalMultiplier: number;    // base interval modifier
  nightAmountMultiplier?: number;
  nightIntervalMultiplier?: number;
  doubleChance?: number;         // chance to double on collection (0-1)
  failChance?: number;           // chance to produce nothing (0-1)
  randomVariance?: number;       // ±variance on amounts (0-1, e.g. 0.5 = ±50%)
  randomIntervalVariance?: number;
  fullMoonBonus?: number;        // multiplier during full moon
}

export const TYPE_SPECIALIZATIONS: Record<CardType, TypeSpecialization> = {
  beast: { amountMultiplier: 1, intervalMultiplier: 1 },
  spirit: { amountMultiplier: 0.5, intervalMultiplier: 0.5 },
  shadow: { amountMultiplier: 1, intervalMultiplier: 1, nightIntervalMultiplier: 0.5 },
  fae: { amountMultiplier: 1, intervalMultiplier: 1, randomVariance: 0.5 },
  blood: { amountMultiplier: 1.5, intervalMultiplier: 1.5 },
  magic: { amountMultiplier: 1, intervalMultiplier: 1, doubleChance: 0.2 },
  necromancy: { amountMultiplier: 2, intervalMultiplier: 2 },
  cursed: { amountMultiplier: 1, intervalMultiplier: 1, randomVariance: 0.5, randomIntervalVariance: 0.5 },
  lycanthrope: { amountMultiplier: 1, intervalMultiplier: 1, nightIntervalMultiplier: 0.5, fullMoonBonus: 1.0 },
  undead: { amountMultiplier: 1, intervalMultiplier: 1 },
  stone: { amountMultiplier: 2.5, intervalMultiplier: 3 },
  infernal: { amountMultiplier: 1.25, intervalMultiplier: 1, failChance: 0.05 },
};

// --- Card Definition (from data/sheets) ---
export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  tier: CardTier;
  baseGenerationAmount: number;    // base shadow essence per collection
  baseInterval: number;            // base seconds between collections
  description: string;
  flavorText: string;
  artUrl?: string;
  set?: number;                    // card set (1 = starter set, undefined = legacy)
}

// --- Owned Card Instance (player's copy) ---
export interface OwnedCard {
  definitionId: string;
  upgradeTier: UpgradeTier;          // visual quality tier (base -> cosmic)
  soulShards: number;                // card-specific shards
  placedInCrypt: boolean;
  lastCollected: number;
  accumulatedEssence: number;
  isOnExpedition: boolean;
  expeditionReturnTime?: number;     // timestamp when card returns from temp loss
  fatigueUntil?: number;             // timestamp when fatigue/damage wears off
}

// --- Currencies ---
export interface Currencies {
  shadowEssence: number;
  lunarCrystals: number;
  voidEnergy: number;
}

// --- Pack Definitions ---
export type PackAvailability = 'shop' | 'expedition' | 'event' | 'fullMoon' | 'prestige';

export interface PackGuarantee {
  tier?: CardTier;         // exact tier
  minTier?: CardTier;      // minimum tier (this or higher)
  types?: CardType[];      // must be one of these types
  count: number;           // how many guaranteed cards
}

export interface PackDefinition {
  id: string;
  name: string;
  description: string;
  cost: { currency: keyof Currencies; amount: number } | null; // null = free / awarded
  cardCount: number;
  tierWeights: Partial<Record<CardTier, number>>;
  guaranteed?: string;              // display text
  guarantees?: PackGuarantee[];     // structured guarantee rules
  typeBoost?: CardType[];           // increased chance for these types
  requiredCL?: number;              // minimum CL to purchase / receive
  availability?: PackAvailability;  // where this pack appears (default: 'shop')
  expeditionId?: string;            // which expedition awards this pack
  isOneTime?: boolean;
  isPremium?: boolean;
}

// --- Expedition Definitions ---
export interface ExpeditionZone {
  id: string;
  name: string;
  description: string;
  unlockCL: number;
  requirements: {
    minCards: number;
    minCardLevel?: number;
    requiredTypes?: CardType[];
    requiredTier?: CardTier;
    requiredTierCount?: number;
  };
  duration: number; // fixed duration in seconds
  rewards: {
    shadowEssence?: [number, number];
    soulShards?: [number, number];
    lunarCrystals?: [number, number];
    voidEnergy?: [number, number];
  };
  riskPercent: number;
  riskEffect: 'fatigue' | 'damage' | 'card_loss' | 'curse';
  riskDuration: number;            // seconds the risk effect lasts
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
  productionBonus: number;
}

// --- Collection Level Reward ---
export interface CLReward {
  cl: number;
  type: 'shadowEssence' | 'soulShards' | 'lunarCrystals' | 'tome' | 'premiumTome' | 'special' | 'card';
  amount: number;
  description: string;
  cardId?: string;         // for type 'card' - the card definition ID to unlock
}

// --- Daily Quest ---
export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  difficulty: 'easy' | 'hard';
  rewards: {
    shadowEssence?: number;
    soulShards?: number;
    lunarCrystals?: number;
  };
}

// --- Active Expedition ---
export interface ActiveExpedition {
  zoneId: string;
  cardIds: number[];
  startedAt: number;
  completesAt: number;
}

// --- Feature Unlocks ---
export interface FeatureUnlock {
  cl: number;
  feature: string;
  description: string;
}

// --- Cosmic Cycle State ---
export type CosmicPhase = 'day' | 'night';
export type LunarPhase = 'new_moon' | 'waxing' | 'full_moon' | 'waning' | 'blood_moon' | 'none';

// --- Full Game State ---
export interface GameState {
  currencies: Currencies;
  ownedCards: OwnedCard[];
  cryptSlots: number;
  collectionLevel: number;           // linear CL counter (sum of all upgrade CL gains)
  clRewardsClaimed: number[];        // CL milestones already claimed
  playerStats: {
    totalEssenceCollected: number;
    totalPacksOpened: number;
    totalCardsCollected: number;
    totalExpeditionsCompleted: number;
    playTime: number;
    loginStreak: number;
    lastLoginDate: string;
  };
  activeExpeditions: ActiveExpedition[];
  completedExpeditions: ActiveExpedition[];  // finished but not yet collected
  starterTomeClaimed: boolean;
  unlockedFeatures: string[];
  // Daily quests
  dailyQuests: { questId: string; progress: number; completed: boolean; claimed: boolean }[];
  dailyQuestsLastReset: number;
  weeklyQuestCount: number;
  weeklyRewardsClaimed: number[];
  // Login streak
  loginStreakRewardsClaimed: number[];  // streak milestones already claimed (e.g. 7, 30)
  // Extra crypt slots purchased with LC
  purchasedCryptSlots: number;
  // Expedition pack rewards waiting to be opened
  pendingPackRewards: string[];  // pack IDs
  // Tutorial
  tutorialCompleted: boolean;
  tutorialStep: number;
  lastSaved: number;
  lastTick: number;
}

// --- Game Actions ---
export type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'COLLECT_CARD'; cardIndex: number }
  | { type: 'COLLECT_ALL' }
  | { type: 'PLACE_CARD'; cardIndex: number }
  | { type: 'SWAP_CARD'; removeIndex: number; placeIndex: number }
  | { type: 'REMOVE_CARD'; cardIndex: number }
  | { type: 'UPGRADE_CARD'; cardIndex: number }
  | { type: 'OPEN_PACK'; cards: CardDefinition[]; packId: string }
  | { type: 'PURCHASE_PACK'; packId: string }
  | { type: 'CLAIM_STARTER_TOME' }
  | { type: 'START_EXPEDITION'; zoneId: string; cardIndices: number[] }
  | { type: 'COMPLETE_QUEST'; questIndex: number; shardTargetIndex?: number }
  | { type: 'CLAIM_CL_REWARD'; cl: number; shardTargetIndex?: number }
  | { type: 'CLAIM_WEEKLY_REWARD'; tier: number }
  | { type: 'COLLECT_EXPEDITION'; expeditionIndex: number }
  | { type: 'RUSH_EXPEDITION'; expeditionIndex: number }
  | { type: 'BUY_CRYPT_SLOT' }
  | { type: 'CLAIM_LOGIN_STREAK_REWARD'; milestone: number }
  | { type: 'SET_TUTORIAL_STEP'; step: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'DISMISS_PACK_REWARD'; packId: string }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

// --- Crypt Slot Unlock ---
export interface CryptSlotUnlock {
  cl: number;
  slot: number;
}

// --- Game Config (provided by context) ---
export interface GameConfig {
  cards: CardDefinition[];
  packs: PackDefinition[];
  expeditions: ExpeditionZone[];
  typeSynergies: TypeSynergy[];
  crossTypeSynergies: CrossTypeSynergy[];
  featureUnlocks: FeatureUnlock[];
  clRewards: CLReward[];
  dailyQuestPool: DailyQuest[];
  typeUnlockCL: Record<CardType, number>;
  cryptSlotUnlocks: CryptSlotUnlock[];
  settings: GameSettings;
}

export interface GameSettings {
  tickInterval: number;
  autoSaveInterval: number;
  maxCryptSlots: number;
  offlineMaxHours: number;         // 8 hours
  offlineEssenceMultiplier: number;
}
