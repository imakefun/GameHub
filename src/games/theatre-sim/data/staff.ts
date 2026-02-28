import type { StaffTemplate, StaffCandidate, StaffRole } from '../types';
import { getStaffLevel, getFairWage } from '../types';

export const staffTemplates: StaffTemplate[] = [
  {
    role: 'cashier',
    name: 'Cashier',
    icon: '🎫',
    description: 'Sells tickets at the box office. Higher skill means faster service and fewer errors.',
    baseWage: 80,
    startingSkill: 20,
    maxSkill: 80,
    effect: '+15% ticket sales capacity per cashier',
  },
  {
    role: 'usher',
    name: 'Usher',
    icon: '🔦',
    description: 'Guides customers, checks tickets, and keeps the theatre orderly.',
    baseWage: 70,
    startingSkill: 15,
    maxSkill: 70,
    effect: '+10% customer satisfaction',
  },
  {
    role: 'projectionist',
    name: 'Projectionist',
    icon: '🎬',
    description: 'Operates the projection equipment. Required for each active screen.',
    baseWage: 120,
    startingSkill: 30,
    maxSkill: 90,
    effect: 'Required: 1 per active screen. Skill reduces equipment wear.',
  },
  {
    role: 'janitor',
    name: 'Janitor',
    icon: '🧹',
    description: 'Keeps the theatre clean. Dirty theatres lose reputation fast.',
    baseWage: 65,
    startingSkill: 20,
    maxSkill: 60,
    effect: 'Prevents reputation decay from cleanliness. +5 condition/day per janitor.',
  },
  {
    role: 'concessions',
    name: 'Concession Worker',
    icon: '🍿',
    description: 'Runs the concession stand. More workers means more sales.',
    baseWage: 75,
    startingSkill: 20,
    maxSkill: 75,
    effect: '+25% concession sales capacity per worker',
  },
  {
    role: 'manager',
    name: 'Manager',
    icon: '👔',
    description: 'Oversees operations. Boosts all staff morale and performance.',
    baseWage: 200,
    startingSkill: 40,
    maxSkill: 100,
    effect: '+10% all staff effectiveness. +5 morale/day for all staff.',
  },
];

// Names pool for generating staff members
export const staffNames = [
  'Alex', 'Jordan', 'Sam', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Quinn',
  'Avery', 'Blake', 'Charlie', 'Dana', 'Ellis', 'Frankie', 'Gray', 'Harper',
  'Jamie', 'Kit', 'Lane', 'Max', 'Noel', 'Pat', 'Reese', 'Sage',
  'Rowan', 'Skyler', 'Finley', 'Hayden', 'Kendall', 'Emery',
];

// ============ Traits ============
export interface StaffTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export const staffTraits: StaffTrait[] = [
  { id: 'hardworker', name: 'Hard Worker', description: 'Puts in extra effort every shift.', effect: '+20% XP gain' },
  { id: 'friendly', name: 'Friendly', description: 'Always greets customers with a smile.', effect: '+5% customer satisfaction' },
  { id: 'grumpy', name: 'Grumpy', description: 'Not the cheeriest, but gets the job done.', effect: '-5 starting morale' },
  { id: 'veteran', name: 'Veteran', description: 'Has years of theatre experience.', effect: '+30% starting skill' },
  { id: 'cheapskate', name: 'Thrifty', description: 'Works for less, but expects it to stay that way.', effect: '-10% minimum wage' },
  { id: 'ambitious', name: 'Ambitious', description: 'Levels up faster but expects fair pay sooner.', effect: '+30% XP, raises sooner' },
  { id: 'lazy', name: 'Laid Back', description: 'Takes things slow. Less productive but content.', effect: '-15% XP, +10 morale' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Does exceptional work when happy.', effect: 'Skill scales with morale' },
  { id: 'social', name: 'Social Butterfly', description: 'Lifts the spirits of everyone around.', effect: '+2 morale to nearby staff' },
  { id: 'night-owl', name: 'Night Owl', description: 'Prefers evening shifts and late showtimes.', effect: '+10% effectiveness after 6pm' },
];

// ============ Candidate Generation ============
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCandidate(role: StaffRole): StaffCandidate {
  const template = staffTemplates.find(t => t.role === role)!;
  const trait = pickRandom(staffTraits);

  // Randomize experience: 0-80, weighted toward lower values
  const rawXp = Math.floor(Math.pow(Math.random(), 1.5) * 80);
  const level = getStaffLevel(rawXp);

  // Skill varies based on experience + randomness
  const baseSkill = template.startingSkill + (rawXp * 0.4);
  const skillVariation = (Math.random() - 0.5) * 15;
  let skill = Math.max(5, Math.min(template.maxSkill, Math.floor(baseSkill + skillVariation)));

  // Trait adjustments to skill
  if (trait.id === 'veteran') skill = Math.min(template.maxSkill, Math.floor(skill * 1.3));

  // Minimum wage varies by level and trait
  let minimumWage = getFairWage(template.baseWage, level);
  if (trait.id === 'cheapskate') minimumWage = Math.floor(minimumWage * 0.9);
  if (trait.id === 'ambitious') minimumWage = Math.floor(minimumWage * 1.05);

  // Starting morale varies
  let morale = 55 + Math.floor(Math.random() * 25);
  if (trait.id === 'grumpy') morale -= 5;
  if (trait.id === 'lazy') morale += 10;
  morale = Math.max(30, Math.min(90, morale));

  return {
    id: `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: pickRandom(staffNames),
    role,
    skill,
    level,
    experience: rawXp,
    minimumWage,
    morale,
    trait: trait.id,
    traitDescription: `${trait.name}: ${trait.description}`,
  };
}

export function generateHiringPool(): StaffCandidate[] {
  const pool: StaffCandidate[] = [];
  const roles: StaffRole[] = ['cashier', 'usher', 'projectionist', 'janitor', 'concessions', 'manager'];

  // 2 candidates per role = 12 total
  for (const role of roles) {
    pool.push(generateCandidate(role));
    pool.push(generateCandidate(role));
  }

  return pool;
}
