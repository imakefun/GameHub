import type { Product } from '../types';

export const products: Product[] = [
  // ============ Crops ============
  { id: 'wheat', name: 'Wheat', emoji: '🌾', baseValue: 8, category: 'crop', tier: 1 },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', baseValue: 10, category: 'crop', tier: 1 },
  { id: 'potato', name: 'Potato', emoji: '🥔', baseValue: 12, category: 'crop', tier: 1 },
  { id: 'corn', name: 'Corn', emoji: '🌽', baseValue: 18, category: 'crop', tier: 2 },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', baseValue: 20, category: 'crop', tier: 2 },
  { id: 'pumpkin', name: 'Pumpkin', emoji: '🎃', baseValue: 35, category: 'crop', tier: 2 },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', baseValue: 25, category: 'crop', tier: 3 },
  { id: 'eggplant', name: 'Eggplant', emoji: '🍆', baseValue: 40, category: 'crop', tier: 3 },
  { id: 'pepper', name: 'Hot Pepper', emoji: '🌶️', baseValue: 45, category: 'crop', tier: 3 },

  // ============ Animal Products ============
  { id: 'egg', name: 'Egg', emoji: '🥚', baseValue: 15, category: 'animal', tier: 1 },
  { id: 'duck_egg', name: 'Duck Egg', emoji: '🥚', baseValue: 20, category: 'animal', tier: 1 },
  { id: 'milk', name: 'Milk', emoji: '🥛', baseValue: 30, category: 'animal', tier: 2 },
  { id: 'goat_milk', name: 'Goat Milk', emoji: '🥛', baseValue: 25, category: 'animal', tier: 2 },
  { id: 'wool', name: 'Wool', emoji: '🧶', baseValue: 40, category: 'animal', tier: 2 },
  { id: 'truffle', name: 'Truffle', emoji: '🍄', baseValue: 80, category: 'animal', tier: 3 },
  { id: 'honey', name: 'Honey', emoji: '🍯', baseValue: 50, category: 'animal', tier: 3 },

  // ============ Fruits ============
  { id: 'apple', name: 'Apple', emoji: '🍎', baseValue: 15, category: 'fruit', tier: 1 },
  { id: 'orange', name: 'Orange', emoji: '🍊', baseValue: 18, category: 'fruit', tier: 1 },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', baseValue: 22, category: 'fruit', tier: 2 },
  { id: 'peach', name: 'Peach', emoji: '🍑', baseValue: 28, category: 'fruit', tier: 2 },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', baseValue: 25, category: 'fruit', tier: 2 },
  { id: 'grape', name: 'Grape', emoji: '🍇', baseValue: 30, category: 'fruit', tier: 3 },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', baseValue: 60, category: 'fruit', tier: 3 },
  { id: 'mango', name: 'Mango', emoji: '🥭', baseValue: 50, category: 'fruit', tier: 3 },

  // ============ Processed Goods ============
  // From Mill
  { id: 'flour', name: 'Flour', emoji: '🌾', baseValue: 30, category: 'processed', tier: 1 },

  // From Juicer
  { id: 'apple_juice', name: 'Apple Juice', emoji: '🧃', baseValue: 50, category: 'processed', tier: 1 },
  { id: 'orange_juice', name: 'Orange Juice', emoji: '🧃', baseValue: 55, category: 'processed', tier: 1 },
  { id: 'grape_juice', name: 'Grape Juice', emoji: '🧃', baseValue: 65, category: 'processed', tier: 2 },

  // From Oven
  { id: 'bread', name: 'Bread', emoji: '🍞', baseValue: 70, category: 'processed', tier: 2 },
  { id: 'cake', name: 'Cake', emoji: '🎂', baseValue: 120, category: 'processed', tier: 2 },
  { id: 'strawberry_pie', name: 'Strawberry Pie', emoji: '🥧', baseValue: 140, category: 'processed', tier: 3 },

  // From Cheese Press
  { id: 'cheese', name: 'Cheese', emoji: '🧀', baseValue: 80, category: 'processed', tier: 2 },
  { id: 'goat_cheese', name: 'Goat Cheese', emoji: '🧀', baseValue: 75, category: 'processed', tier: 2 },

  // From Loom
  { id: 'cloth', name: 'Cloth', emoji: '🧵', baseValue: 100, category: 'processed', tier: 2 },

  // From Preserves Jar
  { id: 'strawberry_jam', name: 'Strawberry Jam', emoji: '🫙', baseValue: 130, category: 'processed', tier: 3 },
  { id: 'peach_preserves', name: 'Peach Preserves', emoji: '🫙', baseValue: 140, category: 'processed', tier: 3 },
  { id: 'cherry_jam', name: 'Cherry Jam', emoji: '🫙', baseValue: 145, category: 'processed', tier: 3 },

  // From Oil Press
  { id: 'corn_oil', name: 'Corn Oil', emoji: '🫒', baseValue: 110, category: 'processed', tier: 2 },
  { id: 'truffle_oil', name: 'Truffle Oil', emoji: '🫒', baseValue: 250, category: 'processed', tier: 3 },

  // From Keg
  { id: 'wine', name: 'Wine', emoji: '🍷', baseValue: 200, category: 'processed', tier: 3 },
  { id: 'cider', name: 'Cider', emoji: '🍺', baseValue: 150, category: 'processed', tier: 3 },
  { id: 'mead', name: 'Mead', emoji: '🍺', baseValue: 180, category: 'processed', tier: 3 },
];
