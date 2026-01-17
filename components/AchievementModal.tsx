import React, { useEffect, useState, useRef } from 'react';
import { X, Lock, User as UserIcon, BookOpen, MessageSquare, Camera, Video, Type, Upload, Edit3, Save, Trash2 } from 'lucide-react';
import { Achievement, AchievementType, GuestbookEntry, AchievementProof } from '../types';
import { MinecraftButton } from './MinecraftButton';
import { AchievementIcon } from './AchievementIcon';
import { getStoredUser } from '../services/authService';
import { PixelatedCanvas } from './ui/pixelated-canvas';

interface Props {
  achievement: Achievement;
  onClose: () => void;
  status: 'UNLOCKED' | 'READY' | 'LOCKED';
  onUnlock: (id: string, proof?: AchievementProof) => void;
  onUpdateProof?: (id: string, proof: AchievementProof) => void;
  parentTitle?: string;
  existingProof?: AchievementProof;
}

export const AchievementModal: React.FC<Props> = ({ achievement, onClose, status, onUnlock, onUpdateProof, parentTitle, existingProof }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'MEMORY' | 'GUESTBOOK'>('INFO');
  
  // Use the lore directly from the achievement
  const lore = achievement.lore || 'The ancient scrolls are silent on this matter.';
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Separate states for text and media to allow both
  const [proofText, setProofText] = useState('');
  const [proofMedia, setProofMedia] = useState(''); 
  const [proofMediaType, setProofMediaType] = useState<'IMAGE' | 'VIDEO' | undefined>(undefined);

  const [uploadError, setUploadError] = useState('');
  
  // Guestbook State
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [localGuestbook, setLocalGuestbook] = useState<GuestbookEntry[]>(achievement.guestbook || []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getStoredUser();

  const handleTabChange = (tab: 'INFO' | 'MEMORY' | 'GUESTBOOK') => {
      setActiveTab(tab);
      // Pre-fill form if switching to Memory tab for editing
      if (tab === 'MEMORY' && existingProof) {
          setProofText(existingProof.text || '');
          setProofMedia(existingProof.media || '');
          setProofMediaType(existingProof.mediaType);
      } else if (tab === 'MEMORY' && !existingProof) {
          setProofText('');
          setProofMedia('');
          setProofMediaType(undefined);
      }
  };

  const handleSignGuestbook = (e: React.FormEvent) => {
      e.preventDefault();
      if (!guestbookMessage.trim() || !currentUser) return;

      const newEntry: GuestbookEntry = {
          username: currentUser.username,
          message: guestbookMessage,
          date: 'Just now',
          avatarSeed: currentUser.avatarUrl
      };

      setLocalGuestbook([newEntry, ...localGuestbook]);
      setGuestbookMessage('');
  };

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

  const handleComplete = () => {
      if (isSubmitting) {
          onUnlock(achievement.id, constructProof());
      } else {
          setIsSubmitting(true);
      }
  };

  const handleUpdate = () => {
      if (onUpdateProof) {
          const proof = constructProof();
          if (proof) {
             onUpdateProof(achievement.id, proof);
             setActiveTab('INFO'); 
          }
      }
  };

  const frameTitle = achievement.type === AchievementType.CHALLENGE ? 'Challenge Complete!' : 'Advancement Made!';
  const isUnlocked = status === 'UNLOCKED';
  const isLocked = status === 'LOCKED';

  // Render Form Logic (Shared between Initial Unlock and Editing)
  const renderSubmissionForm = (isEditMode: boolean) => (
      <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-black/40 border border-mc-gold/30 p-4 rounded text-center">
                <p className="text-gray-300 mb-2">{isEditMode ? "Update your memory:" : "Capture this moment (Optional):"}</p>
                
                {/* 1. TEXT INPUT */}
                <textarea 
                    className="w-full bg-black/50 border border-gray-600 p-2 text-white text-sm rounded focus:border-mc-gold focus:outline-none mb-4"
                    rows={3}
                    placeholder="Describe your experience..."
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    maxLength={140}
                />

                {/* 2. MEDIA INPUT */}
                <div className="border-t border-white/10 pt-4">
                    {!proofMedia ? (
                        <div className="flex gap-4 justify-center">
                            <label className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
                                <Camera size={20} className="text-mc-gold" />
                                <span className="text-[10px] text-gray-400">ADD PHOTO</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'IMAGE')} />
                            </label>
                            <label className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
                                <Video size={20} className="text-mc-gold" />
                                <span className="text-[10px] text-gray-400">ADD VIDEO</span>
                                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'VIDEO')} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative inline-block border border-gray-600 rounded bg-black">
                             {proofMediaType === 'IMAGE' && <img src={proofMedia} alt="Preview" className="max-h-32 rounded opacity-80" />}
                             {proofMediaType === 'VIDEO' && <video src={proofMedia} controls className="max-h-32 rounded opacity-80" />}
                             <button 
                                onClick={() => { setProofMedia(''); setProofMediaType(undefined); }} 
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 shadow-md"
                             >
                                 <Trash2 size={12}/>
                             </button>
                        </div>
                    )}
                </div>

                {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
            </div>
            
            <div className="flex gap-2">
                {isEditMode ? (
                     <MinecraftButton onClick={handleUpdate} variant="green" className="w-full flex justify-center items-center gap-2">
                        <Save size={16} /> SAVE CHANGES
                     </MinecraftButton>
                ) : (
                    <>
                        <button onClick={() => setIsSubmitting(false)} className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600">CANCEL</button>
                        <MinecraftButton onClick={handleComplete} variant="green" className="flex-1">CONFIRM & UNLOCK</MinecraftButton>
                    </>
                )}
            </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      
      <div className={`relative w-full max-w-lg bg-neutral-900 border-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden flex flex-col max-h-[90vh] ${isLocked ? 'border-gray-700' : 'border-mc-gold shadow-[0_0_40px_rgba(212,175,55,0.3)]'}`}>
            
            <div className={`p-4 flex justify-between items-center text-white border-b ${isLocked ? 'bg-neutral-800 border-gray-700' : 'bg-black/80 border-mc-goldDim'}`}>
                <span className={`text-xl sm:text-2xl drop-shadow-md tracking-wide flex items-center gap-2 ${isLocked ? 'text-gray-400' : 'text-mc-yellow'}`}>
                    {isUnlocked && <span className="text-mc-green">★</span>}
                    {isLocked && <Lock size={20} />}
                    {isUnlocked ? frameTitle : (isLocked ? 'Locked Achievement' : (isSubmitting ? 'Capture Memory' : 'Available Quest'))}
                </span>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-red-400 transition-colors pointer-events-auto p-1 hover:bg-white/10 rounded"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-grid-pattern relative flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-mc-gold/5 to-transparent pointer-events-none"></div>

                <div className="p-6 pb-2 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    <div className="flex-shrink-0 pt-2 transform hover:scale-105 transition-transform duration-300">
                        <AchievementIcon 
                            iconName={achievement.iconName} 
                            type={achievement.type} 
                            category={achievement.category}
                            unlocked={isUnlocked} 
                            size={48}
                        />
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                        <h2 className={`text-3xl font-bold leading-none drop-shadow-sm ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                            {achievement.title}
                        </h2>
                        <p className={`text-xl leading-snug ${isLocked ? 'text-gray-600' : 'text-gray-300'}`}>
                            {isLocked ? '???' : achievement.description}
                        </p>
                    </div>
                </div>

                {isUnlocked && !isSubmitting && (
                    <div className="flex px-6 mt-4 border-b border-white/10 relative z-20 overflow-x-auto">
                        <button 
                            onClick={() => handleTabChange('INFO')}
                            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'INFO' ? 'text-mc-gold border-b-2 border-mc-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <BookOpen size={16} /> INFO
                        </button>
                        <button 
                            onClick={() => handleTabChange('MEMORY')}
                            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'MEMORY' ? 'text-mc-gold border-b-2 border-mc-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Edit3 size={16} /> MEMORY
                        </button>
                        <button 
                            onClick={() => handleTabChange('GUESTBOOK')}
                            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'GUESTBOOK' ? 'text-mc-gold border-b-2 border-mc-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <MessageSquare size={16} /> SIGNED ({localGuestbook.length})
                        </button>
                    </div>
                )}
            
                <div className="p-6 pt-4 relative z-10 flex-1">
                    
                    {isSubmitting && !isUnlocked && renderSubmissionForm(false)}

                    {activeTab === 'MEMORY' && isUnlocked && !isSubmitting && renderSubmissionForm(true)}

                    {activeTab === 'INFO' && !isSubmitting && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                             {/* Proof Display (If exists and unlocked) */}
                             {isUnlocked && existingProof && (
                                 <div className="mb-4 bg-black/60 border border-mc-gold p-3 rounded relative group flex gap-3">
                                     <div className="absolute -top-2 -right-2 bg-mc-gold text-black text-[10px] font-bold px-2 py-0.5 rounded rotate-3">MEMORY</div>
                                     
                                     {existingProof.media && (
                                         <div className="w-1/3 shrink-0">
                                            {existingProof.mediaType === 'IMAGE' && <img src={existingProof.media} alt="Proof" className="w-full h-24 object-cover rounded border border-white/20" />}
                                            {existingProof.mediaType === 'VIDEO' && <video src={existingProof.media} controls className="w-full h-24 object-cover rounded border border-white/20" />}
                                         </div>
                                     )}
                                     
                                     {existingProof.text && (
                                         <div className="flex-1 text-sm italic text-gray-300 flex items-center">
                                             "{existingProof.text}"
                                         </div>
                                     )}
                                 </div>
                             )}

                            {!isLocked && (
                                <div className="relative w-full bg-black/40 p-4 border border-mc-goldDim/50 rounded-lg shadow-inner">
                                    <p className="text-gray-300 text-lg font-mono italic">
                                        <span className="text-mc-yellow opacity-90">"{lore}"</span>
                                    </p>
                                </div>
                            )}
                            
                            {isLocked && (
                                <div className="relative z-10 w-full bg-red-900/20 p-4 border border-red-900/50 rounded-lg flex items-center gap-3">
                                    <Lock className="text-red-400" size={24} />
                                    <div>
                                        <p className="text-red-300 font-bold uppercase text-sm tracking-wider">Locked</p>
                                        <p className="text-gray-400 text-sm">Requires: <span className="text-white font-bold">{parentTitle || 'Previous Achievement'}</span></p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-white/5 p-3 border border-white/10 rounded h-full">
                                    <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500 font-bold mb-1">Global Unlock</p>
                                    <p className="text-2xl text-blue-400">{achievement.globalCompletionRate}%</p>
                                </div>
                                <div className="bg-white/5 p-3 border border-white/10 rounded h-full">
                                    <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500 font-bold mb-1">Reward</p>
                                    <p className="text-2xl text-green-400">+{achievement.xp} XP</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'GUESTBOOK' && isUnlocked && !isSubmitting && (
                         <div className="space-y-4 h-[300px] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex-1 bg-black/40 border-2 border-white/10 rounded-sm p-4 overflow-y-auto space-y-3 shadow-inner">
                                {localGuestbook.length === 0 ? (
                                    <div className="text-center text-gray-600 italic py-10">
                                        Be the first to sign this achievement!
                                    </div>
                                ) : (
                                    localGuestbook.map((entry, i) => (
                                        <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-2 last:border-0">
                                            <div className="w-8 h-8 bg-gray-800 rounded-sm overflow-hidden flex-shrink-0">
                                                 {entry.avatarSeed ? (
                                                    <PixelatedCanvas 
                                                        src={typeof entry.avatarSeed === 'string' ? entry.avatarSeed : ''}
                                                        width={32} height={32} cellSize={4}
                                                        interactive={false}
                                                    />
                                                 ) : (
                                                     <div className="w-full h-full bg-blue-500"></div>
                                                 )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 flex gap-2">
                                                    <span className="text-mc-gold font-bold">{entry.username}</span>
                                                    <span>{entry.date}</span>
                                                </p>
                                                <p className="text-gray-300 text-sm leading-tight">"{entry.message}"</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <form onSubmit={handleSignGuestbook} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Leave a mark..." 
                                    className="flex-1 bg-black/50 border border-white/20 p-2 text-sm text-white focus:outline-none focus:border-mc-gold rounded-sm"
                                    maxLength={40}
                                    value={guestbookMessage}
                                    onChange={(e) => setGuestbookMessage(e.target.value)}
                                />
                                <button type="submit" className="bg-mc-gold text-black px-3 py-2 font-bold rounded-sm hover:bg-yellow-400">
                                    SIGN
                                </button>
                            </form>
                         </div>
                    )}
                </div>

                {activeTab === 'INFO' && !isSubmitting && (
                    <div className="w-full flex justify-end p-6 pt-0 relative z-10">
                        {isUnlocked ? (
                            <div className="w-full sm:w-auto flex justify-center items-center text-mc-gold font-bold text-2xl drop-shadow-sm bg-mc-gold/10 px-6 py-2 rounded border border-mc-gold/50">
                                <span>✓ COMPLETED</span>
                            </div>
                        ) : (
                            <MinecraftButton 
                                onClick={() => !isLocked && handleComplete()} 
                                variant={isLocked ? "disabled" : "green"}
                                className="w-full sm:w-auto shadow-lg"
                                disabled={isLocked}
                            >
                                {isLocked ? "LOCKED" : "COMPLETE ACHIEVEMENT"}
                            </MinecraftButton>
                        )}
                    </div>
                )}

            </div>
      </div>
    </div>
  );
};