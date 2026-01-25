import { useState } from 'react';
import type { AnimalPen, Animal, Resources, Inventory, Product, SlotType } from '../types';
import { getPremiumSlotCost } from '../hooks/useGameState';

interface BarnPanelProps {
  pens: AnimalPen[];
  animals: Animal[];
  products: Product[];
  resources: Resources;
  inventory: Inventory;
  playerLevel: number;
  onBuyAnimal: (penId: string, animalId: string) => void;
  onCollect: (penId: string) => void;
  onFeed: (penId: string) => void;
  onBuySlot: (slotType: SlotType, slotIndex: number) => void;
}

export function BarnPanel({
  pens,
  animals,
  products,
  resources,
  inventory,
  playerLevel,
  onBuyAnimal,
  onCollect,
  onFeed,
  onBuySlot,
}: BarnPanelProps) {
  const [selectedPen, setSelectedPen] = useState<string | null>(null);

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
                      <span className="text-xs text-gray-500">Level up</span>
                    </>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={pen.id}
              className={`
                relative p-3 rounded-lg transition-all
                ${pen.animalId
                  ? pen.isReady
                    ? 'bg-yellow-600 animate-pulse'
                    : !pen.isFed && animal?.feedType !== 'none'
                      ? 'bg-orange-700'
                      : 'bg-red-700'
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

                  <div className="flex gap-2 mt-2">
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

      {/* Animal Selection */}
      {selectedPen && (
        <div className="mt-4 p-3 bg-red-900/50 rounded-lg">
          <h3 className="text-sm font-bold text-red-200 mb-2">Buy Animal:</h3>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                    p-2 rounded-lg text-center transition-all relative
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
                  <span className="text-xs block">{animal.name}</span>
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
      )}
    </div>
  );
}
