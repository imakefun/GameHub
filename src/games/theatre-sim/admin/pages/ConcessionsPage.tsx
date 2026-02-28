import type { GameState } from '../../types';
import { concessionItems as allConcessions } from '../../data';

interface Props { state: GameState | null }

export function ConcessionsPage({ state }: Props) {
  const stock = state?.theatre.concessionStock ?? [];
  const stand = state?.theatre.concessionStand;
  const categories = ['snack', 'drink', 'combo', 'premium'] as const;

  const totalItems = allConcessions.length;
  const unlockedCount = stock.length;
  const totalStockUnits = stock.reduce((s, e) => s + e.stock, 0);
  const totalSold = stock.reduce((s, e) => s + e.totalSold, 0);
  const concWorkers = state?.staff.filter(s => s.role === 'concessions').length ?? 0;
  const unlockedScreens = state?.theatre.screens.filter(s => s.unlocked).length ?? 0;

  // Revenue potential: sum of (sellingPrice - cost) * stock for all in-stock items
  const potentialRevenue = stock.reduce((sum, entry) => {
    const item = allConcessions.find(c => c.id === entry.itemId);
    if (!item) return sum;
    return sum + (entry.sellingPrice - item.cost) * entry.stock;
  }, 0);

  const avgMarkup = stock.length > 0
    ? stock.reduce((sum, entry) => {
        const item = allConcessions.find(c => c.id === entry.itemId);
        if (!item || item.basePrice === 0) return sum;
        return sum + (entry.sellingPrice / item.basePrice - 1) * 100;
      }, 0) / stock.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Menu Items</div>
          <div className="text-lg font-bold">{unlockedCount}/{totalItems}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Total Stock</div>
          <div className="text-lg font-bold text-amber-400">{totalStockUnits}/{stand?.maxStock ?? 0}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Lifetime Sold</div>
          <div className="text-lg font-bold text-green-400">{totalSold.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Avg Markup</div>
          <div className={`text-lg font-bold ${avgMarkup > 20 ? 'text-red-400' : avgMarkup > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            {avgMarkup >= 0 ? '+' : ''}{avgMarkup.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Stand info */}
      {stand && (
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium">Concession Stand</div>
              <div className="text-[10px] text-slate-500">
                Level {stand.level} — Storage {totalStockUnits}/{stand.maxStock}
                — Workers: {concWorkers} — Screens: {unlockedScreens}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Next upgrade: ${stand.upgradeCost.toLocaleString()}
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${stand.maxStock > 0 ? (totalStockUnits / stand.maxStock) * 100 : 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Potential revenue from current stock: ${potentialRevenue.toFixed(2)}
          </div>
        </div>
      )}

      {/* Active inventory */}
      {stock.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2 text-slate-300">Active Inventory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium text-right">Cost</th>
                  <th className="py-2 pr-3 font-medium text-right">Sell Price</th>
                  <th className="py-2 pr-3 font-medium text-right">Base</th>
                  <th className="py-2 pr-3 font-medium text-right">Markup</th>
                  <th className="py-2 pr-3 font-medium text-right">Profit/Unit</th>
                  <th className="py-2 pr-3 font-medium text-right">Stock</th>
                  <th className="py-2 font-medium text-right">Total Sold</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(entry => {
                  const item = allConcessions.find(c => c.id === entry.itemId);
                  if (!item) return null;
                  const markup = item.basePrice > 0 ? ((entry.sellingPrice / item.basePrice - 1) * 100) : 0;
                  const profit = entry.sellingPrice - item.cost;
                  return (
                    <tr key={entry.itemId} className={`border-b border-slate-800/20 ${entry.stock === 0 ? 'opacity-50' : ''}`}>
                      <td className="py-2 pr-3">
                        <span className="mr-1.5">{item.icon}</span>
                        <span className="text-slate-200">{item.name}</span>
                        {entry.stock === 0 && <span className="ml-1 text-[9px] text-red-400">EMPTY</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-red-400">${item.cost.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right text-green-400">${entry.sellingPrice.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right text-slate-500">${item.basePrice.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right">
                        <span className={markup > 20 ? 'text-red-400' : markup > 0 ? 'text-amber-400' : 'text-green-400'}>
                          {markup >= 0 ? '+' : ''}{markup.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right text-emerald-400">${profit.toFixed(2)}</td>
                      <td className={`py-2 pr-3 text-right font-medium ${entry.stock === 0 ? 'text-red-400' : entry.stock < 10 ? 'text-amber-400' : 'text-white'}`}>
                        {entry.stock}
                      </td>
                      <td className="py-2 text-right text-slate-400">{entry.totalSold.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All items reference + unlock requirements */}
      {categories.map(cat => (
        <section key={cat}>
          <h3 className="text-sm font-semibold mb-2 text-slate-300 capitalize">
            {cat}s <span className="text-[10px] text-slate-600">({allConcessions.filter(c => c.category === cat).length} items)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left border-b border-slate-800/40">
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium text-right">Cost</th>
                  <th className="py-2 pr-3 font-medium text-right">Base Price</th>
                  <th className="py-2 pr-3 font-medium text-right">Margin</th>
                  <th className="py-2 pr-3 font-medium text-right">Pop.</th>
                  <th className="py-2 pr-3 font-medium text-right">Unlock $</th>
                  <th className="py-2 pr-3 font-medium text-center">Req. Screens</th>
                  <th className="py-2 pr-3 font-medium text-center">Req. Workers</th>
                  <th className="py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {allConcessions.filter(c => c.category === cat).sort((a, b) => b.popularity - a.popularity).map(item => {
                  const margin = ((item.basePrice - item.cost) / item.basePrice) * 100;
                  const unlocked = stock.some(s => s.itemId === item.id);
                  const meetsScreens = unlockedScreens >= item.requiredScreens;
                  const meetsWorkers = concWorkers >= item.requiredWorkers;
                  return (
                    <tr key={item.id} className={`border-b border-slate-800/20 ${!unlocked ? 'opacity-50' : ''}`}>
                      <td className="py-2 pr-3">
                        <span className="mr-1.5">{item.icon}</span>
                        <span className="text-slate-200">{item.name}</span>
                      </td>
                      <td className="py-2 pr-3 text-right text-red-400">${item.cost.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right text-green-400">${item.basePrice.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right">
                        <span className={margin >= 85 ? 'text-green-400' : margin >= 75 ? 'text-amber-400' : 'text-red-400'}>
                          {margin.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-400">{item.popularity}</td>
                      <td className="py-2 pr-3 text-right text-slate-400">${item.unlockCost.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-center">
                        <span className={meetsScreens ? 'text-green-400' : 'text-red-400'}>{item.requiredScreens}</span>
                      </td>
                      <td className="py-2 pr-3 text-center">
                        <span className={meetsWorkers ? 'text-green-400' : 'text-red-400'}>{item.requiredWorkers}</span>
                      </td>
                      <td className="py-2 text-center">
                        {unlocked ? (
                          <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Active</span>
                        ) : meetsScreens && meetsWorkers ? (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Available</span>
                        ) : (
                          <span className="text-[9px] bg-slate-700/40 text-slate-500 px-1.5 py-0.5 rounded">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Concession tuning */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Concession Tuning Constants</h3>
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Base buy rate</span><span>40% of customers</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Per concession worker bonus</span><span>+10%</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Max buy rate cap</span><span>85%</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Price demand curve</span><span>Overpricing sharply reduces sales</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Discounting effect</span><span>Up to 1.4x sales at 80% base price</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Stock required</span><span>Items with 0 stock cannot sell</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Storage per stand level</span><span>+50 per upgrade</span></div>
          <div className="flex justify-between py-1 border-b border-slate-800/30"><span className="text-slate-500">Starting storage</span><span>100 units</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">Unlock gates</span><span>Screens + workers</span></div>
        </div>
      </section>
    </div>
  );
}
