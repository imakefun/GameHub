import type { CardDefinition } from '../types';

// All 120 card definitions - 12 types x 5 tiers x 2 cards per slot
// baseGenerationAmount = shadow essence per collection
// baseInterval = seconds between collections
export const cards: CardDefinition[] = [
  // ============ BEAST (CL 1) ============
  { id: 'beast-night-owl', name: 'Night Owl', type: 'beast', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 20, description: 'An owl with luminous eyes', flavorText: 'Its gaze pierces the darkest night.' },
  { id: 'beast-shadow-rat', name: 'Shadow Rat', type: 'beast', tier: 'twilight', baseGenerationAmount: 2.0, baseInterval: 18, description: 'A rat touched by darkness', flavorText: 'It gnaws at the veil between worlds.' },
  { id: 'beast-dusk-wolf', name: 'Dusk Wolf', type: 'beast', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 60, description: 'A wolf that hunts at twilight', flavorText: 'Neither fully of day nor night.' },
  { id: 'beast-night-stalker', name: 'Nightstalker Cat', type: 'beast', tier: 'dusk', baseGenerationAmount: 7.5, baseInterval: 55, description: 'A feline predator of the dark', flavorText: 'Silent paws on moonlit stone.' },
  { id: 'beast-dire-bear', name: 'Dire Bear', type: 'beast', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A massive bear infused with shadow', flavorText: 'The forest trembles at its approach.' },
  { id: 'beast-shadow-stag', name: 'Shadow Stag', type: 'beast', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 270, description: 'A spectral deer with obsidian antlers', flavorText: 'It runs between moonbeams.' },
  { id: 'beast-nightmare-stallion', name: 'Nightmare Stallion', type: 'beast', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A horse wreathed in dark flame', flavorText: 'Rides between realms with ease.' },
  { id: 'beast-abyssal-serpent', name: 'Abyssal Serpent', type: 'beast', tier: 'umbral', baseGenerationAmount: 55, baseInterval: 1650, description: 'A massive snake from the deep', flavorText: 'Its coils could crush mountains.' },
  { id: 'beast-ancient-phoenix', name: 'Ancient Phoenix', type: 'beast', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'A dark phoenix of rebirth', flavorText: 'From shadow ashes, it rises eternal.' },
  { id: 'beast-primordial-leviathan', name: 'Primordial Leviathan', type: 'beast', tier: 'eternal', baseGenerationAmount: 150, baseInterval: 13200, description: 'The first great beast of the deep', flavorText: 'Oceans remember its name.' },

  // ============ SPIRIT (CL 1) ============
  { id: 'spirit-wisp', name: 'Will-o-Wisp', type: 'spirit', tier: 'twilight', baseGenerationAmount: 1.5, baseInterval: 12, description: 'A flickering spirit light', flavorText: 'Follow the light... if you dare.' },
  { id: 'spirit-shade', name: 'Whispering Shade', type: 'spirit', tier: 'twilight', baseGenerationAmount: 1.3, baseInterval: 10, description: 'A faint murmuring presence', flavorText: 'It speaks in forgotten tongues.' },
  { id: 'spirit-banshee', name: 'Banshee', type: 'spirit', tier: 'dusk', baseGenerationAmount: 6.9, baseInterval: 75, description: 'A wailing spirit of death', flavorText: 'Her cry heralds the end.' },
  { id: 'spirit-phantom', name: 'Grave Phantom', type: 'spirit', tier: 'dusk', baseGenerationAmount: 6.5, baseInterval: 70, description: 'A ghost bound to burial grounds', flavorText: 'It mourns what it cannot remember.' },
  { id: 'spirit-poltergeist', name: 'Poltergeist', type: 'spirit', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'A violent and angry spirit', flavorText: 'Unseen hands that destroy all.' },
  { id: 'spirit-wraith-maiden', name: 'Wraith Maiden', type: 'spirit', tier: 'midnight', baseGenerationAmount: 19, baseInterval: 280, description: 'A beautiful spirit of sorrow', flavorText: 'Her tears freeze the living.' },
  { id: 'spirit-reaper', name: 'Spectral Reaper', type: 'spirit', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A spirit that harvests souls', flavorText: 'The veil thins where it walks.' },
  { id: 'spirit-soul-collector', name: 'Soul Collector', type: 'spirit', tier: 'umbral', baseGenerationAmount: 56, baseInterval: 1700, description: 'An ancient spirit bound to duty', flavorText: 'Every soul has a price.' },
  { id: 'spirit-void-wraith', name: 'Void Wraith', type: 'spirit', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'A spirit from beyond the void', flavorText: 'It has seen what lies beyond death.' },
  { id: 'spirit-eternity-warden', name: 'Eternity Warden', type: 'spirit', tier: 'eternal', baseGenerationAmount: 170, baseInterval: 13800, description: 'Guardian of the spirit realm', flavorText: 'Time means nothing to the dead.' },

  // ============ SHADOW (CL 1) ============
  { id: 'shadow-shadow-rat', name: 'Shadow Rat', type: 'shadow', tier: 'twilight', baseGenerationAmount: 2, baseInterval: 30, description: 'A small rat touched by darkness', flavorText: 'It gnaws at the veil between worlds.' },
  { id: 'shadow-dark-imp', name: 'Dark Imp', type: 'shadow', tier: 'twilight', baseGenerationAmount: 1.8, baseInterval: 25, description: 'A tiny creature of living shadow', flavorText: 'Mischief made manifest.' },
  { id: 'shadow-stalker', name: 'Shadow Stalker', type: 'shadow', tier: 'dusk', baseGenerationAmount: 7.2, baseInterval: 75, description: 'A predator born of darkness', flavorText: 'You never see it coming.' },
  { id: 'shadow-nightcrawler', name: 'Nightcrawler', type: 'shadow', tier: 'dusk', baseGenerationAmount: 6.8, baseInterval: 70, description: 'A serpentine shadow being', flavorText: 'It slithers between the cracks of reality.' },
  { id: 'shadow-devourer', name: 'Shadow Devourer', type: 'shadow', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'Consumes light itself', flavorText: 'Where it passes, darkness lingers.' },
  { id: 'shadow-eclipse-watcher', name: 'Eclipse Watcher', type: 'shadow', tier: 'midnight', baseGenerationAmount: 19, baseInterval: 285, description: 'A sentinel of perpetual darkness', flavorText: 'It waits for the sun to die.' },
  { id: 'shadow-lord', name: 'Shadow Lord', type: 'shadow', tier: 'umbral', baseGenerationAmount: 52.5, baseInterval: 1800, description: 'Ruler of the shadow realm', flavorText: 'Darkness bows to its command.' },
  { id: 'shadow-void-weaver', name: 'Void Weaver', type: 'shadow', tier: 'umbral', baseGenerationAmount: 50, baseInterval: 1700, description: 'Spins darkness into solid form', flavorText: 'The fabric of night is its loom.' },
  { id: 'shadow-primordial', name: 'Primordial Shadow', type: 'shadow', tier: 'eternal', baseGenerationAmount: 137.1, baseInterval: 14400, description: 'The first shadow ever cast', flavorText: 'Before light, there was this.' },
  { id: 'shadow-umbral-god', name: 'Umbral God', type: 'shadow', tier: 'eternal', baseGenerationAmount: 145, baseInterval: 14400, description: 'A deity of absolute darkness', flavorText: 'Stars extinguish in its presence.' },

  // ============ FAE (CL 20) ============
  { id: 'fae-pixie', name: 'Mischief Pixie', type: 'fae', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A tiny prankster fairy', flavorText: 'Its laughter echoes through the mist.' },
  { id: 'fae-sprite', name: 'Thorn Sprite', type: 'fae', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 14, description: 'A sprite wrapped in brambles', flavorText: 'Beauty and pain intertwined.' },
  { id: 'fae-dryad', name: 'Twilight Dryad', type: 'fae', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A tree spirit of the dark woods', flavorText: 'The forest is her domain.' },
  { id: 'fae-satyr', name: 'Moonlit Satyr', type: 'fae', tier: 'dusk', baseGenerationAmount: 7.5, baseInterval: 70, description: 'A dancing creature of the woods', flavorText: 'Its pipes lure the unwary.' },
  { id: 'fae-sidhe', name: 'Sidhe Knight', type: 'fae', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A warrior of the fairy court', flavorText: 'Beautiful and terrifying in equal measure.' },
  { id: 'fae-changeling', name: 'Changeling Lord', type: 'fae', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 280, description: 'A shapeshifting noble of the fae', flavorText: 'Which face is the true one?' },
  { id: 'fae-queen', name: 'Unseelie Queen', type: 'fae', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'Ruler of the dark fae', flavorText: 'Her bargains always favor her.' },
  { id: 'fae-wild-king', name: 'Wild King', type: 'fae', tier: 'umbral', baseGenerationAmount: 57, baseInterval: 1750, description: 'Lord of untamed nature', flavorText: 'Where he walks, the wild grows.' },
  { id: 'fae-archfey', name: 'Archfey of Twilight', type: 'fae', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'An ancient fae of immense power', flavorText: 'Reality bends to its whims.' },
  { id: 'fae-dream-sovereign', name: 'Dream Sovereign', type: 'fae', tier: 'eternal', baseGenerationAmount: 170, baseInterval: 13500, description: 'Ruler of the dreaming realm', flavorText: 'All sleep belongs to this lord.' },

  // ============ BLOOD (CL 10) ============
  { id: 'blood-thrall', name: 'Blood Thrall', type: 'blood', tier: 'twilight', baseGenerationAmount: 3, baseInterval: 20, description: 'A mindless servant of the night', flavorText: 'Bound by blood, freed by none.' },
  { id: 'blood-leech', name: 'Crimson Leech', type: 'blood', tier: 'twilight', baseGenerationAmount: 2.8, baseInterval: 18, description: 'A parasitic blood creature', flavorText: 'It feeds on life itself.' },
  { id: 'blood-vampire', name: 'Night Stalker Vampire', type: 'blood', tier: 'dusk', baseGenerationAmount: 8.7, baseInterval: 75, description: 'A cunning vampire hunter', flavorText: 'The hunt is its eternal pleasure.' },
  { id: 'blood-nosferatu', name: 'Nosferatu', type: 'blood', tier: 'dusk', baseGenerationAmount: 9.0, baseInterval: 80, description: 'An ancient strain of vampire', flavorText: 'Fear incarnate in dead flesh.' },
  { id: 'blood-countess', name: 'Blood Countess', type: 'blood', tier: 'midnight', baseGenerationAmount: 21.6, baseInterval: 300, description: 'A noble vampire of great power', flavorText: 'She bathes in crimson moonlight.' },
  { id: 'blood-crimson-knight', name: 'Crimson Knight', type: 'blood', tier: 'midnight', baseGenerationAmount: 22, baseInterval: 310, description: 'A blood-sworn warrior of darkness', flavorText: 'His blade thirsts as he does.' },
  { id: 'blood-ancient', name: 'Ancient Vampire Lord', type: 'blood', tier: 'umbral', baseGenerationAmount: 53.3, baseInterval: 1800, description: 'A vampire older than history', flavorText: 'Empires rose and fell in its gaze.' },
  { id: 'blood-sanguine-elder', name: 'Sanguine Elder', type: 'blood', tier: 'umbral', baseGenerationAmount: 55, baseInterval: 1850, description: 'The eldest of the blood council', flavorText: 'Its memory spans millennia.' },
  { id: 'blood-progenitor', name: 'Blood Progenitor', type: 'blood', tier: 'eternal', baseGenerationAmount: 150, baseInterval: 14400, description: 'The first of all vampires', flavorText: 'The source of the eternal thirst.' },
  { id: 'blood-crimson-god', name: 'Crimson God', type: 'blood', tier: 'eternal', baseGenerationAmount: 155, baseInterval: 14400, description: 'A deity born of blood', flavorText: 'All veins lead to this throne.' },

  // ============ MAGIC (CL 20) ============
  { id: 'magic-familiar', name: "Witch's Familiar", type: 'magic', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A small magical companion', flavorText: 'It purrs with arcane energy.' },
  { id: 'magic-candle-wisp', name: 'Candle Wisp', type: 'magic', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 14, description: 'A flame spirit bound to a candle', flavorText: 'Its light reveals hidden truths.' },
  { id: 'magic-apprentice', name: 'Dark Apprentice', type: 'magic', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A student of forbidden arts', flavorText: 'Knowledge is power, power corrupts.' },
  { id: 'magic-hex-weaver', name: 'Hex Weaver', type: 'magic', tier: 'dusk', baseGenerationAmount: 7.8, baseInterval: 72, description: 'A spinner of dark enchantments', flavorText: 'Each thread is a binding curse.' },
  { id: 'magic-enchantress', name: 'Moon Enchantress', type: 'magic', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A witch who channels moonlight', flavorText: 'Her spells weave through the night.' },
  { id: 'magic-storm-caller', name: 'Storm Caller', type: 'magic', tier: 'midnight', baseGenerationAmount: 23, baseInterval: 310, description: 'A mage who commands lightning', flavorText: 'Thunder follows in their wake.' },
  { id: 'magic-archmage', name: 'Shadow Archmage', type: 'magic', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'Master of dark arcana', flavorText: 'The void answers to its call.' },
  { id: 'magic-void-oracle', name: 'Void Oracle', type: 'magic', tier: 'umbral', baseGenerationAmount: 58, baseInterval: 1750, description: 'Seer of forbidden knowledge', flavorText: 'It reads futures written in darkness.' },
  { id: 'magic-primeval', name: 'Primeval Sorcerer', type: 'magic', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'Wielder of the original magic', flavorText: 'Before spells, there was will.' },
  { id: 'magic-arcane-titan', name: 'Arcane Titan', type: 'magic', tier: 'eternal', baseGenerationAmount: 165, baseInterval: 14400, description: 'A being of pure magical force', flavorText: 'Reality obeys its every thought.' },

  // ============ NECROMANCY (CL 30) ============
  { id: 'necro-skeleton', name: 'Risen Skeleton', type: 'necromancy', tier: 'twilight', baseGenerationAmount: 3, baseInterval: 20, description: 'A skeleton pulled from the earth', flavorText: 'It remembers how to fight.' },
  { id: 'necro-corpse-candle', name: 'Corpse Candle', type: 'necromancy', tier: 'twilight', baseGenerationAmount: 2.8, baseInterval: 18, description: 'A light that guides the dead', flavorText: 'Follow it to your grave.' },
  { id: 'necro-gravedigger', name: 'Ghoulish Gravedigger', type: 'necromancy', tier: 'dusk', baseGenerationAmount: 8.7, baseInterval: 75, description: 'A digger of dark graves', flavorText: 'Always room for one more.' },
  { id: 'necro-bone-golem', name: 'Bone Golem', type: 'necromancy', tier: 'dusk', baseGenerationAmount: 9.0, baseInterval: 78, description: 'A construct of fused bones', flavorText: 'Built from a thousand corpses.' },
  { id: 'necro-lich', name: 'Lich Apprentice', type: 'necromancy', tier: 'midnight', baseGenerationAmount: 21.6, baseInterval: 300, description: 'A mage who cheated death', flavorText: 'Death was merely the beginning.' },
  { id: 'necro-plague-bearer', name: 'Plague Bearer', type: 'necromancy', tier: 'midnight', baseGenerationAmount: 22, baseInterval: 305, description: 'Spreads death wherever it walks', flavorText: 'Disease is just another weapon.' },
  { id: 'necro-deathknight', name: 'Death Knight', type: 'necromancy', tier: 'umbral', baseGenerationAmount: 53.3, baseInterval: 1800, description: 'A fallen knight of undeath', flavorText: 'Honor in death, power in undeath.' },
  { id: 'necro-soul-binder', name: 'Soul Binder', type: 'necromancy', tier: 'umbral', baseGenerationAmount: 55, baseInterval: 1850, description: 'Chains spirits to its will', flavorText: 'No soul escapes its grasp.' },
  { id: 'necro-archlich', name: 'Archlich', type: 'necromancy', tier: 'eternal', baseGenerationAmount: 150, baseInterval: 14400, description: 'Supreme master of undeath', flavorText: 'Eternity is its dominion.' },
  { id: 'necro-death-god', name: 'Death God', type: 'necromancy', tier: 'eternal', baseGenerationAmount: 155, baseInterval: 14400, description: 'The ultimate master of death', flavorText: 'Even liches kneel before this throne.' },

  // ============ CURSED (CL 40) ============
  { id: 'cursed-doll', name: 'Cursed Doll', type: 'cursed', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A doll with malevolent eyes', flavorText: 'It watches when you sleep.' },
  { id: 'cursed-raven', name: 'Ill-Omen Raven', type: 'cursed', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 14, description: 'A bird that brings misfortune', flavorText: 'Where it perches, doom follows.' },
  { id: 'cursed-mirror', name: 'Mirror Wraith', type: 'cursed', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'Trapped within a cursed mirror', flavorText: "Don't look too closely." },
  { id: 'cursed-hag', name: 'Bog Hag', type: 'cursed', tier: 'dusk', baseGenerationAmount: 7.8, baseInterval: 72, description: 'A witch cursed to eternal ugliness', flavorText: 'Her beauty was her undoing.' },
  { id: 'cursed-jester', name: 'Doom Jester', type: 'cursed', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'A jester cursed with madness', flavorText: 'Laughter that echoes forever.' },
  { id: 'cursed-headless', name: 'Headless Horseman', type: 'cursed', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 280, description: 'Rides eternally seeking its head', flavorText: 'The galloping never stops.' },
  { id: 'cursed-prince', name: 'Cursed Prince', type: 'cursed', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A royal trapped in eternal torment', flavorText: 'No kiss can break this curse.' },
  { id: 'cursed-oracle', name: 'Blighted Oracle', type: 'cursed', tier: 'umbral', baseGenerationAmount: 57, baseInterval: 1750, description: 'A seer cursed with true sight', flavorText: 'To see everything is to suffer.' },
  { id: 'cursed-abomination', name: 'Cursed Abomination', type: 'cursed', tier: 'eternal', baseGenerationAmount: 180, baseInterval: 14400, description: 'The ultimate cursed being', flavorText: 'Every curse leads to this.' },
  { id: 'cursed-entropy-lord', name: 'Entropy Lord', type: 'cursed', tier: 'eternal', baseGenerationAmount: 175, baseInterval: 14400, description: 'The living embodiment of decay', flavorText: 'All things end. It ensures this.' },

  // ============ LYCANTHROPE (CL 30) ============
  { id: 'lycan-pup', name: 'Moon Pup', type: 'lycanthrope', tier: 'twilight', baseGenerationAmount: 2.4, baseInterval: 15, description: 'A young werewolf cub', flavorText: 'The moon calls to it already.' },
  { id: 'lycan-prowler', name: 'Night Prowler', type: 'lycanthrope', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 14, description: 'A young lycanthrope learning to hunt', flavorText: 'Every shadow could be prey.' },
  { id: 'lycan-hunter', name: 'Feral Hunter', type: 'lycanthrope', tier: 'dusk', baseGenerationAmount: 8, baseInterval: 75, description: 'A werewolf that has embraced the hunt', flavorText: 'Half-human, all predator.' },
  { id: 'lycan-ravager', name: 'Pack Ravager', type: 'lycanthrope', tier: 'dusk', baseGenerationAmount: 7.8, baseInterval: 72, description: 'The enforcer of the pack', flavorText: 'Disobedience is not tolerated.' },
  { id: 'lycan-alpha', name: 'Alpha Werewolf', type: 'lycanthrope', tier: 'midnight', baseGenerationAmount: 22.5, baseInterval: 300, description: 'Leader of the pack', flavorText: 'The strongest leads, the rest follow.' },
  { id: 'lycan-moon-howler', name: 'Moon Howler', type: 'lycanthrope', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 280, description: 'Its howl can shatter stone', flavorText: 'The moon sings through its voice.' },
  { id: 'lycan-dire', name: 'Dire Lycan', type: 'lycanthrope', tier: 'umbral', baseGenerationAmount: 60, baseInterval: 1800, description: 'A monstrous shapeshifter', flavorText: 'It has forgotten its human form.' },
  { id: 'lycan-blood-alpha', name: 'Blood Alpha', type: 'lycanthrope', tier: 'umbral', baseGenerationAmount: 57, baseInterval: 1750, description: 'An alpha enhanced by blood magic', flavorText: 'Two curses made one power.' },
  { id: 'lycan-primal', name: 'Primal Werewolf', type: 'lycanthrope', tier: 'eternal', baseGenerationAmount: 160, baseInterval: 14400, description: 'The first lycanthrope', flavorText: 'The moon was made for this creature.' },
  { id: 'lycan-moon-god', name: 'Moon God', type: 'lycanthrope', tier: 'eternal', baseGenerationAmount: 165, baseInterval: 14400, description: 'Deity of the lunar curse', flavorText: 'Every full moon is its celebration.' },

  // ============ UNDEAD (CL 10) ============
  { id: 'undead-zombie', name: 'Shambling Corpse', type: 'undead', tier: 'twilight', baseGenerationAmount: 2.2, baseInterval: 15, description: 'A freshly risen corpse', flavorText: 'It shuffles with dark purpose.' },
  { id: 'undead-crawler', name: 'Grave Crawler', type: 'undead', tier: 'twilight', baseGenerationAmount: 2.0, baseInterval: 14, description: 'A half-buried corpse that crawls', flavorText: 'Six feet was not deep enough.' },
  { id: 'undead-ghoul', name: 'Graveyard Ghoul', type: 'undead', tier: 'dusk', baseGenerationAmount: 7.2, baseInterval: 75, description: 'A grave-dwelling horror', flavorText: 'It feasts on the forgotten.' },
  { id: 'undead-draugr', name: 'Draugr', type: 'undead', tier: 'dusk', baseGenerationAmount: 7.5, baseInterval: 78, description: 'A cursed viking warrior', flavorText: 'Death could not end its rage.' },
  { id: 'undead-wight', name: 'Barrow Wight', type: 'undead', tier: 'midnight', baseGenerationAmount: 20, baseInterval: 300, description: 'An ancient undead guardian', flavorText: 'It guards treasures beyond death.' },
  { id: 'undead-mummy-lord', name: 'Mummy Lord', type: 'undead', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 305, description: 'An entombed pharaoh risen', flavorText: 'Its curse spans millennia.' },
  { id: 'undead-revenant', name: 'Vengeful Revenant', type: 'undead', tier: 'umbral', baseGenerationAmount: 52.5, baseInterval: 1800, description: 'A spirit of vengeance incarnate', flavorText: 'It will not rest until satisfied.' },
  { id: 'undead-bone-dragon', name: 'Bone Dragon', type: 'undead', tier: 'umbral', baseGenerationAmount: 55, baseInterval: 1850, description: 'A dragon raised from ancient bones', flavorText: 'Death did not diminish its fury.' },
  { id: 'undead-dread-lord', name: 'Dread Lord', type: 'undead', tier: 'eternal', baseGenerationAmount: 137.1, baseInterval: 14400, description: 'Supreme ruler of the undead', flavorText: 'Death itself serves this master.' },
  { id: 'undead-grave-titan', name: 'Grave Titan', type: 'undead', tier: 'eternal', baseGenerationAmount: 140, baseInterval: 14400, description: 'A colossus of corpses and bone', flavorText: 'An army in one form.' },

  // ============ STONE (CL 40) ============
  { id: 'stone-golemite', name: 'Golemite', type: 'stone', tier: 'twilight', baseGenerationAmount: 3.4, baseInterval: 25, description: 'A small animate stone', flavorText: 'Even pebbles have power here.' },
  { id: 'stone-shard-sprite', name: 'Shard Sprite', type: 'stone', tier: 'twilight', baseGenerationAmount: 3.2, baseInterval: 24, description: 'A creature of crystal fragments', flavorText: 'It gleams with inner light.' },
  { id: 'stone-gargoyle', name: 'Gargoyle', type: 'stone', tier: 'dusk', baseGenerationAmount: 9.2, baseInterval: 90, description: 'A stone guardian come to life', flavorText: 'By day a statue, by night a terror.' },
  { id: 'stone-earth-elemental', name: 'Earth Elemental', type: 'stone', tier: 'dusk', baseGenerationAmount: 9.0, baseInterval: 88, description: 'A mass of living rock', flavorText: 'The ground itself fights back.' },
  { id: 'stone-golem', name: 'Iron Golem', type: 'stone', tier: 'midnight', baseGenerationAmount: 22, baseInterval: 300, description: 'A massive metal construct', flavorText: 'Forged in darkness, bound by runes.' },
  { id: 'stone-crystal-guardian', name: 'Crystal Guardian', type: 'stone', tier: 'midnight', baseGenerationAmount: 21, baseInterval: 290, description: 'A sentinel made of living crystal', flavorText: 'Its body refracts dark energy.' },
  { id: 'stone-colossus', name: 'Obsidian Colossus', type: 'stone', tier: 'umbral', baseGenerationAmount: 54.5, baseInterval: 1800, description: 'A towering obsidian giant', flavorText: 'Mountains move when it walks.' },
  { id: 'stone-monolith', name: 'Living Monolith', type: 'stone', tier: 'umbral', baseGenerationAmount: 52, baseInterval: 1750, description: 'An ancient standing stone awakened', flavorText: 'It remembers the first dawn.' },
  { id: 'stone-titan', name: 'Primordial Titan', type: 'stone', tier: 'eternal', baseGenerationAmount: 144, baseInterval: 14400, description: 'An ancient being of living stone', flavorText: 'It was old when the world was young.' },
  { id: 'stone-world-golem', name: 'World Golem', type: 'stone', tier: 'eternal', baseGenerationAmount: 148, baseInterval: 14400, description: 'A construct the size of a mountain', flavorText: 'Civilizations were built on its back.' },

  // ============ INFERNAL (CL 50) ============
  { id: 'infernal-imp', name: 'Fire Imp', type: 'infernal', tier: 'twilight', baseGenerationAmount: 2.9, baseInterval: 18, description: 'A small demon of fire', flavorText: 'It delights in small burns.' },
  { id: 'infernal-ember-fiend', name: 'Ember Fiend', type: 'infernal', tier: 'twilight', baseGenerationAmount: 2.7, baseInterval: 17, description: 'A creature of smoldering hate', flavorText: 'It never truly goes out.' },
  { id: 'infernal-hellhound', name: 'Hellhound', type: 'infernal', tier: 'dusk', baseGenerationAmount: 10.1, baseInterval: 90, description: 'A demonic hunting dog', flavorText: 'It tracks souls, not scents.' },
  { id: 'infernal-flame-wraith', name: 'Flame Wraith', type: 'infernal', tier: 'dusk', baseGenerationAmount: 9.8, baseInterval: 88, description: 'A spirit consumed by hellfire', flavorText: 'It burns without fuel.' },
  { id: 'infernal-succubus', name: 'Succubus', type: 'infernal', tier: 'midnight', baseGenerationAmount: 28.5, baseInterval: 300, description: 'A seductive demon', flavorText: 'Beauty is its deadliest weapon.' },
  { id: 'infernal-war-demon', name: 'War Demon', type: 'infernal', tier: 'midnight', baseGenerationAmount: 27, baseInterval: 290, description: 'A demon forged in battle', flavorText: 'Conflict is its sustenance.' },
  { id: 'infernal-pit-fiend', name: 'Pit Fiend', type: 'infernal', tier: 'umbral', baseGenerationAmount: 77.1, baseInterval: 1800, description: 'A commander of the hells', flavorText: 'Legions tremble at its presence.' },
  { id: 'infernal-balor', name: 'Balor', type: 'infernal', tier: 'umbral', baseGenerationAmount: 75, baseInterval: 1780, description: 'A fire demon of immense power', flavorText: 'Its whip cracks across dimensions.' },
  { id: 'infernal-archdevil', name: 'Archdevil', type: 'infernal', tier: 'eternal', baseGenerationAmount: 209, baseInterval: 14400, description: 'A ruler of the infernal planes', flavorText: 'Its contracts bind even gods.' },
  { id: 'infernal-hell-sovereign', name: 'Hell Sovereign', type: 'infernal', tier: 'eternal', baseGenerationAmount: 200, baseInterval: 14400, description: 'The supreme ruler of all hells', flavorText: 'Every flame is its subject.' },
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
