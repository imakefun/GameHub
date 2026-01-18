import { motion } from 'framer-motion';
import { Book, Lock, ArrowRight, Zap } from 'lucide-react';
import type { Inventory, Resources } from '../types';
import { recipes, getRecipeById } from '../data/recipes';
import { getElement } from '../data/elements';

interface RecipeBookProps {
  discoveredRecipes: string[];
  inventory: Inventory;
  resources: Resources;
  onCraft: (recipeId: string) => void;
}

export function RecipeBook({ discoveredRecipes, inventory, resources, onCraft }: RecipeBookProps) {
  const discovered = discoveredRecipes
    .map((id) => getRecipeById(id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  const undiscoveredCount = recipes.length - discovered.length;

  const canCraft = (recipeId: string): boolean => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return false;
    if (resources.energy < recipe.energyCost) return false;

    for (const input of recipe.inputs) {
      if ((inventory[input.elementId] || 0) < input.amount) return false;
    }
    return true;
  };

  // Sort by tier of output
  const sortedRecipes = [...discovered].sort((a, b) => {
    const aElement = getElement(a.output.elementId);
    const bElement = getElement(b.output.elementId);
    return (aElement?.tier || 0) - (bElement?.tier || 0);
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Book className="w-6 h-6" /> Recipe Book
        <span className="text-sm font-normal text-surface-400">
          ({discovered.length}/{recipes.length})
        </span>
      </h2>

      <div className="glass rounded-xl p-4">
        {sortedRecipes.length === 0 ? (
          <div className="text-center py-8 text-surface-400">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recipes discovered yet!</p>
            <p className="text-sm mt-1">Try combining elements in the crafting area</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRecipes.map((recipe) => {
              const output = getElement(recipe.output.elementId);
              const craftable = canCraft(recipe.id);

              return (
                <motion.div
                  key={recipe.id}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    craftable
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-surface-800/50'
                  }`}
                >
                  {/* Inputs */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {recipe.inputs.map((input, i) => {
                      const element = getElement(input.elementId);
                      const hasEnough = (inventory[input.elementId] || 0) >= input.amount;
                      return (
                        <span
                          key={`${input.elementId}-${i}`}
                          className={`flex items-center gap-0.5 px-2 py-1 rounded ${
                            hasEnough ? 'bg-surface-700' : 'bg-red-500/20 text-red-400'
                          }`}
                          title={`${element?.name} (have: ${inventory[input.elementId] || 0})`}
                        >
                          <span>{element?.emoji}</span>
                          {input.amount > 1 && (
                            <span className="text-xs">×{input.amount}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <ArrowRight className="w-4 h-4 text-surface-500 shrink-0" />

                  {/* Output */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{output?.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{output?.name}</p>
                      <p className="text-xs text-surface-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {recipe.energyCost}
                      </p>
                    </div>
                  </div>

                  {/* Craft button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCraft(recipe.id)}
                    disabled={!craftable}
                    className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      craftable
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                    }`}
                  >
                    Craft
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Undiscovered hint */}
        {undiscoveredCount > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-700">
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>{undiscoveredCount} recipes left to discover</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
