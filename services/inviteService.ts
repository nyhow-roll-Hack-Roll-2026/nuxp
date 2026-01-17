import { CoopInvite, CoopInviteStatus, AchievementProof } from '../types';
import { createClient } from '../src/lib/supabase/client';

// Only create Supabase client if env vars are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase = supabaseUrl ? createClient() : null;

const INVITES_STORAGE_KEY = 'nus_mc_invites';

// Helper to generate unique ID
const generateId = () => `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get all invites from localStorage (fallback)
const getLocalInvites = (): CoopInvite[] => {
    const data = localStorage.getItem(INVITES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

// Save invites to localStorage
const saveLocalInvites = (invites: CoopInvite[]) => {
    localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
};

/**
 * Send a co-op invite to another user
 */
export const sendCoopInvite = async (
    achievementId: string,
    fromUsername: string,
    fromAvatarUrl: string,
    toUsername: string,
    proof?: AchievementProof
): Promise<CoopInvite> => {
    const invite: CoopInvite = {
        id: generateId(),
        achievementId,
        fromUsername,
        fromAvatarUrl,
        toUsername,
        status: 'PENDING',
        createdAt: Date.now(),
        proof
    };

    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('coop_invites')
                .insert({
                    id: invite.id,
                    achievement_id: invite.achievementId,
                    from_username: invite.fromUsername,
                    from_avatar_url: invite.fromAvatarUrl,
                    to_username: invite.toUsername,
                    status: invite.status,
                    created_at: new Date(invite.createdAt).toISOString(),
                    proof: invite.proof
                })
                .select()
                .single();

            if (!error && data) {
                console.log('[Invite] Sent via Supabase:', invite.id);
                return invite;
            }
        } catch (e) {
            console.log('[Invite] Supabase failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    invites.push(invite);
    saveLocalInvites(invites);
    console.log('[Invite] Sent via localStorage:', invite.id);
    return invite;
};

/**
 * Get pending invites for a user (invites they received)
 */
export const getPendingInvitesForUser = async (username: string): Promise<CoopInvite[]> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('coop_invites')
                .select('*')
                .eq('to_username', username)
                .eq('status', 'PENDING');

            if (!error && data) {
                return data.map((row: any) => ({
                    id: row.id,
                    achievementId: row.achievement_id,
                    fromUsername: row.from_username,
                    fromAvatarUrl: row.from_avatar_url,
                    toUsername: row.to_username,
                    status: row.status as CoopInviteStatus,
                    createdAt: new Date(row.created_at).getTime(),
                    proof: row.proof
                }));
            }
        } catch (e) {
            console.log('[Invite] Supabase fetch failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    return invites.filter(inv => inv.toUsername === username && inv.status === 'PENDING');
};

/**
 * Get sent invites from a user
 */
export const getSentInvites = async (username: string): Promise<CoopInvite[]> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('coop_invites')
                .select('*')
                .eq('from_username', username);

            if (!error && data) {
                return data.map((row: any) => ({
                    id: row.id,
                    achievementId: row.achievement_id,
                    fromUsername: row.from_username,
                    fromAvatarUrl: row.from_avatar_url,
                    toUsername: row.to_username,
                    status: row.status as CoopInviteStatus,
                    createdAt: new Date(row.created_at).getTime(),
                    proof: row.proof
                }));
            }
        } catch (e) {
            console.log('[Invite] Supabase fetch failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    return invites.filter(inv => inv.fromUsername === username);
};

/**
 * Check if user has a pending invite for a specific achievement
 */
export const hasPendingInviteForAchievement = async (
    username: string,
    achievementId: string
): Promise<CoopInvite | null> => {
    const sentInvites = await getSentInvites(username);
    return sentInvites.find(inv => inv.achievementId === achievementId && inv.status === 'PENDING') || null;
};

/**
 * Accept a co-op invite
 */
export const acceptCoopInvite = async (inviteId: string): Promise<CoopInvite | null> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('coop_invites')
                .update({ status: 'ACCEPTED' })
                .eq('id', inviteId)
                .select()
                .single();

            if (!error && data) {
                return {
                    id: data.id,
                    achievementId: data.achievement_id,
                    fromUsername: data.from_username,
                    fromAvatarUrl: data.from_avatar_url,
                    toUsername: data.to_username,
                    status: 'ACCEPTED',
                    createdAt: new Date(data.created_at).getTime(),
                    proof: data.proof
                };
            }
        } catch (e) {
            console.log('[Invite] Supabase accept failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    const index = invites.findIndex(inv => inv.id === inviteId);
    if (index !== -1) {
        invites[index].status = 'ACCEPTED';
        saveLocalInvites(invites);
        return invites[index];
    }
    return null;
};

/**
 * Reject a co-op invite
 */
export const rejectCoopInvite = async (inviteId: string): Promise<boolean> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { error } = await supabase
                .from('coop_invites')
                .update({ status: 'REJECTED' })
                .eq('id', inviteId);

            if (!error) {
                return true;
            }
        } catch (e) {
            console.log('[Invite] Supabase reject failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    const index = invites.findIndex(inv => inv.id === inviteId);
    if (index !== -1) {
        invites[index].status = 'REJECTED';
        saveLocalInvites(invites);
        return true;
    }
    return false;
};

/**
 * Cancel a sent invite
 */
export const cancelCoopInvite = async (inviteId: string): Promise<boolean> => {
    // Try Supabase first
    if (supabase) {
        try {
            const { error } = await supabase
                .from('coop_invites')
                .delete()
                .eq('id', inviteId);

            if (!error) {
                return true;
            }
        } catch (e) {
            console.log('[Invite] Supabase cancel failed, using localStorage');
        }
    }

    // Fallback to localStorage
    const invites = getLocalInvites();
    const filtered = invites.filter(inv => inv.id !== inviteId);
    saveLocalInvites(filtered);
    return true;
};
