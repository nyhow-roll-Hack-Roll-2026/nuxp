import { Achievement, AchievementType, Category } from './types';

export const AVATARS = [
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Steve",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Alex",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=Creeper",
    "https://api.dicebear.com/9.x/pixel-art/png?seed=NUS",
];

export const ACHIEVEMENTS: Achievement[] = [
  // --- ROOT ---
  {
    id: 'nus_start',
    title: 'New World Created',
    description: 'Matriculate into the National University of Singapore.',
    iconName: 'MapPin',
    type: AchievementType.ROOT,
    category: Category.GENERAL,
    globalCompletionRate: 100,
    xp: 0
  },

  // --- ACADEMIC BRANCH ---
  {
    id: 'first_lecture',
    parentId: 'nus_start',
    title: 'First Crafting Recipe',
    description: 'Attend your first lecture and learn the basics.',
    iconName: 'BookOpen',
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
    iconName: 'BookOpen',
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
    iconName: 'BookOpen',
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
    iconName: 'BookOpen',
    type: AchievementType.TASK,
    category: Category.ACADEMIC,
    globalCompletionRate: 95,
    xp: 10
  },
  {
    id: 'study_session',
    parentId: 'library_scholar',
    title: 'Enchanting Table',
    description: 'Complete a continuous 10-hour study session in the Central Library.',
    iconName: 'Zap',
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
    iconName: 'BookOpen',
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
    iconName: 'BookOpen',
    type: AchievementType.GOAL,
    category: Category.ACADEMIC,
    globalCompletionRate: 15,
    xp: 50
  },
  {
    id: 'deans_list',
    parentId: 'study_session',
    title: 'Hero of the Village',
    description: 'Get on the Dean\'s List for a semester.',
    iconName: 'Crown',
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
    iconName: 'Crown',
    type: AchievementType.CHALLENGE,
    category: Category.ACADEMIC,
    globalCompletionRate: 5,
    xp: 100
  },

  // --- EXPLORATION BRANCH ---
  {
    id: 'utown_visit',
    parentId: 'nus_start',
    title: 'Discover Stronghold',
    description: 'Visit University Town (UTown) for the first time.',
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Castle',
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
    iconName: 'Compass',
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
    iconName: 'TrainFront',
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
    iconName: 'Footprints',
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
    iconName: 'Tent',
    type: AchievementType.TASK,
    category: Category.SOCIAL,
    globalCompletionRate: 80,
    xp: 10
  },
  {
    id: 'class_friend',
    parentId: 'orientation',
    title: 'Party of Two',
    description: 'Make a friend in your class.',
    iconName: 'Tent',
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
    iconName: 'Tent',
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
    iconName: 'Tent',
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
    iconName: 'Shield',
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
    iconName: 'Ticket',
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
    iconName: 'Users',
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
    iconName: 'Tent',
    type: AchievementType.CHALLENGE,
    category: Category.SOCIAL,
    globalCompletionRate: 5,
    xp: 100
  }
];