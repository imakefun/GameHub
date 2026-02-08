import type { CardDefinition } from '../types';

// All 60 card definitions - 12 types x 5 tiers (one per tier)
// baseGenerationAmount = shadow essence per collection
// baseInterval = seconds between collections
export const cards: CardDefinition[] = [
  // ============ BEAST ============
  { id: 'beast-night-owl', name: 'Night Owl', type: 'beast', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 20, description: 'An owl with luminous eyes', flavorText: 'Its gaze pierces the darkest night.' },
  { id: 'beast-dusk-wolf', name: 'Dusk Wolf', type: 'beast', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 60, description: 'A wolf that hunts at twilight', flavorText: 'Neither fully of day nor night.' },
  { id: 'beast-dire-bear', name: 'Dire Bear', type: 'beast', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A massive bear infused with shadow', flavorText: 'The forest trembles at its approach.' },
  { id: 'beast-nightmare-stallion', name: 'Nightmare Stallion', type: 'beast', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A horse wreathed in dark flame', flavorText: 'Rides between realms with ease.' },
  { id: 'beast-ancient-phoenix', name: 'Ancient Phoenix', type: 'beast', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'A dark phoenix of rebirth', flavorText: 'From shadow ashes, it rises eternal.' },

  // ============ SPIRIT ============
  { id: 'spirit-wisp', name: 'Will-o-Wisp', type: 'spirit', tier: 'twilight', baseGenerationAmount: 1.5, baseInterval: 12, description: 'A flickering spirit light', flavorText: 'Follow the light... if you dare.' },
  { id: 'spirit-banshee', name: 'Banshee', type: 'spirit', tier: 'dusk', baseGenerationAmount: 6.9, baseInterval: 75, description: 'A wailing spirit of death', flavorText: 'Her cry heralds the end.' },
  { id: 'spirit-poltergeist', name: 'Poltergeist', type: 'spirit', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'A violent and angry spirit', flavorText: 'Unseen hands that destroy all.' },
  { id: 'spirit-reaper', name: 'Spectral Reaper', type: 'spirit', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A spirit that harvests souls', flavorText: 'The veil thins where it walks.' },
  { id: 'spirit-void-wraith', name: 'Void Wraith', type: 'spirit', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'A spirit from beyond the void', flavorText: 'It has seen what lies beyond death.' },

  // ============ SHADOW ============
  { id: 'shadow-shadow-rat', name: 'Shadow Rat', type: 'shadow', tier: 'twilight', baseGenerationAmount: 2, baseInterval: 30, description: 'A small rat touched by darkness', flavorText: 'It gnaws at the veil between worlds.' },
  { id: 'shadow-stalker', name: 'Shadow Stalker', type: 'shadow', tier: 'dusk', baseGenerationAmount: 7.2, baseInterval: 75, description: 'A predator born of darkness', flavorText: 'You never see it coming.' },
  { id: 'shadow-devourer', name: 'Shadow Devourer', type: 'shadow', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'Consumes light itself', flavorText: 'Where it passes, darkness lingers.' },
  { id: 'shadow-lord', name: 'Shadow Lord', type: 'shadow', tier: 'umbral', baseGenerationAmount: 52.5, baseInterval: 1800, description: 'Ruler of the shadow realm', flavorText: 'Darkness bows to its command.' },
  { id: 'shadow-primordial', name: 'Primordial Shadow', type: 'shadow', tier: 'eternal', baseGenerationAmount: 137.1, baseInterval: 14400, description: 'The first shadow ever cast', flavorText: 'Before light, there was this.' },

  // ============ FAE ============
  { id: 'fae-pixie', name: 'Mischief Pixie', type: 'fae', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A tiny prankster fairy', flavorText: 'Its laughter echoes through the mist.' },
  { id: 'fae-dryad', name: 'Twilight Dryad', type: 'fae', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A tree spirit of the dark woods', flavorText: 'The forest is her domain.' },
  { id: 'fae-sidhe', name: 'Sidhe Knight', type: 'fae', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A warrior of the fairy court', flavorText: 'Beautiful and terrifying in equal measure.' },
  { id: 'fae-queen', name: 'Unseelie Queen', type: 'fae', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'Ruler of the dark fae', flavorText: 'Her bargains always favor her.' },
  { id: 'fae-archfey', name: 'Archfey of Twilight', type: 'fae', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'An ancient fae of immense power', flavorText: 'Reality bends to its whims.' },

  // ============ BLOOD ============
  { id: 'blood-thrall', name: 'Blood Thrall', type: 'blood', tier: 'twilight', baseGenerationAmount: 3, baseInterval: 20, description: 'A mindless servant of the night', flavorText: 'Bound by blood, freed by none.' },
  { id: 'blood-vampire', name: 'Night Stalker Vampire', type: 'blood', tier: 'dusk', baseGenerationAmount: 8.7, baseInterval: 75, description: 'A cunning vampire hunter', flavorText: 'The hunt is its eternal pleasure.' },
  { id: 'blood-countess', name: 'Blood Countess', type: 'blood', tier: 'midnight', baseGenerationAmount: 21.6, baseInterval: 300, description: 'A noble vampire of great power', flavorText: 'She bathes in crimson moonlight.' },
  { id: 'blood-ancient', name: 'Ancient Vampire Lord', type: 'blood', tier: 'umbral', baseGenerationAmount: 53.3, baseInterval: 1800, description: 'A vampire older than history', flavorText: 'Empires rose and fell in its gaze.' },
  { id: 'blood-progenitor', name: 'Blood Progenitor', type: 'blood', tier: 'eternal', baseGenerationAmount: 150, baseInterval: 14400, description: 'The first of all vampires', flavorText: 'The source of the eternal thirst.' },

  // ============ MAGIC ============
  { id: 'magic-familiar', name: 'Witch\'s Familiar', type: 'magic', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A small magical companion', flavorText: 'It purrs with arcane energy.' },
  { id: 'magic-apprentice', name: 'Dark Apprentice', type: 'magic', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A student of forbidden arts', flavorText: 'Knowledge is power, power corrupts.' },
  { id: 'magic-enchantress', name: 'Moon Enchantress', type: 'magic', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A witch who channels moonlight', flavorText: 'Her spells weave through the night.' },
  { id: 'magic-archmage', name: 'Shadow Archmage', type: 'magic', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'Master of dark arcana', flavorText: 'The void answers to its call.' },
  { id: 'magic-primeval', name: 'Primeval Sorcerer', type: 'magic', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'Wielder of the original magic', flavorText: 'Before spells, there was will.' },

  // ============ NECROMANCY ============
  { id: 'necro-skeleton', name: 'Risen Skeleton', type: 'necromancy', tier: 'twilight', baseGenerationAmount: 3, baseInterval: 20, description: 'A skeleton pulled from the earth', flavorText: 'It remembers how to fight.' },
  { id: 'necro-gravedigger', name: 'Ghoulish Gravedigger', type: 'necromancy', tier: 'dusk', baseGenerationAmount: 8.7, baseInterval: 75, description: 'A digger of dark graves', flavorText: 'Always room for one more.' },
  { id: 'necro-lich', name: 'Lich Apprentice', type: 'necromancy', tier: 'midnight', baseGenerationAmount: 21.6, baseInterval: 300, description: 'A mage who cheated death', flavorText: 'Death was merely the beginning.' },
  { id: 'necro-deathknight', name: 'Death Knight', type: 'necromancy', tier: 'umbral', baseGenerationAmount: 53.3, baseInterval: 1800, description: 'A fallen knight of undeath', flavorText: 'Honor in death, power in undeath.' },
  { id: 'necro-archlich', name: 'Archlich', type: 'necromancy', tier: 'eternal', baseGenerationAmount: 150, baseInterval: 14400, description: 'Supreme master of undeath', flavorText: 'Eternity is its dominion.' },

  // ============ CURSED ============
  { id: 'cursed-doll', name: 'Cursed Doll', type: 'cursed', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A doll with malevolent eyes', flavorText: 'It watches when you sleep.' },
  { id: 'cursed-mirror', name: 'Mirror Wraith', type: 'cursed', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'Trapped within a cursed mirror', flavorText: 'Don\'t look too closely.' },
  { id: 'cursed-jester', name: 'Doom Jester', type: 'cursed', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A jester cursed with madness', flavorText: 'Laughter that echoes forever.' },
  { id: 'cursed-prince', name: 'Cursed Prince', type: 'cursed', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A royal trapped in eternal torment', flavorText: 'No kiss can break this curse.' },
  { id: 'cursed-abomination', name: 'Cursed Abomination', type: 'cursed', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'The ultimate cursed being', flavorText: 'Every curse leads to this.' },

  // ============ LYCANTHROPE ============
  { id: 'lycan-pup', name: 'Moon Pup', type: 'lycanthrope', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A young werewolf cub', flavorText: 'The moon calls to it already.' },
  { id: 'lycan-hunter', name: 'Feral Hunter', type: 'lycanthrope', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A werewolf that has embraced the hunt', flavorText: 'Half-human, all predator.' },
  { id: 'lycan-alpha', name: 'Alpha Werewolf', type: 'lycanthrope', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'Leader of the pack', flavorText: 'The strongest leads, the rest follow.' },
  { id: 'lycan-dire', name: 'Dire Lycan', type: 'lycanthrope', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A monstrous shapeshifter', flavorText: 'It has forgotten its human form.' },
  { id: 'lycan-primal', name: 'Primal Werewolf', type: 'lycanthrope', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'The first lycanthrope', flavorText: 'The moon was made for this creature.' },

  // ============ UNDEAD ============
  { id: 'undead-zombie', name: 'Shambling Corpse', type: 'undead', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 15, description: 'A freshly risen corpse', flavorText: 'It shuffles with dark purpose.' },
  { id: 'undead-ghoul', name: 'Graveyard Ghoul', type: 'undead', tier: 'dusk', baseGenerationAmount: 7.2, baseInterval: 75, description: 'A grave-dwelling horror', flavorText: 'It feasts on the forgotten.' },
  { id: 'undead-wight', name: 'Barrow Wight', type: 'undead', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'An ancient undead guardian', flavorText: 'It guards treasures beyond death.' },
  { id: 'undead-revenant', name: 'Vengeful Revenant', type: 'undead', tier: 'umbral', baseGenerationAmount: 52.5, baseInterval: 1800, description: 'A spirit of vengeance incarnate', flavorText: 'It will not rest until satisfied.' },
  { id: 'undead-dread-lord', name: 'Dread Lord', type: 'undead', tier: 'eternal', baseGenerationAmount: 137.1, baseInterval: 14400, description: 'Supreme ruler of the undead', flavorText: 'Death itself serves this master.' },

  // ============ STONE ============
  { id: 'stone-golemite', name: 'Golemite', type: 'stone', tier: 'twilight', baseGenerationAmount: 3.4, baseInterval: 25, description: 'A small animate stone', flavorText: 'Even pebbles have power here.' },
  { id: 'stone-gargoyle', name: 'Gargoyle', type: 'stone', tier: 'dusk', baseGenerationAmount: 9.2, baseInterval: 90, description: 'A stone guardian come to life', flavorText: 'By day a statue, by night a terror.' },
  { id: 'stone-golem', name: 'Iron Golem', type: 'stone', tier: 'midnight', baseGenerationAmount: 22, baseInterval: 300, description: 'A massive metal construct', flavorText: 'Forged in darkness, bound by runes.' },
  { id: 'stone-colossus', name: 'Obsidian Colossus', type: 'stone', tier: 'umbral', baseGenerationAmount: 54.5, baseInterval: 1800, description: 'A towering obsidian giant', flavorText: 'Mountains move when it walks.' },
  { id: 'stone-titan', name: 'Primordial Titan', type: 'stone', tier: 'eternal', baseGenerationAmount: 144, baseInterval: 14400, description: 'An ancient being of living stone', flavorText: 'It was old when the world was young.' },

  // ============ INFERNAL ============
  { id: 'infernal-imp', name: 'Fire Imp', type: 'infernal', tier: 'twilight', baseGenerationAmount: 2.9, baseInterval: 18, description: 'A small demon of fire', flavorText: 'It delights in small burns.' },
  { id: 'infernal-hellhound', name: 'Hellhound', type: 'infernal', tier: 'dusk', baseGenerationAmount: 10.1, baseInterval: 90, description: 'A demonic hunting dog', flavorText: 'It tracks souls, not scents.' },
  { id: 'infernal-succubus', name: 'Succubus', type: 'infernal', tier: 'midnight', baseGenerationAmount: 28.5, baseInterval: 300, description: 'A seductive demon', flavorText: 'Beauty is its deadliest weapon.' },
  { id: 'infernal-pit-fiend', name: 'Pit Fiend', type: 'infernal', tier: 'umbral', baseGenerationAmount: 77.1, baseInterval: 1800, description: 'A commander of the hells', flavorText: 'Legions tremble at its presence.' },
  { id: 'infernal-archdevil', name: 'Archdevil', type: 'infernal', tier: 'eternal', baseGenerationAmount: 209, baseInterval: 14400, description: 'A ruler of the infernal planes', flavorText: 'Its contracts bind even gods.' },
];

export function getCardById(id: string): CardDefinition | undefined {
  return cards.find((c) => c.id === id);
}

export function getCardsByType(type: string): CardDefinition[] {
  return cards.filter((c) => c.type === type);
}

export function getCardsByTier(tier: string): CardDefinition[] {
  return cards.filter((c) => c.tier === tier);
}
