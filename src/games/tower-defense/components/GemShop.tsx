import { motion } from 'framer-motion';
import { getSpriteUrl } from '../assets/sprites';
import { monetizationManager, IAP_PRODUCTS, REWARDED_VIDEO_CONFIG } from '../systems/monetization';

interface Props {
  onBack: () => void;
}

export function GemShop({ onBack }: Props) {
  const state = monetizationManager.getState();
  const gemIconUrl = getSpriteUrl('ui', 'gem');
  const canWatchAd = monetizationManager.canWatchRewardedVideo();
  const dailyAdsLeft = monetizationManager.getDailyAdsRemaining();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Gem Shop</h2>
        <div className="flex items-center gap-1.5 bg-purple-600/30 px-3 py-1.5 rounded-full">
          <img src={gemIconUrl} alt="" className="w-5 h-5" />
          <span className="text-purple-200 font-bold">{state.gems}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Free gems section */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-3 uppercase tracking-wide">Free Gems</h3>
          <motion.button
            onClick={() => {
              if (canWatchAd) {
                monetizationManager.watchRewardedVideo('free_gems');
              }
            }}
            disabled={!canWatchAd}
            className={`w-full p-4 rounded-2xl flex items-center justify-between ${
              canWatchAd
                ? 'bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 border border-emerald-500/30'
                : 'bg-slate-800/50 border border-slate-700/30'
            }`}
            whileTap={canWatchAd ? { scale: 0.98 } : undefined}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,4 20,12 6,20"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Watch Video</div>
                <div className="text-white/40 text-xs">{dailyAdsLeft}/{REWARDED_VIDEO_CONFIG.maxDailyViews} remaining today</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-purple-300 font-bold">
              +{REWARDED_VIDEO_CONFIG.gemsPerVideo}
              <img src={gemIconUrl} alt="" className="w-4 h-4" />
            </div>
          </motion.button>
        </section>

        {/* Purchase section */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-3 uppercase tracking-wide">Gem Packs</h3>
          <div className="space-y-2">
            {IAP_PRODUCTS.map(product => {
              const totalGems = product.gems + Math.floor(product.gems * product.bonusPercent / 100);
              return (
                <motion.button
                  key={product.id}
                  onClick={() => monetizationManager.purchaseProduct(product.id)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between bg-white/5 active:bg-white/10 transition-colors relative overflow-hidden ${
                    product.bestValue ? 'ring-1 ring-amber-400/40' : ''
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <img src={gemIconUrl} alt="" className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">{product.name}</div>
                      <div className="text-white/40 text-xs">{product.description}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-purple-300 font-bold text-sm flex items-center gap-1 justify-end">
                      {totalGems}
                      <img src={gemIconUrl} alt="" className="w-3.5 h-3.5" />
                    </div>
                    {product.bonusPercent > 0 && (
                      <div className="text-emerald-400 text-[10px] font-bold">+{product.bonusPercent}% bonus</div>
                    )}
                    <div className="text-amber-400 font-bold text-xs">${product.priceUSD.toFixed(2)}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-white/20 text-xs mt-3 text-center">
            Purchases are placeholders. Connect to platform billing SDK for production.
          </p>
        </section>

        {/* What gems can buy */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-3 uppercase tracking-wide">What Gems Buy</h3>
          <div className="bg-white/5 rounded-2xl p-4 space-y-3 text-sm">
            {[
              { name: 'Continue After Loss', cost: 20, desc: 'Restore 50% lives and keep playing' },
              { name: 'Bonus Starting Gold', cost: 15, desc: '+100 starting gold on a level' },
              { name: 'Speed Boost', cost: 10, desc: 'Unlock 3x speed option' },
              { name: 'Extra Tower Slot', cost: 25, desc: 'Use a restricted tower on a level' },
              { name: 'Tower Skins', cost: 50, desc: 'Cosmetic tower appearance' },
              { name: 'Hero Units', cost: 100, desc: 'Unlock powerful hero units (coming soon)' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-white/40 text-xs">{item.desc}</div>
                </div>
                <div className="flex items-center gap-1 text-purple-300 font-bold text-xs flex-shrink-0 ml-2">
                  {item.cost}
                  <img src={gemIconUrl} alt="" className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
