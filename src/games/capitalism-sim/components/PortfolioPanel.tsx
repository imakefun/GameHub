// Late Stage Capitalism Simulator - Portfolio Panel

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Users, Building, AlertTriangle, ChevronDown, ChevronUp, DollarSign, Percent, Scissors, Package } from 'lucide-react';
import type { PortfolioCompany } from '../types';

interface ManagementActions {
  loadDebt: (companyId: string, amount: number) => void;
  takeDividend: (companyId: string, amount: number) => void;
  reduceWorkforce: (companyId: string, percent: number) => void;
  cutQuality: (companyId: string, percent: number) => void;
  sellAssets: (companyId: string, percent: number) => void;
  extractFees: (companyId: string, amount: number) => void;
  saleLeaseback: (companyId: string) => void;
}

interface PortfolioPanelProps {
  portfolio: PortfolioCompany[];
  onSellCompany: (companyId: string, price: number) => void;
  onDeclareBankruptcy: (companyId: string) => void;
  managementActions: ManagementActions;
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

function getRiskColor(value: number, thresholds: { low: number; medium: number; high: number }): string {
  if (value <= thresholds.low) return 'text-green-400';
  if (value <= thresholds.medium) return 'text-yellow-400';
  return 'text-red-400';
}

function getRiskLabel(value: number, thresholds: { low: number; medium: number; high: number }): string {
  if (value <= thresholds.low) return 'Low Risk';
  if (value <= thresholds.medium) return 'Medium Risk';
  return 'High Risk';
}

interface ActionSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  estimatedReturn: string;
  riskThresholds: { low: number; medium: number; high: number };
  onChange: (value: number) => void;
  onExecute: () => void;
  description: string;
}

function ActionSlider({
  label,
  icon,
  value,
  min,
  max,
  step,
  displayValue,
  estimatedReturn,
  riskThresholds,
  onChange,
  onExecute,
  description,
}: ActionSliderProps) {
  const riskColor = getRiskColor(value, riskThresholds);
  const riskLabel = getRiskLabel(value, riskThresholds);

  return (
    <div className="bg-surface-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-sm font-medium ${riskColor}`}>{riskLabel}</span>
      </div>
      <p className="text-xs text-surface-400 mb-3">{description}</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-20 text-right font-bold">{displayValue}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-surface-400">Est. return: <span className="text-green-400 font-medium">{estimatedReturn}</span></span>
        <button
          onClick={onExecute}
          disabled={value <= 0}
          className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 rounded text-sm font-medium transition-colors"
        >
          Execute
        </button>
      </div>
    </div>
  );
}

interface CompanyCardProps {
  company: PortfolioCompany;
  onSell: (price: number) => void;
  onBankruptcy: () => void;
  actions: ManagementActions;
}

