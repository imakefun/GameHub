import type { Machine } from '../types';

export const machines: Machine[] = [
  // Tier 1 - Basic machines
  {
    id: 'mill',
    name: 'Flour Mill',
    emoji: '🏭',
    description: 'Grinds wheat into flour',
    recipes: [
      {
        inputs: [{ itemId: 'wheat', amount: 3 }],
        output: { itemId: 'flour', amount: 1 },
        processingTime: 15,
      },
    ],
    energyCost: 10,
    purchaseCost: 200,
    tier: 1,
  },
  {
    id: 'juicer',
    name: 'Juicer',
    emoji: '🧃',
    description: 'Makes fresh juice from fruits',
    recipes: [
      {
        inputs: [{ itemId: 'apple', amount: 3 }],
        output: { itemId: 'apple_juice', amount: 1 },
        processingTime: 10,
      },
      {
        inputs: [{ itemId: 'orange', amount: 3 }],
        output: { itemId: 'orange_juice', amount: 1 },
        processingTime: 10,
      },
      {
        inputs: [{ itemId: 'grape', amount: 4 }],
        output: { itemId: 'grape_juice', amount: 1 },
        processingTime: 12,
      },
    ],
    energyCost: 8,
    purchaseCost: 150,
    tier: 1,
  },
  // Tier 2 - Intermediate machines
  {
    id: 'oven',
    name: 'Bakery Oven',
    emoji: '🍞',
    description: 'Bakes bread and pastries',
    recipes: [
      {
        inputs: [{ itemId: 'flour', amount: 2 }],
        output: { itemId: 'bread', amount: 1 },
        processingTime: 20,
      },
      {
        inputs: [
          { itemId: 'flour', amount: 2 },
          { itemId: 'egg', amount: 2 },
        ],
        output: { itemId: 'cake', amount: 1 },
        processingTime: 30,
      },
      {
        inputs: [
          { itemId: 'flour', amount: 1 },
          { itemId: 'strawberry', amount: 3 },
        ],
        output: { itemId: 'strawberry_pie', amount: 1 },
        processingTime: 25,
      },
    ],
    energyCost: 15,
    purchaseCost: 400,
    tier: 2,
  },
  {
    id: 'cheese_press',
    name: 'Cheese Press',
    emoji: '🧀',
    description: 'Makes cheese from milk',
    recipes: [
      {
        inputs: [{ itemId: 'milk', amount: 2 }],
        output: { itemId: 'cheese', amount: 1 },
        processingTime: 25,
      },
      {
        inputs: [{ itemId: 'goat_milk', amount: 2 }],
        output: { itemId: 'goat_cheese', amount: 1 },
        processingTime: 25,
      },
    ],
    energyCost: 12,
    purchaseCost: 350,
    tier: 2,
  },
  {
    id: 'loom',
    name: 'Loom',
    emoji: '🧵',
    description: 'Weaves wool into cloth',
    recipes: [
      {
        inputs: [{ itemId: 'wool', amount: 2 }],
        output: { itemId: 'cloth', amount: 1 },
        processingTime: 30,
      },
    ],
    energyCost: 10,
    purchaseCost: 300,
    tier: 2,
  },
  // Tier 3 - Premium machines
  {
    id: 'preserves_jar',
    name: 'Preserves Jar',
    emoji: '🫙',
    description: 'Makes jams and preserves',
    recipes: [
      {
        inputs: [{ itemId: 'strawberry', amount: 4 }],
        output: { itemId: 'strawberry_jam', amount: 1 },
        processingTime: 35,
      },
      {
        inputs: [{ itemId: 'peach', amount: 4 }],
        output: { itemId: 'peach_preserves', amount: 1 },
        processingTime: 35,
      },
      {
        inputs: [{ itemId: 'cherry', amount: 5 }],
        output: { itemId: 'cherry_jam', amount: 1 },
        processingTime: 35,
      },
    ],
    energyCost: 15,
    purchaseCost: 500,
    tier: 3,
  },
  {
    id: 'oil_press',
    name: 'Oil Press',
    emoji: '🫒',
    description: 'Extracts oils and essences',
    recipes: [
      {
        inputs: [{ itemId: 'corn', amount: 5 }],
        output: { itemId: 'corn_oil', amount: 1 },
        processingTime: 40,
      },
      {
        inputs: [{ itemId: 'truffle', amount: 1 }],
        output: { itemId: 'truffle_oil', amount: 1 },
        processingTime: 60,
      },
    ],
    energyCost: 20,
    purchaseCost: 600,
    tier: 3,
  },
  {
    id: 'keg',
    name: 'Fermentation Keg',
    emoji: '🛢️',
    description: 'Ferments beverages',
    recipes: [
      {
        inputs: [{ itemId: 'grape_juice', amount: 2 }],
        output: { itemId: 'wine', amount: 1 },
        processingTime: 90,
      },
      {
        inputs: [{ itemId: 'apple_juice', amount: 2 }],
        output: { itemId: 'cider', amount: 1 },
        processingTime: 70,
      },
      {
        inputs: [
          { itemId: 'honey', amount: 1 },
          { itemId: 'wheat', amount: 2 },
        ],
        output: { itemId: 'mead', amount: 1 },
        processingTime: 80,
      },
    ],
    energyCost: 25,
    purchaseCost: 800,
    tier: 3,
  },
];
