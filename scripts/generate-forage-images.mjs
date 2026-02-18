#!/usr/bin/env node
/**
 * Generates all Forage or Die game images using Gemini 2.5 Flash Image.
 *
 * Usage:
 *   node scripts/generate-forage-images.mjs <GEMINI_API_KEY> [--category items|biomes|outcomes] [--only filename]
 *
 * Examples:
 *   node scripts/generate-forage-images.mjs AIza...xyz                        # generate everything
 *   node scripts/generate-forage-images.mjs AIza...xyz --category items       # only item images
 *   node scripts/generate-forage-images.mjs AIza...xyz --only fly-agaric.png  # single file
 *
 * Skips files that already exist. Delete a file to regenerate it.
 */

import fs from 'node:fs';
import path from 'node:path';

// ─── CLI ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const API_KEY = args[0];

if (!API_KEY || API_KEY.startsWith('--')) {
  console.error(
    'Usage: node scripts/generate-forage-images.mjs <GEMINI_API_KEY> [--category items|biomes|outcomes] [--only filename]',
  );
  process.exit(1);
}

const categoryFlag =
  args.indexOf('--category') !== -1 ? args[args.indexOf('--category') + 1] : null;
const onlyFlag =
  args.indexOf('--only') !== -1 ? args[args.indexOf('--only') + 1] : null;

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;
const PUBLIC = path.resolve(import.meta.dirname, '..', 'public', 'images', 'forage-or-die');

// ─── Style prefix ───────────────────────────────────────────

const STYLE =
  'Detailed naturalist field-guide illustration, watercolor and ink style, scientific accuracy, soft neutral background, no text or labels.';

// ─── Image entries ──────────────────────────────────────────

