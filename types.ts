export enum AchievementType {
  ROOT = 'ROOT',
  TASK = 'TASK',
  GOAL = 'GOAL',
  CHALLENGE = 'CHALLENGE'
}

export enum Category {
  GENERAL = 'General',
  ACADEMIC = 'Academic',
  SOCIAL = 'Social',
  EXPLORATION = 'Exploration'
}

export interface AchievementResource {
  label: string;
  url: string;
  type: 'LINK' | 'PDF' | 'TELEGRAM';
}

export interface GuestbookEntry {
  username: string;
  date: string;
  message: string;
  avatarSeed?: string; // For visual variety
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  lore: string; // Gamified flavor text
  iconName: string; // Mapping to Lucide icon name
  parentId?: string; // For tree structure
  type: AchievementType;
  category: Category;
  globalCompletionRate: number; // Percentage 0-100
  xp: number;
  resources?: AchievementResource[]; // Unlockable real-world utility
  guestbook?: GuestbookEntry[]; // Social legacy
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string; // Hex for the glow/icon
  condition?: (progress: UserProgress, achievements: Achievement[]) => boolean;
}

export interface AchievementProof {
  text?: string;
  media?: string; // Base64
  mediaType?: 'IMAGE' | 'VIDEO';
  timestamp: number;
}

export interface UserProgress {
  unlockedIds: string[];
  unlockedTrophies: string[];
  totalXp: number;
  proofs: Record<string, AchievementProof>; // Map achievement ID to proof
}

export interface User {
  username: string;
  avatarUrl: string;
  createdAt: number;
  isCustomAvatar?: boolean;
  bio?: string;
  year?: number;
  semester?: number;
}