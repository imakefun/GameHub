// Late Stage Capitalism Simulator - Game State Hook

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type {
  GameState,
  GameAction,
  FundResources,
  PortfolioCompany,
  TargetCompany,
  Strategy,
  GameEvent,
  GameSettings,
  NewsItem,
  CompanyMetrics,
  AcquisitionDeal,
} from '../types';

const STORAGE_KEY = 'capitalism-sim-save';

interface GameConfig {
  companies: TargetCompany[];
  strategies: Strategy[];
  events: GameEvent[];
  settings: GameSettings;
}

function createInitialState(settings: GameSettings, companies: TargetCompany[]): GameState {
  // Select random companies as initial targets
  const shuffled = [...companies].sort(() => Math.random() - 0.5);
  const initialTargets = shuffled.slice(0, settings.initialTargetCount);

  return {
    fund: {
      capital: settings.startingCapital,
      managementFees: 0,
      reputation: settings.startingReputation,
      totalReturns: 0,
    },
    portfolio: [],
    availableTargets: initialTargets,
    pendingDeals: [],
    pendingActions: [],
    activeEvent: null,
    stats: {
      companiesAcquired: 0,
      companiesBankrupted: 0,
      companiesSold: 0,
      totalEmployeesLaidOff: 0,
      totalDebtLoaded: 0,
      totalAssetsStripped: 0,
      totalFeesExtracted: 0,
      totalDividendsExtracted: 0,
      biggestDeal: 0,
      biggestBankruptcy: '',
      yearsInBusiness: 0,
      monthsPlayed: 0,
    },
    currentMonth: 0,
    currentYear: 2024,
    lastTick: Date.now(),
    lastSaved: Date.now(),
    tutorialCompleted: false,
    unlockedStrategies: ['mass-layoffs', 'management-fees', 'dividend-recap', 'sale-leaseback'],
    newsHistory: [],
  };
}

function calculateCompanyStatus(metrics: CompanyMetrics, debt: number): PortfolioCompany['status'] {
  const debtToRevenue = metrics.revenue > 0 ? debt / metrics.revenue : 10;
  const healthScore =
    (metrics.morale + metrics.brandValue + metrics.customerSatisfaction) / 3;

  if (debtToRevenue > 3 || healthScore < 20) return 'failing';
  if (debtToRevenue > 2 || healthScore < 35) return 'declining';
  if (debtToRevenue > 1 || healthScore < 50) return 'struggling';
  return 'healthy';
}

function applyStrategyToCompany(
  company: PortfolioCompany,
  strategy: Strategy,
  fund: FundResources
): { company: PortfolioCompany; fund: FundResources; employeesLaidOff: number; debtAdded: number } {
  const updatedMetrics = { ...company.currentMetrics };
  const updatedFund = { ...fund };
  let employeesLaidOff = 0;
  let debtAdded = 0;
  const originalEmployees = company.currentMetrics.employees;

  for (const effect of strategy.effects) {
    if (effect.metric === 'capital') {
      if (effect.modifier === 'add') updatedFund.capital += effect.value;
      else if (effect.modifier === 'subtract') updatedFund.capital -= effect.value;
    } else if (effect.metric === 'managementFees') {
      if (effect.modifier === 'add') updatedFund.managementFees += effect.value;
    } else {
      const metricKey = effect.metric as keyof CompanyMetrics;
      if (metricKey in updatedMetrics) {
        if (effect.modifier === 'add') {
          updatedMetrics[metricKey] += effect.value;
        } else if (effect.modifier === 'subtract') {
          updatedMetrics[metricKey] -= effect.value;
        } else if (effect.modifier === 'multiply') {
          updatedMetrics[metricKey] *= effect.value;
        }

        // Clamp percentage metrics
        if (['morale', 'brandValue', 'customerSatisfaction'].includes(metricKey)) {
          updatedMetrics[metricKey] = Math.max(0, Math.min(100, updatedMetrics[metricKey]));
        }
        // Track debt loaded
        if (metricKey === 'debt' && effect.modifier === 'add') {
          debtAdded = effect.value;
        }
      }
    }
  }

  // Calculate employees laid off
  employeesLaidOff = Math.max(0, Math.round(originalEmployees - updatedMetrics.employees));

  // Apply reputation cost
  updatedFund.reputation = Math.max(0, Math.min(100, updatedFund.reputation - strategy.reputationCost));

  const updatedCompany: PortfolioCompany = {
    ...company,
    currentMetrics: updatedMetrics,
    debtLoaded: company.debtLoaded + debtAdded,
    employeesLaidOff: company.employeesLaidOff + employeesLaidOff,
    status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
  };

  // Track specific extractions
  if (strategy.id === 'management-fees') {
    updatedCompany.managementFeesExtracted += 10000000;
  }
  if (strategy.id === 'dividend-recap') {
    updatedCompany.dividendsExtracted += 280000000;
  }
  if (strategy.id === 'strip-assets') {
    updatedCompany.assetsStripped.push('General assets');
  }

  return { company: updatedCompany, fund: updatedFund, employeesLaidOff, debtAdded };
}

