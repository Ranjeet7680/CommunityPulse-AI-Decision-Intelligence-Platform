"use client";

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const { setView, login } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Authenticate and redirect to onboarding step wizard
    login(email, name || 'User');
    setView('onboarding');
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

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { login('google@communitypulse.ai', 'Google User'); setView('onboarding'); }} className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
            Google SSO
          </button>
          <button onClick={() => { login('ms@communitypulse.ai', 'Microsoft User'); setView('onboarding'); }} className="p-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
            Microsoft SSO
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold uppercase tracking-wider justify-center">
          <div className="h-[1px] bg-slate-100 flex-1"></div>
          <span>or email connection</span>
          <div className="h-[1px] bg-slate-100 flex-1"></div>
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
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all">
            {isSignUp ? 'Create Workspace' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs">
          <button onClick={() => setIsSignUp(prev => !prev)} className="text-blue-600 font-bold hover:underline">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
