import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Users, Bell, Loader2 } from 'lucide-react';
import { CoopInvite, Achievement, AchievementProof } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { MinecraftButton } from './MinecraftButton';
import { AchievementIcon } from './AchievementIcon';
import { getPendingInvitesForUser, acceptCoopInvite, rejectCoopInvite } from '../services/inviteService';

interface Props {
    username: string;
    onClose: () => void;
    onAcceptInvite: (invite: CoopInvite, achievement: Achievement) => void;
}

export const PendingInvitesModal: React.FC<Props> = ({ username, onClose, onAcceptInvite }) => {
    const [invites, setInvites] = useState<CoopInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadInvites();
    }, [username]);

    const loadInvites = async () => {
        setIsLoading(true);
        try {
            const pending = await getPendingInvitesForUser(username);
            setInvites(pending);
        } catch (e) {
            console.error('Failed to load invites:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (invite: CoopInvite) => {
        setProcessingId(invite.id);
        try {
            const accepted = await acceptCoopInvite(invite.id);
            if (accepted) {
                const achievement = ACHIEVEMENTS.find(a => a.id === invite.achievementId);
                if (achievement) {
                    onAcceptInvite(accepted, achievement);
                }
                setInvites(prev => prev.filter(inv => inv.id !== invite.id));
            }
        } catch (e) {
            console.error('Failed to accept invite:', e);
            alert('Failed to accept invite.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (inviteId: string) => {
        setProcessingId(inviteId);
        try {
            await rejectCoopInvite(inviteId);
            setInvites(prev => prev.filter(inv => inv.id !== inviteId));
        } catch (e) {
            console.error('Failed to reject invite:', e);
        } finally {
            setProcessingId(null);
        }
    };

    const getAchievement = (achievementId: string): Achievement | undefined => {
        return ACHIEVEMENTS.find(a => a.id === achievementId);
    };

    const formatTime = (timestamp: number): string => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-mc-gold shadow-[0_0_40px_rgba(212,175,55,0.3)] rounded-lg overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="p-4 flex justify-between items-center bg-black/80 border-b border-mc-goldDim">
                    <span className="text-xl sm:text-2xl text-mc-yellow drop-shadow-md tracking-wide flex items-center gap-2">
                        <Bell size={24} />
                        Co-op Invites
                        {invites.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {invites.length}
                            </span>
                        )}
                    </span>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 size={32} className="text-mc-gold animate-spin" />
                        </div>
                    ) : invites.length === 0 ? (
                        <div className="text-center py-10">
                            <Users size={48} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">No pending invites</p>
                            <p className="text-gray-600 text-sm mt-2">
                                When someone invites you to a co-op achievement, it will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invites.map(invite => {
                                const achievement = getAchievement(invite.achievementId);
                                if (!achievement) return null;

                                return (
                                    <div 
                                        key={invite.id}
                                        className="bg-black/40 border border-white/10 rounded-lg overflow-hidden"
                                    >
                                        {/* Invite Header */}
                                        <div className="p-4 flex items-start gap-4">
                                            <img 
                                                src={invite.fromAvatarUrl} 
                                                alt={invite.fromUsername}
                                                className="w-12 h-12 rounded bg-gray-800"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white">
                                                    <strong className="text-mc-gold">{invite.fromUsername}</strong>
                                                    {' invited you to complete:'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <AchievementIcon 
                                                        iconName={achievement.iconName} 
                                                        type={achievement.type} 
                                                        category={achievement.category}
                                                        unlocked={false} 
                                                        size={20}
                                                    />
                                                    <span className="text-white font-bold">{achievement.title}</span>
                                                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Users size={10} /> CO-OP
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs mt-1">{formatTime(invite.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Proof Preview (if attached) */}
                                        {invite.proof && (
                                            <div className="px-4 pb-2">
                                                <div className="bg-black/40 border border-white/10 p-3 rounded flex gap-3">
                                                    {invite.proof.media && (
                                                        <div className="w-16 h-16 shrink-0">
                                                            {invite.proof.mediaType === 'IMAGE' && (
                                                                <img src={invite.proof.media} alt="Memory" className="w-full h-full object-cover rounded" />
                                                            )}
                                                            {invite.proof.mediaType === 'VIDEO' && (
                                                                <video src={invite.proof.media} className="w-full h-full object-cover rounded" />
                                                            )}
                                                        </div>
                                                    )}
                                                    {invite.proof.text && (
                                                        <p className="text-gray-400 text-sm italic flex-1">"{invite.proof.text}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="p-4 pt-2 flex gap-3 border-t border-white/5">
                                            <button
                                                onClick={() => handleReject(invite.id)}
                                                disabled={processingId === invite.id}
                                                className="flex-1 bg-red-900/50 text-red-400 font-bold py-2 rounded hover:bg-red-900/70 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <XCircle size={16} />
                                                Decline
                                            </button>
                                            <MinecraftButton
                                                onClick={() => handleAccept(invite)}
                                                variant="green"
                                                disabled={processingId === invite.id}
                                                className="flex-1 flex items-center justify-center gap-2"
                                            >
                                                {processingId === invite.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        Accept
                                                    </>
                                                )}
                                            </MinecraftButton>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
