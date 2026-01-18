import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, X, Compass, Plus, Minus, Package, Search, List, Mail, Users, LogOut } from 'lucide-react';
import { ACHIEVEMENTS, TROPHIES, CATEGORY_COLORS, TIPS } from './constants';
import { AchievementIcon } from './components/AchievementIcon';
import { AchievementModal } from './components/AchievementModal';
import { AchievementListModal } from './components/AchievementListModal';
import { StatsDashboard } from './components/StatsDashboard';
import { ResourcesModal } from './components/ResourcesModal';
import { UserSearchModal } from './components/UserSearchModal';
import { InvitePartnerModal } from './components/InvitePartnerModal';
import { PendingInvitesModal } from './components/PendingInvitesModal';
import { UserProgress, Achievement, User, Category, AchievementProof, CoopInvite, AchievementType } from './types';
import { MinecraftButton } from './components/MinecraftButton';
import { getPersonalizedTip } from './services/geminiService';
import { LoginModal } from './components/LoginModal';
import { loginUser, loadUserProgress, saveUserProgress, getStoredUser, logoutUser, updateUserAvatar, updateUserBio, getOtherUserProfile, loadUserData } from './services/authService';
import { getPendingInvitesForUser } from './services/inviteService';
import { DottedGlowBackground } from './components/ui/dotted-glow-background';
import { createClient } from './src/lib/supabase/client';
import { log } from 'console';

// Create supabase client if env vars exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase = supabaseUrl ? createClient() : null;

const getNUSSemesterText = (date: Date) => {
    const month = date.getMonth() + 1; // 1-indexed
    if (month >= 8 && month <= 12) return "Sem 1";
    if (month >= 1 && month <= 5) return "Sem 2";
    return "Special Term";
};

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <p className="text-sm text-gray-200 tracking-wide leading-none">
            {time.toLocaleString('en-SG', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })}
        </p>
    );
};

