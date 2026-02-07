import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  GameAction,
  GameConfig,
  Currencies,
  OwnedCard,
  CardDefinition,
  CardType,
} from '../types';
import { TIER_ORDER } from '../types';

const STORAGE_KEY = 'creatures-of-the-night-save';

// ---- Helpers ----

function getCardDef(config: GameConfig, defId: string): CardDefinition | undefined {
  return config.cards.find((c) => c.id === defId);
}

function essenceRateForCard(card: OwnedCard, def: CardDefinition, config: GameConfig): number {
  const levelBonus = 1 + (card.level - 1) * config.settings.essencePerLevelMultiplier;
  return def.baseEssenceRate * levelBonus;
}

function levelUpCost(level: number, config: GameConfig): number {
  return Math.floor(
    config.settings.levelUpBaseCost * Math.pow(config.settings.levelUpCostMultiplier, level - 1)
  );
}

function experienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function getPlacedCardTypes(ownedCards: OwnedCard[], config: GameConfig): Record<CardType, number> {
  const counts: Record<string, number> = {};
  ownedCards
    .filter((c) => c.placedInCrypt)
    .forEach((c) => {
      const def = getCardDef(config, c.definitionId);
      if (def) {
        counts[def.type] = (counts[def.type] || 0) + 1;
      }
    });
  return counts as Record<CardType, number>;
}

function getSynergyBonus(ownedCards: OwnedCard[], cardType: CardType, config: GameConfig): number {
  const typeCounts = getPlacedCardTypes(ownedCards, config);
  let bonus = 0;

  // Type synergy
  const typeSynergy = config.typeSynergies.find((s) => s.type === cardType);
  if (typeSynergy) {
    const count = typeCounts[cardType] || 0;
    for (const threshold of typeSynergy.thresholds) {
      if (count >= threshold.count) bonus = threshold.bonus;
    }
  }

  // Cross-type synergies
  for (const cross of config.crossTypeSynergies) {
    if (
      (cross.type1 === cardType || cross.type2 === cardType) &&
      (typeCounts[cross.type1] || 0) > 0 &&
      (typeCounts[cross.type2] || 0) > 0
    ) {
      bonus += cross.productionBonus;
    }
  }

  return bonus;
}

// ---- Initial State ----

function createInitialState(config: GameConfig): GameState {
  // Start with a Shadow Rat already placed
  const starterCard = config.cards.find((c) => c.id === 'beast-shadow-rat');
  const starterOwned: OwnedCard[] = starterCard
    ? [
        {
          definitionId: starterCard.id,
          level: 1,
          experience: 0,
          placedInCrypt: true,
          lastCollected: Date.now(),
          accumulatedEssence: 0,
          isOnExpedition: false,
        },
      ]
    : [];

  return {
    currencies: {
      shadowEssence: 0,
      soulShards: 0,
      lunarCrystals: 5,
      voidEnergy: 0,
    },
    ownedCards: starterOwned,
    cryptSlots: 6,
    playerStats: {
      level: 1,
      experience: 0,
      totalEssenceCollected: 0,
      totalPacksOpened: 0,
      totalCardsCollected: starterOwned.length,
      totalExpeditionsCompleted: 0,
      playTime: 0,
      loginStreak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
    },
    activeExpeditions: [],
    dailyFreePackAvailable: true,
    lastDailyReset: Date.now(),
    unlockedFeatures: ['basic-collection', 'pack-opening', 'beast-type'],
    lastSaved: Date.now(),
    lastTick: Date.now(),
  };
}

// ---- Reducer ----

