import React, { useState, useMemo } from 'react';
import { X, Check, Lock, List, Filter, Search, Users } from 'lucide-react';
import { ACHIEVEMENTS, CATEGORY_COLORS } from '../constants';
import { Achievement, AchievementType, Category, UserProgress } from '../types';
import * as Icons from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelectAchievement: (achievement: Achievement) => void;
  progress: UserProgress;
}

export const AchievementListModal: React.FC<Props> = ({ onClose, onSelectAchievement, progress }) => {
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(ach => {
      const matchesCategory = filterCategory === 'ALL' || ach.category === filterCategory;
      const isUnlocked = progress.unlockedIds.includes(ach.id);
      const matchesStatus = 
        filterStatus === 'ALL' ? true :
        filterStatus === 'UNLOCKED' ? isUnlocked :
        !isUnlocked;

      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || ach.title.toLowerCase().includes(q) || ach.description.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [filterCategory, filterStatus, searchQuery, progress.unlockedIds]);

  const stats = useMemo(() => {
      const total = ACHIEVEMENTS.length;
      const unlocked = progress.unlockedIds.length;
      const percentage = Math.round((unlocked / total) * 100);
      return { total, unlocked, percentage };
  }, [progress.unlockedIds]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border-2 border-mc-gold shadow-[0_0_50px_rgba(212,175,55,0.2)] rounded-lg overflow-hidden flex flex-col h-[85vh]">
            
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-black/80 border-b border-mc-goldDim flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-mc-gold/20 p-2 rounded">
                        <List className="text-mc-gold" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl text-white font-bold tracking-wide drop-shadow-md">QUEST LOG</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">
                            {stats.unlocked} / {stats.total} Completed ({stats.percentage}%)
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-black/40 border-b border-white/10 p-3 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                
                {/* Search Bar */}
                <div className="relative flex-1 w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search quests..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 text-white text-sm rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-mc-gold"
                    />
                    <Search className="absolute left-2.5 top-2 text-gray-500" size={14} />
                </div>

                {/* Right side controls */}
                <div className="flex gap-4 w-full sm:w-auto items-center overflow-hidden">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setFilterCategory('ALL')}
                            className={`px-3 py-1 text-xs font-bold rounded border ${filterCategory === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                        >
                            ALL
                        </button>
                        {Object.values(Category).map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1 text-xs font-bold rounded border transition-colors whitespace-nowrap`}
                                style={{ 
                                    backgroundColor: filterCategory === cat ? CATEGORY_COLORS[cat] : 'transparent',
                                    color: filterCategory === cat ? '#fff' : '#888',
                                    borderColor: filterCategory === cat ? CATEGORY_COLORS[cat] : '#333'
                                }}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 bg-black/60 p-1 rounded border border-white/10 shrink-0">
                        <Filter size={14} className="text-gray-500 ml-2" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-transparent text-xs text-white focus:outline-none font-bold uppercase p-1 cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UNLOCKED">Completed</option>
                            <option value="LOCKED">Locked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto bg-black/20 p-2 sm:p-4 space-y-2 relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                
                {filteredAchievements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                        <List size={48} className="mb-4" />
                        <p>No quests found matching this criteria.</p>
                    </div>
                ) : (
                    filteredAchievements.map((ach) => {
                        const isUnlocked = progress.unlockedIds.includes(ach.id);
                        const Icon = (Icons as any)[ach.iconName] || Icons.HelpCircle;
                        const catColor = CATEGORY_COLORS[ach.category];

                        return (
                            <div 
                                key={ach.id}
                                onClick={() => {
                                    onSelectAchievement(ach);
                                    onClose();
                                }}
                                className={`
                                    relative group flex items-center gap-4 p-3 rounded border-2 cursor-pointer transition-all duration-200
                                    ${isUnlocked 
                                        ? 'bg-black/40 border-white/10 hover:border-mc-gold/50 hover:bg-white/5' 
                                        : 'bg-black/60 border-transparent hover:border-gray-700 opacity-70 hover:opacity-100'}
                                `}
                            >
                                {/* Left Color Strip */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1" 
                                    style={{ backgroundColor: isUnlocked ? catColor : '#333' }}
                                ></div>

                                {/* Icon Box */}
                                <div className={`w-12 h-12 shrink-0 rounded flex items-center justify-center border ${isUnlocked ? 'bg-black border-white/20' : 'bg-[#1a1a1a] border-[#333]'}`}>
                                    <Icon 
                                        size={24} 
                                        color={isUnlocked ? catColor : '#555'} 
                                        strokeWidth={isUnlocked ? 2 : 1.5}
                                    />
                                </div>

                                {/* Text Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-bold text-lg truncate ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                            {ach.title}
                                        </h3>
                                        {ach.type === AchievementType.COOP && (
                                            <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                                <Users size={10} /> CO-OP
                                            </span>
                                        )}
                                        {isUnlocked && <Check size={16} className="text-green-500 shrink-0" />}
                                        {!isUnlocked && <Lock size={14} className="text-gray-600 shrink-0" />}
                                    </div>
                                    <p className={`text-sm truncate ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {ach.description}
                                    </p>
                                </div>

                                {/* Metadata (Right side) */}
                                <div className="hidden sm:flex flex-col items-end gap-1 text-right">
                                    <span 
                                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                                        style={{ 
                                            color: isUnlocked ? catColor : '#555',
                                            borderColor: isUnlocked ? catColor : '#333',
                                            backgroundColor: isUnlocked ? `${catColor}10` : 'transparent'
                                        }}
                                    >
                                        {ach.category}
                                    </span>
                                    <span className={`text-xs ${isUnlocked ? 'text-green-400' : 'text-gray-600'}`}>
                                        {ach.xp} XP
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
      </div>
    </div>
  );
};