const ITEMS = [
  // ── Mushrooms ──
  { file: 'chanterelle-mushroom.png', prompt: `${STYLE} Chanterelle mushroom (Cantharellus cibarius). Golden-yellow funnel-shaped caps with blunt, forking false gills (ridges) running down a solid tapering stem. Pale yellow flesh throughout. Growing from dark forest soil among leaf litter.` },
  { file: 'jack-o-lantern-mushroom.png', prompt: `${STYLE} Jack-O-Lantern mushroom (Omphalotus olearius). Bright orange fan-shaped caps in a dense overlapping cluster at the base of a tree stump. True, knife-blade thin gills radiate underneath. Faint green bioluminescent glow visible on gill edges.` },
  { file: 'destroying-angel.png', prompt: `${STYLE} Destroying Angel mushroom (Amanita virosa). Pristine pure white mushroom with smooth convex cap, crowded free white gills, tall white stem with a delicate membranous skirt-ring halfway up, and a saclike volva cup wrapping the bulbous base partially buried in soil.` },
  { file: 'puffball-mushroom.png', prompt: `${STYLE} Giant Puffball mushroom (Calvatia gigantea). Large round white sphere sitting directly on ground with no visible stem or gills. Smooth leathery skin. Cross-section cutaway showing pure solid white interior flesh.` },
  { file: 'chicken-of-the-woods.png', prompt: `${STYLE} Chicken of the Woods mushroom (Laetiporus sulphureus). Bright orange-and-sulfur-yellow shelf brackets growing in overlapping rosette fans on the side of an oak trunk. Pore surface underneath with no gills. Fleshy moist edges fading to pale tips.` },
  { file: 'funeral-bell.png', prompt: `${STYLE} Funeral Bell mushroom (Galerina marginata). Small cluster of honey-brown caps 2-4 cm on thin fibrous stems growing from dead wood. Caps slightly sticky with faint striations at the margin. A fragile ring zone on the upper stem darkened by falling spores.` },
  { file: 'fly-agaric.png', prompt: `${STYLE} Fly Agaric mushroom (Amanita muscaria). Iconic bright scarlet-red cap dotted with raised white wart-like patches. White gills, thick white stem with a shaggy ring, and a bulbous base encased in concentric scaly rings. Growing from soil beneath birch trees.` },
  { file: 'birch-bolete.png', prompt: `${STYLE} Birch Bolete mushroom (Leccinum scabrum). Brown convex cap atop a tall sturdy white-to-grey stem covered in rough dark-brown to black scabers. Underside has a cream-colored spongy pore surface instead of gills. Growing from soil near birch roots.` },
  { file: 'morel-mushroom.png', prompt: `${STYLE} Morel mushroom (Morchella esculenta). Conical to ovoid cap entirely covered in a honeycomb network of deep pits and sharp ridges. Pale tan to dark brown. Attached directly to a whitish hollow stem. Cross-section showing completely hollow interior from cap tip to stem base.` },
  { file: 'false-morel.png', prompt: `${STYLE} False Morel mushroom (Gyromitra esculenta). Brain-like irregularly lobed and wrinkled reddish-brown cap with deeply convoluted folds rather than regular honeycomb pits. Cap attached at top of a stout pale stem. Cross-section showing chambered cottony interior, not cleanly hollow.` },
  { file: 'oyster-mushroom.png', prompt: `${STYLE} Oyster mushroom (Pleurotus ostreatus). White-to-grey fan-shaped caps in an overlapping shelf cluster on the side of a deciduous log. Short stubby off-center stems. White decurrent gills running down into the stem.` },
  { file: 'angel-wing.png', prompt: `${STYLE} Angel Wing mushroom (Pleurocybella porrigens). Paper-thin pure white fan-shaped caps growing directly from a conifer log with no stem. Crowded white gills radiate from the attachment point. Caps almost translucent at their delicate wavy edges.` },
  { file: 'death-cap.png', prompt: `${STYLE} Death Cap mushroom (Amanita phalloides). Pale olive-green to yellowish cap with faint radial streaks. White free gills underneath. White stem with a prominent hanging ring skirt and a large white saclike volva at the base partially buried in soil.` },
  { file: 'meadow-mushroom.png', prompt: `${STYLE} Meadow Mushroom (Agaricus campestris). White convex cap with a dry slightly silky surface. Gills progressing from bright pink when young to chocolate-brown when mature. Short white stem with a thin fragile ring. No volva, stem base sits cleanly in grass.` },
  // ── Plants ──
  { file: 'watercress.png', prompt: `${STYLE} Watercress (Nasturtium officinale). Clusters of small round dark-green pinnate leaves on hollow floating stems in clear shallow running water. Tiny four-petaled white flowers in terminal clusters. Roots trailing in current.` },
  { file: 'water-hemlock.png', prompt: `${STYLE} Water Hemlock (Cicuta maculata). Tall erect plant with compound leaves divided into sharply toothed narrow leaflets with veins running to the notches between teeth. Flat-topped umbrella clusters of tiny white flowers. Cross-section of hollow chambered stem at base.` },
  { file: 'wild-garlic.png', prompt: `${STYLE} Wild Garlic (Allium ursinum). Broad smooth bright-green lanceolate leaves rising directly from the ground, each with a distinct central midrib. Star-shaped six-petaled white flowers in a spherical cluster atop a single triangular stem.` },
  { file: 'lily-of-the-valley.png', prompt: `${STYLE} Lily of the Valley (Convallaria majalis). Two broad smooth parallel-veined elliptical leaves sheathing at the base. A single arching stem bearing a one-sided raceme of small white waxy bell-shaped drooping flowers.` },
  { file: 'wild-carrot.png', prompt: `${STYLE} Wild Carrot, Queen Anne's Lace (Daucus carota). Flat-topped compound umbel of tiny white flowers with a single distinctive tiny dark-purple floret in the exact center. Hairy green stem. Finely divided feathery carrot-like leaves.` },
  { file: 'poison-hemlock.png', prompt: `${STYLE} Poison Hemlock (Conium maculatum). Tall smooth hollow stem marked with irregular reddish-purple blotches and spots. Compound umbels of small white flowers with no purple center floret. Finely divided fern-like leaves.` },
  { file: 'stinging-nettle.png', prompt: `${STYLE} Stinging Nettle (Urtica dioica). Erect plant with opposite pairs of dark-green coarsely serrated pointed leaves on a square stem. Entire plant covered in fine translucent needle-like trichomes. Dangling catkin-like clusters of tiny green flowers at leaf axils.` },
  { file: 'giant-hogweed.png', prompt: `${STYLE} Giant Hogweed (Heracleum mantegazzianum). Massive plant with enormous deeply-lobed palmate leaves. Thick green stem with dark reddish-purple blotches and coarse white bristly hairs. Large flat-topped compound umbels of white flowers.` },
  { file: 'cattail.png', prompt: `${STYLE} Cattail (Typha latifolia). Tall erect grass-like plant with long flat sword-shaped leaves. Topped by the distinctive brown dense cylindrical flower spike with a narrow gap between the male upper and female lower portions. Growing in standing water.` },
  { file: 'poison-iris.png', prompt: `${STYLE} Yellow Flag Iris (Iris pseudacorus). Sword-shaped leaves arranged in a flat fan pattern at the base. Bright yellow three-petaled iris flowers with dark veining. Dried seed capsules present. Growing in damp soil.` },
  { file: 'wood-sorrel.png', prompt: `${STYLE} Wood Sorrel (Oxalis acetosella). Low-growing plant with trifoliate leaves of three heart-shaped leaflets joined at a central point resembling a shamrock. Small five-petaled white to pale-pink flowers with faint purple veins. Leaves partially folded along midrib.` },
  { file: 'spurge.png', prompt: `${STYLE} Spurge (Euphorbia species). Low-growing plant with smooth rounded opposite leaves on reddish stems. Broken stem oozing conspicuous thick milky-white latex sap. Tiny inconspicuous green cup-shaped cyathia flowers.` },
  { file: 'pine-bark-and-needles.png', prompt: `${STYLE} Pine inner bark and needles (Pinus species). Close-up of pine trunk with rough furrowed outer bark partially peeled back to reveal the thin moist white-to-cream inner cambium layer. Long green needles bundled in fascicles. Brown pine cones on nearby branch.` },
  { file: 'yew-needles.png', prompt: `${STYLE} Yew needles (Taxus baccata). Dark-green short flat soft needles arranged in two distinct rows along a twig forming a flat spray. Underside paler with two yellowish bands. Dark reddish-brown bark.` },
  // ── Berries ──
  { file: 'wild-blackberries.png', prompt: `${STYLE} Wild Blackberries (Rubus fruticosus). Clusters of aggregate drupelets, berries progressing from green to red to deep purple-black on the same thorny cane. Compound serrated trifoliate leaves. Arching thorny reddish stems.` },
  { file: 'pokeweed-berries.png', prompt: `${STYLE} Pokeweed berries (Phytolacca americana). Dark purple-black berries in long drooping raceme clusters on thick smooth magenta-pink to dark red stems. Each berry slightly flattened and segmented. Large smooth alternate lance-shaped leaves.` },
  { file: 'hawthorn-berries.png', prompt: `${STYLE} Hawthorn berries (Crataegus monogyna). Dense clusters of small oval deep-red pomes on a thorny woody shrub. Each berry has a small crown at the tip. Small deeply lobed leaves with pointed lobes. Sharp thorns on branches.` },
  { file: 'yew-berries.png', prompt: `${STYLE} Yew berries (Taxus baccata). Bright red fleshy cup-shaped arils each open at the tip revealing a single dark-brown seed inside. Surrounding branches carry flat dark-green needles in two rows. The red flesh forms a cup not a sphere.` },
  { file: 'bittersweet-nightshade.png', prompt: `${STYLE} Bittersweet Nightshade (Solanum dulcamara). Climbing vine with small oval berries at different ripening stages: green, yellow, orange, and bright red on the same cluster. Star-shaped purple flowers with bright yellow protruding stamens. Pointed sometimes lobed leaves.` },
  { file: 'wild-rose-hips.png', prompt: `${STYLE} Wild Rose Hips (Rosa canina). Firm smooth oval-to-round reddish-orange hips at the tips of thorny rose branches. Each hip has dried brown sepals at the top. Compound pinnate leaves with serrated leaflets. Curved thorns on stems.` },
  { file: 'bilberries.png', prompt: `${STYLE} Bilberries (Vaccinium myrtillus). Tiny dark blue-black berries growing singly on low wiry deciduous bushes. Red-purple flesh inside. Small fine-toothed oval leaves with reddish tinge.` },
  { file: 'baneberry.png', prompt: `${STYLE} Baneberry, Doll's Eyes (Actaea pachypoda). Glossy white berries each with a single black dot, mounted on thick swollen bright-red pedicels. Compound sharply-toothed leaves. The overall effect is disturbingly eye-like.` },
  { file: 'elderberries.png', prompt: `${STYLE} Elderberries (Sambucus nigra). Tiny dark purple-black berries in large flat-topped compound cyme clusters. Berries on reddish stems. Compound pinnate leaves with toothed leaflets. Woody pithy stems.` },
  { file: 'privet-berries.png', prompt: `${STYLE} Privet berries (Ligustrum vulgare). Small shiny black berries in dense upright conical clusters. Berries slightly oval. Smooth glossy untoothed opposite evergreen leaves.` },
  { file: 'wild-rice.png', prompt: `${STYLE} Wild Rice (Zizania aquatica). Tall aquatic grass growing in shallow water with long drooping seed heads bearing slender dark near-black grains. Flat grass-like leaves. Seeds scattering from the panicle.` },
  { file: 'water-arum.png', prompt: `${STYLE} Water Arum (Calla palustris). Glossy dark-green arrow-to-heart-shaped leaves on long petioles rising from shallow water. A single white spathe wrapping around a thick fleshy yellow-green spadix. Cluster of bright red berries forming on the spadix.` },
  { file: 'prickly-pear-cactus.png', prompt: `${STYLE} Prickly Pear Cactus (Opuntia species). Flat oval green pads joined end-to-end, covered in clusters of fine glochids and larger barbed spines at areoles. Purple-red fruits growing at pad edges. Pad cross-section showing moist green interior.` },
  { file: 'pencil-cactus.png', prompt: `${STYLE} Pencil Cactus (Euphorbia tirucalli). Dense mass of thin smooth bright-green pencil-diameter cylindrical succulent stems branching in all directions. No visible spines or leaves. A broken stem oozing thick white milky latex sap.` },
  // ── Animals & Insects ──
  { file: 'banana-slug.png', prompt: `${STYLE} Banana Slug (Ariolimax columbianus). Large bright banana-yellow slug with a few dark blotches. Visible slime trail on a mossy rotting log. Two pairs of tentacles. Mantle saddle-shaped shield behind head. Muscular foot visible.` },
  { file: 'rough-skinned-newt.png', prompt: `${STYLE} Rough-skinned Newt (Taricha granulosa). Small salamander with dark chocolate-brown to black dorsal surface and vivid bright orange ventral surface shown via upturned defensive display posture. Rough granular skin texture. Beady dark eyes.` },
  { file: 'crayfish.png', prompt: `${STYLE} Freshwater Crayfish (Astacidae family). Small freshwater crustacean resembling a miniature lobster. Olive-brown to reddish exoskeleton. Two large chelipeds pincers, four pairs of walking legs, fan-shaped tail. Segmented abdomen. Hiding beneath a flat stream rock.` },
  { file: 'cane-toad.png', prompt: `${STYLE} Cane Toad (Rhinella marina). Large squat heavily-built toad with dry warty leathery brown-grey skin. Prominent bulging kidney-shaped parotoid glands behind each eye. Horizontal pupils. Sitting boldly on a rock.` },
  { file: 'beetle-grubs.png', prompt: `${STYLE} Longhorn beetle larvae (Cerambycidae). Fat C-shaped cream-white grubs with a distinct brown-orange head capsule and visible mandibles. Soft segmented legless body. Nestled in channels of reddish-brown decaying wood fibers inside a pried-open rotting log.` },
  { file: 'brightly-banded-caterpillar.png', prompt: `${STYLE} Aposematic venomous caterpillar (Lonomia species). Fuzzy caterpillar with bold warning-colored bands of orange, black, and white along its body. Long branching venomous urticating spines protruding from each body segment. Curled in a defensive C-shape on a leaf.` },
  { file: 'freshwater-mussels.png', prompt: `${STYLE} Freshwater Mussels (Unionidae family). Dark brown-to-black oval bivalve shells half-buried in mud at a pond edge. Shell surface shows concentric growth rings. One specimen slightly open revealing the pearlescent interior and muscular foot.` },
  { file: 'brightly-colored-frog.png', prompt: `${STYLE} Blue Poison Dart Frog (Dendrobates azureus). Tiny frog with vivid electric-blue skin covered in irregular black spots and patches. Sitting openly on a bright green leaf. Toe pads visible. Upright alert posture.` },
  { file: 'large-brown-cricket.png', prompt: `${STYLE} Field Cricket (Gryllus species). Plump dull brown-to-black field cricket with large hind legs folded for jumping. Long thread-like antennae. Two cerci at the rear. Overlapping wings folded flat against the abdomen. Resting under a sun-warmed stone.` },
  { file: 'glossy-black-beetle.png', prompt: `${STYLE} Blister Beetle (Meloe species). Large shiny metallic-black beetle with a distinctly narrow waist. Short wing-covers that do not fully cover the swollen abdomen. Rear end raised high in defensive posture. Droplets of yellowish hemolymph beading at leg joints.` },
  // ── Aquatic & Coastal ──
  { file: 'common-limpet.png', prompt: `${STYLE} Common Limpet (Patella vulgata). Conical ribbed grey-brown shell clamped tightly to a wave-worn rock in a tidal pool. Rough ridged radial lines on exterior. One specimen flipped to show the broad muscular foot and smooth pearlescent interior.` },
  { file: 'blue-ringed-creature.png', prompt: `${STYLE} Blue-ringed Octopus (Hapalochlaena species). Tiny octopus in a shallow tidal pool. Yellowish-tan base body color covered in iridescent electric-blue rings that are pulsing and glowing. Eight arms with suckers. Mantle and siphon visible.` },
  { file: 'sea-lettuce.png', prompt: `${STYLE} Sea Lettuce (Ulva lactuca). Thin bright translucent-green sheets of seaweed with ruffled lobed wavy edges. No midrib or stem. Attached to a rock at the holdfast. Pliable silk-like texture. Clean ocean water.` },
  { file: 'dull-green-algae-mat.png', prompt: `${STYLE} Cyanobacteria bloom, blue-green algae. Thick slimy opaque blue-green to dark-green mat coating rocks in a stagnant freshwater area. Surface has a paint-like scummy texture with bubbles trapped in the slime. Discolored murky surrounding water.` },
  { file: 'mangrove-periwinkle.png', prompt: `${STYLE} Mangrove Periwinkle snails (Littorina species). Clusters of small conical spiral-shelled snails clinging to the aerial prop-roots of a mangrove tree just above the waterline. Shells grey-brown to dark with fine spiral ridges. Operculum visible on one specimen.` },
  { file: 'cone-snail.png', prompt: `${STYLE} Geography Cone Snail (Conus geographus). Elegant cone-shaped shell with smooth surface displaying intricate brown-and-white mottled map-like patterns. Partially buried in sand. The fleshy siphon protrudes from the narrow anterior end.` },
];

