// Late Stage Capitalism Simulator - Portfolio Panel

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Users, Building, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { PortfolioCompany, Strategy } from '../types';

interface PortfolioPanelProps {
  portfolio: PortfolioCompany[];
  strategies: Strategy[];
  onExecuteStrategy: (companyId: string, strategyId: string) => void;
  onSellCompany: (companyId: string, price: number) => void;
  onDeclareBankruptcy: (companyId: string) => void;
}

function formatMoney(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

function getStatusColor(status: PortfolioCompany['status']): string {
  switch (status) {
    case 'healthy': return 'text-green-400 bg-green-500/20';
    case 'struggling': return 'text-yellow-400 bg-yellow-500/20';
    case 'declining': return 'text-orange-400 bg-orange-500/20';
    case 'failing': return 'text-red-400 bg-red-500/20';
    case 'bankrupt': return 'text-gray-400 bg-gray-500/20';
    default: return 'text-surface-400 bg-surface-700';
  }
}

interface CompanyCardProps {
  company: PortfolioCompany;
  strategies: Strategy[];
  onExecuteStrategy: (strategyId: string) => void;
  onSell: (price: number) => void;
  onBankruptcy: () => void;
}

function CompanyCard({ company, strategies, onExecuteStrategy, onSell, onBankruptcy }: CompanyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

  const profitChange = company.currentMetrics.profit - company.originalMetrics.profit;
  const employeeDelta = company.originalMetrics.employees - company.currentMetrics.employees;

  // Calculate current value based on metrics
  const healthMultiplier = (company.currentMetrics.morale + company.currentMetrics.brandValue + company.currentMetrics.customerSatisfaction) / 300;
  const debtImpact = company.currentMetrics.debt * 0.8;
  const estimatedValue = Math.max(0, (company.purchasePrice * healthMultiplier) - debtImpact + company.currentMetrics.assetValue * 0.3);

  return (
    <motion.div
      layout
      className="bg-surface-800 rounded-lg border border-surface-700 overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-surface-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{company.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{company.name}</h3>
              <p className="text-sm text-surface-400">{company.industry} | Owned {company.yearsOwned} years</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
              {company.status}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Revenue: {formatMoney(company.currentMetrics.revenue)}</span>
          </div>
          <div className={`flex items-center gap-1 ${profitChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>Profit: {formatMoney(company.currentMetrics.profit)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{company.currentMetrics.employees.toLocaleString()} employees</span>
            {employeeDelta > 0 && (
              <span className="text-red-400">(-{employeeDelta.toLocaleString()})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Debt: {formatMoney(company.currentMetrics.debt)}</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-surface-700"
          >
            <div className="p-4 space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-surface-400 mb-1">Morale</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${company.currentMetrics.morale > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${company.currentMetrics.morale}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(company.currentMetrics.morale)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Brand Value</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${company.currentMetrics.brandValue > 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${company.currentMetrics.brandValue}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(company.currentMetrics.brandValue)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Customer Satisfaction</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${company.currentMetrics.customerSatisfaction > 50 ? 'bg-purple-500' : 'bg-red-500'}`}
                        style={{ width: `${company.currentMetrics.customerSatisfaction}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(company.currentMetrics.customerSatisfaction)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Asset Value</p>
                  <p className="text-lg font-bold">{formatMoney(company.currentMetrics.assetValue)}</p>
                </div>
              </div>

              {/* Extraction Stats */}
              <div className="bg-surface-900 rounded-lg p-3">
                <h4 className="text-sm font-medium text-surface-400 mb-2">Value Extracted</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-surface-500">Debt Loaded</p>
                    <p className="font-bold text-red-400">{formatMoney(company.debtLoaded)}</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Employees Laid Off</p>
                    <p className="font-bold text-orange-400">{company.employeesLaidOff.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Fees Extracted</p>
                    <p className="font-bold text-green-400">{formatMoney(company.managementFeesExtracted)}</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Dividends Taken</p>
                    <p className="font-bold text-green-400">{formatMoney(company.dividendsExtracted)}</p>
                  </div>
                </div>
              </div>

              {/* Strategy Selection */}
              <div>
                <h4 className="text-sm font-medium mb-2">Execute Strategy</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select a strategy...</option>
                    {strategies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedStrategy) {
                        onExecuteStrategy(selectedStrategy);
                        setSelectedStrategy('');
                      }
                    }}
                    disabled={!selectedStrategy}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Execute
                  </button>
                </div>
                {selectedStrategy && (
                  <p className="text-xs text-surface-400 mt-2">
                    {strategies.find((s) => s.id === selectedStrategy)?.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-surface-700">
                <button
                  onClick={() => onSell(estimatedValue)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Sell for ~{formatMoney(estimatedValue)}
                </button>
                <button
                  onClick={onBankruptcy}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Bankruptcy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PortfolioPanel({
  portfolio,
  strategies,
  onExecuteStrategy,
  onSellCompany,
  onDeclareBankruptcy,
}: PortfolioPanelProps) {
  if (portfolio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-400">
        <Building className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No companies in portfolio</p>
        <p className="text-sm">Acquire some companies to start extracting value!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portfolio.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          strategies={strategies}
          onExecuteStrategy={(strategyId) => onExecuteStrategy(company.id, strategyId)}
          onSell={(price) => onSellCompany(company.id, price)}
          onBankruptcy={() => onDeclareBankruptcy(company.id)}
        />
      ))}
    </div>
  );
}
