// ============================================================
// Creatures of the Night - Type Definitions
// ============================================================

// --- Card Tiers ---
export type CardTier = 'twilight' | 'dusk' | 'midnight' | 'umbral' | 'eternal';

export const TIER_ORDER: CardTier[] = ['twilight', 'dusk', 'midnight', 'umbral', 'eternal'];

export const TIER_MAX_LEVEL: Record<CardTier, number> = {
  twilight: 30,
  dusk: 40,
  midnight: 50,
  umbral: 60,
  eternal: 75,
};

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

// Ascension costs (from current tier max → next tier level 1)
export const ASCENSION_COSTS: Record<string, { soulShards: number; shadowEssence: number; lunarCrystals: number }> = {
  'twilight->dusk': { soulShards: 200, shadowEssence: 2000, lunarCrystals: 0 },
  'dusk->midnight': { soulShards: 500, shadowEssence: 5000, lunarCrystals: 5 },
  'midnight->umbral': { soulShards: 1000, shadowEssence: 10000, lunarCrystals: 10 },
  'umbral->eternal': { soulShards: 2000, shadowEssence: 20000, lunarCrystals: 20 },
};

// Awakening thresholds and costs per tier
export const AWAKENING_INFO: Record<CardTier, { level: number; soulShards: number; shadowEssence: number; lunarCrystals: number }> = {
  twilight: { level: 15, soulShards: 100, shadowEssence: 1000, lunarCrystals: 1 },
  dusk: { level: 20, soulShards: 200, shadowEssence: 2000, lunarCrystals: 2 },
  midnight: { level: 25, soulShards: 400, shadowEssence: 5000, lunarCrystals: 5 },
  umbral: { level: 30, soulShards: 800, shadowEssence: 10000, lunarCrystals: 10 },
  eternal: { level: 40, soulShards: 1600, shadowEssence: 20000, lunarCrystals: 20 },
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
}

// --- Owned Card Instance (player's copy) ---
export interface OwnedCard {
  definitionId: string;
  level: number;
  soulShards: number;              // card-specific soul shards
  awakened: boolean;
  placedInCrypt: boolean;
  lastCollected: number;
  accumulatedEssence: number;
  isOnExpedition: boolean;
  expeditionReturnTime?: number;   // timestamp when card returns from temp loss
  fatigueUntil?: number;           // timestamp when fatigue/damage wears off
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
    requiredTypes?: CardType[];
    requiredTier?: CardTier;
    requiredTierCount?: number;
  };
  durationRange: [number, number]; // [min, max] seconds
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
  type: 'shadowEssence' | 'soulShards' | 'lunarCrystals' | 'tome' | 'premiumTome' | 'special';
  amount: number;
  description: string;
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
  chosenDuration: number;
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
  collectionLevel: number;
  collectionLevelPoints: number;
  clRewardsClaimed: number[];      // CL milestones already claimed
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
  | { type: 'REMOVE_CARD'; cardIndex: number }
  | { type: 'LEVEL_UP_CARD'; cardIndex: number }
  | { type: 'ASCEND_CARD'; cardIndex: number }
  | { type: 'AWAKEN_CARD'; cardIndex: number }
  | { type: 'OPEN_PACK'; cards: CardDefinition[]; packId: string }
  | { type: 'PURCHASE_PACK'; packId: string }
  | { type: 'CLAIM_STARTER_TOME' }
  | { type: 'START_EXPEDITION'; zoneId: string; cardIndices: number[]; duration: number }
  | { type: 'COMPLETE_QUEST'; questIndex: number }
  | { type: 'CLAIM_CL_REWARD'; cl: number }
  | { type: 'CLAIM_WEEKLY_REWARD'; tier: number }
  | { type: 'RUSH_EXPEDITION'; expeditionIndex: number }
  | { type: 'BUY_CRYPT_SLOT' }
  | { type: 'CLAIM_LOGIN_STREAK_REWARD'; milestone: number }
  | { type: 'SET_TUTORIAL_STEP'; step: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'DISMISS_PACK_REWARD'; packId: string }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

// --- Level-Up Cost Config (per tier, from sheets) ---
export interface LevelCostConfig {
  tier: CardTier;
  baseCost: number;       // cost at level 1→2
  scalingPower: number;   // cost = ceil(baseCost * level^scalingPower)
}

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
  levelCosts: LevelCostConfig[];
  clTierMultipliers: Record<CardTier, number>;
  typeUnlockCL: Record<CardType, number>;
  cryptSlotUnlocks: CryptSlotUnlock[];
  settings: GameSettings;
}

export interface GameSettings {
  tickInterval: number;
  autoSaveInterval: number;
  maxCryptSlots: number;
  essencePerLevelPercent: number;  // 5% per level
  offlineMaxHours: number;         // 8 hours
  offlineEssenceMultiplier: number;
}
