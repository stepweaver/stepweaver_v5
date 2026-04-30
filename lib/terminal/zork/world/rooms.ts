import type { Direction } from '../direction';

export interface RoomDef {
  id: string;
  name: string;
  description: string;
  dark?: boolean;
  exits: Partial<Record<Direction, string>>;
  initialItems: string[];
}

const defs: Record<string, Omit<RoomDef, 'id'> & { id?: string }> = {
  'west-of-house': {
    name: 'West of House',
    description:
      'You stand in an open field west of a white house, with a boarded front door.',
    exits: {
      north: 'north-of-house',
      south: 'south-of-house',
      east: 'behind-house',
      west: 'forest',
    },
    initialItems: ['mailbox'],
  },
  'north-of-house': {
    name: 'North of House',
    description:
      'You are north of a white house. There is no door here, and the windows are boarded. A narrow path leads north into the trees.',
    exits: {
      south: 'west-of-house',
      east: 'behind-house',
      west: 'forest',
      north: 'forest-path',
    },
    initialItems: [],
  },
  'behind-house': {
    name: 'Behind House',
    description:
      'You are behind the white house. A path leads east into the forest. In one corner, a small window sits slightly ajar.',
    exits: {
      west: 'north-of-house',
      south: 'south-of-house',
      east: 'forest',
      north: 'north-of-house',
    },
    initialItems: ['window'],
  },
  'south-of-house': {
    name: 'South of House',
    description:
      'You face the south side of a white house. There is no door, and the windows are boarded.',
    exits: {
      north: 'west-of-house',
      east: 'behind-house',
      west: 'forest',
    },
    initialItems: [],
  },
  forest: {
    name: 'Forest',
    description:
      'Dense trees close in on every side. To the east, the forest seems a little brighter.',
    exits: {
      east: 'west-of-house',
      north: 'forest',
      south: 'forest',
      west: 'forest',
    },
    initialItems: [],
  },
  'forest-path': {
    name: 'Forest Path',
    description:
      'A path winds through dim woods. It runs north and south here. A large tree with low branches stands beside the trail.',
    exits: {
      north: 'clearing',
      south: 'north-of-house',
    },
    initialItems: [],
  },
  clearing: {
    name: 'Clearing',
    description: 'A quiet clearing. Forest presses in on all sides. A path leads south.',
    exits: {
      south: 'forest-path',
      east: 'canyon-view',
    },
    initialItems: ['leaves'],
  },
  'canyon-view': {
    name: 'Canyon View',
    description:
      'You are on a ledge overlooking a steep canyon. The view is impressive, but the drop is uninviting. A path leads back west into the woods.',
    exits: {
      west: 'clearing',
    },
    initialItems: [],
  },
  'living-room': {
    name: 'Living Room',
    description:
      'A cozy living room. A doorway opens east, a wooden door to the west bears odd lettering and looks nailed shut, and a trophy case stands against the wall. A large rug lies in the center of the floor.',
    exits: {
      east: 'kitchen',
      up: 'attic',
    },
    initialItems: ['rug', 'trophy-case', 'lamp'],
  },
  kitchen: {
    name: 'Kitchen',
    description:
      'A kitchen, recently used. A passage leads west, and a dark staircase descends. A chimney climbs upward, and a small window to the north is open.',
    exits: {
      west: 'living-room',
      down: 'cellar',
    },
    initialItems: ['sack', 'water'],
  },
  attic: {
    name: 'Attic',
    description: 'A cramped attic. The only exit is a stairway leading down.',
    exits: {
      down: 'living-room',
    },
    initialItems: ['rope', 'knife'],
  },
  cellar: {
    name: 'Cellar',
    description:
      'You are in a damp cellar. A narrow passage leads north, a low crawlway south, and a steep metal ramp rises west, too smooth to climb.',
    dark: true,
    exits: {
      north: 'north-south-passage',
      south: 'crawlway',
      up: 'kitchen',
    },
    initialItems: [],
  },
  'north-south-passage': {
    name: 'North-South Passage',
    description: 'A long passage running north and south. Rough stairs climb southward.',
    dark: true,
    exits: {
      north: 'chasm',
      south: 'cellar',
    },
    initialItems: [],
  },
  chasm: {
    name: 'Chasm',
    description:
      'A deep chasm cuts southwest to northeast. The trail hugs the south rim; a crack in the wall opens into a passage.',
    dark: true,
    exits: {
      south: 'north-south-passage',
      northeast: 'reservoir-south',
      southwest: 'east-west-passage',
    },
    initialItems: [],
  },
  'reservoir-south': {
    name: 'Mist Reservoir',
    description:
      'A cold mist hangs over a dark underground reservoir. Water laps softly against stone. A narrow ledge continues along the rim, and a smaller passage breaks away into the rock.',
    dark: true,
    exits: {
      southwest: 'chasm',
      east: 'east-west-passage',
    },
    initialItems: [],
  },
  'east-west-passage': {
    name: 'Echo Gallery',
    description:
      'A worked stone corridor that carries every footstep forward and back again. The air tastes of metal and wet limestone.',
    dark: true,
    exits: {
      northeast: 'chasm',
      west: 'survey-niche',
      east: 'reservoir-south',
    },
    initialItems: [],
  },
  crawlway: {
    name: 'Low Crawlway',
    description:
      'A tight crawlway of damp stone, just wide enough to squeeze through without scraping yourself raw. You can stand again to the north.',
    dark: true,
    exits: {
      north: 'cellar',
    },
    initialItems: [],
  },
  'survey-niche': {
    name: 'Survey Niche',
    description:
      'A small niche has been hacked into the wall, as if someone once worked here by lamplight. Old chalk marks crisscross the stone. A heap of debris slumps in one corner.',
    dark: true,
    exits: {
      east: 'east-west-passage',
    },
    initialItems: ['debris'],
  },
};

export const ROOMS: Record<string, RoomDef> = Object.fromEntries(
  Object.entries(defs).map(([id, r]) => [id, { ...r, id } as RoomDef])
) as Record<string, RoomDef>;
