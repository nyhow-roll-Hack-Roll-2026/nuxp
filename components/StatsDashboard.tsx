import React, { useRef, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Edit3, Save, Lock, ArrowLeft, Eye, Clock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { UserProgress, Category, User } from '../types';
import { ACHIEVEMENTS, CATEGORY_COLORS, TROPHIES } from '../constants';
import { PixelatedCanvas } from './ui/pixelated-canvas';
import { TracingBeam } from './ui/tracing-beam';
import { MinecraftButton } from './MinecraftButton';

interface Props {
    progress: UserProgress;
    user: User | null;
    onLogout: () => void;
    onUpdateBio?: (newBio: string) => void;
    isReadOnly?: boolean;
    onBack?: () => void;
}

export const StatsDashboard: React.FC<Props> = ({
    progress,
    user,
    onLogout,
    onUpdateBio,
    isReadOnly = false,
    onBack
}) => {

    // Ref for the scrollable container to coordinate with TracingBeam
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState(user?.bio || "No status set.");
    const [isScrollReady, setIsScrollReady] = useState(false);

    useEffect(() => {
        setBioText(user?.bio || "No status set.");
    }, [user?.bio]);

    // Ensure scroll ref is ready before rendering TracingBeam
    useEffect(() => {
        if (scrollRef.current) {
            setIsScrollReady(true);
        }
    }, []);

    // Calculate stats by category
    const data = Object.values(Category).map(cat => {
        const totalInCat = ACHIEVEMENTS.filter(a => a.category === cat).length;
        const unlockedInCat = ACHIEVEMENTS.filter(a => a.category === cat && progress.unlockedIds.includes(a.id)).length;
        return {
            name: cat,
            value: unlockedInCat,
            total: totalInCat,
            color: CATEGORY_COLORS[cat] || '#888888'
        };
    }).filter(d => d.value > 0);

    const level = Math.floor(progress.totalXp / 100) + 1;

    // Get unlocked achievements sorted by most recently added (based on id array order assuming append)
    // For a real app, we would use a timestamp in UserProgress.unlockedIds if it were an object array.
    // Here we just reverse the array mapping.
    const recentUnlocks = [...progress.unlockedIds]
        .reverse()
        .map(id => ACHIEVEMENTS.find(a => a.id === id))
        .filter(a => a !== undefined) as typeof ACHIEVEMENTS;

    const handleSaveBio = () => {
        setIsEditingBio(false);
        if (onUpdateBio) onUpdateBio(bioText);
    };

    return (
        <div
            ref={scrollRef}
            className={`bg-black/80 backdrop-blur-xl border border-white/10 h-full flex flex-col rounded-lg shadow-2xl overflow-y-auto no-scrollbar relative pointer-events-auto ${isReadOnly ? 'border-mc-gold/50' : ''}`}
        >
            {/* TRACING BEAM WRAPPER for scroll tracking within the sidebar */}
            {isScrollReady && (
                <TracingBeam className="pt-4 pr-4" scrollContainerRef={scrollRef}>

                    {isReadOnly ? (
                        <div className="mb-4 space-y-2">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-mc-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-wider bg-black/50 p-2 rounded w-full border border-mc-gold/30 hover:bg-mc-gold/20"
                            >
                                <ArrowLeft size={16} /> Return to My Profile
                            </button>
                            <div className="bg-blue-900/40 border border-blue-500/30 p-2 rounded text-center text-blue-200 text-xs tracking-widest flex items-center justify-center gap-2">
                                <Eye size={12} /> SPECTATOR MODE
                            </div>
                        </div>
                    ) : (
                        <h3 className="text-2xl text-white border-b border-white/10 mb-4 pb-2 flex justify-between items-center">
                            <span className="tracking-wide">Student Profile</span>
                            <button onClick={onLogout} className="text-red-400 text-sm hover:text-red-300 transition-colors">[Quit]</button>
                        </h3>
                    )}

                    {/* User Avatar Section */}
                    <div className="bg-black/50 p-3 rounded border border-white/5 mb-6 flex flex-col gap-4 items-center shadow-inner">
                        <div
                            className="bg-black border border-white/20 w-[80px] h-[80px] shrink-0 overflow-hidden relative group rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-default"
                        >
                            {user ? (
                                <PixelatedCanvas
                                    src={user.avatarUrl}
                                    width={80}
                                    height={80}
                                    cellSize={4}
                                    dotScale={0.95}
                                    shape="square"
                                    interactive={true}
                                    distortionMode="swirl"
                                    distortionStrength={1.5}
                                    distortionRadius={30}
                                    sampleAverage={true}
                                    dropoutStrength={0}
                                    jitterStrength={0}
                                    followSpeed={0.2}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-900"></div>
                            )}
                        </div>

                        <div className="overflow-hidden text-center sm:text-left flex-1 min-w-0 w-full">
                            <h2 className="text-2xl text-white truncate font-bold">{user?.username || 'Player'}</h2>

                            <div className="text-mc-yellow text-sm tracking-wide">Year {user?.year} Student</div>
                            <h2>{user?.degree}</h2>
                        </div>
                    </div>

                    {/* Bio / Status Section */}
                    <div className="mb-6 relative group">
                        <div className="flex justify-between items-end mb-1">
                            <h4 className="text-gray-400 text-xs uppercase tracking-widest">Player Status</h4>
                            {!isReadOnly && !isEditingBio && (
                                <button onClick={() => setIsEditingBio(true)} className="text-gray-500 hover:text-white transition-colors">
                                    <Edit3 size={12} />
                                </button>
                            )}
                        </div>
                        {isEditingBio && !isReadOnly ? (
                            <div className="relative">
                                <textarea
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    className="w-full bg-black/50 text-white border border-mc-gold/50 p-2 text-sm font-pixel focus:outline-none focus:border-mc-gold h-20 resize-none rounded-sm"
                                    maxLength={120}
                                />
                                <button
                                    onClick={handleSaveBio}
                                    className="absolute bottom-2 right-2 text-green-400 hover:text-green-300 bg-black/80 rounded p-1"
                                >
                                    <Save size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="w-full bg-white/5 border border-white/5 p-3 text-sm text-gray-300 italic rounded-sm min-h-[3rem] relative"
                            >
                                "{bioText}"
                            </div>
                        )}
                    </div>

                    {/* Level Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-gray-300 text-sm mb-1">
                            <span>Level {level}</span>
                            <span>{progress.totalXp} XP</span>
                        </div>
                        <div className="w-full bg-black/60 h-6 border border-white/20 relative rounded-sm overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-600 to-green-500 h-full absolute left-0 top-0 transition-all duration-500"
                                style={{ width: `${Math.min(100, progress.totalXp % 100)}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white drop-shadow-md z-10 font-bold tracking-widest">
                                {progress.totalXp % 100} / 100
                            </div>
                        </div>
                    </div>

                    {/* Trophy Case */}
                    <div className="mb-6">
                        <h4 className="text-mc-gold text-center mb-2 tracking-wider text-lg flex items-center justify-center gap-2">
                            <span>🏆</span> Trophy Case
                        </h4>
                        <div className="bg-black/40 border-2 border-mc-border p-2 rounded-lg">
                            <div className="grid grid-cols-4 gap-2">
                                {TROPHIES.map(trophy => {
                                    const isUnlocked = progress.unlockedTrophies?.includes(trophy.id);
                                    const Icon = (Icons as any)[trophy.iconName] || Icons.Trophy;

                                    return (
                                        <div
                                            key={trophy.id}
                                            className={`
                                    aspect-square relative flex items-center justify-center border-2 rounded-sm group
                                    ${isUnlocked ? 'bg-white/5 border-white/10' : 'bg-black/60 border-white/5'}
                                `}
                                        >
                                            <Icon
                                                size={20}
                                                color={isUnlocked ? trophy.color : '#333'}
                                                className={`transition-all duration-300 ${isUnlocked ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'opacity-30'}`}
                                            />

                                            {/* Tooltip */}
                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 bg-black border border-mc-gold text-center p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                <p className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{trophy.title}</p>
                                                <p className="text-xs text-gray-400 leading-tight mt-1">{isUnlocked ? trophy.description : "???"}</p>
                                            </div>

                                            {!isUnlocked && <Lock size={10} className="absolute top-1 right-1 text-gray-700" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats Chart */}
                    <div className="min-h-[200px] relative bg-black/20 border border-white/5 rounded-lg p-2 mb-6">
                        <h4 className="text-gray-300 text-center mb-2 tracking-wider text-lg">Breakdown</h4>
                        {data.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                                Unlock achievements to generate stats...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={50}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px', fontFamily: 'VT323', color: 'white' }}
                                        itemStyle={{ color: '#ccc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="text-center text-gray-500 text-sm pb-2 border-b border-white/10 mb-4">
                        {progress.unlockedIds.length} / {ACHIEVEMENTS.length} Achievements Unlocked
                    </div>

                    {/* Unlock History List */}
                    <div className="space-y-2">
                        <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Clock size={12} /> Recent History
                        </h4>
                        {recentUnlocks.length === 0 ? (
                            <p className="text-center text-gray-600 text-xs py-4">No data.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentUnlocks.map((ach) => (
                                    <div key={ach.id} className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/5 animate-in slide-in-from-left duration-300">
                                        <div className={`p-1 rounded bg-[${CATEGORY_COLORS[ach.category]}]/20`}>
                                            {React.createElement((Icons as any)[ach.iconName] || Icons.Check, { size: 14, className: 'text-white' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm truncate leading-none">{ach.title}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{ach.category}</p>
                                        </div>
                                        <span className="text-xs text-green-400">+{ach.xp}xp</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Padding for bottom scrolling */}
                    <div className="h-10"></div>

                </TracingBeam>
            )}
        </div>
    );
};