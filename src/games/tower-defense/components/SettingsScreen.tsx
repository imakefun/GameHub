import { motion } from 'framer-motion';
import { monetizationManager, IAP_PRODUCTS } from '../systems/monetization';
import { getSpriteUrl } from '../assets/sprites';

interface Props {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  showRanges: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onToggleRanges: () => void;
  onBack: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <div>
        <div className="text-white font-semibold text-sm">{label}</div>
        <div className="text-white/40 text-xs">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full transition-colors relative ${
          enabled ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
          animate={{ left: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export function SettingsScreen({
  sfxEnabled, musicEnabled, showRanges,
  onToggleSfx, onToggleMusic, onToggleRanges, onBack,
}: Props) {
  const gemState = monetizationManager.getState();
  const gemIconUrl = getSpriteUrl('ui', 'gem');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Settings</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Audio Settings */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Audio</h3>
          <div className="bg-white/5 rounded-xl px-4">
            <ToggleRow
              label="Sound Effects"
              description="Tower shots, enemy hits, UI sounds"
              enabled={sfxEnabled}
              onToggle={onToggleSfx}
            />
            <ToggleRow
              label="Music"
              description="Background music for each world"
              enabled={musicEnabled}
              onToggle={onToggleMusic}
            />
          </div>
          <p className="text-white/30 text-xs mt-2 px-1">
            Audio files are placeholders. Add .ogg files to /audio/sfx/ and /audio/music/ directories.
          </p>
        </section>

        {/* Gameplay Settings */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Gameplay</h3>
          <div className="bg-white/5 rounded-xl px-4">
            <ToggleRow
              label="Show Tower Ranges"
              description="Display attack radius when selecting towers"
              enabled={showRanges}
              onToggle={onToggleRanges}
            />
          </div>
        </section>

        {/* Premium Currency */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Gems</h3>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              {gemIconUrl && <img src={gemIconUrl} alt="gem" className="w-6 h-6" />}
              <span className="text-purple-300 font-bold text-xl">{gemState.gems}</span>
              <span className="text-white/50 text-sm">gems</span>
            </div>
            <div className="text-white/40 text-xs space-y-0.5">
              <div>Total earned: {gemState.totalGemsEarned}</div>
              <div>Total spent: {gemState.totalGemsSpent}</div>
              <div>Ads watched: {gemState.totalAdsWatched}</div>
            </div>
          </div>
        </section>

        {/* Gem Store */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Gem Store</h3>
          <div className="space-y-2">
            {IAP_PRODUCTS.map(product => (
              <motion.button
                key={product.id}
                onClick={() => {
                  // PLACEHOLDER: In production, trigger platform billing flow
                  monetizationManager.purchaseProduct(product.id);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl bg-white/5 active:bg-white/10 transition-colors relative overflow-hidden ${
                  product.bestValue ? 'ring-1 ring-amber-400/50' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-bold text-black px-2 py-0.5 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                {product.bestValue && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-bl-lg">
                    BEST VALUE
                  </div>
                )}
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">{product.name}</div>
                  <div className="text-white/40 text-xs">{product.description}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-purple-300 font-bold text-sm">
                    {product.gems} {product.bonusPercent > 0 && (
                      <span className="text-emerald-400 text-xs">+{product.bonusPercent}%</span>
                    )}
                  </div>
                  <div className="text-amber-400 font-bold text-xs">${product.priceUSD.toFixed(2)}</div>
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2 px-1">
            In-app purchases are placeholders. Integrate with platform billing SDK for production.
          </p>
        </section>

        {/* Rewarded Video */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Free Gems</h3>
          <div className="bg-white/5 rounded-xl p-4">
            <motion.button
              onClick={() => {
                if (monetizationManager.canWatchRewardedVideo()) {
                  monetizationManager.watchRewardedVideo('free_gems');
                }
              }}
              disabled={!monetizationManager.canWatchRewardedVideo()}
              className={`w-full py-3 rounded-xl font-bold text-sm ${
                monetizationManager.canWatchRewardedVideo()
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-500'
              }`}
              whileTap={monetizationManager.canWatchRewardedVideo() ? { scale: 0.98 } : undefined}
            >
              Watch Video → +5 Gems
            </motion.button>
            <div className="text-white/40 text-xs mt-2 text-center">
              {monetizationManager.getDailyAdsRemaining()} / 10 daily views remaining
            </div>
            <p className="text-white/30 text-xs mt-1 text-center">
              Rewarded video is a placeholder. Integrate with ad SDK for production.
            </p>
          </div>
        </section>

        {/* Credits */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
          <div className="bg-white/5 rounded-xl p-4 text-white/50 text-xs space-y-1">
            <div className="text-white font-bold text-sm mb-1">Tower Defense: Kingdom Guardians</div>
            <div>Version 1.0.0</div>
            <div>Built with React + TypeScript</div>
            <div>SVG art inspired by open game art community</div>
            <div className="mt-2 pt-2 border-t border-white/10">
              Audio placeholders ready for:<br/>
              • {13} music tracks (OGG format)<br/>
              • {22} sound effects (OGG format)<br/>
              See /audio/ directory structure
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
