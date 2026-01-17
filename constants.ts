import { Achievement, AchievementType, Category, Trophy } from './types';

export const AVATARS = [
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Steve",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Alex",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Creeper",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=NUS",
];

// Color Palette shared with Dashboard and Icons
export const CATEGORY_COLORS = {
    [Category.GENERAL]: '#10b981', // Emerald Green
    [Category.ACADEMIC]: '#3b82f6', // Blue
    [Category.SOCIAL]: '#8b5cf6',   // Violet/Purple
    [Category.EXPLORATION]: '#f59e0b' // Amber/Orange
};

export const TIPS = [
    "Tip: Use the internal shuttle buses to conserve hunger points.",
    "Tip: Sleeping resets the phantom timer. Don't pull too many all-nighters.",
    "Tip: The bell curve boss scales with the player level.",
    "Tip: 'Choping' seats requires a packet of tissue paper.",
    "Tip: Submit assignments before 23:59 to avoid the 'Late Penalty' debuff.",
    "Tip: Coffee provides a temporary speed boost but reduces accuracy over time.",
    "Tip: Group projects roll for random party members. Good luck.",
    "Tip: The Deck serves the best potions (fruit juices).",
    "Tip: Avoid 8am lectures if your Stamina recovery is low.",
    "Tip: Printing requires credits. Farm them wisely."
];

export const TROPHIES: Trophy[] = [
    {
        id: 'trophy_starter',
        title: 'New Beginnings',
        description: 'Unlock your first 3 achievements.',
        iconName: 'Sprout',
        color: '#A3E635', // Lime
    },
    {
        id: 'trophy_67',
        title: 'The 67th',
        description: 'Prove your dedication by completing 67 tasks.',
        iconName: 'Trophy',
        color: '#D4AF37', // Gold
    },
    {
        id: 'trophy_academic',
        title: 'Grand Magus',
        description: 'Unlock all Academic achievements.',
        iconName: 'GraduationCap',
        color: '#3b82f6', // Blue
    },
    {
        id: 'trophy_explorer',
        title: 'Cartographer',
        description: 'Unlock all Exploration achievements.',
        iconName: 'Map',
        color: '#f59e0b', // Orange
    },
    {
        id: 'trophy_social',
        title: 'Town Mayor',
        description: 'Unlock all Social achievements.',
        iconName: 'Users',
        color: '#8b5cf6', // Purple
    },
    {
        id: 'trophy_completionist',
        title: 'The End?',
        description: 'Unlock 100% of all current achievements.',
        iconName: 'Crown',
        color: '#ef4444', // Red/Netherite
    }
];