const App: React.FC = () => {
    // --- Auth State ---
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // --- Game State ---
    const [progress, setProgress] = useState<UserProgress>({ unlockedIds: ['nus_start'], unlockedTrophies: [], totalXp: 0, proofs: {}, coopPartners: {} });
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [tip, setTip] = useState<string>(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
    const [loadingTip, setLoadingTip] = useState<string>(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
    const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
    const [showMobileStats, setShowMobileStats] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showAchievementList, setShowAchievementList] = useState(false);

    // --- Co-op State ---
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showPendingInvites, setShowPendingInvites] = useState(false);
    const [pendingInviteCount, setPendingInviteCount] = useState(0);

    // --- Achievement Search State ---
    const [achievementSearchQuery, setAchievementSearchQuery] = useState('');


    // --- Viewer State (For looking at other profiles) ---
    const [viewingProfile, setViewingProfile] = useState<{ user: User, progress: UserProgress } | null>(null);

    // --- Viewport State (Infinite Canvas) ---
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse position at start
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });   // Pan value at start
    const [hasCenteredOnce, setHasCenteredOnce] = useState(false);
    const lastPinchDistance = useRef<number | null>(null);

    // --- Hover Tooltip State ---
    const [hoveredProof, setHoveredProof] = useState<{ x: number, y: number, proof: AchievementProof, title: string } | null>(null);

    // 1. Check for existing session on mount
    useEffect(() => {
        console.log("1. Checking for existing session on mount");
        const checkSession = async () => {
            // First check localStorage (for guest users or existing sessions)
            const storedUser = getStoredUser();
            if (storedUser) {
                console.log("1.1. Stored user exists");
                console.log(storedUser);
                handlePostLogin(storedUser);
                return;
            }
            // Then check Supabase session (for authenticated users)
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
                    const avatarUrl = session.user.user_metadata?.avatarUrl || '/avatars/steve.png';
                    const user: User = {
                        username,
                        avatarUrl,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    localStorage.setItem('nus_mc_user', JSON.stringify(user));
                    handlePostLogin(user);
                    return;
                }
            }

            setIsAuthLoading(false);
        };

        checkSession();

        // Listen for Supabase auth changes
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    console.log("1.2. User signed in via Supabase");
                    console.log(session.user.user_metadata);
                    const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
                    const avatarUrl = session.user.user_metadata?.avatar_url || '/avatars/steve.png';
                    const bio = session.user.user_metadata?.bio || '';
                    const year = session.user.user_metadata?.year_of_study || 1;
                    const degree = session.user.user_metadata?.degree || 'Undeclared';
                    const totalXp = session.user.user_metadata?.totalXp || 0;
                    const unlockedIds = session.user.user_metadata?.unlockedIds || ['nus_start'];
                    const unlockedTrophies = session.user.user_metadata?.unlockedTrophies || [];
                    const proofs = session.user.user_metadata?.proofs || {};
                    const created_at = session.user.user_metadata?.created_at || Date.now();
                    const updated_at = session.user.user_metadata?.updated_at || Date.now();
                    const user: User = {
                        username: username,
                        avatarUrl: avatarUrl,
                        bio: bio,
                        year: year,
                        degree: degree,
                        total_xp: totalXp,
                        unlocked_ids: unlockedIds,
                        unlocked_trophies: unlockedTrophies,
                        createdAt: created_at,
                        updatedAt: updated_at
                    };
                    localStorage.setItem('nus_mc_user', JSON.stringify(user));
                    handlePostLogin(user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    localStorage.removeItem('nus_mc_user');
                }
            });

            return () => subscription.unsubscribe();
        }
    }, []);

    // 2. Load Data when User is set
    const handlePostLogin = async (loggedUser: User) => {
        // Keep loading state true while we load data
        const startTime = Date.now();

        try {
            const savedData = await loadUserProgress(loggedUser.username);
            const savedUser = await loadUserData();

            // Use savedUser from Supabase if available (has complete profile data including bio)
            const finalUser = savedUser || loggedUser;
            console.log("Final user to set:", finalUser);

            if (savedData) {
                // Ensure unlockedTrophies & proofs exists (migration support)
                setProgress({
                    ...savedData,
                    unlockedTrophies: savedData.unlockedTrophies || [],
                    proofs: savedData.proofs || {},
                    coopPartners: savedData.coopPartners || {},
                    scannedQrCodes: savedData.scannedQrCodes || {}
                });
            } else {
                // New save for this user
                setProgress({ unlockedIds: ['nus_start'], unlockedTrophies: [], totalXp: 0, proofs: {}, coopPartners: {}, scannedQrCodes: {} });
            }

            // Check for pending invites
            checkPendingInvites(finalUser.username);

            // Ensure minimum 2 second loading screen
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // Set user and stop loading at the same time to avoid flicker
            setIsAuthLoading(false);
            setUser(finalUser);

            // Update localStorage with the complete user data
            localStorage.setItem('nus_mc_user', JSON.stringify(finalUser));
        } catch (e) {
            console.error("Failed to load progress", e);
            setUser(loggedUser);
            setIsAuthLoading(false);
        }
    };

    // Check for pending co-op invites
    const checkPendingInvites = async (username: string) => {
        try {
            const invites = await getPendingInvitesForUser(username);
            setPendingInviteCount(invites.length);
        } catch (e) {
            console.error("Failed to check invites", e);
        }
    };

    // Periodic check for new invites (every 30 seconds)
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            checkPendingInvites(user.username);
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    const handleLogin = async (username: string, avatarUrl: string, isCustomAvatar: boolean) => {
        const loggedUser = await loginUser(username, avatarUrl, isCustomAvatar);
        await handlePostLogin(loggedUser);
    };

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        setProgress({ unlockedIds: ['nus_start'], unlockedTrophies: [], totalXp: 0, proofs: {}, coopPartners: {} });
        setViewingProfile(null);
        setShowMobileStats(false);
        setHasCenteredOnce(false);
        setPendingInviteCount(0);
    };

    const handleBioUpdate = async (newBio: string) => {
        if (!user) return;
        try {
            const updatedUser = await updateUserBio(user.username, newBio);
            setUser(updatedUser);
        } catch (e) {
            console.error("Failed to update bio", e);
        }
    };

    // --- Search & View Logic ---
    const handleSelectUserToView = async (username: string) => {
        setShowSearch(false);
        // If clicking self, just exit view mode
        if (user && username === user.username) {
            setViewingProfile(null);
            return;
        }
        try {
            const data = await getOtherUserProfile(username);
            setViewingProfile(data);
            // Auto center on their start
            handleRecenter();
        } catch (e) {
            alert("Failed to load user profile.");
        }
    };

    const handleReturnToMyProfile = () => {
        setViewingProfile(null);
        handleRecenter();
    };

    // Determine what data to show (Mine vs Observed)
    const displayUser = viewingProfile ? viewingProfile.user : user;
    const displayProgress = viewingProfile ? viewingProfile.progress : progress;
    const isReadOnly = !!viewingProfile;

    const checkForTrophies = (currentProgress: UserProgress): string[] => {
        const newTrophies: string[] = [];
        const { unlockedIds, unlockedTrophies } = currentProgress;

        // Helper for counts
        const countTotal = unlockedIds.length;

        const checkCategory = (cat: Category) => {
            const totalInCat = ACHIEVEMENTS.filter(a => a.category === cat).length;
            const userInCat = ACHIEVEMENTS.filter(a => a.category === cat && unlockedIds.includes(a.id)).length;
            return totalInCat > 0 && totalInCat === userInCat;
        };

        // 1. Starter Trophy
        if (!unlockedTrophies.includes('trophy_starter') && countTotal >= 3) {
            newTrophies.push('trophy_starter');
        }

        // 2. The 67th (Hardcoded request)
        if (!unlockedTrophies.includes('trophy_67') && countTotal >= 67) {
            newTrophies.push('trophy_67');
        }

        // 3. Category Trophies
        if (!unlockedTrophies.includes('trophy_academic') && checkCategory(Category.ACADEMIC)) {
            newTrophies.push('trophy_academic');
        }
        if (!unlockedTrophies.includes('trophy_explorer') && checkCategory(Category.EXPLORATION)) {
            newTrophies.push('trophy_explorer');
        }
        if (!unlockedTrophies.includes('trophy_social') && checkCategory(Category.SOCIAL)) {
            newTrophies.push('trophy_social');
        }

        // 4. Completionist
        if (!unlockedTrophies.includes('trophy_completionist') && countTotal === ACHIEVEMENTS.length) {
            newTrophies.push('trophy_completionist');
        }

        return newTrophies;
    };

    const handleUnlock = async (id: string, proof?: AchievementProof) => {
        // Cannot unlock things for other people
        if (isReadOnly) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        if (!progress.unlockedIds.includes(id)) {
            // CHANGED: Removed parent strict dependency check based on user request.
            // Users can now unlock nodes even if parent is locked.

            let newProgress = {
                ...progress,
                unlockedIds: [...progress.unlockedIds, id],
                totalXp: progress.totalXp + achievement.xp,
                proofs: proof ? { ...progress.proofs, [id]: proof } : progress.proofs
            };

            // Check for Trophies
            const newlyUnlockedTrophies = checkForTrophies(newProgress);
            if (newlyUnlockedTrophies.length > 0) {
                newProgress.unlockedTrophies = [...newProgress.unlockedTrophies, ...newlyUnlockedTrophies];
                const trophyNames = newlyUnlockedTrophies.map(tid => TROPHIES.find(t => t.id === tid)?.title).join(", ");
                alert(`🏆 TROPHY UNLOCKED: ${trophyNames}! Check your profile.`);
            }

            setProgress(newProgress);

            // Auto-Save to DB
            if (user) {
                await saveUserProgress(user.username, newProgress);
            }
        }
    };

    const handleQrScan = (achievementId: string, qrCodeId: string) => {
        // Find achievement to check max length (optional if we trust UI)
        setProgress(prev => {
            const currentScans = prev.scannedQrCodes?.[achievementId] || [];
            if (currentScans.includes(qrCodeId)) return prev;

            const newScans = [...currentScans, qrCodeId];
            const updatedScanned = {
                ...(prev.scannedQrCodes || {}),
                [achievementId]: newScans
            };

            const updatedProgress = { ...prev, scannedQrCodes: updatedScanned };
            if (user) {
                saveUserProgress(user.username, updatedProgress);
            }
            return updatedProgress;
        });
    };

    const handleUpdateProof = async (id: string, proof: AchievementProof) => {
        if (isReadOnly) return;

        let newProgress = {
            ...progress,
            proofs: { ...progress.proofs, [id]: proof }
        };
        setProgress(newProgress);
        if (user) {
            await saveUserProgress(user.username, newProgress);
        }
    };

    // Handle accepting a co-op invite
    const handleAcceptCoopInvite = async (invite: CoopInvite, achievement: Achievement) => {
        if (!user) return;

        // Unlock the achievement for the accepting user
        let newProgress = {
            ...progress,
            unlockedIds: [...progress.unlockedIds, invite.achievementId],
            totalXp: progress.totalXp + achievement.xp,
            proofs: invite.proof ? { ...progress.proofs, [invite.achievementId]: invite.proof } : progress.proofs,
            coopPartners: { ...(progress.coopPartners || {}), [invite.achievementId]: invite.fromUsername }
        };

        // Check for Trophies
        const newlyUnlockedTrophies = checkForTrophies(newProgress);
        if (newlyUnlockedTrophies.length > 0) {
            newProgress.unlockedTrophies = [...newProgress.unlockedTrophies, ...newlyUnlockedTrophies];
            const trophyNames = newlyUnlockedTrophies.map(tid => TROPHIES.find(t => t.id === tid)?.title).join(", ");
            alert(`🏆 TROPHY UNLOCKED: ${trophyNames}! Check your profile.`);
        }

        setProgress(newProgress);

        // Auto-Save to DB
        await saveUserProgress(user.username, newProgress);

        // Update pending invite count
        setPendingInviteCount(prev => Math.max(0, prev - 1));

        alert(`🎮 Co-op achievement "${achievement.title}" unlocked with ${invite.fromUsername}!`);
        setShowPendingInvites(false);
    };

    // Handle when user sends an invite
    const handleInviteSent = (invite: CoopInvite) => {
        // The sender also needs to unlock when the invite is accepted
        // For now, we just close the modal - the unlock happens when the other person accepts
        setShowInviteModal(false);
        setSelectedAchievement(null);
    };

    // --- CLUSTER/CONSTELLATION LAYOUT ALGORITHM ---
    const { nodes, edges, startNodePos, categoryCenters } = useMemo(() => {
        // 1. Initialize Nodes Map
        const nodeMap = new Map<string, any>();
        ACHIEVEMENTS.forEach(ach => {
            nodeMap.set(ach.id, { ...ach, x: 0, y: 0 });
        });

        // 2. Define Category Regions (Galaxy Centers)
        // Spread them out to avoid overlap between categories
        const CATEGORY_CENTERS: Record<string, { x: number, y: number, radius: number, label: string }> = {
            [Category.GENERAL]: { x: 0, y: 0, radius: 250, label: "SPAWN POINT" },
            [Category.ACADEMIC]: { x: -600, y: -500, radius: 450, label: "ACADEMIC DISTRICT" },
            [Category.SOCIAL]: { x: 600, y: -500, radius: 450, label: "SOCIAL HUB" },
            [Category.EXPLORATION]: { x: 0, y: 600, radius: 500, label: "THE WILDLANDS" },
        };

        // --- HARDCODED POSITIONS ---
        // Manually customized to ensure no overlap and good distribution around centers
        const HARDCODED_POSITIONS: Record<string, { x: number, y: number }> = {
            // --- GENERAL (Center: 0, 0) ---
            'nus_start': { x: -40, y: 30 },

            // --- ACADEMIC (Center: -600, -500) ---
            'first_lecture': { x: -821, y: -382 },
            'first_tutorial': { x: -432, y: -689 },
            'library_scholar': { x: -954, y: -582 },
            'study_session': { x: -378, y: -312 },
            'seminar_sage': { x: -721, y: -843 },
            'Competition_Challenger': { x: -882, y: -212 },
            'all_nighter': { x: -312, y: -598 },
            'first_exam': { x: -592, y: -200 },
            'deans_list': { x: -1023, y: -712 },
            'Mentor_Master': { x: -482, y: -892 },

            // --- SOCIAL (Center: 600, -500) ---
            'orientation': { x: 600, y: -200 },
            'supper_jio': { x: 432, y: -689 },
            'hall_stay': { x: 954, y: -582 },
            'cc_activity': { x: 378, y: -312 },
            'club_event': { x: 721, y: -843 },
            'exco_member': { x: 882, y: -212 },
            'networker': { x: 312, y: -598 },
            'pair_programming': { x: 754, y: -421 },
            'class_friend': { x: 1023, y: -712 },
            'cross_faculty_friend': { x: 482, y: -892 },
            'IFG': { x: 650, y: -750 },

            // --- EXPLORATION (Center: 0, 600) ---
            'utown_visit': { x: -212, y: 432 },
            'museum_visit': { x: 342, y: 482 },
            'gym_visit': { x: -312, y: 854 },
            'pool_visit': { x: 421, y: 792 },
            'pgp_mala': { x: -454, y: 582 },
            'chick_visit': { x: 189, y: 921 },
            'merch_collector': { x: -378, y: 712 },
            'watch_performance': { x: 282, y: 382 },
            'tour_guide': { x: -482, y: 342 },
            'all_faculties': { x: 500, y: 700 },
            'campus_explorer': { x: 600, y: 500 },
            'bus_master': { x: 0, y: 1050 },
            'marathon': { x: -80, y: 300 },
            'canteen_hopper': { x: 250, y: 620 },
        };

        const finalNodes: any[] = [];

        ACHIEVEMENTS.forEach(ach => {
            const node = nodeMap.get(ach.id);
            const pos = HARDCODED_POSITIONS[ach.id];

            if (pos) {
                node.x = pos.x;
                node.y = pos.y;
            } else {
                // Fallback for new achievements not yet hardcoded
                // Place effectively near their category center
                const region = CATEGORY_CENTERS[ach.category];
                if (region) {
                    node.x = region.x + (Math.random() * 200 - 100);
                    node.y = region.y + (Math.random() * 200 - 100);
                }
            }
            finalNodes.push(node);
        });

        // 4. Edges - REMOVED for clean floating look (requested by user)
        const computedEdges: any[] = [];

        const rootNode = nodeMap.get('nus_start'); // Assuming 'nus_start' is id or find type ROOT

        return {
            nodes: finalNodes,
            edges: computedEdges,
            startNodePos: rootNode ? { x: rootNode.x, y: rootNode.y } : { x: 0, y: 0 },
            categoryCenters: CATEGORY_CENTERS
        };

    }, []);

    // --- Center View Logic ---
    const handleRecenter = () => {
        if (mapContainerRef.current) {
            const defaultScale = 0.5;
            setScale(defaultScale);
            
            const { clientWidth, clientHeight } = mapContainerRef.current;

            const nodeCenterX = startNodePos.x + 100;
            const nodeCenterY = startNodePos.y + 100;

            const newPanX = (clientWidth / 2) - (nodeCenterX * defaultScale);
            const newPanY = (clientHeight / 2) - (nodeCenterY * defaultScale);

            setPan({ x: newPanX, y: newPanY });
        }
    };

    const handleCenterOnNode = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && mapContainerRef.current) {
            const { clientWidth, clientHeight } = mapContainerRef.current;

            // Node coordinates are based on the layout + 100 offset used in rendering
            const nodeX = node.x + 100;
            const nodeY = node.y + 100;

            const newPanX = (clientWidth / 2) - (nodeX * scale);
            const newPanY = (clientHeight / 2) - (nodeY * scale);

            setPan({ x: newPanX, y: newPanY });
            setAchievementSearchQuery(''); // Close/Clear search

            // Wait for glide animation (700ms) to complete before opening modal
            setTimeout(() => {
                setSelectedAchievement(node);
            }, 750);
        }
    };

    // Filtered Achievements for Search
    const searchResults = useMemo(() => {
        if (!achievementSearchQuery) return [];
        const q = achievementSearchQuery.toLowerCase();
        return ACHIEVEMENTS.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
    }, [achievementSearchQuery]);

    // Initial Auto-Center
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user && !hasCenteredOnce && mapContainerRef.current) {
                handleRecenter();
                setHasCenteredOnce(true);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [user, hasCenteredOnce]);

    // --- Zoom Logic ---
    const handleZoom = (direction: 'in' | 'out') => {
        const factor = direction === 'in' ? 1.2 : 0.8;
        let newScale = scale * factor;
        newScale = Math.max(0.2, Math.min(3, newScale));

        if (mapContainerRef.current) {
            const { clientWidth, clientHeight } = mapContainerRef.current;
            const centerX = (clientWidth / 2 - pan.x) / scale;
            const centerY = (clientHeight / 2 - pan.y) / scale;
            const newPanX = (clientWidth / 2) - (centerX * newScale);
            const newPanY = (clientHeight / 2) - (centerY * newScale);
            setScale(newScale);
            setPan({ x: newPanX, y: newPanY });
        } else {
            setScale(newScale);
        }
    };

    // --- Drag Handlers (Mouse) ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setPanStart({ x: pan.x, y: pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setPan({ x: panStart.x + dx, y: panStart.y + dy });
    };

    const handleMouseUp = () => { setIsDragging(false); };

    // --- Drag Handlers (Touch) ---
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            setDragStart({ x: touch.clientX, y: touch.clientY });
            setPanStart({ x: pan.x, y: pan.y });
        } else if (e.touches.length === 2) {
            // Pinch Start
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastPinchDistance.current = dist;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // 1. Single Touch Drag
        if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            const dx = touch.clientX - dragStart.x;
            const dy = touch.clientY - dragStart.y;
            setPan({ x: panStart.x + dx, y: panStart.y + dy });
        }
        // 2. Pinch Zoom
        else if (e.touches.length === 2 && lastPinchDistance.current !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            // Calculate change ratio
            const delta = dist - lastPinchDistance.current;
            const zoomSensitivity = 0.002; // Adjust for speed
            const zoomFactor = 1 + (delta * zoomSensitivity);

            let newScale = scale * zoomFactor;
            newScale = Math.max(0.2, Math.min(3, newScale));

            // Zoom towards center of screen to feel natural
            if (mapContainerRef.current) {
                const { clientWidth, clientHeight } = mapContainerRef.current;

                // Current center in world coordinates
                const centerX = (clientWidth / 2 - pan.x) / scale;
                const centerY = (clientHeight / 2 - pan.y) / scale;

                // New Pan to keep center in same place
                const newPanX = (clientWidth / 2) - (centerX * newScale);
                const newPanY = (clientHeight / 2) - (centerY * newScale);

                setPan({ x: newPanX, y: newPanY });
            }

            setScale(newScale);
            lastPinchDistance.current = dist;
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        lastPinchDistance.current = null;
    };

    // --- Wheel Handler (Trackpad) ---
    // Note: Trackpad pinch usually triggers wheel event with ctrlKey=true
    const handleWheel = (e: React.WheelEvent) => {
        // Pinch Zoom
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomSensitivity = -0.01;
            const zoomFactor = 1 + (e.deltaY * zoomSensitivity);

            let newScale = scale * zoomFactor;
            newScale = Math.max(0.2, Math.min(3, newScale));

            if (mapContainerRef.current) {
                const rect = mapContainerRef.current.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // World pos under mouse (Before Zoom)
                const worldX = (mouseX - pan.x) / scale;
                const worldY = (mouseY - pan.y) / scale;

                // New Pan to keep world point under mouse (After Zoom)
                const newPanX = mouseX - (worldX * newScale);
                const newPanY = mouseY - (worldY * newScale);

                setPan({ x: newPanX, y: newPanY });
            }
            setScale(newScale);
        } else {
            // Pan (Scroll)
            const newPanX = pan.x - e.deltaX;
            const newPanY = pan.y - e.deltaY;
            setPan({ x: newPanX, y: newPanY });
        }
    };

    // --- RENDER ---

    if (!user && !isAuthLoading) {
        return <LoginModal onLogin={handleLogin} />;
    }

    if (!user || isAuthLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-white relative overflow-hidden">
                {/* Background with Dotted Glow */}
                <div className="absolute inset-0 z-0 bg-[#1a1a1a]">
                    <DottedGlowBackground
                        className="opacity-30"
                        gap={30}
                        radius={1.5}
                        colorDarkVar="#333"
                        glowColorDarkVar="#D4AF37"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] pointer-events-none"></div>
                </div>

                {/* Loading Content */}
                <div className="text-center z-10 px-4">
                    {/* Animated Minecraft-style block */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative w-20 h-20">
                            {/* Rotating cube effect */}
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                                <div className="w-full h-full bg-gradient-to-br from-mc-gold to-mc-goldDim border-4 border-mc-gold/50 shadow-lg shadow-mc-gold/50"
                                    style={{
                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                        transform: 'perspective(100px) rotateX(15deg)'
                                    }}>
                                </div>
                            </div>
                            {/* Inner pulsing glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-mc-gold rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="mb-4">
                        <h2 className="text-3xl text-mc-gold mb-5 animate-pulse">
                            Loading Your World...
                        </h2>
                        <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-mc-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-mc-gold rounded-full animate-bounce" style={{ animationDelay: '1000ms' }}></div>
                            <div className="w-2 h-2 bg-mc-gold rounded-full animate-bounce" style={{ animationDelay: '2000ms' }}></div>
                        </div>
                    </div>

                    {/* Game Tip */}
                    <div className="sm:max-w-lg max-w-sm mx-auto mt-8 p-4 bg-black/40 border-2 border-mc-gold/30 rounded backdrop-blur-sm">
                        <p className="text-mc-goldDim  text-lg flex items-center justify-center gap-2">
                            <span className="text-gray-300 min-w-fit">💡</span>
                            <span className="text-gray-300 leading-tight">{loadingTip}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-[#06011a] text-gray-100 relative overflow-hidden">

            {/* Background with Dotted Glow */}
            <div className="absolute inset-0 z-0 bg-[#06011a]">
                <DottedGlowBackground
                    className="opacity-80"
                    gap={30}
                    radius={1.5}
                    colorDarkVar="#333"
                    glowColorDarkVar="#D4AF37" // Gold glow for NUS theme
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] pointer-events-none"></div>
            </div>

            {/* Header */}
            <header className="relative z-0 bg-black/60 backdrop-blur-md border-b border-mc-gold/30 p-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowMobileStats(!showMobileStats)}
                        className="lg:hidden text-mc-gold hover:text-white transition-colors"
                    >
                        {showMobileStats ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    <div>
                        <h1 className="text-2xl md:text-4xl text-white drop-shadow-md tracking-wider flex items-center gap-2">
                            <span className="text-mc-gold">❖</span>XP
                            <span>NUS</span>
                            <span className='hidden sm:flex'>ACHIEVEMENTS</span>
                        </h1>
                        <p className="text-gray-400 text-xl mt-1 hidden lg:flex items-center gap-2">
                            <span className="text-mc-green animate-pulse">●</span> {tip}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="text-right hidden md:block space-y-0.5">
                        <p className="text-[10px] text-mc-gold uppercase tracking-widest opacity-100">Current Session</p>
                        <p className="text-xl text-gray-200 tracking-wide leading-none">Year {user?.year}, {getNUSSemesterText(new Date())}</p>
                        <Clock />
                    </div>

                    <MinecraftButton onClick={() => setShowSearch(true)} className="flex items-center gap-2 h-13" variant="default">
                        <Search size={19} />
                    </MinecraftButton>

                    {/* Co-op Invites Mail Button */}
                    <MinecraftButton
                        onClick={() => setShowPendingInvites(true)}
                        className="relative flex items-center gap-2 h-13"
                        variant="purple"
                    >
                        <Mail size={19} />
                        {pendingInviteCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                {pendingInviteCount}
                            </span>
                        )}
                    </MinecraftButton>

                    <MinecraftButton onClick={() => setShowInventory(true)} className="items-center gap-2 h-13" variant="green">
                        <Package size={20} />
                    </MinecraftButton>

                    <MinecraftButton onClick={handleLogout} className="items-center gap-2 h-13" variant="red">
                        <LogOut size={20} />
                    </MinecraftButton>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* Desktop Sidebar with INCREASED Z-INDEX */}
                <aside className="w-80 p-4 hidden lg:block z-40 h-full border-r border-white/5 relative">
                    <StatsDashboard
                        progress={displayProgress}
                        user={displayUser}
                        onLogout={handleLogout}
                        onUpdateBio={handleBioUpdate}
                        isReadOnly={isReadOnly}
                        onBack={handleReturnToMyProfile}
                    />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {showMobileStats && (
                    <div className="fixed inset-0 z-[100] lg:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setShowMobileStats(false)}
                        ></div>

                        {/* Sidebar */}
                        <aside className="relative w-80 h-full bg-neutral-900 border-r border-mc-gold/50 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-4 border-b border-white/10 flex justify-end">
                                <button
                                    onClick={() => setShowMobileStats(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 min-h-0 p-4 pt-0">
                                <StatsDashboard
                                    progress={displayProgress}
                                    user={displayUser}
                                    onLogout={handleLogout}
                                    onUpdateBio={handleBioUpdate}
                                    isReadOnly={isReadOnly}
                                    onBack={handleReturnToMyProfile}
                                />
                            </div>
                        </aside>
                    </div>
                )}


                {/* Map Wrapper with Filters */}
                <div className="relative flex-1 flex flex-col h-full overflow-hidden">


                    {/* Achievement Search Overlay (Expandable) */}
                    <div className="absolute top-4 right-4 z-30 pointer-events-auto flex items-start gap-2">
                        {/* List Button - matches search box collapsed size */}
                        <button
                            onClick={() => setShowAchievementList(true)}
                            className="w-[44px] h-[44px] flex items-center justify-center bg-black/80 border-2 border-white/20 rounded-sm shadow-lg backdrop-blur-sm hover:border-mc-gold hover:bg-mc-gold/20 transition-all duration-300"
                            title="Quest Log"
                        >
                            <List size={18} className="text-gray-400" />
                        </button>

                        {/* Search Box */}
                        <div className="relative group">
                            <div className={`flex items-center bg-black/80 border-2 rounded-sm p-1 shadow-lg backdrop-blur-sm transition-all duration-300 h-[44px] ${achievementSearchQuery ? 'border-mc-gold w-64' : 'border-white/20 w-[44px] hover:w-64 focus-within:w-64 overflow-hidden'}`}>
                                <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Find achievement..."
                                    className="bg-transparent border-none text-white text-sm font-pixel focus:outline-none w-full placeholder-gray-500 ml-1"
                                    value={achievementSearchQuery}
                                    onChange={(e) => setAchievementSearchQuery(e.target.value)}
                                />
                                {achievementSearchQuery && (
                                    <button onClick={() => setAchievementSearchQuery('')} className="shrink-0 text-gray-500 hover:text-white px-2">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Results Dropdown */}
                            {achievementSearchQuery && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border-2 border-mc-gold/50 shadow-2xl rounded-sm max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-gray-500 text-xs text-center italic">No quests found.</div>
                                    ) : (
                                        searchResults.map(ach => (
                                            <button
                                                key={ach.id}
                                                onClick={() => handleCenterOnNode(ach.id)}
                                                className="w-full text-left p-3 hover:bg-white/10 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors group/item"
                                            >
                                                <div className={`p-1.5 rounded-sm bg-black border border-white/20 group-hover/item:border-mc-gold/50`}>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[ach.category] }}></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-bold truncate group-hover/item:text-mc-gold transition-colors">{ach.title}</p>
                                                    <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{ach.category}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover Proof Tooltip - Absolute positioned based on mouse */}
                    {hoveredProof && (
                        <div
                            className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                            style={{ left: hoveredProof.x + 20, top: hoveredProof.y + 20 }}
                        >
                            <div className="bg-black/90 border-2 border-white p-1 rounded-sm shadow-[5px_5px_0px_rgba(0,0,0,0.5)] w-48">
                                {/* Header */}
                                <div className="bg-[#5D8D42] text-white text-[10px] font-bold px-2 py-1 mb-1 tracking-widest uppercase truncate border-b border-green-800">
                                    {hoveredProof.title}
                                </div>

                                {/* Content */}
                                <div className="p-1 space-y-1">
                                    {hoveredProof.proof.media && hoveredProof.proof.mediaType === 'IMAGE' && (
                                        <img src={hoveredProof.proof.media} alt="Memory" className="w-full h-24 object-cover rounded border border-white/20" />
                                    )}
                                    {hoveredProof.proof.media && hoveredProof.proof.mediaType === 'VIDEO' && (
                                        <video
                                            src={hoveredProof.proof.media}
                                            autoPlay muted loop
                                            className="w-full h-24 object-cover rounded border border-white/20"
                                        />
                                    )}
                                    {hoveredProof.proof.text && (
                                        <div className="p-1 text-white italic text-[10px] font-serif leading-tight bg-white/5 rounded">
                                            "{hoveredProof.proof.text}"
                                        </div>
                                    )}
                                </div>

                                {/* Footer Timestamp */}
                                <div className="mt-1 text-[8px] text-gray-400 text-right pr-1">
                                    {new Date(hoveredProof.proof.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Canvas (Tree Visualization) */}
                    <main
                        ref={mapContainerRef}
                        className={`flex-1 w-full h-full relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => { handleMouseUp(); setHoveredProof(null); }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onWheel={handleWheel}
                    >
                        <div
                            className={`absolute top-0 left-0 origin-top-left transition-transform ease-out will-change-transform ${isDragging ? 'duration-0' : 'duration-700'}`}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                            }}
                        >
                            {/* 1. Category Labels Layer */}
                            {Object.values(categoryCenters).map((center: any) => (
                                <div
                                    key={center.label}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
                                    style={{
                                        left: `${center.x + 100}px`,
                                        top: `${center.y + 100}px`,
                                        width: '400px'
                                    }}
                                >
                                    <h2 className="text-3xl font-bold text-white/20 tracking-[0.5em] text-center font-pixel whitespace-nowrap uppercase drop-shadow-md">
                                        {center.label}
                                    </h2>
                                </div>
                            ))}

                            {/* 2. Nodes Layer */}
                            {nodes.map(node => {
                                if (filterCategory !== 'ALL' && node.category !== filterCategory) {
                                    return null;
                                }

                                const isUnlocked = displayProgress.unlockedIds.includes(node.id);
                                const hasQrReqs = (node.qrCodes?.length || 0) > 0;

                                // Relaxed Logic: If unlocked, full opacity. If not, just dim.
                                // We removed the parent dependency check for visibility so users can see "future" nodes easier in this city map
                                let opacityClass = 'opacity-100';
                                if (!isUnlocked && !hasQrReqs) {
                                    opacityClass = 'opacity-60 grayscale brightness-75';
                                } else if (!isUnlocked && hasQrReqs) {
                                    // For QR progress, we keep color overlay vibrant
                                    opacityClass = 'opacity-100';
                                }

                                return (
                                    <div
                                        key={node.id}
                                        className="absolute group"
                                        style={{
                                            left: `${node.x + 100}px`,
                                            top: `${node.y + 100}px`
                                        }}
                                    >
                                        <div
                                            className={`transition-all duration-200 cursor-pointer hover:scale-110 ${opacityClass}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAchievement(node);
                                            }}
                                            onMouseEnter={(e) => {
                                                // Show Proof Tooltip if available
                                                const proof = displayProgress.proofs?.[node.id];
                                                if (proof) {
                                                    setHoveredProof({
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                        proof,
                                                        title: node.title
                                                    });
                                                }
                                            }}
                                            onMouseMove={(e) => {
                                                if (hoveredProof) {
                                                    setHoveredProof(prev => prev ? ({ ...prev, x: e.clientX, y: e.clientY }) : null);
                                                }
                                            }}
                                            onMouseLeave={() => setHoveredProof(null)}
                                        >
                                            {(() => {
                                                const scanned = displayProgress.scannedQrCodes?.[node.id] || [];
                                                const qrCompleted = scanned.length;
                                                const progressPercentage = hasQrReqs ? (qrCompleted / (node.qrCodes?.length || 1)) * 100 : 0;

                                                return hasQrReqs && !isUnlocked ? (
                                                    <div className="relative">
                                                        {/* Locked Base */}
                                                        <AchievementIcon
                                                            iconName={node.iconName}
                                                            type={node.type}
                                                            category={node.category}
                                                            unlocked={false}
                                                            size={32}
                                                        />
                                                        {/* Unlocked Overlay (Clipped) */}
                                                        <div
                                                            className="absolute inset-0 transition-all duration-700 ease-in-out"
                                                            style={{ clipPath: `inset(${100 - progressPercentage}% 0 0 0)` }}
                                                        >
                                                            <AchievementIcon
                                                                iconName={node.iconName}
                                                                type={node.type}
                                                                category={node.category}
                                                                unlocked={true}
                                                                size={32}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <AchievementIcon
                                                        iconName={node.iconName}
                                                        type={node.type}
                                                        category={node.category}
                                                        unlocked={isUnlocked}
                                                        size={32}
                                                    />
                                                );
                                            })()}
                                            {/* Default title tooltip (hidden if proof is showing to avoid clutter, or kept for consistency) */}
                                            {!hoveredProof && (
                                                <div
                                                    className="absolute -bottom-8 left-1/2 whitespace-nowrap bg-black/90 backdrop-blur text-mc-gold px-3 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-mc-gold/50 font-pixel tracking-wide shadow-[0_0_10px_rgba(0,0,0,1)] flex items-center gap-2"
                                                    style={{
                                                        transform: `translateX(-50%) scale(${Math.max(1, 1 / scale)})`,
                                                        transformOrigin: 'top center'
                                                    }}
                                                >
                                                    {node.title}
                                                    {node.type === AchievementType.COOP && (
                                                        <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <Users size={10} /> CO-OP
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30 pointer-events-auto items-end">
                            <MinecraftButton onClick={handleRecenter} className="!w-10 !h-10 flex items-center justify-center bg-black/80 !border-mc-gold hover:!bg-mc-gold/20">
                                <Compass size={20} />
                            </MinecraftButton>
                            <MinecraftButton onClick={() => handleZoom('in')} className="!w-10 !h-10 flex items-center justify-center bg-black/80 !border-mc-gold hover:!bg-mc-gold/20">
                                <Plus size={18} />
                            </MinecraftButton>
                            <MinecraftButton onClick={() => handleZoom('out')} className="!w-10 !h-10 flex items-center justify-center bg-black/80 !border-mc-gold hover:!bg-mc-gold/20">
                                <Minus size={18} />
                            </MinecraftButton>
                        </div>
                    </main>
                </div>


                {/* Modals */}
                {selectedAchievement && (
                    <AchievementModal
                        achievement={selectedAchievement}
                        onClose={() => setSelectedAchievement(null)}
                        status={
                            displayProgress.unlockedIds.includes(selectedAchievement.id) ? 'UNLOCKED' : 'READY'
                        }
                        onUnlock={handleUnlock}
                        onUpdateProof={handleUpdateProof}
                        parentTitle={selectedAchievement.parentId ? ACHIEVEMENTS.find(a => a.id === selectedAchievement.parentId)?.title : undefined}
                        existingProof={displayProgress.proofs?.[selectedAchievement.id]}
                        coopPartner={displayProgress.coopPartners?.[selectedAchievement.id]}
                        scannedQrCodes={displayProgress.scannedQrCodes?.[selectedAchievement.id] || []}
                        onQrScan={handleQrScan}
                        onOpenInviteModal={() => setShowInviteModal(true)}
                    />
                )}

                {/* Co-op Invite Modal */}
                {showInviteModal && selectedAchievement && user && (
                    <InvitePartnerModal
                        achievement={selectedAchievement}
                        currentUser={user}
                        onClose={() => setShowInviteModal(false)}
                        onInviteSent={(invite) => {
                            console.log('Invite sent:', invite);
                            setShowInviteModal(false);
                        }}
                    />
                )}

                {/* Pending Invites Modal */}
                {showPendingInvites && user && (
                    <PendingInvitesModal
                        username={user.username}
                        onClose={() => setShowPendingInvites(false)}
                        onAcceptInvite={async (invite, achievement) => {
                            // Unlock achievement for both users
                            const newProgress = {
                                ...progress,
                                unlockedIds: [...progress.unlockedIds, achievement.id],
                                totalXp: progress.totalXp + achievement.xp,
                                proofs: invite.proof ? { ...progress.proofs, [achievement.id]: invite.proof } : progress.proofs,
                                coopPartners: { ...(progress.coopPartners || {}), [achievement.id]: invite.fromUsername }
                            };
                            setProgress(newProgress);
                            if (user) {
                                await saveUserProgress(user.username, newProgress);
                            }
                            alert(`🎉 Achievement "${achievement.title}" unlocked with ${invite.fromUsername}!`);
                            checkPendingInvites(user.username);
                            setShowPendingInvites(false);
                        }}
                    />
                )}

                {showInventory && <ResourcesModal unlockedIds={displayProgress.unlockedIds} onClose={() => setShowInventory(false)} />}

                {showSearch && user && (
                    <UserSearchModal
                        currentUsername={user.username}
                        onClose={() => setShowSearch(false)}
                        onSelectUser={handleSelectUserToView}
                    />
                )}
            </div>

            {/* Achievement List Modal - Rendered at root level for proper z-index */}
            {showAchievementList && (
                <AchievementListModal
                    onClose={() => setShowAchievementList(false)}
                    onSelectAchievement={(ach) => {
                        setShowAchievementList(false);
                        handleCenterOnNode(ach.id);
                    }}
                    progress={displayProgress}
                />
            )}
        </div >
    );
};

export default App;