function generateNewsHeadline(
  category: NewsItem['category'],
  companyName?: string
): string {
  const templates: Record<NewsItem['category'], string[]> = {
    acquisition: [
      `${companyName} acquired by private equity fund`,
      `PE firm takes ${companyName} private in leveraged buyout`,
      `Wall Street celebrates ${companyName} acquisition`,
    ],
    layoff: [
      `${companyName} announces "strategic restructuring"`,
      `Thousands lose jobs as ${companyName} "right-sizes"`,
      `${companyName} workers blindsided by mass layoffs`,
    ],
    bankruptcy: [
      `${companyName} files for Chapter 11 bankruptcy`,
      `End of an era: ${companyName} collapses under debt load`,
      `${companyName} becomes latest PE casualty`,
    ],
    scandal: [
      `${companyName} under fire for worker treatment`,
      `Customers boycott ${companyName} after revelations`,
      `Former employees speak out against ${companyName}`,
    ],
    profit: [
      `PE fund reports record returns from ${companyName}`,
      `Management fees from ${companyName} boost fund profits`,
      `Dividend recapitalization extracts millions from ${companyName}`,
    ],
    market: [
      'Private equity firms sitting on record dry powder',
      'LBO market heats up as rates stabilize',
      'Pension funds increase PE allocations despite concerns',
    ],
  };

  const options = templates[category] || templates.market;
  return options[Math.floor(Math.random() * options.length)];
}

function checkForRandomEvent(
  state: GameState,
  events: GameEvent[]
): GameEvent | null {
  // Don't trigger if there's already an active event
  if (state.activeEvent) return null;

  // Check each event
  for (const event of events) {
    if (Math.random() > event.probability) continue;

    // Check conditions
    if (event.conditions) {
      const conditionsMet = event.conditions.every((condition) => {
        switch (condition.type) {
          case 'hasPortfolio':
            return state.portfolio.length >= condition.value;
          case 'portfolioSize':
            return evaluateCondition(state.portfolio.length, condition.comparison, condition.value);
          case 'reputation':
            return evaluateCondition(state.fund.reputation, condition.comparison, condition.value);
          case 'totalDebt':
            const totalDebt = state.portfolio.reduce((sum, c) => sum + c.currentMetrics.debt, 0);
            return evaluateCondition(totalDebt, condition.comparison, condition.value);
          case 'employeesLaidOff':
            return evaluateCondition(state.stats.totalEmployeesLaidOff, condition.comparison, condition.value);
          default:
            return true;
        }
      });

      if (!conditionsMet) continue;
    }

    return event;
  }

  return null;
}

