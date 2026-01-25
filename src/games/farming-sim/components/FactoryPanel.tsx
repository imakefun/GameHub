import { useState } from 'react';
import type { MachineSlot, Machine, Resources, Inventory, Product, SlotType } from '../types';
import { getPremiumSlotCost, getRequiredLevelForSlot } from '../hooks/useGameState';

interface FactoryPanelProps {
  machineSlots: MachineSlot[];
  machines: Machine[];
  products: Product[];
  resources: Resources;
  inventory: Inventory;
  playerLevel: number;
  onBuyMachine: (slotId: string, machineId: string) => void;
  onSellMachine: (slotId: string) => void;
  onStartProcessing: (slotId: string, recipeIndex: number) => void;
  onCollect: (slotId: string) => void;
  onBuySlot: (slotType: SlotType, slotIndex: number) => void;
  onSwapMachines: (slotId1: string, slotId2: string) => void;
}

export function FactoryPanel({
  machineSlots,
  machines,
  products,
  resources,
  inventory,
  playerLevel,
  onBuyMachine,
  onSellMachine,
  onStartProcessing,
  onCollect,
  onBuySlot,
  onSwapMachines,
}: FactoryPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedMachineForRecipe, setSelectedMachineForRecipe] = useState<string | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

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
          const premiumCost = getPremiumSlotCost('machine', index);
          const isPremiumSlot = premiumCost !== undefined;
          const canAffordSlot = premiumCost !== undefined && resources.money >= premiumCost;

          if (!slot.unlocked) {
            const requiredLevel = getRequiredLevelForSlot('machine', index);
            return (
              <div
                key={slot.id}
                className={`
                  p-3 rounded-lg border-2
                  ${isPremiumSlot
                    ? 'bg-slate-800/50 border-slate-500 cursor-pointer hover:bg-slate-700/50'
                    : 'bg-gray-800 border-gray-700 opacity-50'
                  }
                `}
                onClick={() => {
                  if (isPremiumSlot && canAffordSlot) {
                    onBuySlot('machine', index);
                  }
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Slot #{index + 1}</div>
                <div className="flex flex-col items-center justify-center h-16">
                  {isPremiumSlot ? (
                    <>
                      <span className="text-3xl">💰</span>
                      <span className="text-xs text-slate-300 font-bold">
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
              key={slot.id}
              draggable={!!slot.machineId && !slot.isProcessing}
              onDragStart={(e) => {
                if (slot.machineId && !slot.isProcessing) {
                  setDraggedSlot(slot.id);
                  e.dataTransfer.effectAllowed = 'move';
                }
              }}
              onDragEnd={() => {
                setDraggedSlot(null);
                setDragOverSlot(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedSlot && draggedSlot !== slot.id && slot.unlocked) {
                  setDragOverSlot(slot.id);
                }
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedSlot && draggedSlot !== slot.id && slot.unlocked) {
                  onSwapMachines(draggedSlot, slot.id);
                }
                setDraggedSlot(null);
                setDragOverSlot(null);
              }}
              className={`
                relative p-3 rounded-lg transition-all
                ${dragOverSlot === slot.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : ''}
                ${draggedSlot === slot.id ? 'opacity-50' : ''}
                ${slot.machineId
                  ? slot.isReady
                    ? 'bg-yellow-600 animate-pulse cursor-grab'
                    : slot.isProcessing
                      ? 'bg-slate-600'
                      : 'bg-slate-600 cursor-grab hover:bg-slate-500'
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
                    <div className="flex gap-2 mt-1 flex-wrap justify-center">
                      <span className="text-xs text-slate-400">Tap to use</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSellMachine(slot.id);
                        }}
                        className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-red-200 rounded text-xs"
                        title={`Sell for $${Math.floor(machine.purchaseCost * 0.5)}`}
                      >
                        Sell
                      </button>
                    </div>
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

      {/* Machine Selection Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSlot(null)}>
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-200">Buy Machine</h3>
              <button onClick={() => setSelectedSlot(null)} className="text-slate-300 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {machines.map(machine => {
                const canAfford = resources.money >= machine.purchaseCost;
                const isUnlocked = machine.unlockLevel <= playerLevel;
                return (
                  <button
                    key={machine.id}
                    onClick={() => {
                      if (canAfford && isUnlocked) {
                        onBuyMachine(selectedSlot, machine.id);
                        setSelectedSlot(null);
                      }
                    }}
                    disabled={!canAfford || !isUnlocked}
                    className={`
                      p-3 rounded-lg text-center transition-all relative
                      ${!isUnlocked
                        ? 'bg-gray-800 text-gray-500'
                        : canAfford
                          ? 'bg-blue-700 hover:bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-1 right-1 text-xs bg-gray-700 px-1 rounded">
                        Lv.{machine.unlockLevel}
                      </div>
                    )}
                    <span className="text-2xl block">{isUnlocked ? machine.emoji : '🔒'}</span>
                    <span className="text-sm block font-medium">{machine.name}</span>
                    <span className="text-xs block text-amber-300">${machine.purchaseCost}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Selection Modal */}
      {selectedMachineForRecipe && (() => {
        const slot = machineSlots.find(s => s.id === selectedMachineForRecipe);
        const machine = slot ? machines.find(m => m.id === slot.machineId) : null;
        if (!machine) return null;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMachineForRecipe(null)}>
            <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-200">{machine.emoji} {machine.name}</h3>
                <button onClick={() => setSelectedMachineForRecipe(null)} className="text-slate-300 hover:text-white text-xl">&times;</button>
              </div>
              <div className="space-y-2">
                {machine.recipes.map((recipe, recipeIndex) => {
                  const canMake = canMakeRecipe(machine, recipeIndex);
                  const isRecipeUnlocked = recipe.unlockLevel <= playerLevel;
                  return (
                    <button
                      key={recipeIndex}
                      onClick={() => {
                        if (canMake && isRecipeUnlocked) {
                          onStartProcessing(selectedMachineForRecipe, recipeIndex);
                          setSelectedMachineForRecipe(null);
                        }
                      }}
                      disabled={!canMake || !isRecipeUnlocked}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all relative
                        ${!isRecipeUnlocked
                          ? 'bg-gray-800 text-gray-500'
                          : canMake
                            ? 'bg-blue-700 hover:bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {!isRecipeUnlocked && (
                        <div className="absolute top-1 right-1 text-xs bg-gray-700 px-1 rounded">
                          Lv.{recipe.unlockLevel}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 flex-wrap">
                          {recipe.inputs.map((input, i) => (
                            <span key={i} className="text-sm">
                              {isRecipeUnlocked ? getProductEmoji(input.itemId) : '?'}×{input.amount}
                              {i < recipe.inputs.length - 1 && ' +'}
                            </span>
                          ))}
                          <span className="mx-1">→</span>
                          <span className="text-sm">
                            {isRecipeUnlocked ? getProductEmoji(recipe.output.itemId) : '?'}×{recipe.output.amount}
                          </span>
                        </div>
                        <span className="text-xs text-slate-300">⚡{machine.energyCost}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {isRecipeUnlocked ? getProductName(recipe.output.itemId) : '???'} ({recipe.processingTime}s)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