function createGameReducer(config: GameConfig) {
  return function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'TICK': {
        const { now } = action;
        const elapsed = (now - state.lastTick) / 1000; // seconds

        // Accumulate essence for placed cards
        const newCards = state.ownedCards.map((card) => {
          if (!card.placedInCrypt || card.isOnExpedition) return card;

          const def = getCardDef(config, card.definitionId);
          if (!def) return card;

          const rate = essenceRateForCard(card, def, config);
          const synergyBonus = getSynergyBonus(state.ownedCards, def.type, config);
          const totalRate = rate * (1 + synergyBonus / 100);

          // Essence per second = rate / 60 (rate is per minute)
          const essenceGained = (totalRate / 60) * elapsed;

          return {
            ...card,
            accumulatedEssence: card.accumulatedEssence + essenceGained,
          };
        });

        // Check completed expeditions
        const completedExpeditions: number[] = [];
        let newCurrencies = { ...state.currencies };
        state.activeExpeditions.forEach((exp, idx) => {
          if (now >= exp.completesAt) {
            completedExpeditions.push(idx);
            const zone = config.expeditions.find((z) => z.id === exp.zoneId);
            if (zone) {
              if (zone.rewards.shadowEssence) {
                const [min, max] = zone.rewards.shadowEssence;
                newCurrencies.shadowEssence += min + Math.random() * (max - min);
              }
              if (zone.rewards.soulShards) {
                const [min, max] = zone.rewards.soulShards;
                newCurrencies.soulShards += Math.floor(min + Math.random() * (max - min));
              }
              if (zone.rewards.lunarCrystals) {
                const [min, max] = zone.rewards.lunarCrystals;
                newCurrencies.lunarCrystals += Math.floor(min + Math.random() * (max - min));
              }
              if (zone.rewards.voidEnergy) {
                const [min, max] = zone.rewards.voidEnergy;
                newCurrencies.voidEnergy += Math.floor(min + Math.random() * (max - min));
              }
            }
          }
        });

        // Return expedition cards
        let updatedCards = newCards;
        if (completedExpeditions.length > 0) {
          const returnedCardIndices = new Set<number>();
          completedExpeditions.forEach((expIdx) => {
            state.activeExpeditions[expIdx].cardIds.forEach((ci) => returnedCardIndices.add(ci));
          });
          updatedCards = newCards.map((card, idx) =>
            returnedCardIndices.has(idx) ? { ...card, isOnExpedition: false } : card
          );
        }

        // Daily reset check
        let dailyFree = state.dailyFreePackAvailable;
        let lastReset = state.lastDailyReset;
        const today = new Date(now).toISOString().split('T')[0];
        const lastResetDay = new Date(lastReset).toISOString().split('T')[0];
        if (today !== lastResetDay) {
          dailyFree = true;
          lastReset = now;
        }

        return {
          ...state,
          ownedCards: updatedCards,
          currencies: newCurrencies,
          activeExpeditions: state.activeExpeditions.filter((_, i) => !completedExpeditions.includes(i)),
          playerStats: {
            ...state.playerStats,
            playTime: state.playerStats.playTime + elapsed,
            totalExpeditionsCompleted:
              state.playerStats.totalExpeditionsCompleted + completedExpeditions.length,
          },
          dailyFreePackAvailable: dailyFree,
          lastDailyReset: lastReset,
          lastTick: now,
        };
      }

      case 'COLLECT_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card || card.accumulatedEssence <= 0) return state;

        const collected = Math.floor(card.accumulatedEssence);

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence + collected,
          },
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, accumulatedEssence: 0, lastCollected: Date.now() }
              : c
          ),
          playerStats: {
            ...state.playerStats,
            totalEssenceCollected: state.playerStats.totalEssenceCollected + collected,
            experience:
              state.playerStats.experience + config.settings.experiencePerCollection,
          },
        };
      }

      case 'COLLECT_ALL': {
        let totalCollected = 0;
        const newCards = state.ownedCards.map((card) => {
          if (card.placedInCrypt && card.accumulatedEssence > 0) {
            totalCollected += Math.floor(card.accumulatedEssence);
            return { ...card, accumulatedEssence: 0, lastCollected: Date.now() };
          }
          return card;
        });

        if (totalCollected === 0) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence + totalCollected,
          },
          ownedCards: newCards,
          playerStats: {
            ...state.playerStats,
            totalEssenceCollected: state.playerStats.totalEssenceCollected + totalCollected,
            experience:
              state.playerStats.experience + config.settings.experiencePerCollection,
          },
        };
      }

      case 'PLACE_CARD': {
        const placedCount = state.ownedCards.filter((c) => c.placedInCrypt).length;
        if (placedCount >= state.cryptSlots) return state;

        const card = state.ownedCards[action.cardIndex];
        if (!card || card.placedInCrypt || card.isOnExpedition) return state;

        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, placedInCrypt: true, lastCollected: Date.now(), accumulatedEssence: 0 }
              : c
          ),
        };
      }

      case 'REMOVE_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card || !card.placedInCrypt) return state;

        // Collect any remaining essence before removing
        const remaining = Math.floor(card.accumulatedEssence);

        return {
          ...state,
          currencies: {
            ...state.currencies,
            shadowEssence: state.currencies.shadowEssence + remaining,
          },
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex
              ? { ...c, placedInCrypt: false, accumulatedEssence: 0 }
              : c
          ),
        };
      }

      case 'LEVEL_UP_CARD': {
        const card = state.ownedCards[action.cardIndex];
        if (!card) return state;

        const def = getCardDef(config, card.definitionId);
        if (!def) return state;

        const maxLevel = { twilight: 20, dusk: 30, midnight: 40, umbral: 60, eternal: 80 }[def.tier];
        if (card.level >= maxLevel) return state;

        const cost = levelUpCost(card.level, config);
        if (state.currencies.soulShards < cost) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            soulShards: state.currencies.soulShards - cost,
          },
          ownedCards: state.ownedCards.map((c, i) =>
            i === action.cardIndex ? { ...c, level: c.level + 1 } : c
          ),
          playerStats: {
            ...state.playerStats,
            experience:
              state.playerStats.experience + config.settings.experiencePerLevelUp,
          },
        };
      }

      case 'OPEN_PACK': {
        // action.cards contains the card definitions pulled from the pack
        const newOwned: OwnedCard[] = [];
        let shardGain = 0;

        for (const cardDef of action.cards) {
          // Check if already owned
          const existing = state.ownedCards.find((c) => c.definitionId === cardDef.id);
          if (existing) {
            // Duplicate -> soul shards
            shardGain += config.settings.duplicateShardValue * (TIER_ORDER.indexOf(cardDef.tier) + 1);
          } else {
            newOwned.push({
              definitionId: cardDef.id,
              level: 1,
              experience: 0,
              placedInCrypt: false,
              lastCollected: Date.now(),
              accumulatedEssence: 0,
              isOnExpedition: false,
            });
          }
        }

        return {
          ...state,
          currencies: {
            ...state.currencies,
            soulShards: state.currencies.soulShards + shardGain,
          },
          ownedCards: [...state.ownedCards, ...newOwned],
          playerStats: {
            ...state.playerStats,
            totalPacksOpened: state.playerStats.totalPacksOpened + 1,
            totalCardsCollected: state.playerStats.totalCardsCollected + newOwned.length,
            experience:
              state.playerStats.experience + config.settings.experiencePerPack,
          },
        };
      }

      case 'PURCHASE_PACK': {
        const pack = config.packs.find((p) => p.id === action.packId);
        if (!pack) return state;

        const { currency, amount } = pack.cost;
        if (state.currencies[currency] < amount) return state;

        return {
          ...state,
          currencies: {
            ...state.currencies,
            [currency]: state.currencies[currency] - amount,
          },
        };
      }

      case 'CLAIM_DAILY_PACK': {
        if (!state.dailyFreePackAvailable) return state;
        return { ...state, dailyFreePackAvailable: false };
      }

      case 'START_EXPEDITION': {
        const zone = config.expeditions.find((z) => z.id === action.zoneId);
        if (!zone) return state;

        const now = Date.now();
        return {
          ...state,
          ownedCards: state.ownedCards.map((c, i) =>
            action.cardIndices.includes(i) ? { ...c, isOnExpedition: true } : c
          ),
          activeExpeditions: [
            ...state.activeExpeditions,
            {
              zoneId: zone.id,
              cardIds: action.cardIndices,
              startedAt: now,
              completesAt: now + zone.duration * 1000,
            },
          ],
        };
      }

      case 'COMPLETE_EXPEDITION': {
        // Handled in TICK for auto-completion; manual completion if needed
        return state;
      }

      case 'ADD_CURRENCY': {
        return {
          ...state,
          currencies: {
            ...state.currencies,
            [action.currency]: state.currencies[action.currency as keyof Currencies] + action.amount,
          },
        };
      }

      case 'GAIN_EXPERIENCE': {
        let newExp = state.playerStats.experience + action.amount;
        let newLevel = state.playerStats.level;
        let newUnlocks = [...state.unlockedFeatures];
        let newSlots = state.cryptSlots;

        // Level up check
        while (newExp >= experienceForLevel(newLevel)) {
          newExp -= experienceForLevel(newLevel);
          newLevel++;
          // Unlock features for new level
          config.featureUnlocks
            .filter((f) => f.level === newLevel)
            .forEach((f) => {
              if (!newUnlocks.includes(f.feature)) {
                newUnlocks.push(f.feature);
              }
            });
          // Grant extra crypt slot every 5 levels
          if (newLevel % 5 === 0 && newSlots < config.settings.maxCryptSlots) {
            newSlots++;
          }
        }

        return {
          ...state,
          cryptSlots: newSlots,
          unlockedFeatures: newUnlocks,
          playerStats: {
            ...state.playerStats,
            level: newLevel,
            experience: newExp,
          },
        };
      }

      case 'LOAD_GAME':
        return action.state;

      case 'RESET_GAME':
        localStorage.removeItem(STORAGE_KEY);
        return createInitialState(config);

      default:
        return state;
    }
  };
}

