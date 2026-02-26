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

// Day-of-week helpers
export function getDayOfWeek(day: number): number {
  return (day - 1) % 7; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
}

export function getDayName(day: number): string {
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return names[getDayOfWeek(day)];
}

export function getDayNameShort(day: number): string {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return names[getDayOfWeek(day)];
}

export function isWeekend(day: number): boolean {
  const dow = getDayOfWeek(day);
  return dow >= 5;
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
  popularity: number; // 1-100, base popularity at release
  licenseCost: number; // one-time cost to license
  minReputation: number; // reputation needed to get this movie
  releaseWeek: number; // week when it becomes available (0 = game start)
  durationWeeks: number; // how long the license lasts
  qualityRating: number; // 1-5 stars, affects satisfaction
}

/** A movie the player has licensed — tracks when it was picked up and when it expires */
export interface LicensedMovie {
  movieId: string;
  licensedDay: number;
  expiresDay: number;
}

// ============ Staff ============
export type StaffRole = 'cashier' | 'usher' | 'projectionist' | 'janitor' | 'manager' | 'concessions';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  skill: number; // 1-100, improves with experience
  level: number; // 1-5
  experience: number; // accumulated XP, drives leveling
  wage: number; // daily wage
  morale: number; // 0-100
  hired: boolean;
  daysEmployed: number;
  trait: string; // personality trait
  raiseRequestDay: number | null; // day a raise was requested, null if none
}

export interface StaffCandidate {
  id: string;
  name: string;
  role: StaffRole;
  skill: number;
  level: number;
  experience: number;
  minimumWage: number;
  morale: number;
  trait: string;
  traitDescription: string;
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

// Staff leveling
export const LEVEL_THRESHOLDS = [0, 20, 50, 100, 180];
export const LEVEL_NAMES = ['Rookie', 'Regular', 'Skilled', 'Expert', 'Master'];

export function getStaffLevel(experience: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getFairWage(baseWage: number, level: number): number {
  return Math.floor(baseWage * (1 + (level - 1) * 0.25));
}

export function getXpToNextLevel(level: number): number | null {
  if (level >= 5) return null;
  return LEVEL_THRESHOLDS[level]; // threshold for NEXT level
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

// ============ Customer Reviews ============
export type ReviewCategory = 'cleanliness' | 'service' | 'experience' | 'value' | 'facilities';

export interface CustomerReview {
  id: string;
  day: number;
  rating: number; // 1-5 stars
  text: string;
  authorName: string;
  category: ReviewCategory; // primary issue/praise
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

// ============ Loan ============
export interface Loan {
  principal: number;
  remaining: number;
  interestRate: number; // annual rate (e.g. 0.08 = 8%)
  dailyPayment: number;
  totalPaid: number;
  paidOff: boolean;
}

// ============ Cutscenes ============
export interface CutsceneBeat {
  text: string;
  speaker?: string;
  imagePlaceholder: string;
  imageSrc?: string;
  mood?: 'neutral' | 'dramatic' | 'hopeful' | 'tense' | 'triumphant';
}

export interface CutsceneSequence {
  id: string;
  title: string;
  beats: CutsceneBeat[];
  triggerCondition: string;
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
  upgrades: string[];
  concessionStand: ConcessionStand;
  concessionMenu: string[];
  restorationTasks: RestorationTask[];
  condition: number; // 0-100
}

export interface GameState {
  phase: GamePhase;
  resources: Resources;
  time: GameTime;
  loan: Loan;
  theatre: TheatreState;
  staff: StaffMember[];
  hiringPool: StaffCandidate[];
  lastPoolRefresh: number; // day when pool was last refreshed
  licensedMovies: LicensedMovie[];
  dailyReports: DailyReport[];
  franchiseLocations: FranchiseLocation[];
  milestones: string[];
  activeEvents: GameEvent[];
  reviews: CustomerReview[];
  overallRating: number; // 1-5, calculated from recent reviews
  stats: GameStats;
  lastTick: number;
  tutorialStep: number;
  messageLog: GameMessage[];
  financialHistory: FinancialSummary[];
  cutscenesSeen: string[];
  activeCutscene: string | null;
  dailyCustomerCount: number; // customers today, reset each day
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

// ============ Actions ============
export type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'ADVANCE_HOUR' }
  | { type: 'START_RESTORATION'; taskId: string }
  | { type: 'ASSIGN_MOVIE'; screenId: string; movieId: string }
  | { type: 'REMOVE_MOVIE'; screenId: string }
  | { type: 'SET_TICKET_PRICE'; screenId: string; price: number }
  | { type: 'SET_SHOWTIMES'; screenId: string; hours: number[] }
  | { type: 'UPGRADE_SCREEN'; screenId: string; upgradeId: string }
  | { type: 'UNLOCK_SCREEN'; screenId: string }
  | { type: 'REPAIR_SCREEN'; screenId: string }
  | { type: 'HIRE_STAFF'; role: StaffRole }
  | { type: 'HIRE_FROM_POOL'; candidateId: string }
  | { type: 'FIRE_STAFF'; staffId: string }
  | { type: 'GRANT_RAISE'; staffId: string }
  | { type: 'DENY_RAISE'; staffId: string }
  | { type: 'REFRESH_POOL' }
  | { type: 'LICENSE_MOVIE'; movieId: string }
  | { type: 'DROP_MOVIE'; movieId: string }
  | { type: 'UNLOCK_CONCESSION'; itemId: string }
  | { type: 'UPGRADE_CONCESSION_STAND' }
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string }
  | { type: 'PURCHASE_FRANCHISE'; locationId: string }
  | { type: 'ASSIGN_FRANCHISE_MANAGER'; locationId: string; managerId: string }
  | { type: 'TRIGGER_CUTSCENE'; cutsceneId: string }
  | { type: 'COMPLETE_CUTSCENE'; cutsceneId: string }
  | { type: 'DISMISS_MESSAGE'; messageId: string }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'RESET_GAME' };
