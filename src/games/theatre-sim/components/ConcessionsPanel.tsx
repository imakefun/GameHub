import { useState } from 'react';
import type { GameState } from '../types';
import { concessionItems as allItems } from '../data';

interface Props {
  state: GameState;
  onUnlockItem: (itemId: string) => void;
  onRestock: (itemId: string, quantity: number) => void;
  onSetPrice: (itemId: string, price: number) => void;
  onUpgradeStand: () => void;
}

const categoryLabels: Record<string, string> = {
  snack: '🍿 Snacks',
  drink: '🥤 Drinks',
  combo: '🎬 Combos',
  premium: '🍷 Premium',
};

type ConcessionTab = 'inventory' | 'unlock';

export function ConcessionsPanel({ state, onUnlockItem, onRestock, onSetPrice, onUpgradeStand }: Props) {
  const { concessionStock, concessionStand } = state.theatre;
  const { money } = state.resources;
  const [tab, setTab] = useState<ConcessionTab>('inventory');
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});

  const totalStock = concessionStock.reduce((sum, s) => sum + s.stock, 0);
  const stockPct = concessionStand.maxStock > 0 ? (totalStock / concessionStand.maxStock) * 100 : 0;
  const unlockedScreens = state.theatre.screens.filter(s => s.unlocked).length;
  const concWorkers = state.staff.filter(s => s.role === 'concessions').length;

  const categories = ['snack', 'drink', 'combo', 'premium'] as const;

  const getRestockQty = (itemId: string) => restockQty[itemId] ?? 20;
  const setItemRestockQty = (itemId: string, qty: number) => {
    setRestockQty(prev => ({ ...prev, [itemId]: Math.max(1, qty) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Concessions</h3>
        <span className="text-sm text-slate-400">{concessionStock.length} items on menu</span>
      </div>

      {/* Stand info + storage bar */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-medium text-white">Concession Stand</h4>
            <p className="text-xs text-slate-400">Level {concessionStand.level} • Storage: {totalStock}/{concessionStand.maxStock}</p>
          </div>
          <button
            onClick={onUpgradeStand}
            disabled={money < concessionStand.upgradeCost}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              money >= concessionStand.upgradeCost
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Expand +50 — ${concessionStand.upgradeCost.toLocaleString()}
          </button>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              stockPct > 80 ? 'bg-green-500' : stockPct > 40 ? 'bg-amber-500' : stockPct > 10 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stockPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span className={stockPct < 15 ? 'text-red-400' : 'text-slate-500'}>
            {stockPct < 15 ? 'Stock running low!' : `${stockPct.toFixed(0)}% full`}
          </span>
          <span className="text-slate-500">{concessionStand.maxStock - totalStock} units free</span>
        </div>
      </div>

      {/* No workers warning */}
      {concWorkers === 0 && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-sm text-red-300">
          No concession workers hired! You need at least one to sell anything.
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={() => setTab('inventory')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'inventory' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          📦 Inventory ({concessionStock.length})
        </button>
        <button
          onClick={() => setTab('unlock')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'unlock' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔓 Unlock New
        </button>
      </div>

      {/* ===== INVENTORY TAB ===== */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          {concessionStock.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No items on the menu yet. Unlock some items first!</p>
            </div>
          )}

          {categories.map(cat => {
            const itemsInCat = concessionStock.filter(s => {
              const item = allItems.find(c => c.id === s.itemId);
              return item?.category === cat;
            });
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat}>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  {categoryLabels[cat]}
                </h4>
                <div className="space-y-2">
                  {itemsInCat.map(stockEntry => {
                    const item = allItems.find(c => c.id === stockEntry.itemId)!;
                    const markup = item.basePrice > 0 ? ((stockEntry.sellingPrice / item.basePrice - 1) * 100) : 0;
                    const profitPerUnit = stockEntry.sellingPrice - item.cost;
                    const qty = getRestockQty(stockEntry.itemId);
                    const restockCost = qty * item.cost;
                    const spaceLeft = concessionStand.maxStock - totalStock;

                    return (
                      <div
                        key={stockEntry.itemId}
                        className={`bg-slate-800/50 rounded-xl border transition-all ${
                          stockEntry.stock === 0 ? 'border-red-800/30' : 'border-slate-700/30'
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{item.name}</span>
                                {stockEntry.stock === 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400">OUT OF STOCK</span>
                                )}
                              </div>

                              {/* Stock bar */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 w-10">Stock</span>
                                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      stockEntry.stock > 15 ? 'bg-green-500' : stockEntry.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min((stockEntry.stock / 40) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-300 font-medium">{stockEntry.stock}</span>
                                <span className="text-[10px] text-slate-600">sold: {stockEntry.totalSold}</span>
                              </div>
                            </div>

                            {/* Price controls */}
                            <div className="shrink-0 text-center">
                              <div className="text-[9px] text-slate-500 mb-0.5">Sell Price</div>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => onSetPrice(stockEntry.itemId, stockEntry.sellingPrice - 0.50)}
                                  className="w-5 h-5 rounded bg-slate-700 text-white text-xs hover:bg-slate-600 flex items-center justify-center"
                                >−</button>
                                <span className="text-sm font-medium text-white w-12 text-center">
                                  ${stockEntry.sellingPrice.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => onSetPrice(stockEntry.itemId, stockEntry.sellingPrice + 0.50)}
                                  className="w-5 h-5 rounded bg-slate-700 text-white text-xs hover:bg-slate-600 flex items-center justify-center"
                                >+</button>
                              </div>
                              <div className={`text-[9px] mt-0.5 ${
                                markup > 30 ? 'text-red-400' : markup > 0 ? 'text-amber-400' : markup < -10 ? 'text-green-400' : 'text-slate-500'
                              }`}>
                                {markup >= 0 ? '+' : ''}{markup.toFixed(0)}% vs base
                              </div>
                              <div className="text-[9px] text-emerald-400">
                                ${profitPerUnit.toFixed(2)}/unit profit
                              </div>
                            </div>
                          </div>

                          {/* Restock controls */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
                            <span className="text-[10px] text-slate-500">Restock:</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setItemRestockQty(stockEntry.itemId, qty - 5)}
                                className="w-5 h-5 rounded bg-slate-700 text-white text-[10px] hover:bg-slate-600 flex items-center justify-center"
                              >−</button>
                              <span className="text-xs text-white w-8 text-center">{qty}</span>
                              <button
                                onClick={() => setItemRestockQty(stockEntry.itemId, qty + 5)}
                                className="w-5 h-5 rounded bg-slate-700 text-white text-[10px] hover:bg-slate-600 flex items-center justify-center"
                              >+</button>
                            </div>
                            <span className="text-[10px] text-slate-500">@ ${item.cost.toFixed(2)}/ea</span>
                            <button
                              onClick={() => onRestock(stockEntry.itemId, qty)}
                              disabled={money < restockCost || spaceLeft <= 0}
                              className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-medium ${
                                money >= restockCost && spaceLeft > 0
                                  ? 'bg-green-700 hover:bg-green-600 text-white'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Buy ${restockCost.toFixed(2)}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== UNLOCK TAB ===== */}
      {tab === 'unlock' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1">
            Unlock requirements based on screens ({unlockedScreens}) and concession workers ({concWorkers}).
          </div>

          {categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const locked = items.filter(i => !concessionStock.some(s => s.itemId === i.id));
            if (locked.length === 0) return (
              <div key={cat}>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  {categoryLabels[cat]}
                </h4>
                <p className="text-xs text-green-400/60 italic">All items unlocked!</p>
              </div>
            );

            return (
              <div key={cat}>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  {categoryLabels[cat]}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map(item => {
                    const isUnlocked = concessionStock.some(s => s.itemId === item.id);
                    if (isUnlocked) return (
                      <div key={item.id} className="bg-slate-800/30 rounded-lg p-3 border border-green-800/20">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <span className="text-sm text-slate-400">{item.name}</span>
                            <span className="ml-1.5 text-[10px] text-green-400">ON MENU</span>
                          </div>
                        </div>
                      </div>
                    );

                    const meetsScreens = unlockedScreens >= item.requiredScreens;
                    const meetsWorkers = concWorkers >= item.requiredWorkers;
                    const canAfford = money >= item.unlockCost;
                    const canUnlock = meetsScreens && meetsWorkers && canAfford;

                    return (
                      <div
                        key={item.id}
                        className={`bg-slate-800/50 rounded-lg p-3 border transition-all ${
                          canUnlock ? 'border-blue-800/30 hover:border-blue-600/50' : 'border-slate-700/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <span className="text-sm font-medium text-white">{item.name}</span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className="text-slate-500">Cost: ${item.cost.toFixed(2)}</span>
                                <span className="text-green-400">Base: ${item.basePrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            meetsScreens ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            {item.requiredScreens} screen{item.requiredScreens !== 1 ? 's' : ''}
                          </span>
                          {item.requiredWorkers > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              meetsWorkers ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                            }`}>
                              {item.requiredWorkers} worker{item.requiredWorkers !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                            Pop: {item.popularity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-[10px] text-slate-500">
                            Margin: {(((item.basePrice - item.cost) / item.basePrice) * 100).toFixed(0)}%
                          </div>
                          <button
                            onClick={() => onUnlockItem(item.id)}
                            disabled={!canUnlock}
                            className={`px-2.5 py-1 rounded text-xs font-medium ${
                              canUnlock
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {item.unlockCost === 0 ? 'Free' : `$${item.unlockCost.toLocaleString()}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
