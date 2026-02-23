import type { StaffTemplate } from '../types';

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
];
