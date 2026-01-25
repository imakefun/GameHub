import { useState } from 'react';
import type { Orchard, Tree, Resources, SlotType } from '../types';
import { getPremiumSlotCost, getRequiredLevelForSlot } from '../hooks/useGameState';

interface OrchardPanelProps {
  orchards: Orchard[];
  trees: Tree[];
  resources: Resources;
  playerLevel: number;
  onPlantTree: (orchardId: string, treeId: string) => void;
  onSellTree: (orchardId: string) => void;
  onHarvest: (orchardId: string) => void;
  onBuySlot: (slotType: SlotType, slotIndex: number) => void;
  onSwapTrees: (orchardId1: string, orchardId2: string) => void;
}

export function OrchardPanel({
  orchards,
  trees,
  resources,
  playerLevel,
  onPlantTree,
  onSellTree,
  onHarvest,
  onBuySlot,
  onSwapTrees,
}: OrchardPanelProps) {
  const [selectedOrchard, setSelectedOrchard] = useState<string | null>(null);
  const [draggedOrchard, setDraggedOrchard] = useState<string | null>(null);
  const [dragOverOrchard, setDragOverOrchard] = useState<string | null>(null);

  const getGrowthProgress = (orchard: Orchard, tree: Tree | undefined) => {
    if (!orchard.plantedAt || !tree) return 0;
    const elapsed = (Date.now() - orchard.plantedAt) / 1000;
    return Math.min(100, (elapsed / tree.growthTime) * 100);
  };

  const getHarvestProgress = (orchard: Orchard, tree: Tree | undefined) => {
    if (!orchard.isMature || !tree) return 0;
    if (!orchard.lastHarvestedAt) return 100; // Ready for first harvest
    const elapsed = (Date.now() - orchard.lastHarvestedAt) / 1000;
    return Math.min(100, (elapsed / tree.harvestTime) * 100);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🌳</span> Orchard
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {orchards.map((orchard, index) => {
          const tree = trees.find(t => t.id === orchard.treeId);
          const growthProgress = getGrowthProgress(orchard, tree);
          const harvestProgress = getHarvestProgress(orchard, tree);
          const premiumCost = getPremiumSlotCost('orchard', index);
          const isPremiumSlot = premiumCost !== undefined;
          const canAffordSlot = premiumCost !== undefined && resources.money >= premiumCost;

          if (!orchard.unlocked) {
            const requiredLevel = getRequiredLevelForSlot('orchard', index);
            return (
              <div
                key={orchard.id}
                className={`
                  p-3 rounded-lg border-2
                  ${isPremiumSlot
                    ? 'bg-emerald-900/50 border-emerald-600 cursor-pointer hover:bg-emerald-800/50'
                    : 'bg-gray-800 border-gray-700 opacity-50'
                  }
                `}
                onClick={() => {
                  if (isPremiumSlot && canAffordSlot) {
                    onBuySlot('orchard', index);
                  }
                }}
              >
                <div className="text-xs text-gray-500 mb-1">Slot #{index + 1}</div>
                <div className="flex flex-col items-center justify-center h-20">
                  {isPremiumSlot ? (
                    <>
                      <span className="text-3xl">💰</span>
                      <span className="text-xs text-emerald-300 font-bold">
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
              key={orchard.id}
              draggable={!!orchard.treeId}
              onDragStart={(e) => {
                if (orchard.treeId) {
                  setDraggedOrchard(orchard.id);
                  e.dataTransfer.effectAllowed = 'move';
                }
              }}
              onDragEnd={() => {
                setDraggedOrchard(null);
                setDragOverOrchard(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedOrchard && draggedOrchard !== orchard.id && orchard.unlocked) {
                  setDragOverOrchard(orchard.id);
                }
              }}
              onDragLeave={() => setDragOverOrchard(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedOrchard && draggedOrchard !== orchard.id && orchard.unlocked) {
                  onSwapTrees(draggedOrchard, orchard.id);
                }
                setDraggedOrchard(null);
                setDragOverOrchard(null);
              }}
              className={`
                relative p-3 rounded-lg transition-all
                ${dragOverOrchard === orchard.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-emerald-900' : ''}
                ${draggedOrchard === orchard.id ? 'opacity-50' : ''}
                ${orchard.treeId
                  ? orchard.isReady
                    ? 'bg-yellow-600 animate-pulse cursor-grab'
                    : 'bg-emerald-700 cursor-grab'
                  : 'bg-emerald-800 border-2 border-dashed border-emerald-600 cursor-pointer hover:bg-emerald-700'
                }
              `}
              onClick={() => {
                if (orchard.isReady) {
                  onHarvest(orchard.id);
                } else if (!orchard.treeId) {
                  setSelectedOrchard(selectedOrchard === orchard.id ? null : orchard.id);
                }
              }}
            >
              <div className="text-xs text-emerald-300 mb-1">Slot #{index + 1}</div>

              {orchard.treeId && tree ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <span className="text-4xl">{tree.emoji}</span>
                    {orchard.isReady && (
                      <span className="absolute -top-1 -right-2 text-xl">{tree.fruitEmoji}</span>
                    )}
                  </div>
                  <span className="text-sm text-white font-medium">{tree.name}</span>

                  {!orchard.isMature ? (
                    <div className="w-full mt-2">
                      <div className="text-xs text-emerald-300 text-center mb-1">Growing...</div>
                      <div className="h-2 bg-emerald-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 transition-all"
                          style={{ width: `${growthProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : !orchard.isReady ? (
                    <div className="w-full mt-2">
                      <div className="text-xs text-emerald-300 text-center mb-1">Fruiting...</div>
                      <div className="h-2 bg-emerald-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${harvestProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-300 font-bold mt-1">Harvest!</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSellTree(orchard.id);
                    }}
                    className="mt-2 px-2 py-1 bg-red-800 hover:bg-red-700 text-red-200 rounded text-xs"
                    title={`Sell for $${Math.floor(tree.saplingCost * 0.5)}`}
                  >
                    Sell
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20">
                  <span className="text-3xl text-emerald-600">+</span>
                  <span className="text-xs text-emerald-400">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tree Selection Modal */}
      {selectedOrchard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrchard(null)}>
          <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-lg p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-emerald-200">Plant Tree</h3>
              <button onClick={() => setSelectedOrchard(null)} className="text-emerald-300 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trees.map(tree => {
                const canAfford = resources.money >= tree.saplingCost;
                const isUnlocked = tree.unlockLevel <= playerLevel;
                return (
                  <button
                    key={tree.id}
                    onClick={() => {
                      if (canAfford && isUnlocked) {
                        onPlantTree(selectedOrchard, tree.id);
                        setSelectedOrchard(null);
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
                        Lv.{tree.unlockLevel}
                      </div>
                    )}
                    <span className="text-2xl block">{isUnlocked ? `${tree.emoji}` : '🔒'}</span>
                    <span className="text-sm block font-medium">{tree.name}</span>
                    <span className="text-xs block text-amber-300">${tree.saplingCost}</span>
                    {isUnlocked && (
                      <span className="text-xs block text-emerald-300">Yields: {tree.fruitEmoji}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
