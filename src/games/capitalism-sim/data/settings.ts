// Late Stage Capitalism Simulator - Game Settings

import type { GameSettings } from '../types';

export const defaultSettings: GameSettings = {
  startingCapital: 500000000, // $500M starting fund
  startingReputation: 50, // Middle of the road reputation
  monthDurationMs: 3000, // 3 seconds per game month
  baseManagementFeeRate: 0.02, // 2% management fee on AUM
  maxPortfolioSize: 10, // Max companies you can own
  bankruptcyThreshold: 3, // Debt-to-revenue ratio triggers bankruptcy
  initialTargetCount: 8, // Number of acquisition targets shown initially (ensure 5+ choices)
  maxDebtPercentNewPlayer: 50, // New players can only use up to 50% debt financing
  maxDebtPercentExperienced: 85, // Experienced players (3+ deals) can use up to 85%
};

// Management actions available to players (only when managing owned companies)
export const managementActions = [
  {
    id: 'load-debt',
    name: 'Refinance with Debt',
    description: 'Take on additional debt to extract cash from the company. Higher amounts increase financial risk.',
    icon: '💳',
    category: 'debt' as const,
    isAdjustable: true,
    minPercent: 5, // Min 5% of revenue as new debt
    maxPercent: 50, // Max 50% of revenue as new debt
    riskThresholds: { low: 15, medium: 30, high: 45 },
    cooldownMonths: 6,
  },
  {
    id: 'take-dividend',
    name: 'Special Dividend',
    description: 'Pay yourself a dividend from company cash reserves. Reduces available capital for operations.',
    icon: '💰',
    category: 'extraction' as const,
    isAdjustable: true,
    minPercent: 10, // Min 10% of cash/assets
    maxPercent: 80, // Max 80% of cash/assets
    riskThresholds: { low: 25, medium: 50, high: 70 },
    cooldownMonths: 12,
  },
  {
    id: 'reduce-workforce',
    name: 'Workforce Reduction',
    description: 'Reduce headcount to cut costs. Larger cuts save more but hurt morale and operations.',
    icon: '👥',
    category: 'workforce' as const,
    isAdjustable: true,
    minPercent: 5, // Min 5% of workforce
    maxPercent: 40, // Max 40% of workforce at once
    riskThresholds: { low: 10, medium: 20, high: 35 },
    cooldownMonths: 6,
  },
  {
    id: 'cut-quality',
    name: 'Cost Optimization',
    description: 'Reduce product/service quality to improve margins. Affects customer satisfaction over time.',
    icon: '📉',
    category: 'operations' as const,
    isAdjustable: true,
    minPercent: 5, // Min 5% quality reduction
    maxPercent: 30, // Max 30% quality reduction
    riskThresholds: { low: 10, medium: 20, high: 25 },
    cooldownMonths: 3,
  },
  {
    id: 'sell-assets',
    name: 'Asset Liquidation',
    description: 'Sell company assets for immediate cash. May include real estate, equipment, or IP.',
    icon: '🏢',
    category: 'extraction' as const,
    isAdjustable: true,
    minPercent: 10, // Min 10% of assets
    maxPercent: 60, // Max 60% of assets
    riskThresholds: { low: 20, medium: 40, high: 55 },
    cooldownMonths: 12,
  },
  {
    id: 'extract-fees',
    name: 'Management Fees',
    description: 'Charge consulting and management fees to the portfolio company.',
    icon: '📋',
    category: 'extraction' as const,
    isAdjustable: true,
    minPercent: 1, // Min 1% of revenue
    maxPercent: 5, // Max 5% of revenue
    riskThresholds: { low: 2, medium: 3, high: 4 },
    cooldownMonths: 12,
  },
  {
    id: 'sale-leaseback',
    name: 'Sale-Leaseback',
    description: 'Sell real estate and lease it back. One-time cash extraction with ongoing rent costs.',
    icon: '🔑',
    category: 'extraction' as const,
    isAdjustable: false,
    cooldownMonths: 0, // One-time action
  },
];

