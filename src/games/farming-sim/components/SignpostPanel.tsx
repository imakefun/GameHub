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

  // Individual timer for shipments only (they have hour-long cycles)
  const getShipmentTimeRemaining = (order: Order) => {
    const elapsed = (Date.now() - order.createdAt) / 1000;
    const remaining = order.timeLimit - elapsed;
    if (remaining <= 0) return 'Expired';
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick completion bonus based on shared timer (first half of refresh period)
  const isQuickCompletion = () => {
    const elapsed = (Date.now() - lastRefresh) / 1000;
    return elapsed < refreshInterval / 2;
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
        <>
          {/* Shipments Section */}
          {orders.some(o => o.isShipment) && (
            <div className="mb-3">
              <h3 className="text-sm font-bold text-blue-200 mb-2 flex items-center gap-1">
                <span>🚛</span> Shipments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {orders.filter(o => o.isShipment).map(order => {
                  const canComplete = canCompleteOrder(order);
                  const timeRemaining = getShipmentTimeRemaining(order);

                  return (
                    <div
                      key={order.id}
                      onClick={() => canComplete && onComplete(order.id)}
                      className={`
                        relative p-2 rounded-lg text-xs border-2 transition-all
                        ${canComplete
                          ? 'bg-green-700 border-green-500 cursor-pointer hover:bg-green-600 hover:scale-[1.02]'
                          : 'bg-blue-900/50 border-blue-600'
                        }
                      `}
                    >
                      {/* Dismiss button - top right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(order.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs leading-none"
                      >
                        ✕
                      </button>

                      {/* Customer & Timer Row */}
                      <div className="flex items-center justify-between mb-1 pr-6">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-base flex-shrink-0">{order.customerEmoji}</span>
                          <span className="text-white font-medium text-xs">{order.customerName}</span>
                        </div>
                        <div className={`px-1.5 py-0.5 rounded text-xs flex-shrink-0 ${
                          timeRemaining === 'Expired' ? 'bg-red-600' : 'bg-blue-600'
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

                      {/* Reward */}
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-300 font-bold">${order.reward.toLocaleString()}</span>
                        {canComplete && (
                          <span className="text-green-200 text-xs">Tap to deliver</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Orders Section */}
          {orders.some(o => !o.isShipment) && (
            <>
              {orders.some(o => o.isShipment) && (
                <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-1">
                  <span>📋</span> Orders
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {orders.filter(o => !o.isShipment).map(order => {
                  const canComplete = canCompleteOrder(order);
                  const quick = isQuickCompletion();

                  return (
                    <div
                      key={order.id}
                      onClick={() => canComplete && onComplete(order.id)}
                      className={`
                        relative p-2 rounded-lg text-xs transition-all
                        ${canComplete
                          ? 'bg-green-700 cursor-pointer hover:bg-green-600 hover:scale-[1.02]'
                          : 'bg-amber-900/50'
                        }
                      `}
                    >
                      {/* Dismiss button - top right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(order.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs leading-none"
                      >
                        ✕
                      </button>

                      {/* Customer Row */}
                      <div className="flex items-center gap-1 mb-1 pr-6">
                        <span className="text-base flex-shrink-0">{order.customerEmoji}</span>
                        <span className="text-white font-medium text-xs">{order.customerName}</span>
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

                      {/* Reward */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-yellow-300 font-bold">${order.reward}</span>
                          {quick && (
                            <span className="text-green-300 ml-1">+${order.bonusReward}</span>
                          )}
                        </div>
                        {canComplete && (
                          <span className="text-green-200 text-xs">Tap to deliver</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-3 text-xs text-amber-300 text-center">
        Complete orders quickly for bonus rewards!
      </div>
    </div>
  );
}
