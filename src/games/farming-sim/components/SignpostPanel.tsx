import type { Order, Product, Inventory } from '../types';

interface SignpostPanelProps {
  orders: Order[];
  products: Product[];
  inventory: Inventory;
  lastRefresh: number;
  refreshInterval: number;
  onComplete: (orderId: string) => void;
  onDismiss: (orderId: string) => void;
}

export function SignpostPanel({
  orders,
  products,
  inventory,
  lastRefresh,
  refreshInterval,
  onComplete,
  onDismiss,
}: SignpostPanelProps) {
  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return {
      name: product?.name || productId,
      emoji: product?.emoji || '📦',
    };
  };

  const canCompleteOrder = (order: Order) => {
    return order.items.every(item =>
      (inventory[item.itemId] || 0) >= item.amount
    );
  };

  const getTimeRemaining = (order: Order) => {
    const elapsed = (Date.now() - order.createdAt) / 1000;
    const remaining = order.timeLimit - elapsed;
    if (remaining <= 0) return 'Expired';
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuickCompletion = (order: Order) => {
    const elapsed = (Date.now() - order.createdAt) / 1000;
    return elapsed < order.timeLimit / 2;
  };

  const getRefreshCountdown = () => {
    const elapsed = (Date.now() - lastRefresh) / 1000;
    const remaining = Math.max(0, refreshInterval - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-amber-700 to-amber-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🪧</span> Orders
        </h2>
        <div className="text-xs bg-amber-900 px-2 py-1 rounded text-amber-200">
          New orders in: {getRefreshCountdown()}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl block mb-2">📭</span>
          <span className="text-amber-200 text-sm">No orders yet...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {orders.map(order => {
            const canComplete = canCompleteOrder(order);
            const quick = isQuickCompletion(order);
            const timeRemaining = getTimeRemaining(order);

            return (
              <div
                key={order.id}
                className={`
                  p-2 rounded-lg text-xs
                  ${canComplete ? 'bg-green-700' : 'bg-amber-900/50'}
                `}
              >
                {/* Customer & Timer Row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-base flex-shrink-0">{order.customerEmoji}</span>
                    <span className="text-white font-medium text-xs">{order.customerName}</span>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded text-xs flex-shrink-0 ${
                    timeRemaining === 'Expired' ? 'bg-red-600' : 'bg-amber-600'
                  }`}>
                    {timeRemaining}
                  </div>
                </div>

                {/* Items requested */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {order.items.map((item, i) => {
                    const info = getProductInfo(item.itemId);
                    const have = inventory[item.itemId] || 0;
                    const hasEnough = have >= item.amount;

                    return (
                      <div
                        key={i}
                        className={`
                          px-1.5 py-0.5 rounded text-xs
                          ${hasEnough ? 'bg-green-600 text-white' : 'bg-red-600/50 text-red-200'}
                        `}
                        title={`${info.name} (have ${have})`}
                      >
                        {info.emoji}{item.amount}
                      </div>
                    );
                  })}
                </div>

                {/* Reward & Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-yellow-300 font-bold">${order.reward}</span>
                    {quick && (
                      <span className="text-green-300 ml-1">+${order.bonusReward}</span>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onDismiss(order.id)}
                      className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => onComplete(order.id)}
                      disabled={!canComplete}
                      className={`
                        px-2 py-0.5 rounded text-xs font-bold
                        ${canComplete
                          ? 'bg-green-500 hover:bg-green-400 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-xs text-amber-300 text-center">
        Complete orders quickly for bonus rewards!
      </div>
    </div>
  );
}
