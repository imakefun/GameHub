// Late Stage Capitalism Simulator - Type Definitions

// Core resource types
export interface FundResources {
  capital: number; // Available cash to deploy
  managementFees: number; // Annual management fee income
  reputation: number; // 0-100, affects deal flow and pricing
  totalReturns: number; // Cumulative returns generated
}

// Company health metrics
export interface CompanyMetrics {
  revenue: number;
  profit: number;
  debt: number;
  employees: number;
  morale: number; // 0-100
  brandValue: number; // 0-100
  customerSatisfaction: number; // 0-100
  assetValue: number;
}

// A company available for acquisition
export interface TargetCompany {
  id: string;
  name: string;
  description: string;
  industry: string;
  parody: string; // What real company this parodies
  icon: string;
  basePrice: number;
  metrics: CompanyMetrics;
  specialAssets: string[]; // Exploitable assets
  vulnerabilities: string[]; // Why they're a good PE target
}

// A company in the player's portfolio
export interface PortfolioCompany {
  id: string;
  companyId: string;
  name: string;
  description: string;
  industry: string;
  parody: string;
  icon: string;
  purchasePrice: number;
  currentMetrics: CompanyMetrics;
  originalMetrics: CompanyMetrics;
  debtLoaded: number;
  employeesLaidOff: number;
  assetsStripped: string[];
  managementFeesExtracted: number;
  dividendsExtracted: number;
  yearsOwned: number;
  status: 'healthy' | 'struggling' | 'declining' | 'failing' | 'bankrupt';
  newsHeadlines: string[];
}

// PE strategies/actions
export interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'financial' | 'operational' | 'extraction' | 'exit';
  effects: StrategyEffect[];
  requirements: StrategyRequirement[];
  cooldownMonths: number;
  reputationCost: number;
}

export interface StrategyEffect {
  metric: keyof CompanyMetrics | 'capital' | 'managementFees';
  modifier: 'add' | 'multiply' | 'subtract';
  value: number;
  description: string;
}

export interface StrategyRequirement {
  type: 'minEmployees' | 'minAssets' | 'minMorale' | 'minBrandValue' | 'maxDebt' | 'minRevenue';
  value: number;
}

// Random events that occur
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  probability: number; // 0-1
  category: 'scandal' | 'market' | 'regulatory' | 'employee' | 'customer' | 'opportunity';
  conditions?: EventCondition[];
  effects: EventEffect[];
  choices?: EventChoice[];
}

export interface EventCondition {
  type: 'hasPortfolio' | 'portfolioSize' | 'reputation' | 'totalDebt' | 'employeesLaidOff';
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
}

export interface EventEffect {
  target: 'fund' | 'randomCompany' | 'allCompanies';
  metric: keyof CompanyMetrics | keyof FundResources;
  modifier: 'add' | 'multiply' | 'subtract';
  value: number;
}

export interface EventChoice {
  text: string;
  effects: EventEffect[];
  reputationChange: number;
}

// Acquisition deal
export interface AcquisitionDeal {
  companyId: string;
  offeredPrice: number;
  debtFinancing: number; // How much of the deal is financed with debt
  negotiationStatus: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOffer?: number;
}

// Game statistics
export interface GameStats {
  companiesAcquired: number;
  companiesBankrupted: number;
  companiesSold: number;
  totalEmployeesLaidOff: number;
  totalDebtLoaded: number;
  totalAssetsStripped: number;
  totalFeesExtracted: number;
  totalDividendsExtracted: number;
  biggestDeal: number;
  biggestBankruptcy: string;
  yearsInBusiness: number;
  monthsPlayed: number;
}

// Pending action with cooldown
export interface PendingAction {
  strategyId: string;
  companyId: string;
  completesAt: number; // timestamp
}

// Active event requiring response
export interface ActiveEvent {
  event: GameEvent;
  triggeredAt: number;
  companyId?: string;
}

// Complete game state
export interface GameState {
  fund: FundResources;
  portfolio: PortfolioCompany[];
  availableTargets: TargetCompany[];
  pendingDeals: AcquisitionDeal[];
  pendingActions: PendingAction[];
  activeEvent: ActiveEvent | null;
  stats: GameStats;
  currentMonth: number; // 0-11
  currentYear: number;
  lastTick: number;
  lastSaved: number;
  tutorialCompleted: boolean;
  unlockedStrategies: string[];
  newsHistory: NewsItem[];
}

// News item for the ticker
export interface NewsItem {
  id: string;
  headline: string;
  timestamp: number;
  category: 'acquisition' | 'layoff' | 'bankruptcy' | 'scandal' | 'profit' | 'market';
  companyId?: string;
}

// Game settings
export interface GameSettings {
  startingCapital: number;
  startingReputation: number;
  monthDurationMs: number;
  baseManagementFeeRate: number; // % of AUM
  maxPortfolioSize: number;
  bankruptcyThreshold: number; // Debt-to-revenue ratio
  initialTargetCount: number;
}

// All actions the game can handle
export type GameAction =
  | { type: 'TICK'; delta: number }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'RESEARCH_COMPANY'; companyId: string }
  | { type: 'MAKE_OFFER'; companyId: string; offer: number; debtPct: number }
  | { type: 'ACCEPT_COUNTER'; dealIndex: number }
  | { type: 'CANCEL_DEAL'; dealIndex: number }
  | { type: 'EXECUTE_STRATEGY'; companyId: string; strategyId: string }
  | { type: 'SELL_COMPANY'; companyId: string; price: number }
  | { type: 'DECLARE_BANKRUPTCY'; companyId: string }
  | { type: 'HANDLE_EVENT_CHOICE'; choiceIndex: number }
  | { type: 'DISMISS_EVENT' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'ADD_NEWS'; headline: string; category: NewsItem['category']; companyId?: string }
  | { type: 'REFRESH_TARGETS' };
