// Late Stage Capitalism Simulator - Targets Panel

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Target, RefreshCw, AlertCircle } from 'lucide-react';
import type { TargetCompany, AcquisitionDeal } from '../types';

interface TargetsPanelProps {
  targets: TargetCompany[];
  pendingDeals: AcquisitionDeal[];
  capital: number;
  onMakeOffer: (companyId: string, offer: number, debtPct: number) => void;
  onCancelDeal: (dealIndex: number) => void;
  onRefreshTargets: () => void;
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

interface TargetCardProps {
  target: TargetCompany;
  capital: number;
  onMakeOffer: (offer: number, debtPct: number) => void;
}

function TargetCard({ target, capital, onMakeOffer }: TargetCardProps) {
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState(target.basePrice);
  const [debtPercent, setDebtPercent] = useState(60);

  const equityNeeded = offerAmount * (1 - debtPercent / 100);
  const canAfford = equityNeeded <= capital;

  const handleSubmitOffer = () => {
    if (canAfford) {
      onMakeOffer(offerAmount, debtPercent);
      setShowOffer(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-surface-800 rounded-lg border border-surface-700 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{target.icon}</span>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{target.name}</h3>
                <p className="text-sm text-surface-400">{target.industry}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-400">Asking Price</p>
                <p className="text-xl font-bold text-green-400">{formatMoney(target.basePrice)}</p>
              </div>
            </div>

            <p className="text-sm text-surface-300 mt-2">{target.description}</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="bg-surface-900 rounded-lg p-2">
                <p className="text-xs text-surface-400">Revenue</p>
                <p className="font-bold">{formatMoney(target.metrics.revenue)}</p>
              </div>
              <div className="bg-surface-900 rounded-lg p-2">
                <p className="text-xs text-surface-400">Profit</p>
                <p className="font-bold">{formatMoney(target.metrics.profit)}</p>
              </div>
              <div className="bg-surface-900 rounded-lg p-2">
                <p className="text-xs text-surface-400">Employees</p>
                <p className="font-bold">{target.metrics.employees.toLocaleString()}</p>
              </div>
              <div className="bg-surface-900 rounded-lg p-2">
                <p className="text-xs text-surface-400">Assets</p>
                <p className="font-bold">{formatMoney(target.metrics.assetValue)}</p>
              </div>
            </div>

            {/* Vulnerabilities */}
            <div className="mt-4">
              <p className="text-xs text-surface-400 mb-2">Exploitable Vulnerabilities:</p>
              <div className="flex flex-wrap gap-2">
                {target.vulnerabilities.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Special Assets */}
            <div className="mt-3">
              <p className="text-xs text-surface-400 mb-2">Valuable Assets:</p>
              <div className="flex flex-wrap gap-2">
                {target.specialAssets.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Parody Note */}
            <p className="text-xs text-surface-500 mt-3 italic">Definitely not based on: {target.parody}</p>
          </div>
        </div>

        {/* Offer Section */}
        <AnimatePresence>
          {showOffer ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-surface-700"
            >
              <div className="space-y-4">
                {/* Offer Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">Offer Amount</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={target.basePrice * 0.5}
                      max={target.basePrice * 1.5}
                      step={target.basePrice * 0.05}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold w-24 text-right">{formatMoney(offerAmount)}</span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">
                    {offerAmount < target.basePrice ? 'Below asking - may be rejected' :
                     offerAmount > target.basePrice * 1.1 ? 'Above asking - likely accepted' : 'Near asking price'}
                  </p>
                </div>

                {/* Debt Financing */}
                <div>
                  <label className="block text-sm font-medium mb-2">Debt Financing (LBO)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={debtPercent}
                      onChange={(e) => setDebtPercent(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold w-16 text-right">{debtPercent}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-surface-400 mt-1">
                    <span>Debt: {formatMoney(offerAmount * debtPercent / 100)}</span>
                    <span>Equity needed: {formatMoney(equityNeeded)}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-surface-900 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Your capital:</span>
                    <span className="font-bold">{formatMoney(capital)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Equity required:</span>
                    <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                      {formatMoney(equityNeeded)}
                    </span>
                  </div>
                  {!canAfford && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Insufficient capital - increase debt financing
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowOffer(false)}
                    className="flex-1 px-4 py-2 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOffer}
                    disabled={!canAfford}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Make Offer
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-surface-700"
            >
              <button
                onClick={() => setShowOffer(true)}
                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Acquire This Company
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function TargetsPanel({
  targets,
  pendingDeals,
  capital,
  onMakeOffer,
  onCancelDeal,
  onRefreshTargets,
}: TargetsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = [...new Set(targets.map((t) => t.industry))];

  const filteredTargets = targets.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !industryFilter || t.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-4">
      {/* Pending Deals */}
      {pendingDeals.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="font-medium text-yellow-400 mb-2">Pending Deals</h3>
          {pendingDeals.map((deal, index) => {
            const target = targets.find((t) => t.id === deal.companyId);
            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-yellow-500/20 last:border-0">
                <div>
                  <span className="font-medium">{target?.name || 'Unknown'}</span>
                  <span className={`ml-2 text-sm ${deal.negotiationStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {deal.negotiationStatus === 'countered' && deal.counterOffer
                      ? `Counter: ${formatMoney(deal.counterOffer)}`
                      : deal.negotiationStatus}
                  </span>
                </div>
                <button
                  onClick={() => onCancelDeal(index)}
                  className="text-sm text-surface-400 hover:text-red-400"
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        <button
          onClick={onRefreshTargets}
          className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 transition-colors"
          title="Find new targets"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Target Cards */}
      {filteredTargets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-surface-400">
          <Building2 className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No targets available</p>
          <p className="text-sm">Check back later for new acquisition opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTargets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              capital={capital}
              onMakeOffer={(offer, debtPct) => onMakeOffer(target.id, offer, debtPct)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
