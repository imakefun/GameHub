// ============================================================
// Tower Defense – Monetization System
// Premium currency (Gems), Rewarded Video integration, and IAP hooks
// ============================================================

// --- Premium Currency: Gems ---

export interface GemBalance {
  gems: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  totalAdWatched: number;
}

export interface GemTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: GemSource;
  timestamp: number;
}

export type GemSource =
  // Earning sources
  | 'level_complete'       // 1-3 gems based on stars
  | 'world_complete'       // 10 gems for completing a world
  | 'first_clear'          // 2 gems for first time clearing a level
  | 'three_star'           // 1 bonus gem for 3-starring a level
  | 'daily_login'          // 3 gems per daily login
  | 'rewarded_video'       // 5 gems per ad watched
  | 'achievement'          // Variable gems from achievements
  | 'iap_purchase'         // In-app purchase
  // Spending sinks
  | 'continue_after_loss'  // 20 gems to continue after losing (restore 50% lives)
  | 'bonus_starting_gold'  // 15 gems for +100 starting gold
  | 'tower_skin'           // 50 gems for cosmetic tower skin
  | 'hero_unlock'          // 100 gems for hero unit unlock (future feature)
  | 'speed_boost'          // 10 gems for permanent 3x speed option
  | 'extra_tower_slot';    // 25 gems to unlock restricted tower on a level

// --- Gem Economy Configuration ---

export const GEM_REWARDS: Partial<Record<GemSource, number>> = {
  level_complete: 1,        // Base: 1 gem per level complete
  world_complete: 10,
  first_clear: 2,
  three_star: 1,
  daily_login: 3,
  rewarded_video: 5,
};

export const GEM_COSTS: Partial<Record<GemSource, number>> = {
  continue_after_loss: 20,
  bonus_starting_gold: 15,
  tower_skin: 50,
  hero_unlock: 100,
  speed_boost: 10,
  extra_tower_slot: 25,
};

// --- In-App Purchase Products ---

export interface IAPProduct {
  id: string;
  name: string;
  description: string;
  gems: number;
  priceUSD: number;
  bonusPercent: number;    // Extra gems as bonus
  popular?: boolean;
  bestValue?: boolean;
}

export const IAP_PRODUCTS: IAPProduct[] = [
  {
    id: 'gem_pack_small',
    name: 'Pouch of Gems',
    description: 'A small pouch of magical gems.',
    gems: 50,
    priceUSD: 0.99,
    bonusPercent: 0,
  },
  {
    id: 'gem_pack_medium',
    name: 'Chest of Gems',
    description: 'A sturdy chest brimming with gems.',
    gems: 300,
    priceUSD: 4.99,
    bonusPercent: 20,
    popular: true,
  },
  {
    id: 'gem_pack_large',
    name: 'Vault of Gems',
    description: 'An enormous vault overflowing with gems.',
    gems: 700,
    priceUSD: 9.99,
    bonusPercent: 40,
    bestValue: true,
  },
  {
    id: 'gem_pack_mega',
    name: 'Dragon Hoard',
    description: 'A legendary dragon\'s hoard of gems.',
    gems: 1500,
    priceUSD: 19.99,
    bonusPercent: 50,
  },
  {
    id: 'starter_pack',
    name: 'Starter Bundle',
    description: 'Perfect for new players. Gems + bonus gold boost.',
    gems: 200,
    priceUSD: 2.99,
    bonusPercent: 30,
  },
];

// --- Rewarded Video Configuration ---

export interface RewardedVideoConfig {
  /** Maximum rewarded videos per day */
  maxDailyViews: number;
  /** Cooldown between videos in seconds */
  cooldownSeconds: number;
  /** Gems rewarded per video */
  gemsPerVideo: number;
  /** Placements where rewarded video is available */
  placements: RewardedVideoPlacement[];
}

export type RewardedVideoPlacement =
  | 'post_loss_continue'   // After losing: watch ad to continue with 50% lives
  | 'double_rewards'       // After winning: watch ad to double gold/gem rewards
  | 'free_gems'            // In shop: watch ad for free gems
  | 'bonus_gold'           // Pre-level: watch ad for +50 starting gold
  | 'speed_unlock';        // Watch ad for temporary 3x speed

export const REWARDED_VIDEO_CONFIG: RewardedVideoConfig = {
  maxDailyViews: 10,
  cooldownSeconds: 60,
  gemsPerVideo: 5,
  placements: [
    'post_loss_continue',
    'double_rewards',
    'free_gems',
    'bonus_gold',
    'speed_unlock',
  ],
};

// --- Monetization Manager ---

const MONETIZATION_SAVE_KEY = 'td-monetization';

export interface MonetizationState {
  gems: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  totalAdsWatched: number;
  dailyAdsWatched: number;
  lastAdTimestamp: number;
  lastDailyLoginDate: string;  // ISO date string
  purchasedItems: string[];    // Product IDs purchased
  transactions: GemTransaction[];
}

function createInitialMonetizationState(): MonetizationState {
  return {
    gems: 0,
    totalGemsEarned: 0,
    totalGemsSpent: 0,
    totalAdsWatched: 0,
    dailyAdsWatched: 0,
    lastAdTimestamp: 0,
    lastDailyLoginDate: '',
    purchasedItems: [],
    transactions: [],
  };
}

