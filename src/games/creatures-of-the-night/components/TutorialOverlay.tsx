import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Tab = 'crypt' | 'collection' | 'shop' | 'expeditions' | 'grimoire';

interface TutorialStep {
  title: string;
  text: string;
  emoji: string;
  target: string | null; // data-tutorial attribute value, null = centered overlay
  tab: Tab | null; // force this tab when step activates
  action: 'next' | 'interact'; // 'next' = button advance, 'interact' = wait for game action
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to the Crypt',
    text: "A Shadow Rat is already generating Shadow Essence for you! Let's learn how to grow your collection.",
    emoji: '\u{1F400}',
    target: null,
    tab: null,
    action: 'next',
  },
  {
    title: 'Your Resources',
    text: 'This bar shows your currencies and Collection Level. Shadow Essence is your main resource \u2014 spend it to buy card packs!',
    emoji: '\u{1F311}',
    target: 'resource-bar',
    tab: null,
    action: 'next',
  },
  {
    title: 'The Crypt',
    text: 'Cards placed here generate Shadow Essence automatically. Your Shadow Rat is already at work! You start with 3 slots.',
    emoji: '\u{1F3DA}\uFE0F',
    target: 'crypt-board',
    tab: 'crypt',
    action: 'next',
  },
  {
    title: 'Claim Your Starter Tome',
    text: 'Click "Claim Free" to receive your first set of cards!',
    emoji: '\u{1F4E6}',
    target: 'starter-tome',
    tab: 'shop',
    action: 'interact',
  },
  {
    title: 'Your Collection',
    text: 'Here are all your cards. Each card has a type, tier, and level. Tap a card to see its details.',
    emoji: '\u{1F4DA}',
    target: 'collection-grid',
    tab: 'collection',
    action: 'next',
  },
  {
    title: 'Place a Card',
    text: 'Tap one of your new cards, then hit "Place in Crypt" to start generating more essence!',
    emoji: '\u2B06\uFE0F',
    target: 'collection-grid',
    tab: 'collection',
    action: 'interact',
  },
  {
    title: 'Generating Essence',
    text: 'Your cards are working! Collect essence when ready, or use "Collect All" to gather from every card at once.',
    emoji: '\u2728',
    target: 'crypt-board',
    tab: 'crypt',
    action: 'next',
  },
  {
    title: 'Your Journey Begins',
    text: 'Level up cards with Soul Shards, discover synergies, unlock new types, and explore expeditions. Good luck!',
    emoji: '\u{1F319}',
    target: null,
    tab: null,
    action: 'next',
  },
];

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
  forceTab: (tab: Tab) => void;
}

function useTargetRect(target: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(`[data-tutorial="${target}"]`);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    update();
    const interval = setInterval(update, 200);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [target]);

  return rect;
}

export function TutorialOverlay({ step, onNext, onSkip, forceTab }: TutorialOverlayProps) {
  const currentStep = TUTORIAL_STEPS[step];
  if (!currentStep) return null;

  const isLastStep = step === TUTORIAL_STEPS.length - 1;
  const rect = useTargetRect(currentStep.target);
  const hasSpotlight = currentStep.target !== null && rect !== null;

  // Force tab when step requires it
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentStep.tab) {
      forceTab(currentStep.tab);
    }
  }, [step, currentStep.tab, forceTab]);

  // If interaction step and target not found yet (e.g. pack opening is covering it), hide
  if (currentStep.action === 'interact' && currentStep.target && !rect) {
    return null;
  }

  const pad = 10;

  // Tooltip positioning relative to the spotlight target
  let tooltipStyle: React.CSSProperties;
  if (hasSpotlight && rect) {
    const viewH = window.innerHeight;
    const isTopHalf = rect.top + rect.height / 2 < viewH / 2;
    tooltipStyle = {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: 'calc(100vw - 2rem)',
      width: 384,
      ...(isTopHalf
        ? { top: Math.min(rect.bottom + pad + 12, viewH - 240) }
        : { bottom: Math.max(viewH - rect.top + pad + 12, 20) }),
    };
  } else {
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: 'calc(100vw - 2rem)',
      width: 384,
    };
  }

  return (
    <div className="fixed inset-0 z-[45]" style={{ pointerEvents: 'none' }}>
      {/* Overlay / Spotlight */}
      {hasSpotlight && rect ? (
        <>
          {/* Top */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, rect.top - pad),
              background: 'rgba(0,0,0,0.75)',
              pointerEvents: 'auto',
            }}
          />
          {/* Bottom */}
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              top: rect.bottom + pad,
              background: 'rgba(0,0,0,0.75)',
              pointerEvents: 'auto',
            }}
          />
          {/* Left */}
          <div
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: 0,
              width: Math.max(0, rect.left - pad),
              height: rect.height + pad * 2,
              background: 'rgba(0,0,0,0.75)',
              pointerEvents: 'auto',
            }}
          />
          {/* Right */}
          <div
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: rect.right + pad,
              right: 0,
              height: rect.height + pad * 2,
              background: 'rgba(0,0,0,0.75)',
              pointerEvents: 'auto',
            }}
          />
          {/* Spotlight ring */}
          <div
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              border: '2px solid rgba(147, 51, 234, 0.5)',
              borderRadius: 12,
              pointerEvents: 'none',
              boxShadow:
                '0 0 20px rgba(147, 51, 234, 0.3), inset 0 0 20px rgba(147, 51, 234, 0.1)',
            }}
          />
        </>
      ) : (
        /* Full overlay for non-targeted steps */
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'auto',
          }}
        />
      )}

      {/* Tooltip Card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ ...tooltipStyle, pointerEvents: 'auto', zIndex: 1 }}
      >
        <div
          className="rounded-2xl border border-purple-500/30 p-5 shadow-2xl"
          style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0a0015 100%)' }}
        >
          {/* Step dots */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i <= step ? 'w-4 bg-purple-400' : 'w-2 bg-surface-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-surface-500">
              {step + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div className="text-center mb-4">
            <motion.div
              key={step}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl mb-2"
            >
              {currentStep.emoji}
            </motion.div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-surface-300 leading-relaxed">{currentStep.text}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isLastStep && (
              <button
                onClick={onSkip}
                className="flex-1 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Skip
              </button>
            )}
            {currentStep.action === 'next' ? (
              <button
                onClick={onNext}
                className={`${isLastStep ? 'w-full' : 'flex-1'} py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white`}
              >
                {isLastStep ? 'Start Playing' : 'Next'}
              </button>
            ) : (
              <div className="flex-1 py-2 rounded-lg text-sm text-center text-purple-300 animate-pulse">
                Try it now!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;
