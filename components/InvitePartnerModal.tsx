import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Users, Camera, Video, Trash2, Send, Loader2 } from 'lucide-react';
import { Achievement, AchievementProof, User, CoopInvite } from '../types';
import { MinecraftButton } from './MinecraftButton';
import { AchievementIcon } from './AchievementIcon';
import { searchUsers } from '../services/authService';
import { sendCoopInvite, hasPendingInviteForAchievement, cancelCoopInvite } from '../services/inviteService';

interface Props {
    achievement: Achievement;
    currentUser: User;
    onClose: () => void;
    onInviteSent: (invite: CoopInvite) => void;
}

export const InvitePartnerModal: React.FC<Props> = ({ achievement, currentUser, onClose, onInviteSent }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [existingInvite, setExistingInvite] = useState<CoopInvite | null>(null);
    
    // Proof state
    const [proofText, setProofText] = useState('');
    const [proofMedia, setProofMedia] = useState('');
    const [proofMediaType, setProofMediaType] = useState<'IMAGE' | 'VIDEO' | undefined>(undefined);
    const [uploadError, setUploadError] = useState('');

    const searchTimeout = useRef<number | null>(null);

    // Check for existing pending invite
    useEffect(() => {
        const checkExisting = async () => {
            const existing = await hasPendingInviteForAchievement(currentUser.username, achievement.id);
            setExistingInvite(existing);
        };
        checkExisting();
    }, [currentUser.username, achievement.id]);

    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
        
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        searchTimeout.current = window.setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchUsers(searchQuery);
                // Filter out current user
                setSearchResults(results.filter(u => u.username !== currentUser.username));
            } catch (e) {
                console.error('Search failed:', e);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
        };
    }, [searchQuery, currentUser.username]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO') => {
        const file = e.target.files?.[0];
        setUploadError('');
        
        if (!file) return;

        if (file.size > 2.5 * 1024 * 1024) {
            setUploadError('File too large! Max 2.5MB.');
            return;
        }

        if (type === 'VIDEO') {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 11) {
                    setUploadError('Video must be under 10 seconds!');
                    setProofMedia('');
                    return;
                }
            };
            video.src = URL.createObjectURL(file);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProofMedia(reader.result as string);
            setProofMediaType(type);
        };
        reader.readAsDataURL(file);
    };

    const constructProof = (): AchievementProof | undefined => {
        if (!proofText && !proofMedia) return undefined;
        return {
            text: proofText || undefined,
            media: proofMedia || undefined,
            mediaType: proofMediaType,
            timestamp: Date.now()
        };
    };

    const handleSendInvite = async () => {
        if (!selectedPartner) return;
        
        setIsSending(true);
        try {
            const invite = await sendCoopInvite(
                achievement.id,
                currentUser.username,
                currentUser.avatarUrl,
                selectedPartner.username,
                constructProof()
            );
            onInviteSent(invite);
            alert(`🎮 Invite sent to ${selectedPartner.username}! They need to accept to unlock the achievement.`);
            onClose();
        } catch (e) {
            console.error('Failed to send invite:', e);
            alert('Failed to send invite. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCancelInvite = async () => {
        if (!existingInvite) return;
        
        await cancelCoopInvite(existingInvite.id);
        setExistingInvite(null);
        alert('Invite cancelled.');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-mc-gold shadow-[0_0_40px_rgba(212,175,55,0.3)] rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 flex justify-between items-center bg-black/80 border-b border-mc-goldDim">
                    <span className="text-xl sm:text-2xl text-mc-yellow drop-shadow-md tracking-wide flex items-center gap-2">
                        <Users size={24} />
                        Invite Partner
                    </span>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Achievement Info */}
                    <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-4 rounded">
                        <AchievementIcon 
                            iconName={achievement.iconName} 
                            type={achievement.type} 
                            category={achievement.category}
                            unlocked={false} 
                            size={32}
                        />
                        <div>
                            <h3 className="text-xl text-white font-bold flex items-center gap-2">
                                {achievement.title}
                                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                    <Users size={12} /> CO-OP
                                </span>
                            </h3>
                            <p className="text-gray-400 text-sm">{achievement.description}</p>
                        </div>
                    </div>

                    {/* Existing Invite Warning */}
                    {existingInvite && (
                        <div className="bg-yellow-900/30 border border-yellow-600/50 p-4 rounded">
                            <p className="text-yellow-400 text-sm mb-2">
                                ⏳ You already have a pending invite sent to <strong>{existingInvite.toUsername}</strong>
                            </p>
                            <button 
                                onClick={handleCancelInvite}
                                className="text-red-400 text-xs underline hover:text-red-300"
                            >
                                Cancel existing invite
                            </button>
                        </div>
                    )}

                    {!existingInvite && (
                        <>
                            {/* Partner Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Users size={18} />
                                    <span className="font-bold">Select Partner</span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    You must invite a friend. The achievement unlocks when they accept.
                                </p>

                                {/* Search Input */}
                                <div className="relative">
                                    <div className="flex items-center bg-black/60 border-2 border-mc-gold/50 rounded p-2">
                                        <Search size={18} className="text-gray-500 mr-2" />
                                        <input 
                                            type="text"
                                            placeholder="Search username..."
                                            className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder-gray-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {isSearching && <Loader2 size={16} className="text-mc-gold animate-spin" />}
                                    </div>
                                </div>

                                {/* Search Results / Selected Partner */}
                                <div className="bg-black/40 border border-white/10 rounded min-h-[100px] max-h-[150px] overflow-y-auto">
                                    {selectedPartner ? (
                                        <div className="p-3 flex items-center justify-between bg-mc-gold/10 border-b border-mc-gold/30">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={selectedPartner.avatarUrl} 
                                                    alt={selectedPartner.username} 
                                                    className="w-8 h-8 rounded bg-gray-800"
                                                />
                                                <span className="text-white font-bold">{selectedPartner.username}</span>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedPartner(null)}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <button
                                                key={user.username}
                                                onClick={() => setSelectedPartner(user)}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                            >
                                                <img 
                                                    src={user.avatarUrl} 
                                                    alt={user.username} 
                                                    className="w-8 h-8 rounded bg-gray-800"
                                                />
                                                <span className="text-white">{user.username}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            {searchQuery.length < 2 ? 'Type to search for players...' : 'No players found.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proof Section (Optional) */}
                            <div className="space-y-3 border-t border-white/10 pt-4">
                                <p className="text-gray-400 text-sm">Add a memory (optional):</p>
                                
                                {/* Text */}
                                <textarea 
                                    className="w-full bg-black/50 border border-gray-600 p-2 text-white text-sm rounded focus:border-mc-gold focus:outline-none"
                                    rows={2}
                                    placeholder="Describe your experience..."
                                    value={proofText}
                                    onChange={(e) => setProofText(e.target.value)}
                                    maxLength={140}
                                />

                                {/* Media */}
                                {!proofMedia ? (
                                    <div className="flex gap-4 justify-center">
                                        <label className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
                                            <Camera size={20} className="text-mc-gold" />
                                            <span className="text-[10px] text-gray-400">PHOTO</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'IMAGE')} />
                                        </label>
                                        <label className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
                                            <Video size={20} className="text-mc-gold" />
                                            <span className="text-[10px] text-gray-400">VIDEO</span>
                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'VIDEO')} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative inline-block border border-gray-600 rounded bg-black">
                                        {proofMediaType === 'IMAGE' && <img src={proofMedia} alt="Preview" className="max-h-24 rounded opacity-80" />}
                                        {proofMediaType === 'VIDEO' && <video src={proofMedia} controls className="max-h-24 rounded opacity-80" />}
                                        <button 
                                            onClick={() => { setProofMedia(''); setProofMediaType(undefined); }} 
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 shadow-md"
                                        >
                                            <Trash2 size={12}/>
                                        </button>
                                    </div>
                                )}
                                {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!existingInvite && (
                    <div className="p-4 border-t border-white/10 bg-black/40 flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600"
                        >
                            Cancel Invite
                        </button>
                        <MinecraftButton 
                            onClick={handleSendInvite}
                            variant={selectedPartner ? "green" : "disabled"}
                            className="flex-1 flex items-center justify-center gap-2"
                            disabled={!selectedPartner || isSending}
                        >
                            {isSending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <Send size={16} />
                                    SEND INVITE
                                </>
                            )}
                        </MinecraftButton>
                    </div>
                )}
            </div>
        </div>
    );
};
