import { useState } from 'react';
import type { WanderingCustomer, Product, Inventory } from '../types';

interface MarketPanelProps {
  customers: WanderingCustomer[];
  products: Product[];
  inventory: Inventory;
  onServeCustomer: (customerId: string) => void;
  onSellItem: (itemId: string, amount: number) => void;
}

export function MarketPanel({
  customers,
  products,
  inventory,
  onServeCustomer,
  onSellItem,
}: MarketPanelProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'sell'>('customers');

  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return {
      name: product?.name || productId,
      emoji: product?.emoji || '📦',
      value: product?.baseValue || 0,
    };
  };

  const getTimeRemaining = (customer: WanderingCustomer) => {
    const remaining = (customer.expiresAt - Date.now()) / 1000;
    if (remaining <= 0) return 'Gone';
    return `${Math.ceil(remaining)}s`;
  };

  const canServe = (customer: WanderingCustomer) => {
    return (inventory[customer.wantsItemId] || 0) >= customer.wantsAmount;
  };

  // Get items available to sell
  const sellableItems = Object.entries(inventory)
    .filter(([_, amount]) => amount > 0)
    .map(([itemId, amount]) => ({
      itemId,
      amount,
      ...getProductInfo(itemId),
    }));

  return (
    <div className="bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏪</span> Market
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('customers')}
          className={`
            flex-1 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'customers'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-900 text-purple-300 hover:bg-purple-700'
            }
          `}
        >
          👥 Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`
            flex-1 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'sell'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-900 text-purple-300 hover:bg-purple-700'
            }
          `}
        >
          💰 Quick Sell
        </button>
      </div>

      {/* Wandering Customers */}
      {activeTab === 'customers' && (
        <>
          {customers.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">🚶</span>
              <span className="text-purple-200">No customers around...</span>
              <div className="text-xs text-purple-300 mt-1">Wandering traders appear randomly</div>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map(customer => {
                const info = getProductInfo(customer.wantsItemId);
                const have = inventory[customer.wantsItemId] || 0;
                const able = canServe(customer);

                return (
                  <div
                    key={customer.id}
                    className={`
                      p-3 rounded-lg
                      ${able ? 'bg-green-700' : 'bg-purple-900/50'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{customer.emoji}</span>
                        <span className="text-white font-medium">{customer.name}</span>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-purple-600">
                        ⏱️ {getTimeRemaining(customer)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-purple-200">Wants: </span>
                        <span className={`${able ? 'text-green-300' : 'text-red-300'}`}>
                          {info.emoji} {customer.wantsAmount}× {info.name}
                        </span>
                        <span className="text-xs text-purple-300 ml-1">({have} in stock)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm">
                        <span className="text-purple-200">Offers: </span>
                        <span className="text-yellow-300 font-bold">${customer.offersPrice}</span>
                        <span className="text-xs text-green-300 ml-1">
                          (+{Math.round((customer.offersPrice / (info.value * customer.wantsAmount) - 1) * 100)}% premium!)
                        </span>
                      </div>

                      <button
                        onClick={() => onServeCustomer(customer.id)}
                        disabled={!able}
                        className={`
                          px-3 py-1 rounded text-sm font-bold
                          ${able
                            ? 'bg-green-500 hover:bg-green-400 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Quick Sell */}
      {activeTab === 'sell' && (
        <>
          {sellableItems.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📦</span>
              <span className="text-purple-200">Nothing to sell...</span>
              <div className="text-xs text-purple-300 mt-1">Harvest crops or collect products first</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sellableItems.map(item => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between p-2 bg-purple-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <div className="text-white text-sm">{item.name}</div>
                      <div className="text-xs text-purple-300">
                        ${item.value} each × {item.amount}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onSellItem(item.itemId, 1)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs"
                    >
                      Sell 1
                    </button>
                    {item.amount > 1 && (
                      <button
                        onClick={() => onSellItem(item.itemId, item.amount)}
                        className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs"
                      >
                        Sell All
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 text-xs text-purple-300 text-center">
            Tip: Wandering customers pay 80% more than base price!
          </div>
        </>
      )}
    </div>
  );
}
