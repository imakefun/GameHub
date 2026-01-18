import { motion } from 'framer-motion';
import { Play, ArrowUp, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GeneratorState, Resources, Generator, Element } from '../types';
import type { GameSettings } from '../services/sheetsService';

interface GeneratorPanelProps {
  ownedGenerators: GeneratorState[];
  resources: Resources;
  generators: Generator[];
  elements: Record<string, Element>;
  settings: GameSettings;
  onProduce: (generatorId: string) => void;
  onUpgrade: (generatorId: string) => void;
  onUnlock: (generatorId: string) => void;
  onToggleAuto: (generatorId: string) => void;
}

function getUpgradeForLevel(level: number, settings: GameSettings) {
  const cost = Math.floor(settings.upgradeCostBase * Math.pow(settings.upgradeCostMultiplier, level - 1));
  const productionMultiplier = 1 + (level - 1) * 0.1;
  const cooldownMultiplier = Math.max(0.5, 1 - (level - 1) * 0.03);
  const energyMultiplier = 1 + (level - 1) * 0.05;
  return { level, cost, productionMultiplier, cooldownMultiplier, energyMultiplier };
}

export function GeneratorPanel({
  ownedGenerators,
  resources,
  generators,
  elements,
  settings,
  onProduce,
  onUpgrade,
  onUnlock,
  onToggleAuto,
}: GeneratorPanelProps) {
  const ownedIds = new Set(ownedGenerators.map((g) => g.generatorId));
  const lockedGenerators = generators.filter((g) => !ownedIds.has(g.id) && !g.unlocked);
  const getGeneratorById = (id: string) => generators.find((g) => g.id === id);
  const getElement = (id: string) => elements[id];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="text-2xl">⚙️</span> Generators
      </h2>

      {/* Owned Generators */}
      <div className="space-y-3">
        {ownedGenerators.map((gs) => {
          const generator = getGeneratorById(gs.generatorId);
          if (!generator) return null;

          const upgrade = getUpgradeForLevel(gs.level, settings);
          const nextUpgrade = gs.level < settings.maxGeneratorLevel ? getUpgradeForLevel(gs.level + 1, settings) : null;
          const cooldown = generator.baseCooldown * upgrade.cooldownMultiplier * 1000;
          const now = Date.now();
          const timeSinceProduced = now - gs.lastProduced;
          const canProduce = timeSinceProduced >= cooldown;
          const progress = Math.min(1, timeSinceProduced / cooldown);
          const energyCost = Math.floor(generator.baseEnergyCost * upgrade.energyMultiplier);
          const hasEnergy = resources.energy >= energyCost;

          return (
            <motion.div
              key={gs.generatorId}
              layout
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{generator.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{generator.name}</h3>
                    <p className="text-xs text-surface-400">
                      Level {gs.level}/{settings.maxGeneratorLevel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleAuto(gs.generatorId)}
                  className={`p-2 rounded-lg transition-colors ${
                    gs.autoEnabled
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-surface-700/50 text-surface-400 hover:text-white'
                  }`}
                  title={gs.autoEnabled ? 'Auto: ON' : 'Auto: OFF'}
                >
                  {gs.autoEnabled ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Production info */}
              <div className="text-sm text-surface-300 mb-3">
                Produces:{' '}
                {generator.produces.map((p, i) => {
                  const element = getElement(p.elementId);
                  const amount = Math.floor(p.baseAmount * upgrade.productionMultiplier);
                  return (
                    <span key={p.elementId}>
                      {i > 0 && ', '}
                      {element?.emoji || '❓'} {amount}x {element?.name || p.elementId}
                    </span>
                  );
                })}
              </div>

              {/* Cooldown progress bar */}
              <div className="h-2 bg-surface-700 rounded-full mb-3 overflow-hidden">
                <motion.div
                  className={`h-full ${canProduce ? 'bg-green-500' : 'bg-primary-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onProduce(gs.generatorId)}
                  disabled={!canProduce || !hasEnergy}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    canProduce && hasEnergy
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Produce
                  {energyCost > 0 && (
                    <span className="text-xs opacity-75">({energyCost} ⚡)</span>
                  )}
                </motion.button>

                {nextUpgrade && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onUpgrade(gs.generatorId)}
                    disabled={resources.money < nextUpgrade.cost}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all ${
                      resources.money >= nextUpgrade.cost
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                    }`}
                    title={`Upgrade to level ${gs.level + 1}`}
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">${nextUpgrade.cost}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Locked Generators */}
      {lockedGenerators.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-surface-400 mt-6">Available to Unlock</h3>
          <div className="space-y-2">
            {lockedGenerators.map((generator) => (
              <motion.div
                key={generator.id}
                layout
                className="glass rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{generator.emoji}</span>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {generator.name}
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-700 text-surface-400">
                          Tier {generator.tier}
                        </span>
                      </h3>
                      <p className="text-xs text-surface-400">{generator.description}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUnlock(generator.id)}
                    disabled={resources.money < generator.unlockCost}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      resources.money >= generator.unlockCost
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    ${generator.unlockCost.toLocaleString()}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
