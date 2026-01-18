import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import type { Inventory, MarketPrices } from '../types';
import { getElement } from '../data/elements';

interface MarketPanelProps {
  inventory: Inventory;
  marketPrices: MarketPrices;
  onSell: (elementId: string, amount: number) => void;
}

export function MarketPanel({ inventory, marketPrices, onSell }: MarketPanelProps) {
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});

  const sellableItems = Object.entries(inventory)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => ({
      element: getElement(id)!,
      count,
      price: marketPrices[id] || { currentPrice: 1, supply: 50, demand: 50, lastUpdate: 0 },
    }))
    .filter((item) => item.element)
    .sort((a, b) => b.price.currentPrice - a.price.currentPrice);

  const getTrend = (supply: number, demand: number) => {
    const ratio = demand / supply;
    if (ratio > 1.2) return 'up';
    if (ratio < 0.8) return 'down';
    return 'stable';
  };

  const handleSell = (elementId: string) => {
    const amount = sellAmounts[elementId] || 1;
    onSell(elementId, amount);
    setSellAmounts((prev) => ({ ...prev, [elementId]: 1 }));
  };

  const handleSellAll = (elementId: string, count: number) => {
    onSell(elementId, count);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <DollarSign className="w-6 h-6" /> Market
      </h2>

      <div className="glass rounded-xl p-4">
        <p className="text-sm text-surface-400 mb-4">
          Prices fluctuate based on supply and demand. Sell wisely!
        </p>

        {sellableItems.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nothing to sell yet!</p>
            <p className="text-sm mt-1">Produce or craft some elements first</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sellableItems.map(({ element, count, price }) => {
              const trend = getTrend(price.supply, price.demand);
              const amount = sellAmounts[element.id] || 1;
              const totalValue = price.currentPrice * amount;

              return (
                <motion.div
                  key={element.id}
                  layout
                  className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-lg"
                >
                  {/* Element info */}
                  <span className="text-2xl">{element.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{element.name}</span>
                      <span className="text-xs text-surface-400">×{count}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-400 font-semibold">
                        ${price.currentPrice}
                      </span>
                      {trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      )}
                      {trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      {trend === 'stable' && (
                        <Minus className="w-4 h-4 text-surface-400" />
                      )}
                    </div>
                  </div>

                  {/* Amount selector */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSellAmounts((prev) => ({
                          ...prev,
                          [element.id]: Math.max(1, (prev[element.id] || 1) - 1),
                        }))
                      }
                      className="w-7 h-7 rounded bg-surface-700 hover:bg-surface-600 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={count}
                      value={amount}
                      onChange={(e) =>
                        setSellAmounts((prev) => ({
                          ...prev,
                          [element.id]: Math.min(count, Math.max(1, parseInt(e.target.value) || 1)),
                        }))
                      }
                      className="w-12 h-7 text-center bg-surface-700 rounded text-sm"
                    />
                    <button
                      onClick={() =>
                        setSellAmounts((prev) => ({
                          ...prev,
                          [element.id]: Math.min(count, (prev[element.id] || 1) + 1),
                        }))
                      }
                      className="w-7 h-7 rounded bg-surface-700 hover:bg-surface-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Sell buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSell(element.id)}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors"
                    >
                      ${totalValue}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSellAll(element.id, count)}
                      className="px-2 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-xs transition-colors"
                      title={`Sell all for $${price.currentPrice * count}`}
                    >
                      All
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