function loadMonetizationState(): MonetizationState {
  try {
    const raw = localStorage.getItem(MONETIZATION_SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...createInitialMonetizationState(), ...saved };
    }
  } catch { /* ignore */ }
  return createInitialMonetizationState();
}

function saveMonetizationState(state: MonetizationState): void {
  try {
    // Keep only last 100 transactions for storage efficiency
    const trimmed = {
      ...state,
      transactions: state.transactions.slice(-100),
    };
    localStorage.setItem(MONETIZATION_SAVE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

class MonetizationManager {
  private state: MonetizationState;

  constructor() {
    this.state = loadMonetizationState();
    this.checkDailyLogin();
  }

  private checkDailyLogin(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.lastDailyLoginDate !== today) {
      this.state.lastDailyLoginDate = today;
      this.state.dailyAdsWatched = 0; // Reset daily ad counter
      // Award daily login gems
      this.earnGems(GEM_REWARDS.daily_login ?? 3, 'daily_login');
    }
  }

  getState(): Readonly<MonetizationState> {
    return this.state;
  }

  getGems(): number {
    return this.state.gems;
  }

  canAfford(source: GemSource): boolean {
    const cost = GEM_COSTS[source];
    return cost !== undefined && this.state.gems >= cost;
  }

  earnGems(amount: number, source: GemSource): void {
    this.state.gems += amount;
    this.state.totalGemsEarned += amount;
    this.state.transactions.push({
      id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'earn',
      amount,
      source,
      timestamp: Date.now(),
    });
    saveMonetizationState(this.state);
  }

  spendGems(source: GemSource): boolean {
    const cost = GEM_COSTS[source];
    if (!cost || this.state.gems < cost) return false;

    this.state.gems -= cost;
    this.state.totalGemsSpent += cost;
    this.state.transactions.push({
      id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'spend',
      amount: cost,
      source,
      timestamp: Date.now(),
    });
    saveMonetizationState(this.state);
    return true;
  }

  /**
   * Calculate gem reward for completing a level.
   */
  calculateLevelReward(stars: number, isFirstClear: boolean): number {
    let gems = GEM_REWARDS.level_complete ?? 1;
    if (isFirstClear) gems += GEM_REWARDS.first_clear ?? 2;
    if (stars === 3) gems += GEM_REWARDS.three_star ?? 1;
    return gems;
  }

  // --- Rewarded Video ---

  canWatchRewardedVideo(): boolean {
    const config = REWARDED_VIDEO_CONFIG;
    if (this.state.dailyAdsWatched >= config.maxDailyViews) return false;

    const elapsed = (Date.now() - this.state.lastAdTimestamp) / 1000;
    return elapsed >= config.cooldownSeconds;
  }

  getAdCooldownRemaining(): number {
    const elapsed = (Date.now() - this.state.lastAdTimestamp) / 1000;
    return Math.max(0, REWARDED_VIDEO_CONFIG.cooldownSeconds - elapsed);
  }

  /**
   * Simulate watching a rewarded video.
   * In production, this would integrate with an ad SDK (AdMob, Unity Ads, etc.)
   * Returns the number of gems earned.
   */
  async watchRewardedVideo(_placement: RewardedVideoPlacement): Promise<number> {
    if (!this.canWatchRewardedVideo()) return 0;

    // PLACEHOLDER: In production, this would:
    // 1. Show a loading indicator
    // 2. Request an ad from the ad SDK
    // 3. Display the full-screen video ad
    // 4. Wait for completion callback
    // 5. Validate server-side (optional)
    // 6. Award the gems

    // Simulate ad viewing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const gemsEarned = REWARDED_VIDEO_CONFIG.gemsPerVideo;
    this.state.totalAdsWatched++;
    this.state.dailyAdsWatched++;
    this.state.lastAdTimestamp = Date.now();
    this.earnGems(gemsEarned, 'rewarded_video');

    return gemsEarned;
  }

  getDailyAdsRemaining(): number {
    return Math.max(0, REWARDED_VIDEO_CONFIG.maxDailyViews - this.state.dailyAdsWatched);
  }

  // --- IAP ---

  /**
   * Simulate an in-app purchase.
   * In production, this would integrate with the platform's billing API.
   */
  async purchaseProduct(productId: string): Promise<boolean> {
    const product = IAP_PRODUCTS.find(p => p.id === productId);
    if (!product) return false;

    // PLACEHOLDER: In production, this would:
    // 1. Initiate platform billing flow (Google Play, App Store, Stripe)
    // 2. Validate the receipt server-side
    // 3. Award the gems only after validation

    const totalGems = product.gems + Math.floor(product.gems * product.bonusPercent / 100);
    this.state.purchasedItems.push(productId);
    this.earnGems(totalGems, 'iap_purchase');

    return true;
  }

  // --- Analytics Helpers ---

  getConversionMetrics() {
    return {
      totalGemsEarned: this.state.totalGemsEarned,
      totalGemsSpent: this.state.totalGemsSpent,
      totalAdsWatched: this.state.totalAdsWatched,
      totalPurchases: this.state.purchasedItems.length,
      gemBalance: this.state.gems,
      earnToSpendRatio: this.state.totalGemsSpent > 0
        ? this.state.totalGemsEarned / this.state.totalGemsSpent
        : 0,
    };
  }
}

// Singleton instance
export const monetizationManager = new MonetizationManager();
