import type { LevelCostConfig } from '../types';

// Per-tier level-up cost parameters.
// Formula: cost = ceil(baseCost * level^scalingPower)
//
// Targets from design doc:
//   Twilight L29→30 ≈ 75 shards,  Eternal L74→75 ≈ 6,200 shards
export const levelCosts: LevelCostConfig[] = [
  { tier: 'twilight',  baseCost: 2,      scalingPower: 1.076 },
  { tier: 'dusk',      baseCost: 4.23,   scalingPower: 1.076 },
  { tier: 'midnight',  baseCost: 8.94,   scalingPower: 1.076 },
  { tier: 'umbral',    baseCost: 18.92,  scalingPower: 1.076 },
  { tier: 'eternal',   baseCost: 40,     scalingPower: 1.172 },
];
