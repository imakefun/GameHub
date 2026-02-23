// Theatre Management Simulation - Type Definitions

// ============ Game Phases ============
export type GamePhase = 'restoration' | 'expansion' | 'franchise';

// ============ Resources ============
export interface Resources {
  money: number;
  reputation: number; // 0-100, affects customer flow and movie availability
}

// ============ Time ============
export interface GameTime {
  day: number; // days elapsed since game start
  hour: number; // 0-23 current hour of the day
}

// ============ Theatre ============
export interface TheatreUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'lobby' | 'exterior' | 'restrooms' | 'parking' | 'accessibility';
  reputationBonus: number;
  customerCapacityBonus: number;
  prerequisite?: string; // upgrade id required first
  icon: string;
}

export interface Screen {
  id: string;
  name: string;
  seats: number;
  quality: ScreenQuality;
  condition: number; // 0-100, degrades over time
  currentMovieId: string | null;
  showtimeHours: number[]; // hours of the day when shows run
  ticketPrice: number;
  unlocked: boolean;
  upgrading: boolean;
  upgradeCompletesAt: number | null; // day when upgrade finishes
}

export type ScreenQuality = 'basic' | 'standard' | 'premium' | 'imax' | 'dolby';

export interface ScreenUpgrade {
  id: string;
  name: string;
  description: string;
  fromQuality: ScreenQuality;
  toQuality: ScreenQuality;
  cost: number;
  daysToComplete: number;
  seatsChange: number; // can decrease (premium has fewer, bigger seats)
  ticketPriceMultiplier: number;
  icon: string;
}

// ============ Movies ============
export type MovieGenre = 'action' | 'comedy' | 'drama' | 'horror' | 'scifi' | 'animation' | 'romance' | 'thriller';

export interface Movie {
  id: string;
  title: string;
  genre: MovieGenre;
  icon: string;
  popularity: number; // 1-100, decays over time
  licenseCost: number; // weekly cost to show this movie
  minReputation: number; // reputation needed to get this movie
  releaseWeek: number; // day when it becomes available
  durationWeeks: number; // how many weeks it stays in circulation
  qualityRating: number; // 1-5 stars, affects satisfaction
}

// ============ Staff ============
export type StaffRole = 'cashier' | 'usher' | 'projectionist' | 'janitor' | 'manager' | 'concessions';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  skill: number; // 1-100, improves over time
  wage: number; // daily wage
  morale: number; // 0-100
  hired: boolean;
  daysEmployed: number;
}

export interface StaffTemplate {
  role: StaffRole;
  name: string;
  icon: string;
  description: string;
  baseWage: number;
  startingSkill: number;
  maxSkill: number;
  effect: string; // what this role does
}

// ============ Concessions ============
export interface ConcessionItem {
  id: string;
  name: string;
  icon: string;
  category: 'snack' | 'drink' | 'combo' | 'premium';
  cost: number; // cost to stock per unit
  price: number; // selling price
  popularity: number; // 1-100, affects how often customers buy
  unlockCost: number; // one-time cost to add to menu
  unlocked: boolean;
}

export interface ConcessionStand {
  capacity: number; // how many items can be stocked
  level: number; // upgrades increase capacity
  upgradeCost: number;
}

// ============ Customers ============
export interface DailyReport {
  day: number;
  ticketsSold: number;
  ticketRevenue: number;
  concessionRevenue: number;
  totalRevenue: number;
  expenses: number;
  profit: number;
  avgSatisfaction: number;
  customerCount: number;
}

// ============ Restoration Tasks ============
export interface RestorationTask {
  id: string;
  name: string;
  description: string;
  cost: number;
  daysToComplete: number;
  icon: string;
  completed: boolean;
  inProgress: boolean;
  startedDay: number | null;
  prerequisite?: string;
  reputationReward: number;
  narrativeText: string; // story text shown on completion
  category: 'structural' | 'equipment' | 'aesthetic' | 'safety';
}

// ============ Franchise ============
export interface FranchiseLocation {
  id: string;
  name: string;
  city: string;
  purchaseCost: number;
  screens: number;
  condition: number;
  dailyRevenue: number;
  dailyExpenses: number;
  manager: string | null;
  reputation: number;
  owned: boolean;
  unlockReputation: number; // global reputation needed
}

