// Late Stage Capitalism Simulator - Stats Panel

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Building, DollarSign, Skull, Award, BarChart3 } from 'lucide-react';
import type { GameStats, FundResources } from '../types';
import { achievements } from '../data/settings';

interface StatsPanelProps {
  stats: GameStats;
  fund: FundResources;
}

function formatMoney(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

function StatCard({ icon, label, value, color = 'text-surface-300' }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800 rounded-lg border border-surface-700 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-surface-400">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsPanel({ stats, fund }: StatsPanelProps) {
  // Calculate achievements
  const earnedAchievements = achievements.filter((a) => {
    const statValue = stats[a.stat as keyof GameStats];
    return typeof statValue === 'number' && statValue >= a.threshold;
  });

  return (
    <div className="space-y-6">
      {/* Fund Performance */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          Fund Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            label="Current Capital"
            value={formatMoney(fund.capital)}
            color="text-green-400"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            label="Total Returns"
            value={formatMoney(fund.totalReturns)}
            color={fund.totalReturns >= 0 ? 'text-purple-400' : 'text-red-400'}
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
            label="Annual Fees"
            value={formatMoney(fund.managementFees)}
            color="text-blue-400"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            label="Years Active"
            value={stats.yearsInBusiness}
            color="text-yellow-400"
          />
        </div>
      </div>

      {/* Deal Statistics */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary-400" />
          Deal Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Building className="w-5 h-5 text-blue-400" />}
            label="Companies Acquired"
            value={stats.companiesAcquired}
            color="text-blue-400"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            label="Companies Sold"
            value={stats.companiesSold}
            color="text-green-400"
          />
          <StatCard
            icon={<Skull className="w-5 h-5 text-red-400" />}
            label="Companies Bankrupted"
            value={stats.companiesBankrupted}
            color="text-red-400"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            label="Biggest Deal"
            value={formatMoney(stats.biggestDeal)}
            color="text-purple-400"
          />
        </div>
      </div>

      {/* Destruction Statistics */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-400" />
          Value "Created"
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-orange-400" />}
            label="Employees Laid Off"
            value={stats.totalEmployeesLaidOff.toLocaleString()}
            color="text-orange-400"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-red-400" />}
            label="Debt Loaded"
            value={formatMoney(stats.totalDebtLoaded)}
            color="text-red-400"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            label="Fees Extracted"
            value={formatMoney(stats.totalFeesExtracted)}
            color="text-green-400"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            label="Dividends Extracted"
            value={formatMoney(stats.totalDividendsExtracted)}
            color="text-green-400"
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-400" />
          Achievements ({earnedAchievements.length}/{achievements.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const statValue = stats[achievement.stat as keyof GameStats];
            const isEarned = typeof statValue === 'number' && statValue >= achievement.threshold;
            const progress = typeof statValue === 'number'
              ? Math.min(100, (statValue / achievement.threshold) * 100)
              : 0;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border ${
                  isEarned
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-surface-800 border-surface-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isEarned ? 'bg-yellow-500/20' : 'bg-surface-700'
                  }`}>
                    {isEarned ? (
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Award className="w-5 h-5 text-surface-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isEarned ? 'text-yellow-400' : 'text-surface-400'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-xs text-surface-500">{achievement.description}</p>
                  </div>
                </div>
                {!isEarned && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-surface-500 mt-1 text-right">
                      {typeof statValue === 'number' ? statValue.toLocaleString() : 0} / {achievement.threshold.toLocaleString()}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
