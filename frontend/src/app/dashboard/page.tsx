"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore, Task, AlertItem } from '../../lib/store';
import { 
  Activity, Brain, Globe, Zap, Database, Shield, Users, Award, 
  Settings, LogOut, Sun, Moon, Bell, Search, Plus, Trash2, Send,
  SlidersHorizontal, CheckCircle2, AlertTriangle, Info, Play, Download,
  Mail, Calendar, BarChart3, HelpCircle, ArrowRight, User, Check, LayoutDashboard, MessageSquare
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import MapComponent from '../components/MapComponent';

export default function Dashboard() {
  const { 
    setView, 
    dashboardTab, 
    setTab, 
    theme, 
    toggleTheme, 
    orgName, 
    updateOrg, 
    walletBalance, 
    applyPromoCode, 
    referrals,
    alerts,
    resolveAlert,
    tasks,
    addTask,
    moveTask,
    logout
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Command Palette State
  const [cmdOpen, setCmdOpen] = useState(false);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard shortcut listener for Command Palette (cmd/ctrl + k)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // AI Assistant Chat State
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; confidence?: number; sources?: string[] }>>([
    { sender: 'ai', text: "Hello! I'm your Gemini AI Decision assistant. Ask me about flood risk, traffic congestion, or water levels.", confidence: 0.95 }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const userText = chatMsg;
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setChatMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "I've analyzed the BigQuery data. The model shows steady parameters.";
      let confidence = 0.88;
      let sources = ["Baseline Logs"];
      
      const query = userText.toLowerCase();
      if (query.includes("traffic") || query.includes("congestion")) {
        aiText = "The traffic predictive model indicates a 14% spike on Route 7 tomorrow between 8:00 AM and 10:00 AM. I suggest adjusting smart signal cycles.";
        confidence = 0.94;
        sources = ["Route 7 Sensors", "Historical Traffic Log"];
      } else if (query.includes("flood") || query.includes("rain")) {
        aiText = "Rainfall forecasting shows a 42% risk of flood levels in District 3. Recommend clearing drain tunnels.";
        confidence = 0.91;
        sources = ["Meteorology API", "Soil Saturation Sensors"];
      } else if (query.includes("water") || query.includes("supply")) {
        aiText = "Water usage in District 1 exceeds normal thresholds by 12%. Recommending conservation notifications.";
        confidence = 0.89;
        sources = ["District 1 flow meter"];
      }
      
      setChatLog(prev => [...prev, { sender: 'ai', text: aiText, confidence, sources }]);
      setIsTyping(false);
    }, 1200);
  };

  // Maps state
  const [mapLayer, setMapLayer] = useState<'traffic' | 'flood' | 'aqi'>('traffic');

  // Predictions state
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  // Reports state
  const [reportEmail, setReportEmail] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');

  // Alerts configuration state
  const [alertMetric, setAlertMetric] = useState('Traffic Speed');
  const [alertThreshold, setAlertThreshold] = useState(20);

  // Feedback State
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');

  // Referral code submit state
  const [promoInput, setPromoInput] = useState('');

  // Settings State
  const [tempOrgName, setTempOrgName] = useState(orgName);

  // Tasks form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle, 'todo', taskAssignee || 'Unassigned', 'medium');
    setTaskTitle('');
    setTaskAssignee('');
    triggerToast("Task added successfully!", "success");
  };

  // Mock data for charts
  const lineData = [
    { name: 'Jan', value: 82 },
    { name: 'Feb', value: 84 },
    { name: 'Mar', value: 80 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 87 },
    { name: 'Jun', value: 89 },
  ];

  const barData = [
    { name: 'D1', val: 42 },
    { name: 'D2', val: 56 },
    { name: 'D3', val: 92 },
    { name: 'D4', val: 38 },
    { name: 'D5', val: 74 },
  ];

  const donutData = [
    { name: 'Safe', value: 70, color: '#34A853' },
    { name: 'Warning', value: 20, color: '#FBBC04' },
    { name: 'Critical', value: 10, color: '#EA4335' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-600' :
          toast.type === 'warn' ? 'bg-amber-500 text-white border-amber-600' : 'bg-blue-500 text-white border-blue-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Command Palette Modal */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search commands (e.g. Overview, Settings, Dark)..." 
                className="w-full bg-transparent outline-none text-sm p-1"
                autoFocus
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  if (val === 'dark' || val === 'light') {
                    toggleTheme();
                    triggerToast("Theme toggled!", "info");
                    setCmdOpen(false);
                  } else if (val === 'overview') {
                    setTab('overview');
                    setCmdOpen(false);
                  } else if (val === 'settings') {
                    setTab('settings');
                    setCmdOpen(false);
                  }
                }}
              />
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">Quick Links</div>
            <div className="space-y-1">
              <button onClick={() => { setTab('overview'); setCmdOpen(false); }} className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between">
                <span>Go to Overview Dashboard</span> <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">O</kbd>
              </button>
              <button onClick={() => { setTab('settings'); setCmdOpen(false); }} className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between">
                <span>Go to Workspace Settings</span> <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">S</kbd>
              </button>
              <button onClick={() => { toggleTheme(); setCmdOpen(false); }} className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between">
                <span>Toggle Dark / Light Mode</span> <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">T</kbd>
              </button>
            </div>
            <div className="text-xs text-slate-400 text-center pt-2">Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">ESC</kbd> to close</div>
            <button onClick={() => setCmdOpen(false)} className="hidden"></button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">CommunityPulse</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
              { id: 'ai-chat', name: 'AI Assistant', icon: Brain },
              { id: 'analytics', name: 'Analytics', icon: SlidersHorizontal },
              { id: 'gis-maps', name: 'GIS Maps', icon: Globe },
              { id: 'predictions', name: 'Predictions', icon: Zap },
              { id: 'reports', name: 'Reports', icon: Database },
              { id: 'alerts', name: 'Smart Alerts', icon: Shield },
              { id: 'team', name: 'Team Board', icon: Users },
              { id: 'feedback', name: 'Complaint Portal', icon: MessageSquare },
              { id: 'referral', name: 'Referral Center', icon: Award },
              { id: 'admin', name: 'Admin Console', icon: User },
              { id: 'settings', name: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    dashboardTab === item.id 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
              RK
            </div>
            <div>
              <div className="text-sm font-bold truncate">Ranjeet Kumar</div>
              <div className="text-xs text-slate-400 truncate">rajranjeet7680@gmail.com</div>
            </div>
          </div>
          <button 
            onClick={() => { logout(); setView('landing'); }} 
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Top Header */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search metrics, reports... (Press ⌘K)" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(prev => !prev)}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 space-y-3">
                  <div className="font-bold text-sm">Real-time Notifications</div>
                  <div className="space-y-2">
                    {alerts.map(a => (
                      <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-xs">
                        <div className="font-bold flex items-center gap-1">
                          {a.type === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : <Info className="w-3.5 h-3.5 text-amber-500" />}
                          {a.metric}
                        </div>
                        <p className="text-slate-500 mt-1">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{orgName}</span>
          </div>
        </header>

        {/* Tab Module Panels Switcher */}
        <div className="flex-1 p-8 overflow-y-auto min-h-0">
          
          {/* ══ OVERVIEW TAB ══ */}
          {dashboardTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Workspace Overview</h1>
                  <p className="text-sm text-slate-500">Continuous decision intelligence monitoring</p>
                </div>
                <button onClick={() => triggerToast("Compiling AI Summary...", "info")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Summary Report
                </button>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  { name: 'Community Health', val: '87.4', change: '+1.4%', color: 'text-blue-600', desc: 'Socio-economic vital signs' },
                  { name: 'Traffic Speed Index', val: '6.2', change: '-0.3%', color: 'text-emerald-600', desc: 'Average district speed' },
                  { name: 'Air Quality (AQI)', val: '42.0', change: 'Good', color: 'text-amber-600', desc: 'Particulate density index' },
                  { name: 'Satisfaction Rate', val: '78%', change: '+3.1%', color: 'text-violet-600', desc: 'Citizen feedback score' }
                ].map((kpi, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{kpi.name}</span>
                    <div className="flex items-baseline justify-between">
                      <h2 className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.val}</h2>
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{kpi.change}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">{kpi.desc}</p>
                  </div>
                ))}
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Community Health Trend (12 Months)</div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#1A73E8" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Emergency Warning Status</div>
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ AI CHAT TAB ══ */}
          {dashboardTab === 'ai-chat' && (
            <div className="h-[calc(100vh-12rem)] flex gap-6 animate-fade-in">
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col min-w-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm">Gemini 2.0 Flash conversational model</span>
                  <span className="text-xs font-semibold text-emerald-500">Connected</span>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatLog.map((log, i) => (
                    <div key={i} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                        log.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50'
                      }`}>
                        <p>{log.text}</p>
                        
                        {log.confidence && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                            <span>Confidence: {roundPercent(log.confidence)}%</span>
                            {log.sources && <span>Sources: {log.sources.join(', ')}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 font-semibold animate-pulse">
                        Gemini is processing dataset query...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Ask about traffic, weather warnings or water demand..." 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  />
                  <button onClick={handleSendChat} className="px-5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center hover:bg-blue-700 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Suggested Prompts sidebar */}
              <div className="w-80 space-y-4 shrink-0">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Suggested Analytics Queries</div>
                  <div className="space-y-2">
                    {[
                      "Check flood risk in District 3",
                      "Predict traffic tomorrow morning",
                      "Analyze water consumption"
                    ].map((p, i) => (
                      <button key={i} onClick={() => setChatMsg(p)} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/20 text-xs font-semibold transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS TAB ══ */}
          {dashboardTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Advanced Analytics Engine</h1>
              <div className="grid grid-cols-3 gap-6">
                {/* Custom SQL Generator */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Query Builder (Google BigQuery Sandbox)</div>
                  <div className="bg-slate-950 dark:bg-slate-900/50 p-4 rounded-xl font-mono text-xs text-blue-400">
                    SELECT district_id, AVG(traffic_speed) <br/>
                    FROM `community_analytics.traffic` <br/>
                    GROUP BY 1 ORDER BY 2 DESC
                  </div>
                  <button onClick={() => triggerToast("BigQuery job dispatched. Processed 42.8 MB.", "success")} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all">
                    <Play className="w-4 h-4" /> Run Query
                  </button>
                </div>

                {/* Detected Anomalies */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Z-Score Anomalies</div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-red-200/50 bg-red-50/50 dark:bg-red-950/20 text-xs">
                      <div className="font-bold text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Traffic Spike</div>
                      <p className="text-slate-500 mt-1">Route 7 average speed fell by 24.5% below historical mean.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ GIS MAPS TAB ══ */}
          {dashboardTab === 'gis-maps' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Interactive GIS Maps</h1>
                  <p className="text-sm text-slate-500">Spatial multi-layer modeling analytics</p>
                </div>
                {/* Layer Toggles */}
                <div className="flex gap-2">
                  {['traffic', 'flood', 'aqi'].map(layer => (
                    <button 
                      key={layer}
                      onClick={() => setMapLayer(layer as 'traffic' | 'flood' | 'aqi')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        mapLayer === layer 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {layer.toUpperCase()} Layer
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview Area */}
              <div className="h-96 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative bg-blue-50/30">
                <MapComponent layer={mapLayer} />
              </div>
            </div>
          )}

          {/* ══ PREDICTIONS TAB ══ */}
          {dashboardTab === 'predictions' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">ML Predictive Modeling</h1>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: 'traffic', title: 'Traffic Speed Forecast', val: '45 km/h', confidence: 0.94, desc: 'Predicting vehicle flows 24h out.', action: 'Deploy smart signal cycles' },
                  { id: 'flood', title: 'Flood Risk Prediction', val: 'Critical Warning', confidence: 0.91, desc: 'Rainfall/saturation ratio assessment.', action: 'Evacuate sector drainage areas' },
                  { id: 'energy', title: 'Grid Energy Demand', val: '142 MW', confidence: 0.96, desc: 'Weather correlation load metrics.', action: 'Dispatch reserve units' }
                ].map(card => (
                  <div 
                    key={card.id} 
                    onClick={() => setSelectedPrediction(card.id)}
                    className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm cursor-pointer transition-all ${
                      selectedPrediction === card.id ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-sm">{card.title}</h3>
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Confidence: {roundPercent(card.confidence)}%</span>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-600 mb-2">{card.val}</div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.desc}</p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs font-semibold">
                      Recommendation: {card.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ REPORTS TAB ══ */}
          {dashboardTab === 'reports' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Executive Report Hub</h1>
              <div className="grid grid-cols-3 gap-6">
                {/* Generation Form */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Schedule Automation Delivery</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Destination Email</label>
                      <input 
                        type="email" 
                        placeholder="recipient@organization.gov" 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Export Format</label>
                      <select 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value)}
                      >
                        <option value="pdf">Adobe PDF (.pdf)</option>
                        <option value="xlsx">Excel Sheet (.xlsx)</option>
                        <option value="pptx">PowerPoint Presentation (.pptx)</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!reportEmail) {
                      triggerToast("Email address is required", "warn");
                      return;
                    }
                    triggerToast(`Delivery schedule automated to ${reportEmail}`, "success");
                    setReportEmail('');
                  }} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all">
                    <Calendar className="w-4 h-4" /> Automate Weekly Delivery
                  </button>
                </div>

                {/* Available Downloads list */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Recent Export Templates</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Monthly_District_Overview.pdf', size: '2.4 MB' },
                      { name: 'Traffic_Volume_Data.xlsx', size: '4.8 MB' }
                    ].map((rep, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold truncate max-w-[150px]">{rep.name}</div>
                          <span className="text-slate-400">{rep.size}</span>
                        </div>
                        <button onClick={() => triggerToast(`Downloading ${rep.name}...`, "info")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Download className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SMART ALERTS TAB ══ */}
          {dashboardTab === 'alerts' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Smart Alerts & Rule Thresholds</h1>
              <div className="grid grid-cols-3 gap-6">
                {/* Alerts Rule Builder */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Create Metric Alert Trigger</div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Target Metric</label>
                      <select 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={alertMetric}
                        onChange={(e) => setAlertMetric(e.target.value)}
                      >
                        <option>Traffic Speed</option>
                        <option>Water usage</option>
                        <option>Air Quality index</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Threshold limit</label>
                      <input 
                        type="number" 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(Number(e.target.value))}
                      />
                    </div>
                    <button onClick={() => triggerToast(`Alert rule configured! Metric: ${alertMetric}`, "success")} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">
                      Configure Threshold Trigger
                    </button>
                  </div>
                </div>

                {/* Queue list */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Active Alerts Dispatch Queue</div>
                  <div className="space-y-3">
                    {alerts.filter(a => a.status === 'active').map(a => (
                      <div key={a.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${a.type === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            {a.metric}
                          </div>
                          <p className="text-slate-500">{a.message}</p>
                        </div>
                        <button onClick={() => { resolveAlert(a.id); triggerToast("Resolved alert entry!", "success"); }} className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-[11px] transition-all">
                          Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TEAM WORKSPACE TAB ══ */}
          {dashboardTab === 'team' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Team Board Workspace</h1>
                  <p className="text-sm text-slate-500">Agile task coordination board</p>
                </div>
              </div>

              {/* Kanban board structure */}
              <div className="grid grid-cols-4 gap-6">
                {(['todo', 'progress', 'review', 'done'] as const).map(column => (
                  <div key={column} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 min-h-[300px] space-y-4">
                    <div className="font-bold text-xs uppercase text-slate-400 tracking-wider flex justify-between items-center">
                      <span>{column}</span>
                      <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        {tasks.filter(t => t.column === column).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {tasks.filter(t => t.column === column).map(t => (
                        <div key={t.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3 cursor-grab">
                          <h4 className="font-bold text-xs leading-relaxed">{t.title}</h4>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Assignee: {t.assignee}</span>
                            <div className="flex gap-1.5">
                              {column !== 'done' && (
                                <button 
                                  onClick={() => {
                                    const nextMap: Record<string, 'todo' | 'progress' | 'review' | 'done'> = {
                                      'todo': 'progress',
                                      'progress': 'review',
                                      'review': 'done'
                                    };
                                    moveTask(t.id, nextMap[column]);
                                  }} 
                                  className="text-blue-600 font-bold"
                                >
                                  Advance
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Task creation form */}
              <div className="max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="font-bold text-sm">Add Workspace Task</div>
                <form onSubmit={handleAddTaskSubmit} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Task details (e.g. Verify Route 7 signals)" 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Assignee name" 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                  />
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs transition-all">
                    Add Task to Board
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══ COMPLAINT PORTAL TAB ══ */}
          {dashboardTab === 'feedback' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Citizen Complaint & Feedback Portal</h1>
              <div className="grid grid-cols-2 gap-8">
                {/* Submission Form */}
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Submit Community Complaint</div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Incident Header</label>
                      <input 
                        type="text" 
                        placeholder="Broken water pipeline in Sector 4" 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={feedbackTitle}
                        onChange={(e) => setFeedbackTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Incident Details</label>
                      <textarea 
                        placeholder="Describe the issue in detail..." 
                        rows={4} 
                        className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                        value={feedbackDesc}
                        onChange={(e) => setFeedbackDesc(e.target.value)}
                      />
                    </div>
                    <button onClick={() => {
                      if (!feedbackTitle) {
                        triggerToast("Incident Header is required", "warn");
                        return;
                      }
                      triggerToast("Incident logged! AI priority score: High (87.2)", "success");
                      setFeedbackTitle('');
                      setFeedbackDesc('');
                    }} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">
                      Submit Incident Report
                    </button>
                  </div>
                </div>

                {/* AI prioritization telemetry logs */}
                <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800 space-y-4">
                  <div className="font-bold text-sm">Active Resolving Operations</div>
                  <div className="space-y-3">
                    {[
                      { title: 'District 3 drainage leak', score: 87.2, status: 'resolving' },
                      { title: 'Broken streetlight Route 4', score: 32.4, status: 'logged' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold">{item.title}</div>
                          <span className="text-[10px] text-slate-400 mt-1 block">AI Priority Score: {item.score}</span>
                        </div>
                        <span className="badge badge-blue">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ REFERRAL TAB ══ */}
          {dashboardTab === 'referral' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Referral System Center</h1>
              <div className="grid grid-cols-3 gap-6">
                {/* Stats & Wallet */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Wallet Balance</div>
                  <div className="text-4xl font-extrabold text-blue-600">{walletBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">credits</span></div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Apply Referral Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Try GEMINI50" 
                        className="flex-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm uppercase bg-transparent"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                      />
                      <button onClick={() => {
                        const result = applyPromoCode(promoInput);
                        if (result.success) {
                          triggerToast(result.msg, "success");
                          setPromoInput('');
                        } else {
                          triggerToast(result.msg, "warn");
                        }
                      }} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Apply</button>
                    </div>
                  </div>
                </div>

                {/* History list */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Credit Wallet Ledger</div>
                  <div className="space-y-2">
                    {referrals.map((ref, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold">{ref.refereeName}</div>
                          <span className="text-slate-400">{ref.date} · {ref.status}</span>
                        </div>
                        <span className="font-bold text-emerald-500">+{ref.reward.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ADMIN TAB ══ */}
          {dashboardTab === 'admin' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Admin Console</h1>
              <div className="grid grid-cols-3 gap-6">
                {/* Telemetry charts */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Telemetry Stats</div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between"><span>CPU Usage</span><span className="font-bold">34.2%</span></div>
                    <div className="flex justify-between"><span>RAM Utilization</span><span className="font-bold">58.7%</span></div>
                    <div className="flex justify-between"><span>NVIDIA GPU Temp</span><span className="font-bold">61.0°C</span></div>
                    <div className="flex justify-between"><span>Active BigQuery Queries</span><span className="font-bold">2 active</span></div>
                  </div>
                </div>

                {/* Users directories */}
                <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="font-bold text-sm">Active Workspace Users</div>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Ranjeet Kumar', email: 'rajranjeet7680@gmail.com', role: 'admin' },
                      { name: 'Priya Sharma', email: 'priya@communitypulse.ai', role: 'member' }
                    ].map((user, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <span className="text-slate-400">{user.email}</span>
                        </div>
                        <span className="badge badge-blue">{user.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SETTINGS TAB ══ */}
          {dashboardTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-2xl font-bold">Workspace Settings</h1>
              <div className="max-w-2xl p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Organization / Workspace Name</label>
                    <input 
                      type="text" 
                      className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent"
                      value={tempOrgName}
                      onChange={(e) => setTempOrgName(e.target.value)}
                    />
                  </div>
                  <button onClick={() => {
                    updateOrg(tempOrgName, 'Government', 'India');
                    triggerToast("Workspace settings saved!", "success");
                  }} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">
                    Save Configuration Settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Decimal percentage formatting helper
function roundPercent(v: number): number {
  return Math.round(v * 100);
}
