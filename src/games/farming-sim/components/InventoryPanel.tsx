import type { Inventory, Product, Resources } from '../types';
import {
  getStorageCapacity,
  getStorageUpgradeCost,
  getNextStorageUpgradeAmount,
  getTotalInventoryCount,
  STORAGE_MAX_LEVEL,
} from '../hooks/useGameState';

interface InventoryPanelProps {
  inventory: Inventory;
  products: Product[];
  storageLevel: number;
  resources: Resources;
  onUpgradeStorage: () => void;
}

export function InventoryPanel({
  inventory,
  products,
  storageLevel,
  resources,
  onUpgradeStorage,
}: InventoryPanelProps) {
  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return {
      name: product?.name || productId,
      emoji: product?.emoji || '📦',
      value: product?.baseValue || 0,
      category: product?.category || 'unknown',
      tier: product?.tier || 1,
    };
  };

  const inventoryItems = Object.entries(inventory)
    .filter(([_, amount]) => amount > 0)
    .map(([itemId, amount]) => ({
      itemId,
      amount,
      ...getProductInfo(itemId),
    }))
    .sort((a, b) => {
      // Sort by category, then tier, then name
      if (a.category !== b.category) {
        const categoryOrder = ['crop', 'fruit', 'animal', 'processed'];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      }
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.name.localeCompare(b.name);
    });

  const categoryLabels: Record<string, { label: string; emoji: string }> = {
    crop: { label: 'Crops', emoji: '🌱' },
    fruit: { label: 'Fruits', emoji: '🍎' },
    animal: { label: 'Animal Products', emoji: '🥚' },
    processed: { label: 'Processed Goods', emoji: '🏭' },
  };

  const groupedItems = inventoryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof inventoryItems>);

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.value * item.amount, 0);

  // Storage calculations
  const currentCount = getTotalInventoryCount(inventory);
  const capacity = getStorageCapacity(storageLevel);
  const upgradeCost = getStorageUpgradeCost(storageLevel);
  const nextUpgradeAmount = getNextStorageUpgradeAmount(storageLevel);
  const canUpgrade = upgradeCost !== undefined && resources.money >= upgradeCost;
  const isMaxLevel = storageLevel >= STORAGE_MAX_LEVEL;
  const isFull = currentCount >= capacity;
  const storagePercent = Math.min((currentCount / capacity) * 100, 100);

  return (
    <div className="bg-gradient-to-b from-indigo-800 to-indigo-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🎒</span> Inventory
      </h2>

      {/* Storage Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="text-indigo-200">
            Storage: <span className={isFull ? 'text-red-400 font-bold' : 'text-white font-medium'}>
              {currentCount}/{capacity}
            </span>
          </span>
          <span className="text-indigo-300 text-xs">Lv.{storageLevel}</span>
        </div>
        <div className="h-2 bg-indigo-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isFull ? 'bg-red-500' : storagePercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      {/* Upgrade Button */}
      {!isMaxLevel && (
        <button
          onClick={onUpgradeStorage}
          disabled={!canUpgrade}
          className={`w-full mb-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            canUpgrade
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-indigo-700/50 text-indigo-400 cursor-not-allowed'
          }`}
        >
          <span>📦</span>
          <span>Upgrade Storage (+{nextUpgradeAmount})</span>
          <span className="text-yellow-300">${upgradeCost?.toLocaleString()}</span>
        </button>
      )}
      {isMaxLevel && (
        <div className="w-full mb-3 py-2 px-3 rounded-lg text-sm text-center bg-indigo-700/30 text-indigo-300">
          📦 Storage Maxed Out!
        </div>
      )}

      <div className="text-sm text-indigo-200 mb-4">
        Total value: <span className="text-yellow-300 font-bold">${totalValue.toLocaleString()}</span>
      </div>

      {inventoryItems.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">📦</span>
          <span className="text-indigo-200">Inventory is empty</span>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(groupedItems).map(([category, items]) => {
            const catInfo = categoryLabels[category] || { label: category, emoji: '📦' };
            return (
              <div key={category}>
                <div className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-1">
                  <span>{catInfo.emoji}</span>
                  <span>{catInfo.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {items.map(item => (
                    <div
                      key={item.itemId}
                      className="relative p-2 bg-indigo-700/50 rounded-lg text-center"
                      title={`${item.name}: $${item.value} each`}
                    >
                      <span className="text-2xl block">{item.emoji}</span>
                      <span className="text-xs text-white font-medium">{item.amount}</span>
                      <div className="absolute top-0.5 right-0.5 text-xs text-indigo-300">
                        {'★'.repeat(item.tier)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