// Headlines for the news ticker
export const genericHeadlines = [
  'Wall Street celebrates record profits amid mass layoffs',
  'PE firms defend "value creation" strategies to skeptical lawmakers',
  'Former employees form support group after company hollowed out',
  'Study finds PE-owned companies pay workers 10% less',
  'Customers reminisce about when {company} was good',
  'Industry experts warn of leveraged loan bubble',
  'Local economy reels as {company} closes headquarters',
  '"They took everything that wasn\'t nailed down" - former {company} executive',
  'Private equity now owns 10% of all jobs in America',
  'Pension funds continue to pour money into PE despite concerns',
  'Management consultants descend on {company}',
  '"Operational improvements" at {company} result in 30% layoffs',
  'Report: PE-owned nursing homes have higher death rates',
  'Retail workers share stories of skeleton crew staffing',
  'Another beloved brand joins private equity graveyard',
  'Former {company} CEO: "They loaded us with debt from day one"',
  'Credit rating agencies downgrade {company} bonds',
  'PE executive defends $100M salary: "We create value"',
  'Study: Grocery prices rise 15% after PE acquisition',
  'Employees learn of layoffs via mass email',
];

// Company status descriptions
export const statusDescriptions = {
  healthy: 'Operating normally with sustainable metrics',
  struggling: 'Showing signs of stress from debt and cost cuts',
  declining: 'Revenue falling, employees leaving, customers unhappy',
  failing: 'On the brink of collapse, bankruptcy looms',
  bankrupt: 'Filed for bankruptcy protection',
};

// Achievement milestones
export const achievements = [
  { id: 'first-blood', name: 'First Blood', description: 'Complete your first acquisition', threshold: 1, stat: 'companiesAcquired' },
  { id: 'serial-acquirer', name: 'Serial Acquirer', description: 'Acquire 5 companies', threshold: 5, stat: 'companiesAcquired' },
  { id: 'portfolio-king', name: 'Portfolio King', description: 'Acquire 10 companies', threshold: 10, stat: 'companiesAcquired' },
  { id: 'job-killer', name: 'Job Killer', description: 'Lay off 10,000 workers', threshold: 10000, stat: 'totalEmployeesLaidOff' },
  { id: 'corporate-raider', name: 'Corporate Raider', description: 'Lay off 50,000 workers', threshold: 50000, stat: 'totalEmployeesLaidOff' },
  { id: 'debt-lord', name: 'Debt Lord', description: 'Load $1B in debt onto portfolio companies', threshold: 1000000000, stat: 'totalDebtLoaded' },
  { id: 'bankruptcy-artist', name: 'Bankruptcy Artist', description: 'Bankrupt your first company', threshold: 1, stat: 'companiesBankrupted' },
  { id: 'creative-destruction', name: 'Creative Destruction', description: 'Bankrupt 5 companies', threshold: 5, stat: 'companiesBankrupted' },
  { id: 'fee-collector', name: 'Fee Collector', description: 'Extract $100M in fees', threshold: 100000000, stat: 'totalFeesExtracted' },
  { id: 'dividend-king', name: 'Dividend King', description: 'Extract $500M in dividends', threshold: 500000000, stat: 'totalDividendsExtracted' },
];

// Tips shown during loading or on startup
export const tips = [
  "Remember: It's not your money at risk, it's the company's!",
  "Pro tip: Sell the real estate, then charge rent. Infinite money hack!",
  "Employee morale is just a number. Profits are forever.",
  "The best time to lay people off is right before the holidays.",
  "When in doubt, load more debt.",
  "A company's reputation took decades to build. You can destroy it in months!",
  "Management fees are your reward for the hard work of extracting value.",
  "Bankruptcy isn't failure - it's a successful exit from bad investments.",
  "Always remember: Employees are liabilities, not assets.",
  "The pension fund is just money sitting there, waiting to be optimized.",
];
