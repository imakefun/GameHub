import { useState } from 'react';
import type { AnimalPen, Animal, Resources, Inventory, Product, SlotType } from '../types';
import { getPremiumSlotCost, getRequiredLevelForSlot } from '../hooks/useGameState';

interface BarnPanelProps {
  pens: AnimalPen[];
  animals: Animal[];
  products: Product[];
  resources: Resources;
  inventory: Inventory;
  playerLevel: number;
  onBuyAnimal: (penId: string, animalId: string) => void;
  onSellAnimal: (penId: string) => void;
  onCollect: (penId: string) => void;
  onFeed: (penId: string) => void;
  onBuySlot: (slotType: SlotType, slotIndex: number) => void;
  onSwapAnimals: (penId1: string, penId2: string) => void;
}

export function BarnPanel({
  pens,
  animals,
  products,
  resources,
  inventory,
  playerLevel,
  onBuyAnimal,
  onSellAnimal,
  onCollect,
  onFeed,
  onBuySlot,
  onSwapAnimals,
}: BarnPanelProps) {
  const [selectedPen, setSelectedPen] = useState<string | null>(null);
  const [draggedPen, setDraggedPen] = useState<string | null>(null);
  const [dragOverPen, setDragOverPen] = useState<string | null>(null);
  const [confirmSellPen, setConfirmSellPen] = useState<string | null>(null);

  const getProductionProgress = (pen: AnimalPen, animal: Animal | undefined) => {
    if (!pen.lastProducedAt || !animal) return 0;
    if (!pen.isFed && animal.feedType !== 'none') return 0;
    const elapsed = (Date.now() - pen.lastProducedAt) / 1000;
    return Math.min(100, (elapsed / animal.productionTime) * 100);
  };

  const getFeedInfo = (feedType: string) => {
    const product = products.find(p => p.id === feedType);
    return product ? { name: product.name, emoji: product.emoji } : { name: feedType, emoji: '🌾' };
  };

  return (
    <div className="bg-gradient-to-b from-red-800 to-red-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏠</span> Barn
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {pens.map((pen, index) => {
          const animal = animals.find(a => a.id === pen.animalId);
          const progress = getProductionProgress(pen, animal);
          const feedInfo = animal ? getFeedInfo(animal.feedType) : null;
          const hasFeed = animal && animal.feedType !== 'none'
            ? (inventory[animal.feedType] || 0) >= animal.feedAmount
            : true;
          const premiumCost = getPremiumSlotCost('pen', index);
          const isPremiumSlot = premiumCost !== undefined;
          const canAffordSlot = premiumCost !== undefined && resources.money >= premiumCost;

          if (!pen.unlocked) {
            const requiredLevel = getRequiredLevelForSlot('pen', index);
            return (
              <div
                key={pen.id}
                className={`
                  p-3 rounded-lg border-2
                  ${isPremiumSlot
                    ? 'bg-red-900/50 border-red-600 cursor-pointer hover:bg-red-800/50'
                    : 'bg-gray-800 border-gray-700 opacity-50'
                  }
                `}
                onClick={() => {
                  if (isPremiumSlot && canAffordSlot) {
                    onBuySlot('pen', index);
                  }
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Pen #{index + 1}</div>
                <div className="flex flex-col items-center justify-center h-20">
                  {isPremiumSlot ? (
                    <>
                      <span className="text-3xl">💰</span>
                      <span className="text-xs text-red-300 font-bold">
                        ${premiumCost.toLocaleString()}
                      </span>
                      {canAffordSlot ? (
                        <span className="text-xs text-green-400 mt-1">Click to buy</span>
                      ) : (
                        <span className="text-xs text-red-400 mt-1">Need more $</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-3xl text-gray-600">🔒</span>
                      {requiredLevel && (
                        <span className="text-xs text-gray-500">Lv.{requiredLevel}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={pen.id}
              draggable={!!pen.animalId}
              onDragStart={(e) => {
                if (pen.animalId) {
                  setDraggedPen(pen.id);
                  e.dataTransfer.effectAllowed = 'move';
                }
              }}
              onDragEnd={() => {
                setDraggedPen(null);
                setDragOverPen(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedPen && draggedPen !== pen.id && pen.unlocked) {
                  setDragOverPen(pen.id);
                }
              }}
              onDragLeave={() => setDragOverPen(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedPen && draggedPen !== pen.id && pen.unlocked) {
                  onSwapAnimals(draggedPen, pen.id);
                }
                setDraggedPen(null);
                setDragOverPen(null);
              }}
              className={`
                relative p-3 rounded-lg transition-all
                ${dragOverPen === pen.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-red-900' : ''}
                ${draggedPen === pen.id ? 'opacity-50' : ''}
                ${pen.animalId
                  ? pen.isReady
                    ? 'bg-yellow-600 animate-pulse cursor-grab'
                    : !pen.isFed && animal?.feedType !== 'none'
                      ? 'bg-orange-700 cursor-grab'
                      : 'bg-red-700 cursor-grab'
                  : 'bg-red-800 border-2 border-dashed border-red-600 cursor-pointer hover:bg-red-700'
                }
              `}
              onClick={() => {
                if (!pen.animalId) {
                  setSelectedPen(selectedPen === pen.id ? null : pen.id);
                }
              }}
            >
              <div className="text-xs text-red-300 mb-1">Pen #{index + 1}</div>

              {pen.animalId && animal ? (
                <div className="flex flex-col items-center">
                  {/* Sell button - top right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmSellPen(pen.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-800/80 hover:bg-red-700 text-red-200 rounded text-xs"
                    title={`Sell for $${Math.floor(animal.purchaseCost * 0.5)}`}
                  >
                    ✕
                  </button>

                  <span className="text-4xl mb-1">{animal.emoji}</span>
                  <span className="text-sm text-white font-medium">{animal.name}</span>

                  {/* Feed status indicator */}
                  {animal.feedType !== 'none' && (
                    <div className={`text-xs mt-1 px-2 py-0.5 rounded ${pen.isFed ? 'bg-green-600' : 'bg-orange-600'}`}>
                      {pen.isFed ? 'Fed' : 'Hungry!'}
                    </div>
                  )}

                  {/* Progress bar */}
                  {pen.isFed && !pen.isReady && (
                    <div className="w-full mt-2">
                      <div className="h-2 bg-red-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    {pen.isReady ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCollect(pen.id);
                        }}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 rounded text-sm font-bold"
                      >
                        Collect!
                      </button>
                    ) : !pen.isFed && animal.feedType !== 'none' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFeed(pen.id);
                        }}
                        disabled={!hasFeed}
                        className={`
                          px-2 py-1 rounded text-xs flex items-center gap-1
                          ${hasFeed
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        Feed {feedInfo?.emoji} x{animal.feedAmount}
                      </button>
                    ) : (
                      <span className="text-xs text-red-300">Producing...</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20">
                  <span className="text-3xl text-red-600">+</span>
                  <span className="text-xs text-red-400">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Animal Selection Modal */}
      {selectedPen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPen(null)}>
          <div className="bg-gradient-to-b from-red-800 to-red-900 rounded-lg p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-red-200">Buy Animal</h3>
              <button onClick={() => setSelectedPen(null)} className="text-red-300 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {animals.map(animal => {
                const canAfford = resources.money >= animal.purchaseCost;
                const isUnlocked = animal.unlockLevel <= playerLevel;
                const animalFeedInfo = getFeedInfo(animal.feedType);

                return (
                  <button
                    key={animal.id}
                    onClick={() => {
                      if (canAfford && isUnlocked) {
                        onBuyAnimal(selectedPen, animal.id);
                        setSelectedPen(null);
                      }
                    }}
                    disabled={!canAfford || !isUnlocked}
                    className={`
                      p-3 rounded-lg text-center transition-all relative
                      ${!isUnlocked
                        ? 'bg-gray-800 text-gray-500'
                        : canAfford
                          ? 'bg-green-700 hover:bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-1 right-1 text-xs bg-gray-700 px-1 rounded">
                        Lv.{animal.unlockLevel}
                      </div>
                    )}
                    <span className="text-2xl block">{isUnlocked ? animal.emoji : '🔒'}</span>
                    <span className="text-sm block font-medium">{animal.name}</span>
                    <span className="text-xs block text-amber-300">${animal.purchaseCost}</span>
                    {isUnlocked && animal.feedType !== 'none' && (
                      <span className="text-xs block text-red-300">
                        Needs: {animalFeedInfo.emoji}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sell Confirmation Modal */}
      {confirmSellPen && (() => {
        const pen = pens.find(p => p.id === confirmSellPen);
        const animal = pen ? animals.find(a => a.id === pen.animalId) : null;
        if (!animal) return null;
        const sellPrice = Math.floor(animal.purchaseCost * 0.5);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setConfirmSellPen(null)}>
            <div className="bg-gradient-to-b from-red-800 to-red-900 rounded-lg p-4 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
              <span className="text-5xl block mb-3">{animal.emoji}</span>
              <h3 className="text-lg font-bold text-white mb-2">Sell {animal.name}?</h3>
              <p className="text-red-200 text-sm mb-4">
                You will receive <span className="text-amber-300 font-bold">${sellPrice}</span>
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmSellPen(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSellAnimal(confirmSellPen);
                    setConfirmSellPen(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
