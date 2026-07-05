"use client";

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { auth, googleProvider, microsoftProvider } from '../../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { Activity, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { setView, login } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        if (name) {
          await updateProfile(user, { displayName: name });
        }
        login(user.email || email, name || user.displayName || 'User', user.uid);
      } else {
        // Sign in with Firebase Auth
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        login(user.email || email, user.displayName || 'User', user.uid);
      }
      setView('onboarding');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Firebase Auth failed:", err);
      let errMsg = "Authentication failed. Please verify credentials or settings.";
      
      if (err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email address is already in use.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters long.";
      } else if (err.code === "auth/network-request-failed") {
        errMsg = "Network request failed. Check your internet connection.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email/Password sign-in is not enabled in the Firebase Console.";
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      login(user.email || 'google@communitypulse.ai', user.displayName || 'Google User', user.uid);
      setView('onboarding');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Firebase Google Auth failed, falling back to mock login:", err);
      let errMsg = "Google Sign-In failed.";
      if (err.code === "auth/popup-blocked") {
        errMsg = "Google login popup was blocked by your browser. Please enable it.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Google provider is not enabled in your Firebase Console.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;
      login(user.email || 'ms@communitypulse.ai', user.displayName || 'Microsoft User', user.uid);
      setView('onboarding');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Firebase Microsoft Auth failed:", err);
      let errMsg = "Microsoft Sign-In failed.";
      if (err.code === "auth/popup-blocked") {
        errMsg = "Microsoft login popup was blocked by your browser. Please enable it.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Microsoft provider is not enabled in your Firebase Console.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-950 dark:text-white">CommunityPulse AI</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            {isSignUp ? 'Create Workspace Account' : 'Sign in to Workspace'}
          </p>
        </div>

        {/* Dynamic Error Message Block */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-medium space-y-2 transition-all">
            <p className="font-semibold">{error}</p>
            <button 
              type="button" 
              onClick={() => {
                login(email || 'demo@communitypulse.ai', name || 'Demo User');
                setView('onboarding');
              }}
              className="text-xs underline font-bold hover:text-red-700 dark:hover:text-red-300 block"
            >
              Bypass and continue in Demo Mode
            </button>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn} 
            className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            Google SSO
          </button>
          <button 
            type="button"
            disabled={loading}
            onClick={handleMicrosoftSignIn} 
            className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            Microsoft SSO
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold uppercase tracking-wider justify-center">
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
          <span>or email connection</span>
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Ranjeet Kumar" 
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-905 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Organization Name</label>
                <div className="relative">
                  <Activity className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="State Disaster Authority" 
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-905 transition-all"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="you@company.com" 
                className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-905 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-905 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              <>Create Workspace <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="text-center text-xs">
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(prev => !prev);
              setError(null);
            }} 
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
