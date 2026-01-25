// Late Stage Capitalism Simulator - Game Events
// Random events that occur during gameplay

import type { GameEvent } from '../types';

export const events: GameEvent[] = [
  // SCANDAL EVENTS
  {
    id: 'worker-expose',
    title: 'Worker Conditions Exposed',
    description: 'A viral social media post exposes poor working conditions at one of your portfolio companies. The hashtag is trending.',
    icon: '📱',
    probability: 0.08,
    category: 'scandal',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [],
    choices: [
      {
        text: 'Ignore it - it will blow over',
        effects: [
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 10 },
          { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 15 },
        ],
        reputationChange: -10,
      },
      {
        text: 'Issue a carefully worded non-apology',
        effects: [
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 5 },
          { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 8 },
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 2000000 },
        ],
        reputationChange: -5,
      },
      {
        text: 'Actually improve conditions',
        effects: [
          { target: 'randomCompany', metric: 'profit', modifier: 'subtract', value: 10000000 },
          { target: 'randomCompany', metric: 'morale', modifier: 'add', value: 20 },
          { target: 'fund', metric: 'reputation', modifier: 'add', value: 5 },
        ],
        reputationChange: 5,
      },
    ],
  },
  {
    id: 'ceo-scandal',
    title: 'Executive Compensation Scandal',
    description: 'The press discovered your portfolio company CEO made 500x the median worker salary while laying off thousands.',
    icon: '💎',
    probability: 0.06,
    category: 'scandal',
    conditions: [
      { type: 'employeesLaidOff', comparison: 'gte', value: 1000 },
    ],
    effects: [],
    choices: [
      {
        text: 'Defend the compensation as "market rate"',
        effects: [
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 8 },
          { target: 'randomCompany', metric: 'morale', modifier: 'subtract', value: 15 },
        ],
        reputationChange: -8,
      },
      {
        text: 'Quietly reduce bonus (but not salary)',
        effects: [
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 3 },
          { target: 'randomCompany', metric: 'profit', modifier: 'add', value: 5000000 },
        ],
        reputationChange: -3,
      },
    ],
  },
  {
    id: 'data-breach',
    title: 'Customer Data Breach',
    description: 'Hackers exploited the outdated systems you never bothered to upgrade. Customer data is on the dark web.',
    icon: '🔓',
    probability: 0.05,
    category: 'scandal',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [],
    choices: [
      {
        text: 'Delay disclosure as long as legally possible',
        effects: [
          { target: 'randomCompany', metric: 'customerSatisfaction', modifier: 'subtract', value: 25 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 15 },
        ],
        reputationChange: -15,
      },
      {
        text: 'Immediate disclosure and free credit monitoring',
        effects: [
          { target: 'randomCompany', metric: 'customerSatisfaction', modifier: 'subtract', value: 10 },
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 20000000 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 5 },
        ],
        reputationChange: -5,
      },
    ],
  },

  // MARKET EVENTS
  {
    id: 'recession',
    title: 'Recession Hits',
    description: 'The economy enters a recession. Consumer spending drops, credit tightens, and your overleveraged portfolio is exposed.',
    icon: '📉',
    probability: 0.04,
    category: 'market',
    conditions: [],
    effects: [
      { target: 'allCompanies', metric: 'revenue', modifier: 'multiply', value: 0.85 },
      { target: 'allCompanies', metric: 'profit', modifier: 'multiply', value: 0.7 },
    ],
  },
  {
    id: 'interest-rate-hike',
    title: 'Interest Rates Rise',
    description: 'The Fed raises rates. All that floating-rate debt on your portfolio companies just got more expensive.',
    icon: '📈',
    probability: 0.08,
    category: 'market',
    conditions: [
      { type: 'totalDebt', comparison: 'gte', value: 1000000000 },
    ],
    effects: [
      { target: 'allCompanies', metric: 'profit', modifier: 'subtract', value: 20000000 },
    ],
  },
  {
    id: 'competitor-ipo',
    title: 'Competitor Goes Public',
    description: 'A competitor just had a successful IPO, raising capital to invest in growth. Your starved companies look even weaker.',
    icon: '🔔',
    probability: 0.06,
    category: 'market',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 5 },
      { target: 'randomCompany', metric: 'customerSatisfaction', modifier: 'subtract', value: 5 },
    ],
  },
  {
    id: 'hot-market',
    title: 'Hot M&A Market',
    description: 'The M&A market is heating up. Buyers are paying premium prices for acquisitions.',
    icon: '🔥',
    probability: 0.07,
    category: 'market',
    conditions: [],
    effects: [
      { target: 'allCompanies', metric: 'brandValue', modifier: 'add', value: 5 },
    ],
  },

  // REGULATORY EVENTS
  {
    id: 'ftc-investigation',
    title: 'FTC Investigation',
    description: 'The FTC is investigating anti-competitive practices in your portfolio. Lawyers are expensive.',
    icon: '⚖️',
    probability: 0.05,
    category: 'regulatory',
    conditions: [
      { type: 'portfolioSize', comparison: 'gte', value: 3 },
    ],
    effects: [],
    choices: [
      {
        text: 'Fight it in court',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 30000000 },
        ],
        reputationChange: 0,
      },
      {
        text: 'Settle quickly',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 50000000 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 5 },
        ],
        reputationChange: -5,
      },
    ],
  },
  {
    id: 'labor-law',
    title: 'New Labor Regulations',
    description: 'New labor laws require better worker protections. Compliance costs money.',
    icon: '📜',
    probability: 0.06,
    category: 'regulatory',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'allCompanies', metric: 'profit', modifier: 'subtract', value: 5000000 },
      { target: 'allCompanies', metric: 'morale', modifier: 'add', value: 5 },
    ],
  },
  {
    id: 'environmental-fine',
    title: 'Environmental Violation',
    description: 'One of your cost-cutting measures resulted in environmental violations. The EPA noticed.',
    icon: '🏭',
    probability: 0.04,
    category: 'regulatory',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'fund', metric: 'capital', modifier: 'subtract', value: 15000000 },
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 8 },
    ],
  },

  // EMPLOYEE EVENTS
  {
    id: 'union-drive',
    title: 'Unionization Effort',
    description: 'Workers at one of your portfolio companies are organizing. They want better pay and job security.',
    icon: '✊',
    probability: 0.07,
    category: 'employee',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [],
    choices: [
      {
        text: 'Hire union-busting consultants',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 5000000 },
          { target: 'randomCompany', metric: 'morale', modifier: 'subtract', value: 20 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 8 },
        ],
        reputationChange: -8,
      },
      {
        text: 'Let them unionize',
        effects: [
          { target: 'randomCompany', metric: 'profit', modifier: 'subtract', value: 15000000 },
          { target: 'randomCompany', metric: 'morale', modifier: 'add', value: 30 },
        ],
        reputationChange: 5,
      },
      {
        text: 'Close the location',
        effects: [
          { target: 'randomCompany', metric: 'employees', modifier: 'multiply', value: 0.9 },
          { target: 'randomCompany', metric: 'revenue', modifier: 'multiply', value: 0.95 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 12 },
        ],
        reputationChange: -12,
      },
    ],
  },
  {
    id: 'talent-exodus',
    title: 'Talent Exodus',
    description: 'Key employees are leaving for competitors who actually invest in their workforce.',
    icon: '🚪',
    probability: 0.08,
    category: 'employee',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'employees', modifier: 'multiply', value: 0.95 },
      { target: 'randomCompany', metric: 'morale', modifier: 'subtract', value: 10 },
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 3 },
    ],
  },
  {
    id: 'whistleblower',
    title: 'Whistleblower Complaint',
    description: 'A former employee filed a whistleblower complaint about unsafe practices.',
    icon: '📢',
    probability: 0.04,
    category: 'employee',
    conditions: [
      { type: 'employeesLaidOff', comparison: 'gte', value: 500 },
    ],
    effects: [],
    choices: [
      {
        text: 'Settle quietly with an NDA',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 10000000 },
        ],
        reputationChange: 0,
      },
      {
        text: 'Fight the allegations',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'subtract', value: 5000000 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 10 },
          { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 10 },
        ],
        reputationChange: -10,
      },
    ],
  },

  // CUSTOMER EVENTS
  {
    id: 'customer-boycott',
    title: 'Customer Boycott',
    description: 'Customers are boycotting one of your companies after learning about layoffs and quality cuts.',
    icon: '🚫',
    probability: 0.06,
    category: 'customer',
    conditions: [
      { type: 'employeesLaidOff', comparison: 'gte', value: 1000 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'revenue', modifier: 'multiply', value: 0.9 },
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 10 },
    ],
  },
  {
    id: 'viral-complaint',
    title: 'Viral Customer Complaint',
    description: 'A customer\'s complaint about terrible service went viral. "Thanks PE ownership!"',
    icon: '🐦',
    probability: 0.07,
    category: 'customer',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'customerSatisfaction', modifier: 'subtract', value: 10 },
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 5 },
    ],
  },
  {
    id: 'nostalgic-campaign',
    title: 'Nostalgia Campaign Goes Wrong',
    description: 'Your marketing team launched a nostalgia campaign. Customers remember when the brand was good.',
    icon: '📺',
    probability: 0.05,
    category: 'customer',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'brandValue', modifier: 'subtract', value: 8 },
      { target: 'randomCompany', metric: 'customerSatisfaction', modifier: 'subtract', value: 5 },
    ],
  },

  // OPPORTUNITY EVENTS
  {
    id: 'distressed-acquisition',
    title: 'Distressed Company Available',
    description: 'A competitor is going bankrupt. Their assets are available at fire-sale prices.',
    icon: '🎯',
    probability: 0.06,
    category: 'opportunity',
    conditions: [],
    effects: [
      { target: 'fund', metric: 'reputation', modifier: 'add', value: 3 },
    ],
  },
  {
    id: 'pension-surplus',
    title: 'Pension Fund Surplus',
    description: 'One of your portfolio companies has an overfunded pension. That money could be... redirected.',
    icon: '💰',
    probability: 0.04,
    category: 'opportunity',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [],
    choices: [
      {
        text: 'Raid the pension fund',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'add', value: 80000000 },
          { target: 'randomCompany', metric: 'morale', modifier: 'subtract', value: 30 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 15 },
        ],
        reputationChange: -15,
      },
      {
        text: 'Leave the pension alone',
        effects: [
          { target: 'randomCompany', metric: 'morale', modifier: 'add', value: 5 },
        ],
        reputationChange: 2,
      },
    ],
  },
  {
    id: 'tax-loophole',
    title: 'Tax Loophole Discovered',
    description: 'Your accountants found a creative tax structure. It\'s definitely legal. Probably.',
    icon: '🕳️',
    probability: 0.05,
    category: 'opportunity',
    conditions: [],
    effects: [],
    choices: [
      {
        text: 'Exploit the loophole',
        effects: [
          { target: 'fund', metric: 'capital', modifier: 'add', value: 40000000 },
          { target: 'fund', metric: 'reputation', modifier: 'subtract', value: 5 },
        ],
        reputationChange: -5,
      },
      {
        text: 'Play it safe',
        effects: [],
        reputationChange: 2,
      },
    ],
  },
  {
    id: 'government-contract',
    title: 'Government Contract',
    description: 'A portfolio company won a government contract. Steady revenue for years!',
    icon: '🏛️',
    probability: 0.04,
    category: 'opportunity',
    conditions: [
      { type: 'hasPortfolio', comparison: 'gte', value: 1 },
    ],
    effects: [
      { target: 'randomCompany', metric: 'revenue', modifier: 'add', value: 50000000 },
      { target: 'randomCompany', metric: 'profit', modifier: 'add', value: 10000000 },
    ],
  },
];

export const getEventById = (id: string): GameEvent | undefined => {
  return events.find((e) => e.id === id);
};

export const getEventsByCategory = (category: GameEvent['category']): GameEvent[] => {
  return events.filter((e) => e.category === category);
};
