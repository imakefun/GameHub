import { useState } from 'react';
import type { AnimalPen, Animal, Resources } from '../types';

interface BarnPanelProps {
  pens: AnimalPen[];
  animals: Animal[];
  resources: Resources;
  onBuyAnimal: (penId: string, animalId: string) => void;
  onCollect: (penId: string) => void;
  onFeed: (penId: string) => void;
}

export function BarnPanel({
  pens,
  animals,
  resources,
  onBuyAnimal,
  onCollect,
  onFeed,
}: BarnPanelProps) {
  const [selectedPen, setSelectedPen] = useState<string | null>(null);

  const getProductionProgress = (pen: AnimalPen, animal: Animal | undefined) => {
    if (!pen.lastProducedAt || !animal) return 0;
    const elapsed = (Date.now() - pen.lastProducedAt) / 1000;
    return Math.min(100, (elapsed / animal.productionTime) * 100);
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

          return (
            <div
              key={pen.id}
              className={`
                relative p-3 rounded-lg transition-all
                ${pen.animalId
                  ? pen.isReady
                    ? 'bg-yellow-600 animate-pulse'
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

                  {!pen.isReady && (
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
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFeed(pen.id);
                        }}
                        disabled={resources.energy < animal.feedCost}
                        className={`
                          px-2 py-1 rounded text-xs
                          ${resources.energy >= animal.feedCost
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        Feed ⚡{animal.feedCost}
                      </button>
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
          <div className="grid grid-cols-2 gap-2">
            {animals.map(animal => {
              const canAfford = resources.money >= animal.purchaseCost;
              return (
                <button
                  key={animal.id}
                  onClick={() => {
                    if (canAfford) {
                      onBuyAnimal(selectedPen, animal.id);
                      setSelectedPen(null);
                    }
                  }}
                  disabled={!canAfford}
                  className={`
                    p-2 rounded-lg text-center transition-all
                    ${canAfford
                      ? 'bg-green-700 hover:bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <span className="text-2xl block">{animal.emoji}</span>
                  <span className="text-xs block">{animal.name}</span>
                  <span className="text-xs block text-amber-300">${animal.purchaseCost}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
