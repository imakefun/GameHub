import { useEffect, useState } from 'react';
import { Star, X, Unlock, Wheat, Tractor, TreeDeciduous, Factory } from 'lucide-react';
import type { Crop, Animal, Tree, Machine, LevelConfig, GameConfig } from '../types';

interface LevelUpPopupProps {
  level: number;
  config: GameConfig;
  onClose: () => void;
}

interface UnlockItem {
  type: 'crop' | 'animal' | 'tree' | 'machine' | 'recipe' | 'slot';
  name: string;
  emoji: string;
  description?: string;
}

export function LevelUpPopup({ level, config, onClose }: LevelUpPopupProps) {
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  // Get level config
  const levelConfig = config.levels.find(l => l.level === level);

  // Gather all unlocks for this level
  const unlocks: UnlockItem[] = [];

  // Crops unlocked at this level
  config.crops
    .filter(c => c.unlockLevel === level)
    .forEach(crop => {
      unlocks.push({
        type: 'crop',
        name: crop.name,
        emoji: crop.emoji,
        description: `Grows in ${crop.growthTime}s`,
      });
    });

  // Animals unlocked at this level
  config.animals
    .filter(a => a.unlockLevel === level)
    .forEach(animal => {
      unlocks.push({
        type: 'animal',
        name: animal.name,
        emoji: animal.emoji,
        description: `Produces ${animal.produces.replace(/_/g, ' ')}`,
      });
    });

  // Trees unlocked at this level
  config.trees
    .filter(t => t.unlockLevel === level)
    .forEach(tree => {
      unlocks.push({
        type: 'tree',
        name: tree.name,
        emoji: tree.fruitEmoji,
        description: `Produces ${tree.name.replace(' Tree', '').replace(' Palm', '').replace(' Vine', '')}s`,
      });
    });

  // Machines unlocked at this level
  config.machines
    .filter(m => m.unlockLevel === level)
    .forEach(machine => {
      unlocks.push({
        type: 'machine',
        name: machine.name,
        emoji: machine.emoji,
        description: machine.description,
      });
    });

  // Recipes unlocked at this level (from machines already unlocked)
  config.machines.forEach(machine => {
    if (machine.unlockLevel <= level) {
      machine.recipes
        .filter(r => r.unlockLevel === level)
        .forEach(recipe => {
          const outputProduct = config.products.find(p => p.id === recipe.output.itemId);
          unlocks.push({
            type: 'recipe',
            name: outputProduct?.name || recipe.id.replace(/_/g, ' '),
            emoji: outputProduct?.emoji || machine.emoji,
            description: `${machine.name} recipe`,
          });
        });
    }
  });

  // Slot unlocks from level config
  if (levelConfig) {
    if (levelConfig.unlocksFields) {
      unlocks.push({
        type: 'slot',
        name: `Field Slot ${levelConfig.unlocksFields}`,
        emoji: '🌱',
        description: 'New farming plot',
      });
    }
    if (levelConfig.unlocksPens) {
      unlocks.push({
        type: 'slot',
        name: `Barn Slot ${levelConfig.unlocksPens}`,
        emoji: '🏠',
        description: 'New animal pen',
      });
    }
    if (levelConfig.unlocksOrchards) {
      unlocks.push({
        type: 'slot',
        name: `Orchard Slot ${levelConfig.unlocksOrchards}`,
        emoji: '🌳',
        description: 'New tree plot',
      });
    }
    if (levelConfig.unlocksMachineSlots) {
      unlocks.push({
        type: 'slot',
        name: `Factory Slot ${levelConfig.unlocksMachineSlots}`,
        emoji: '🏭',
        description: 'New machine slot',
      });
    }
    if (levelConfig.unlocksOrders) {
      unlocks.push({
        type: 'slot',
        name: `${levelConfig.unlocksOrders} Order Slots`,
        emoji: '📋',
        description: 'More simultaneous orders',
      });
    }
  }

  // Shipment unlock at level 10
  if (level === 10) {
    unlocks.push({
      type: 'slot',
      name: 'Shipment Orders',
      emoji: '📦',
      description: 'Bulk orders with big rewards!',
    });
  }

  // Second shipment slot at level 12
  if (level === 12) {
    unlocks.push({
      type: 'slot',
      name: 'Second Shipment Slot',
      emoji: '📦',
      description: 'Another shipment order slot',
    });
  }

  // Animate in content
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Generate celebration particles
  useEffect(() => {
    const celebrationEmojis = ['🎉', '⭐', '✨', '🌟', '🎊', '💫', '🏆', '🎯'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
    }));
    setParticles(newParticles);
  }, []);

  const getTypeIcon = (type: UnlockItem['type']) => {
    switch (type) {
      case 'crop': return <Wheat className="w-4 h-4" />;
      case 'animal': return <Tractor className="w-4 h-4" />;
      case 'tree': return <TreeDeciduous className="w-4 h-4" />;
      case 'machine':
      case 'recipe': return <Factory className="w-4 h-4" />;
      case 'slot': return <Unlock className="w-4 h-4" />;
    }
  };

  const getTypeBgColor = (type: UnlockItem['type']) => {
    switch (type) {
      case 'crop': return 'bg-green-100 text-green-700';
      case 'animal': return 'bg-amber-100 text-amber-700';
      case 'tree': return 'bg-emerald-100 text-emerald-700';
      case 'machine': return 'bg-purple-100 text-purple-700';
      case 'recipe': return 'bg-blue-100 text-blue-700';
      case 'slot': return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Celebration particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-2xl pointer-events-none animate-float-up"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.id * 0.1}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      <div
        className={`
          relative bg-gradient-to-b from-amber-400 via-amber-300 to-yellow-200
          rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden
          shadow-2xl border-4 border-amber-500
          transform transition-all duration-500
          ${showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-amber-600/20 hover:bg-amber-600/40 transition-colors z-10"
        >
          <X className="w-5 h-5 text-amber-800" />
        </button>

        {/* Header with fanfare */}
        <div className="relative pt-8 pb-6 px-6 text-center overflow-hidden">
          {/* Animated background rays */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-radial from-yellow-300/50 to-transparent animate-pulse" />
          </div>

          {/* Stars decoration */}
          <div className="absolute top-4 left-6 text-3xl animate-bounce-slow">
            <Star className="w-8 h-8 text-yellow-600 fill-yellow-500" />
          </div>
          <div className="absolute top-8 right-8 text-2xl animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
            <Star className="w-6 h-6 text-yellow-600 fill-yellow-500" />
          </div>
          <div className="absolute top-2 right-16 text-xl animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-500" />
          </div>

          {/* Level up text */}
          <div className="relative">
            <div className="text-amber-800 text-sm font-bold uppercase tracking-widest mb-2">
              Level Up!
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl">🎉</span>
              <div className="bg-gradient-to-b from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl shadow-lg">
                <span className="text-4xl font-black">Level {level}</span>
              </div>
              <span className="text-5xl">🎉</span>
            </div>
            <div className="mt-3 text-amber-700 font-medium">
              Congratulations, Farmer!
            </div>
          </div>
        </div>

        {/* Unlocks section */}
        <div className="bg-white/80 backdrop-blur-sm px-4 pb-6 pt-4 rounded-t-3xl -mt-2">
          {unlocks.length > 0 ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Unlock className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-800">New Unlocks!</h3>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {unlocks.map((unlock, i) => (
                  <div
                    key={i}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm
                      border-2 border-transparent hover:border-amber-300
                      transform transition-all duration-300
                      ${showContent ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                    `}
                    style={{ transitionDelay: `${i * 100 + 400}ms` }}
                  >
                    <div className="text-3xl flex-shrink-0">{unlock.emoji}</div>
                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-gray-800 truncate">{unlock.name}</div>
                      {unlock.description && (
                        <div className="text-sm text-gray-500 truncate">{unlock.description}</div>
                      )}
                    </div>
                    <div className={`flex-shrink-0 p-1.5 rounded-lg ${getTypeBgColor(unlock.type)}`}>
                      {getTypeIcon(unlock.type)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Keep farming to unlock more content!</p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onClose}
            className="
              mt-4 w-full py-3 px-6
              bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700
              text-white font-bold text-lg rounded-xl
              shadow-lg hover:shadow-xl
              transform hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
            "
          >
            Continue Farming!
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.5) rotate(360deg);
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
