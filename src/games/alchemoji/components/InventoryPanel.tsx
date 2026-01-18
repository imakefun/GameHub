import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, X, Sparkles } from 'lucide-react';
import type { Inventory, Resources, Element, Recipe } from '../types';

interface InventoryPanelProps {
  inventory: Inventory;
  resources: Resources;
  elements: Record<string, Element>;
  recipes: Recipe[];
  onTryCraft: (elementIds: string[]) => void;
}

// Find recipe by matching inputs
function findRecipeByInputs(inputIds: string[], recipes: Recipe[]): Recipe | undefined {
  const sortedInputs = [...inputIds].sort();

  return recipes.find((recipe) => {
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
}

export function InventoryPanel({ inventory, resources, elements, recipes, onTryCraft }: InventoryPanelProps) {
  const [craftingSlots, setCraftingSlots] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const getElement = (id: string) => elements[id];

  const inventoryItems = Object.entries(inventory)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => ({ element: getElement(id)!, count }))
    .filter((item) => item.element)
    .sort((a, b) => a.element.tier - b.element.tier);

  const addToCrafting = (elementId: string) => {
    if (craftingSlots.length >= 6) return;

    // Check if we have enough in inventory
    const currentInSlots = craftingSlots.filter((id) => id === elementId).length;
    const inInventory = inventory[elementId] || 0;
    if (currentInSlots >= inInventory) return;

    setCraftingSlots([...craftingSlots, elementId]);
    setLastResult(null);
  };

  const removeFromCrafting = (index: number) => {
    setCraftingSlots(craftingSlots.filter((_, i) => i !== index));
    setLastResult(null);
  };

  const clearCrafting = () => {
    setCraftingSlots([]);
    setLastResult(null);
  };

  const attemptCraft = () => {
    if (craftingSlots.length < 2) {
      setLastResult({ success: false, message: 'Need at least 2 elements!' });
      return;
    }

    const recipe = findRecipeByInputs(craftingSlots, recipes);
    if (!recipe) {
      setLastResult({ success: false, message: 'No recipe found for this combination!' });
      return;
    }

    if (resources.energy < recipe.energyCost) {
      setLastResult({ success: false, message: `Need ${recipe.energyCost} energy!` });
      return;
    }

    onTryCraft(craftingSlots);
    const output = getElement(recipe.output.elementId);
    setLastResult({
      success: true,
      message: `Created ${output?.emoji} ${output?.name}!`,
    });
    setCraftingSlots([]);
  };

  // Preview what might be crafted
  const previewRecipe = craftingSlots.length >= 2 ? findRecipeByInputs(craftingSlots, recipes) : null;
  const previewElement = previewRecipe ? getElement(previewRecipe.output.elementId) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="text-2xl">🎒</span> Inventory
      </h2>

      {/* Crafting Area */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Beaker className="w-4 h-4" /> Crafting
          </h3>
          {craftingSlots.length > 0 && (
            <button
              onClick={clearCrafting}
              className="text-xs text-surface-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Crafting Slots */}
        <div className="flex items-center gap-2 mb-3 min-h-[60px] p-2 bg-surface-800/50 rounded-lg">
          <AnimatePresence mode="popLayout">
            {craftingSlots.map((elementId, index) => {
              const element = getElement(elementId);
              return (
                <motion.button
                  key={`${elementId}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => removeFromCrafting(index)}
                  className="relative p-2 bg-surface-700 rounded-lg hover:bg-red-500/20 transition-colors group"
                  title={`Remove ${element?.name}`}
                >
                  <span className="text-2xl">{element?.emoji}</span>
                  <X className="absolute -top-1 -right-1 w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              );
            })}
          </AnimatePresence>

          {craftingSlots.length === 0 && (
            <p className="text-surface-500 text-sm">Click elements below to add...</p>
          )}

          {craftingSlots.length > 0 && craftingSlots.length < 6 && (
            <div className="w-12 h-12 border-2 border-dashed border-surface-600 rounded-lg flex items-center justify-center text-surface-600">
              +
            </div>
          )}
        </div>

        {/* Preview */}
        {previewElement && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3 p-2 bg-primary-500/10 border border-primary-500/30 rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm">
              Will create: {previewElement.emoji} {previewElement.name}
            </span>
            <span className="text-xs text-surface-400">
              ({previewRecipe?.energyCost} ⚡)
            </span>
          </motion.div>
        )}

        {/* Result message */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-3 p-2 rounded-lg text-sm ${
                lastResult.success
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {lastResult.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Craft Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={attemptCraft}
          disabled={craftingSlots.length < 2}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            craftingSlots.length >= 2
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
              : 'bg-surface-700 text-surface-500 cursor-not-allowed'
          }`}
        >
          🔮 Forge Elements
        </motion.button>
      </div>

      {/* Inventory Grid */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-3">Elements ({inventoryItems.length})</h3>

        {inventoryItems.length === 0 ? (
          <p className="text-surface-500 text-sm text-center py-4">
            No elements yet. Use generators to produce some!
          </p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {inventoryItems.map(({ element, count }) => (
              <motion.button
                key={element.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCrafting(element.id)}
                className="relative p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-colors group"
                title={`${element.name} (Tier ${element.tier})\n${element.description}`}
              >
                <span className="text-3xl block">{element.emoji}</span>
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-surface-700 rounded-full text-xs font-medium">
                  {count}
                </span>
                <span
                  className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                    element.tier === 1
                      ? 'bg-gray-400'
                      : element.tier === 2
                        ? 'bg-green-400'
                        : element.tier === 3
                          ? 'bg-blue-400'
                          : element.tier === 4
                            ? 'bg-purple-400'
                            : 'bg-yellow-400'
                  }`}
                  title={`Tier ${element.tier}`}
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
