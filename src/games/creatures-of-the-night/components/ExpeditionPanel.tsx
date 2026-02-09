import { useState } from 'react';
import { motion } from 'framer-motion';
import type { OwnedCard, GameConfig, ActiveExpedition } from '../types';
import { CardComponent } from './CardComponent';

interface ExpeditionPanelProps {
  ownedCards: OwnedCard[];
  config: GameConfig;
  collectionLevel: number;
  activeExpeditions: ActiveExpedition[];
  lunarCrystals: number;
  onStartExpedition: (zoneId: string, cardIndices: number[], duration: number) => void;
  onRushExpedition: (expeditionIndex: number) => void;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Complete!';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDurationRange(range: [number, number]): string {
  return `${formatDuration(range[0])} - ${formatDuration(range[1])}`;
}

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  fatigue: { label: 'Fatigue', color: 'text-yellow-400' },
  damage: { label: 'Damage', color: 'text-orange-400' },
  card_loss: { label: 'Temp Loss', color: 'text-red-400' },
  curse: { label: 'Curse', color: 'text-purple-400' },
};

export function ExpeditionPanel({
  ownedCards,
  config,
  collectionLevel,
  activeExpeditions,
  lunarCrystals,
  onStartExpedition,
  onRushExpedition,
}: ExpeditionPanelProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [chosenDuration, setChosenDuration] = useState<number>(0);

  const zone = selectedZone ? config.expeditions.find((z) => z.id === selectedZone) : null;

  const availableCards = ownedCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !card.isOnExpedition && !card.fatigueUntil);

  const canStart = zone && selectedCards.size >= zone.requirements.minCards && chosenDuration > 0;

  const handleToggleCard = (index: number) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectZone = (zoneId: string) => {
    const z = config.expeditions.find((e) => e.id === zoneId);
    setSelectedZone(zoneId);
    setSelectedCards(new Set());
    if (z) setChosenDuration(z.durationRange[0]);
  };

  const handleStart = () => {
    if (!zone || !canStart) return;
    onStartExpedition(zone.id, Array.from(selectedCards), chosenDuration);
    setSelectedZone(null);
    setSelectedCards(new Set());
  };

  const now = Date.now();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>⚔️</span> Expeditions
      </h2>

      {/* Active expeditions */}
      {activeExpeditions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-surface-300 text-sm">Active</h3>
          {activeExpeditions.map((exp, i) => {
            const expZone = config.expeditions.find((z) => z.id === exp.zoneId);
            const remaining = Math.max(0, (exp.completesAt - now) / 1000);
            const total = (exp.completesAt - exp.startedAt) / 1000;
            const progress = 1 - remaining / total;

            return (
              <div
                key={i}
                className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{expZone?.name || 'Unknown'}</span>
                  <span className="text-xs text-blue-400">
                    {remaining <= 0 ? 'Collecting rewards...' : formatDuration(remaining)}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    animate={{ width: `${Math.min(100, progress * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-surface-500">
                    {exp.cardIds.length} cards deployed
                  </p>
                  {remaining > 0 && (() => {
                    const lcCost = Math.max(1, Math.ceil(remaining / 600));
                    return (
                      <button
                        onClick={() => onRushExpedition(i)}
                        disabled={lunarCrystals < lcCost}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          lunarCrystals >= lcCost
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                            : 'bg-surface-800 text-surface-500 cursor-not-allowed'
                        }`}
                      >
                        Rush ({lcCost} 🌙)
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone selection */}
      {!selectedZone ? (
        <div className="space-y-2">
          <h3 className="font-semibold text-surface-300 text-sm">Available Zones</h3>
          {config.expeditions.map((expZone) => {
            const unlocked = collectionLevel >= expZone.unlockCL;
            const eligibleCount = ownedCards.filter(
              (c) => !c.isOnExpedition && !c.fatigueUntil,
            ).length;
            const meetsCards = eligibleCount >= expZone.requirements.minCards;
            const isAvailable = unlocked && meetsCards;
            const risk = RISK_LABELS[expZone.riskEffect];

            return (
              <button
                key={expZone.id}
                onClick={() => isAvailable && handleSelectZone(expZone.id)}
                disabled={!isAvailable}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isAvailable
                    ? 'border-surface-700 hover:border-purple-500/50 hover:bg-purple-500/5'
                    : 'border-surface-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{expZone.name}</h4>
                    <p className="text-xs text-surface-400 mt-0.5">{expZone.description}</p>
                  </div>
                  {!unlocked && (
                    <span className="text-xs text-surface-500 bg-surface-800 px-2 py-1 rounded">
                      CL {expZone.unlockCL}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-surface-500 flex-wrap">
                  <span>Min {expZone.requirements.minCards} cards</span>
                  {expZone.requirements.requiredTier && expZone.requirements.requiredTierCount && (
                    <span className="text-purple-400">
                      {expZone.requirements.requiredTierCount} {expZone.requirements.requiredTier}
                    </span>
                  )}
                  <span>{formatDurationRange(expZone.durationRange)}</span>
                  {expZone.requirements.requiredTypes?.map((t) => (
                    <span key={t} className="text-purple-400">Needs {t}</span>
                  ))}
                  <span className={risk.color}>
                    {expZone.riskPercent}% {risk.label}
                  </span>
                </div>
                {/* Rewards preview */}
                <div className="flex gap-2 mt-2 text-xs">
                  {expZone.rewards.shadowEssence && (
                    <span>🌑 {expZone.rewards.shadowEssence[0]}-{expZone.rewards.shadowEssence[1]}</span>
                  )}
                  {expZone.rewards.soulShards && (
                    <span>💎 {expZone.rewards.soulShards[0]}-{expZone.rewards.soulShards[1]}</span>
                  )}
                  {expZone.rewards.lunarCrystals && (
                    <span>🌙 {expZone.rewards.lunarCrystals[0]}-{expZone.rewards.lunarCrystals[1]}</span>
                  )}
                  {expZone.rewards.voidEnergy && (
                    <span>🔮 {expZone.rewards.voidEnergy[0]}-{expZone.rewards.voidEnergy[1]}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Card selection for expedition */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{zone?.name}</h3>
              <p className="text-xs text-surface-400">
                Select {zone?.requirements.minCards}+ cards to send
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedZone(null);
                setSelectedCards(new Set());
              }}
              className="text-sm text-surface-400 hover:text-white"
            >
              Back
            </button>
          </div>

          {/* Duration slider */}
          {zone && (
            <div className="p-3 bg-surface-800/50 rounded-lg">
              <label className="text-xs text-surface-400 block mb-1">
                Duration: {formatDuration(chosenDuration)}
              </label>
              <input
                type="range"
                min={zone.durationRange[0]}
                max={zone.durationRange[1]}
                step={300}
                value={chosenDuration}
                onChange={(e) => setChosenDuration(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-surface-500 mt-1">
                <span>{formatDuration(zone.durationRange[0])}</span>
                <span>{formatDuration(zone.durationRange[1])}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {availableCards.map(({ card, index }) => {
              const def = config.cards.find((c) => c.id === card.definitionId);
              if (!def) return null;
              const selected = selectedCards.has(index);

              return (
                <button
                  key={index}
                  onClick={() => handleToggleCard(index)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    selected
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-surface-700/50 hover:border-surface-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selected ? 'border-purple-500 bg-purple-500' : 'border-surface-600'
                  }`}>
                    {selected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <CardComponent
                    card={card}
                    definition={def}
                    compact
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-3 rounded-xl font-semibold text-sm ${
              canStart
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                : 'bg-surface-800 text-surface-500 cursor-not-allowed'
            }`}
          >
            Start Expedition ({selectedCards.size}/{zone?.requirements.minCards} cards, {formatDuration(chosenDuration)})
          </button>
        </div>
      )}
    </div>
  );
}