export const ACHIEVEMENTS: Achievement[] = [
  // --- ROOT ---
  {
    id: 'nus_start',
    title: 'New World Created',
    description: 'Matriculate into the National University of Singapore.',
    lore: 'Welcome to the server. The difficulty is locked to Hardcore Mode.',
    iconName: 'MapPin',
    type: AchievementType.ROOT,
    category: Category.GENERAL,
    globalCompletionRate: 100,
    xp: 0,
    resources: [
        { label: 'NUSMods (Schedule Builder)', url: 'https://nusmods.com', type: 'LINK' },
        { label: 'Campus Map PDF', url: 'https://map.nus.edu.sg/assets/campusmap/pdf/campus_map_full_version.pdf', type: 'PDF' }
    ],
    guestbook: [
        { username: 'Admin', date: '2024-01-01', message: 'Welcome to the game.', avatarSeed: 'Admin' }
    ]
  },

  // ==========================================
  // ACADEMIC BRANCH (Blue)
  // ==========================================
  {
    id: 'first_lecture',
    parentId: 'nus_start',
    title: 'First Crafting Recipe',
    description: 'Attend your first lecture and learn the basics.',
    lore: 'Knowledge acquired. Retention rate: Approximately 50%.',
    iconName: 'BookOpen',
    type: AchievementType.TASK,
    category: Category.ACADEMIC,
    globalCompletionRate: 95,
    xp: 10,
    resources: [
        { label: 'LumiNUS Portal', url: 'https://luminus.nus.edu.sg', type: 'LINK' },
        { label: 'Productivity Hacks Wiki', url: '#', type: 'LINK' }
    ],
    guestbook: [
        { username: 'StudyGirl99', date: '2d ago', message: 'CS1101S is pain.', avatarSeed: 'Alice' },
        { username: 'Mark_Z', date: '5d ago', message: 'Where is LT17??', avatarSeed: 'Bob' }
    ]
  },
    // Sub-branch: Grinding/Studying
    {
        id: 'study_session',
        parentId: 'first_lecture',
        title: 'Enchanting Table',
        description: 'Complete a continuous 10-hour study session in the Central Library.',
        lore: 'Buff applied: "Focused". Stamina draining rapidly.',
        iconName: 'Zap',
        type: AchievementType.GOAL,
        category: Category.ACADEMIC,
        globalCompletionRate: 15,
        xp: 50,
        resources: [
            { label: 'Library Crowd Level Bot', url: '#', type: 'TELEGRAM' },
            { label: 'Lo-Fi Study Playlist', url: '#', type: 'LINK' }
        ],
        guestbook: [
            { username: 'BookWorm', date: '1d ago', message: 'Level 6 is freezing.', avatarSeed: 'Cathy' }
        ]
    },
    {
        id: 'all_nighter',
        parentId: 'study_session',
        title: 'Phantom Slayer',
        description: 'Stay overnight at a study cluster or library during reading week.',
        lore: 'You can sleep when you\'re dead. Or after graduation.',
        iconName: 'Moon',
        type: AchievementType.CHALLENGE,
        category: Category.ACADEMIC,
        globalCompletionRate: 8,
        xp: 80,
        guestbook: [
            { username: 'ZombieMode', date: '3d ago', message: 'The sunrise at UTown is worth it.', avatarSeed: 'Dave' }
        ]
    },
    // Sub-branch: Exams/Results
    {
        id: 'first_exam',
        parentId: 'first_lecture',
        title: 'Boss Battle',
        description: 'Sit for your first physical final examination hall paper.',
        lore: 'A wild Final Paper appeared! It used Confusion. It\'s super effective!',
        iconName: 'PenTool',
        type: AchievementType.TASK,
        category: Category.ACADEMIC,
        globalCompletionRate: 90,
        xp: 20,
        resources: [
            { label: 'Past Year Papers Repo', url: '#', type: 'LINK' },
            { label: 'Exam Venue Map', url: '#', type: 'PDF' }
        ]
    },
    {
        id: 'deans_list',
        parentId: 'first_exam',
        title: 'Hero of the Village',
        description: 'Get on the Dean\'s List for a semester.',
        lore: 'Achievement unlocked: Galaxy Brain. Loot quality increased.',
        iconName: 'Crown',
        type: AchievementType.CHALLENGE,
        category: Category.ACADEMIC,
        globalCompletionRate: 5,
        xp: 150,
        resources: [
            { label: 'SEP Application Guide', url: '#', type: 'PDF' },
            { label: 'Scholarship Listings', url: '#', type: 'LINK' }
        ],
        guestbook: [
            { username: 'TopG', date: '1w ago', message: 'S/U strategy is key guys.', avatarSeed: 'Eve' },
            { username: 'Hermione', date: '2w ago', message: 'Ez game.', avatarSeed: 'Fred' }
        ]
    },

  // ==========================================
  // EXPLORATION BRANCH (Orange)
  // ==========================================
  {
    id: 'utown_visit',
    parentId: 'nus_start',
    title: 'Discover Stronghold',
    description: 'Visit University Town (UTown) for the first time.',
    lore: 'New region discovered: The land of infinite Starbucks and grass.',
    iconName: 'Castle',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 98,
    xp: 10,
    resources: [
        { label: 'UTown Food Directory', url: '#', type: 'LINK' }
    ]
  },
    // Sub-branch: Transport
    {
        id: 'bus_master',
        parentId: 'utown_visit',
        title: 'Minecart Master',
        description: 'Take every internal shuttle bus route (A1, A2, D1, D2, K, E, BTC) at least once.',
        lore: 'Fast travel network synchronised. Please move to the rear.',
        iconName: 'TrainFront',
        type: AchievementType.GOAL,
        category: Category.EXPLORATION,
        globalCompletionRate: 12,
        xp: 75,
        resources: [
            { label: 'Real-time Bus Telegram Bot', url: '#', type: 'TELEGRAM' },
            { label: 'The "Walking Shortcut" Map', url: '#', type: 'PDF' }
        ],
        guestbook: [
            { username: 'BusUncle', date: '4d ago', message: 'D1 is always crowded.', avatarSeed: 'George' }
        ]
    },
    {
        id: 'marathon',
        parentId: 'bus_master',
        title: 'Speedrunner',
        description: 'Run a full marathon distance accumulatively around the school server.',
        lore: 'Agility stat maxed. The map is your playground.',
        iconName: 'Footprints',
        type: AchievementType.CHALLENGE,
        category: Category.EXPLORATION,
        globalCompletionRate: 2,
        xp: 150
    },
    // Sub-branch: Locations/Food
    {
        id: 'canteen_hopper',
        parentId: 'utown_visit',
        title: 'Food Source',
        description: 'Eat at The Deck, The Frontier, and Fine Food in the same week.',
        lore: 'Culinary exploration complete. Health fully restored.',
        iconName: 'Utensils',
        type: AchievementType.TASK,
        category: Category.EXPLORATION,
        globalCompletionRate: 40,
        xp: 30,
        resources: [
            { label: 'Foodie Review Group', url: '#', type: 'TELEGRAM' }
        ]
    },
    {
        id: 'all_faculties',
        parentId: 'canteen_hopper',
        title: 'Biomes O\' Plenty',
        description: 'Visit every single faculty campus biome (FASS, FOE, SOC, Science, Music, Law).',
        lore: 'World map 100% explored. You have touched grass everywhere.',
        iconName: 'Compass',
        type: AchievementType.GOAL,
        category: Category.EXPLORATION,
        globalCompletionRate: 30,
        xp: 100
    },

  // ==========================================
  // SOCIAL BRANCH (Purple)
  // ==========================================
  {
    id: 'orientation',
    parentId: 'nus_start',
    title: 'Spawn Point Party',
    description: 'Participate in a freshman orientation camp.',
    lore: 'Party formed. Social links established. Cringe tolerance increased.',
    iconName: 'Tent',
    type: AchievementType.TASK,
    category: Category.SOCIAL,
    globalCompletionRate: 80,
    xp: 20,
    resources: [
        { label: 'Freshman Guide PDF', url: '#', type: 'PDF' }
    ]
  },
    // Sub-branch: Night Life
    {
        id: 'supper_jio',
        parentId: 'orientation',
        title: 'Potion Brewing',
        description: 'Go for supper at Al Amaan or Super Snacks after midnight.',
        lore: 'Night raid successful. Calorie intake critical. Worth it.',
        iconName: 'Coffee',
        type: AchievementType.TASK,
        category: Category.SOCIAL,
        globalCompletionRate: 65,
        xp: 25,
        resources: [
            { label: 'Late Night Food Map', url: '#', type: 'LINK' }
        ]
    },
    {
        id: 'hall_stay',
        parentId: 'supper_jio',
        title: 'Base Builder',
        description: 'Stay on campus (Hall, RC, or Residence) for at least one semester.',
        lore: 'Respawn point set. Commute time reduced to zero.',
        iconName: 'Home',
        type: AchievementType.GOAL,
        category: Category.SOCIAL,
        globalCompletionRate: 35,
        xp: 60,
        resources: [
            { label: 'Room Decor Inspo', url: '#', type: 'LINK' }
        ]
    },
    // Sub-branch: CCAs
    {
        id: 'cc_activity',
        parentId: 'orientation',
        title: 'Joined a Faction',
        description: 'Join a CCA, Student Club, or Guild.',
        lore: 'Faction allegiance pledged. Reputation increasing.',
        iconName: 'Shield',
        type: AchievementType.TASK,
        category: Category.SOCIAL,
        globalCompletionRate: 60,
        xp: 30,
        resources: [
            { label: 'CCA Directory', url: '#', type: 'LINK' }
        ]
    },
    {
        id: 'exco_member',
        parentId: 'cc_activity',
        title: 'Guild Master',
        description: 'Become an EXCO member or leader of a student organization.',
        lore: 'Rank up! Admin privileges granted. Stress +50.',
        iconName: 'Swords',
        type: AchievementType.CHALLENGE,
        category: Category.SOCIAL,
        globalCompletionRate: 15,
        xp: 120,
        guestbook: [
            { username: 'Prez_2024', date: '3mos ago', message: 'Worth the CV boost.', avatarSeed: 'Harry' }
        ]
    },
    {
        id: 'networker',
        parentId: 'cc_activity',
        title: 'Diplomat of Realms',
        description: 'Make friends with at least one villager from every faculty biome.',
        lore: 'Charisma check passed. You know a guy who knows a guy.',
        iconName: 'Users',
        type: AchievementType.CHALLENGE,
        category: Category.SOCIAL,
        globalCompletionRate: 1,
        xp: 200
    }
];