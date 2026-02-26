import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  GameAction,
  GamePhase,
  Screen,
  StaffMember,
  DailyReport,
  GameMessage,
  FinancialSummary,
  StaffRole,
  ScreenQuality,
  LicensedMovie,
  CustomerReview,
  ReviewCategory,
} from '../types';
import type { Loan } from '../types';
import { getDayOfWeek } from '../types';
import {
  movies as allMovies,
  staffTemplates,
  staffNames,
  screenUpgrades,
  theatreUpgrades,
  concessionItems as allConcessions,
  restorationTasks as defaultRestorationTasks,
  franchiseLocations as defaultFranchiseLocations,
  milestones as defaultMilestones,
  cutscenes,
  OPENING_REQUIREMENTS,
  randomReviewerName,
  pickReviewText,
} from '../data';

const STORAGE_KEY = 'theatre-sim-save';
const TICK_INTERVAL = 1000; // 1 second
const HOURS_PER_TICK = 1; // 1 game hour per tick
const BASE_CUSTOMER_RATE = 8; // base customers per showtime per screen

// ============ Loan Constants ============
const LOAN_PRINCIPAL = 600000;
const LOAN_INTEREST_RATE = 0.08; // 8% annual
const LOAN_DAILY_PAYMENT = 500; // $500/day — manageable but present
const STARTING_CASH = 100000;

function createInitialLoan(): Loan {
  return {
    principal: LOAN_PRINCIPAL,
    remaining: LOAN_PRINCIPAL,
    interestRate: LOAN_INTEREST_RATE,
    dailyPayment: LOAN_DAILY_PAYMENT,
    totalPaid: 0,
    paidOff: false,
  };
}

// ============ Initial State ============
function createInitialState(): GameState {
  return {
    phase: 'restoration',
    resources: { money: STARTING_CASH, reputation: 0 },
    time: { day: 1, hour: 8 },
    loan: createInitialLoan(),
    theatre: {
      screens: [
        { id: 'screen-1', name: 'Screen 1', seats: 80, quality: 'basic' as ScreenQuality, condition: 20, currentMovieId: null, showtimeHours: [14, 17, 20], ticketPrice: 8, unlocked: true, upgrading: false, upgradeCompletesAt: null },
        { id: 'screen-2', name: 'Screen 2', seats: 60, quality: 'basic' as ScreenQuality, condition: 10, currentMovieId: null, showtimeHours: [13, 16, 19], ticketPrice: 8, unlocked: false, upgrading: false, upgradeCompletesAt: null },
        { id: 'screen-3', name: 'Screen 3', seats: 100, quality: 'basic' as ScreenQuality, condition: 5, currentMovieId: null, showtimeHours: [12, 15, 18, 21], ticketPrice: 8, unlocked: false, upgrading: false, upgradeCompletesAt: null },
        { id: 'screen-4', name: 'Screen 4', seats: 50, quality: 'basic' as ScreenQuality, condition: 5, currentMovieId: null, showtimeHours: [14, 19], ticketPrice: 8, unlocked: false, upgrading: false, upgradeCompletesAt: null },
        { id: 'screen-5', name: 'Screen 5', seats: 120, quality: 'basic' as ScreenQuality, condition: 0, currentMovieId: null, showtimeHours: [13, 16, 19, 22], ticketPrice: 8, unlocked: false, upgrading: false, upgradeCompletesAt: null },
        { id: 'screen-6', name: 'Screen 6', seats: 40, quality: 'basic' as ScreenQuality, condition: 0, currentMovieId: null, showtimeHours: [15, 20], ticketPrice: 8, unlocked: false, upgrading: false, upgradeCompletesAt: null },
      ],
      upgrades: [],
      concessionStand: { capacity: 50, level: 0, upgradeCost: 1000 },
      concessionMenu: ['popcorn-small', 'soda-small'],
      restorationTasks: defaultRestorationTasks.map(t => ({ ...t })),
      condition: 15,
    },
    staff: [],
    licensedMovies: [],
    dailyReports: [],
    franchiseLocations: defaultFranchiseLocations.map(f => ({ ...f })),
    milestones: [],
    activeEvents: [],
    reviews: [],
    overallRating: 3,
    dailyCustomerCount: 0,
    stats: {
      totalRevenue: 0,
      totalTicketsSold: 0,
      totalConcessionsSold: 0,
      totalMoviesShown: 0,
      totalStaffHired: 0,
      totalUpgradesPurchased: 0,
      totalDaysPlayed: 0,
      peakDailyRevenue: 0,
      peakReputation: 0,
      franchisesOwned: 0,
    },
    lastTick: Date.now(),
    tutorialStep: 0,
    messageLog: [],
    financialHistory: [],
    cutscenesSeen: [],
    activeCutscene: 'intro', // Start with intro cutscene
  };
}

// ============ Helpers ============
let msgCounter = 0;
function addMessage(state: GameState, text: string, icon: string, type: GameMessage['type'] = 'info'): GameMessage {
  return { id: `msg-${++msgCounter}`, text, icon, day: state.time.day, type };
}

function getScreenQualityMultiplier(quality: ScreenQuality): number {
  switch (quality) {
    case 'basic': return 1.0;
    case 'standard': return 1.3;
    case 'premium': return 1.8;
    case 'imax': return 2.5;
    case 'dolby': return 2.8;
  }
}

function getUnlockScreenCost(index: number): number {
  const costs = [0, 5000, 12000, 20000, 35000, 50000];
  return costs[index] ?? 50000;
}

function getRepairCost(screen: Screen): number {
  const damage = 100 - screen.condition;
  return Math.floor(damage * 5 * getScreenQualityMultiplier(screen.quality));
}

function isTheatreOpen(state: GameState): boolean {
  if (state.phase === 'restoration') {
    return OPENING_REQUIREMENTS.every(id =>
      state.theatre.restorationTasks.find(t => t.id === id)?.completed
    );
  }
  return true;
}

function countStaffByRole(staff: StaffMember[], role: StaffRole): number {
  return staff.filter(s => s.role === role).length;
}

// ============ New Gameplay Helpers ============

/** Get movie popularity with decay over its license period */
function getMoviePopularity(movieId: string, licensedMovies: LicensedMovie[], currentDay: number): number {
  const movie = allMovies.find(m => m.id === movieId);
  if (!movie) return 0;
  const licensed = licensedMovies.find(lm => lm.movieId === movieId);
  if (!licensed) return movie.popularity;
  const totalDays = licensed.expiresDay - licensed.licensedDay;
  if (totalDays <= 0) return movie.popularity;
  const elapsed = currentDay - licensed.licensedDay;
  const progress = Math.max(0, Math.min(1, elapsed / totalDays));
  // Popularity decays: 100% at start → 40% at expiry
  const decayFactor = Math.max(0.4, 1 - progress * 0.6);
  return Math.floor(movie.popularity * decayFactor);
}