function evaluateCondition(
  value: number,
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte',
  threshold: number
): boolean {
  switch (comparison) {
    case 'gt': return value > threshold;
    case 'lt': return value < threshold;
    case 'eq': return value === threshold;
    case 'gte': return value >= threshold;
    case 'lte': return value <= threshold;
    default: return false;
  }
}

function createGameReducer(config: GameConfig) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'TICK': {
        const now = Date.now();
        const elapsed = now - state.lastTick;
        const monthDuration = config.settings.monthDurationMs;

        // Check if a month has passed
        if (elapsed < monthDuration) {
          return { ...state, lastTick: now };
        }

        // Advance time
        let newMonth = state.currentMonth + 1;
        let newYear = state.currentYear;
        if (newMonth >= 12) {
          newMonth = 0;
          newYear += 1;
        }

        // Update portfolio companies
        const updatedPortfolio = state.portfolio.map((company) => {
          // Natural decay from neglect/debt
          const debtPressure = company.currentMetrics.debt / (company.currentMetrics.revenue || 1);
          const moraleDecay = debtPressure > 1 ? 2 : 0;
          const satisfactionDecay = debtPressure > 0.5 ? 1 : 0;

          const newMetrics: CompanyMetrics = {
            ...company.currentMetrics,
            morale: Math.max(0, company.currentMetrics.morale - moraleDecay),
            customerSatisfaction: Math.max(0, company.currentMetrics.customerSatisfaction - satisfactionDecay),
          };

          return {
            ...company,
            currentMetrics: newMetrics,
            yearsOwned: company.yearsOwned + (newMonth === 0 ? 1 : 0),
            status: calculateCompanyStatus(newMetrics, newMetrics.debt),
          };
        });

        // Collect management fees annually
        let updatedFund = { ...state.fund };
        if (newMonth === 0) {
          const aum = updatedPortfolio.reduce((sum, c) => sum + c.purchasePrice, 0);
          const annualFees = aum * config.settings.baseManagementFeeRate;
          updatedFund.capital += annualFees + updatedFund.managementFees;
        }

        // Check for random events
        const newState = {
          ...state,
          fund: updatedFund,
          portfolio: updatedPortfolio,
          currentMonth: newMonth,
          currentYear: newYear,
          lastTick: now,
          stats: {
            ...state.stats,
            monthsPlayed: state.stats.monthsPlayed + 1,
            yearsInBusiness: newYear - 2024,
          },
        };

        const randomEvent = checkForRandomEvent(newState, config.events);
        if (randomEvent) {
          // Pick a random company if event affects one
          const randomCompanyId = state.portfolio.length > 0
            ? state.portfolio[Math.floor(Math.random() * state.portfolio.length)].id
            : undefined;

          return {
            ...newState,
            activeEvent: {
              event: randomEvent,
              triggeredAt: now,
              companyId: randomCompanyId,
            },
          };
        }

        return newState;
      }

      case 'LOAD_GAME': {
        return {
          ...action.state,
          lastTick: Date.now(),
        };
      }

      case 'RESET_GAME': {
        return createInitialState(config.settings, config.companies);
      }

      case 'MAKE_OFFER': {
        const target = state.availableTargets.find((c) => c.id === action.companyId);
        if (!target) return state;

        const debtAmount = action.offer * (action.debtPct / 100);
        const equityNeeded = action.offer - debtAmount;

        if (equityNeeded > state.fund.capital) return state;

        // Determine if offer is accepted
        const fairValue = target.basePrice;
        const offerRatio = action.offer / fairValue;

        let accepted = false;
        if (offerRatio >= 1.1) {
          accepted = true;
        } else if (offerRatio >= 0.9) {
          accepted = Math.random() < 0.7;
        } else if (offerRatio >= 0.8) {
          accepted = Math.random() < 0.3;
        }

        if (accepted) {
          // Create portfolio company
          const portfolioCompany: PortfolioCompany = {
            id: `${target.id}-${Date.now()}`,
            companyId: target.id,
            name: target.name,
            description: target.description,
            industry: target.industry,
            parody: target.parody,
            icon: target.icon,
            purchasePrice: action.offer,
            currentMetrics: { ...target.metrics, debt: target.metrics.debt + debtAmount },
            originalMetrics: { ...target.metrics },
            debtLoaded: debtAmount,
            employeesLaidOff: 0,
            assetsStripped: [],
            managementFeesExtracted: 0,
            dividendsExtracted: 0,
            yearsOwned: 0,
            status: 'healthy',
            newsHeadlines: [],
          };

          // Add news
          const newsItem: NewsItem = {
            id: `news-${Date.now()}`,
            headline: generateNewsHeadline('acquisition', target.name),
            timestamp: Date.now(),
            category: 'acquisition',
            companyId: portfolioCompany.id,
          };

          return {
            ...state,
            fund: {
              ...state.fund,
              capital: state.fund.capital - equityNeeded,
            },
            portfolio: [...state.portfolio, portfolioCompany],
            availableTargets: state.availableTargets.filter((c) => c.id !== target.id),
            stats: {
              ...state.stats,
              companiesAcquired: state.stats.companiesAcquired + 1,
              totalDebtLoaded: state.stats.totalDebtLoaded + debtAmount,
              biggestDeal: Math.max(state.stats.biggestDeal, action.offer),
            },
            newsHistory: [newsItem, ...state.newsHistory].slice(0, 50),
          };
        } else {
          // Counter offer or rejection
          const deal: AcquisitionDeal = {
            companyId: target.id,
            offeredPrice: action.offer,
            debtFinancing: debtAmount,
            negotiationStatus: offerRatio >= 0.7 ? 'countered' : 'rejected',
            counterOffer: offerRatio >= 0.7 ? Math.round(fairValue * 1.05) : undefined,
          };

          return {
            ...state,
            pendingDeals: [...state.pendingDeals, deal],
          };
        }
      }

      case 'CANCEL_DEAL': {
        return {
          ...state,
          pendingDeals: state.pendingDeals.filter((_, i) => i !== action.dealIndex),
        };
      }

      case 'EXECUTE_STRATEGY': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        const strategy = config.strategies.find((s) => s.id === action.strategyId);

        if (!company || !strategy) return state;

        const { company: updatedCompany, fund: updatedFund, employeesLaidOff, debtAdded } =
          applyStrategyToCompany(company, strategy, state.fund);

        // Generate news for significant actions
        const newsItems: NewsItem[] = [];
        if (employeesLaidOff > 100) {
          newsItems.push({
            id: `news-${Date.now()}`,
            headline: generateNewsHeadline('layoff', company.name),
            timestamp: Date.now(),
            category: 'layoff',
            companyId: company.id,
          });
        }

        return {
          ...state,
          fund: updatedFund,
          portfolio: state.portfolio.map((c) =>
            c.id === company.id ? updatedCompany : c
          ),
          stats: {
            ...state.stats,
            totalEmployeesLaidOff: state.stats.totalEmployeesLaidOff + employeesLaidOff,
            totalDebtLoaded: state.stats.totalDebtLoaded + debtAdded,
            totalFeesExtracted: state.stats.totalFeesExtracted +
              (strategy.id === 'management-fees' ? 10000000 : 0),
            totalDividendsExtracted: state.stats.totalDividendsExtracted +
              (strategy.id === 'dividend-recap' ? 280000000 : 0),
          },
          newsHistory: [...newsItems, ...state.newsHistory].slice(0, 50),
        };
      }

      case 'SELL_COMPANY': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const profit = action.price - company.purchasePrice;

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + action.price,
            totalReturns: state.fund.totalReturns + profit,
          },
          portfolio: state.portfolio.filter((c) => c.id !== action.companyId),
          stats: {
            ...state.stats,
            companiesSold: state.stats.companiesSold + 1,
          },
        };
      }

      case 'DECLARE_BANKRUPTCY': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const newsItem: NewsItem = {
          id: `news-${Date.now()}`,
          headline: generateNewsHeadline('bankruptcy', company.name),
          timestamp: Date.now(),
          category: 'bankruptcy',
          companyId: company.id,
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            reputation: Math.max(0, state.fund.reputation - 15),
          },
          portfolio: state.portfolio.filter((c) => c.id !== action.companyId),
          stats: {
            ...state.stats,
            companiesBankrupted: state.stats.companiesBankrupted + 1,
            biggestBankruptcy: company.name,
          },
          newsHistory: [newsItem, ...state.newsHistory].slice(0, 50),
        };
      }

      case 'HANDLE_EVENT_CHOICE': {
        if (!state.activeEvent) return state;

        const choice = state.activeEvent.event.choices?.[action.choiceIndex];
        if (!choice) return state;

        let updatedFund = { ...state.fund };
        let updatedPortfolio = [...state.portfolio];

        // Apply choice effects
        for (const effect of choice.effects) {
          if (effect.target === 'fund') {
            const fundKey = effect.metric as keyof FundResources;
            if (fundKey in updatedFund) {
              if (effect.modifier === 'add') {
                (updatedFund[fundKey] as number) += effect.value;
              } else if (effect.modifier === 'subtract') {
                (updatedFund[fundKey] as number) -= effect.value;
              } else if (effect.modifier === 'multiply') {
                (updatedFund[fundKey] as number) *= effect.value;
              }
            }
          } else if (effect.target === 'randomCompany' && state.activeEvent.companyId) {
            updatedPortfolio = updatedPortfolio.map((c) => {
              if (c.id !== state.activeEvent!.companyId) return c;

              const metricKey = effect.metric as keyof CompanyMetrics;
              if (metricKey in c.currentMetrics) {
                const newMetrics = { ...c.currentMetrics };
                if (effect.modifier === 'add') {
                  newMetrics[metricKey] += effect.value;
                } else if (effect.modifier === 'subtract') {
                  newMetrics[metricKey] -= effect.value;
                } else if (effect.modifier === 'multiply') {
                  newMetrics[metricKey] *= effect.value;
                }
                return { ...c, currentMetrics: newMetrics };
              }
              return c;
            });
          } else if (effect.target === 'allCompanies') {
            updatedPortfolio = updatedPortfolio.map((c) => {
              const metricKey = effect.metric as keyof CompanyMetrics;
              if (metricKey in c.currentMetrics) {
                const newMetrics = { ...c.currentMetrics };
                if (effect.modifier === 'add') {
                  newMetrics[metricKey] += effect.value;
                } else if (effect.modifier === 'subtract') {
                  newMetrics[metricKey] -= effect.value;
                } else if (effect.modifier === 'multiply') {
                  newMetrics[metricKey] *= effect.value;
                }
                return { ...c, currentMetrics: newMetrics };
              }
              return c;
            });
          }
        }

        // Apply reputation change
        updatedFund.reputation = Math.max(0, Math.min(100, updatedFund.reputation + choice.reputationChange));

        return {
          ...state,
          fund: updatedFund,
          portfolio: updatedPortfolio,
          activeEvent: null,
        };
      }

      case 'DISMISS_EVENT': {
        if (!state.activeEvent) return state;

        // Apply default effects if any
        let updatedFund = { ...state.fund };
        let updatedPortfolio = [...state.portfolio];

        for (const effect of state.activeEvent.event.effects) {
          if (effect.target === 'fund') {
            const fundKey = effect.metric as keyof FundResources;
            if (fundKey in updatedFund) {
              if (effect.modifier === 'add') {
                (updatedFund[fundKey] as number) += effect.value;
              } else if (effect.modifier === 'subtract') {
                (updatedFund[fundKey] as number) -= effect.value;
              } else if (effect.modifier === 'multiply') {
                (updatedFund[fundKey] as number) *= effect.value;
              }
            }
          } else if (effect.target === 'allCompanies') {
            updatedPortfolio = updatedPortfolio.map((c) => {
              const metricKey = effect.metric as keyof CompanyMetrics;
              if (metricKey in c.currentMetrics) {
                const newMetrics = { ...c.currentMetrics };
                if (effect.modifier === 'add') {
                  newMetrics[metricKey] += effect.value;
                } else if (effect.modifier === 'subtract') {
                  newMetrics[metricKey] -= effect.value;
                } else if (effect.modifier === 'multiply') {
                  newMetrics[metricKey] *= effect.value;
                }
                return { ...c, currentMetrics: newMetrics };
              }
              return c;
            });
          }
        }

        return {
          ...state,
          fund: updatedFund,
          portfolio: updatedPortfolio,
          activeEvent: null,
        };
      }

      case 'COMPLETE_TUTORIAL': {
        return {
          ...state,
          tutorialCompleted: true,
        };
      }

      case 'REFRESH_TARGETS': {
        // Get companies not in portfolio and not already targets
        const portfolioIds = new Set(state.portfolio.map((c) => c.companyId));
        const targetIds = new Set(state.availableTargets.map((c) => c.id));

        const available = config.companies.filter(
          (c) => !portfolioIds.has(c.id) && !targetIds.has(c.id)
        );

        if (available.length === 0) return state;

        // Add one new target
        const newTarget = available[Math.floor(Math.random() * available.length)];

        return {
          ...state,
          availableTargets: [...state.availableTargets, newTarget],
        };
      }

      // Dynamic management actions
      case 'LOAD_DEBT': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const debtAmount = action.amount;
        const cashExtracted = debtAmount * 0.9; // 10% goes to fees/interest
        const interestCost = debtAmount * 0.08; // 8% annual interest reduces profit

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          debt: company.currentMetrics.debt + debtAmount,
          profit: company.currentMetrics.profit - interestCost,
          morale: Math.max(0, company.currentMetrics.morale - Math.floor(debtAmount / company.currentMetrics.revenue * 10)),
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          debtLoaded: company.debtLoaded + debtAmount,
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + cashExtracted,
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalDebtLoaded: state.stats.totalDebtLoaded + debtAmount,
          },
        };
      }

      case 'TAKE_DIVIDEND': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const dividendAmount = action.amount;
        const moraleHit = Math.floor(dividendAmount / company.currentMetrics.assetValue * 20);
        const brandHit = Math.floor(dividendAmount / company.currentMetrics.assetValue * 10);

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          assetValue: Math.max(0, company.currentMetrics.assetValue - dividendAmount * 0.5),
          morale: Math.max(0, company.currentMetrics.morale - moraleHit),
          brandValue: Math.max(0, company.currentMetrics.brandValue - brandHit),
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          dividendsExtracted: company.dividendsExtracted + dividendAmount,
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        const newsItem: NewsItem = {
          id: `news-${Date.now()}`,
          headline: generateNewsHeadline('profit', company.name),
          timestamp: Date.now(),
          category: 'profit',
          companyId: company.id,
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + dividendAmount,
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalDividendsExtracted: state.stats.totalDividendsExtracted + dividendAmount,
          },
          newsHistory: [newsItem, ...state.newsHistory].slice(0, 50),
        };
      }

      case 'REDUCE_WORKFORCE': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const reductionPercent = action.percent / 100;
        const employeesToCut = Math.floor(company.currentMetrics.employees * reductionPercent);
        const salarySavings = employeesToCut * 50000; // Avg $50k salary
        const severanceCost = employeesToCut * 10000; // $10k severance per employee

        const moraleHit = Math.min(40, action.percent * 1.5);
        const satisfactionHit = Math.min(25, action.percent * 0.8);
        const brandHit = Math.min(15, action.percent * 0.5);

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          employees: company.currentMetrics.employees - employeesToCut,
          profit: company.currentMetrics.profit + salarySavings - severanceCost,
          morale: Math.max(0, company.currentMetrics.morale - moraleHit),
          customerSatisfaction: Math.max(0, company.currentMetrics.customerSatisfaction - satisfactionHit),
          brandValue: Math.max(0, company.currentMetrics.brandValue - brandHit),
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          employeesLaidOff: company.employeesLaidOff + employeesToCut,
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        const newsItems: NewsItem[] = [];
        if (employeesToCut > 100) {
          newsItems.push({
            id: `news-${Date.now()}`,
            headline: generateNewsHeadline('layoff', company.name),
            timestamp: Date.now(),
            category: 'layoff',
            companyId: company.id,
          });
        }

        return {
          ...state,
          fund: {
            ...state.fund,
            reputation: Math.max(0, state.fund.reputation - Math.floor(action.percent / 5)),
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalEmployeesLaidOff: state.stats.totalEmployeesLaidOff + employeesToCut,
          },
          newsHistory: [...newsItems, ...state.newsHistory].slice(0, 50),
        };
      }

      case 'CUT_QUALITY': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const qualityCutPercent = action.percent / 100;
        const costSavings = company.currentMetrics.revenue * qualityCutPercent * 0.15;

        const satisfactionHit = Math.min(30, action.percent * 1.2);
        const brandHit = Math.min(20, action.percent * 0.8);

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          profit: company.currentMetrics.profit + costSavings,
          customerSatisfaction: Math.max(0, company.currentMetrics.customerSatisfaction - satisfactionHit),
          brandValue: Math.max(0, company.currentMetrics.brandValue - brandHit),
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        return {
          ...state,
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
        };
      }

      case 'SELL_ASSETS': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const salePercent = action.percent / 100;
        const assetsToSell = company.currentMetrics.assetValue * salePercent;
        const cashReceived = assetsToSell * 0.7; // Sell at 70% of book value

        const brandHit = Math.min(20, action.percent * 0.5);
        const revenueHit = company.currentMetrics.revenue * salePercent * 0.1;

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          assetValue: company.currentMetrics.assetValue - assetsToSell,
          revenue: company.currentMetrics.revenue - revenueHit,
          brandValue: Math.max(0, company.currentMetrics.brandValue - brandHit),
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          assetsStripped: [...company.assetsStripped, `${action.percent}% of assets`],
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + cashReceived,
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalAssetsStripped: state.stats.totalAssetsStripped + assetsToSell,
          },
        };
      }

      case 'EXTRACT_FEES': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        const feeAmount = action.amount;

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          profit: company.currentMetrics.profit - feeAmount,
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          managementFeesExtracted: company.managementFeesExtracted + feeAmount,
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + feeAmount,
            managementFees: state.fund.managementFees + feeAmount,
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalFeesExtracted: state.stats.totalFeesExtracted + feeAmount,
          },
        };
      }

      case 'SALE_LEASEBACK': {
        const company = state.portfolio.find((c) => c.id === action.companyId);
        if (!company) return state;

        // Sell 40% of assets (real estate) at 80% value, add ongoing rent cost
        const realEstateValue = company.currentMetrics.assetValue * 0.4;
        const cashReceived = realEstateValue * 0.8;
        const annualRentCost = realEstateValue * 0.08; // 8% annual rent

        const updatedMetrics: CompanyMetrics = {
          ...company.currentMetrics,
          assetValue: company.currentMetrics.assetValue - realEstateValue,
          profit: company.currentMetrics.profit - annualRentCost,
        };

        const updatedCompany: PortfolioCompany = {
          ...company,
          currentMetrics: updatedMetrics,
          assetsStripped: [...company.assetsStripped, 'Real estate (sale-leaseback)'],
          status: calculateCompanyStatus(updatedMetrics, updatedMetrics.debt),
        };

        return {
          ...state,
          fund: {
            ...state.fund,
            capital: state.fund.capital + cashReceived,
          },
          portfolio: state.portfolio.map((c) => c.id === company.id ? updatedCompany : c),
          stats: {
            ...state.stats,
            totalAssetsStripped: state.stats.totalAssetsStripped + realEstateValue,
          },
        };
      }

      default:
        return state;
    }
  };
}