// ---- Hook ----

export function useGameState(config: GameConfig) {
  const configRef = useRef(config);
  configRef.current = config;

  const [state, dispatch] = useReducer(
    createGameReducer(config),
    config,
    (cfg) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          const initial = createInitialState(cfg);
          const restored: GameState = {
            ...initial,
            ...parsed,
            lastTick: Date.now(),
          };

          // Calculate offline essence
          const offlineSeconds = (Date.now() - parsed.lastTick) / 1000;
          if (offlineSeconds > 5) {
            restored.ownedCards = restored.ownedCards.map((card) => {
              if (!card.placedInCrypt || card.isOnExpedition) return card;
              const def = getCardDef(cfg, card.definitionId);
              if (!def) return card;
              const rate = essenceRateForCard(card, def, cfg);
              const offlineEssence =
                (rate / 60) * offlineSeconds * cfg.settings.offlineEssenceMultiplier;
              return { ...card, accumulatedEssence: card.accumulatedEssence + offlineEssence };
            });
          }

          return restored;
        }
      } catch (e) {
        console.error('Failed to load save:', e);
      }
      return createInitialState(cfg);
    }
  );

  const lastSaveRef = useRef(Date.now());

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      dispatch({ type: 'TICK', now });

      // Auto-save
      if (now - lastSaveRef.current > configRef.current.settings.autoSaveInterval) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: now }));
        lastSaveRef.current = now;
      }

      // Level-up check
      const expNeeded = experienceForLevel(state.playerStats.level);
      if (state.playerStats.experience >= expNeeded) {
        dispatch({ type: 'GAIN_EXPERIENCE', amount: 0 });
      }
    }, configRef.current.settings.tickInterval);

    return () => clearInterval(interval);
  }, [state]);

  // Save on unmount
  useEffect(() => {
    return () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
    };
  }, [state]);

  // ---- Public API ----

  const collectCard = useCallback((cardIndex: number) => {
    dispatch({ type: 'COLLECT_CARD', cardIndex });
  }, []);

  const collectAll = useCallback(() => {
    dispatch({ type: 'COLLECT_ALL' });
  }, []);

  const placeCard = useCallback((cardIndex: number) => {
    dispatch({ type: 'PLACE_CARD', cardIndex });
  }, []);

  const removeCard = useCallback((cardIndex: number) => {
    dispatch({ type: 'REMOVE_CARD', cardIndex });
  }, []);

  const levelUpCard = useCallback((cardIndex: number) => {
    dispatch({ type: 'LEVEL_UP_CARD', cardIndex });
  }, []);

  const openPack = useCallback((cards: CardDefinition[]) => {
    dispatch({ type: 'OPEN_PACK', cards });
  }, []);

  const purchasePack = useCallback((packId: string) => {
    dispatch({ type: 'PURCHASE_PACK', packId });
  }, []);

  const claimDailyPack = useCallback(() => {
    dispatch({ type: 'CLAIM_DAILY_PACK' });
  }, []);

  const startExpedition = useCallback((zoneId: string, cardIndices: number[]) => {
    dispatch({ type: 'START_EXPEDITION', zoneId, cardIndices });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    collectCard,
    collectAll,
    placeCard,
    removeCard,
    levelUpCard,
    openPack,
    purchasePack,
    claimDailyPack,
    startExpedition,
    resetGame,
  };
}

export { levelUpCost, experienceForLevel, essenceRateForCard, getSynergyBonus, getPlacedCardTypes };
