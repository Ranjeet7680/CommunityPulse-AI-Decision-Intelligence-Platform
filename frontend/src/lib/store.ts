import { create } from 'zustand';

export interface User {
  uid: string;
  email: string;
  name: string;
  orgId: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  column: 'todo' | 'progress' | 'review' | 'done';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AlertItem {
  id: string;
  metric: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  status: 'active' | 'resolved';
}

export interface ReferralRecord {
  refereeName: string;
  date: string;
  status: string;
  reward: number;
}

interface AppState {
  // Navigation & View Flow
  currentView: 'landing' | 'auth' | 'onboarding' | 'dashboard';
  dashboardTab: string;
  onboardingStep: number;
  theme: 'light' | 'dark';
  
  // Auth state
  user: User | null;
  orgName: string;
  orgIndustry: string;
  orgCountry: string;
  
  // Referral System State
  referralCode: string;
  walletBalance: number;
  referrals: ReferralRecord[];
  
  // Real-time alerts
  alerts: AlertItem[];
  
  // Kanban board tasks
  tasks: Task[];
  
  // Actions
  setView: (view: 'landing' | 'auth' | 'onboarding' | 'dashboard') => void;
  setTab: (tab: string) => void;
  setStep: (step: number) => void;
  toggleTheme: () => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateOrg: (name: string, industry: string, country: string) => void;
  applyPromoCode: (code: string) => { success: boolean; reward: number; msg: string };
  addAlert: (alert: AlertItem) => void;
  resolveAlert: (id: string) => void;
  addTask: (title: string, column: 'todo' | 'progress' | 'review' | 'done', assignee: string, priority: 'low' | 'medium' | 'high') => void;
  moveTask: (id: string, column: 'todo' | 'progress' | 'review' | 'done') => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  dashboardTab: 'overview',
  onboardingStep: 1,
  theme: 'light',
  
  user: null,
  orgName: 'CommunityPulse Demo Org',
  orgIndustry: 'Government / Municipal',
  orgCountry: 'India',
  
  referralCode: 'PULSE_7FX9M',
  walletBalance: 0,
  referrals: [],
  
  alerts: [
    { id: '1', metric: 'Flood Warning', type: 'critical', message: 'Rainfall exceeds 75mm in District 3. Risk is high.', time: '10 mins ago', status: 'active' },
    { id: '2', metric: 'Traffic Congestion', type: 'warning', message: 'Average speed on Route 7 fell below 12 km/h.', time: '1 hour ago', status: 'active' },
    { id: '3', metric: 'Air Quality degraded', type: 'warning', message: 'AQI in District 3 hit 92. Deploy filters.', time: '3 hours ago', status: 'active' }
  ],
  
  tasks: [
    { id: 'task-1', title: 'Optimize Waste Route 7', column: 'todo', assignee: 'Ranjeet Kumar', priority: 'high' },
    { id: 'task-2', title: 'Verify Air sensors in District 3', column: 'progress', assignee: 'Priya Sharma', priority: 'medium' },
    { id: 'task-3', title: 'Deploy weekly reports automation', column: 'review', assignee: 'Arjun Mehta', priority: 'low' },
    { id: 'task-4', title: 'Integrate BigQuery datasets', column: 'done', assignee: 'Ranjeet Kumar', priority: 'high' }
  ],
  
  setView: (view) => set({ currentView: view }),
  setTab: (tab) => set({ dashboardTab: tab }),
  setStep: (step) => set({ onboardingStep: step }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    return { theme: nextTheme };
  }),
  
  login: (email, name) => set({
    user: {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      orgId: 'org_demo',
      role: 'admin'
    },
    currentView: 'onboarding',
    onboardingStep: 1
  }),
  
  logout: () => set({ user: null, currentView: 'landing' }),
  
  updateOrg: (name, industry, country) => set({ orgName: name, orgIndustry: industry, orgCountry: country }),
  
  applyPromoCode: (code) => {
    const codeUpper = code.trim().toUpperCase();
    const promoRewards: Record<string, number> = {
      'GEMINI50': 5000,
      'PULSEPARTNER': 10000,
      'NVIDIA99': 15000,
      'GOOGLE2024': 20000,
      'COMMUNITY': 3000
    };
    
    if (promoRewards[codeUpper]) {
      const reward = promoRewards[codeUpper];
      set((state) => ({
        walletBalance: state.walletBalance + reward,
        referrals: [
          { refereeName: `Promo Code: ${codeUpper}`, date: new Date().toLocaleDateString(), status: 'Applied', reward },
          ...state.referrals
        ]
      }));
      return { success: true, reward, msg: `Successfully applied promo code! Credited ${reward} credits.` };
    }
    
    return { success: false, reward: 0, msg: 'Invalid promo or referral code' };
  },
  
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  
  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a)
  })),
  
  addTask: (title, column, assignee, priority) => set((state) => ({
    tasks: [...state.tasks, { id: 'task-' + Math.random().toString(36).substr(2, 9), title, column, assignee, priority }]
  })),
  
  moveTask: (id, column) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, column } : t)
  }))
}));
