// Late Stage Capitalism Simulator - Strategy Panel

import { motion } from 'framer-motion';
import type { Strategy } from '../types';

interface StrategyPanelProps {
  strategies: Strategy[];
  unlockedStrategies: string[];
}

function getCategoryColor(category: Strategy['category']): string {
  switch (category) {
    case 'financial': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'operational': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'extraction': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'exit': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-surface-700 text-surface-300 border-surface-600';
  }
}

function getCategoryLabel(category: Strategy['category']): string {
  switch (category) {
    case 'financial': return 'Financial Engineering';
    case 'operational': return 'Operational "Improvements"';
    case 'extraction': return 'Value Extraction';
    case 'exit': return 'Exit Strategies';
    default: return category;
  }
}

export function StrategyPanel({ strategies, unlockedStrategies }: StrategyPanelProps) {
  const categories: Strategy['category'][] = ['financial', 'operational', 'extraction', 'exit'];

  return (
    <div className="space-y-6">
      <div className="bg-surface-800 rounded-lg p-4 border border-surface-700">
        <h2 className="text-lg font-bold mb-2">The PE Playbook</h2>
        <p className="text-sm text-surface-400">
          These are the tried-and-true tactics of private equity. Select a company from your portfolio,
          then execute these strategies to maximize returns (for yourself, not the company).
        </p>
      </div>

      {categories.map((category) => {
        const categoryStrategies = strategies.filter((s) => s.category === category);

        return (
          <div key={category}>
            <h3 className={`text-lg font-bold mb-3 px-3 py-1 rounded-lg inline-block ${getCategoryColor(category)}`}>
              {getCategoryLabel(category)}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {categoryStrategies.map((strategy) => {
                const isUnlocked = unlockedStrategies.includes(strategy.id);

                return (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-surface-800 rounded-lg border p-4 ${
                      isUnlocked ? 'border-surface-700' : 'border-surface-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{strategy.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{strategy.name}</h4>
                          {!isUnlocked && (
                            <span className="text-xs bg-surface-700 px-2 py-0.5 rounded">Locked</span>
                          )}
                        </div>
                        <p className="text-sm text-surface-400 mt-1">{strategy.description}</p>

                        {/* Effects */}
                        <div className="mt-3 space-y-1">
                          {strategy.effects.map((effect, i) => (
                            <div
                              key={i}
                              className={`text-xs px-2 py-1 rounded ${
                                effect.modifier === 'subtract' ||
                                (effect.modifier === 'multiply' && effect.value < 1)
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {effect.description}
                            </div>
                          ))}
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                          {strategy.cooldownMonths > 0 && (
                            <span>Cooldown: {strategy.cooldownMonths} months</span>
                          )}
                          {strategy.reputationCost > 0 && (
                            <span className="text-red-400">-{strategy.reputationCost} reputation</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
