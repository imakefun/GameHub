import { motion } from 'framer-motion';
import type { OwnedCard, CardDefinition, UpgradeTier } from '../types';
import { CARD_TYPE_INFO, UPGRADE_TIER_LABELS, UPGRADE_TIER_COLORS, UPGRADE_TIER_ORDER } from '../types';

// Higher tiers get thicker, glowing borders
function borderStyle(tier: UpgradeTier, color: string) {
  const idx = UPGRADE_TIER_ORDER.indexOf(tier);
  if (idx <= 0) return { borderWidth: 1, borderColor: `${color}40`, boxShadow: 'none' };
  if (idx <= 2) return { borderWidth: 2, borderColor: `${color}60`, boxShadow: `0 0 8px ${color}20` };
  if (idx <= 4) return { borderWidth: 2, borderColor: `${color}80`, boxShadow: `0 0 16px ${color}30, inset 0 0 8px ${color}10` };
  // cosmic (idx 6)
  return { borderWidth: 3, borderColor: color, boxShadow: `0 0 24px ${color}40, inset 0 0 12px ${color}15` };
}

interface CardComponentProps {
  card: OwnedCard;
  definition: CardDefinition;
  compact?: boolean;
  showEssence?: boolean;
  onClick?: () => void;
  onCollect?: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export function CardComponent({
  card,
  definition,
  compact = false,
  showEssence = false,
  onClick,
  onCollect,
}: CardComponentProps) {
  const upgradeColor = UPGRADE_TIER_COLORS[card.upgradeTier];
  const typeInfo = CARD_TYPE_INFO[definition.type];
  const hasEssence = card.accumulatedEssence >= 1;
  const isFatigued = card.fatigueUntil && Date.now() < card.fatigueUntil;

  const border = borderStyle(card.upgradeTier, upgradeColor);

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-2 p-2 rounded-lg transition-all text-left w-full"
        style={{
          borderWidth: border.borderWidth,
          borderStyle: 'solid',
          borderColor: border.borderColor,
          boxShadow: border.boxShadow,
          background: `linear-gradient(135deg, ${upgradeColor}10, transparent)`,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
          style={{
            borderColor: `${upgradeColor}60`,
            background: `linear-gradient(135deg, ${upgradeColor}20, ${upgradeColor}05)`,
          }}
        >
          {typeInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{definition.name}</p>
          <p className="text-xs" style={{ color: upgradeColor }}>
            {UPGRADE_TIER_LABELS[card.upgradeTier]}
          </p>
        </div>
        {card.isOnExpedition && (
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
            Expedition
          </span>
        )}
        {isFatigued && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
            Fatigued
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isFatigued ? 0.6 : 1, scale: 1 }}
      className={`relative rounded-xl overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
      style={{
        borderWidth: border.borderWidth,
        borderStyle: 'solid',
        borderColor: border.borderColor,
        boxShadow: border.boxShadow,
        background: `linear-gradient(180deg, ${upgradeColor}15 0%, rgba(0,0,0,0.3) 100%)`,
      }}
      onClick={onClick}
    >
      {/* Essence glow */}
      {showEssence && hasEssence && !isFatigued && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 10px ${upgradeColor}30`,
              `0 0 25px ${upgradeColor}50`,
              `0 0 10px ${upgradeColor}30`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Card header */}
      <div className="px-3 pt-3 pb-1 flex items-start justify-between">
        <h3 className="font-bold text-sm leading-tight">{definition.name}</h3>
        <span
          className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${upgradeColor}20`, color: upgradeColor }}
        >
          {UPGRADE_TIER_LABELS[card.upgradeTier]}
        </span>
      </div>

      {/* Card art placeholder */}
      <div className="mx-3 my-2">
        <div
          className="aspect-[3/4] rounded-lg border flex items-center justify-center"
          style={{
            borderColor: `${upgradeColor}30`,
            background: `linear-gradient(135deg, ${upgradeColor}08, rgba(0,0,0,0.4))`,
          }}
        >
          {definition.artUrl ? (
            <img
              src={definition.artUrl}
              alt={definition.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-4xl">{typeInfo.emoji}</span>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div className="px-3 pb-1">
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${upgradeColor}20`, color: upgradeColor }}
        >
          {typeInfo.emoji} {typeInfo.label}
        </span>
      </div>

      {/* Generation info */}
      <div className="px-3 pb-1 flex items-center justify-between">
        <p className="text-xs text-surface-400">
          {definition.baseGenerationAmount} SE / {definition.baseInterval}s
        </p>
        {card.soulShards > 0 && (
          <p className="text-xs text-blue-400">
            {card.soulShards} shards
          </p>
        )}
      </div>

      {/* Fatigue indicator */}
      {isFatigued && (
        <div className="px-3 pb-2">
          <div className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 text-center">
            Fatigued
          </div>
        </div>
      )}

      {/* Collect button */}
      {showEssence && card.placedInCrypt && !isFatigued && (
        <div className="px-3 pb-3">
          {hasEssence ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onCollect?.();
              }}
              className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, ${upgradeColor}, ${upgradeColor}aa)`,
                color: '#000',
              }}
            >
              Collect {formatNumber(card.accumulatedEssence)}
            </motion.button>
          ) : (
            <div className="w-full rounded-lg bg-surface-800/50 overflow-hidden">
              <div className="relative h-8 flex items-center justify-center">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, card.accumulatedEssence * 100)}%`,
                    background: `linear-gradient(90deg, ${upgradeColor}30, ${upgradeColor}50)`,
                  }}
                />
                <span className="relative text-xs text-surface-400">
                  Generating... {Math.floor(card.accumulatedEssence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action button for non-placed cards */}
      {!card.placedInCrypt && !card.isOnExpedition && onClick && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            Place in Crypt
          </button>
        </div>
      )}
    </motion.div>
  );
}
