import type { LootTableEntry } from '../types';

// ============================================================
// Loot Tables — weighted card pools per pack slot
// ============================================================
// Each entry specifies what cards can appear in a pack's slots.
//
// slot:     numbered (1, 2, ...) for guarantee-like fixed slots,
//           or 'fill' for remaining slots filled by weighted random.
// cardPool: filter string — see types/index.ts LootTableEntry for syntax.
// weight:   probability weight (only matters relative to other 'fill' entries
//           for the same pack).
// newOnly:  if true, prefer cards the player doesn't already own.

export const lootTables: LootTableEntry[] = [
  // ============================================================
  // Free starter
  // ============================================================
  { packId: 'starter-tome', slot: 'fill', cardPool: 'tier:twilight', weight: 100, newOnly: true },

  // ============================================================
  // Purchasable packs
  // ============================================================

  // Twilight Pack — 5 Twilight cards, prefer new
  { packId: 'twilight-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 100, newOnly: true },

  // Dusk Caller Pack — 1 guaranteed Dusk + fill
  { packId: 'dusk-caller-pack', slot: 1, cardPool: 'tier:dusk', weight: 100 },
  { packId: 'dusk-caller-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 70 },
  { packId: 'dusk-caller-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },

  // Midnight Shroud Pack — 1 guaranteed Midnight + fill
  { packId: 'midnight-shroud-pack', slot: 1, cardPool: 'tier:midnight', weight: 100 },
  { packId: 'midnight-shroud-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 50 },
  { packId: 'midnight-shroud-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 40 },
  { packId: 'midnight-shroud-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 10 },

  // Umbral Veil Pack — 1 guaranteed Umbral + fill
  { packId: 'umbral-veil-pack', slot: 1, cardPool: 'tier:umbral', weight: 100 },
  { packId: 'umbral-veil-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },
  { packId: 'umbral-veil-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 50 },
  { packId: 'umbral-veil-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 20 },

  // Eternal Darkness Pack — 1 guaranteed Eternal + fill
  { packId: 'eternal-darkness-pack', slot: 1, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'eternal-darkness-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 40 },
  { packId: 'eternal-darkness-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 50 },
  { packId: 'eternal-darkness-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 10 },

  // Shadow Collector's Pack — 2 guaranteed Eternals + fill
  { packId: 'shadow-collectors-pack', slot: 1, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'shadow-collectors-pack', slot: 2, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'shadow-collectors-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 5 },
  { packId: 'shadow-collectors-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 10 },
  { packId: 'shadow-collectors-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 25 },
  { packId: 'shadow-collectors-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 40 },
  { packId: 'shadow-collectors-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 20 },

  // ============================================================
  // Special / event packs
  // ============================================================

  // Full Moon Special Pack — 1 Lycanthrope + 1 Umbral+ + fill
  { packId: 'full-moon-special-pack', slot: 1, cardPool: 'type:lycanthrope', weight: 100 },
  { packId: 'full-moon-special-pack', slot: 2, cardPool: 'minTier:umbral', weight: 100 },
  { packId: 'full-moon-special-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 20 },
  { packId: 'full-moon-special-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },
  { packId: 'full-moon-special-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 25 },
  { packId: 'full-moon-special-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 20 },
  { packId: 'full-moon-special-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 5 },

  // Event Reward Pack — all fill
  { packId: 'event-reward-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 30 },
  { packId: 'event-reward-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },
  { packId: 'event-reward-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 25 },
  { packId: 'event-reward-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 10 },
  { packId: 'event-reward-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 5 },

  // Timeline Fracture Pack — 1 Umbral+ guaranteed + fill
  { packId: 'timeline-fracture-pack', slot: 1, cardPool: 'minTier:umbral', weight: 100 },
  { packId: 'timeline-fracture-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 10 },
  { packId: 'timeline-fracture-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 50 },
  { packId: 'timeline-fracture-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 40 },

  // Cosmic Alignment Pack — all fill
  { packId: 'cosmic-alignment-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 10 },
  { packId: 'cosmic-alignment-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 20 },
  { packId: 'cosmic-alignment-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 30 },
  { packId: 'cosmic-alignment-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 25 },
  { packId: 'cosmic-alignment-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 15 },

  // Prestige Reward Pack — 2 Eternals + fill
  { packId: 'prestige-reward-pack', slot: 1, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'prestige-reward-pack', slot: 2, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'prestige-reward-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 10 },
  { packId: 'prestige-reward-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 40 },
  { packId: 'prestige-reward-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 50 },

  // ============================================================
  // Expedition reward packs
  // ============================================================

  // Woodland Whispers Pack — 1 Beast/Spirit guaranteed
  { packId: 'woodland-whispers-pack', slot: 1, cardPool: 'type:beast,spirit', weight: 100 },
  { packId: 'woodland-whispers-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 90 },
  { packId: 'woodland-whispers-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 10 },

  // Restless Dead Pack — 1 Undead/Necromancy guaranteed
  { packId: 'restless-dead-pack', slot: 1, cardPool: 'type:undead,necromancy', weight: 100 },
  { packId: 'restless-dead-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 70 },
  { packId: 'restless-dead-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },

  // Fairy Circle Pack — 1 Fae guaranteed
  { packId: 'fairy-circle-pack', slot: 1, cardPool: 'type:fae', weight: 100 },
  { packId: 'fairy-circle-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 60 },
  { packId: 'fairy-circle-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 40 },

  // Umbral Echoes Pack — 1 Shadow guaranteed
  { packId: 'umbral-echoes-pack', slot: 1, cardPool: 'type:shadow', weight: 100 },
  { packId: 'umbral-echoes-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 50 },
  { packId: 'umbral-echoes-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 30 },
  { packId: 'umbral-echoes-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 20 },

  // Crimson Ritual Pack — 1 Blood guaranteed
  { packId: 'crimson-ritual-pack', slot: 1, cardPool: 'type:blood', weight: 100 },
  { packId: 'crimson-ritual-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 40 },
  { packId: 'crimson-ritual-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 40 },
  { packId: 'crimson-ritual-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 20 },

  // Hex-Bound Pack — 1 Cursed guaranteed
  { packId: 'hex-bound-pack', slot: 1, cardPool: 'type:cursed', weight: 100 },
  { packId: 'hex-bound-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 30 },
  { packId: 'hex-bound-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 50 },
  { packId: 'hex-bound-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 20 },

  // Hellfire Cache Pack — 1 Infernal guaranteed
  { packId: 'hellfire-cache-pack', slot: 1, cardPool: 'type:infernal', weight: 100 },
  { packId: 'hellfire-cache-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 20 },
  { packId: 'hellfire-cache-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 50 },
  { packId: 'hellfire-cache-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 30 },

  // Starborne Collection Pack — all fill
  { packId: 'starborne-collection-pack', slot: 'fill', cardPool: 'tier:twilight', weight: 10 },
  { packId: 'starborne-collection-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 40 },
  { packId: 'starborne-collection-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 30 },
  { packId: 'starborne-collection-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 20 },

  // Forgotten Relics Pack — 1 Undead/Stone Umbral+ guaranteed
  { packId: 'forgotten-relics-pack', slot: 1, cardPool: 'minTier:umbral+type:undead,stone', weight: 100 },
  { packId: 'forgotten-relics-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 10 },
  { packId: 'forgotten-relics-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 50 },
  { packId: 'forgotten-relics-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 30 },
  { packId: 'forgotten-relics-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 10 },

  // Reality Fracture Pack — 1 Umbral+ guaranteed
  { packId: 'reality-fracture-pack', slot: 1, cardPool: 'minTier:umbral', weight: 100 },
  { packId: 'reality-fracture-pack', slot: 'fill', cardPool: 'tier:dusk', weight: 5 },
  { packId: 'reality-fracture-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 35 },
  { packId: 'reality-fracture-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 40 },
  { packId: 'reality-fracture-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 20 },

  // Astral Collection Pack — 2 Umbral+ guaranteed
  { packId: 'astral-collection-pack', slot: 1, cardPool: 'minTier:umbral', weight: 100 },
  { packId: 'astral-collection-pack', slot: 2, cardPool: 'minTier:umbral', weight: 100 },
  { packId: 'astral-collection-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 25 },
  { packId: 'astral-collection-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 50 },
  { packId: 'astral-collection-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 25 },

  // Genesis Cache Pack — 2 Eternals guaranteed
  { packId: 'genesis-cache-pack', slot: 1, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'genesis-cache-pack', slot: 2, cardPool: 'tier:eternal', weight: 100 },
  { packId: 'genesis-cache-pack', slot: 'fill', cardPool: 'tier:midnight', weight: 10 },
  { packId: 'genesis-cache-pack', slot: 'fill', cardPool: 'tier:umbral', weight: 40 },
  { packId: 'genesis-cache-pack', slot: 'fill', cardPool: 'tier:eternal', weight: 50 },
];
