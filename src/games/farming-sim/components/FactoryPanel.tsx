import { useState } from 'react';
import type { MachineSlot, Machine, Resources, Inventory, Product } from '../types';

interface FactoryPanelProps {
  machineSlots: MachineSlot[];
  machines: Machine[];
  products: Product[];
  resources: Resources;
  inventory: Inventory;
  onBuyMachine: (slotId: string, machineId: string) => void;
  onStartProcessing: (slotId: string, recipeIndex: number) => void;
  onCollect: (slotId: string) => void;
}

export function FactoryPanel({
  machineSlots,
  machines,
  products,
  resources,
  inventory,
  onBuyMachine,
  onStartProcessing,
  onCollect,
}: FactoryPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedMachineForRecipe, setSelectedMachineForRecipe] = useState<string | null>(null);

  const getProcessingProgress = (slot: MachineSlot, machine: Machine | undefined) => {
    if (!slot.startedAt || !machine || slot.currentRecipeIndex === null) return 0;
    const recipe = machine.recipes[slot.currentRecipeIndex];
    if (!recipe) return 0;
    const elapsed = (Date.now() - slot.startedAt) / 1000;
    return Math.min(100, (elapsed / recipe.processingTime) * 100);
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const getProductEmoji = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.emoji || '📦';
  };

  const canMakeRecipe = (machine: Machine, recipeIndex: number) => {
    const recipe = machine.recipes[recipeIndex];
    if (!recipe) return false;
    if (resources.energy < machine.energyCost) return false;
    return recipe.inputs.every(input =>
      (inventory[input.itemId] || 0) >= input.amount
    );
  };

  return (
    <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏭</span> Factory
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {machineSlots.map((slot, index) => {
          const machine = machines.find(m => m.id === slot.machineId);
          const progress = getProcessingProgress(slot, machine);

          return (
            <div
              key={slot.id}
              className={`
                relative p-3 rounded-lg transition-all
                ${slot.machineId
                  ? slot.isReady
                    ? 'bg-yellow-600 animate-pulse'
                    : slot.isProcessing
                      ? 'bg-slate-600'
                      : 'bg-slate-600 cursor-pointer hover:bg-slate-500'
                  : 'bg-slate-700 border-2 border-dashed border-slate-500 cursor-pointer hover:bg-slate-600'
                }
              `}
              onClick={() => {
                if (!slot.machineId) {
                  setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
                  setSelectedMachineForRecipe(null);
                } else if (!slot.isProcessing && !slot.isReady) {
                  setSelectedMachineForRecipe(selectedMachineForRecipe === slot.id ? null : slot.id);
                  setSelectedSlot(null);
                }
              }}
            >
              <div className="text-xs text-slate-400 mb-1">Slot #{index + 1}</div>

              {slot.machineId && machine ? (
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{machine.emoji}</span>
                  <span className="text-sm text-white font-medium">{machine.name}</span>

                  {slot.isProcessing && slot.currentRecipeIndex !== null && (
                    <>
                      <div className="text-xs text-slate-300 mt-1">
                        Making {getProductEmoji(machine.recipes[slot.currentRecipeIndex].output.itemId)}
                      </div>
                      <div className="w-full mt-2">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {slot.isReady && slot.currentRecipeIndex !== null && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCollect(slot.id);
                      }}
                      className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 rounded text-sm font-bold"
                    >
                      Collect {getProductEmoji(machine.recipes[slot.currentRecipeIndex].output.itemId)}
                    </button>
                  )}

                  {!slot.isProcessing && !slot.isReady && (
                    <span className="text-xs text-slate-400 mt-1">Tap to use</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-16">
                  <span className="text-3xl text-slate-500">+</span>
                  <span className="text-xs text-slate-400">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Machine Selection */}
      {selectedSlot && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Buy Machine:</h3>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {machines.map(machine => {
              const canAfford = resources.money >= machine.purchaseCost;
              return (
                <button
                  key={machine.id}
                  onClick={() => {
                    if (canAfford) {
                      onBuyMachine(selectedSlot, machine.id);
                      setSelectedSlot(null);
                    }
                  }}
                  disabled={!canAfford}
                  className={`
                    p-2 rounded-lg text-center transition-all
                    ${canAfford
                      ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <span className="text-xl block">{machine.emoji}</span>
                  <span className="text-xs block">{machine.name}</span>
                  <span className="text-xs block text-amber-300">${machine.purchaseCost}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recipe Selection */}
      {selectedMachineForRecipe && (() => {
        const slot = machineSlots.find(s => s.id === selectedMachineForRecipe);
        const machine = slot ? machines.find(m => m.id === slot.machineId) : null;
        if (!machine) return null;

        return (
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
            <h3 className="text-sm font-bold text-slate-200 mb-2">Select Recipe:</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {machine.recipes.map((recipe, recipeIndex) => {
                const canMake = canMakeRecipe(machine, recipeIndex);
                return (
                  <button
                    key={recipeIndex}
                    onClick={() => {
                      if (canMake) {
                        onStartProcessing(selectedMachineForRecipe, recipeIndex);
                        setSelectedMachineForRecipe(null);
                      }
                    }}
                    disabled={!canMake}
                    className={`
                      w-full p-2 rounded-lg text-left transition-all
                      ${canMake
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {recipe.inputs.map((input, i) => (
                          <span key={i} className="text-sm">
                            {getProductEmoji(input.itemId)}×{input.amount}
                            {i < recipe.inputs.length - 1 && ' +'}
                          </span>
                        ))}
                        <span className="mx-1">→</span>
                        <span className="text-sm">
                          {getProductEmoji(recipe.output.itemId)}×{recipe.output.amount}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300">⚡{machine.energyCost}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      {getProductName(recipe.output.itemId)} ({recipe.processingTime}s)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
