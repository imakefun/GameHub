import type { Inventory, Product } from '../types';

interface InventoryPanelProps {
  inventory: Inventory;
  products: Product[];
}

export function InventoryPanel({ inventory, products }: InventoryPanelProps) {
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

  return (
    <div className="bg-gradient-to-b from-indigo-800 to-indigo-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🎒</span> Inventory
      </h2>

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