const BIOMES = [
  { file: 'temperate-forest.png', prompt: `${STYLE} Wide landscape of a temperate deciduous forest interior. Thick undergrowth, a fallen moss-covered log, mixed oak and maple trees with dappled light filtering through the canopy.` },
  { file: 'mossy-clearing.png', prompt: `${STYLE} Wide landscape of a damp mossy forest clearing after rain. Moss-covered earth and stones, mist hanging low, fungi emerging from the soil.` },
  { file: 'old-growth-forest.png', prompt: `${STYLE} Wide landscape of an ancient old-growth forest. Massive dead oak with peeling bark, enormous trunks, thick canopy blocking most sunlight.` },
  { file: 'birch-grove.png', prompt: `${STYLE} Wide landscape of a birch grove. White papery-barked birch trees, golden leaves, soil dotted with small mushrooms. Bright autumnal light.` },
  { file: 'shaded-ravine.png', prompt: `${STYLE} Wide landscape of a cool shaded ravine. Steep slopes covered in leaf litter, damp rock faces with dripping moisture, ferns growing from crevices.` },
  { file: 'decaying-stump.png', prompt: `${STYLE} Wide landscape centered on a massive rotting tree stump in a forest. Bracket fungi and moss colonies covering the stump.` },
  { file: 'meadow-edge.png', prompt: `${STYLE} Wide landscape where forest meets grassland meadow. Dewy morning light, wildflowers in the grass, tree line receding.` },
  { file: 'streamside.png', prompt: `${STYLE} Wide landscape of a trickling forest stream. Lush green banks, smooth water-worn stones, overhanging branches.` },
  { file: 'rocky-hillside.png', prompt: `${STYLE} Wide landscape of a sun-warmed rocky hillside. Plants growing from cracks in exposed rock, sparse soil, wide sky above.` },
  { file: 'overgrown-trail.png', prompt: `${STYLE} Wide landscape of an overgrown hiking trail. Tall plants and wildflower clusters choking the path. Dappled forest light.` },
  { file: 'sunny-clearing.png', prompt: `${STYLE} Wide landscape of a sunlit forest clearing. Bright sunlight flooding through a canopy gap, tall grasses, insects in warm air.` },
  { file: 'ditch-bank.png', prompt: `${STYLE} Wide landscape of a drainage ditch bank. Muddy edges, standing water, reeds and rushes. Overcast sky, rural farmland background.` },
  { file: 'forest-floor.png', prompt: `${STYLE} Wide landscape at ground level on the forest floor. Carpet of green moss, towering tree trunks receding upward, canopy far above.` },
  { file: 'pine-forest.png', prompt: `${STYLE} Wide landscape of a deep coniferous pine forest. Tall straight trunks, carpet of brown needles, shafts of light between the trees.` },
  { file: 'forest-edge.png', prompt: `${STYLE} Wide landscape at the edge of a forest. Tree line with berry bushes, open sky beyond. Mixed deciduous trees.` },
  { file: 'hedgerow.png', prompt: `${STYLE} Wide landscape of a thick hedgerow along an old field boundary. Dense tangled shrubs, a rustic fence post. English countryside feel.` },
  { file: 'woodland-path.png', prompt: `${STYLE} Wide landscape of a woodland path. Dappled canopy light, berry shrubs lining the trail, leaf litter underfoot.` },
  { file: 'mountain-slope.png', prompt: `${STYLE} Wide landscape of a high-altitude mountain slope. Sparse rocky soil, alpine meadow grasses, distant peaks, wide sky.` },
  { file: 'autumn-thicket.png', prompt: `${STYLE} Wide landscape of a dense autumn thicket. Late-season fruit on branches, golden and russet leaves, tangled branches.` },
  { file: 'river-crossing.png', prompt: `${STYLE} Wide landscape of a slow river crossing. Shallow water, stepping stones, aquatic plants, overhanging willows.` },
  { file: 'desert-wash.png', prompt: `${STYLE} Wide landscape of a dry desert wash. Cacti, sparse desert shrubs, sandy rocky terrain, harsh bright sunlight, distant mesas.` },
  { file: 'dense-undergrowth.png', prompt: `${STYLE} Wide landscape of deep dark forest with dense undergrowth. Barely any light, thick ferns and brambles, claustrophobic tangled vegetation.` },
  { file: 'rocky-stream.png', prompt: `${STYLE} Wide landscape of a cold rocky mountain stream. Large boulders in rushing water, moss on rocks, overhanging conifers.` },
  { file: 'rotting-log.png', prompt: `${STYLE} Wide landscape centered on a large rotting log on the forest floor. Pried-open bark revealing exposed wood. Surrounding ferns and mushrooms.` },
  { file: 'pond-edge.png', prompt: `${STYLE} Wide landscape of a still pond edge in afternoon light. Muddy bank, lily pads, cattails, dragonflies. Golden-hour reflections.` },
  { file: 'sandy-bank.png', prompt: `${STYLE} Wide landscape of a sun-baked sandy riverbank. Exposed sand and gravel, sparse grass, warm stones. River flowing gently past.` },
  { file: 'tidal-pool.png', prompt: `${STYLE} Wide landscape of a rocky coastline with tidal pools at low tide. Shallow pools in wave-worn rock, barnacles, seaweed. Ocean spray.` },
  { file: 'kelp-beach.png', prompt: `${STYLE} Wide landscape of a storm-wracked beach. Seaweed and kelp washed ashore in tangled piles, grey sky, crashing waves, driftwood.` },
  { file: 'mangrove-swamp.png', prompt: `${STYLE} Wide landscape of a mangrove swamp. Tangled aerial prop-roots rising from warm tidal water, dense green canopy, humid tropical atmosphere.` },
];

