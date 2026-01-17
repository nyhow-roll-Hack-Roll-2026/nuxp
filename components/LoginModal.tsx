import React, { useState, useRef } from 'react';
import { Upload, Mail, Lock, User } from 'lucide-react';
import { MinecraftButton } from './MinecraftButton';
import { PixelatedCanvas } from './ui/pixelated-canvas';
import { AVATARS } from '../constants';
import { createClient } from '../src/lib/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Only create Supabase client if env vars are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabase = supabaseUrl ? createClient() : null;

interface Props {
    onLogin: (username: string, avatarUrl: string, isCustomAvatar: boolean) => void;
}

export const LoginModal: React.FC<Props> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(supabase ? 'login' : 'guest');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('')
    const [yearOfStudy, setYearOfStudy] = useState('')
    const [degree, setDegree] = useState('')
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

        if (mode === 'signup' && (!yearOfStudy || !degree)) {
            setError('Please select your year of study and degree');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                console.log('=== Starting Signup Process ===');
                console.log('Email:', email);
                console.log('Year of Study:', yearOfStudy);
                console.log('Degree:', degree);
                
                // Sign up the user without email confirmation for development
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                            avatar_url: selectedAvatar,
                            year_of_study: parseInt(yearOfStudy),
                            degree: degree
                        }
                    }
                });

                console.log('Signup response:', { data, error });

                if (error) {
                    console.error('Signup error:', error);
                    throw error;
                }

                // Check if user already exists (Supabase returns user but with identities empty)
                if (data.user && !data.user.identities?.length) {
                    setError('This email is already registered. Please try logging in instead.');
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 500);
                    setLoading(false);
                    return;
                }

                if (data.user && data.session) {
                    console.log('User created successfully:', data.user.id);
                    console.log('Session established:', data.session);
                    
                    // Wait for auth to settle
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Insert profile with all required fields
                    console.log('Creating profile...');
                    const { data: insertData, error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            username: username,
                            avatar_url: selectedAvatar,
                            bio: null,
                            year: parseInt(yearOfStudy),
                            degree: degree,
                            total_xp: 0,
                            unlocked_ids: [],
                            unlocked_trophies: [],
                            proofs: {}
                        })
                        .select();
                    
                    if (profileError) {
                        console.error('Profile error details:', {
                            message: profileError.message,
                            details: profileError.details,
                            hint: profileError.hint,
                            code: profileError.code
                        });
                        setError(`Failed to create profile: ${profileError.message}. You can still use the app but your data won't be saved.`);
                    } else {
                        console.log('Profile created successfully!', insertData);
                    }

                    onLogin(username, selectedAvatar, isCustom);
                } else if (data.user && !data.session) {
                    // Email confirmation required
                    setError('Please check your email to confirm your account before logging in.');
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 500);
                    setLoading(false);
                    return;
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
            // Check for specific error messages
            let errorMessage = err.message || 'Authentication failed';

            if (mode === 'signup' && (
                err.message?.includes('User already registered') ||
                err.message?.includes('already registered') ||
                err.message?.includes('already been registered')
            )) {
                errorMessage = 'This email is already registered. Please try logging in instead.';
            }

            setError(errorMessage);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        } finally {
            setLoading(false);
        }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 bg-grid-pattern overflow-y-auto my-6">
            <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
            <div className="h-full w-full max-w-md p-1">

                {/* Minecraft Logo Style Title */}
                <div className="h-fit text-center mb-8 relative">
                    <h1 className="text-6xl text-gray-800 font-bold absolute top-1 left-1 w-full select-none opacity-50">NUS Achievements</h1>
                    <h1 className="text-6xl text-white font-bold relative z-10 select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">NUS Achievements</h1>
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
                                    className={`flex-1 py-2 text-xl font-bold rounded-md transition-all ${mode === 'login' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    LOGIN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode('signup'); setError(''); }}
                                    className={`flex-1 py-2 text-xl font-bold rounded-md transition-all ${mode === 'signup' ? 'bg-mc-gold text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    SIGN UP
                                </button>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSupabaseAuth} className="space-y-6">
                        {/* Email & Password (for login/signup modes) */}

                        {(mode === 'signup') && (
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
                                            className={`flex items-center gap-2 text-xl px-3 py-1 rounded transition-colors ${isCustom ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/20'}`}
                                        >
                                            <Upload size={14} />
                                            {isCustom ? 'Custom Skin Loaded' : 'Upload Custom Skin'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <label className="block text-gray-300 text-xl tracking-wide flex items-center gap-2">
                                    <Mail size={16} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                                    className="w-full bg-black/50 text-white border border-gray-700 p-3 text-xl focus:outline-none focus:border-mc-gold placeholder-gray-600 rounded tracking-wide"
                                    placeholder="quackers@u.nus.edu"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="block text-gray-300 text-xl tracking-wide flex items-center gap-2">
                                    <Lock size={16} /> Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                                    className="w-full bg-black/50 text-white border border-gray-700 p-3 text-xl focus:outline-none focus:border-mc-gold placeholder-gray-600 rounded tracking-wide"
                                    placeholder="quackers secret password!"
                                />
                            </div>
                        </div>

                        {/* Username Input (for signup modes) */}
                        {(mode === 'signup') && (
                            <div className="space-y-6">
                                <div className="grid gap-2">
                                    <Label className="text-xl text-gray-300 tracking-wide flex items-center gap-2" htmlFor="year">
                                        Year of Study
                                    </Label>
                                    <Select value={yearOfStudy} onValueChange={setYearOfStudy} required>
                                        <SelectTrigger className="h-12 !text-xl bg-black/50 border-gray-700 focus:border-mc-gold">
                                            <SelectValue placeholder="Select your year" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black">
                                            <SelectItem value="1">Year 1</SelectItem>
                                            <SelectItem value="2">Year 2</SelectItem>
                                            <SelectItem value="3">Year 3</SelectItem>
                                            <SelectItem value="4">Year 4</SelectItem>
                                            <SelectItem value="5">Year 5+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xl text-gray-300 tracking-wide flex items-center gap-2" htmlFor="degree">
                                        Degree
                                    </Label>
                                    <Select value={degree} onValueChange={setDegree} required>
                                        <SelectTrigger className="h-12 !text-xl bg-black/50 border-gray-700 focus:border-mc-gold">
                                            <SelectValue placeholder="Select your degree" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black">
                                            <SelectItem value="Applied Science">Applied Science</SelectItem>
                                            <SelectItem value="Architecture">Architecture</SelectItem>
                                            <SelectItem value="Art History">Art History</SelectItem>
                                            <SelectItem value="Biomedical Engineering">Biomedical Engineering</SelectItem>
                                            <SelectItem value="Business Administration">Business Administration</SelectItem>
                                            <SelectItem value="Business Administration (Accountancy)">Business Administration (Accountancy)</SelectItem>
                                            <SelectItem value="Business Analytics">Business Analytics</SelectItem>
                                            <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                                            <SelectItem value="Chinese Studies">Chinese Studies</SelectItem>
                                            <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                                            <SelectItem value="Communications & New Media">Communications & New Media</SelectItem>
                                            <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Data Science & Analytics">Data Science & Analytics</SelectItem>
                                            <SelectItem value="Dentistry">Dentistry</SelectItem>
                                            <SelectItem value="Economics">Economics</SelectItem>
                                            <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                            <SelectItem value="Engineering Science">Engineering Science</SelectItem>
                                            <SelectItem value="English Language & Literature">English Language & Literature</SelectItem>
                                            <SelectItem value="Environmental Engineering">Environmental Engineering</SelectItem>
                                            <SelectItem value="Environmental Studies">Environmental Studies</SelectItem>
                                            <SelectItem value="Food Science & Technology">Food Science & Technology</SelectItem>
                                            <SelectItem value="Geography">Geography</SelectItem>
                                            <SelectItem value="Global Studies">Global Studies</SelectItem>
                                            <SelectItem value="History">History</SelectItem>
                                            <SelectItem value="Industrial & Systems Engineering">Industrial & Systems Engineering</SelectItem>
                                            <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                                            <SelectItem value="Information Systems">Information Systems</SelectItem>
                                            <SelectItem value="Japanese Studies">Japanese Studies</SelectItem>
                                            <SelectItem value="Landscape Architecture">Landscape Architecture</SelectItem>
                                            <SelectItem value="Law">Law</SelectItem>
                                            <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                            <SelectItem value="Malay Studies">Malay Studies</SelectItem>
                                            <SelectItem value="Materials Science & Engineering">Materials Science & Engineering</SelectItem>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                            <SelectItem value="Medicine">Medicine</SelectItem>
                                            <SelectItem value="Music">Music</SelectItem>
                                            <SelectItem value="Nursing">Nursing</SelectItem>
                                            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                            <SelectItem value="Philosophy">Philosophy</SelectItem>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="Political Science">Political Science</SelectItem>
                                            <SelectItem value="Project & Facilities Management">Project & Facilities Management</SelectItem>
                                            <SelectItem value="Psychology">Psychology</SelectItem>
                                            <SelectItem value="Quantitative Finance">Quantitative Finance</SelectItem>
                                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                                            <SelectItem value="Social Work">Social Work</SelectItem>
                                            <SelectItem value="South Asian Studies">South Asian Studies</SelectItem>
                                            <SelectItem value="Southeast Asian Studies">Southeast Asian Studies</SelectItem>
                                            <SelectItem value="Statistics">Statistics</SelectItem>
                                            <SelectItem value="Theatre Studies">Theatre Studies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="block text-gray-300 text-xl tracking-wide flex items-center gap-2">
                                        <User size={16} /> Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (error) setError('');
                                        }}
                                        className={`w-full bg-black/50 text-white border p-3 text-xl focus:outline-none placeholder-gray-600 rounded tracking-wide ${error ? 'border-red-500 animate-pulse' : 'border-gray-700 focus:border-mc-gold'}`}
                                        placeholder="Steve"
                                        maxLength={12}
                                    />
                                </div>
                            </div>
                        )}

                        {error && <p className="text-red-400 text-lg leading-snug text-center">{error}</p>}

                        <div style={{ animation: isShaking ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none' }}>
                            <MinecraftButton
                                type="submit"
                                className="w-full h-14 text-2xl shadow-lg"
                                variant={loading ? 'disabled' : 'green'}
                                disabled={loading}
                            >
                                {loading ? 'CONNECTING...' : (
                                    mode === 'login' ? 'LOGIN' :
                                        'CREATE ACCOUNT'
                                )}
                            </MinecraftButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};