// Late Stage Capitalism Simulator - Game Settings

import type { GameSettings } from '../types';

export const defaultSettings: GameSettings = {
  startingCapital: 500000000, // $500M starting fund
  startingReputation: 50, // Middle of the road reputation
  monthDurationMs: 3000, // 3 seconds per game month
  baseManagementFeeRate: 0.02, // 2% management fee on AUM
  maxPortfolioSize: 10, // Max companies you can own
  bankruptcyThreshold: 3, // Debt-to-revenue ratio triggers bankruptcy
  initialTargetCount: 6, // Number of acquisition targets shown initially
};

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