export function useGameState(config: GameConfig) {
  const reducer = useMemo(() => createGameReducer(config), [config]);
  const initialState = useMemo(
    () => createInitialState(config.settings, config.companies),
    [config.settings, config.companies]
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', state: parsed });
      }
    } catch (e) {
      console.error('Failed to load saved game:', e);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
      } catch (e) {
        console.error('Failed to save game:', e);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [state]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', delta: 1 });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Actions
  const makeOffer = useCallback(
    (companyId: string, offer: number, debtPct: number) => {
      dispatch({ type: 'MAKE_OFFER', companyId, offer, debtPct });
    },
    []
  );

  const cancelDeal = useCallback((dealIndex: number) => {
    dispatch({ type: 'CANCEL_DEAL', dealIndex });
  }, []);

  const executeStrategy = useCallback(
    (companyId: string, strategyId: string) => {
      dispatch({ type: 'EXECUTE_STRATEGY', companyId, strategyId });
    },
    []
  );

  const sellCompany = useCallback((companyId: string, price: number) => {
    dispatch({ type: 'SELL_COMPANY', companyId, price });
  }, []);

  const declareBankruptcy = useCallback((companyId: string) => {
    dispatch({ type: 'DECLARE_BANKRUPTCY', companyId });
  }, []);

  const handleEventChoice = useCallback((choiceIndex: number) => {
    dispatch({ type: 'HANDLE_EVENT_CHOICE', choiceIndex });
  }, []);

  const dismissEvent = useCallback(() => {
    dispatch({ type: 'DISMISS_EVENT' });
  }, []);

  const completeTutorial = useCallback(() => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const refreshTargets = useCallback(() => {
    dispatch({ type: 'REFRESH_TARGETS' });
  }, []);

  // New dynamic management actions
  const loadDebt = useCallback((companyId: string, amount: number) => {
    dispatch({ type: 'LOAD_DEBT', companyId, amount });
  }, []);

  const takeDividend = useCallback((companyId: string, amount: number) => {
    dispatch({ type: 'TAKE_DIVIDEND', companyId, amount });
  }, []);

  const reduceWorkforce = useCallback((companyId: string, percent: number) => {
    dispatch({ type: 'REDUCE_WORKFORCE', companyId, percent });
  }, []);

  const cutQuality = useCallback((companyId: string, percent: number) => {
    dispatch({ type: 'CUT_QUALITY', companyId, percent });
  }, []);

  const sellAssets = useCallback((companyId: string, percent: number) => {
    dispatch({ type: 'SELL_ASSETS', companyId, percent });
  }, []);

  const extractFees = useCallback((companyId: string, amount: number) => {
    dispatch({ type: 'EXTRACT_FEES', companyId, amount });
  }, []);

  const saleLeaseback = useCallback((companyId: string) => {
    dispatch({ type: 'SALE_LEASEBACK', companyId });
  }, []);

  // Calculate max debt percent based on experience
  const maxDebtPercent = state.stats.companiesAcquired >= 3
    ? config.settings.maxDebtPercentExperienced
    : config.settings.maxDebtPercentNewPlayer;

  return {
    state,
    makeOffer,
    cancelDeal,
    executeStrategy,
    sellCompany,
    declareBankruptcy,
    handleEventChoice,
    dismissEvent,
    completeTutorial,
    resetGame,
    refreshTargets,
    // New management actions
    loadDebt,
    takeDividend,
    reduceWorkforce,
    cutQuality,
    sellAssets,
    extractFees,
    saleLeaseback,
    maxDebtPercent,
  };
}
