import { User, UserProgress } from "../types";
import { createClient } from "../src/lib/supabase/client";

// Only create Supabase client if env vars are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase = supabaseUrl ? createClient() : null;

/**
 * AUTH SERVICE - Uses localStorage with optional Supabase sync
 */

const STORAGE_KEY_USER = "nus_mc_user";
const STORAGE_KEY_DATA = "nus_mc_data_";

// Helper to get formatted error
const getError = (err: any) => err?.message || "An unexpected error occurred";

// Login with Supabase Auth
export const loginUser = async (
  username: string,
  avatarUrl: string,
  isCustom: boolean,
): Promise<User> => {
  // For localStorage fallback (when not using email auth)
  const user: User = {
    username,
    avatarUrl,
    createdAt: Date.now(),
    isCustomAvatar: isCustom,
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
};

// Update Avatar
export const updateUserAvatar = async (
  username: string,
  avatarUrl: string,
): Promise<User> => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (data) {
    const user = JSON.parse(data);
    if (user.username === username) {
      user.avatarUrl = avatarUrl;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

      // Sync to Supabase
      if (supabase) {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("profiles")
              .update({ avatar_url: avatarUrl })
              .eq("id", authUser.id);
          }
        } catch (e) {
          console.log("Avatar sync failed");
        }
      }

      return user;
    }
  }
  throw new Error("User not found or session invalid");
};

// Bio Update
export const updateUserBio = async (
  username: string,
  bio: string,
): Promise<User> => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (data) {
    const user = JSON.parse(data);
    user.bio = bio;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    // Sync to Supabase
    if (supabase) {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("profiles").update({ bio }).eq("id", authUser.id);
        }
      } catch (e) {
        console.log("Bio sync failed");
      }
    }

    return user;
  }
  throw new Error("User not found");
};

// Update Year and Semester
export const updateUserYearSem = async (
  username: string,
  year: number,
  semester: number,
): Promise<User> => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (data) {
    const user = JSON.parse(data);
    user.year = year;
    user.semester = semester;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    // Sync to Supabase
    if (supabase) {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          await supabase
            .from("profiles")
            .update({ year, semester })
            .eq("id", authUser.id);
        }
      } catch (e) {
        console.log("Year/Sem sync failed");
      }
    }

    return user;
  }
  throw new Error("User not found");
};

// Save Progress (localStorage + Supabase sync)
export const saveUserProgress = async (
  username: string,
  progress: UserProgress,
): Promise<boolean> => {
  localStorage.setItem(STORAGE_KEY_DATA + username, JSON.stringify(progress));

  // Try to sync with Supabase profiles table if available
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            unlocked_ids: progress.unlockedIds,
            total_xp: progress.totalXp,
            proofs: progress.proofs,
            unlocked_trophies: progress.unlockedTrophies,
          })
          .eq("id", user.id);
      }
    } catch (e) {
      console.log("Supabase sync skipped (offline or not logged in)");
    }
  }

  console.log(`[Database] Saved progress for ${username}`);
  return true;
};

// Load Progress
export const loadUserProgress = async (
  username: string,
): Promise<UserProgress | null> => {
  // Try Supabase first if available
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("unlocked_ids, total_xp, unlocked_trophies, proofs")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          return {
            unlockedIds: data.unlocked_ids || ["nus_start"],
            totalXp: data.total_xp || 0,
            unlockedTrophies: data.unlocked_trophies || [],
            proofs: data.proofs || {},
          };
        }
      }
    } catch (e) {
      console.log("Supabase load failed, using localStorage");
    }
  }

  // Fallback to localStorage
  const data = localStorage.getItem(STORAGE_KEY_DATA + username);
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const logoutUser = async () => {
  localStorage.removeItem(STORAGE_KEY_USER);
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore if not logged in with Supabase
    }
  }
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
};

// User Search
export const getOtherUserProfile = async (
  username: string,
): Promise<{ user: User; progress: UserProgress } | null> => {
  const currentUser = getStoredUser();

  // Check if it's the current user
  if (currentUser && currentUser.username === username) {
    const prog = await loadUserProgress(username);
    return {
      user: currentUser,
      progress: prog || {
        unlockedIds: [],
        proofs: {},
        totalXp: 0,
        unlockedTrophies: [],
      },
    };
  }

  // Search Supabase for other users
  if (supabase) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profile && !error) {
        const user: User = {
          username: profile.username,
          avatarUrl: profile.avatar_url || "/avatars/steve.png",
          bio: profile.bio || "",
          year: profile.year || 1,
          semester: profile.semester || 1,
          createdAt: new Date(profile.created_at).getTime(),
        };

        const progress: UserProgress = {
          unlockedIds: profile.unlocked_ids || ["nus_start"],
          totalXp: profile.total_xp || 0,
          unlockedTrophies: profile.unlocked_trophies || [],
          proofs: profile.proofs || {},
        };

        return { user, progress };
      }
    } catch (e) {
      console.log("Profile lookup failed:", e);
    }
  }

  return null;
};

// Search Users
export const searchUsers = async (query: string): Promise<User[]> => {
  const currentUser = getStoredUser();
  const results: User[] = [];

  // Include current user if matches
  if (
    currentUser &&
    (!query || currentUser.username.toLowerCase().includes(query.toLowerCase()))
  ) {
    results.push(currentUser);
  }

  // Search Supabase for other users
  if (supabase && query && query.length >= 2) {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .limit(10);

      if (profiles && !error) {
        for (const profile of profiles) {
          // Don't duplicate current user
          if (currentUser && profile.username === currentUser.username)
            continue;

          results.push({
            username: profile.username,
            avatarUrl: profile.avatar_url || "/avatars/steve.png",
            createdAt: new Date(profile.created_at).getTime(),
          });
        }
      }
    } catch (e) {
      console.log("User search failed:", e);
    }
  }

  return results;
};
