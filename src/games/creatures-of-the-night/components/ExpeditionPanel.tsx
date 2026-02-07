import { useState } from 'react';
import { motion } from 'framer-motion';
import type { OwnedCard, GameConfig, ActiveExpedition } from '../types';
import { CardComponent } from './CardComponent';

interface ExpeditionPanelProps {
  ownedCards: OwnedCard[];
  config: GameConfig;
  activeExpeditions: ActiveExpedition[];
  onStartExpedition: (zoneId: string, cardIndices: number[]) => void;
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

export function ExpeditionPanel({
  ownedCards,
  config,
  activeExpeditions,
  onStartExpedition,
}: ExpeditionPanelProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  const zone = selectedZone ? config.expeditions.find((z) => z.id === selectedZone) : null;

  // Available cards (not on expedition, not needed in crypt)
  const availableCards = ownedCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !card.isOnExpedition);

  const canStart = zone && selectedCards.size >= zone.requirements.minCards;

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

  const handleStart = () => {
    if (!zone || !canStart) return;
    onStartExpedition(zone.id, Array.from(selectedCards));
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
            const progress = 1 - remaining / ((exp.completesAt - exp.startedAt) / 1000);

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
                <p className="text-xs text-surface-500 mt-1.5">
                  {exp.cardIds.length} cards deployed
                </p>
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
            const req = expZone.requirements;
            const meetsLevel = ownedCards.some((c) => c.level >= req.minLevel);
            const meetsCards = availableCards.length >= req.minCards;
            const isAvailable = meetsLevel && meetsCards;

            return (
              <button
                key={expZone.id}
                onClick={() => isAvailable && setSelectedZone(expZone.id)}
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
                  <span className="text-xs text-surface-500">
                    {formatDuration(expZone.duration)}
                  </span>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-surface-500">
                  <span>Min {req.minCards} cards</span>
                  <span>Lv.{req.minLevel}+</span>
                  {req.requiredTypes?.map((t) => (
                    <span key={t} className="text-purple-400">Needs {t}</span>
                  ))}
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
                    index={index}
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
            Start Expedition ({selectedCards.size}/{zone?.requirements.minCards} cards)
          </button>
        </div>
      )}
    </div>
  );
}
