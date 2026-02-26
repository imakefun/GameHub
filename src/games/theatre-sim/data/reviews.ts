import type { ReviewCategory } from '../types';

// Reviewer name pool
export const reviewerFirstNames = [
  'Sarah', 'David', 'Maria', 'James', 'Emily', 'Michael', 'Jessica', 'Robert',
  'Amanda', 'Chris', 'Lisa', 'Kevin', 'Rachel', 'Brian', 'Nicole', 'Andrew',
  'Stephanie', 'Jason', 'Michelle', 'Daniel', 'Laura', 'Thomas', 'Amy', 'Patrick',
  'Jennifer', 'Mark', 'Kelly', 'Scott', 'Karen', 'Eric', 'Megan', 'Tyler',
  'Heather', 'Nathan', 'Ashley', 'Brandon', 'Tiffany', 'Derek', 'Samantha', 'Greg',
];

export const reviewerLastInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function randomReviewerName(): string {
  const first = reviewerFirstNames[Math.floor(Math.random() * reviewerFirstNames.length)];
  const last = reviewerLastInitials[Math.floor(Math.random() * reviewerLastInitials.length)];
  return `${first} ${last}.`;
}

// ============ Review text templates ============
// Organized by star rating and category

interface ReviewTemplate {
  rating: number; // 1-5
  category: ReviewCategory;
  texts: string[];
}