/** Day-of-week customer multiplier */
function getDayOfWeekMultiplier(day: number): number {
  const dow = getDayOfWeek(day);
  const multipliers = [0.6, 0.6, 0.7, 0.8, 1.3, 1.8, 1.5]; // Mon-Sun
  return multipliers[dow];
}

/** Time-of-day customer multiplier */
function getTimeOfDayMultiplier(hour: number): number {
  if (hour < 12) return 0.5;
  if (hour < 16) return 0.8;
  if (hour < 21) return 1.2;
  return 0.7;
}

/** Fair ticket price based on movie quality and screen quality */
function getFairPrice(movieQuality: number, screenQuality: ScreenQuality): number {
  const qualityMult = getScreenQualityMultiplier(screenQuality);
  return Math.max(5, Math.floor(movieQuality * 2.5 * qualityMult));
}

/** Price demand curve: how ticket price relative to fair price affects attendance */
function getPriceDemandMultiplier(ticketPrice: number, fairPrice: number): number {
  if (fairPrice <= 0) return 1;
  const ratio = ticketPrice / fairPrice;
  if (ratio <= 1) {
    // Underpriced: slight attendance boost
    return Math.min(1.3, 1 + (1 - ratio) * 0.5);
  } else {
    // Overpriced: significant attendance penalty
    return Math.max(0.2, 1 / Math.pow(ratio, 1.2));
  }
}

/** Overall rating effect on customer count */
function getRatingMultiplier(rating: number): number {
  // Rating 1 → 0.5x, Rating 3 → 0.85x, Rating 5 → 1.15x
  return 0.35 + rating * 0.16;
}

function getCustomerCount(state: GameState, screen: Screen): number {
  if (!screen.currentMovieId || !screen.unlocked || screen.upgrading) return 0;

  const movie = allMovies.find(m => m.id === screen.currentMovieId);
  if (!movie) return 0;

  // Use decaying popularity instead of base
  const currentPopularity = getMoviePopularity(screen.currentMovieId, state.licensedMovies, state.time.day);

  // Base rate scaled by current movie popularity
  let customers = Math.floor(BASE_CUSTOMER_RATE * (currentPopularity / 50));

  // Screen quality bonus
  customers = Math.floor(customers * getScreenQualityMultiplier(screen.quality) * 0.7);

  // Day-of-week multiplier (weekends are busier)
  customers = Math.floor(customers * getDayOfWeekMultiplier(state.time.day));

  // Time-of-day multiplier (prime time is busier)
  customers = Math.floor(customers * getTimeOfDayMultiplier(state.time.hour));

  // Price demand curve
  const fairPrice = getFairPrice(movie.qualityRating, screen.quality);
  customers = Math.floor(customers * getPriceDemandMultiplier(screen.ticketPrice, fairPrice));

  // Overall rating effect (reviews/Yelp)
  customers = Math.floor(customers * getRatingMultiplier(state.overallRating));

  // Reputation bonus (0-50% boost instead of 0-100%)
  customers = Math.floor(customers * (1 + state.resources.reputation / 200));

  // Theatre condition penalty
  if (state.theatre.condition < 50) {
    customers = Math.floor(customers * (0.5 + state.theatre.condition / 100));
  }

  // Screen condition penalty
  if (screen.condition < 50) {
    customers = Math.floor(customers * (0.5 + screen.condition / 100));
  }

  // Cashier bonus (each cashier adds 15% capacity)
  const cashiers = countStaffByRole(state.staff, 'cashier');
  if (cashiers === 0 && state.phase !== 'restoration') {
    customers = Math.floor(customers * 0.5); // penalty for no cashiers
  } else {
    customers = Math.floor(customers * (1 + cashiers * 0.15));
  }

  // Usher satisfaction bonus
  const ushers = countStaffByRole(state.staff, 'usher');
  customers = Math.floor(customers * (1 + ushers * 0.05));

  // Manager boost
  const managers = countStaffByRole(state.staff, 'manager');
  if (managers > 0) {
    customers = Math.floor(customers * 1.1);
  }

  // Upgrade bonuses
  let capacityBonus = 0;
  for (const uid of state.theatre.upgrades) {
    const upgrade = theatreUpgrades.find(u => u.id === uid);
    if (upgrade) capacityBonus += upgrade.customerCapacityBonus;
  }
  const unlockedCount = state.theatre.screens.filter(s => s.unlocked).length;
  if (unlockedCount > 0) {
    customers += Math.floor(capacityBonus / unlockedCount);
  }

  // Event multipliers
  for (const event of state.activeEvents) {
    if (event.effect.customerMultiplier) {
      customers = Math.floor(customers * event.effect.customerMultiplier);
    }
  }

  // Cap at seat count
  return Math.min(Math.max(0, customers), screen.seats);
}

function calculateConcessionRevenue(state: GameState, totalCustomers: number): number {
  const concessionWorkers = countStaffByRole(state.staff, 'concessions');
  if (concessionWorkers === 0) return 0;

  // Each customer has a chance to buy concessions
  const buyRate = 0.4 + (concessionWorkers * 0.1); // 40% base + 10% per worker
  const buyers = Math.floor(totalCustomers * Math.min(buyRate, 0.85));

  // Average spend based on unlocked items
  const unlockedItems = allConcessions.filter(c => state.theatre.concessionMenu.includes(c.id));
  if (unlockedItems.length === 0) return 0;

  const avgPrice = unlockedItems.reduce((sum, item) => sum + item.price * (item.popularity / 100), 0) / unlockedItems.length;
  const avgCost = unlockedItems.reduce((sum, item) => sum + item.cost * (item.popularity / 100), 0) / unlockedItems.length;

  const revenue = buyers * avgPrice;
  const costs = buyers * avgCost;

  return Math.floor((revenue - costs) * 100) / 100;
}

function calculateDailyExpenses(state: GameState): number {
  let expenses = 0;

  // Staff wages
  for (const s of state.staff) {
    expenses += s.wage;
  }

  // Maintenance (based on number of active screens)
  const activeScreens = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId);
  expenses += activeScreens.length * 50;

  // Event cost multipliers
  for (const event of state.activeEvents) {
    if (event.effect.costMultiplier) {
      expenses *= event.effect.costMultiplier;
    }
  }

  return Math.floor(expenses * 100) / 100;
}

function determinePhase(state: GameState): GamePhase {
  if (!isTheatreOpen(state)) return 'restoration';
  if (state.resources.reputation >= 55 || state.franchiseLocations.some(f => f.owned)) return 'franchise';
  return 'expansion';
}

