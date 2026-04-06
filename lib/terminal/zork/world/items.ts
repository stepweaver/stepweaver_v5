export interface ItemDef {
  id: string;
  name: string;
  description: string;
  readText?: string;
  takeable?: boolean;
  openable?: boolean;
  container?: boolean;
  lightSource?: boolean;
  moveable?: boolean;
  weapon?: boolean;
  /** Items that start inside this container (container must be in world with matching id). */
  initialContents?: string[];
  /** Revealed in room when a moveable is moved (e.g. rug → trap door). */
  under?: string[];
}

const defs: Record<string, Omit<ItemDef, 'id'> & { id?: string }> = {
  mailbox: {
    name: 'small mailbox',
    description: 'The mailbox is closed.',
    takeable: false,
    openable: true,
    initialContents: ['leaflet'],
  },
  leaflet: {
    name: 'leaflet',
    description: 'A small leaflet.',
    readText:
      'WELCOME TO A CLASSIC CAVE CRAWL\n\nThis is a browser-native work of interactive fiction: exploration, light puzzles, and a little danger. Good luck, adventurer.',
    takeable: true,
  },
  lamp: {
    name: 'brass lantern',
    description: 'A battery-powered brass lantern.',
    takeable: true,
    lightSource: true,
  },
  rug: {
    name: 'large oriental rug',
    description: 'A large rug covers the center of the floor.',
    takeable: false,
    moveable: true,
    under: ['trap-door'],
  },
  'trophy-case': {
    name: 'trophy case',
    description: 'A handsome trophy case. It is empty.',
    takeable: false,
  },
  sack: {
    name: 'brown sack',
    description: 'A brown sack, smelling faintly of hot peppers.',
    takeable: true,
    container: true,
    openable: true,
    initialContents: ['lunch', 'garlic'],
  },
  lunch: {
    name: 'lunch',
    description: 'A well-packed lunch.',
    takeable: true,
  },
  garlic: {
    name: 'clove of garlic',
    description: 'A pungent clove of garlic.',
    takeable: true,
  },
  water: {
    name: 'bottle of water',
    description: 'A bottle of clear water.',
    takeable: true,
  },
  rope: {
    name: 'rope',
    description: 'A large coil of rope.',
    takeable: true,
  },
  knife: {
    name: 'nasty knife',
    description: 'A nasty-looking knife.',
    takeable: true,
    weapon: true,
  },
  leaves: {
    name: 'pile of leaves',
    description: 'There is a pile of leaves on the ground.',
    takeable: false,
    moveable: true,
    under: ['grating'],
  },
  grating: {
    name: 'grating',
    description: 'A metal grating, flush with the ground.',
    takeable: false,
    openable: true,
  },
  window: {
    name: 'kitchen window',
    description: 'The window is slightly ajar, but not enough to slip through.',
    takeable: false,
    openable: true,
  },
  'trap-door': {
    name: 'trap door',
    description: 'A wooden door is set flush with the floor.',
    takeable: false,
    openable: true,
  },
};

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  Object.entries(defs).map(([id, d]) => [id, { ...d, id } as ItemDef])
) as Record<string, ItemDef>;
