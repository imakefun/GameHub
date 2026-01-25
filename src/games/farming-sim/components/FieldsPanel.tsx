import { useState } from 'react';
import type { Field, Crop, Resources, Inventory, SlotType } from '../types';
import { getPremiumSlotCost } from '../hooks/useGameState';

interface FieldsPanelProps {
  fields: Field[];
  crops: Crop[];
  resources: Resources;
  inventory: Inventory;
  playerLevel: number;
  onPlant: (fieldId: string, cropId: string) => void;
  onHarvest: (fieldId: string) => void;
  onBuySlot: (slotType: SlotType, slotIndex: number) => void;
}

export function FieldsPanel({
  fields,
  crops,
  resources,
  inventory: _inventory,
  playerLevel,
  onPlant,
  onHarvest,
  onBuySlot,
}: FieldsPanelProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const getGrowthProgress = (field: Field, crop: Crop | undefined) => {
    if (!field.plantedAt || !crop) return 0;
    const elapsed = (Date.now() - field.plantedAt) / 1000;
    return Math.min(100, (elapsed / crop.growthTime) * 100);
  };

  return (
    <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🌱</span> Fields
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {fields.map((field, index) => {
          const crop = crops.find(c => c.id === field.cropId);
          const progress = getGrowthProgress(field, crop);
          const premiumCost = getPremiumSlotCost('field', index);
          const isPremiumSlot = premiumCost !== undefined;
          const canAffordSlot = premiumCost !== undefined && resources.money >= premiumCost;

          if (!field.unlocked) {
            return (
              <div
                key={field.id}
                className={`
                  relative aspect-square rounded-lg border-2
                  ${isPremiumSlot
                    ? 'bg-amber-900/50 border-amber-600 cursor-pointer hover:bg-amber-800/50'
                    : 'bg-gray-800 border-gray-700 opacity-50'
                  }
                `}
                onClick={() => {
                  if (isPremiumSlot && canAffordSlot) {
                    onBuySlot('field', index);
                  }
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isPremiumSlot ? (
                    <>
                      <span className="text-2xl">💰</span>
                      <span className="text-xs text-amber-300 font-bold">
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
                      <span className="text-2xl text-gray-600">🔒</span>
                      <span className="text-xs text-gray-500">Level up</span>
                    </>
                  )}
                </div>
                <div className="absolute top-1 left-1 text-xs text-gray-500">
                  #{index + 1}
                </div>
              </div>
            );
          }

          return (
            <div
              key={field.id}
              onClick={() => {
                if (field.isReady) {
                  onHarvest(field.id);
                } else if (!field.cropId) {
                  setSelectedField(selectedField === field.id ? null : field.id);
                }
              }}
              className={`
                relative aspect-square rounded-lg cursor-pointer transition-all
                ${field.cropId
                  ? field.isReady
                    ? 'bg-yellow-600 hover:bg-yellow-500 animate-pulse'
                    : 'bg-amber-700'
                  : 'bg-amber-800 hover:bg-amber-700 border-2 border-dashed border-amber-600'
                }
                ${selectedField === field.id ? 'ring-2 ring-white' : ''}
              `}
            >
              {field.cropId && crop ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl">{crop.emoji}</span>
                  {!field.isReady && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="h-1.5 bg-amber-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {field.isReady && (
                    <span className="text-xs text-white font-bold mt-1">Ready!</span>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl text-amber-600">+</span>
                </div>
              )}
              <div className="absolute top-1 left-1 text-xs text-amber-300">
                #{index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Crop Selection */}
      {selectedField && (
        <div className="mt-4 p-3 bg-amber-900/50 rounded-lg">
          <h3 className="text-sm font-bold text-amber-200 mb-2">Select Seed:</h3>
          <div className="grid grid-cols-3 gap-2">
            {crops.map(crop => {
              const canAfford = resources.money >= crop.seedCost;
              const isUnlocked = crop.unlockLevel <= playerLevel;
              return (
                <button
                  key={crop.id}
                  onClick={() => {
                    if (canAfford && isUnlocked) {
                      onPlant(selectedField, crop.id);
                      setSelectedField(null);
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
                      Lv.{crop.unlockLevel}
                    </div>
                  )}
                  <span className="text-xl block">{isUnlocked ? crop.emoji : '🔒'}</span>
                  <span className="text-xs block">{crop.name}</span>
                  <span className="text-xs block text-amber-300">${crop.seedCost}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 text-xs text-amber-300 flex items-center gap-4">
        <span>Tap empty field to plant</span>
        <span>Tap ready crop to harvest</span>
      </div>
    </div>
  );
}