// ============ Review Generation ============
function generateDailyReviews(state: GameState): CustomerReview[] {
  if (state.dailyCustomerCount === 0) return [];

  // Base review rate: 7%, more at extremes
  let reviewRate = 0.07;
  if (state.overallRating <= 2) reviewRate = 0.12;
  if (state.overallRating >= 4.5) reviewRate = 0.10;

  const numReviews = Math.max(1, Math.floor(state.dailyCustomerCount * reviewRate * (0.5 + Math.random())));

  // Detect issues and their severity
  const issues: { category: ReviewCategory; severity: number }[] = [];

  // Cleanliness: janitors and theatre condition
  const janitors = countStaffByRole(state.staff, 'janitor');
  if (janitors === 0 && isTheatreOpen(state)) {
    issues.push({ category: 'cleanliness', severity: 3 });
  } else if (state.theatre.condition < 25) {
    issues.push({ category: 'cleanliness', severity: 2 });
  } else if (state.theatre.condition < 45) {
    issues.push({ category: 'cleanliness', severity: 1 });
  }

  // Service: staff morale
  const hiredStaff = state.staff.filter(s => s.role !== 'janitor' && s.role !== 'projectionist');
  const avgMorale = hiredStaff.length > 0
    ? hiredStaff.reduce((sum, s) => sum + s.morale, 0) / hiredStaff.length
    : 50;
  if (avgMorale < 20) {
    issues.push({ category: 'service', severity: 3 });
  } else if (avgMorale < 35) {
    issues.push({ category: 'service', severity: 2 });
  } else if (avgMorale < 50) {
    issues.push({ category: 'service', severity: 1 });
  }

  // Experience: projectionists
  const projectionists = countStaffByRole(state.staff, 'projectionist');
  const activeScreens = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId && !s.upgrading).length;
  if (projectionists === 0 && activeScreens > 0) {
    issues.push({ category: 'experience', severity: 3 });
  } else if (projectionists < activeScreens) {
    issues.push({ category: 'experience', severity: 1 });
  }

  // Value: overpricing
  let totalPriceRatio = 0;
  let priceCount = 0;
  for (const screen of state.theatre.screens) {
    if (!screen.currentMovieId || !screen.unlocked) continue;
    const movie = allMovies.find(m => m.id === screen.currentMovieId);
    if (!movie) continue;
    const fair = getFairPrice(movie.qualityRating, screen.quality);
    totalPriceRatio += screen.ticketPrice / fair;
    priceCount++;
  }
  if (priceCount > 0) {
    const avgRatio = totalPriceRatio / priceCount;
    if (avgRatio > 1.5) issues.push({ category: 'value', severity: 3 });
    else if (avgRatio > 1.2) issues.push({ category: 'value', severity: 2 });
    else if (avgRatio > 1.05) issues.push({ category: 'value', severity: 1 });
  }

  // Facilities: screen conditions
  const unlockedScreens = state.theatre.screens.filter(s => s.unlocked);
  const avgCondition = unlockedScreens.length > 0
    ? unlockedScreens.reduce((sum, s) => sum + s.condition, 0) / unlockedScreens.length
    : 50;
  if (avgCondition < 20) issues.push({ category: 'facilities', severity: 3 });
  else if (avgCondition < 40) issues.push({ category: 'facilities', severity: 2 });
  else if (avgCondition < 55) issues.push({ category: 'facilities', severity: 1 });

  const reviews: CustomerReview[] = [];
  for (let i = 0; i < numReviews; i++) {
    let rating: number;
    let category: ReviewCategory;

    if (issues.length > 0 && Math.random() < 0.6) {
      // 60% chance to complain about a detected issue
      const issue = issues[Math.floor(Math.random() * issues.length)];
      category = issue.category;
      // severity 3 → 1 star, severity 2 → 2 stars, severity 1 → 3 stars (with some randomness)
      rating = Math.max(1, Math.min(5, 4 - issue.severity + (Math.random() < 0.3 ? 1 : 0)));
    } else {
      // Positive or neutral review — pick a random category
      const categories: ReviewCategory[] = ['cleanliness', 'service', 'experience', 'value', 'facilities'];
      category = categories[Math.floor(Math.random() * categories.length)];
      // Base rating on overall quality metrics
      const qualityScore = (
        (state.theatre.condition / 100) +
        (state.resources.reputation / 100) +
        (avgMorale / 100) +
        (avgCondition / 100)
      ) / 4;
      if (qualityScore > 0.7) rating = Math.random() < 0.6 ? 5 : 4;
      else if (qualityScore > 0.5) rating = Math.random() < 0.5 ? 4 : 3;
      else if (qualityScore > 0.3) rating = Math.random() < 0.5 ? 3 : 2;
      else rating = Math.random() < 0.4 ? 2 : 1;
    }

    rating = Math.max(1, Math.min(5, Math.round(rating)));

    reviews.push({
      id: `review-${state.time.day}-${i}`,
      day: state.time.day,
      rating,
      text: pickReviewText(rating, category),
      authorName: randomReviewerName(),
      category,
    });
  }

  return reviews;
}

/** Calculate overall rating from recent reviews (last 50) */
function calculateOverallRating(reviews: CustomerReview[]): number {
  const recent = reviews.slice(-50);
  if (recent.length === 0) return 3;
  const avg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  return Math.round(avg * 10) / 10;
}

// ============ Milestone Checks ============
function checkMilestones(state: GameState): GameState {
  const newMilestones = [...state.milestones];
  const newMessages = [...state.messageLog];
  let moneyBonus = 0;
  let repBonus = 0;

  const allMilestoneData = defaultMilestones;

  for (const m of allMilestoneData) {
    if (newMilestones.includes(m.id)) continue;

    let achieved = false;

    switch (m.id) {
      case 'first-screening':
        achieved = isTheatreOpen(state) && state.theatre.screens.some(s => s.currentMovieId);
        break;
      case 'first-profit':
        achieved = state.dailyReports.some(r => r.profit > 0);
        break;
      case 'hire-five':
        achieved = state.staff.length >= 5;
        break;
      case 'two-screens':
        achieved = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId).length >= 2;
        break;
      case 'four-screens':
        achieved = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId).length >= 4;
        break;
      case 'premium-screen':
        achieved = state.theatre.screens.some(s => s.quality === 'premium' || s.quality === 'imax' || s.quality === 'dolby');
        break;
      case 'concession-king':
        achieved = state.theatre.concessionMenu.length >= 10;
        break;
      case 'blockbuster': {
        achieved = state.licensedMovies.some(lm => {
          const movie = allMovies.find(m => m.id === lm.movieId);
          return movie && movie.popularity >= 80;
        });
        break;
      }
      case 'reputation-50':
        achieved = state.resources.reputation >= 50;
        break;
      case 'revenue-10k':
        achieved = state.dailyReports.some(r => r.totalRevenue >= 10000);
        break;
      case 'first-franchise':
        achieved = state.franchiseLocations.filter(f => f.owned).length >= 1;
        break;
      case 'three-franchises':
        achieved = state.franchiseLocations.filter(f => f.owned).length >= 3;
        break;
      case 'imax-screen':
        achieved = state.theatre.screens.some(s => s.quality === 'imax');
        break;
      case 'reputation-100':
        achieved = state.resources.reputation >= 100;
        break;
      case 'empire':
        achieved = state.franchiseLocations.every(f => f.owned);
        break;
    }

    if (achieved) {
      newMilestones.push(m.id);
      moneyBonus += m.moneyReward;
      repBonus += m.reputationReward;
      newMessages.push(addMessage(state, `Milestone: ${m.name}! ${m.reward}`, m.icon, 'milestone'));
    }
  }

  return {
    ...state,
    milestones: newMilestones,
    resources: {
      money: state.resources.money + moneyBonus,
      reputation: Math.min(100, state.resources.reputation + repBonus),
    },
    messageLog: newMessages.slice(-50),
  };
}

