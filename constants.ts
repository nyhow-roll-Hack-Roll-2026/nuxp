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
    iconName: '/icons/pixels/map-pin.svg',
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
    iconName: '/icons/pixels/book-open.svg',
    type: AchievementType.TASK,
    category: Category.ACADEMIC,
    globalCompletionRate: 95,
    xp: 10
  },
  {
    id: 'first_tutorial',
    parentId: 'nus_start',
    title: 'First Building Block',
    description: 'Attend your first tutorial and learn the basics.',
    lore: 'A small step towards mastery.',
    iconName: '/icons/pixels/book-open.svg',
    type: AchievementType.TASK,
    category: Category.ACADEMIC,
    globalCompletionRate: 95,
    xp: 10
  },
  {
    id: 'library_scholar',
    parentId: 'nus_start',
    title: 'Unlock Hidden Wisdom',
    description: 'Study in any school library.',
    lore: 'Knowledge is power.',
    iconName: '/icons/pixels/book-open.svg',
    type: AchievementType.TASK,
    category: Category.ACADEMIC,
    globalCompletionRate: 95,
    xp: 10
  },
  {
    id: 'first_exam',
    parentId: 'nus_start',
    title: 'First Trial By Fire',
    description: 'Take your first exam and excel in your course.',
    lore: 'Survivability was not guaranteed.',
    iconName: '/icons/pixels/book-open.svg',
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
        parentId: 'library_scholar',
        title: 'Enchanting Table',
        description: 'Complete a continuous 10-hour study session in the Central Library.',
        lore: 'Buff applied: "Focused". Stamina draining rapidly.',
        iconName: '/icons/pixels/zap.svg',
    type: AchievementType.GOAL,
    category: Category.ACADEMIC,
    globalCompletionRate: 15,
    xp: 50
  },
  {
    id: 'seminar_sage',
    parentId: 'first_lecture',
    title: 'Seminar Sage',
    description: 'Present at a seminar.',
    lore: 'Sharing knowledge is the key to growth.',
    iconName: '/icons/pixels/book-open.svg',
    type: AchievementType.GOAL,
    category: Category.ACADEMIC,
    globalCompletionRate: 15,
    xp: 50
  },
  {
    id: 'Competition_Challenger',
    parentId: 'first_lecture',
    title: 'Competition Challenger',
    description: 'Participate in an academic competition.',
    lore: 'The thrill of competition sharpens the mind.',
    iconName: '/icons/pixels/book-open.svg',
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
        iconName: '/icons/pixels/crown.svg',
    type: AchievementType.CHALLENGE,
    category: Category.ACADEMIC,
    globalCompletionRate: 5,
    xp: 100
  },
  {
    id: 'Mentor_Master',
    parentId: 'Competition_Challenger',
    title: 'Mentor Master',
    description: 'Mentor a Junior Student.',
    lore: 'Guiding others is the path to mastery.',
    iconName: '/icons/pixels/crown.svg',
        type: AchievementType.CHALLENGE,
        category: Category.ACADEMIC,
        globalCompletionRate: 10,
        xp: 50,
        resources: [
            { label: 'Mentorship Guide', url: '#', type: 'LINK' }
        ],
        guestbook: [
            { username: 'MentorGuru', date: '1d ago', message: 'Pay it forward!', avatarSeed: 'Eve' }
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
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 98,
    xp: 10
  },
  {
    id: 'museum_visit',
    parentId: 'nus_start',
    title: 'Ancient Wanderer',
    description: 'Visit NUS Museum for the first time.',
    lore: 'Artifacts of a bygone era. Look but don\'t touch.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 98,
    xp: 10
  },
  {
    id: 'gym_visit',
    parentId: 'nus_start',
    title: 'Bulk Bro',
    description: 'Visit any NUS gym for the first time.',
    lore: 'Strength stat increased. Soreness status effect active.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 50,
    xp: 10
  },
  {
    id: 'pool_visit',
    parentId: 'nus_start',
    title: 'Aquatic Adventurer',
    description: 'Visit any NUS pool for the first time.',
    lore: 'Swimming skill +1. Don\'t forget to breathe.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 50,
    xp: 10
  },
  {
    id: 'club_event',
    parentId: 'nus_start',
    title: 'Club Explorer',
    description: 'Join any student-led club event for the first time.',
    lore: 'Social stats boosting... or social battery draining.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 75,
    xp: 10
  },
  {
    id: 'pgp_mala',
    parentId: 'nus_start',
    title: 'Testing Tastebuds',
    description: 'Try PGP Mala for the first time.',
    lore: 'Spiciness Level: Critical. Tongue numbness imminent.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.TASK,
    category: Category.EXPLORATION,
    globalCompletionRate: 90,
    xp: 10
  },
  {
    id: 'chick_visit',
    parentId: 'utown_visit',
    title: 'Animal Whisperer',
    description: 'Take a photo of the chickens in NUS',
    lore: 'They are the true owners of the campus.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.GOAL,
    category: Category.EXPLORATION,
    globalCompletionRate: 90,
    xp: 50
  },
  {
    id: 'merch_collector',
    parentId: 'utown_visit',
    title: 'Merch Collector',
    description: 'Collect 3 different NUS tshirts.',
    lore: 'Inventory space decreasing. Pride increasing.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.GOAL,
    category: Category.EXPLORATION,
    globalCompletionRate: 30,
    xp: 50
  },
  {
    id: 'watch_performance',
    parentId: 'museum_visit',
    title: 'Captivated Audience',
    description: 'Watch an arts performance in NUS.',
    lore: 'Culture stats updated.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.GOAL,
    category: Category.EXPLORATION,
    globalCompletionRate: 15,
    xp: 50
  },
  {
    id: 'tour_guide',
    parentId: 'merch_collector',
    title: 'Guide of Realms',
    description: 'Give a campus tour to students or visitors.',
    lore: 'Map data shared with allied players.',
    iconName: '/icons/pixels/castle.svg',
    type: AchievementType.CHALLENGE,
    category: Category.EXPLORATION,
    globalCompletionRate: 5,
    xp: 100
  },
  {
    id: 'all_faculties',
    parentId: 'utown_visit',
    title: 'Biomes O\' Plenty',
    description: 'Visit every single faculty campus biome (FASS, FOE, SOC, Science, etc.).',
    lore: 'Biome exploration 100% complete.',
    iconName: '/icons/pixels/compass.svg',
    type: AchievementType.GOAL,
    category: Category.EXPLORATION,
    globalCompletionRate: 30,
    xp: 50
  },
  {
    id: 'bus_master',
    parentId: 'all_faculties',
    title: 'Minecart Master',
    description: 'Take every internal shuttle bus route (A1, A2, D1, D2, K, E, BTC) at least once.',
    lore: 'Route memorization complete. Punctuality +10.',
    iconName: '/icons/pixels/train-front.svg',
    type: AchievementType.GOAL,
    category: Category.EXPLORATION,
    globalCompletionRate: 12,
    xp: 50
  },
  {
    id: 'marathon',
    parentId: 'bus_master',
    title: 'Speedrunner',
    description: 'Run a full marathon distance accumulatively around the school server.',
    lore: 'Endurance stat maxed.',
    iconName: '/icons/pixels/footprints.svg',
    type: AchievementType.CHALLENGE,
    category: Category.EXPLORATION,
    globalCompletionRate: 2,
    xp: 100
  },

  // --- SOCIAL BRANCH ---
  {
    id: 'orientation',
    parentId: 'nus_start',
    title: 'Spawn Point Party',
    description: 'Participate in a freshman orientation camp.',
    lore: 'Party formed. Social links established. Cringe tolerance increased.',
    iconName: '/icons/pixels/tent.svg',
    type: AchievementType.TASK,
    category: Category.SOCIAL,
    globalCompletionRate: 80,
    xp: 10
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
    },
    // Co-op Achievement
    {
        id: 'pair_programming',
        parentId: 'cc_activity',
        title: 'Pair Programming',
        description: 'Complete a coding assignment or hackathon with a partner. Both players must accept the invite.',
        lore: 'Two heads are better than one. Bugs fear the duo.',
        iconName: 'GitMerge',
        type: AchievementType.COOP,
        category: Category.SOCIAL,
        globalCompletionRate: 8,
        xp: 100,
        resources: [
            { label: 'NUS Hackers', url: 'https://nushackers.org', type: 'LINK' },
            { label: 'Hackathon Calendar', url: '#', type: 'LINK' }
        ],
        guestbook: [
            { username: 'CodeBuddy', date: '1w ago', message: 'Found my hackathon partner here!', avatarSeed: 'Ivan' }
        ]
    },
  {
    id: 'class_friend',
    parentId: 'orientation',
    title: 'Party of Two',
    description: 'Make a friend in your class.',
    lore: 'Party invitation accepted.',
    iconName: '/icons/pixels/tent.svg',
    type: AchievementType.GOAL,
    category: Category.SOCIAL,
    globalCompletionRate: 80,
    xp: 50
  },
  {
    id: 'cross_faculty_friend',
    parentId: 'class_friend',
    title: 'Befriender of Different Realms',
    description: 'Make a friend from a different faculty.',
    lore: 'Inter-server communication established.',
    iconName: '/icons/pixels/tent.svg',
    type: AchievementType.CHALLENGE,
    category: Category.SOCIAL,
    globalCompletionRate: 40,
    xp: 100
  },
  {
    id: 'canteen',
    parentId: 'nus_start',
    title: 'Conqueror of Lands',
    description: 'Try out your faculty\'s canteen.',
    lore: 'Consumables acquired.',
    iconName: '/icons/pixels/tent.svg',
    type: AchievementType.TASK,
    category: Category.SOCIAL,
    globalCompletionRate: 95,
    xp: 10
  },
  {
    id: 'cc_activity',
    parentId: 'orientation',
    title: 'Joined a Faction',
    description: 'Join a CCA, Student Club, or Guild.',
    lore: 'Faction allegiance pledged.',
    iconName: '/icons/pixels/shield.svg',
    type: AchievementType.GOAL,
    category: Category.SOCIAL,
    globalCompletionRate: 60,
    xp: 50
  },
  {
    id: 'campus_event',
    parentId: 'cross_faculty_friend',
    title: 'Village Festival',
    description: 'Participate in a campus-wide event (e.g., Rag & Flag, Supernova, Career Fair).',
    lore: 'Temporary event active: "Festivities". EXP boost enabled.',
    iconName: '/icons/pixels/ticket.svg',
    type: AchievementType.GOAL,
    category: Category.SOCIAL,
    globalCompletionRate: 40,
    xp: 50
  },
  {
    id: 'networker',
    parentId: 'campus_event',
    title: 'Diplomat of Realms',
    description: 'Make friends with at least one villager from every faculty biome.',
    lore: 'Ambassador status achieved among the faculty tribes.',
    iconName: '/icons/pixels/users.svg',
    type: AchievementType.CHALLENGE,
    category: Category.SOCIAL,
    globalCompletionRate: 1,
    xp: 100
  },
  {
    id: 'IFG',
    parentId: 'campus_event',
    title: 'Festival Veteran',
    description: 'Represent your faculty in IFG.',
    lore: 'Athletics check passed. Glory to the faculty!',
    iconName: '/icons/pixels/tent.svg',
    type: AchievementType.CHALLENGE,
    category: Category.SOCIAL,
    globalCompletionRate: 5,
    xp: 100
  }
];

// Explicitly adding missing 'lore' property to each Achievement object
ACHIEVEMENTS.forEach((achievement, index) => {
    if (!achievement.lore) {
        ACHIEVEMENTS[index] = {
            ...achievement,
            lore: 'Default lore text.' // Explicitly added
        };
    }
});