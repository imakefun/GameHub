// Late Stage Capitalism Simulator - Event Modal

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Gavel, Users, Megaphone, Sparkles } from 'lucide-react';
import type { ActiveEvent, PortfolioCompany } from '../types';

interface EventModalProps {
  activeEvent: ActiveEvent | null;
  portfolio: PortfolioCompany[];
  onChoice: (choiceIndex: number) => void;
  onDismiss: () => void;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'scandal': return <AlertTriangle className="w-6 h-6" />;
    case 'market': return <TrendingUp className="w-6 h-6" />;
    case 'regulatory': return <Gavel className="w-6 h-6" />;
    case 'employee': return <Users className="w-6 h-6" />;
    case 'customer': return <Megaphone className="w-6 h-6" />;
    case 'opportunity': return <Sparkles className="w-6 h-6" />;
    default: return <AlertTriangle className="w-6 h-6" />;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'scandal': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'market': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'regulatory': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'employee': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'customer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'opportunity': return 'bg-green-500/20 text-green-400 border-green-500/30';
    default: return 'bg-surface-700 text-surface-300 border-surface-600';
  }
}

export function EventModal({ activeEvent, portfolio, onChoice, onDismiss }: EventModalProps) {
  if (!activeEvent) return null;

  const { event, companyId } = activeEvent;
  const affectedCompany = companyId ? portfolio.find((c) => c.id === companyId) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !event.choices?.length) {
            onDismiss();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface-800 rounded-xl border border-surface-700 max-w-lg w-full shadow-2xl"
        >
          {/* Header */}
          <div className={`p-4 rounded-t-xl border-b ${getCategoryColor(event.category)}`}>
            <div className="flex items-center gap-3">
              {getCategoryIcon(event.category)}
              <div className="flex-1">
                <span className="text-xs uppercase tracking-wide opacity-75">{event.category}</span>
                <h2 className="text-xl font-bold">{event.title}</h2>
              </div>
              <span className="text-4xl">{event.icon}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-surface-300 leading-relaxed">{event.description}</p>

            {affectedCompany && (
              <div className="mt-4 p-3 bg-surface-900 rounded-lg flex items-center gap-3">
                <span className="text-2xl">{affectedCompany.icon}</span>
                <div>
                  <p className="text-sm text-surface-400">Affected Company</p>
                  <p className="font-medium">{affectedCompany.name}</p>
                </div>
              </div>
            )}

            {/* Default Effects (if no choices) */}
            {event.effects.length > 0 && !event.choices?.length && (
              <div className="mt-4 p-3 bg-surface-900 rounded-lg">
                <p className="text-sm text-surface-400 mb-2">Effects:</p>
                <div className="space-y-1">
                  {event.effects.map((effect, i) => (
                    <div
                      key={i}
                      className={`text-sm ${
                        effect.modifier === 'subtract' ||
                        (effect.modifier === 'multiply' && effect.value < 1)
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {effect.target === 'fund' ? 'Fund' :
                       effect.target === 'allCompanies' ? 'All companies' : 'Company'}:
                      {effect.modifier === 'add' && ` +${effect.value}`}
                      {effect.modifier === 'subtract' && ` -${effect.value}`}
                      {effect.modifier === 'multiply' && ` x${effect.value}`}
                      {` ${effect.metric}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Choices */}
            {event.choices && event.choices.length > 0 ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-surface-400 font-medium">How do you respond?</p>
                {event.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => onChoice(index)}
                    className="w-full p-4 bg-surface-700 hover:bg-surface-600 rounded-lg text-left transition-colors group"
                  >
                    <p className="font-medium group-hover:text-primary-400 transition-colors">
                      {choice.text}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {choice.effects.map((effect, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded ${
                            effect.modifier === 'subtract' ||
                            (effect.modifier === 'multiply' && effect.value < 1)
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {effect.metric}
                          {effect.modifier === 'add' && ` +${effect.value}`}
                          {effect.modifier === 'subtract' && ` -${effect.value}`}
                          {effect.modifier === 'multiply' && ` x${effect.value}`}
                        </span>
                      ))}
                      {choice.reputationChange !== 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            choice.reputationChange > 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          Reputation {choice.reputationChange > 0 ? '+' : ''}{choice.reputationChange}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={onDismiss}
                className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