// ============ Cutscene Triggers ============
function checkCutsceneTriggers(state: GameState): GameState {
  if (state.activeCutscene) return state;

  for (const cs of cutscenes) {
    if (state.cutscenesSeen.includes(cs.id)) continue;

    let shouldTrigger = false;

    switch (cs.id) {
      case 'intro':
        break;
      case 'grand-opening':
        shouldTrigger = isTheatreOpen(state) && state.theatre.screens.some(s => s.currentMovieId) && !state.cutscenesSeen.includes('grand-opening');
        break;
      case 'first-profit':
        shouldTrigger = state.dailyReports.some(r => r.profit > 0);
        break;
      case 'second-screen':
        shouldTrigger = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId).length >= 2;
        break;
      case 'premium-upgrade':
        shouldTrigger = state.theatre.screens.some(s => s.quality === 'premium' || s.quality === 'imax' || s.quality === 'dolby');
        break;
      case 'loan-paid-off':
        shouldTrigger = state.loan.paidOff;
        break;
      case 'franchise-start':
        shouldTrigger = state.franchiseLocations.some(f => f.owned);
        break;
      case 'cinema-empire':
        shouldTrigger = state.franchiseLocations.every(f => f.owned);
        break;
    }

    if (shouldTrigger) {
      return { ...state, activeCutscene: cs.id };
    }
  }

  return state;
}

// Random events that can trigger
const RANDOM_EVENTS = [
  { id: 'critic-review', title: 'Glowing Review!', description: 'A local critic praises your theatre.', icon: '📰', effect: { customerMultiplier: 1.3 }, duration: 3 },
  { id: 'heatwave', title: 'Heatwave', description: 'People flock to air-conditioned theatres!', icon: '🌡️', effect: { customerMultiplier: 1.5 }, duration: 2 },
  { id: 'rainy-week', title: 'Rainy Week', description: 'Bad weather drives people indoors to the movies.', icon: '🌧️', effect: { customerMultiplier: 1.2 }, duration: 5 },
  { id: 'equipment-issue', title: 'Equipment Trouble', description: 'Some equipment needs emergency repairs.', icon: '⚠️', effect: { costMultiplier: 1.5 }, duration: 2 },
  { id: 'viral-moment', title: 'Gone Viral!', description: 'Your theatre goes viral on social media.', icon: '📱', effect: { customerMultiplier: 1.8, reputationChange: 3 }, duration: 2 },
  { id: 'holiday-rush', title: 'Holiday Rush', description: 'Holiday season brings extra moviegoers.', icon: '🎄', effect: { customerMultiplier: 1.6, revenueMultiplier: 1.2 }, duration: 4 },
];

