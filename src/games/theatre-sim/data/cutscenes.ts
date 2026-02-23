import type { CutsceneSequence } from '../types';

export const cutscenes: CutsceneSequence[] = [
  // ============ OPENING: The story begins ============
  {
    id: 'intro',
    title: 'A Second Chance',
    triggerCondition: 'Game start — before any gameplay',
    beats: [
      {
        text: 'The Starlight Cinema opened its doors in 1962. For decades, it was the heart of this town — the place where first dates happened, where kids saw their first blockbusters, where the magic of movies felt real.',
        imagePlaceholder: 'Sepia-toned photo of a grand 1960s movie theatre with a glowing marquee, crowd lined up outside',
        mood: 'hopeful',
      },
      {
        text: 'But the world changed. The multiplex chains moved in. Streaming took over living rooms. One by one, the lights went out. The Starlight closed its doors five years ago.',
        imagePlaceholder: 'The same theatre now dark and boarded up, weeds growing through cracked parking lot, faded marquee',
        mood: 'dramatic',
      },
      {
        text: 'You grew up watching movies here. Saturday matinees. Sneaking into the late show. The smell of fresh popcorn in the lobby. You always said someone should save this place.',
        imagePlaceholder: 'Interior of abandoned theatre — dusty seats, torn screen, cobwebs on the projector, single shaft of light from a broken ceiling tile',
        mood: 'neutral',
      },
      {
        text: 'Today, that someone is you.',
        imagePlaceholder: 'Silhouette of a person standing in the lobby doorway, light streaming in behind them, theatre interior dark ahead',
        mood: 'dramatic',
      },
      {
        speaker: 'Bank Manager',
        text: '"Six hundred thousand dollars. That\'s what I can authorize for the renovation loan. The building itself is practically worthless — but the lot has value, so we can work with that."',
        imagePlaceholder: 'Bank office — a stern but not unkind manager behind a desk, loan documents spread out, pen ready to sign',
        mood: 'tense',
      },
      {
        speaker: 'Bank Manager',
        text: '"You\'ll have $100,000 in working capital to start. The rest covers the property acquisition. Daily payments start immediately — miss too many and... well, let\'s not think about that."',
        imagePlaceholder: 'Close-up of hands signing loan documents, a set of old brass keys sitting on the desk beside them',
        mood: 'tense',
      },
      {
        text: 'You sign the papers. The keys are heavy in your hand — heavy with possibility. The Starlight Cinema is yours now. Time to bring it back to life.',
        imagePlaceholder: 'Hand holding old brass keys with a Starlight Cinema keychain, the boarded-up theatre visible through the bank window behind',
        mood: 'hopeful',
      },
    ],
  },

  // ============ GRAND OPENING ============
  {
    id: 'grand-opening',
    title: 'Opening Night',
    triggerCondition: 'All restoration requirements met and first movie assigned',
    beats: [
      {
        text: 'The day has finally come. After weeks of repairs, rewiring, replumbing, and more cleaning than you thought humanly possible — the Starlight Cinema is ready to open its doors again.',
        imagePlaceholder: 'The restored theatre exterior at golden hour, fresh paint, new marquee lit up with the first movie title',
        mood: 'triumphant',
      },
      {
        text: 'You stand in the lobby and take it all in. Fresh paint on the walls. The warm glow of the restored Art Deco lighting. The concession stand gleaming. The faint hum of the projector warming up.',
        imagePlaceholder: 'Beautiful restored lobby interior — red walls, gold trim, lit display cases, gleaming concession counter with fresh popcorn',
        mood: 'hopeful',
      },
      {
        text: 'A small crowd gathers outside. Not huge — not yet. But they\'re here. Some are old enough to remember the Starlight\'s glory days. Some are just curious. All of them are about to see a movie.',
        imagePlaceholder: 'A modest but enthusiastic crowd gathering outside the theatre, evening light, some pointing at the marquee',
        mood: 'hopeful',
      },
      {
        text: 'You unlock the front doors and the first customers step inside. A little girl tugs her mother\'s sleeve and whispers, "It\'s so pretty." You bite back a grin. This is going to work.',
        imagePlaceholder: 'View from inside the lobby as the glass doors open, warm light spilling out, first customers stepping in with wonder on their faces',
        mood: 'triumphant',
      },
      {
        text: 'The Starlight Cinema is open for business. Now the real work begins — filling those seats, keeping the lights on, and paying back that loan. One screening at a time.',
        imagePlaceholder: 'The theatre at night, fully lit up, the marquee glowing, a small line at the box office — the Starlight reborn',
        mood: 'hopeful',
      },
    ],
  },

  // ============ FIRST PROFIT ============
  {
    id: 'first-profit',
    title: 'In the Black',
    triggerCondition: 'First day with positive profit',
    beats: [
      {
        text: 'You stare at the numbers on your desk. Then you check them again. Then one more time, just to be sure.',
        imagePlaceholder: 'A desk in a small back office, financial reports spread out, calculator, a coffee mug, late evening light',
        mood: 'neutral',
      },
      {
        text: 'Today, for the first time, the Starlight Cinema made a profit. Not a fortune — but more came in than went out. The math works. This is real.',
        imagePlaceholder: 'Close-up of a financial ledger or screen showing green numbers, a smile reflected in the monitor',
        mood: 'triumphant',
      },
      {
        text: 'There\'s a long road ahead. The loan payments don\'t stop. But today proved something important: this isn\'t just a dream. It\'s a business. And it\'s working.',
        imagePlaceholder: 'View through the office window into the lobby below, customers milling about, the theatre alive and humming',
        mood: 'hopeful',
      },
    ],
  },

  // ============ SECOND SCREEN ============
  {
    id: 'second-screen',
    title: 'Double Feature',
    triggerCondition: 'Two screens running movies simultaneously',
    beats: [
      {
        text: 'Screen 2 flickers to life for the first time. Two movies playing at once. Two audiences, two worlds unfolding simultaneously under the same roof.',
        imagePlaceholder: 'A hallway with two auditorium entrances, movie posters flanking each door, warm light from within both, an usher directing traffic',
        mood: 'hopeful',
      },
      {
        text: 'You can hear the rumble of an action scene from one screen and muffled laughter from the other. The Starlight isn\'t just surviving anymore — it\'s growing.',
        imagePlaceholder: 'Split view — one screen showing an action movie with blue light, the other a comedy with warm tones, audiences visible in silhouette',
        mood: 'triumphant',
      },
    ],
  },

  // ============ PREMIUM UPGRADE ============
  {
    id: 'premium-upgrade',
    title: 'The Premium Experience',
    triggerCondition: 'First screen upgraded to Premium or higher',
    beats: [
      {
        text: 'The plastic sheeting comes down. The construction dust settles. And there it is — the Starlight\'s first premium auditorium.',
        imagePlaceholder: 'A luxurious premium cinema screen — plush leather recliners, ambient strip lighting, massive screen, Dolby speakers visible',
        mood: 'triumphant',
      },
      {
        text: 'Leather recliners that lean back so far you could fall asleep (but you won\'t — the picture is too gorgeous). A sound system that makes you feel the movie in your bones. This is cinema the way it\'s meant to be.',
        imagePlaceholder: 'Close-up of luxurious reclining cinema seat, cup holder with drink, footrest extended, screen glowing in the background',
        mood: 'hopeful',
      },
      {
        text: 'Premium tickets cost more, but they\'re worth it. People will drive from across town for this. The Starlight isn\'t just competing with streaming now — it\'s offering something streaming can never match.',
        imagePlaceholder: 'Excited audience in premium seats, faces lit by the screen, immersed in the movie, some leaning forward in anticipation',
        mood: 'triumphant',
      },
    ],
  },

  // ============ LOAN PAID OFF ============
  {
    id: 'loan-paid-off',
    title: 'Free and Clear',
    triggerCondition: 'Loan balance reaches zero',
    beats: [
      {
        text: 'You make the final payment. Six hundred thousand dollars, paid back in full. The bank manager calls to congratulate you — genuinely, this time.',
        imagePlaceholder: 'The bank manager shaking hands across the desk, a "PAID IN FULL" stamp on loan documents, both people smiling',
        mood: 'triumphant',
      },
      {
        speaker: 'Bank Manager',
        text: '"I\'ll be honest — when you walked in here asking for that loan, I gave you maybe a 20% chance. I\'m glad I was wrong."',
        imagePlaceholder: 'Bank manager leaning back in chair with a genuine smile, the loan folder closed on the desk with a red PAID stamp',
        mood: 'hopeful',
      },
      {
        text: 'The weight lifts. Every dollar the Starlight earns from now on is yours. No more daily payments draining the account. No more watching the balance with white knuckles.',
        imagePlaceholder: 'The theatre owner stepping outside the bank into bright sunlight, looking up at the sky, a moment of pure relief',
        mood: 'triumphant',
      },
      {
        text: 'You drive past the Starlight on the way home. The marquee blazes against the evening sky. For the first time, you don\'t see a building weighed down by debt. You see possibility.',
        imagePlaceholder: 'The Starlight at dusk from across the street, marquee glowing, cars in the parking lot, a thriving business — but seen through new eyes',
        mood: 'hopeful',
      },
    ],
  },

  // ============ FRANCHISE BEGINS ============
  {
    id: 'franchise-start',
    title: 'Thinking Bigger',
    triggerCondition: 'First franchise location purchased',
    beats: [
      {
        text: 'The real estate agent slides the folder across the table. Another theatre. Another fixer-upper. Another chance to bring the magic of cinema to a community that\'s lost it.',
        imagePlaceholder: 'A conference table with property listings, architectural photos of a run-down theatre, a real estate agent presenting',
        mood: 'dramatic',
      },
      {
        text: 'You\'ve done this before, of course. You know what it takes — the sweat, the setbacks, the satisfaction of seeing the lights come on. But this time, you\'re not doing it alone.',
        imagePlaceholder: 'The new franchise location exterior — similar state to the Starlight at the start, but you can see its potential',
        mood: 'hopeful',
      },
      {
        text: 'The Starlight was your proving ground. Now it\'s time to build something bigger. A chain of theatres, each one a little piece of movie magic, each one a place where stories come to life.',
        imagePlaceholder: 'A map on a wall with pins marking theatre locations, the Starlight\'s pin in the center, new ones spreading outward',
        mood: 'triumphant',
      },
    ],
  },

  // ============ CINEMA EMPIRE ============
  {
    id: 'cinema-empire',
    title: 'Cinema Empire',
    triggerCondition: 'All franchise locations owned',
    beats: [
      {
        text: 'You stand on the rooftop of the original Starlight Cinema. From up here, you can see the glow of the downtown Bijou, the sprawl of the Suburban Megaplex\'s parking lot, the vintage neon of the Drive-In.',
        imagePlaceholder: 'Panoramic view from a rooftop at night — multiple theatre marquees visible glowing in the distance across a city skyline',
        mood: 'triumphant',
      },
      {
        text: 'Six theatres. Dozens of screens. Hundreds of employees. Thousands of moviegoers every single day. You built this — from a bankrupt ruin and a handshake loan.',
        imagePlaceholder: 'A collage/montage of all the franchise locations, each lit up and thriving, connected by a shared logo',
        mood: 'triumphant',
      },
      {
        text: 'But here\'s the thing about the movies: the story never really ends. There\'s always another film to show, another audience to thrill, another kid seeing their first blockbuster with their eyes wide open.',
        imagePlaceholder: 'A packed theatre auditorium seen from behind — rows of silhouetted heads all turned toward a brilliant, colorful screen',
        mood: 'hopeful',
      },
      {
        text: 'The Starlight Cinema started with a dream and a set of brass keys. Now it\'s an empire. And every single night, when the lights go down and the projector starts to roll, the magic is just as real as it was on Day One.',
        imagePlaceholder: 'The original Starlight Cinema exterior at night — but now with a "FLAGSHIP" banner, packed lot, and a line around the block. The marquee reads: "THE SHOW GOES ON"',
        mood: 'triumphant',
      },
    ],
  },
];
