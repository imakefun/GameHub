import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Currencies, GameConfig, OwnedCard, CardDefinition, PackDefinition, PackRewardResource } from '../types';
import { UPGRADE_TIER_COLORS } from '../types';
import { PackOpening } from './PackOpening';
import { getLunarPhase } from '../hooks/useGameState';

interface ShopPanelProps {
  currencies: Currencies;
  config: GameConfig;
  ownedCards: OwnedCard[];
  collectionLevel: number;
  starterTomeClaimed: boolean;
  onPurchasePack: (packId: string) => void;
  onOpenPack: (cards: CardDefinition[], packId: string, resourceRewards?: PackRewardResource[]) => void;
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

function isPackAvailable(pack: PackDefinition, collectionLevel: number): boolean {
  // Check CL requirement
  if (pack.requiredCL && collectionLevel < pack.requiredCL) return false;

  const avail = pack.availability ?? 'shop';

  // Shop packs always available once CL met
  if (avail === 'shop') return true;

  // Full moon packs only during full moon
  if (avail === 'fullMoon') {
    return getLunarPhase() === 'full_moon';
  }

  // Event/expedition/prestige packs are not directly purchasable in shop
  return false;
}

function isPackVisible(pack: PackDefinition, collectionLevel: number): boolean {
  const avail = pack.availability ?? 'shop';
  // Only show shop + fullMoon packs in the shop (not expedition/event/prestige)
  if (avail !== 'shop' && avail !== 'fullMoon') return false;
  // Don't show one-time packs here (starter has its own section)
  if (pack.isOneTime) return false;
  // Must have a cost
  if (!pack.cost) return false;
  // Show packs even if CL not met (greyed out), but hide if way above CL
  // Show all packs within 20 CL of unlock or already unlocked
  if (pack.requiredCL && collectionLevel < pack.requiredCL - 20) return false;
  return true;
}

export function ShopPanel({
  currencies,
  config,
  ownedCards,
  collectionLevel,
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
      if (!isPackAvailable(pack, collectionLevel)) return;
      onPurchasePack(packId);
    }

    setOpeningPackId(packId);
  };

  const visiblePacks = config.packs.filter((p) => isPackVisible(p, collectionLevel));
  const isFullMoon = getLunarPhase() === 'full_moon';

  // Separate regular shop packs from full moon packs
  const shopPacks = visiblePacks.filter((p) => (p.availability ?? 'shop') === 'shop');
  const fullMoonPacks = visiblePacks.filter((p) => p.availability === 'fullMoon');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span>🏪</span> Dark Market
      </h2>

      {/* Starter Tome */}
      {!starterTomeClaimed && (
        <motion.div
          data-tutorial="starter-tome"
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
              onClick={() => onClaimStarterTome()}
              className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black text-sm"
            >
              Claim Free
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Full Moon Special */}
      {fullMoonPacks.length > 0 && isFullMoon && (
        <div>
          <h3 className="font-semibold text-surface-300 mb-3 flex items-center gap-2">
            🌕 Full Moon Special
          </h3>
          <div className="grid gap-3">
            {fullMoonPacks.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                currencies={currencies}
                collectionLevel={collectionLevel}
                onBuy={handleBuyAndOpen}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tomes */}
      <div>
        <h3 className="font-semibold text-surface-300 mb-3">Tomes</h3>
        <div className="grid gap-3">
          {shopPacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              currencies={currencies}
              collectionLevel={collectionLevel}
              onBuy={handleBuyAndOpen}
            />
          ))}
        </div>
      </div>

      {/* Pack opening overlay */}
      <AnimatePresence>
        {openingPackId && (
          <PackOpening
            config={config}
            ownedCards={ownedCards}
            collectionLevel={collectionLevel}
            packId={openingPackId}
            onClose={() => setOpeningPackId(null)}
            onConfirm={(cards, resourceRewards) => onOpenPack(cards, openingPackId, resourceRewards)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PackCard({
  pack,
  currencies,
  collectionLevel,
  onBuy,
}: {
  pack: PackDefinition;
  currencies: Currencies;
  collectionLevel: number;
  onBuy: (id: string) => void;
}) {
  const cost = pack.cost!;
  const available = isPackAvailable(pack, collectionLevel);
  const canAfford = currencies[cost.currency] >= cost.amount;
  const canBuy = available && canAfford;
  const clLocked = pack.requiredCL ? collectionLevel < pack.requiredCL : false;
  const color = UPGRADE_TIER_COLORS.base;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${clLocked ? 'opacity-50' : ''}`}
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
          <div className="flex items-center gap-3 mt-2 text-xs text-surface-500 flex-wrap">
            <span>📦 {pack.cardCount} cards</span>
            {pack.guaranteed && (
              <span className="text-amber-400">★ {pack.guaranteed}</span>
            )}
            {pack.isPremium && (
              <span className="text-pink-400">Premium</span>
            )}
            {clLocked && (
              <span className="text-red-400">🔒 CL {pack.requiredCL}</span>
            )}
          </div>
        </div>
        <motion.button
          whileTap={canBuy ? { scale: 0.95 } : {}}
          onClick={() => canBuy && onBuy(pack.id)}
          disabled={!canBuy}
          className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
            canBuy
              ? 'text-white'
              : 'bg-surface-800 text-surface-500 cursor-not-allowed'
          }`}
          style={
            canBuy
              ? { background: `linear-gradient(135deg, ${color}, ${color}aa)` }
              : {}
          }
        >
          {clLocked
            ? `🔒 CL ${pack.requiredCL}`
            : `${CURRENCY_ICONS[cost.currency]} ${formatNumber(cost.amount)}`}
        </motion.button>
      </div>
    </div>
  );
}
