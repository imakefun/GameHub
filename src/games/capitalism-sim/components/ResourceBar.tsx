// Late Stage Capitalism Simulator - Resource Bar Component

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Star, Briefcase } from 'lucide-react';
import type { FundResources, GameStats } from '../types';

interface ResourceBarProps {
  fund: FundResources;
  stats: GameStats;
  currentMonth: number;
  currentYear: number;
  portfolioSize: number;
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

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ResourceBar({ fund, stats, currentMonth, currentYear, portfolioSize }: ResourceBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800 border-b border-surface-700 px-4 py-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Fund Name & Date */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-primary-400">Vulture Capital Partners</h1>
            <p className="text-sm text-surface-400">
              {months[currentMonth]} {currentYear} | Year {stats.yearsInBusiness + 1}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-6 flex-wrap">
          {/* Capital */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Capital</p>
              <p className="text-lg font-bold text-green-400">{formatMoney(fund.capital)}</p>
            </div>
          </div>

          {/* Portfolio */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Portfolio</p>
              <p className="text-lg font-bold text-blue-400">{portfolioSize} companies</p>
            </div>
          </div>

          {/* Total Returns */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Returns</p>
              <p className={`text-lg font-bold ${fund.totalReturns >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                {formatMoney(fund.totalReturns)}
              </p>
            </div>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-surface-400">Reputation</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      fund.reputation > 70 ? 'bg-green-500' :
                      fund.reputation > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${fund.reputation}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-surface-300">{fund.reputation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-surface-400">
          <span>Acquired: {stats.companiesAcquired}</span>
          <span className="text-red-400">Bankrupted: {stats.companiesBankrupted}</span>
          <span>Laid off: {stats.totalEmployeesLaidOff.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