export const reviewTemplates: ReviewTemplate[] = [
  // ====== 5-star reviews ======
  { rating: 5, category: 'cleanliness', texts: [
    'Spotless theatre! You can tell they take pride in keeping this place clean. Bathrooms were immaculate.',
    'Cleanest movie theatre I\'ve ever been to. Not a sticky floor in sight. Bravo!',
    'Everything was pristine — the lobby, the seats, even the armrests. Impressed!',
  ]},
  { rating: 5, category: 'service', texts: [
    'The staff here is incredible! Everyone was so friendly and helpful. Really made our night.',
    'Amazing customer service. The cashier was cheerful, the usher helped us find great seats. Five stars!',
    'Staff went above and beyond. You can tell they actually enjoy working here.',
  ]},
  { rating: 5, category: 'experience', texts: [
    'Perfect movie experience from start to finish. Picture quality was stunning and sound was crystal clear.',
    'Best screen in town. The picture was sharp, audio was perfect, movie started right on time.',
    'Incredible experience! The projector quality is top-notch and the seats are so comfortable.',
  ]},
  { rating: 5, category: 'value', texts: [
    'Great value for the price! Way better than the big chains and more affordable too.',
    'Totally worth it. Fair prices, great experience. This is how a theatre should be run.',
    'Best bang for your buck in town. Reasonable tickets and the concessions aren\'t highway robbery.',
  ]},
  { rating: 5, category: 'facilities', texts: [
    'Beautiful theatre. The seats are comfortable, the screens are huge, and the lobby is gorgeous.',
    'Love what they\'ve done with the place. The upgrades really show. Comfy seats, great atmosphere.',
    'Top-notch facilities. Everything feels modern and well-maintained. Will definitely be back!',
  ]},

  // ====== 4-star reviews ======
  { rating: 4, category: 'cleanliness', texts: [
    'Nice and clean for the most part. Just a few minor things, but well above average.',
    'Theatre was tidy. Nothing to complain about really. Good job keeping things presentable.',
  ]},
  { rating: 4, category: 'service', texts: [
    'Staff was friendly and efficient. Quick line at the box office. No complaints.',
    'Good service overall. Everyone was pleasant and things ran smoothly.',
  ]},
  { rating: 4, category: 'experience', texts: [
    'Really enjoyed the movie. Picture and sound were great. Minor issue with someone\'s phone but that\'s not the theatre\'s fault.',
    'Good viewing experience. Solid screen quality and comfortable enough seats.',
  ]},
  { rating: 4, category: 'value', texts: [
    'Prices are fair for what you get. Not the cheapest, but the quality justifies it.',
    'Good value. Tickets are reasonable and the experience delivers.',
  ]},
  { rating: 4, category: 'facilities', texts: [
    'Nice theatre overall. A few things could use updating but nothing major.',
    'Solid facilities. Seats are decent, screens are good. Room for improvement but enjoyable.',
  ]},

  // ====== 3-star reviews ======
  { rating: 3, category: 'cleanliness', texts: [
    'It\'s okay. Not the cleanest place but not terrible either. Could use more attention.',
    'Average cleanliness. The lobby was fine but the auditorium had some crumbs on seats.',
    'Middling. The restrooms could definitely use more frequent cleaning.',
  ]},
  { rating: 3, category: 'service', texts: [
    'Service was meh. Staff didn\'t seem very engaged but they got the job done.',
    'Nothing special service-wise. Felt like the employees were just going through the motions.',
    'Okay service. Not rude, not friendly. Just... there.',
  ]},
  { rating: 3, category: 'experience', texts: [
    'Decent enough for a movie night. Nothing wowed me but nothing terrible either.',
    'Average movie experience. The screen was fine, sound was adequate. Just okay.',
    'It does the job. Don\'t expect anything fancy but it\'s serviceable.',
  ]},
  { rating: 3, category: 'value', texts: [
    'Prices are a bit steep for what you get. The experience doesn\'t quite match the cost.',
    'It\'s fine for the price I guess, but there are better options out there.',
  ]},
  { rating: 3, category: 'facilities', texts: [
    'The place is showing its age a bit. Functional but not impressive.',
    'Seats have seen better days. The theatre works but feels a bit neglected.',
  ]},

  // ====== 2-star reviews ======
  { rating: 2, category: 'cleanliness', texts: [
    'Pretty dirty. The floors were sticky and there was trash from the previous showing on my seat.',
    'Gross. The bathrooms were a disaster and the lobby smelled musty. Not acceptable.',
    'Cleanliness is a real issue here. Found old popcorn under my seat and the armrests were grimy.',
  ]},
  { rating: 2, category: 'service', texts: [
    'Staff seemed like they\'d rather be anywhere else. The cashier barely acknowledged me.',
    'Terrible attitude from the employees. One of them actually rolled their eyes when I asked a question.',
    'Poor service. Waited forever at the counter and the staff looked miserable.',
  ]},
  { rating: 2, category: 'experience', texts: [
    'Movie started 15 minutes late and nobody gave any explanation. The projection was also slightly out of focus.',
    'Not great. The sound kept cutting out and the picture was dim. Pretty disappointing.',
    'The screen had a weird flicker the whole movie. Took me right out of the experience.',
  ]},
  { rating: 2, category: 'value', texts: [
    'Way overpriced for what you get. I can get a better experience at home for free.',
    'They\'re charging premium prices for a basic experience. Not worth it.',
    'The ticket prices don\'t match the quality at all. Feel ripped off.',
  ]},
  { rating: 2, category: 'facilities', texts: [
    'My seat was wobbly and the armrest was broken. The place needs serious renovation.',
    'Facilities are really run down. Broken seats, stained carpet, peeling paint.',
    'This place has seen better days. Everything feels old and neglected.',
  ]},

  // ====== 1-star reviews ======
  { rating: 1, category: 'cleanliness', texts: [
    'DISGUSTING. The theatre was absolutely filthy. Spills on the floor, overflowing trash cans, and the bathroom... I can\'t even.',
    'Worst hygiene I\'ve ever seen in a business. There is no excuse for this level of filth.',
    'I\'m pretty sure this place hasn\'t been cleaned in weeks. Health department needs to visit.',
  ]},
  { rating: 1, category: 'service', texts: [
    'Staff was outright RUDE. The cashier snapped at me and the usher ignored us completely. Never again.',
    'Absolutely horrible customer service. Employees were hostile and unhelpful. Management needs to fix this.',
    'The worst service I\'ve experienced anywhere. Staff acted like customers were an inconvenience.',
  ]},
  { rating: 1, category: 'experience', texts: [
    'Movie didn\'t start for 25 minutes, then the projector broke halfway through. No refund offered. Avoid.',
    'Complete disaster. The sound was unbearable — way too loud in some parts and barely audible in others.',
    'The screen went dark TWICE during the movie. Clearly nobody is running the projector properly.',
  ]},
  { rating: 1, category: 'value', texts: [
    'Highway robbery. They want HOW MUCH for a ticket to sit in a broken seat and watch a blurry screen?!',
    'Save your money. Literally any other form of entertainment is better value than this overpriced dump.',
    'I want my money back. Absolutely not worth a single penny of what they charge.',
  ]},
  { rating: 1, category: 'facilities', texts: [
    'This place is falling apart. Broken seats, stained screens, and it smells like mildew. A complete joke.',
    'Avoid this theatre. The building should be condemned. Nothing works properly.',
    'Went here expecting a theatre and got a condemned building. Seats broken, screen damaged, walls cracking.',
  ]},
];

/** Pick a review text matching the given rating and category */
export function pickReviewText(rating: number, category: ReviewCategory): string {
  const matches = reviewTemplates.filter(t => t.rating === rating && t.category === category);
  if (matches.length === 0) {
    // Fallback: try just rating
    const ratingMatches = reviewTemplates.filter(t => t.rating === rating);
    if (ratingMatches.length === 0) return 'No comment.';
    const template = ratingMatches[Math.floor(Math.random() * ratingMatches.length)];
    return template.texts[Math.floor(Math.random() * template.texts.length)];
  }
  const template = matches[Math.floor(Math.random() * matches.length)];
  return template.texts[Math.floor(Math.random() * template.texts.length)];
}
