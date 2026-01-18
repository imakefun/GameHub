import type { Recipe } from '../types';

export const recipes: Recipe[] = [
  // ===== TIER 2 Recipes =====
  {
    id: 'steam',
    inputs: [
      { elementId: 'fire', amount: 1 },
      { elementId: 'water', amount: 1 },
    ],
    output: { elementId: 'steam', amount: 1 },
    energyCost: 10,
    discovered: false,
  },
  {
    id: 'mud',
    inputs: [
      { elementId: 'water', amount: 1 },
      { elementId: 'earth', amount: 1 },
    ],
    output: { elementId: 'mud', amount: 1 },
    energyCost: 10,
    discovered: false,
  },
  {
    id: 'dust',
    inputs: [
      { elementId: 'earth', amount: 1 },
      { elementId: 'air', amount: 1 },
    ],
    output: { elementId: 'dust', amount: 1 },
    energyCost: 10,
    discovered: false,
  },
  {
    id: 'lava',
    inputs: [
      { elementId: 'fire', amount: 1 },
      { elementId: 'earth', amount: 1 },
    ],
    output: { elementId: 'lava', amount: 1 },
    energyCost: 15,
    discovered: false,
  },
  {
    id: 'smoke',
    inputs: [
      { elementId: 'fire', amount: 1 },
      { elementId: 'air', amount: 1 },
    ],
    output: { elementId: 'smoke', amount: 1 },
    energyCost: 10,
    discovered: false,
  },
  {
    id: 'cloud',
    inputs: [
      { elementId: 'water', amount: 1 },
      { elementId: 'air', amount: 1 },
    ],
    output: { elementId: 'cloud', amount: 1 },
    energyCost: 10,
    discovered: false,
  },

  // ===== TIER 3 Recipes =====
  {
    id: 'stone',
    inputs: [
      { elementId: 'lava', amount: 1 },
      { elementId: 'water', amount: 1 },
    ],
    output: { elementId: 'stone', amount: 1 },
    energyCost: 25,
    discovered: false,
  },
  {
    id: 'rain',
    inputs: [
      { elementId: 'cloud', amount: 1 },
      { elementId: 'water', amount: 1 },
    ],
    output: { elementId: 'rain', amount: 1 },
    energyCost: 20,
    discovered: false,
  },
  {
    id: 'plant',
    inputs: [
      { elementId: 'earth', amount: 1 },
      { elementId: 'rain', amount: 1 },
    ],
    output: { elementId: 'plant', amount: 1 },
    energyCost: 30,
    discovered: false,
  },
  {
    id: 'glass',
    inputs: [
      { elementId: 'fire', amount: 2 },
      { elementId: 'dust', amount: 1 },
    ],
    output: { elementId: 'glass', amount: 1 },
    energyCost: 35,
    discovered: false,
  },
  {
    id: 'metal',
    inputs: [
      { elementId: 'stone', amount: 1 },
      { elementId: 'fire', amount: 2 },
    ],
    output: { elementId: 'metal', amount: 1 },
    energyCost: 40,
    discovered: false,
  },
  {
    id: 'ice',
    inputs: [
      { elementId: 'water', amount: 2 },
      { elementId: 'air', amount: 2 },
    ],
    output: { elementId: 'ice', amount: 1 },
    energyCost: 25,
    discovered: false,
  },
  {
    id: 'lightning',
    inputs: [
      { elementId: 'storm', amount: 1 },
      { elementId: 'energy', amount: 2 },
    ],
    output: { elementId: 'lightning', amount: 1 },
    energyCost: 45,
    discovered: false,
  },
  {
    id: 'lightning_alt',
    inputs: [
      { elementId: 'cloud', amount: 2 },
      { elementId: 'energy', amount: 3 },
    ],
    output: { elementId: 'lightning', amount: 1 },
    energyCost: 50,
    discovered: false,
  },

  // ===== TIER 4 Recipes =====
  {
    id: 'tree',
    inputs: [
      { elementId: 'plant', amount: 2 },
      { elementId: 'earth', amount: 2 },
    ],
    output: { elementId: 'tree', amount: 1 },
    energyCost: 50,
    discovered: false,
  },
  {
    id: 'flower',
    inputs: [
      { elementId: 'plant', amount: 1 },
      { elementId: 'rain', amount: 1 },
    ],
    output: { elementId: 'flower', amount: 1 },
    energyCost: 45,
    discovered: false,
  },
  {
    id: 'crystal',
    inputs: [
      { elementId: 'stone', amount: 2 },
      { elementId: 'ice', amount: 1 },
      { elementId: 'energy', amount: 2 },
    ],
    output: { elementId: 'crystal', amount: 1 },
    energyCost: 80,
    discovered: false,
  },
  {
    id: 'sword',
    inputs: [
      { elementId: 'metal', amount: 2 },
      { elementId: 'fire', amount: 2 },
    ],
    output: { elementId: 'sword', amount: 1 },
    energyCost: 70,
    discovered: false,
  },
  {
    id: 'potion',
    inputs: [
      { elementId: 'water', amount: 2 },
      { elementId: 'plant', amount: 1 },
      { elementId: 'glass', amount: 1 },
    ],
    output: { elementId: 'potion', amount: 1 },
    energyCost: 60,
    discovered: false,
  },
  {
    id: 'storm',
    inputs: [
      { elementId: 'cloud', amount: 2 },
      { elementId: 'air', amount: 2 },
    ],
    output: { elementId: 'storm', amount: 1 },
    energyCost: 55,
    discovered: false,
  },
  {
    id: 'snow',
    inputs: [
      { elementId: 'ice', amount: 1 },
      { elementId: 'cloud', amount: 1 },
    ],
    output: { elementId: 'snow', amount: 1 },
    energyCost: 50,
    discovered: false,
  },

  // ===== TIER 5 Recipes =====
  {
    id: 'phoenix',
    inputs: [
      { elementId: 'fire', amount: 5 },
      { elementId: 'energy', amount: 5 },
    ],
    output: { elementId: 'phoenix', amount: 1 },
    energyCost: 150,
    discovered: false,
  },
  {
    id: 'dragon',
    inputs: [
      { elementId: 'fire', amount: 3 },
      { elementId: 'lava', amount: 2 },
      { elementId: 'air', amount: 2 },
    ],
    output: { elementId: 'dragon', amount: 1 },
    energyCost: 200,
    discovered: false,
  },
  {
    id: 'unicorn',
    inputs: [
      { elementId: 'crystal', amount: 1 },
      { elementId: 'flower', amount: 2 },
      { elementId: 'energy', amount: 3 },
    ],
    output: { elementId: 'unicorn', amount: 1 },
    energyCost: 180,
    discovered: false,
  },
  {
    id: 'rainbow',
    inputs: [
      { elementId: 'rain', amount: 2 },
      { elementId: 'sun', amount: 1 },
    ],
    output: { elementId: 'rainbow', amount: 1 },
    energyCost: 120,
    discovered: false,
  },
  {
    id: 'rainbow_alt',
    inputs: [
      { elementId: 'water', amount: 3 },
      { elementId: 'fire', amount: 2 },
      { elementId: 'energy', amount: 3 },
    ],
    output: { elementId: 'rainbow', amount: 1 },
    energyCost: 130,
    discovered: false,
  },
  {
    id: 'star',
    inputs: [
      { elementId: 'fire', amount: 3 },
      { elementId: 'energy', amount: 5 },
      { elementId: 'air', amount: 2 },
    ],
    output: { elementId: 'star', amount: 1 },
    energyCost: 250,
    discovered: false,
  },
  {
    id: 'moon',
    inputs: [
      { elementId: 'stone', amount: 2 },
      { elementId: 'ice', amount: 2 },
      { elementId: 'energy', amount: 4 },
    ],
    output: { elementId: 'moon', amount: 1 },
    energyCost: 220,
    discovered: false,
  },
  {
    id: 'sun',
    inputs: [
      { elementId: 'fire', amount: 5 },
      { elementId: 'energy', amount: 5 },
      { elementId: 'star', amount: 1 },
    ],
    output: { elementId: 'sun', amount: 1 },
    energyCost: 300,
    discovered: false,
  },
];

// Find recipe by matching inputs (order-independent)
export const findRecipeByInputs = (inputIds: string[]): Recipe | undefined => {
  const sortedInputs = [...inputIds].sort();

  return recipes.find((recipe) => {
    // Expand recipe inputs to individual element IDs
    const recipeInputIds: string[] = [];
    recipe.inputs.forEach((input) => {
      for (let i = 0; i < input.amount; i++) {
        recipeInputIds.push(input.elementId);
      }
    });
    const sortedRecipeInputs = recipeInputIds.sort();

    if (sortedInputs.length !== sortedRecipeInputs.length) return false;
    return sortedInputs.every((id, idx) => id === sortedRecipeInputs[idx]);
  });
};

export const getRecipeById = (id: string): Recipe | undefined =>
  recipes.find((r) => r.id === id);

export const getRecipesForElement = (elementId: string): Recipe[] =>
  recipes.filter((r) => r.output.elementId === elementId);