// ============ Milestones ============
export interface Milestone {
  id: string;
  name: string;
  description: string;
  condition: string; // human readable
  reward: string;
  reputationReward: number;
  moneyReward: number;
  achieved: boolean;
  icon: string;
}

// ============ Events ============
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  effect: EventEffect;
  duration: number; // days
  startDay: number;
}

export interface EventEffect {
  customerMultiplier?: number;
  revenueMultiplier?: number;
  costMultiplier?: number;
  reputationChange?: number;
}

// ============ Financial Tracking ============
export interface FinancialSummary {
  ticketRevenue: number;
  concessionRevenue: number;
  franchiseRevenue: number;
  staffCosts: number;
  licenseCosts: number;
  maintenanceCosts: number;
  upgradeCosts: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

// ============ Game State ============
export interface TheatreState {
  screens: Screen[];
  upgrades: string[]; // ids of purchased upgrades
  concessionStand: ConcessionStand;
  concessionMenu: string[]; // ids of unlocked concession items
  restorationTasks: RestorationTask[];
  condition: number; // overall theatre condition 0-100
}

export interface GameState {
  phase: GamePhase;
  resources: Resources;
  time: GameTime;
  theatre: TheatreState;
  staff: StaffMember[];
  currentMovies: string[]; // ids of licensed movies
  dailyReports: DailyReport[];
  franchiseLocations: FranchiseLocation[];
  milestones: string[]; // ids of achieved milestones
  activeEvents: GameEvent[];
  stats: GameStats;
  lastTick: number;
  tutorialStep: number;
  messageLog: GameMessage[];
  financialHistory: FinancialSummary[];
}

export interface GameStats {
  totalRevenue: number;
  totalTicketsSold: number;
  totalConcessionsSold: number;
  totalMoviesShown: number;
  totalStaffHired: number;
  totalUpgradesPurchased: number;
  totalDaysPlayed: number;
  peakDailyRevenue: number;
  peakReputation: number;
  franchisesOwned: number;
}

export interface GameMessage {
  id: string;
  text: string;
  icon: string;
  day: number;
  type: 'info' | 'success' | 'warning' | 'milestone';
}

// ============ Game Config ============
export interface GameConfig {
  movies: Movie[];
  staffTemplates: StaffTemplate[];
  screenUpgrades: ScreenUpgrade[];
  theatreUpgrades: TheatreUpgrade[];
  concessionItems: ConcessionItem[];
  restorationTasks: RestorationTask[];
  franchiseLocations: FranchiseLocation[];
  milestones: Milestone[];
}

// ============ Actions ============
export type GameAction =
  // Time
  | { type: 'TICK'; now: number }
  | { type: 'ADVANCE_HOUR' }
  // Restoration
  | { type: 'START_RESTORATION'; taskId: string }
  // Screens
  | { type: 'ASSIGN_MOVIE'; screenId: string; movieId: string }
  | { type: 'REMOVE_MOVIE'; screenId: string }
  | { type: 'SET_TICKET_PRICE'; screenId: string; price: number }
  | { type: 'SET_SHOWTIMES'; screenId: string; hours: number[] }
  | { type: 'UPGRADE_SCREEN'; screenId: string; upgradeId: string }
  | { type: 'UNLOCK_SCREEN'; screenId: string }
  | { type: 'REPAIR_SCREEN'; screenId: string }
  // Staff
  | { type: 'HIRE_STAFF'; role: StaffRole }
  | { type: 'FIRE_STAFF'; staffId: string }
  // Movies
  | { type: 'LICENSE_MOVIE'; movieId: string }
  | { type: 'DROP_MOVIE'; movieId: string }
  // Concessions
  | { type: 'UNLOCK_CONCESSION'; itemId: string }
  | { type: 'UPGRADE_CONCESSION_STAND' }
  // Theatre upgrades
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string }
  // Franchise
  | { type: 'PURCHASE_FRANCHISE'; locationId: string }
  | { type: 'ASSIGN_FRANCHISE_MANAGER'; locationId: string; managerId: string }
  // Meta
  | { type: 'DISMISS_MESSAGE'; messageId: string }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'RESET_GAME' };