function CompanyCard({ company, onSell, onBankruptcy, actions }: CompanyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');

  // Slider states
  const [debtAmount, setDebtAmount] = useState(0);
  const [dividendPercent, setDividendPercent] = useState(0);
  const [workforcePercent, setWorkforcePercent] = useState(0);
  const [qualityPercent, setQualityPercent] = useState(0);
  const [assetPercent, setAssetPercent] = useState(0);
  const [feePercent, setFeePercent] = useState(0);

  const profitChange = company.currentMetrics.profit - company.originalMetrics.profit;
  const employeeDelta = company.originalMetrics.employees - company.currentMetrics.employees;

  // Calculate values based on company metrics
  const maxDebt = company.currentMetrics.revenue * 0.5;
  const maxDividend = company.currentMetrics.assetValue * 0.8;
  const hasRealEstate = !company.assetsStripped.includes('Real estate (sale-leaseback)');

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
        <div className="flex items-center gap-6 mt-3 text-sm flex-wrap">
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
            {/* Tab Navigation */}
            <div className="flex border-b border-surface-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-surface-700 text-primary-400' : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'manage' ? 'bg-surface-700 text-primary-400' : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                Manage Company
              </button>
            </div>

            <div className="p-4 space-y-4">
              {activeTab === 'overview' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Management Actions with Sliders */}
                  <div className="space-y-4">
                    {/* Debt Refinancing */}
                    <ActionSlider
                      label="Refinance with Debt"
                      icon={<DollarSign className="w-5 h-5 text-red-400" />}
                      value={debtAmount}
                      min={0}
                      max={maxDebt}
                      step={maxDebt / 20}
                      displayValue={formatMoney(debtAmount)}
                      estimatedReturn={formatMoney(debtAmount * 0.9)}
                      riskThresholds={{ low: maxDebt * 0.15, medium: maxDebt * 0.3, high: maxDebt * 0.45 }}
                      onChange={setDebtAmount}
                      onExecute={() => {
                        if (debtAmount > 0) {
                          actions.loadDebt(company.id, debtAmount);
                          setDebtAmount(0);
                        }
                      }}
                      description="Take on additional debt. Higher amounts increase financial strain and interest costs."
                    />

                    {/* Special Dividend */}
                    <ActionSlider
                      label="Special Dividend"
                      icon={<DollarSign className="w-5 h-5 text-green-400" />}
                      value={dividendPercent}
                      min={0}
                      max={80}
                      step={5}
                      displayValue={`${dividendPercent}%`}
                      estimatedReturn={formatMoney(maxDividend * dividendPercent / 100)}
                      riskThresholds={{ low: 25, medium: 50, high: 70 }}
                      onChange={setDividendPercent}
                      onExecute={() => {
                        if (dividendPercent > 0) {
                          actions.takeDividend(company.id, maxDividend * dividendPercent / 100);
                          setDividendPercent(0);
                        }
                      }}
                      description="Extract cash from the company as a dividend. Reduces operational capital."
                    />

                    {/* Workforce Reduction */}
                    <ActionSlider
                      label="Workforce Reduction"
                      icon={<Users className="w-5 h-5 text-orange-400" />}
                      value={workforcePercent}
                      min={0}
                      max={40}
                      step={5}
                      displayValue={`${workforcePercent}%`}
                      estimatedReturn={formatMoney(company.currentMetrics.employees * workforcePercent / 100 * 40000)}
                      riskThresholds={{ low: 10, medium: 20, high: 35 }}
                      onChange={setWorkforcePercent}
                      onExecute={() => {
                        if (workforcePercent > 0) {
                          actions.reduceWorkforce(company.id, workforcePercent);
                          setWorkforcePercent(0);
                        }
                      }}
                      description="Lay off employees to reduce costs. Larger cuts hurt morale and operations."
                    />

                    {/* Cost Optimization (Quality Cuts) */}
                    <ActionSlider
                      label="Cost Optimization"
                      icon={<Scissors className="w-5 h-5 text-yellow-400" />}
                      value={qualityPercent}
                      min={0}
                      max={30}
                      step={5}
                      displayValue={`${qualityPercent}%`}
                      estimatedReturn={formatMoney(company.currentMetrics.revenue * qualityPercent / 100 * 0.15)}
                      riskThresholds={{ low: 10, medium: 20, high: 25 }}
                      onChange={setQualityPercent}
                      onExecute={() => {
                        if (qualityPercent > 0) {
                          actions.cutQuality(company.id, qualityPercent);
                          setQualityPercent(0);
                        }
                      }}
                      description="Reduce product/service quality to improve margins. Affects customer satisfaction."
                    />

                    {/* Asset Liquidation */}
                    <ActionSlider
                      label="Asset Liquidation"
                      icon={<Package className="w-5 h-5 text-purple-400" />}
                      value={assetPercent}
                      min={0}
                      max={60}
                      step={5}
                      displayValue={`${assetPercent}%`}
                      estimatedReturn={formatMoney(company.currentMetrics.assetValue * assetPercent / 100 * 0.7)}
                      riskThresholds={{ low: 20, medium: 40, high: 55 }}
                      onChange={setAssetPercent}
                      onExecute={() => {
                        if (assetPercent > 0) {
                          actions.sellAssets(company.id, assetPercent);
                          setAssetPercent(0);
                        }
                      }}
                      description="Sell company assets for immediate cash. Assets sold at ~70% of book value."
                    />

                    {/* Management Fees */}
                    <ActionSlider
                      label="Management Fees"
                      icon={<Percent className="w-5 h-5 text-blue-400" />}
                      value={feePercent}
                      min={0}
                      max={5}
                      step={0.5}
                      displayValue={`${feePercent}%`}
                      estimatedReturn={formatMoney(company.currentMetrics.revenue * feePercent / 100)}
                      riskThresholds={{ low: 2, medium: 3, high: 4 }}
                      onChange={setFeePercent}
                      onExecute={() => {
                        if (feePercent > 0) {
                          actions.extractFees(company.id, company.currentMetrics.revenue * feePercent / 100);
                          setFeePercent(0);
                        }
                      }}
                      description="Charge consulting and management fees to the portfolio company."
                    />

                    {/* Sale-Leaseback (One-time) */}
                    {hasRealEstate && (
                      <div className="bg-surface-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-cyan-400" />
                            <span className="font-medium">Sale-Leaseback</span>
                          </div>
                          <span className="text-sm font-medium text-yellow-400">One-Time Action</span>
                        </div>
                        <p className="text-xs text-surface-400 mb-3">Sell real estate and lease it back. Provides immediate cash but creates ongoing rent expenses.</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-400">
                            Est. return: <span className="text-green-400 font-medium">{formatMoney(company.currentMetrics.assetValue * 0.4 * 0.8)}</span>
                          </span>
                          <button
                            onClick={() => actions.saleLeaseback(company.id)}
                            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium transition-colors"
                          >
                            Execute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

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
  onSellCompany,
  onDeclareBankruptcy,
  managementActions,
}: PortfolioPanelProps) {
  if (portfolio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-400">
        <Building className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No companies in portfolio</p>
        <p className="text-sm">Acquire some companies to start managing them!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portfolio.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onSell={(price) => onSellCompany(company.id, price)}
          onBankruptcy={() => onDeclareBankruptcy(company.id)}
          actions={managementActions}
        />
      ))}
    </div>
  );
}