// ============ Reducer ============
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      let newState = { ...state, lastTick: action.now };

      // Advance time
      let newHour = newState.time.hour + HOURS_PER_TICK;
      let newDay = newState.time.day;
      let dayChanged = false;

      if (newHour >= 24) {
        newHour = 8; // reset to 8am
        newDay += 1;
        dayChanged = true;
      }

      newState.time = { day: newDay, hour: newHour };

      // Process restoration tasks
      const newTasks = newState.theatre.restorationTasks.map(task => {
        if (task.inProgress && task.startedDay !== null) {
          const daysElapsed = newDay - task.startedDay;
          if (daysElapsed >= task.daysToComplete) {
            return { ...task, completed: true, inProgress: false };
          }
        }
        return task;
      });

      // Check for newly completed restoration tasks and generate messages
      const newMessages = [...newState.messageLog];
      for (let i = 0; i < newTasks.length; i++) {
        if (newTasks[i].completed && !newState.theatre.restorationTasks[i].completed) {
          newMessages.push(addMessage(newState, newTasks[i].narrativeText, newTasks[i].icon, 'success'));
          newState.resources = {
            ...newState.resources,
            reputation: Math.min(100, newState.resources.reputation + newTasks[i].reputationReward),
          };
        }
      }
      newState.messageLog = newMessages.slice(-50);
      newState.theatre = { ...newState.theatre, restorationTasks: newTasks };

      // Process screen upgrades
      const newScreens = newState.theatre.screens.map(screen => {
        if (screen.upgrading && screen.upgradeCompletesAt !== null && newDay >= screen.upgradeCompletesAt) {
          return { ...screen, upgrading: false, upgradeCompletesAt: null };
        }
        return screen;
      });
      newState.theatre = { ...newState.theatre, screens: newScreens };

      // Simulate showtime revenue if theatre is open
      if (isTheatreOpen(newState)) {
        const activeScreens = newState.theatre.screens.filter(
          s => s.unlocked && s.currentMovieId && !s.upgrading
        );

        // Check if this hour is a showtime for any screen
        let hourlyTicketRevenue = 0;
        let hourlyTicketsSold = 0;
        let hourlyCustomers = 0;

        for (const screen of activeScreens) {
          if (screen.showtimeHours.includes(newState.time.hour)) {
            // Check if there's a projectionist available
            const projectionists = countStaffByRole(newState.staff, 'projectionist');
            if (projectionists === 0) continue;

            const customers = getCustomerCount(newState, screen);
            const ticketRev = customers * screen.ticketPrice;

            hourlyTicketRevenue += ticketRev;
            hourlyTicketsSold += customers;
            hourlyCustomers += customers;
          }
        }

        const concessionRev = calculateConcessionRevenue(newState, hourlyCustomers);

        let totalHourlyRevenue = hourlyTicketRevenue + concessionRev;

        // Event revenue multipliers
        for (const event of newState.activeEvents) {
          if (event.effect.revenueMultiplier) {
            totalHourlyRevenue *= event.effect.revenueMultiplier;
          }
        }

        newState.resources = {
          ...newState.resources,
          money: Math.floor((newState.resources.money + totalHourlyRevenue) * 100) / 100,
        };

        // Track daily customer count for review generation
        newState.dailyCustomerCount = (newState.dailyCustomerCount || 0) + hourlyCustomers;

        newState.stats = {
          ...newState.stats,
          totalRevenue: newState.stats.totalRevenue + totalHourlyRevenue,
          totalTicketsSold: newState.stats.totalTicketsSold + hourlyTicketsSold,
          totalConcessionsSold: newState.stats.totalConcessionsSold + (concessionRev > 0 ? hourlyCustomers : 0),
        };
      }

      // Day change processing
      if (dayChanged) {
        // Generate reviews from yesterday's customers (before resetting count)
        if (newState.dailyCustomerCount > 0 && isTheatreOpen(newState)) {
          const newReviews = generateDailyReviews(newState);
          newState.reviews = [...newState.reviews.slice(-200), ...newReviews];
          newState.overallRating = calculateOverallRating(newState.reviews);
        }

        // Movie expiry — remove expired licenses and clear screens
        const expiredMovies = newState.licensedMovies.filter(lm => newDay >= lm.expiresDay);
        if (expiredMovies.length > 0) {
          const expiredIds = expiredMovies.map(lm => lm.movieId);
          newState.licensedMovies = newState.licensedMovies.filter(lm => newDay < lm.expiresDay);
          newState.theatre = {
            ...newState.theatre,
            screens: newState.theatre.screens.map(s =>
              s.currentMovieId && expiredIds.includes(s.currentMovieId)
                ? { ...s, currentMovieId: null }
                : s
            ),
          };
          for (const lm of expiredMovies) {
            const movie = allMovies.find(m => m.id === lm.movieId);
            if (movie) {
              newState.messageLog = [...newState.messageLog, addMessage(newState, `License expired for "${movie.title}"`, '📋', 'warning')].slice(-50);
            }
          }
        }

        // Calculate daily expenses
        const dailyExpenses = calculateDailyExpenses(newState);
        newState.resources = {
          ...newState.resources,
          money: Math.floor((newState.resources.money - dailyExpenses) * 100) / 100,
        };

        // Loan payment
        if (!newState.loan.paidOff && newState.loan.remaining > 0) {
          const dailyInterest = (newState.loan.remaining * newState.loan.interestRate) / 365;
          const payment = Math.min(newState.loan.dailyPayment, newState.loan.remaining + dailyInterest);
          const principalPortion = Math.max(0, payment - dailyInterest);

          newState.resources = {
            ...newState.resources,
            money: Math.floor((newState.resources.money - payment) * 100) / 100,
          };

          const newRemaining = Math.max(0, newState.loan.remaining - principalPortion);
          newState.loan = {
            ...newState.loan,
            remaining: Math.floor(newRemaining * 100) / 100,
            totalPaid: Math.floor((newState.loan.totalPaid + payment) * 100) / 100,
            paidOff: newRemaining <= 0,
          };

          if (newRemaining <= 0 && !newState.cutscenesSeen.includes('loan-paid-off')) {
            newState.messageLog = [...newState.messageLog, addMessage(newState, 'The loan is paid off! You own the Starlight free and clear!', '🎉', 'milestone')].slice(-50);
          }
        }

        // Screen condition degrades
        newState.theatre = {
          ...newState.theatre,
          screens: newState.theatre.screens.map(s => {
            if (!s.unlocked || s.upgrading) return s;
            const degradeRate = s.currentMovieId ? 2 : 0.5;
            return { ...s, condition: Math.max(0, s.condition - degradeRate) };
          }),
        };

        // Janitors restore condition
        const janitors = countStaffByRole(newState.staff, 'janitor');
        if (janitors > 0) {
          const conditionGain = janitors * 5;
          newState.theatre = {
            ...newState.theatre,
            condition: Math.min(100, newState.theatre.condition + conditionGain),
          };
        } else if (isTheatreOpen(newState)) {
          newState.theatre = {
            ...newState.theatre,
            condition: Math.max(0, newState.theatre.condition - 3),
          };
        }

        // Reputation slowly decays toward base if conditions are poor
        if (newState.theatre.condition < 30 && newState.resources.reputation > 0) {
          newState.resources = {
            ...newState.resources,
            reputation: Math.max(0, newState.resources.reputation - 1),
          };
        }

        // Reputation slowly grows if conditions are good and we have movies showing
        if (newState.theatre.condition > 70 && isTheatreOpen(newState)) {
          const showingMovies = newState.theatre.screens.filter(s => s.currentMovieId).length;
          if (showingMovies > 0) {
            // Rating affects reputation growth: good rating = faster rep gain
            const ratingFactor = state.overallRating >= 4 ? 1.5 : state.overallRating >= 3 ? 1.0 : 0.5;
            const gain = Math.min(0.5, showingMovies * 0.1 * ratingFactor);
            newState.resources = {
              ...newState.resources,
              reputation: Math.min(100, newState.resources.reputation + gain),
            };
          }
        }

        // Staff morale and skill changes
        const managers = countStaffByRole(newState.staff, 'manager');
        const activeScreenCount = newState.theatre.screens.filter(s => s.unlocked && s.currentMovieId && !s.upgrading).length;

        newState.staff = newState.staff.map(s => {
          let morale = s.morale;
          let skill = s.skill;

          // Morale tends toward 50 naturally, +3 if manager exists
          if (managers > 0) morale = Math.min(100, morale + 3);
          if (morale > 50) morale -= 1;
          else if (morale < 50) morale += 1;

          // Workload-based morale effects: understaffed roles get morale penalty
          if (s.role === 'projectionist') {
            const projectionists = countStaffByRole(newState.staff, 'projectionist');
            if (projectionists > 0 && activeScreenCount / projectionists > 2) {
              morale -= 3; // overworked
            }
          }
          if (s.role === 'cashier') {
            const cashiers = countStaffByRole(newState.staff, 'cashier');
            if (cashiers === 1 && activeScreenCount > 2) {
              morale -= 2; // overworked
            }
          }
          if (s.role === 'janitor') {
            if (newState.theatre.condition < 30) {
              morale -= 2; // overwhelmed by mess
            }
          }

          morale = Math.max(0, Math.min(100, morale));

          // Skill slowly improves
          const template = staffTemplates.find(t => t.role === s.role);
          if (template && skill < template.maxSkill) {
            skill = Math.min(template.maxSkill, skill + 0.5);
          }

          return { ...s, morale, skill, daysEmployed: s.daysEmployed + 1 };
        });

        // Staff quitting: morale < 20 = 10% chance to quit each day
        const quitters: StaffMember[] = [];
        newState.staff = newState.staff.filter(s => {
          if (s.morale < 20 && Math.random() < 0.1) {
            quitters.push(s);
            return false;
          }
          return true;
        });
        for (const q of quitters) {
          newState.messageLog = [...newState.messageLog, addMessage(newState, `${q.name} (${q.role}) quit due to low morale!`, '😤', 'warning')].slice(-50);
        }

        // Generate daily report
        const todayReport = generateDailyReport(newState, dailyExpenses);
        newState.dailyReports = [...newState.dailyReports.slice(-29), todayReport];

        // Financial history
        const summary = generateFinancialSummary(newState, todayReport);
        newState.financialHistory = [...newState.financialHistory.slice(-29), summary];

        // Stats update
        newState.stats = {
          ...newState.stats,
          totalDaysPlayed: newState.stats.totalDaysPlayed + 1,
          peakDailyRevenue: Math.max(newState.stats.peakDailyRevenue, todayReport.totalRevenue),
          peakReputation: Math.max(newState.stats.peakReputation, newState.resources.reputation),
        };

        // Reset daily customer count for new day
        newState.dailyCustomerCount = 0;

        // Random events (5% chance per day after opening)
        if (isTheatreOpen(newState) && Math.random() < 0.05 && newState.activeEvents.length === 0) {
          const eventTemplate = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          const event = {
            ...eventTemplate,
            startDay: newDay,
          };
          newState.activeEvents = [event];
          newState.messageLog = [...newState.messageLog, addMessage(newState, `${event.title}: ${event.description}`, event.icon, 'info')].slice(-50);

          if (event.effect.reputationChange) {
            newState.resources = {
              ...newState.resources,
              reputation: Math.min(100, Math.max(0, newState.resources.reputation + event.effect.reputationChange)),
            };
          }
        }

        // Expire old events
        newState.activeEvents = newState.activeEvents.filter(
          e => newDay - e.startDay < e.duration
        );

        // Franchise daily income
        for (const loc of newState.franchiseLocations) {
          if (loc.owned && loc.manager) {
            const income = loc.dailyRevenue - loc.dailyExpenses;
            newState.resources = {
              ...newState.resources,
              money: newState.resources.money + income,
            };
          }
        }
      }

      // Determine phase
      newState.phase = determinePhase(newState);

      // Check milestones
      newState = checkMilestones(newState);

      // Check cutscene triggers (only if no cutscene is active)
      if (!newState.activeCutscene) {
        newState = checkCutsceneTriggers(newState);
      }

      return newState;
    }

    case 'START_RESTORATION': {
      const task = state.theatre.restorationTasks.find(t => t.id === action.taskId);
      if (!task || task.completed || task.inProgress) return state;
      if (task.prerequisite) {
        const prereq = state.theatre.restorationTasks.find(t => t.id === task.prerequisite);
        if (!prereq?.completed) return state;
      }
      if (state.resources.money < task.cost) return state;

      const sameTypeInProgress = state.theatre.restorationTasks.some(
        t => t.inProgress && t.category === task.category
      );
      if (sameTypeInProgress) return state;

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - task.cost },
        theatre: {
          ...state.theatre,
          restorationTasks: state.theatre.restorationTasks.map(t =>
            t.id === action.taskId ? { ...t, inProgress: true, startedDay: state.time.day } : t
          ),
        },
        messageLog: [...state.messageLog, addMessage(state, `Started: ${task.name}`, task.icon, 'info')].slice(-50),
      };
    }

    case 'ASSIGN_MOVIE': {
      const screen = state.theatre.screens.find(s => s.id === action.screenId);
      if (!screen || !screen.unlocked || screen.upgrading) return state;
      if (!state.licensedMovies.some(lm => lm.movieId === action.movieId)) return state;

      return {
        ...state,
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, currentMovieId: action.movieId } : s
          ),
        },
        stats: { ...state.stats, totalMoviesShown: state.stats.totalMoviesShown + 1 },
      };
    }

    case 'REMOVE_MOVIE': {
      return {
        ...state,
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, currentMovieId: null } : s
          ),
        },
      };
    }

    case 'SET_TICKET_PRICE': {
      const price = Math.max(1, Math.min(50, action.price));
      return {
        ...state,
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, ticketPrice: price } : s
          ),
        },
      };
    }

    case 'SET_SHOWTIMES': {
      return {
        ...state,
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, showtimeHours: action.hours } : s
          ),
        },
      };
    }

    case 'UPGRADE_SCREEN': {
      const screen = state.theatre.screens.find(s => s.id === action.screenId);
      const upgrade = screenUpgrades.find(u => u.id === action.upgradeId);
      if (!screen || !upgrade) return state;
      if (screen.quality !== upgrade.fromQuality) return state;
      if (state.resources.money < upgrade.cost) return state;
      if (screen.upgrading) return state;

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - upgrade.cost },
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? {
              ...s,
              quality: upgrade.toQuality,
              seats: Math.max(20, s.seats + upgrade.seatsChange),
              ticketPrice: Math.floor(s.ticketPrice * upgrade.ticketPriceMultiplier * 100) / 100,
              upgrading: true,
              upgradeCompletesAt: state.time.day + upgrade.daysToComplete,
              currentMovieId: null,
            } : s
          ),
        },
        stats: { ...state.stats, totalUpgradesPurchased: state.stats.totalUpgradesPurchased + 1 },
        messageLog: [...state.messageLog, addMessage(state, `Upgrading ${screen.name} to ${upgrade.toQuality}! (${upgrade.daysToComplete} days)`, upgrade.icon, 'info')].slice(-50),
      };
    }

    case 'UNLOCK_SCREEN': {
      const screenIndex = state.theatre.screens.findIndex(s => s.id === action.screenId);
      const screen = state.theatre.screens[screenIndex];
      if (!screen || screen.unlocked) return state;
      const cost = getUnlockScreenCost(screenIndex);
      if (state.resources.money < cost) return state;

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - cost },
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, unlocked: true, condition: 50 } : s
          ),
        },
        messageLog: [...state.messageLog, addMessage(state, `${screen.name} unlocked!`, '🔓', 'success')].slice(-50),
      };
    }

    case 'REPAIR_SCREEN': {
      const screen = state.theatre.screens.find(s => s.id === action.screenId);
      if (!screen || !screen.unlocked) return state;
      const cost = getRepairCost(screen);
      if (state.resources.money < cost || screen.condition >= 100) return state;

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - cost },
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.id === action.screenId ? { ...s, condition: 100 } : s
          ),
        },
      };
    }

    case 'HIRE_STAFF': {
      const template = staffTemplates.find(t => t.role === action.role);
      if (!template) return state;

      const name = staffNames[Math.floor(Math.random() * staffNames.length)];
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        role: action.role,
        skill: template.startingSkill,
        wage: template.baseWage,
        morale: 60,
        hired: true,
        daysEmployed: 0,
      };

      return {
        ...state,
        staff: [...state.staff, newStaff],
        stats: { ...state.stats, totalStaffHired: state.stats.totalStaffHired + 1 },
        messageLog: [...state.messageLog, addMessage(state, `Hired ${name} as ${template.name}`, template.icon, 'info')].slice(-50),
      };
    }

    case 'FIRE_STAFF': {
      const member = state.staff.find(s => s.id === action.staffId);
      if (!member) return state;

      return {
        ...state,
        staff: state.staff.filter(s => s.id !== action.staffId),
        messageLog: [...state.messageLog, addMessage(state, `${member.name} has been let go.`, '👋', 'info')].slice(-50),
      };
    }

    case 'LICENSE_MOVIE': {
      const movie = allMovies.find(m => m.id === action.movieId);
      if (!movie) return state;
      if (state.resources.reputation < movie.minReputation) return state;
      if (state.licensedMovies.some(lm => lm.movieId === action.movieId)) return state;
      if (state.resources.money < movie.licenseCost) return state;

      const licensedMovie: LicensedMovie = {
        movieId: action.movieId,
        licensedDay: state.time.day,
        expiresDay: state.time.day + movie.durationWeeks * 7,
      };

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - movie.licenseCost },
        licensedMovies: [...state.licensedMovies, licensedMovie],
        messageLog: [...state.messageLog, addMessage(state, `Licensed "${movie.title}" for ${movie.durationWeeks} weeks!`, movie.icon, 'success')].slice(-50),
      };
    }

    case 'DROP_MOVIE': {
      return {
        ...state,
        licensedMovies: state.licensedMovies.filter(lm => lm.movieId !== action.movieId),
        theatre: {
          ...state.theatre,
          screens: state.theatre.screens.map(s =>
            s.currentMovieId === action.movieId ? { ...s, currentMovieId: null } : s
          ),
        },
      };
    }

    case 'UNLOCK_CONCESSION': {
      const item = allConcessions.find(c => c.id === action.itemId);
      if (!item) return state;
      if (state.theatre.concessionMenu.includes(action.itemId)) return state;
      if (state.resources.money < item.unlockCost) return state;

      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - item.unlockCost },
        theatre: {
          ...state.theatre,
          concessionMenu: [...state.theatre.concessionMenu, action.itemId],
        },
        messageLog: [...state.messageLog, addMessage(state, `Added ${item.name} to the menu!`, item.icon, 'success')].slice(-50),
      };
    }

    case 'UPGRADE_CONCESSION_STAND': {
      const cost = state.theatre.concessionStand.upgradeCost;
      if (state.resources.money < cost) return state;

      const newLevel = state.theatre.concessionStand.level + 1;
      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - cost },
        theatre: {
          ...state.theatre,
          concessionStand: {
            capacity: state.theatre.concessionStand.capacity + 25,
            level: newLevel,
            upgradeCost: Math.floor(cost * 1.8),
          },
        },
      };
    }

    case 'PURCHASE_UPGRADE': {
      const upgrade = theatreUpgrades.find(u => u.id === action.upgradeId);
      if (!upgrade) return state;
      if (state.theatre.upgrades.includes(action.upgradeId)) return state;
      if (upgrade.prerequisite && !state.theatre.upgrades.includes(upgrade.prerequisite)) return state;
      if (state.resources.money < upgrade.cost) return state;

      return {
        ...state,
        resources: {
          money: state.resources.money - upgrade.cost,
          reputation: Math.min(100, state.resources.reputation + upgrade.reputationBonus),
        },
        theatre: {
          ...state.theatre,
          upgrades: [...state.theatre.upgrades, action.upgradeId],
        },
        stats: { ...state.stats, totalUpgradesPurchased: state.stats.totalUpgradesPurchased + 1 },
        messageLog: [...state.messageLog, addMessage(state, `Purchased: ${upgrade.name}!`, upgrade.icon, 'success')].slice(-50),
      };
    }

    case 'PURCHASE_FRANCHISE': {
      const location = state.franchiseLocations.find(f => f.id === action.locationId);
      if (!location || location.owned) return state;
      if (state.resources.money < location.purchaseCost) return state;
      if (state.resources.reputation < location.unlockReputation) return state;

      const franchiseRevBase = location.screens * 400;
      return {
        ...state,
        resources: { ...state.resources, money: state.resources.money - location.purchaseCost },
        franchiseLocations: state.franchiseLocations.map(f =>
          f.id === action.locationId ? { ...f, owned: true, dailyRevenue: franchiseRevBase } : f
        ),
        stats: { ...state.stats, franchisesOwned: state.stats.franchisesOwned + 1 },
        messageLog: [...state.messageLog, addMessage(state, `Purchased ${location.name}!`, '🏗️', 'milestone')].slice(-50),
      };
    }

    case 'ASSIGN_FRANCHISE_MANAGER': {
      const location = state.franchiseLocations.find(f => f.id === action.locationId);
      if (!location || !location.owned) return state;

      return {
        ...state,
        franchiseLocations: state.franchiseLocations.map(f =>
          f.id === action.locationId ? { ...f, manager: action.managerId } : f
        ),
      };
    }

    case 'DISMISS_MESSAGE': {
      return {
        ...state,
        messageLog: state.messageLog.filter(m => m.id !== action.messageId),
      };
    }

    case 'TRIGGER_CUTSCENE': {
      if (state.cutscenesSeen.includes(action.cutsceneId)) return state;
      return { ...state, activeCutscene: action.cutsceneId };
    }

    case 'COMPLETE_CUTSCENE': {
      return {
        ...state,
        activeCutscene: null,
        cutscenesSeen: [...state.cutscenesSeen, action.cutsceneId],
      };
    }

    case 'ADVANCE_TUTORIAL': {
      return { ...state, tutorialStep: state.tutorialStep + 1 };
    }

    case 'RESET_GAME': {
      localStorage.removeItem(STORAGE_KEY);
      msgCounter = 0;
      return createInitialState();
    }

    default:
      return state;
  }
}

