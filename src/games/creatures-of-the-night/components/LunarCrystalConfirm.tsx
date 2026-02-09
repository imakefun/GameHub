import { motion } from 'framer-motion';

export interface LCShortfall {
  essenceShort: number;
  shardsShort: number;
}

interface LunarCrystalConfirmProps {
  shortfall: LCShortfall;
  lcCost: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

export function LunarCrystalConfirm({
  shortfall,
  lcCost,
  onConfirm,
  onCancel,
}: LunarCrystalConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(30,20,50,0.98) 0%, rgba(10,5,20,0.99) 100%)',
          border: '2px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 40px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="pt-6 pb-3 text-center">
          <h3
            className="text-3xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(180deg, #e0d5ff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(139,92,246,0.4))',
            }}
          >
            So Close!
          </h3>
        </div>

        {/* Subtitle + resources */}
        <div className="px-5 pb-5 text-center">
          <p className="text-sm text-surface-300 mb-4">
            Purchase these to upgrade now:
          </p>

          {/* Missing resources */}
          <div className="flex items-center justify-center gap-5 mb-6">
            {shortfall.essenceShort > 0 && (
              <span className="flex items-center gap-1.5 text-base font-bold text-purple-300">
                <span>🌑</span>
                <span>{formatNumber(shortfall.essenceShort)}</span>
              </span>
            )}
            {shortfall.shardsShort > 0 && (
              <span className="flex items-center gap-1.5 text-base font-bold text-green-300">
                <span>💎</span>
                <span>{shortfall.shardsShort}</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5',
              }}
            >
              No Thanks
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                border: '1px solid rgba(167,139,250,0.5)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
              }}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>🔮</span>
                <span>{lcCost}</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
