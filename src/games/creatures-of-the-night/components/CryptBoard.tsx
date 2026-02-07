import { motion } from 'framer-motion';
import type { OwnedCard, GameConfig } from '../types';
import { CardComponent } from './CardComponent';

interface CryptBoardProps {
  ownedCards: OwnedCard[];
  cryptSlots: number;
  config: GameConfig;
  onCollect: (index: number) => void;
  onCollectAll: () => void;
  onRemoveCard: (index: number) => void;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export function CryptBoard({
  ownedCards,
  cryptSlots,
  config,
  onCollect,
  onCollectAll,
  onRemoveCard,
}: CryptBoardProps) {
  const placedCards = ownedCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.placedInCrypt);

  const totalPending = ownedCards
    .filter((c) => c.placedInCrypt)
    .reduce((sum, c) => sum + c.accumulatedEssence, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏚️</span> The Crypt
          </h2>
          <p className="text-xs text-surface-400">
            {placedCards.length}/{cryptSlots} slots filled
          </p>
        </div>
        {totalPending >= 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCollectAll}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
          >
            Collect All ({formatNumber(totalPending)} 🌑)
          </motion.button>
        )}
      </div>

      {/* Card Grid */}
      {placedCards.length === 0 ? (
        <div className="text-center py-12 text-surface-400">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="font-medium">Your crypt is empty</p>
          <p className="text-sm mt-1">Place cards from your collection to start generating Shadow Essence</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {placedCards.map(({ card, index }) => {
            const def = config.cards.find((c) => c.id === card.definitionId);
            if (!def) return null;
            return (
              <div key={index} className="relative group">
                <CardComponent
                  card={card}
                  definition={def}
                  index={index}
                  showEssence
                  onCollect={() => onCollect(index)}
                />
                <button
                  onClick={() => onRemoveCard(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Remove from crypt"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: cryptSlots - placedCards.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-auto min-h-[200px] rounded-xl border-2 border-dashed border-surface-700/50 flex items-center justify-center text-surface-600"
            >
              <div className="text-center">
                <p className="text-2xl mb-1">+</p>
                <p className="text-xs">Empty Slot</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
