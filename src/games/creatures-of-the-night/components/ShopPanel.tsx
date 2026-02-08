import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Currencies, GameConfig, OwnedCard, CardDefinition } from '../types';
import { TIER_COLORS } from '../types';
import { PackOpening } from './PackOpening';

interface ShopPanelProps {
  currencies: Currencies;
  config: GameConfig;
  ownedCards: OwnedCard[];
  starterTomeClaimed: boolean;
  onPurchasePack: (packId: string) => void;
  onOpenPack: (cards: CardDefinition[], packId: string) => void;
  onClaimStarterTome: () => void;
}

const CURRENCY_ICONS: Record<keyof Currencies, string> = {
  shadowEssence: '🌑',
  lunarCrystals: '🌙',
  voidEnergy: '🔮',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

export function ShopPanel({
  currencies,
  config,
  ownedCards,
  starterTomeClaimed,
  onPurchasePack,
  onOpenPack,
  onClaimStarterTome,
}: ShopPanelProps) {
  const [openingPackId, setOpeningPackId] = useState<string | null>(null);

  const handleBuyAndOpen = (packId: string) => {
    const pack = config.packs.find((p) => p.id === packId);
    if (!pack) return;

    if (!pack.cost) {
      // Free pack (starter tome)
      onClaimStarterTome();
    } else {
      const { currency, amount } = pack.cost;
      if (currencies[currency] < amount) return;
      onPurchasePack(packId);
    }

    setOpeningPackId(packId);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>🏪</span> Dark Market
      </h2>

      {/* Starter Tome */}
      {!starterTomeClaimed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-purple-500/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <span>📜</span> Starter Tome
              </h3>
              <p className="text-sm text-surface-400 mt-0.5">
                Free one-time tome - 5 Twilight cards
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBuyAndOpen('starter-tome')}
              className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black text-sm"
            >
              Claim Free
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tomes */}
      <div>
        <h3 className="font-semibold text-surface-300 mb-3">Tomes</h3>
        <div className="grid gap-3">
          {config.packs
            .filter((p) => p.cost !== null)
            .map((pack) => {
              const cost = pack.cost!;
              const canAfford = currencies[cost.currency] >= cost.amount;
              const highestTier = Object.keys(pack.tierWeights).pop() || 'twilight';
              const color = TIER_COLORS[highestTier as keyof typeof TIER_COLORS] || TIER_COLORS.twilight;

              return (
                <div
                  key={pack.id}
                  className="p-4 rounded-xl border transition-all"
                  style={{
                    borderColor: `${color}30`,
                    background: `linear-gradient(135deg, ${color}08, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm" style={{ color }}>
                        {pack.name}
                      </h4>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {pack.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                        <span>📦 {pack.cardCount} cards</span>
                        {pack.guaranteed && (
                          <span className="text-amber-400">★ {pack.guaranteed}</span>
                        )}
                        {pack.isPremium && (
                          <span className="text-pink-400">Premium</span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileTap={canAfford ? { scale: 0.95 } : {}}
                      onClick={() => canAfford && handleBuyAndOpen(pack.id)}
                      disabled={!canAfford}
                      className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                        canAfford
                          ? 'text-white'
                          : 'bg-surface-800 text-surface-500 cursor-not-allowed'
                      }`}
                      style={
                        canAfford
                          ? { background: `linear-gradient(135deg, ${color}, ${color}aa)` }
                          : {}
                      }
                    >
                      {CURRENCY_ICONS[cost.currency]} {formatNumber(cost.amount)}
                    </motion.button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Pack opening overlay */}
      <AnimatePresence>
        {openingPackId && (
          <PackOpening
            config={config}
            ownedCards={ownedCards}
            packId={openingPackId}
            onClose={() => setOpeningPackId(null)}
            onConfirm={(cards) => onOpenPack(cards, openingPackId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
