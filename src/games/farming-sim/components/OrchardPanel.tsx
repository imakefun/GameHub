import { useState } from 'react';
import type { Orchard, Tree, Resources } from '../types';

interface OrchardPanelProps {
  orchards: Orchard[];
  trees: Tree[];
  resources: Resources;
  playerLevel: number;
  onPlantTree: (orchardId: string, treeId: string) => void;
  onHarvest: (orchardId: string) => void;
}

export function OrchardPanel({
  orchards,
  trees,
  resources,
  playerLevel,
  onPlantTree,
  onHarvest,
}: OrchardPanelProps) {
  const [selectedOrchard, setSelectedOrchard] = useState<string | null>(null);

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

          if (!orchard.unlocked) {
            return (
              <div
                key={orchard.id}
                className="p-3 rounded-lg bg-gray-800 border-2 border-gray-700 opacity-50"
              >
                <div className="text-xs text-gray-500 mb-1">Slot #{index + 1}</div>
                <div className="flex flex-col items-center justify-center h-20">
                  <span className="text-3xl text-gray-600">🔒</span>
                  <span className="text-xs text-gray-500">Locked</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={orchard.id}
              className={`
                relative p-3 rounded-lg transition-all
                ${orchard.treeId
                  ? orchard.isReady
                    ? 'bg-yellow-600 animate-pulse cursor-pointer'
                    : 'bg-emerald-700'
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

      {/* Tree Selection */}
      {selectedOrchard && (
        <div className="mt-4 p-3 bg-emerald-900/50 rounded-lg">
          <h3 className="text-sm font-bold text-emerald-200 mb-2">Plant Tree:</h3>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                      Lv.{tree.unlockLevel}
                    </div>
                  )}
                  <span className="text-xl block">{isUnlocked ? `${tree.emoji} ${tree.fruitEmoji}` : '🔒'}</span>
                  <span className="text-xs block">{tree.name}</span>
                  <span className="text-xs block text-amber-300">${tree.saplingCost}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