const OUTCOMES = [
  { file: 'outcome-safe-1.png', prompt: `${STYLE} Humorous cartoon illustration of a joyful wilderness survivor happily eating foraged food, relieved expression, thumbs up, sitting on a log in a forest clearing.` },
  { file: 'outcome-safe-2.png', prompt: `${STYLE} Humorous cartoon illustration of a satisfied forager rubbing their belly contentedly, little hearts floating above their head, peaceful forest background.` },
  { file: 'outcome-safe-3.png', prompt: `${STYLE} Humorous cartoon illustration of a forager striking a power-up hero pose, flexing muscles, feeling energized after eating, glowing with health.` },
  { file: 'outcome-safe-4.png', prompt: `${STYLE} Humorous cartoon illustration of a wilderness survivor celebrating with arms raised triumphantly, confetti-like leaves falling around them.` },
  { file: 'outcome-safe-5.png', prompt: `${STYLE} Humorous cartoon illustration of a smug forager tapping their temple with a knowing expression, big brain energy, confident they chose correctly.` },
  { file: 'outcome-safe-6.png', prompt: `${STYLE} Humorous cartoon illustration of a forager high-fiving a happy plant, human and nature bonding moment, both smiling, whimsical forest scene.` },
  { file: 'outcome-toxic-1.png', prompt: `${STYLE} Humorous cartoon illustration of a poisoned forager with their translucent ghost comically leaving their body, ghost waving goodbye, dramatic soul-departing pose.` },
  { file: 'outcome-toxic-2.png', prompt: `${STYLE} Humorous cartoon illustration of a forager whose face is turning green, cheeks puffed out, about to be sick, holding their stomach, comedic exaggerated expression.` },
  { file: 'outcome-toxic-3.png', prompt: `${STYLE} Humorous cartoon illustration of a forager sitting calmly at a tiny table in a forest while everything around them is on fire, deadpan expression.` },
  { file: 'outcome-toxic-4.png', prompt: `${STYLE} Humorous cartoon illustration of a forager face-planted on the ground, stars and birds circling their head, legs comically up in the air.` },
  { file: 'outcome-toxic-5.png', prompt: `${STYLE} Humorous cartoon illustration of a poisoned forager on one knee reaching dramatically toward the sky, overly theatrical dying pose, spotlight from above.` },
  { file: 'outcome-toxic-6.png', prompt: `${STYLE} Humorous cartoon illustration of a forager with instant regret expression, wide bulging eyes, both hands clamped over mouth, realizing what they just ate.` },
];

