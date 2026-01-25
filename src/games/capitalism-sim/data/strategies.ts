// Late Stage Capitalism Simulator - PE Strategies
// The various tactics private equity firms use

import type { Strategy } from '../types';

export const strategies: Strategy[] = [
  // FINANCIAL ENGINEERING
  {
    id: 'leveraged-buyout',
    name: 'Leveraged Buyout',
    description: 'Load the company with debt to finance your own acquisition. The company pays for itself!',
    icon: '💳',
    category: 'financial',
    effects: [
      { metric: 'debt', modifier: 'add', value: 500000000, description: '+$500M debt' },
      { metric: 'capital', modifier: 'add', value: 400000000, description: '+$400M to your fund' },
      { metric: 'profit', modifier: 'subtract', value: 50000000, description: '-$50M profit (interest payments)' },
    ],
    requirements: [{ type: 'maxDebt', value: 5000000000 }],
    cooldownMonths: 24,
    reputationCost: 5,
  },
  {
    id: 'dividend-recap',
    name: 'Dividend Recapitalization',
    description: 'Borrow money to pay yourself a special dividend. Extract value before anyone notices!',
    icon: '💰',
    category: 'financial',
    effects: [
      { metric: 'debt', modifier: 'add', value: 300000000, description: '+$300M debt' },
      { metric: 'capital', modifier: 'add', value: 280000000, description: '+$280M dividend to your fund' },
      { metric: 'morale', modifier: 'subtract', value: 10, description: '-10 employee morale' },
    ],
    requirements: [],
    cooldownMonths: 18,
    reputationCost: 8,
  },
  {
    id: 'sale-leaseback',
    name: 'Sale-Leaseback',
    description: 'Sell the company\'s real estate and lease it back. Instant cash, eternal rent payments!',
    icon: '🏢',
    category: 'financial',
    effects: [
      { metric: 'assetValue', modifier: 'multiply', value: 0.5, description: '-50% asset value' },
      { metric: 'capital', modifier: 'add', value: 400000000, description: '+$400M to your fund' },
      { metric: 'profit', modifier: 'subtract', value: 40000000, description: '-$40M profit (rent payments)' },
    ],
    requirements: [],
    cooldownMonths: 0, // One-time per company
    reputationCost: 3,
  },
  {
    id: 'management-fees',
    name: 'Extract Management Fees',
    description: 'Charge excessive "management consulting" fees to your own portfolio company.',
    icon: '📋',
    category: 'extraction',
    effects: [
      { metric: 'managementFees', modifier: 'add', value: 10000000, description: '+$10M annual fees' },
      { metric: 'profit', modifier: 'subtract', value: 10000000, description: '-$10M company profit' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 2,
  },

  // OPERATIONAL "IMPROVEMENTS"
  {
    id: 'mass-layoffs',
    name: 'Mass Layoffs',
    description: 'Reduce headcount by 20%. Call it "right-sizing" in the press release.',
    icon: '👋',
    category: 'operational',
    effects: [
      { metric: 'employees', modifier: 'multiply', value: 0.8, description: '-20% employees' },
      { metric: 'profit', modifier: 'add', value: 50000000, description: '+$50M profit (salary savings)' },
      { metric: 'morale', modifier: 'subtract', value: 25, description: '-25 morale' },
      { metric: 'customerSatisfaction', modifier: 'subtract', value: 10, description: '-10 customer satisfaction' },
    ],
    requirements: [{ type: 'minEmployees', value: 1000 }],
    cooldownMonths: 12,
    reputationCost: 10,
  },
  {
    id: 'executive-layoffs',
    name: 'Cut Middle Management',
    description: 'Eliminate entire management layers. Who needs institutional knowledge anyway?',
    icon: '✂️',
    category: 'operational',
    effects: [
      { metric: 'employees', modifier: 'multiply', value: 0.95, description: '-5% employees' },
      { metric: 'profit', modifier: 'add', value: 30000000, description: '+$30M profit' },
      { metric: 'morale', modifier: 'subtract', value: 15, description: '-15 morale' },
      { metric: 'brandValue', modifier: 'subtract', value: 5, description: '-5 brand value' },
    ],
    requirements: [{ type: 'minEmployees', value: 500 }],
    cooldownMonths: 6,
    reputationCost: 5,
  },
  {
    id: 'offshore-support',
    name: 'Offshore Customer Support',
    description: 'Move customer service overseas. Savings now, complaints later!',
    icon: '🌏',
    category: 'operational',
    effects: [
      { metric: 'employees', modifier: 'multiply', value: 0.9, description: '-10% domestic employees' },
      { metric: 'profit', modifier: 'add', value: 20000000, description: '+$20M profit' },
      { metric: 'customerSatisfaction', modifier: 'subtract', value: 20, description: '-20 customer satisfaction' },
    ],
    requirements: [{ type: 'minEmployees', value: 200 }],
    cooldownMonths: 0,
    reputationCost: 3,
  },
  {
    id: 'freeze-wages',
    name: 'Wage Freeze',
    description: 'No raises this year. Or next year. Inflation is the employee\'s problem.',
    icon: '🥶',
    category: 'operational',
    effects: [
      { metric: 'profit', modifier: 'add', value: 15000000, description: '+$15M profit' },
      { metric: 'morale', modifier: 'subtract', value: 15, description: '-15 morale' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 2,
  },
  {
    id: 'cut-benefits',
    name: 'Slash Benefits',
    description: 'Reduce healthcare coverage, eliminate 401k match, cut PTO. It\'s called efficiency.',
    icon: '💊',
    category: 'operational',
    effects: [
      { metric: 'profit', modifier: 'add', value: 25000000, description: '+$25M profit' },
      { metric: 'morale', modifier: 'subtract', value: 20, description: '-20 morale' },
      { metric: 'employees', modifier: 'multiply', value: 0.95, description: '-5% employees (quit)' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 4,
  },
  {
    id: 'reduce-quality',
    name: 'Reduce Product Quality',
    description: 'Cheaper ingredients, thinner materials, shorter warranties. Customers won\'t notice... immediately.',
    icon: '📉',
    category: 'operational',
    effects: [
      { metric: 'profit', modifier: 'add', value: 30000000, description: '+$30M profit' },
      { metric: 'customerSatisfaction', modifier: 'subtract', value: 15, description: '-15 customer satisfaction' },
      { metric: 'brandValue', modifier: 'subtract', value: 10, description: '-10 brand value' },
    ],
    requirements: [],
    cooldownMonths: 6,
    reputationCost: 5,
  },
  {
    id: 'store-closures',
    name: 'Close Underperforming Locations',
    description: 'Shutter stores in less profitable areas. Those communities didn\'t need jobs anyway.',
    icon: '🚪',
    category: 'operational',
    effects: [
      { metric: 'revenue', modifier: 'multiply', value: 0.85, description: '-15% revenue' },
      { metric: 'employees', modifier: 'multiply', value: 0.8, description: '-20% employees' },
      { metric: 'profit', modifier: 'add', value: 40000000, description: '+$40M profit (lease savings)' },
      { metric: 'assetValue', modifier: 'multiply', value: 0.9, description: '-10% asset value' },
    ],
    requirements: [{ type: 'minRevenue', value: 500000000 }],
    cooldownMonths: 12,
    reputationCost: 7,
  },

  // EXTRACTION TACTICS
  {
    id: 'brand-licensing',
    name: 'License Brand to Yourself',
    description: 'Create a separate company to own the brand, then charge licensing fees.',
    icon: '™️',
    category: 'extraction',
    effects: [
      { metric: 'brandValue', modifier: 'multiply', value: 0.9, description: '-10% brand value' },
      { metric: 'capital', modifier: 'add', value: 50000000, description: '+$50M to your fund' },
      { metric: 'profit', modifier: 'subtract', value: 5000000, description: '-$5M profit (licensing fees)' },
    ],
    requirements: [{ type: 'minBrandValue', value: 50 }],
    cooldownMonths: 0,
    reputationCost: 4,
  },
  {
    id: 'strip-assets',
    name: 'Strip Valuable Assets',
    description: 'Sell off valuable assets, patents, or subsidiaries. Hollowing out is an art form.',
    icon: '🔧',
    category: 'extraction',
    effects: [
      { metric: 'assetValue', modifier: 'multiply', value: 0.7, description: '-30% asset value' },
      { metric: 'capital', modifier: 'add', value: 200000000, description: '+$200M to your fund' },
      { metric: 'revenue', modifier: 'multiply', value: 0.9, description: '-10% revenue' },
      { metric: 'brandValue', modifier: 'subtract', value: 10, description: '-10 brand value' },
    ],
    requirements: [],
    cooldownMonths: 6,
    reputationCost: 8,
  },
  {
    id: 'vendor-squeeze',
    name: 'Squeeze Vendors',
    description: 'Demand extended payment terms. Let suppliers finance your working capital.',
    icon: '🤝',
    category: 'extraction',
    effects: [
      { metric: 'capital', modifier: 'add', value: 30000000, description: '+$30M working capital' },
      { metric: 'profit', modifier: 'add', value: 5000000, description: '+$5M profit' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 3,
  },
  {
    id: 'ip-extraction',
    name: 'Extract Intellectual Property',
    description: 'Transfer patents and IP to offshore entities you control. Tax optimization!',
    icon: '📜',
    category: 'extraction',
    effects: [
      { metric: 'assetValue', modifier: 'multiply', value: 0.85, description: '-15% asset value' },
      { metric: 'capital', modifier: 'add', value: 100000000, description: '+$100M to offshore entity' },
    ],
    requirements: [],
    cooldownMonths: 0,
    reputationCost: 6,
  },

  // EXIT STRATEGIES
  {
    id: 'ipo-prep',
    name: 'IPO Preparation',
    description: 'Dress up the company for an IPO. Make the numbers look pretty for public investors.',
    icon: '📈',
    category: 'exit',
    effects: [
      { metric: 'profit', modifier: 'add', value: 20000000, description: '+$20M (accounting adjustments)' },
      { metric: 'brandValue', modifier: 'add', value: 5, description: '+5 brand value (marketing)' },
    ],
    requirements: [{ type: 'minRevenue', value: 1000000000 }],
    cooldownMonths: 24,
    reputationCost: 0,
  },
  {
    id: 'strategic-sale-prep',
    name: 'Prepare Strategic Sale',
    description: 'Package the company for sale to a competitor or another PE firm.',
    icon: '🎁',
    category: 'exit',
    effects: [
      { metric: 'brandValue', modifier: 'add', value: 3, description: '+3 brand value' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 0,
  },
  {
    id: 'bankruptcy-prep',
    name: 'Prepare Bankruptcy Filing',
    description: 'When the music stops, make sure you\'re not holding the bag. Structure the exit carefully.',
    icon: '⚖️',
    category: 'exit',
    effects: [
      { metric: 'debt', modifier: 'add', value: 100000000, description: '+$100M debt (legal & consulting)' },
      { metric: 'capital', modifier: 'add', value: 50000000, description: '+$50M extracted before filing' },
    ],
    requirements: [],
    cooldownMonths: 0,
    reputationCost: 15,
  },

  // NEW MANAGEMENT
  {
    id: 'install-management',
    name: 'Install New Management',
    description: 'Replace leadership with "experienced operators" who understand the PE playbook.',
    icon: '👔',
    category: 'operational',
    effects: [
      { metric: 'profit', modifier: 'subtract', value: 10000000, description: '-$10M (executive compensation)' },
      { metric: 'morale', modifier: 'subtract', value: 10, description: '-10 morale' },
    ],
    requirements: [],
    cooldownMonths: 12,
    reputationCost: 2,
  },
  {
    id: 'consulting-study',
    name: 'Commission Consulting Study',
    description: 'Hire expensive consultants to recommend layoffs. Now you have cover!',
    icon: '📊',
    category: 'operational',
    effects: [
      { metric: 'profit', modifier: 'subtract', value: 5000000, description: '-$5M (consulting fees)' },
      { metric: 'morale', modifier: 'subtract', value: 5, description: '-5 morale (everyone knows what\'s coming)' },
    ],
    requirements: [],
    cooldownMonths: 6,
    reputationCost: 1,
  },
];

export const getStrategyById = (id: string): Strategy | undefined => {
  return strategies.find((s) => s.id === id);
};

export const getStrategiesByCategory = (category: Strategy['category']): Strategy[] => {
  return strategies.filter((s) => s.category === category);
};
