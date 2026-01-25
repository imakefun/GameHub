import type { Resources, Inventory } from '../types';
import { getStorageCapacity, getTotalInventoryCount } from '../hooks/useGameState';

interface ResourceBarProps {
  resources: Resources;
  maxEnergy: number;
  storageLevel: number;
  inventory: Inventory;
}

export function ResourceBar({ resources, maxEnergy, storageLevel, inventory }: ResourceBarProps) {
  const energyPercent = (resources.energy / maxEnergy) * 100;
  const currentStorage = getTotalInventoryCount(inventory);
  const maxStorage = getStorageCapacity(storageLevel);
  const storageFull = currentStorage >= maxStorage;

  return (
    <div className="bg-gradient-to-r from-amber-800 to-amber-700 p-3 rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Money */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div>
            <div className="text-xs text-amber-200 uppercase tracking-wide">Money</div>
            <div className="text-xl font-bold text-white">${resources.money.toLocaleString()}</div>
          </div>
        </div>

        {/* Storage */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <div>
            <div className="text-xs text-amber-200 uppercase tracking-wide">Storage</div>
            <div className={`text-lg font-bold ${storageFull ? 'text-red-400' : 'text-white'}`}>
              {currentStorage}/{maxStorage}
            </div>
          </div>
        </div>

        {/* Energy */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <div className="text-xs text-amber-200 uppercase tracking-wide">Energy</div>
            <div className="relative h-4 bg-amber-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-300"
                style={{ width: `${energyPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-900">
                {Math.floor(resources.energy)} / {maxEnergy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
