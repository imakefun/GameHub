#!/usr/bin/env node
/**
 * Populate SheetDB with all local game data.
 *
 * Usage:
 *   SHEETDB_API=https://sheetdb.io/api/v1/YOUR_ID node scripts/populate-sheetdb.mjs
 *
 * This script reads the compiled local data and pushes it to each sheet tab
 * via the SheetDB REST API. Run once to seed the spreadsheet, then tune in
 * Google Sheets directly.
 *
 * IMPORTANT: SheetDB free tier limits to 500 rows. The Cards sheet alone has
 * 139 cards. If you hit limits, consider splitting into multiple SheetDB
 * instances or upgrading.
 */

const API = process.env.SHEETDB_API;
if (!API) {
  console.error('Set SHEETDB_API env var to your SheetDB endpoint URL');
  process.exit(1);
}

// ============================================================
// Helpers
// ============================================================

async function pushSheet(sheetName, rows) {
  if (rows.length === 0) {
    console.log(`  ${sheetName}: 0 rows (skipped)`);
    return;
  }

  // SheetDB bulk create: POST /api/v1/{ID}?sheet=SheetName
  const url = `${API.replace(/\/$/, '')}?sheet=${encodeURIComponent(sheetName)}`;

  // SheetDB expects { data: [...rows] }
  const body = JSON.stringify({ data: rows });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ${sheetName}: FAILED (${res.status}): ${text}`);
    return;
  }

  const result = await res.json();
  console.log(`  ${sheetName}: ${rows.length} rows pushed`, result);
}

// ============================================================
// Data definitions (mirrors local data files exactly)
// ============================================================

// --- Cards ---
// Set 1 cards
const set1Cards = [
  { id: 'rat', name: 'Rat', type: 'beast', tier: 'twilight', set: '1', baseGenerationAmount: '1.5', baseInterval: '15', description: 'A common sewer rat with sharp instincts', flavorText: 'It thrives where others dare not tread.' },
  { id: 'bat', name: 'Bat', type: 'beast', tier: 'twilight', set: '1', baseGenerationAmount: '1.8', baseInterval: '18', description: 'A nocturnal hunter with keen senses', flavorText: 'The darkness is its domain.' },
  { id: 'owl', name: 'Owl', type: 'beast', tier: 'twilight', set: '1', baseGenerationAmount: '2.0', baseInterval: '20', description: 'A wise bird of the night', flavorText: 'Its silent wings carry ancient knowledge.' },
  { id: 'set1-shadow-imp', name: 'Shadow Imp', type: 'shadow', tier: 'twilight', set: '1', baseGenerationAmount: '1.8', baseInterval: '14', description: 'A tiny creature of living shadow', flavorText: 'Mischief made manifest.' },
  { id: 'set1-moon-touched', name: 'Moon-Touched', type: 'spirit', tier: 'twilight', set: '1', baseGenerationAmount: '1.5', baseInterval: '12', description: 'A being blessed by moonlight', flavorText: 'The moon chose this one.' },
  { id: 'set1-shadow-rat', name: 'Shadow Rat', type: 'shadow', tier: 'twilight', set: '1', baseGenerationAmount: '2.0', baseInterval: '18', description: 'A rat cloaked in living shadow', flavorText: 'Where it treads, light fades.' },
  { id: 'set1-partial-shifter', name: 'Partial Shifter', type: 'lycanthrope', tier: 'twilight', set: '1', baseGenerationAmount: '2.2', baseInterval: '16', description: 'A young shapeshifter still learning control', flavorText: 'Half one thing, half another.' },
  { id: 'set1-darkness-wisp', name: 'Darkness Wisp', type: 'spirit', tier: 'twilight', set: '1', baseGenerationAmount: '1.6', baseInterval: '13', description: 'A flickering mote of dark energy', flavorText: 'Follow the light... if you dare.' },
  { id: 'set1-werewolf-pup', name: 'Werewolf Pup', type: 'lycanthrope', tier: 'twilight', set: '1', baseGenerationAmount: '2.4', baseInterval: '17', description: 'A young werewolf cub with big paws', flavorText: 'The moon calls to it already.' },
  { id: 'set1-dusk-hound', name: 'Dusk Hound', type: 'beast', tier: 'dusk', set: '1', baseGenerationAmount: '7.5', baseInterval: '55', description: 'A loyal hound that hunts at dusk', flavorText: 'Its howl marks the end of day.' },
  { id: 'set1-moonlight-stalker', name: 'Moonlight Stalker', type: 'lycanthrope', tier: 'dusk', set: '1', baseGenerationAmount: '8.0', baseInterval: '60', description: 'A predator that hunts by moonlight', flavorText: 'Silver light guides its fangs.' },
  { id: 'set1-wolf-kin', name: 'Wolf Kin', type: 'beast', tier: 'dusk', set: '1', baseGenerationAmount: '7.0', baseInterval: '50', description: 'A wolf bound to a supernatural pack', flavorText: 'The pack is everything.' },
  { id: 'set1-umbral-stalker', name: 'Umbral Stalker', type: 'shadow', tier: 'dusk', set: '1', baseGenerationAmount: '7.2', baseInterval: '55', description: 'A predator born of darkness', flavorText: 'You never see it coming.' },
  { id: 'set1-night-stalker', name: 'Night Stalker', type: 'beast', tier: 'dusk', set: '1', baseGenerationAmount: '7.8', baseInterval: '58', description: 'A feline predator of the deep night', flavorText: 'Silent paws on moonlit stone.' },
  { id: 'set1-moon-hunter', name: 'Moon Hunter', type: 'lycanthrope', tier: 'dusk', set: '1', baseGenerationAmount: '8.5', baseInterval: '65', description: 'A werewolf that has embraced the hunt', flavorText: 'Half-human, all predator.' },
  { id: 'set1-shadow-weaver', name: 'Shadow Weaver', type: 'shadow', tier: 'midnight', set: '1', baseGenerationAmount: '20.0', baseInterval: '270', description: 'Spins darkness into solid form', flavorText: 'The fabric of night is its loom.' },
  { id: 'set1-mist-panther', name: 'Mist Panther', type: 'beast', tier: 'midnight', set: '1', baseGenerationAmount: '22.0', baseInterval: '280', description: 'A great cat that moves like fog', flavorText: 'Here one moment, gone the next.' },
  { id: 'set1-pack-runner', name: 'Pack Runner', type: 'beast', tier: 'midnight', set: '1', baseGenerationAmount: '21.0', baseInterval: '275', description: 'The fastest beast in the shadow pack', flavorText: 'Nothing outruns the pack.' },
  { id: 'set1-night-shroud', name: 'Night Shroud', type: 'shadow', tier: 'midnight', set: '1', baseGenerationAmount: '19.0', baseInterval: '260', description: 'A living cloak of darkness', flavorText: 'It wraps around reality itself.' },
  { id: 'set1-dire-wolf', name: 'Dire Wolf', type: 'beast', tier: 'midnight', set: '1', baseGenerationAmount: '23.0', baseInterval: '290', description: 'A massive wolf of primal power', flavorText: 'Ancient and unstoppable.' },
];

// Legacy cards - generate from the same structure as cards.ts
// 12 types x 10 cards each (2 per tier)
const LEGACY_TYPES = [
  { type: 'beast', prefix: 'beast', cards: [
    { suffix: 'night-owl', name: 'Night Owl', tier: 'twilight', gen: 2.4, int: 20, desc: 'An owl with luminous eyes', flavor: 'Its gaze pierces the darkest night.' },
    { suffix: 'shadow-rat', name: 'Shadow Rat', tier: 'twilight', gen: 2.0, int: 18, desc: 'A rat touched by darkness', flavor: 'It gnaws at the veil between worlds.' },
    { suffix: 'dusk-wolf', name: 'Dusk Wolf', tier: 'dusk', gen: 8, int: 60, desc: 'A wolf that hunts at twilight', flavor: 'Neither fully of day nor night.' },
    { suffix: 'night-stalker', name: 'Nightstalker Cat', tier: 'dusk', gen: 7.5, int: 55, desc: 'A feline predator of the dark', flavor: 'Silent paws on moonlit stone.' },
    { suffix: 'dire-bear', name: 'Dire Bear', tier: 'midnight', gen: 22.5, int: 300, desc: 'A massive bear infused with shadow', flavor: 'The forest trembles at its approach.' },
    { suffix: 'shadow-stag', name: 'Shadow Stag', tier: 'midnight', gen: 21, int: 270, desc: 'A spectral deer with obsidian antlers', flavor: 'It runs between moonbeams.' },
    { suffix: 'nightmare-stallion', name: 'Nightmare Stallion', tier: 'umbral', gen: 60, int: 1800, desc: 'A horse wreathed in dark flame', flavor: 'Rides between realms with ease.' },
    { suffix: 'abyssal-serpent', name: 'Abyssal Serpent', tier: 'umbral', gen: 55, int: 1650, desc: 'A massive snake from the deep', flavor: 'Its coils could crush mountains.' },
    { suffix: 'fenrir-spawn', name: 'Fenrir Spawn', tier: 'eternal', gen: 150, int: 18000, desc: 'A legendary wolf of apocalyptic power', flavor: 'Born to devour worlds.' },
    { suffix: 'leviathan-hatchling', name: 'Leviathan Hatchling', tier: 'eternal', gen: 140, int: 17000, desc: 'A baby sea monster of immense potential', flavor: 'The ocean remembers its name.' },
  ]},
  { type: 'spirit', prefix: 'spirit', cards: [
    { suffix: 'cantrip-wisp', name: 'Cantrip Wisp', tier: 'twilight', gen: 1.8, int: 15, desc: 'A small magical spirit', flavor: 'A spark of magic given form.' },
    { suffix: 'ghost-light', name: 'Ghost Light', tier: 'twilight', gen: 2.2, int: 22, desc: 'A floating orb of spectral light', flavor: 'Follow it at your peril.' },
    { suffix: 'will-o-wisp', name: "Will-o'-Wisp", tier: 'dusk', gen: 7, int: 50, desc: 'A mischievous guiding spirit', flavor: 'It leads travelers astray.' },
    { suffix: 'phantom-echo', name: 'Phantom Echo', tier: 'dusk', gen: 6.5, int: 48, desc: 'A ghost that repeats the past', flavor: 'Trapped in a loop of memories.' },
    { suffix: 'poltergeist', name: 'Poltergeist', tier: 'midnight', gen: 20, int: 260, desc: 'A violent, unrestrained spirit', flavor: 'It delights in chaos.' },
    { suffix: 'banshee', name: 'Banshee', tier: 'midnight', gen: 19, int: 250, desc: 'A wailing spirit of doom', flavor: 'Its cry heralds death.' },
    { suffix: 'haunting-spirit', name: 'Haunting Spirit', tier: 'umbral', gen: 58, int: 1700, desc: 'A powerful ghost with unfinished business', flavor: 'Bound by oath, freed by vengeance.' },
    { suffix: 'wraith-lord', name: 'Wraith Lord', tier: 'umbral', gen: 62, int: 1850, desc: 'A commander of spectral armies', flavor: 'Death is merely a rank.' },
    { suffix: 'eternal-phantom', name: 'Eternal Phantom', tier: 'eternal', gen: 145, int: 17500, desc: 'An ancient spirit that has existed since the dawn of time', flavor: 'It remembers the first night.' },
    { suffix: 'soul-nexus', name: 'Soul Nexus', tier: 'eternal', gen: 155, int: 18500, desc: 'A convergence point for thousands of souls', flavor: 'All spirits flow through it.' },
  ]},
  { type: 'shadow', prefix: 'shadow', cards: [
    { suffix: 'shade-wisp', name: 'Shade Wisp', tier: 'twilight', gen: 2.0, int: 18, desc: 'A fragment of living darkness', flavor: 'Even shadows have shadows.' },
    { suffix: 'dark-tendril', name: 'Dark Tendril', tier: 'twilight', gen: 2.5, int: 22, desc: 'A reaching arm of darkness', flavor: 'It pulls you into the void.' },
    { suffix: 'shadow-stalker', name: 'Shadow Stalker', tier: 'dusk', gen: 8, int: 58, desc: 'A predator made of darkness', flavor: 'Your shadow is not your own.' },
    { suffix: 'umbra-thief', name: 'Umbra Thief', tier: 'dusk', gen: 7, int: 52, desc: 'Steals the light from its surroundings', flavor: 'It collects stolen starlight.' },
    { suffix: 'void-walker', name: 'Void Walker', tier: 'midnight', gen: 23, int: 290, desc: 'Travels through the space between shadows', flavor: 'It steps where there is nothing.' },
    { suffix: 'eclipse-born', name: 'Eclipse Born', tier: 'midnight', gen: 21, int: 275, desc: 'Created during a total eclipse', flavor: 'The sun feared its birth.' },
    { suffix: 'abyssal-shade', name: 'Abyssal Shade', tier: 'umbral', gen: 65, int: 1900, desc: 'A shadow from the deepest abyss', flavor: 'Where it stands, reality thins.' },
    { suffix: 'nightmare-weaver', name: 'Nightmare Weaver', tier: 'umbral', gen: 60, int: 1800, desc: 'Weaves darkness into terrifying forms', flavor: 'Your worst dreams given shape.' },
    { suffix: 'shadow-lord', name: 'Shadow Lord', tier: 'eternal', gen: 160, int: 19000, desc: 'The ultimate master of darkness', flavor: 'All shadows serve its will.' },
    { suffix: 'void-emperor', name: 'Void Emperor', tier: 'eternal', gen: 155, int: 18500, desc: 'Ruler of the space between worlds', flavor: 'Nothing exists that it cannot unmake.' },
  ]},
  { type: 'fae', prefix: 'fae', cards: [
    { suffix: 'pebble-sprite', name: 'Pebble Sprite', tier: 'twilight', gen: 1.5, int: 14, desc: 'A tiny fae that hides in rocks', flavor: 'Easily overlooked, never forgotten.' },
    { suffix: 'dewdrop-fairy', name: 'Dewdrop Fairy', tier: 'twilight', gen: 2.0, int: 20, desc: 'A delicate fairy born of morning dew', flavor: 'Gone before the sun rises.' },
    { suffix: 'mushroom-knight', name: 'Mushroom Knight', tier: 'dusk', gen: 7, int: 52, desc: 'A fae warrior clad in fungi', flavor: 'Its spore-shield is impenetrable.' },
    { suffix: 'thorn-dancer', name: 'Thorn Dancer', tier: 'dusk', gen: 6, int: 45, desc: 'A fae that moves through briars', flavor: 'Beauty and pain entwined.' },
    { suffix: 'fae-court-noble', name: 'Fae Court Noble', tier: 'midnight', gen: 20, int: 265, desc: 'A high-ranking member of the fae court', flavor: 'Its word is binding magic.' },
    { suffix: 'enchanted-stag', name: 'Enchanted Stag', tier: 'midnight', gen: 18, int: 240, desc: 'A magnificent deer blessed by fae magic', flavor: 'To see it is to be changed forever.' },
    { suffix: 'fae-trickster', name: 'Fae Trickster', tier: 'umbral', gen: 55, int: 1650, desc: 'A master of fae illusions', flavor: 'Nothing it shows is real.' },
    { suffix: 'wild-hunt-rider', name: 'Wild Hunt Rider', tier: 'umbral', gen: 62, int: 1850, desc: 'A spectral rider from fae legend', flavor: 'The hunt never ends.' },
    { suffix: 'fae-queen', name: 'Fae Queen', tier: 'eternal', gen: 150, int: 18000, desc: 'The supreme ruler of all fae', flavor: 'Her smile hides a thousand plots.' },
    { suffix: 'dream-eater', name: 'Dream Eater', tier: 'eternal', gen: 145, int: 17500, desc: 'A fae that consumes dreams for power', flavor: 'Sleep is its hunting ground.' },
  ]},
  { type: 'blood', prefix: 'blood', cards: [
    { suffix: 'sanguine-leech', name: 'Sanguine Leech', tier: 'twilight', gen: 2.5, int: 22, desc: 'A parasite that feeds on dark energy', flavor: 'It drinks deeply of the night.' },
    { suffix: 'crimson-bat', name: 'Crimson Bat', tier: 'twilight', gen: 2.2, int: 20, desc: 'A blood-red bat with razor fangs', flavor: 'Its thirst is never quenched.' },
    { suffix: 'blood-hunter', name: 'Blood Hunter', tier: 'dusk', gen: 8, int: 58, desc: 'A tracker that follows the scent of blood', flavor: 'It can smell a drop a mile away.' },
    { suffix: 'hemogoblin', name: 'Hemogoblin', tier: 'dusk', gen: 7, int: 52, desc: 'A goblin mutated by blood magic', flavor: 'Neither alive nor dead.' },
    { suffix: 'vampire-spawn', name: 'Vampire Spawn', tier: 'midnight', gen: 22, int: 280, desc: 'A newly-turned vampire', flavor: 'Hungering for its first true feast.' },
    { suffix: 'crimson-knight', name: 'Crimson Knight', tier: 'midnight', gen: 20, int: 260, desc: 'A warrior powered by blood magic', flavor: 'Its armor weeps crimson.' },
    { suffix: 'blood-countess', name: 'Blood Countess', tier: 'umbral', gen: 65, int: 1900, desc: 'A noble vampire of immense power', flavor: 'She bathes in moonlight and blood.' },
    { suffix: 'sanguine-wyrm', name: 'Sanguine Wyrm', tier: 'umbral', gen: 58, int: 1750, desc: 'A serpentine creature of pure blood magic', flavor: 'Rivers of blood follow its path.' },
    { suffix: 'blood-god-avatar', name: 'Blood God Avatar', tier: 'eternal', gen: 160, int: 19000, desc: 'A manifestation of the blood deity', flavor: 'All veins lead to it.' },
    { suffix: 'crimson-primordial', name: 'Crimson Primordial', tier: 'eternal', gen: 150, int: 18000, desc: 'The first creature of blood magic', flavor: 'Born when the first blood was spilled.' },
  ]},
  { type: 'magic', prefix: 'magic', cards: [
    { suffix: 'ember-imp', name: 'Ember Imp', tier: 'twilight', gen: 1.8, int: 16, desc: 'A tiny creature of magical fire', flavor: 'Small flame, big trouble.' },
    { suffix: 'wisp', name: 'Wisp', tier: 'twilight', gen: 2.0, int: 18, desc: 'A floating sphere of raw magic', flavor: 'Magic in its purest form.' },
    { suffix: 'spell-weaver', name: 'Spell Weaver', tier: 'dusk', gen: 7, int: 50, desc: 'A creature that weaves spells into reality', flavor: 'Every thread is a different spell.' },
    { suffix: 'rune-guardian', name: 'Rune Guardian', tier: 'dusk', gen: 8, int: 58, desc: 'A construct protected by ancient runes', flavor: 'The runes are its life force.' },
    { suffix: 'arcane-weaver', name: 'Arcane Weaver', tier: 'midnight', gen: 20, int: 265, desc: 'A spider-like creature that spins arcane webs', flavor: 'Its web catches spells, not flies.' },
    { suffix: 'crystal-mage', name: 'Crystal Mage', tier: 'midnight', gen: 22, int: 285, desc: 'A mage who channels magic through crystals', flavor: 'Each crystal holds a universe.' },
    { suffix: 'arcane-colossus', name: 'Arcane Colossus', tier: 'umbral', gen: 60, int: 1800, desc: 'A giant construct of pure magic', flavor: 'It bends reality with each step.' },
    { suffix: 'spell-storm', name: 'Spell Storm', tier: 'umbral', gen: 58, int: 1750, desc: 'A living tempest of chaotic magic', flavor: 'No two moments are the same.' },
    { suffix: 'arcane-primordial', name: 'Arcane Primordial', tier: 'eternal', gen: 155, int: 18500, desc: 'The first magical being', flavor: 'Magic itself remembers its name.' },
    { suffix: 'living-hex', name: 'Living Hex', tier: 'eternal', gen: 145, int: 17500, desc: 'A curse that gained sentience', flavor: 'It curses those who dare look upon it.' },
  ]},
  { type: 'necromancy', prefix: 'necro', cards: [
    { suffix: 'bone-rat', name: 'Bone Rat', tier: 'twilight', gen: 2.0, int: 18, desc: 'A skeletal rat animated by dark magic', flavor: 'Death cannot stop its hunger.' },
    { suffix: 'shambling-remains', name: 'Shambling Remains', tier: 'twilight', gen: 2.5, int: 22, desc: 'A pile of animated corpse parts', flavor: 'It refuses to stay dead.' },
    { suffix: 'grave-digger', name: 'Grave Digger', tier: 'dusk', gen: 7.5, int: 55, desc: 'A ghoulish creature that exhumes the dead', flavor: 'The ground is always fresh.' },
    { suffix: 'corpse-stitcher', name: 'Corpse Stitcher', tier: 'dusk', gen: 7, int: 50, desc: 'Creates undead from spare parts', flavor: 'A needle, thread, and a fresh corpse.' },
    { suffix: 'dread-necromancer', name: 'Dread Necromancer', tier: 'midnight', gen: 22, int: 280, desc: 'A powerful master of death magic', flavor: 'Death is merely a tool.' },
    { suffix: 'soul-binder', name: 'Soul Binder', tier: 'midnight', gen: 20, int: 260, desc: 'Traps souls in crystalline prisons', flavor: 'Each gem contains a scream.' },
    { suffix: 'lich-apprentice', name: 'Lich Apprentice', tier: 'umbral', gen: 62, int: 1850, desc: 'A necromancer on the path to lichdom', flavor: 'Halfway between life and unlife.' },
    { suffix: 'death-knight', name: 'Death Knight', tier: 'umbral', gen: 58, int: 1750, desc: 'A fallen warrior raised as an undead champion', flavor: 'Honor died with it. Power did not.' },
    { suffix: 'lich-king', name: 'Lich King', tier: 'eternal', gen: 155, int: 18500, desc: 'The ultimate undead spellcaster', flavor: 'Death is just the beginning.' },
    { suffix: 'void-necromancer', name: 'Void Necromancer', tier: 'eternal', gen: 160, int: 19000, desc: 'A necromancer who taps into the void', flavor: 'Beyond death lies the void.' },
  ]},
  { type: 'cursed', prefix: 'cursed', cards: [
    { suffix: 'hex-cat', name: 'Hex Cat', tier: 'twilight', gen: 2.2, int: 20, desc: 'A cat that brings bad luck', flavor: 'Cross its path at your peril.' },
    { suffix: 'jinx-sprite', name: 'Jinx Sprite', tier: 'twilight', gen: 1.8, int: 16, desc: 'A mischievous cursed fairy', flavor: 'Everything it touches goes wrong.' },
    { suffix: 'curse-bearer', name: 'Curse Bearer', tier: 'dusk', gen: 7, int: 50, desc: 'A creature burdened with curses', flavor: 'It carries what others cannot.' },
    { suffix: 'doom-raven', name: 'Doom Raven', tier: 'dusk', gen: 7.5, int: 55, desc: 'A raven that heralds disaster', flavor: 'Where it flies, doom follows.' },
    { suffix: 'curse-weaver', name: 'Curse Weaver', tier: 'midnight', gen: 21, int: 275, desc: 'Spins curses into tangible form', flavor: 'Its loom weaves misfortune.' },
    { suffix: 'haunting-presence', name: 'Haunting Presence', tier: 'midnight', gen: 19, int: 250, desc: 'A cursed entity that haunts an area', flavor: 'It never truly leaves.' },
    { suffix: 'doom-herald', name: 'Doom Herald', tier: 'umbral', gen: 60, int: 1800, desc: 'An announcer of apocalyptic events', flavor: 'The end begins with its cry.' },
    { suffix: 'mirror-bound', name: 'Mirror Bound', tier: 'umbral', gen: 55, int: 1650, desc: 'A creature trapped between reflections', flavor: 'It sees all possible futures.' },
    { suffix: 'world-ender', name: 'World Ender', tier: 'eternal', gen: 150, int: 18000, desc: 'A being destined to end all things', flavor: 'Every world has an expiration date.' },
    { suffix: 'entropy-incarnate', name: 'Entropy Incarnate', tier: 'eternal', gen: 155, int: 18500, desc: 'The living embodiment of decay', flavor: 'All things return to nothing.' },
  ]},
  { type: 'lycanthrope', prefix: 'lycan', cards: [
    { suffix: 'moon-cub', name: 'Moon Cub', tier: 'twilight', gen: 2.5, int: 22, desc: 'A young werewolf barely able to shift', flavor: 'Still learning to howl.' },
    { suffix: 'feral-pup', name: 'Feral Pup', tier: 'twilight', gen: 2.2, int: 20, desc: 'A wild werewolf cub', flavor: 'Raised by the pack, wild at heart.' },
    { suffix: 'silver-bane', name: 'Silver Bane', tier: 'dusk', gen: 8, int: 58, desc: 'A werewolf resistant to silver', flavor: 'The old weakness means nothing.' },
    { suffix: 'night-howler', name: 'Night Howler', tier: 'dusk', gen: 7.5, int: 55, desc: 'A werewolf whose howl freezes the blood', flavor: 'The night answers its call.' },
    { suffix: 'alpha-werewolf', name: 'Alpha Werewolf', tier: 'midnight', gen: 23, int: 290, desc: 'The leader of a werewolf pack', flavor: 'Its word is law under the moon.' },
    { suffix: 'blood-moon-warrior', name: 'Blood Moon Warrior', tier: 'midnight', gen: 21, int: 275, desc: 'A lycanthrope empowered by the blood moon', flavor: 'The red moon fuels its rage.' },
    { suffix: 'primal-lycan', name: 'Primal Lycan', tier: 'umbral', gen: 65, int: 1900, desc: 'A werewolf that has embraced its primal nature', flavor: 'More wolf than human now.' },
    { suffix: 'storm-howler', name: 'Storm Howler', tier: 'umbral', gen: 60, int: 1800, desc: 'A werewolf that commands thunder', flavor: 'Lightning strikes where it howls.' },
    { suffix: 'moon-god-chosen', name: 'Moon God Chosen', tier: 'eternal', gen: 160, int: 19000, desc: 'Blessed by the lunar deity itself', flavor: 'The moon bows to its will.' },
    { suffix: 'fenris-alpha', name: 'Fenris Alpha', tier: 'eternal', gen: 155, int: 18500, desc: 'The ultimate werewolf, descended from Fenrir', flavor: 'Even gods fear the wolf.' },
  ]},
  { type: 'undead', prefix: 'undead', cards: [
    { suffix: 'skeleton-scout', name: 'Skeleton Scout', tier: 'twilight', gen: 2.0, int: 18, desc: 'A skeletal soldier on patrol', flavor: 'Its duty outlasts its flesh.' },
    { suffix: 'zombie-shambler', name: 'Zombie Shambler', tier: 'twilight', gen: 2.5, int: 22, desc: 'A mindless walking corpse', flavor: 'It knows only hunger.' },
    { suffix: 'ghoul', name: 'Ghoul', tier: 'dusk', gen: 7.5, int: 55, desc: 'A flesh-eating undead creature', flavor: 'The grave cannot hold it.' },
    { suffix: 'wight', name: 'Wight', tier: 'dusk', gen: 7, int: 50, desc: 'An intelligent undead warrior', flavor: 'Death sharpened its mind.' },
    { suffix: 'bone-golem', name: 'Bone Golem', tier: 'midnight', gen: 22, int: 280, desc: 'A construct made of countless bones', flavor: 'Every bone has a story.' },
    { suffix: 'revenant', name: 'Revenant', tier: 'midnight', gen: 20, int: 260, desc: 'An undead driven by vengeance', flavor: 'It will not rest until justice is done.' },
    { suffix: 'crypt-lord', name: 'Crypt Lord', tier: 'umbral', gen: 60, int: 1800, desc: 'A powerful undead that rules from its tomb', flavor: 'Even in death, it commands.' },
    { suffix: 'mummy-pharaoh', name: 'Mummy Pharaoh', tier: 'umbral', gen: 62, int: 1850, desc: 'An ancient ruler preserved by dark magic', flavor: 'Its dynasty endures beyond death.' },
    { suffix: 'elder-lich', name: 'Elder Lich', tier: 'eternal', gen: 150, int: 18000, desc: 'An undead sorcerer of cosmic power', flavor: 'Millennia of death have made it strong.' },
    { suffix: 'death-god-herald', name: 'Death God Herald', tier: 'eternal', gen: 160, int: 19000, desc: 'A messenger of the death deity', flavor: 'When it speaks, the living listen.' },
  ]},
  { type: 'stone', prefix: 'stone', cards: [
    { suffix: 'pebble-golem', name: 'Pebble Golem', tier: 'twilight', gen: 2.0, int: 20, desc: 'A small golem made of pebbles', flavor: 'Small but surprisingly sturdy.' },
    { suffix: 'gargoyle-runt', name: 'Gargoyle Runt', tier: 'twilight', gen: 1.8, int: 16, desc: 'A tiny gargoyle learning to fly', flavor: 'Stone wings beat against the wind.' },
    { suffix: 'obsidian-sentinel', name: 'Obsidian Sentinel', tier: 'dusk', gen: 8, int: 58, desc: 'A guard carved from volcanic glass', flavor: 'Its edges never dull.' },
    { suffix: 'granite-guardian', name: 'Granite Guardian', tier: 'dusk', gen: 7.5, int: 55, desc: 'A protector of ancient sites', flavor: 'It has stood watch for millennia.' },
    { suffix: 'monument-guardian', name: 'Monument Guardian', tier: 'midnight', gen: 22, int: 285, desc: 'A massive stone construct that protects ruins', flavor: 'The monument is its body.' },
    { suffix: 'earth-elemental', name: 'Earth Elemental', tier: 'midnight', gen: 20, int: 265, desc: 'A being of living earth', flavor: 'The ground rises to serve it.' },
    { suffix: 'colossus-core', name: 'Colossus Core', tier: 'umbral', gen: 62, int: 1850, desc: 'The heart of an ancient colossus', flavor: 'It still beats with tectonic power.' },
    { suffix: 'mountain-titan', name: 'Mountain Titan', tier: 'umbral', gen: 58, int: 1750, desc: 'A titan that is one with the mountains', flavor: 'Where it walks, new peaks form.' },
    { suffix: 'world-stone', name: 'World Stone', tier: 'eternal', gen: 155, int: 18500, desc: 'The foundation stone of reality', flavor: 'Remove it and all crumbles.' },
    { suffix: 'primordial-earth', name: 'Primordial Earth', tier: 'eternal', gen: 150, int: 18000, desc: 'The first stone, from which all land formed', flavor: 'It remembers when there was only void.' },
  ]},
  { type: 'infernal', prefix: 'infernal', cards: [
    { suffix: 'fire-imp', name: 'Fire Imp', tier: 'twilight', gen: 2.5, int: 22, desc: 'A tiny devil wreathed in flame', flavor: 'It giggles as things burn.' },
    { suffix: 'ember-sprite', name: 'Ember Sprite', tier: 'twilight', gen: 2.0, int: 18, desc: 'A sprite born of hellfire', flavor: 'Its touch leaves scorch marks.' },
    { suffix: 'hell-hound', name: 'Hell Hound', tier: 'dusk', gen: 8, int: 58, desc: 'A canine creature from the infernal pits', flavor: 'Its breath smells of brimstone.' },
    { suffix: 'demon-knight', name: 'Demon Knight', tier: 'dusk', gen: 7.5, int: 55, desc: 'A knight sworn to infernal service', flavor: 'Its armor is forged in hellfire.' },
    { suffix: 'hell-baron', name: 'Hell Baron', tier: 'midnight', gen: 23, int: 290, desc: 'A minor lord of the infernal realm', flavor: 'It rules through fire and fear.' },
    { suffix: 'infernal-smith', name: 'Infernal Smith', tier: 'midnight', gen: 21, int: 275, desc: 'A demon that forges cursed weapons', flavor: 'Every weapon has a price.' },
    { suffix: 'corruption-spreader', name: 'Corruption Spreader', tier: 'umbral', gen: 62, int: 1850, desc: 'A demon that corrupts everything it touches', flavor: 'Purity is just a challenge.' },
    { suffix: 'coven-witch', name: 'Coven Witch', tier: 'umbral', gen: 58, int: 1750, desc: 'A witch who made an infernal pact', flavor: 'Power always has a price.' },
    { suffix: 'night-hag', name: 'Night Hag', tier: 'eternal', gen: 155, int: 18500, desc: 'An ancient hag of tremendous dark power', flavor: 'She has lived since the first nightmare.' },
    { suffix: 'archdevil', name: 'Archdevil', tier: 'eternal', gen: 160, int: 19000, desc: 'A supreme ruler of the infernal planes', flavor: 'Even other demons kneel before it.' },
  ]},
];

const legacyCards = [];
for (const typeGroup of LEGACY_TYPES) {
  for (const card of typeGroup.cards) {
    legacyCards.push({
      id: `${typeGroup.prefix}-${card.suffix}`,
      name: card.name,
      type: typeGroup.type,
      tier: card.tier,
      set: '',
      baseGenerationAmount: String(card.gen),
      baseInterval: String(card.int),
      description: card.desc,
      flavorText: card.flavor,
      artUrl: '',
    });
  }
}

const allCards = [...set1Cards, ...legacyCards];

// --- Packs (flatten for sheet) ---
function flattenPack(p) {
  const row = {
    id: p.id,
    name: p.name,
    description: p.description,
    costCurrency: p.cost?.currency || '',
    costAmount: p.cost ? String(p.cost.amount) : '',
    cardCount: String(p.cardCount),
    tierWeight_twilight: String(p.tierWeights?.twilight || ''),
    tierWeight_dusk: String(p.tierWeights?.dusk || ''),
    tierWeight_midnight: String(p.tierWeights?.midnight || ''),
    tierWeight_umbral: String(p.tierWeights?.umbral || ''),
    tierWeight_eternal: String(p.tierWeights?.eternal || ''),
    guaranteed: p.guaranteed || '',
    typeBoost: p.typeBoost ? p.typeBoost.join(',') : '',
    requiredCL: p.requiredCL ? String(p.requiredCL) : '',
    availability: p.availability || '',
    expeditionId: p.expeditionId || '',
    isOneTime: p.isOneTime ? 'true' : '',
    isPremium: p.isPremium ? 'true' : '',
  };
  // Flatten guarantees
  if (p.guarantees) {
    p.guarantees.forEach((g, i) => {
      const idx = i + 1;
      row[`guarantee${idx}_count`] = String(g.count);
      if (g.tier) row[`guarantee${idx}_tier`] = g.tier;
      if (g.minTier) row[`guarantee${idx}_minTier`] = g.minTier;
      if (g.types) row[`guarantee${idx}_types`] = g.types.join(',');
    });
  }
  return row;
}

// --- Expeditions (flatten nested objects) ---
function flattenExpedition(e) {
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    unlockCL: String(e.unlockCL),
    minCards: String(e.requirements.minCards),
    minCardLevel: e.requirements.minCardLevel ? String(e.requirements.minCardLevel) : '',
    requiredTypes: e.requirements.requiredTypes ? e.requirements.requiredTypes.join(',') : '',
    requiredTier: e.requirements.requiredTier || '',
    requiredTierCount: e.requirements.requiredTierCount ? String(e.requirements.requiredTierCount) : '',
    duration: String(e.duration),
    rewardSEMin: e.rewards.shadowEssence ? String(e.rewards.shadowEssence[0]) : '',
    rewardSEMax: e.rewards.shadowEssence ? String(e.rewards.shadowEssence[1]) : '',
    rewardSSMin: e.rewards.soulShards ? String(e.rewards.soulShards[0]) : '',
    rewardSSMax: e.rewards.soulShards ? String(e.rewards.soulShards[1]) : '',
    rewardLCMin: e.rewards.lunarCrystals ? String(e.rewards.lunarCrystals[0]) : '',
    rewardLCMax: e.rewards.lunarCrystals ? String(e.rewards.lunarCrystals[1]) : '',
    rewardVEMin: e.rewards.voidEnergy ? String(e.rewards.voidEnergy[0]) : '',
    rewardVEMax: e.rewards.voidEnergy ? String(e.rewards.voidEnergy[1]) : '',
    riskPercent: String(e.riskPercent),
    riskEffect: e.riskEffect,
    riskDuration: String(e.riskDuration),
  };
}

// ============================================================
// Static data arrays (from local data files)
// ============================================================

// Import expedition, pack, synergy data inline (mirrors the TS data files)

const expeditions = [
  { id: 'misty-woods', name: 'Misty Woods', description: 'A fog-shrouded forest teeming with minor creatures', unlockCL: 5, requirements: { minCards: 2 }, duration: 900, rewards: { shadowEssence: [50,200], soulShards: [1,5] }, riskPercent: 5, riskEffect: 'fatigue', riskDuration: 1800 },
  { id: 'forgotten-graveyard', name: 'Forgotten Graveyard', description: 'An ancient burial ground where the dead stir', unlockCL: 20, requirements: { minCards: 3 }, duration: 1800, rewards: { shadowEssence: [100,400], soulShards: [3,12] }, riskPercent: 10, riskEffect: 'damage', riskDuration: 3600 },
  { id: 'fae-wilds', name: 'Fae Wilds', description: 'An enchanted realm where the fae hold court', unlockCL: 40, requirements: { minCards: 3, requiredTypes: ['fae'] }, duration: 3600, rewards: { shadowEssence: [200,500], soulShards: [5,15], lunarCrystals: [1,3] }, riskPercent: 15, riskEffect: 'card_loss', riskDuration: 86400 },
  { id: 'shadow-realm', name: 'Shadow Realm', description: 'A dimension of living darkness', unlockCL: 60, requirements: { minCards: 4, requiredTypes: ['shadow'] }, duration: 7200, rewards: { shadowEssence: [300,1000], soulShards: [8,25], lunarCrystals: [2,5] }, riskPercent: 20, riskEffect: 'damage', riskDuration: 3600 },
  { id: 'blood-temple', name: 'Blood Temple', description: 'A crimson cathedral of vampiric power', unlockCL: 80, requirements: { minCards: 4, requiredTypes: ['blood'] }, duration: 10800, rewards: { shadowEssence: [500,1500], soulShards: [12,40], lunarCrystals: [3,8] }, riskPercent: 25, riskEffect: 'damage', riskDuration: 7200 },
  { id: 'cursed-lands', name: 'Cursed Lands', description: 'A blighted wasteland of curses and malice', unlockCL: 100, requirements: { minCards: 5 }, duration: 14400, rewards: { shadowEssence: [800,2500], soulShards: [20,60], lunarCrystals: [5,12] }, riskPercent: 30, riskEffect: 'curse', riskDuration: 7200 },
  { id: 'infernal-depths', name: 'Infernal Depths', description: 'The burning pits of the lower planes', unlockCL: 120, requirements: { minCards: 5, requiredTypes: ['infernal'] }, duration: 21600, rewards: { shadowEssence: [1000,3500], soulShards: [25,75], lunarCrystals: [8,20], voidEnergy: [1,3] }, riskPercent: 40, riskEffect: 'damage', riskDuration: 7200 },
  { id: 'cosmic-void', name: 'Cosmic Void', description: 'The space between dimensions', unlockCL: 150, requirements: { minCards: 6, requiredTier: 'eternal', requiredTierCount: 1 }, duration: 28800, rewards: { shadowEssence: [2000,6000], soulShards: [50,150], lunarCrystals: [15,30], voidEnergy: [3,10] }, riskPercent: 50, riskEffect: 'card_loss', riskDuration: 86400 },
  { id: 'ancient-catacombs', name: 'Ancient Catacombs', description: 'A labyrinth of tombs holding relics from a forgotten age', unlockCL: 100, requirements: { minCards: 6, requiredTier: 'eternal', requiredTierCount: 1 }, duration: 21600, rewards: { shadowEssence: [1200,4000], soulShards: [30,100], lunarCrystals: [8,18], voidEnergy: [1,5] }, riskPercent: 35, riskEffect: 'damage', riskDuration: 7200 },
  { id: 'void-nexus', name: 'Void Nexus', description: 'A fracture in reality where dimensions bleed together', unlockCL: 120, requirements: { minCards: 6, requiredTier: 'eternal', requiredTierCount: 2 }, duration: 28800, rewards: { shadowEssence: [1500,5000], soulShards: [40,125], lunarCrystals: [10,25], voidEnergy: [2,8] }, riskPercent: 45, riskEffect: 'card_loss', riskDuration: 86400 },
  { id: 'celestial-spire', name: 'Celestial Spire', description: 'A tower that pierces the astral plane, guarded by cosmic sentinels', unlockCL: 130, requirements: { minCards: 7, requiredTier: 'eternal', requiredTierCount: 3 }, duration: 36000, rewards: { shadowEssence: [2000,6000], soulShards: [50,150], lunarCrystals: [12,28], voidEnergy: [3,10] }, riskPercent: 50, riskEffect: 'curse', riskDuration: 14400 },
  { id: 'primordial-void', name: 'Primordial Void', description: 'The origin point of all darkness, where creation and destruction are one', unlockCL: 150, requirements: { minCards: 8, requiredTier: 'eternal', requiredTierCount: 3 }, duration: 43200, rewards: { shadowEssence: [3000,10000], soulShards: [75,200], lunarCrystals: [20,40], voidEnergy: [5,15] }, riskPercent: 60, riskEffect: 'card_loss', riskDuration: 172800 },
];

const packs = [
  { id: 'starter-tome', name: 'Starter Tome', description: 'A free introductory tome for new summoners.', cost: null, cardCount: 5, tierWeights: { twilight: 100 }, isOneTime: true, availability: 'shop' },
  { id: 'twilight-pack', name: 'Twilight Pack', description: 'Entry-level pack. 5 Twilight-tier cards.', cost: { currency: 'lunarCrystals', amount: 1 }, cardCount: 5, tierWeights: { twilight: 100 }, availability: 'shop', requiredCL: 1 },
  { id: 'dusk-caller-pack', name: 'Dusk Caller Pack', description: 'Mid-beginner pack with a guaranteed Dusk card.', cost: { currency: 'lunarCrystals', amount: 3 }, cardCount: 5, tierWeights: { twilight: 70, dusk: 30 }, guaranteed: '1 Dusk tier card', guarantees: [{ tier: 'dusk', count: 1 }], availability: 'shop', requiredCL: 1 },
  { id: 'midnight-shroud-pack', name: 'Midnight Shroud Pack', description: 'Intermediate pack with a guaranteed Midnight card.', cost: { currency: 'lunarCrystals', amount: 8 }, cardCount: 5, tierWeights: { twilight: 50, dusk: 40, midnight: 10 }, guaranteed: '1 Midnight tier card', guarantees: [{ tier: 'midnight', count: 1 }], availability: 'shop', requiredCL: 1 },
  { id: 'umbral-veil-pack', name: 'Umbral Veil Pack', description: 'Advanced pack with a guaranteed Umbral card.', cost: { currency: 'lunarCrystals', amount: 15 }, cardCount: 5, tierWeights: { dusk: 30, midnight: 50, umbral: 20 }, guaranteed: '1 Umbral tier card', guarantees: [{ tier: 'umbral', count: 1 }], availability: 'shop', requiredCL: 10 },
  { id: 'eternal-darkness-pack', name: 'Eternal Darkness Pack', description: 'End-game pack with a guaranteed Eternal card.', cost: { currency: 'lunarCrystals', amount: 30 }, cardCount: 5, tierWeights: { midnight: 40, umbral: 50, eternal: 10 }, guaranteed: '1 Eternal tier card', guarantees: [{ tier: 'eternal', count: 1 }], availability: 'shop', requiredCL: 20 },
  { id: 'shadow-collectors-pack', name: "Shadow Collector's Pack", description: 'Premium collector pack with 10 cards and 2 guaranteed Eternals.', cost: { currency: 'lunarCrystals', amount: 50 }, cardCount: 10, tierWeights: { twilight: 5, dusk: 10, midnight: 25, umbral: 40, eternal: 20 }, guaranteed: '2 Eternal tier cards', guarantees: [{ tier: 'eternal', count: 2 }], isPremium: true, availability: 'shop', requiredCL: 50 },
  { id: 'full-moon-special-pack', name: 'Full Moon Special Pack', description: 'Only available during full moon. Boosted Lycanthrope and Shadow types.', cost: { currency: 'lunarCrystals', amount: 25 }, cardCount: 5, tierWeights: { twilight: 20, dusk: 30, midnight: 25, umbral: 20, eternal: 5 }, guaranteed: '1 Lycanthrope card + 1 Umbral or higher', guarantees: [{ types: ['lycanthrope'], count: 1 }, { minTier: 'umbral', count: 1 }], typeBoost: ['lycanthrope', 'shadow'], availability: 'fullMoon', requiredCL: 30 },
  { id: 'event-reward-pack', name: 'Event Reward Pack', description: 'Awarded for participating in limited-time events.', cost: null, cardCount: 5, tierWeights: { twilight: 30, dusk: 30, midnight: 25, umbral: 10, eternal: 5 }, guaranteed: '1 event-exclusive card', availability: 'event', requiredCL: 1 },
  { id: 'timeline-fracture-pack', name: 'Timeline Fracture Pack', description: 'Reward for completing timeline challenges. Majority Umbral and Eternal.', cost: null, cardCount: 5, tierWeights: { midnight: 10, umbral: 50, eternal: 40 }, guaranteed: '1 alternate reality variant card', guarantees: [{ minTier: 'umbral', count: 1 }], availability: 'event', requiredCL: 75 },
  { id: 'cosmic-alignment-pack', name: 'Cosmic Alignment Pack', description: 'Seasonal cosmic event reward with rare types.', cost: null, cardCount: 7, tierWeights: { twilight: 10, dusk: 20, midnight: 30, umbral: 25, eternal: 15 }, guaranteed: '1 cosmic variant card', availability: 'event', requiredCL: 1 },
  { id: 'prestige-reward-pack', name: 'Prestige Reward Pack', description: 'New Game+ reward with high Eternal chance.', cost: null, cardCount: 10, tierWeights: { midnight: 10, umbral: 40, eternal: 50 }, guaranteed: '1 prestige-exclusive card + 2 Eternal cards', guarantees: [{ tier: 'eternal', count: 2 }], availability: 'prestige', requiredCL: 150 },
  { id: 'woodland-whispers-pack', name: 'Woodland Whispers Pack', description: 'Misty Woods expedition reward.', cost: null, cardCount: 3, tierWeights: { twilight: 90, dusk: 10 }, guaranteed: '1 Beast or Spirit type card', guarantees: [{ types: ['beast', 'spirit'], count: 1 }], availability: 'expedition', expeditionId: 'misty-woods', requiredCL: 5 },
  { id: 'restless-dead-pack', name: 'Restless Dead Pack', description: 'Forgotten Graveyard expedition reward.', cost: null, cardCount: 4, tierWeights: { twilight: 70, dusk: 30 }, guaranteed: '1 Undead or Necromancy type card', guarantees: [{ types: ['undead', 'necromancy'], count: 1 }], availability: 'expedition', expeditionId: 'forgotten-graveyard', requiredCL: 20 },
  { id: 'fairy-circle-pack', name: 'Fairy Circle Pack', description: 'Fae Wilds expedition reward.', cost: null, cardCount: 4, tierWeights: { twilight: 60, dusk: 40 }, guaranteed: '1 Fae type card', guarantees: [{ types: ['fae'], count: 1 }], availability: 'expedition', expeditionId: 'fae-wilds', requiredCL: 40 },
  { id: 'umbral-echoes-pack', name: 'Umbral Echoes Pack', description: 'Shadow Realm expedition reward.', cost: null, cardCount: 5, tierWeights: { twilight: 50, dusk: 30, midnight: 20 }, guaranteed: '1 Shadow type card', guarantees: [{ types: ['shadow'], count: 1 }], availability: 'expedition', expeditionId: 'shadow-realm', requiredCL: 60 },
  { id: 'crimson-ritual-pack', name: 'Crimson Ritual Pack', description: 'Blood Temple expedition reward.', cost: null, cardCount: 5, tierWeights: { twilight: 40, dusk: 40, midnight: 20 }, guaranteed: '1 Blood type card', guarantees: [{ types: ['blood'], count: 1 }], availability: 'expedition', expeditionId: 'blood-temple', requiredCL: 80 },
  { id: 'hex-bound-pack', name: 'Hex-Bound Pack', description: 'Cursed Lands expedition reward.', cost: null, cardCount: 5, tierWeights: { twilight: 30, dusk: 50, midnight: 20 }, guaranteed: '1 Cursed type card', guarantees: [{ types: ['cursed'], count: 1 }], availability: 'expedition', expeditionId: 'cursed-lands', requiredCL: 100 },
  { id: 'hellfire-cache-pack', name: 'Hellfire Cache Pack', description: 'Infernal Depths expedition reward.', cost: null, cardCount: 6, tierWeights: { twilight: 20, dusk: 50, midnight: 30 }, guaranteed: '1 Infernal type card', guarantees: [{ types: ['infernal'], count: 1 }], availability: 'expedition', expeditionId: 'infernal-depths', requiredCL: 120 },
  { id: 'starborne-collection-pack', name: 'Starborne Collection Pack', description: 'Cosmic Void expedition reward.', cost: null, cardCount: 6, tierWeights: { twilight: 10, dusk: 40, midnight: 30, umbral: 20 }, guaranteed: '1 card from each of 2 chosen types', availability: 'expedition', expeditionId: 'cosmic-void', requiredCL: 150 },
  { id: 'forgotten-relics-pack', name: 'Forgotten Relics Pack', description: 'Ancient Catacombs expedition reward.', cost: null, cardCount: 6, tierWeights: { dusk: 10, midnight: 50, umbral: 30, eternal: 10 }, guaranteed: '1 Undead or Stone Umbral+ card', guarantees: [{ types: ['undead', 'stone'], minTier: 'umbral', count: 1 }], availability: 'expedition', expeditionId: 'ancient-catacombs', requiredCL: 100 },
  { id: 'reality-fracture-pack', name: 'Reality Fracture Pack', description: 'Void Nexus expedition reward.', cost: null, cardCount: 6, tierWeights: { dusk: 5, midnight: 35, umbral: 40, eternal: 20 }, guaranteed: '1 Ascended card of any type', guarantees: [{ minTier: 'umbral', count: 1 }], availability: 'expedition', expeditionId: 'void-nexus', requiredCL: 120 },
  { id: 'astral-collection-pack', name: 'Astral Collection Pack', description: 'Celestial Spire expedition reward.', cost: null, cardCount: 7, tierWeights: { midnight: 25, umbral: 50, eternal: 25 }, guaranteed: '1 card of each elemental type', guarantees: [{ minTier: 'umbral', count: 2 }], availability: 'expedition', expeditionId: 'celestial-spire', requiredCL: 130 },
  { id: 'genesis-cache-pack', name: 'Genesis Cache Pack', description: 'Primordial Void expedition reward.', cost: null, cardCount: 8, tierWeights: { midnight: 10, umbral: 40, eternal: 50 }, guaranteed: '1 Prestige card + 1 Eternal of chosen type', guarantees: [{ tier: 'eternal', count: 2 }], availability: 'expedition', expeditionId: 'primordial-void', requiredCL: 150 },
];

// --- Type Synergies ---
const typeSynergies = [
  { type: 'beast', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Wild Fury: Double essence during full moon' },
  { type: 'spirit', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Ethereal Harvest: Collect from all at once' },
  { type: 'shadow', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Dark Veil: +100% night generation' },
  { type: 'fae', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Fairy Ring: Random bonus resources' },
  { type: 'blood', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Blood Ritual: Convert essence to shards' },
  { type: 'magic', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Arcane Surge: Boost all nearby cards' },
  { type: 'necromancy', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: "Undying Legion: Cards can't lose levels" },
  { type: 'cursed', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Curse Reversal: Negatives become positives' },
  { type: 'lycanthrope', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Pack Mentality: +200% during full moon' },
  { type: 'undead', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Deathless: Generate while game is closed' },
  { type: 'stone', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Immovable: No negative event effects' },
  { type: 'infernal', threshold1_count: '3', threshold1_bonus: '10', threshold2_count: '5', threshold2_bonus: '25', threshold3_count: '8', threshold3_bonus: '50', fullSetAbility: 'Hellfire: Burn excess for bonus rewards' },
];

// --- Cross-Type Synergies ---
const crossTypeSynergies = [
  { id: 'wild-hunt', name: 'Wild Hunt', type1: 'beast', type2: 'lycanthrope', primaryEffect: 'Expedition time -30%', bonusEffect: 'Increased resource generation during full moon events', productionBonus: '15' },
  { id: 'ghostly-legion', name: 'Ghostly Legion', type1: 'spirit', type2: 'undead', primaryEffect: '25% chance double resources', bonusEffect: 'Spirit resurrect damaged Undead cards', productionBonus: '25' },
  { id: 'hellish-contract', name: 'Hellish Contract', type1: 'blood', type2: 'infernal', primaryEffect: '+20% generation', bonusEffect: 'Blood gain fire, Infernal gain vampiric abilities', productionBonus: '20' },
  { id: 'living-darkness', name: 'Living Darkness', type1: 'shadow', type2: 'stone', primaryEffect: 'Offline extended to 12h', bonusEffect: 'Immune to expedition hazards', productionBonus: '15' },
  { id: 'arcane-enchantment', name: 'Arcane Enchantment', type1: 'magic', type2: 'fae', primaryEffect: 'Spell effects 50% longer', bonusEffect: 'Cards enchant others temporarily', productionBonus: '12' },
  { id: 'doom-pact', name: 'Doom Pact', type1: 'necromancy', type2: 'cursed', primaryEffect: 'Expedition rewards +25%', bonusEffect: 'Convert negatives into bonuses', productionBonus: '15' },
  { id: 'wild-enchantment', name: 'Wild Enchantment', type1: 'fae', type2: 'beast', primaryEffect: '20% chance Lunar Crystal on collect', bonusEffect: 'Fae gain natural armor, Beast gain enchantments', productionBonus: '12' },
  { id: 'midnight-hunters', name: 'Midnight Hunters', type1: 'shadow', type2: 'lycanthrope', primaryEffect: 'New moon +75% production', bonusEffect: '35% faster night expeditions', productionBonus: '18' },
  { id: 'hemomancy', name: 'Hemomancy', type1: 'blood', type2: 'magic', primaryEffect: '15% chance speed up timers', bonusEffect: 'Magic boost Blood production rates', productionBonus: '15' },
  { id: 'deaths-dominion', name: "Death's Dominion", type1: 'necromancy', type2: 'undead', primaryEffect: 'Undead generate Soul Shards', bonusEffect: '25% chance to instant collect all Undead', productionBonus: '18' },
];

// --- Daily Quests ---
const dailyQuests = [
  { id: 'collect-5-cards', description: 'Collect from 5 cards', target: '5', difficulty: 'easy', rewardSE: '75', rewardSS: '8', rewardLC: '' },
  { id: 'login-night', description: 'Log in during nighttime', target: '1', difficulty: 'easy', rewardSE: '50', rewardSS: '5', rewardLC: '' },
  { id: 'open-1-pack', description: 'Open 1 tome', target: '1', difficulty: 'easy', rewardSE: '100', rewardSS: '10', rewardLC: '' },
  { id: 'level-up-1', description: 'Level up a card', target: '1', difficulty: 'easy', rewardSE: '75', rewardSS: '7', rewardLC: '' },
  { id: 'collect-500-essence', description: 'Collect 500 Shadow Essence', target: '500', difficulty: 'easy', rewardSE: '80', rewardSS: '8', rewardLC: '' },
  { id: 'send-expedition', description: 'Send a card on expedition', target: '1', difficulty: 'easy', rewardSE: '100', rewardSS: '10', rewardLC: '' },
  { id: 'collect-15-cards', description: 'Collect from 15 cards', target: '15', difficulty: 'hard', rewardSE: '500', rewardSS: '30', rewardLC: '1' },
  { id: 'level-up-5', description: 'Level up 5 cards', target: '5', difficulty: 'hard', rewardSE: '500', rewardSS: '40', rewardLC: '1' },
  { id: 'collect-5000-essence', description: 'Collect 5000 Shadow Essence', target: '5000', difficulty: 'hard', rewardSE: '500', rewardSS: '50', rewardLC: '1' },
  { id: 'complete-3-expeditions', description: 'Complete 3 expeditions', target: '3', difficulty: 'hard', rewardSE: '500', rewardSS: '35', rewardLC: '1' },
];

// --- CL Rewards (generated, matching synergies.ts) ---
function generateCLRewards() {
  const rewards = [];
  // Phase 1 card unlocks
  const phase1 = [
    { cl: 1, cardId: 'set1-shadow-imp', cardName: 'Shadow Imp' },
    { cl: 2, cardId: 'set1-moon-touched', cardName: 'Moon-Touched' },
    { cl: 4, cardId: 'set1-shadow-rat', cardName: 'Shadow Rat' },
    { cl: 6, cardId: 'set1-partial-shifter', cardName: 'Partial Shifter' },
    { cl: 8, cardId: 'set1-darkness-wisp', cardName: 'Darkness Wisp' },
    { cl: 10, cardId: 'set1-werewolf-pup', cardName: 'Werewolf Pup' },
    { cl: 12, cardId: 'set1-dusk-hound', cardName: 'Dusk Hound' },
    { cl: 14, cardId: 'set1-moonlight-stalker', cardName: 'Moonlight Stalker' },
    { cl: 16, cardId: 'set1-wolf-kin', cardName: 'Wolf Kin' },
    { cl: 18, cardId: 'set1-umbral-stalker', cardName: 'Umbral Stalker' },
    { cl: 20, cardId: 'set1-night-stalker', cardName: 'Night Stalker' },
    { cl: 22, cardId: 'set1-moon-hunter', cardName: 'Moon Hunter' },
    { cl: 24, cardId: 'set1-shadow-weaver', cardName: 'Shadow Weaver' },
    { cl: 26, cardId: 'set1-mist-panther', cardName: 'Mist Panther' },
    { cl: 28, cardId: 'set1-pack-runner', cardName: 'Pack Runner' },
    { cl: 30, cardId: 'set1-night-shroud', cardName: 'Night Shroud' },
    { cl: 32, cardId: 'set1-dire-wolf', cardName: 'Dire Wolf' },
  ];
  for (const e of phase1) {
    rewards.push({ cl: String(e.cl), type: 'card', amount: '1', description: e.cardName, cardId: e.cardId });
  }
  // Essence/shard/crystal bonuses
  rewards.push({ cl: '3', type: 'shadowEssence', amount: '150', description: '150 Shadow Essence', cardId: '' });
  rewards.push({ cl: '5', type: 'shadowEssence', amount: '250', description: '250 Shadow Essence', cardId: '' });
  rewards.push({ cl: '7', type: 'shadowEssence', amount: '400', description: '400 Shadow Essence', cardId: '' });
  rewards.push({ cl: '9', type: 'shadowEssence', amount: '500', description: '500 Shadow Essence', cardId: '' });
  rewards.push({ cl: '11', type: 'shadowEssence', amount: '600', description: '600 Shadow Essence', cardId: '' });
  rewards.push({ cl: '13', type: 'shadowEssence', amount: '750', description: '750 Shadow Essence', cardId: '' });
  rewards.push({ cl: '15', type: 'soulShards', amount: '25', description: '25 Universal Soul Shards', cardId: '' });
  rewards.push({ cl: '17', type: 'shadowEssence', amount: '1000', description: '1000 Shadow Essence', cardId: '' });
  rewards.push({ cl: '19', type: 'shadowEssence', amount: '1200', description: '1200 Shadow Essence', cardId: '' });
  rewards.push({ cl: '21', type: 'soulShards', amount: '50', description: '50 Universal Soul Shards', cardId: '' });
  rewards.push({ cl: '23', type: 'lunarCrystals', amount: '3', description: '3 Lunar Crystals', cardId: '' });
  rewards.push({ cl: '25', type: 'tome', amount: '1', description: '1 Standard Tome', cardId: '' });
  rewards.push({ cl: '27', type: 'soulShards', amount: '75', description: '75 Universal Soul Shards', cardId: '' });
  rewards.push({ cl: '29', type: 'lunarCrystals', amount: '5', description: '5 Lunar Crystals', cardId: '' });
  rewards.push({ cl: '31', type: 'shadowEssence', amount: '2000', description: '2000 Shadow Essence', cardId: '' });
  // Higher CL
  for (let cl = 35; cl <= 150; cl += 5) rewards.push({ cl: String(cl), type: 'tome', amount: '1', description: '1 Standard Tome', cardId: '' });
  for (let cl = 40; cl <= 150; cl += 10) rewards.push({ cl: String(cl), type: 'soulShards', amount: '25', description: '25 Universal Soul Shards', cardId: '' });
  for (let cl = 50; cl <= 150; cl += 25) rewards.push({ cl: String(cl), type: 'lunarCrystals', amount: '3', description: '3 Lunar Crystals', cardId: '' });
  for (let cl = 50; cl <= 150; cl += 50) rewards.push({ cl: String(cl), type: 'premiumTome', amount: '1', description: '1 Premium Tome', cardId: '' });
  return rewards.sort((a, b) => Number(a.cl) - Number(b.cl));
}

// --- Feature Unlocks ---
const featureUnlocks = [
  { cl: '1', feature: 'basic-collection', description: 'Collect resources from cards' },
  { cl: '1', feature: 'pack-opening', description: 'Open card tomes' },
  { cl: '1', feature: 'beast-type', description: 'Beast cards available' },
  { cl: '1', feature: 'shadow-type', description: 'Shadow cards available' },
  { cl: '1', feature: 'spirit-type', description: 'Spirit cards available' },
  { cl: '3', feature: 'shadowkeep', description: 'Collection screen unlocked' },
  { cl: '5', feature: 'misty-woods', description: 'Misty Woods expedition unlocked' },
  { cl: '7', feature: 'day-night-cycle', description: 'Day/Night cycle affects cards' },
  { cl: '10', feature: 'dark-market', description: 'Dark Market trading unlocked' },
  { cl: '10', feature: 'blood-type', description: 'Blood cards available' },
  { cl: '10', feature: 'undead-type', description: 'Undead cards available' },
  { cl: '15', feature: 'crypt-slot-4', description: '4th Crypt slot unlocked' },
  { cl: '20', feature: 'forgotten-graveyard', description: 'Forgotten Graveyard expedition unlocked' },
  { cl: '20', feature: 'fae-type', description: 'Fae cards available' },
  { cl: '20', feature: 'magic-type', description: 'Magic cards available' },
  { cl: '25', feature: 'crypt-slot-5', description: '5th Crypt slot unlocked' },
  { cl: '30', feature: 'awakening', description: 'Card Awakening system unlocked' },
  { cl: '30', feature: 'lycanthrope-type', description: 'Lycanthrope cards available' },
  { cl: '30', feature: 'necromancy-type', description: 'Necromancy cards available' },
  { cl: '40', feature: 'fae-wilds', description: 'Fae Wilds expedition unlocked' },
  { cl: '40', feature: 'cursed-type', description: 'Cursed cards available' },
  { cl: '40', feature: 'stone-type', description: 'Stone cards available' },
  { cl: '50', feature: 'crypt-slot-6', description: '6th Crypt slot unlocked' },
  { cl: '50', feature: 'infernal-type', description: 'Infernal cards available' },
  { cl: '60', feature: 'shadow-realm', description: 'Shadow Realm expedition unlocked' },
  { cl: '75', feature: 'crypt-slot-7', description: '7th Crypt slot unlocked' },
  { cl: '80', feature: 'blood-temple', description: 'Blood Temple expedition unlocked' },
  { cl: '100', feature: 'cursed-lands', description: 'Cursed Lands expedition unlocked' },
  { cl: '100', feature: 'ancient-catacombs', description: 'Ancient Catacombs expedition unlocked' },
  { cl: '120', feature: 'infernal-depths', description: 'Infernal Depths expedition unlocked' },
  { cl: '120', feature: 'void-nexus', description: 'Void Nexus expedition unlocked' },
  { cl: '130', feature: 'celestial-spire', description: 'Celestial Spire expedition unlocked' },
  { cl: '150', feature: 'cosmic-void', description: 'Cosmic Void expedition unlocked' },
  { cl: '150', feature: 'primordial-void', description: 'Primordial Void expedition unlocked' },
];

// --- CL Config (mixed key/value) ---
const clConfig = [
  { category: 'typeunlock', key: 'beast', value: '1' },
  { category: 'typeunlock', key: 'shadow', value: '1' },
  { category: 'typeunlock', key: 'spirit', value: '1' },
  { category: 'typeunlock', key: 'lycanthrope', value: '1' },
  { category: 'typeunlock', key: 'blood', value: '10' },
  { category: 'typeunlock', key: 'undead', value: '10' },
  { category: 'typeunlock', key: 'fae', value: '20' },
  { category: 'typeunlock', key: 'magic', value: '20' },
  { category: 'typeunlock', key: 'necromancy', value: '30' },
  { category: 'typeunlock', key: 'cursed', value: '40' },
  { category: 'typeunlock', key: 'stone', value: '40' },
  { category: 'typeunlock', key: 'infernal', value: '50' },
  { category: 'cryptslot', key: '4', value: '15' },
  { category: 'cryptslot', key: '5', value: '25' },
  { category: 'cryptslot', key: '6', value: '50' },
  { category: 'cryptslot', key: '7', value: '75' },
];

// --- Settings ---
const settingsRows = [
  { key: 'tickInterval', value: '1000' },
  { key: 'autoSaveInterval', value: '10000' },
  { key: 'maxCryptSlots', value: '7' },
  { key: 'offlineMaxHours', value: '8' },
  { key: 'offlineEssenceMultiplier', value: '0.5' },
];

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('Populating SheetDB...\n');

  // Push all sheets
  await pushSheet('Cards', allCards);
  await pushSheet('Packs', packs.map(flattenPack));
  await pushSheet('Expeditions', expeditions.map(flattenExpedition));
  await pushSheet('TypeSynergies', typeSynergies);
  await pushSheet('CrossTypeSynergies', crossTypeSynergies);
  await pushSheet('DailyQuests', dailyQuests);
  await pushSheet('CLRewards', generateCLRewards());
  await pushSheet('FeatureUnlocks', featureUnlocks);
  await pushSheet('CLConfig', clConfig);
  await pushSheet('Settings', settingsRows);

  console.log('\nDone! Your spreadsheet is now populated with all game data.');
  console.log('Edit values in Google Sheets, then the app will read from SheetDB.');
}

main().catch(console.error);