// ─── API call ───────────────────────────────────────────────

async function generateImage(prompt, aspectRatio) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
    },
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No candidates in response');

  const imgPart = parts.find((p) => p.inlineData);
  if (!imgPart) throw new Error('No image data in response');

  return Buffer.from(imgPart.inlineData.data, 'base64');
}

// ─── Processing ─────────────────────────────────────────────

async function processEntry(entry, dir, aspectRatio) {
  const outPath = path.join(dir, entry.file);

  if (fs.existsSync(outPath)) {
    console.log(`  SKIP  ${entry.file} (exists)`);
    return;
  }

  console.log(`  GEN   ${entry.file} ...`);
  const buf = await generateImage(entry.prompt, aspectRatio);
  fs.writeFileSync(outPath, buf);
  console.log(`  DONE  ${entry.file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function processCategory(label, entries, subdir, aspectRatio) {
  const dir = path.join(PUBLIC, subdir);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`\n── ${label} (${entries.length} images, ${aspectRatio}) ──`);

  for (const entry of entries) {
    if (onlyFlag && entry.file !== onlyFlag) continue;

    let attempts = 0;
    while (true) {
      try {
        await processEntry(entry, dir, aspectRatio);
        break;
      } catch (err) {
        attempts++;
        if (attempts >= 4) {
          console.error(`  FAIL  ${entry.file}: ${err.message}`);
          break;
        }
        const delay = 2 ** attempts * 1000;
        console.warn(`  RETRY ${entry.file} in ${delay / 1000}s — ${err.message}`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // pause between requests to respect rate limits
    await new Promise((r) => setTimeout(r, 1500));
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('Forage or Die — Image Generator (Gemini 2.5 Flash Image)');
  console.log(`Output: ${PUBLIC}\n`);

  if (!categoryFlag || categoryFlag === 'items') {
    await processCategory('ITEM ILLUSTRATIONS', ITEMS, 'items', '1:1');
  }
  if (!categoryFlag || categoryFlag === 'biomes') {
    await processCategory('BIOME SCENES', BIOMES, 'biomes', '16:9');
  }
  if (!categoryFlag || categoryFlag === 'outcomes') {
    await processCategory('OUTCOME REACTIONS', OUTCOMES, 'outcomes', '4:3');
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
