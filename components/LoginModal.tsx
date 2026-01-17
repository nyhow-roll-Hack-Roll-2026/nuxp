import React, { useState, useRef } from 'react';
import { Upload, Mail, Lock, User } from 'lucide-react';
import { MinecraftButton } from './MinecraftButton';
import { PixelatedCanvas } from './ui/pixelated-canvas';
import { AVATARS } from '../constants';
import { createClient } from '../src/lib/supabase/client';

// Only create Supabase client if env vars are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase = supabaseUrl ? createClient() : null;

interface Props {
  onLogin: (username: string, avatarUrl: string, isCustomAvatar: boolean) => void;
}

export const LoginModal: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'guest'>(supabase ? 'login' : 'guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!supabase) {
      setError('Supabase not configured. Please use guest mode.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setError('Please enter a username');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              avatar_url: selectedAvatar
            }
          }
        });
        
        if (error) throw error;
        if (data.user) {
          onLogin(username, selectedAvatar, isCustom);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        if (data.user) {
          const displayName = data.user.user_metadata?.username || email.split('@')[0];
          const avatarUrl = data.user.user_metadata?.avatar_url || selectedAvatar;
          onLogin(displayName, avatarUrl, false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
        setIsShaking(true);
        setError('Please enter a username to start!');
        setTimeout(() => setIsShaking(false), 500);
        return;
    }
    
    setLoading(true);
    onLogin(username, selectedAvatar, isCustom);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Check size (limit to 2MB for localStorage safety in this demo)
          if (file.size > 2 * 1024 * 1024) {
              setError("File is too large! Max 2MB.");
              return;
          }
          
          const reader = new FileReader();
          reader.onloadend = () => {
             const result = reader.result as string;
             setSelectedAvatar(result);
             setIsCustom(true);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSelectDefault = (url: string) => {
      setSelectedAvatar(url);
      setIsCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 bg-grid-pattern">
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
      <div className="w-full max-w-md p-1">
        
        {/* Minecraft Logo Style Title */}
        <div className="text-center mb-8 relative">
            <h1 className="text-6xl text-gray-800 font-bold absolute top-1 left-1 w-full select-none opacity-50">NUXP</h1>
            <h1 className="text-6xl text-white font-bold relative z-10 select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">NUXP</h1>
            <p className="text-yellow-400 mt-2 animate-bounce text-xl tracking-wider">Surviving the Bell Curve!</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg">
            
            {/* Mode Tabs */}
            <div className="flex mb-6 bg-black/40 rounded-lg p-1">
              {supabase && (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'login' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    LOGIN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'signup' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    SIGN UP
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => { setMode('guest'); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'guest' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
              >
                GUEST
              </button>
            </div>

            <form onSubmit={mode === 'guest' ? handleGuestLogin : handleSupabaseAuth} className="space-y-6">
                
                {/* Avatar Selection */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="border border-white/20 bg-black/50 rounded-lg overflow-hidden p-1">
                            <PixelatedCanvas 
                                src={selectedAvatar} 
                                width={120} 
                                height={120} 
                                cellSize={5} // Tighter grid for better preview
                                dotScale={0.9}
                                shape="square"
                                distortionStrength={1.5} // REDUCED from 2 to 1.5
                                distortionRadius={50}
                                distortionMode="swirl" // Swirl as requested
                                sampleAverage={true} // High Quality Resampling
                                dropoutStrength={0} // Clean preview, no noise
                                followSpeed={0.2}
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-center w-full">
                        <div className="flex gap-2 justify-center">
                            {AVATARS.map((url, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectDefault(url)}
                                    className={`w-10 h-10 border-2 rounded ${selectedAvatar === url && !isCustom ? 'border-green-500 bg-white/10' : 'border-gray-700 bg-black/40'} hover:border-gray-400 transition-colors`}
                                >
                                    <img src={url} alt="avatar option" className="w-full h-full pixelated" />
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-2 w-full justify-center border-t border-white/10 pt-2 mt-1">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center gap-2 text-sm px-3 py-1 rounded transition-colors ${isCustom ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/20'}`}
                            >
                                <Upload size={14} />
                                {isCustom ? 'Custom Skin Loaded' : 'Upload Custom Skin'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email & Password (for login/signup modes) */}
                {mode !== 'guest' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-lg tracking-wide flex items-center gap-2">
                        <Mail size={16} /> Email
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                        className="w-full bg-black/50 text-white border border-gray-700 p-3 text-lg focus:outline-none focus:border-mc-gold placeholder-gray-600 rounded"
                        placeholder="steve@nus.edu.sg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-lg tracking-wide flex items-center gap-2">
                        <Lock size={16} /> Password
                      </label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                        className="w-full bg-black/50 text-white border border-gray-700 p-3 text-lg focus:outline-none focus:border-mc-gold placeholder-gray-600 rounded"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Username Input (for signup and guest modes) */}
                {(mode === 'signup' || mode === 'guest') && (
                <div>
                    <label className="block text-gray-300 mb-2 text-lg tracking-wide flex items-center gap-2">
                      <User size={16} /> Username
                    </label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (error) setError('');
                        }}
                        className={`w-full bg-black/50 text-white border p-3 text-lg focus:outline-none placeholder-gray-600 rounded ${error ? 'border-red-500 animate-pulse' : 'border-gray-700 focus:border-mc-gold'}`}
                        placeholder="Steve"
                        maxLength={12}
                    />
                </div>
                )}

                {error && <p className="text-red-400 text-lg text-center">{error}</p>}

                <div style={{ animation: isShaking ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none' }}>
                    <MinecraftButton 
                        type="submit" 
                        className="w-full h-14 text-2xl shadow-lg"
                        variant={loading ? 'disabled' : 'green'}
                        disabled={loading}
                    >
                        {loading ? 'CONNECTING...' : (
                          mode === 'login' ? 'LOGIN' : 
                          mode === 'signup' ? 'CREATE ACCOUNT' : 
                          'PLAY AS GUEST'
                        )}
                    </MinecraftButton>
                </div>

                {mode === 'guest' && (
                  <p className="text-gray-500 text-sm text-center">
                    Guest progress is saved locally only. Create an account to sync across devices!
                  </p>
                )}
            </form>
        </div>
      </div>
    </div>
  );
};