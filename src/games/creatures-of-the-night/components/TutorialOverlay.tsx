import { motion, AnimatePresence } from 'framer-motion';

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to the Crypt',
    text: 'A Shadow Rat has appeared! Every collector starts with one creature. It generates Shadow Essence over time.',
    emoji: '🐀',
    highlight: 'crypt',
  },
  {
    title: 'Shadow Essence',
    text: 'Your creatures generate Shadow Essence automatically. Tap them to collect it! The essence bar at the top shows your total.',
    emoji: '🌑',
    highlight: 'resources',
  },
  {
    title: 'Open Your First Tome',
    text: 'Visit the Dark Market to claim your free Starter Tome. Tomes contain new creatures to add to your collection.',
    emoji: '📦',
    highlight: 'shop',
  },
  {
    title: 'Soul Shards',
    text: 'Duplicate creatures are converted into Soul Shards. Each card has its own shard pool used for upgrades.',
    emoji: '💎',
    highlight: 'collection',
  },
  {
    title: 'Level Up',
    text: 'Spend Soul Shards to level up your creatures. Higher levels mean more Shadow Essence per collection!',
    emoji: '⬆️',
    highlight: 'collection',
  },
  {
    title: 'The Crypt',
    text: 'Place creatures in the Crypt to generate resources. You start with 3 slots and unlock more as your Collection Level grows.',
    emoji: '🏚️',
    highlight: 'crypt',
  },
  {
    title: 'Collect All',
    text: 'When multiple creatures are ready, use "Collect All" to gather essence from every card at once!',
    emoji: '✨',
    highlight: 'crypt',
  },
  {
    title: 'Daily Quests',
    text: 'Check the Grimoire for daily quests. Complete them for bonus rewards and weekly milestone progress.',
    emoji: '📜',
    highlight: 'grimoire',
  },
  {
    title: 'Your Journey Begins',
    text: 'Collect creatures, level them up, discover synergies, and unlock new card types as your Collection Level grows. Good luck!',
    emoji: '🌙',
    highlight: null,
  },
];

export function TutorialOverlay({ step, onNext, onSkip }: TutorialOverlayProps) {
  const currentStep = TUTORIAL_STEPS[step];
  if (!currentStep) return null;

  const isLastStep = step === TUTORIAL_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center pb-24 sm:items-center sm:pb-0"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onNext}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm mx-4 rounded-2xl border border-purple-500/30 p-5"
          style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0a0015 100%)' }}
        >
          {/* Step indicator */}
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
            <p className="text-sm text-surface-300 leading-relaxed">
              {currentStep.text}
            </p>
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
            <button
              onClick={onNext}
              className={`${isLastStep ? 'w-full' : 'flex-1'} py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white`}
            >
              {isLastStep ? 'Start Playing' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;
