
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { useNavigate } from '../router';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '../types';
import { AlertTriangle, Construction, Copy, Check, RefreshCw, Code2, Loader2, ShieldAlert } from 'lucide-react';
import { NeuCard, NeuButton, NeuInput } from '../components/Neu';

export const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState<'client' | 'admin'>('client');

    // ... (Keep existing login logic functions unchanged) ...
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    id: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL,
                    role: UserRole.CLIENT, createdAt: serverTimestamp()
                });
            }
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/unauthorized-domain') setUnauthorizedDomain(window.location.hostname);
            else setError(err.message);
        } finally { setIsLoading(false); }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
             if (err.code === 'auth/unauthorized-domain') setUnauthorizedDomain(window.location.hostname);
             else setError('Invalid credentials.');
        } finally { setIsLoading(false); }
    };

    const handleDevLogin = async () => {
        setIsLoading(true);
        setError('');
        const devEmail = 'developer@example.com'; const devPass = '123456';
        try {
            try { await signInWithEmailAndPassword(auth, devEmail, devPass); } 
            catch (loginErr: any) {
                if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
                    const result = await createUserWithEmailAndPassword(auth, devEmail, devPass);
                    await setDoc(doc(firestore, 'users', result.user.uid), {
                        id: result.user.uid, email: result.user.email, displayName: 'Developer Admin',
                        photoURL: '', role: UserRole.ADMIN, createdAt: serverTimestamp()
                    });
                } else throw loginErr;
            }
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/unauthorized-domain') setUnauthorizedDomain(window.location.hostname);
            setError(err.message);
        } finally { setIsLoading(false); }
    };
    // ... (End Logic)

    const handleCopyDomain = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (unauthorizedDomain) return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0e1014]">
            <NeuCard className="w-full max-w-lg p-10 !rounded-[30px] border border-amber-500/30">
                <div className="flex flex-col items-center gap-4 text-amber-500 mb-6">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white text-center">Authorization Required</h2>
                </div>
                <div className="space-y-6">
                    <div className="bg-[#131519] p-6 rounded-2xl border border-white/5 shadow-neu-pressed">
                        <div className="flex items-center justify-between gap-3">
                            <code className="flex-1 text-primary font-mono text-sm break-all">{unauthorizedDomain}</code>
                            <NeuButton circle onClick={() => handleCopyDomain(unauthorizedDomain!)} className="!w-10 !h-10 shrink-0">
                                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </NeuButton>
                        </div>
                    </div>
                    <NeuButton primary onClick={() => window.location.reload()} className="w-full">I've added it, Refresh</NeuButton>
                </div>
            </NeuCard>
        </div>
    );

    return (
        <div className="min-h-screen flex w-full font-sans overflow-hidden relative bg-[#0e1014]">
            {/* Deep Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-teal-900/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px]"></div>

            <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-[1.5rem] bg-gradient-primary shadow-reflection text-white animate-float">
                        <Construction size={40} strokeWidth={2} />
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">Predict<span className="text-primary">Pro</span></h1>
                    <p className="text-slate-500 mt-2 font-medium tracking-wide text-sm">PREMIUM CONSTRUCTION INTELLIGENCE</p>
                </div>

                <NeuCard className="w-full max-w-md p-10 !rounded-[2.5rem] bg-[#181b21]">
                    <div className="grid grid-cols-2 gap-2 mb-8 p-1.5 rounded-2xl bg-[#131519] shadow-neu-pressed">
                        <button onClick={() => setLoginMode('client')} className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${loginMode === 'client' ? 'bg-[#232730] text-primary shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Client</button>
                        <button onClick={() => setLoginMode('admin')} className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${loginMode === 'admin' ? 'bg-[#232730] text-primary shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Admin</button>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center font-medium">{error}</div>}

                    {loginMode === 'client' ? (
                        <form onSubmit={handleEmailLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">Email</label>
                                <NeuInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">Password</label>
                                <NeuInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                            </div>
                            <NeuButton primary type="submit" disabled={isLoading} className="w-full !mt-8 !py-4 text-base shadow-reflection">
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Secure Access'}
                            </NeuButton>
                        </form>
                    ) : (
                        <div className="space-y-6 py-4">
                             <NeuButton onClick={handleGoogleLogin} disabled={isLoading} className="w-full gap-4 bg-white text-slate-900 hover:bg-gray-100 shadow-lg shadow-white/10 border-none !py-4">
                                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                 <span className="font-bold">Continue with Google</span>
                            </NeuButton>
                            <div className="relative flex py-2 items-center opacity-60"><div className="flex-grow border-t border-white/10"></div><span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest">Developer</span><div className="flex-grow border-t border-white/10"></div></div>
                            <NeuButton onClick={handleDevLogin} disabled={isLoading} className="w-full gap-2 !py-3 !text-xs !bg-[#131519] !text-slate-500 hover:!text-slate-300 border-none shadow-none hover:shadow-none">
                                 <Code2 size={14} /> Quick Access
                            </NeuButton>
                        </div>
                    )}
                </NeuCard>
            </div>
        </div>
    );
};
