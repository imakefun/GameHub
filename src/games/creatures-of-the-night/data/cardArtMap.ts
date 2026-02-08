// Maps card definition IDs to their art image filenames in assets/cards/
// Each of the 120 cards maps to one of the 120 PNG files

const cardArtMap: Record<string, string> = {
  // ============ BEAST ============
  'beast-night-owl': 'Owl',
  'beast-shadow-rat': 'Rat',
  'beast-dusk-wolf': 'Dire_Wolf',
  'beast-night-stalker': 'Mist_Panther',
  'beast-dire-bear': 'Wendigo',
  'beast-shadow-stag': 'Dusk_Hound',
  'beast-nightmare-stallion': 'Blood_Moon_Beast',
  'beast-abyssal-serpent': 'Abyssal_Serpent',
  'beast-ancient-phoenix': 'Beast_of_the_Eternal_Hunt',
  'beast-primordial-leviathan': 'Bat',

  // ============ SPIRIT ============
  'spirit-wisp': 'Wisp',
  'spirit-shade': 'Ghost_Light',
  'spirit-banshee': 'Banshee',
  'spirit-phantom': 'Haunting_Spirit',
  'spirit-poltergeist': 'Poltergeist',
  'spirit-wraith-maiden': 'Mournful_Spirit',
  'spirit-reaper': 'Soul_Harvester',
  'spirit-soul-collector': 'Haunting_Presence',
  'spirit-void-wraith': 'Eternal_Phantom',
  'spirit-eternity-warden': 'Phantom_Lord',

  // ============ SHADOW ============
  'shadow-shadow-rat': 'Shadow_Rat',
  'shadow-dark-imp': 'Shadow_Imp',
  'shadow-stalker': 'Night_Stalker',
  'shadow-nightcrawler': 'Darkness_Wisp',
  'shadow-devourer': 'Night_Shroud',
  'shadow-eclipse-watcher': 'Umbral_Stalker',
  'shadow-lord': 'Shadow_Lord',
  'shadow-void-weaver': 'Shadow_Weaver',
  'shadow-primordial': 'The_Endless_Dark',
  'shadow-umbral-god': 'Void_Walker',

  // ============ FAE ============
  'fae-pixie': 'Dewdrop_Pixie',
  'fae-sprite': 'Flower_Sprite',
  'fae-dryad': 'Moonlight_Dancer',
  'fae-satyr': 'Fae_Trickster',
  'fae-sidhe': 'Winter_Court_Knight',
  'fae-changeling': 'Changeling_Child',
  'fae-queen': 'Fae_Queen',
  'fae-wild-king': 'Fae_Court_Noble',
  'fae-archfey': 'Dusk_Court_Herald',
  'fae-dream-sovereign': 'Dream_Eater',

  // ============ BLOOD ============
  'blood-thrall': 'Vampire_Thrall',
  'blood-leech': 'Sanguine_Leech',
  'blood-vampire': 'Blood_Hunter',
  'blood-nosferatu': 'Blood_Mage_Apprentice',
  'blood-countess': 'Blood_Noble_Vampire',
  'blood-crimson-knight': 'Crimson_Knight',
  'blood-ancient': 'Vampire_Elder',
  'blood-sanguine-elder': 'Blood_Familiar',
  'blood-progenitor': 'Prince_of_Night',
  'blood-crimson-god': 'Blood_Moth',

  // ============ MAGIC ============
  'magic-familiar': 'Enchanted_Familiar',
  'magic-candle-wisp': 'Cantrip_Wisp',
  'magic-apprentice': 'Witchs_Apprentice',
  'magic-hex-weaver': 'Spell_Remnant',
  'magic-enchantress': 'Coven_Witch',
  'magic-storm-caller': 'Arcane_Weaver',
  'magic-archmage': 'Witch_Coven_Leader',
  'magic-void-oracle': 'Contract_Sprite',
  'magic-primeval': 'Archmagus_of_Night',
  'magic-arcane-titan': 'Rune_Guardian',

  // ============ NECROMANCY ============
  'necro-skeleton': 'Bone_Rat',
  'necro-corpse-candle': 'Death_Wisp',
  'necro-gravedigger': 'Grave_Digger',
  'necro-bone-golem': 'Bone_Collector',
  'necro-lich': 'Lich_Apprentice',
  'necro-plague-bearer': 'Corruption_Spreader',
  'necro-deathknight': 'Death_Knight',
  'necro-soul-binder': 'Soul_Binder',
  'necro-archlich': 'Dread_Necromancer',
  'necro-death-god': 'Death_Lord',

  // ============ CURSED ============
  'cursed-doll': 'Ill_Fated_Child',
  'cursed-raven': 'Carrion_Rook',
  'cursed-mirror': 'Mirror_Bound',
  'cursed-hag': 'Night_Hag',
  'cursed-jester': 'Boggart',
  'cursed-headless': 'Living_Hex',
  'cursed-prince': 'Curse_Weaver',
  'cursed-oracle': 'Curse_Master',
  'cursed-abomination': 'The_Accursed',
  'cursed-entropy-lord': 'Marked_One',

  // ============ LYCANTHROPE ============
  'lycan-pup': 'Werewolf_Pup',
  'lycan-prowler': 'Wolf_Kin',
  'lycan-hunter': 'Pack_Runner',
  'lycan-ravager': 'Moon_Hunter',
  'lycan-alpha': 'Alpha_Werewolf',
  'lycan-moon-howler': 'Moonlight_Stalker',
  'lycan-dire': 'Dire_Lycanthrope',
  'lycan-blood-alpha': 'Primal_Wolf_Spirit',
  'lycan-primal': 'Werewolf_Pack_Lord',
  'lycan-moon-god': 'Moon_Touched',

  // ============ UNDEAD ============
  'undead-zombie': 'Risen_Corpse',
  'undead-crawler': 'Shambling_Remains',
  'undead-ghoul': 'Graveyard_Ghoul',
  'undead-draugr': 'Grave_Servant',
  'undead-wight': 'Wight',
  'undead-mummy-lord': 'Tombstone_Keeper',
  'undead-revenant': 'Graveyard_Revenant',
  'undead-bone-dragon': 'Grave_Knight',
  'undead-dread-lord': 'Eternal_Revenant',
  'undead-grave-titan': 'Undying_One',

  // ============ STONE ============
  'stone-golemite': 'Pebble_Sprite',
  'stone-shard-sprite': 'Minor_Gargoyle',
  'stone-gargoyle': 'Gargoyle',
  'stone-earth-elemental': 'Gravel_Guardian',
  'stone-golem': 'Stone_Watcher',
  'stone-crystal-guardian': 'Monument_Guardian',
  'stone-colossus': 'Earth_Colossus',
  'stone-monolith': 'Obsidian_Sentinel',
  'stone-titan': 'Living_Mountain',
  'stone-world-golem': 'Mist_Walker',

  // ============ INFERNAL ============
  'infernal-imp': 'Ember_Imp',
  'infernal-ember-fiend': 'Minor_Specter',
  'infernal-hellhound': 'Hellfire_Stalker',
  'infernal-flame-wraith': 'Whisper_Tempter',
  'infernal-succubus': 'Possessed_Mortal',
  'infernal-war-demon': 'Demon_Knight',
  'infernal-pit-fiend': 'Sin_Collector',
  'infernal-balor': 'Hell_Baron',
  'infernal-archdevil': 'Death_Channeler',
  'infernal-hell-sovereign': 'Partial_Shifter',
};

export default cardArtMap;