function generateDailyReport(state: GameState, expenses: number): DailyReport {
  const lastReport = state.dailyReports[state.dailyReports.length - 1];
  const ticketRev = Math.max(0, (state.stats.totalRevenue - (lastReport?.ticketRevenue ?? 0)) * 0.7);
  const concRev = Math.max(0, (state.stats.totalRevenue - (lastReport?.ticketRevenue ?? 0)) * 0.3);

  return {
    day: state.time.day,
    ticketsSold: state.stats.totalTicketsSold,
    ticketRevenue: Math.floor(ticketRev),
    concessionRevenue: Math.floor(concRev),
    totalRevenue: Math.floor(ticketRev + concRev),
    expenses: Math.floor(expenses),
    profit: Math.floor(ticketRev + concRev - expenses),
    avgSatisfaction: Math.min(100, state.theatre.condition * 0.5 + state.resources.reputation * 0.5),
    customerCount: state.dailyCustomerCount || 0,
  };
}

function generateFinancialSummary(state: GameState, report: DailyReport): FinancialSummary {
  const staffCosts = state.staff.reduce((sum, s) => sum + s.wage, 0);
  const licenseCosts = 0; // License costs are now one-time, not recurring
  const maintenanceCosts = state.theatre.screens.filter(s => s.unlocked && s.currentMovieId).length * 50;
  const loanPayment = state.loan.paidOff ? 0 : state.loan.dailyPayment;
  const franchiseRev = state.franchiseLocations.filter(f => f.owned && f.manager).reduce((sum, f) => sum + f.dailyRevenue, 0);

  const totalExp = Math.floor(staffCosts + licenseCosts + maintenanceCosts + loanPayment);
  return {
    ticketRevenue: report.ticketRevenue,
    concessionRevenue: report.concessionRevenue,
    franchiseRevenue: franchiseRev,
    staffCosts: Math.floor(staffCosts),
    licenseCosts: Math.floor(licenseCosts),
    maintenanceCosts: Math.floor(maintenanceCosts + loanPayment),
    upgradeCosts: 0,
    totalRevenue: report.totalRevenue + franchiseRev,
    totalExpenses: totalExp,
    netProfit: report.totalRevenue + franchiseRev - totalExp,
  };
}

