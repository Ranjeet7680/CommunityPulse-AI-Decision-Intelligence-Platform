"use client";

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { 
  Building2, Database, Award, ArrowRight, ArrowLeft, Check,
  Cloud, Cpu, Server, FileText, CheckCircle2
} from 'lucide-react';

export default function OnboardingPage() {
  const { setView, onboardingStep, setStep, orgName, orgIndustry, orgCountry, updateOrg, applyPromoCode } = useStore();
  
  // Step 1 Form state
  const [name, setName] = useState(orgName);
  const [industry, setIndustry] = useState(orgIndustry);
  const [country, setCountry] = useState(orgCountry);

  // Step 2 Form state (Toggled sources)
  const [sources, setSources] = useState<string[]>(['bq', 'csv']);

  // Step 3 Form state (Referrals)
  const [code, setCode] = useState('');
  const [appliedMsg, setAppliedMsg] = useState('');
  const [successApply, setSuccessApply] = useState(false);

  const handleNext = () => {
    if (onboardingStep === 1) {
      updateOrg(name, industry, country);
      setStep(2);
    } else if (onboardingStep === 2) {
      setStep(3);
    } else if (onboardingStep === 3) {
      // Completed, redirect to core dashboard
      setView('dashboard');
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setStep(onboardingStep - 1);
    }
  };

  const toggleSource = (id: string) => {
    if (sources.includes(id)) {
      setSources(prev => prev.filter(x => x !== id));
    } else {
      setSources(prev => [...prev, id]);
    }
  };

  const handleApplyPromo = () => {
    if (!code) return;
    const res = applyPromoCode(code);
    setAppliedMsg(res.msg);
    setSuccessApply(res.success);
  };

  const stepsList = [
    { title: 'Workspace Detail', icon: Building2 },
    { title: 'Data Integrations', icon: Database },
    { title: 'Referral Rewards', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 dark:bg-slate-950">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          {stepsList.map((step, index) => {
            const Icon = step.icon;
            const stepNum = index + 1;
            const isActive = onboardingStep === stepNum;
            const isCompleted = onboardingStep > stepNum;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' :
                  isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 0{stepNum}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1 Content: Org Detail */}
        {onboardingStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Configure Workspace Details</h2>
              <p className="text-xs text-slate-500">Industry type helps us recommend specific ML templates.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Workspace / Org Name</label>
                <input 
                  type="text" 
                  className="w-full mt-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Municipal Board"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Industry Segment</label>
                  <select 
                    className="w-full mt-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option>Government / Municipal</option>
                    <option>Healthcare / Biotech</option>
                    <option>NGO / Climate Action</option>
                    <option>Education / Research</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Operating Country</label>
                  <input 
                    type="text" 
                    className="w-full mt-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content: Integrations */}
        {onboardingStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Connect Data Integrations</h2>
              <p className="text-xs text-slate-500">Connect files or active cloud streams.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'bq', name: 'Google BigQuery', icon: Cloud, desc: 'Enterprise data warehouse connector' },
                { id: 'gcs', name: 'Cloud Storage', icon: Server, desc: 'Object store file drop zone' },
                { id: 'iot', name: 'IoT Stream Sensors', icon: Cpu, desc: 'Real-time telemetry feeds' },
                { id: 'csv', name: 'CSV / Excel Uploads', icon: FileText, desc: 'Local workbook file uploads' }
              ].map(source => {
                const Icon = source.icon;
                const active = sources.includes(source.id);
                return (
                  <div 
                    key={source.id} 
                    onClick={() => toggleSource(source.id)}
                    className={`p-5 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-4 ${
                      active ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{source.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{source.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 Content: Referrals */}
        {onboardingStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Referral Wallet Credits</h2>
              <p className="text-xs text-slate-500">Enter a promo or referral code to apply trial usage credits.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Referral Code</label>
                <div className="flex gap-2 mt-1.5">
                  <input 
                    type="text" 
                    placeholder="Try: GEMINI50" 
                    className="flex-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm uppercase bg-transparent"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button onClick={handleApplyPromo} className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">
                    Apply Code
                  </button>
                </div>
              </div>

              {appliedMsg && (
                <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  successApply ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  {successApply && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {appliedMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Controls Footer */}
        <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleBack} 
            disabled={onboardingStep === 1}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button 
            onClick={handleNext} 
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all"
          >
            {onboardingStep === 3 ? 'Go to Dashboard' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