// ============ Hook ============
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const initial = createInitialState();
        const merged = {
          ...initial,
          ...parsed,
          resources: { ...initial.resources, ...parsed.resources },
          loan: { ...initial.loan, ...parsed.loan },
          theatre: { ...initial.theatre, ...parsed.theatre },
          stats: { ...initial.stats, ...parsed.stats },
        };
        // Migrate old saves that started with $5,000 instead of $100,000
        if (!parsed.loan || parsed.loan.principal === undefined) {
          merged.resources.money = merged.resources.money + (STARTING_CASH - 5000);
          merged.loan = initial.loan;
        }
        // Migrate currentMovies (string[]) → licensedMovies (LicensedMovie[])
        if (parsed.currentMovies && !parsed.licensedMovies) {
          merged.licensedMovies = (parsed.currentMovies as string[]).map((movieId: string) => {
            const movie = allMovies.find(m => m.id === movieId);
            return {
              movieId,
              licensedDay: parsed.time?.day ?? 1,
              expiresDay: (parsed.time?.day ?? 1) + (movie ? movie.durationWeeks * 7 : 28),
            };
          });
        }
        // Ensure new fields exist
        if (merged.reviews === undefined) merged.reviews = [];
        if (merged.overallRating === undefined) merged.overallRating = 3;
        if (merged.dailyCustomerCount === undefined) merged.dailyCustomerCount = 0;
        return merged;
      } catch {
        return createInitialState();
      }
    }
    return createInitialState();
  });

  const tickRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Tick loop
  useEffect(() => {
    tickRef.current = setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() });
    }, TICK_INTERVAL);
    return () => clearInterval(tickRef.current);
  }, []);

  // Action creators
  const startRestoration = useCallback((taskId: string) => dispatch({ type: 'START_RESTORATION', taskId }), []);
  const assignMovie = useCallback((screenId: string, movieId: string) => dispatch({ type: 'ASSIGN_MOVIE', screenId, movieId }), []);
  const removeMovie = useCallback((screenId: string) => dispatch({ type: 'REMOVE_MOVIE', screenId }), []);
  const setTicketPrice = useCallback((screenId: string, price: number) => dispatch({ type: 'SET_TICKET_PRICE', screenId, price }), []);
  const setShowtimes = useCallback((screenId: string, hours: number[]) => dispatch({ type: 'SET_SHOWTIMES', screenId, hours }), []);
  const upgradeScreen = useCallback((screenId: string, upgradeId: string) => dispatch({ type: 'UPGRADE_SCREEN', screenId, upgradeId }), []);
  const unlockScreen = useCallback((screenId: string) => dispatch({ type: 'UNLOCK_SCREEN', screenId }), []);
  const repairScreen = useCallback((screenId: string) => dispatch({ type: 'REPAIR_SCREEN', screenId }), []);
  const hireStaff = useCallback((role: StaffRole) => dispatch({ type: 'HIRE_STAFF', role }), []);
  const fireStaff = useCallback((staffId: string) => dispatch({ type: 'FIRE_STAFF', staffId }), []);
  const licenseMovie = useCallback((movieId: string) => dispatch({ type: 'LICENSE_MOVIE', movieId }), []);
  const dropMovie = useCallback((movieId: string) => dispatch({ type: 'DROP_MOVIE', movieId }), []);
  const unlockConcession = useCallback((itemId: string) => dispatch({ type: 'UNLOCK_CONCESSION', itemId }), []);
  const upgradeConcessionStand = useCallback(() => dispatch({ type: 'UPGRADE_CONCESSION_STAND' }), []);
  const purchaseUpgrade = useCallback((upgradeId: string) => dispatch({ type: 'PURCHASE_UPGRADE', upgradeId }), []);
  const purchaseFranchise = useCallback((locationId: string) => dispatch({ type: 'PURCHASE_FRANCHISE', locationId }), []);
  const assignFranchiseManager = useCallback((locationId: string, managerId: string) => dispatch({ type: 'ASSIGN_FRANCHISE_MANAGER', locationId, managerId }), []);
  const dismissMessage = useCallback((messageId: string) => dispatch({ type: 'DISMISS_MESSAGE', messageId }), []);
  const advanceTutorial = useCallback(() => dispatch({ type: 'ADVANCE_TUTORIAL' }), []);
  const completeCutscene = useCallback((cutsceneId: string) => dispatch({ type: 'COMPLETE_CUTSCENE', cutsceneId }), []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);

  return {
    state,
    startRestoration,
    assignMovie,
    removeMovie,
    setTicketPrice,
    setShowtimes,
    upgradeScreen,
    unlockScreen,
    repairScreen,
    hireStaff,
    fireStaff,
    licenseMovie,
    dropMovie,
    unlockConcession,
    upgradeConcessionStand,
    purchaseUpgrade,
    purchaseFranchise,
    assignFranchiseManager,
    dismissMessage,
    advanceTutorial,
    completeCutscene,
    resetGame,
    isTheatreOpen: isTheatreOpen(state),
    getUnlockScreenCost,
    getRepairCost,
  };
}
