/* =========================================================
   CommunityPulse AI — Application Logic
   State Engine · Router · Charts · Maps · AI Assistant
   ========================================================= */

'use strict';

// ─────────────────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────────────────
const State = {
  theme: 'light',
  auth: {
    loggedIn: false,
    name: 'Ranjeet Kumar',
    email: 'rajranjeet7680@gmail.com',
    initials: 'RK',
    org: 'CommunityPulse AI',
    role: 'Super Admin'
  },
  currentView: 'dashboard',
  onboardingStep: 1,
  sidebarCollapsed: false,
  notifications: [
    { id: 1, type: 'critical', text: 'Flood risk level ORANGE in District 7', time: '3m ago', read: false },
    { id: 2, type: 'info',     text: 'Gemini AI has generated this week\'s community report', time: '18m ago', read: false },
    { id: 3, type: 'success',  text: 'BigQuery connection verified successfully', time: '1h ago', read: true },
    { id: 4, type: 'warn',     text: 'Air Quality Index exceeded safe threshold in Zone 4', time: '2h ago', read: true },
  ],
  connectedSources: ['bigquery', 'firebase'],
  referralCode: 'PULSE-RK2024',
  referralCount: 7,
  chatHistory: [],
  activeSettingsPanel: 'general',
  activeMapLayer: 'traffic',
  metrics: {
    communityScore: 84,
    trafficIndex: 67,
    airQuality: 42,
    satisfaction: 78,
    waterUsage: 55,
    energy: 61,
    waste: 89,
    emergency: 'Normal'
  },
  activeDataset: null,
  datasetPage: 0,
  datasetPageSize: 10,
  datasetSearch: '',
  datasetChartConfig: { x: '', y: '', type: 'line' },
  mapZoom: 1,
  mapPanX: 0,
  mapPanY: 0
};

// ─────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function el(tag, cls = '', html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function showToast(msg, type = 'info') {
  const container = $('#toast-container') || (() => {
    const d = document.createElement('div');
    d.id = 'toast-container';
    d.className = 'toast-container';
    document.body.appendChild(d);
    return d;
  })();

  const icons = { success: 'check_circle', error: 'error', info: 'info', warn: 'warning' };
  const colors = { success: '#34A853', error: '#EA4335', info: '#1A73E8', warn: '#FBBC04' };
  const t = el('div', `toast ${type}`);
  t.innerHTML = `
    <span class="material-symbols-rounded" style="color:${colors[type]||colors.info};font-size:20px">${icons[type]||icons.info}</span>
    <span style="flex:1">${msg}</span>
    <button onclick="this.parentElement.remove()" class="btn-ghost btn-icon" style="padding:2px">
      <span class="material-symbols-rounded" style="font-size:16px">close</span>
    </button>`;
  container.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 3500);
  setTimeout(() => t.remove(), 4000);
}

function animateCounter(el, target, suffix = '', duration = 1600) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const prog = Math.min((timestamp - start) / duration, 1);
    const val = Math.round(easeOutExpo(prog) * target);
    el.textContent = val.toLocaleString() + suffix;
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// ─────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    State.theme = saved;
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    State.theme = prefersDark ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', State.theme);
  const icon = $('#theme-icon');
  if (icon) icon.textContent = State.theme === 'dark' ? 'light_mode' : 'dark_mode';
}

function toggleTheme() {
  State.theme = State.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', State.theme);
  localStorage.setItem('theme', State.theme);
  const icon = $('#theme-icon');
  if (icon) icon.textContent = State.theme === 'dark' ? 'light_mode' : 'dark_mode';
  showToast(`Switched to ${State.theme} mode`, 'info');
}

// ─────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────
async function initSplash() {
  const splash = $('#splash');
  if (splash) {
    splash.style.display = 'none';
  }
  showLanding();
}

// ─────────────────────────────────────────────────────────
// PAGE ROUTING
// ─────────────────────────────────────────────────────────
function showLanding() {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const land = $('#landing');
  if (land) { land.style.display = 'flex'; land.classList.add('active'); }
  State.auth.loggedIn = false;
  const fab = $('#app-fab-container');
  if (fab) fab.style.display = 'none';
  const chat = $('#floating-chat');
  if (chat) chat.style.display = 'none';
  const bottomNav = $('#mobile-bottom-nav');
  if (bottomNav) bottomNav.classList.remove('visible-nav');
  initLandingAnimations();
}

function showAuth(mode = 'login') {
  hideLanding();
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const auth = $('#auth-page');
  if (auth) { auth.style.display = 'flex'; auth.classList.add('active'); }
  switchAuthMode(mode);
}

function hideLanding() {
  const land = $('#landing');
  if (land) { land.style.display = 'none'; land.classList.remove('active'); }
}

function showOnboarding(step = 1) {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const ob = $('#onboarding-page');
  if (ob) { ob.style.display = 'flex'; ob.classList.add('active'); }
  goToOnboardingStep(step);
}

function showApp() {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const app = $('#app-shell');
  if (app) { app.style.display = 'flex'; app.classList.add('active'); }
  State.auth.loggedIn = true;
  const fab = $('#app-fab-container');
  if (fab) fab.style.display = 'flex';
  // Only show bottom nav on mobile/tablet widths
  const bottomNav = $('#mobile-bottom-nav');
  if (bottomNav && window.innerWidth <= 900) bottomNav.classList.add('visible-nav');
  navigateTo('dashboard');
  updateUserUI();
}

function navigateTo(view) {
  State.currentView = view;
  
  // Hide FAB container on map page to keep view clean and prevent overlapping map controls
  const fab = $('#app-fab-container');
  if (fab) {
    if (view === 'maps') {
      fab.style.display = 'none';
      const chat = $('#floating-chat');
      if (chat) chat.style.display = 'none';
    } else {
      fab.style.display = 'flex';
    }
  }

  $$('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
  $$('.bottom-nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.mobileTab === view);
  });
  $$('.app-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  const target = $(`#view-${view}`);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
    
    // Inject shimmer skeleton loader
    const skeleton = el('div', 'skeleton-overlay', `
      <div style="display:flex;flex-direction:column;gap:16px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div class="skeleton-cell" style="width:180px;height:24px;"></div>
          <div class="skeleton-cell" style="width:100px;height:32px;"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          <div class="card" style="padding:20px;height:110px;display:flex;flex-direction:column;justify-content:space-between;background:var(--surface-1);">
            <div class="skeleton-cell" style="width:50%;height:14px;"></div>
            <div class="skeleton-cell" style="width:75%;height:28px;"></div>
            <div class="skeleton-cell" style="width:40%;height:12px;"></div>
          </div>
          <div class="card" style="padding:20px;height:110px;display:flex;flex-direction:column;justify-content:space-between;background:var(--surface-1);">
            <div class="skeleton-cell" style="width:50%;height:14px;"></div>
            <div class="skeleton-cell" style="width:75%;height:28px;"></div>
            <div class="skeleton-cell" style="width:40%;height:12px;"></div>
          </div>
          <div class="card" style="padding:20px;height:110px;display:flex;flex-direction:column;justify-content:space-between;background:var(--surface-1);">
            <div class="skeleton-cell" style="width:50%;height:14px;"></div>
            <div class="skeleton-cell" style="width:75%;height:28px;"></div>
            <div class="skeleton-cell" style="width:40%;height:12px;"></div>
          </div>
        </div>
        <div class="card" style="padding:20px;height:200px;display:flex;flex-direction:column;gap:12px;margin-top:8px;background:var(--surface-1);">
          <div class="skeleton-cell" style="width:30%;height:16px;"></div>
          <div class="skeleton-cell" style="width:100%;height:120px;"></div>
        </div>
      </div>
    `);
    
    skeleton.style.position = 'absolute';
    skeleton.style.top = '0';
    skeleton.style.left = '0';
    skeleton.style.right = '0';
    skeleton.style.bottom = '0';
    skeleton.style.background = 'var(--surface)';
    skeleton.style.zIndex = '100';
    skeleton.style.borderRadius = 'var(--r-lg)';
    
    const originalPos = target.style.position;
    target.style.position = 'relative';
    target.appendChild(skeleton);
    
    setTimeout(() => {
      skeleton.style.transition = 'opacity 0.25s ease-out';
      skeleton.style.opacity = '0';
      setTimeout(() => {
        try { skeleton.remove(); } catch(e) {}
        target.style.position = originalPos;
        renderView(view);
      }, 250);
    }, 420);
  }
}

function renderView(view) {
  switch(view) {
    case 'dashboard':      renderDashboard(); break;
    case 'maps':           renderMapView(); break;
    case 'analytics':      renderAnalytics(); break;
    case 'predictions':    renderPredictions(); break;
    case 'ai-assistant':   renderAIAssistant(); break;
    case 'data':           renderDataConnections(); break;
    case 'referral':       renderReferralCenter(); break;
    case 'admin':          renderAdmin(); break;
    case 'reports':        renderReports(); break;
  }
}

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────
function switchAuthMode(mode) {
  const loginForm  = $('#login-form');
  const signupForm = $('#signup-form');
  const authTitle  = $('#auth-title');
  const authSub    = $('#auth-subtitle');
  if (mode === 'login') {
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Welcome back';
    if (authSub) authSub.textContent = 'Sign in to your CommunityPulse AI workspace';
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
    if (authTitle) authTitle.textContent = 'Create your account';
    if (authSub) authSub.textContent = 'Join 5,000+ community leaders';
  }
}

async function handleLogin(e) {
  e && e.preventDefault();
  const emailInput = $('#login-email');
  const passwordInput = $('#login-pass');
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  const btn = $('#login-btn');
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    btn.disabled = true;
  }

  if (window.firebaseAuth && email && password) {
    try {
      await window.firebaseSignInWithEmail(window.firebaseAuth, email, password);
      showToast('Successfully signed in!', 'success');
      showOnboarding(1);
    } catch (err) {
      console.error("Firebase Login failed:", err);
      showToast(err.message || 'Login failed. Verify credentials.', 'error');
      if (btn) {
        btn.innerHTML = 'Sign In to Dashboard';
        btn.disabled = false;
      }
    }
  } else {
    // Fallback if Firebase not loaded or fields empty
    setTimeout(() => showOnboarding(1), 1400);
  }
}

async function handleSignup(e) {
  e && e.preventDefault();
  const emailInput = $('#signup-form input[type="email"]');
  const passwordInput = $('#signup-form input[type="password"]');
  const firstNameInput = $('#signup-form input[placeholder="Ranjeet"]');
  const lastNameInput = $('#signup-form input[placeholder="Kumar"]');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const firstName = firstNameInput ? firstNameInput.value.trim() : '';
  const lastName = lastNameInput ? lastNameInput.value.trim() : '';
  const fullName = `${firstName} ${lastName}`.trim();

  const btn = $('#signup-btn');
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    btn.disabled = true;
  }

  if (window.firebaseAuth && email && password) {
    try {
      const credential = await window.firebaseCreateUser(window.firebaseAuth, email, password);
      if (fullName && window.firebaseUpdateProfile) {
        await window.firebaseUpdateProfile(credential.user, { displayName: fullName });
      }
      showToast('Account successfully created!', 'success');
      showOnboarding(1);
    } catch (err) {
      console.error("Firebase Signup failed:", err);
      showToast(err.message || 'Signup failed.', 'error');
      if (btn) {
        btn.innerHTML = 'Create Account — Free';
        btn.disabled = false;
      }
    }
  } else {
    // Fallback if Firebase not loaded
    setTimeout(() => showOnboarding(1), 1400);
  }
}

async function handleOAuth(provider) {
  showToast(`Connecting with ${provider}...`, 'info');
  
  if (provider === 'Google' && window.firebaseAuth && window.googleAuthProvider) {
    try {
      await window.firebaseSignInWithPopup(window.firebaseAuth, window.googleAuthProvider);
      showToast('Successfully signed in with Google!', 'success');
      showOnboarding(1);
    } catch (err) {
      console.error("Firebase Google OAuth failed:", err);
      showToast(err.message || 'Google SSO failed.', 'error');
    }
  } else {
    // General fallback
    setTimeout(() => showOnboarding(1), 1200);
  }
}

// ─────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────
function goToOnboardingStep(step) {
  State.onboardingStep = step;
  $$('.ob-step').forEach(s => s.classList.remove('active'));
  const target = $(`.ob-step[data-step="${step}"]`);
  if (target) target.classList.add('active');

  $$('.step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < step) dot.classList.add('done');
    else if (i + 1 === step) dot.classList.add('active');
  });
  $$('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < step);
  });
}

function nextOnboardingStep() {
  if (State.onboardingStep < 3) goToOnboardingStep(State.onboardingStep + 1);
  else finishOnboarding();
}

function finishOnboarding() {
  showToast('Workspace ready! Welcome to CommunityPulse AI 🎉', 'success');
  setTimeout(() => showApp(), 600);
}

function validateReferral() {
  const input = $('#referral-input');
  if (!input) return;
  const validCodes = ['GEMINI50', 'PULSEPARTNER', 'NVIDIA99', 'GOOGLE2024', 'COMMUNITY'];
  const code = input.value.trim().toUpperCase();
  const resultEl = $('#referral-result');
  if (validCodes.includes(code)) {
    if (resultEl) {
      resultEl.innerHTML = `
        <div class="badge badge-green" style="font-size:13px;padding:8px 16px">
          <span class="material-symbols-rounded" style="font-size:16px">check_circle</span>
          Code applied! +5,000 free processing credits unlocked
        </div>`;
    }
    showToast('Referral code applied! 5,000 credits added.', 'success');
    setTimeout(() => nextOnboardingStep(), 1200);
  } else if (code === '') {
    showToast('Please enter a referral code', 'warn');
  } else {
    if (resultEl) {
      resultEl.innerHTML = `
        <div class="badge badge-red" style="font-size:13px;padding:8px 16px">
          <span class="material-symbols-rounded" style="font-size:16px">error</span>
          Invalid code. Try: GEMINI50
        </div>`;
    }
    showToast('Invalid referral code', 'error');
  }
}

// ─────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = $('#sidebar');
  if (!sidebar) return;
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('mobile-open');
    // Add/remove backdrop overlay
    let overlay = $('#sidebar-backdrop');
    if (sidebar.classList.contains('mobile-open')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-backdrop';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;backdrop-filter:blur(2px);';
        overlay.onclick = () => {
          sidebar.classList.remove('mobile-open');
          overlay.remove();
        };
        document.body.appendChild(overlay);
      }
    } else {
      overlay && overlay.remove();
    }
  } else {
    State.sidebarCollapsed = !State.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', State.sidebarCollapsed);
  }
}

function toggleLandingMobileMenu() {
  const menu = $('#land-mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function updateUserUI() {
  const avatars = $$('.user-initials');
  avatars.forEach(a => a.textContent = State.auth.initials);
  const names = $$('.user-name');
  names.forEach(n => n.textContent = State.auth.name);
  const emails = $$('.user-email');
  emails.forEach(e => e.textContent = State.auth.email);
  // Update greeting
  const greetEl = $('#dashboard-greeting');
  if (greetEl) greetEl.textContent = `${getGreeting()}, ${State.auth.name.split(' ')[0]} 👋`;
  const greetDateEl = $('#dashboard-date');
  if (greetDateEl) {
    const now = new Date();
    greetDateEl.textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
}

// ─────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────
function toggleNotifications() {
  const panel = $('#notif-panel');
  if (!panel) return;
  const isOpen = !panel.classList.contains('hidden');
  closeAllDropdowns();
  if (!isOpen) {
    panel.classList.remove('hidden');
    renderNotifications();
  }
}

function renderNotifications() {
  const list = $('#notif-list');
  if (!list) return;
  const unread = State.notifications.filter(n => !n.read);
  list.innerHTML = State.notifications.map(n => `
    <div class="dropdown-item" style="flex-direction:column;align-items:flex-start;gap:4px;padding:12px;${n.read ? '' : 'background:var(--blue-50)'}">
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <span class="material-symbols-rounded" style="font-size:18px;color:${n.type==='critical'?'var(--red)':n.type==='success'?'var(--green)':n.type==='warn'?'var(--yellow)':'var(--blue)'}">
          ${n.type==='critical'?'emergency':'info'}
        </span>
        <span style="flex:1;font-size:13px">${n.text}</span>
        ${!n.read?'<span style="width:7px;height:7px;border-radius:50%;background:var(--blue);flex-shrink:0"></span>':''}
      </div>
      <span style="font-size:11px;color:var(--text-tertiary);margin-left:26px">${n.time}</span>
    </div>
    <div class="dropdown-divider" style="margin:0"></div>
  `).join('');
  // Update badge
  const badge = $('#notif-badge');
  if (badge) badge.textContent = unread.length || '';
}

function closeAllDropdowns() {
  $$('.dropdown:not(.persistent)').forEach(d => d.classList.add('hidden'));
  $('#user-menu')?.classList.add('hidden');
  $('#notif-panel')?.classList.add('hidden');
  $('#command-palette')?.classList.add('hidden');
}

function toggleUserMenu() {
  const menu = $('#user-menu');
  if (!menu) return;
  const isOpen = !menu.classList.contains('hidden');
  closeAllDropdowns();
  if (!isOpen) menu.classList.remove('hidden');
}



// ─────────────────────────────────────────────────────────
// CANVAS CHART ENGINE
// ─────────────────────────────────────────────────────────
const CHART_BLUE   = '#1A73E8';
const CHART_GREEN  = '#34A853';
const CHART_YELLOW = '#FBBC04';
const CHART_RED    = '#EA4335';
const CHART_GRAY   = '#E0E3F0';

function drawLineChart(canvas, datasets, labels, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Find range
  const allVals = datasets.flatMap(d => d.data);
  const minV = opts.min ?? 0;
  const maxV = opts.max ?? Math.max(...allVals) * 1.1;

  // Grid
  ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#F1F3FF';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    // Y label
    const val = Math.round(maxV - (maxV - minV) / 4 * i);
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  // X labels
  ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
  ctx.textAlign = 'center';
  ctx.font = '11px Inter';
  labels.forEach((lbl, i) => {
    const x = pad.left + (chartW / (labels.length - 1)) * i;
    ctx.fillText(lbl, x, H - 8);
  });

  // Lines & fills
  datasets.forEach(dataset => {
    const pts = dataset.data.map((v, i) => ({
      x: pad.left + (chartW / (dataset.data.length - 1)) * i,
      y: pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
    ctx.lineTo(pts[0].x, pad.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, dataset.color + '30');
    grad.addColorStop(1, dataset.color + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dataset.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  });
}

function drawBarChart(canvas, data, labels, colors, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxV = Math.max(...data) * 1.15;

  // Grid
  ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#F1F3FF';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxV - (maxV / 4) * i);
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  const barW = (chartW / data.length) * 0.6;
  const gap = (chartW / data.length) * 0.4 / 2;

  data.forEach((v, i) => {
    const barH = (v / maxV) * chartH;
    const x = pad.left + (chartW / data.length) * i + gap;
    const y = pad.top + chartH - barH;
    const color = colors[i % colors.length];
    const r = 4;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 8);
  });
}

function drawDonutChart(canvas, data, colors) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.offsetWidth || 160;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const total = data.reduce((a, b) => a + b, 0);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.38, innerR = size * 0.26;
  let start = -Math.PI / 2;
  const gap = 0.03;

  data.forEach((val, i) => {
    const angle = (val / total) * (Math.PI * 2 - gap * data.length);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start + gap / 2, start + angle + gap / 2);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = State.theme === 'dark' ? '#161B27' : '#FFFFFF';
    ctx.fill();
    start += angle + gap;
  });
}
// ─────────────────────────────────────────────────────────
// MAP LEVEL STATE
// ─────────────────────────────────────────────────────────
State.mapLevel = 'dhanbad'; // default: street-level Dhanbad

const MAP_LEVELS = {
  world: {
    name: 'World Overview',
    locationName: 'World',
    sub: 'All Continents',
    stats: { 'Continents': '7', 'Countries Monitored': '54', 'Active Alerts': '1,240', 'Data Sources': '10,000+', 'Coverage': 'Global' },
    zoom: 0.4,
    coords: [20.0, 0.0],
    leafletZoom: 2,
    label: 'World — Global Overview',
  },
  aria: {
    name: 'Asia Region',
    locationName: 'Asia',
    sub: 'Regional View',
    stats: { 'Countries': '48', 'Cities Monitored': '3,200+', 'Active Alerts': '280', 'Sensors Online': '148,000', 'Coverage': 'Asia Pacific' },
    zoom: 0.6,
    coords: [34.0, 100.0],
    leafletZoom: 3,
    label: 'Asia — Regional View',
  },
  asia: {
    name: 'Asia Region',
    locationName: 'Asia',
    sub: 'Regional View',
    stats: { 'Countries': '48', 'Cities Monitored': '3,200+', 'Active Alerts': '280', 'Sensors Online': '148,000', 'Coverage': 'Asia Pacific' },
    zoom: 0.6,
    coords: [34.0, 100.0],
    leafletZoom: 3,
    label: 'Asia — Regional View',
  },
  india: {
    name: 'India',
    locationName: 'India',
    sub: 'National View',
    stats: { 'States': '28', 'Districts': '780', 'Active Alerts': '64', 'Sensors Online': '42,600', 'Population': '1.4 Billion' },
    zoom: 0.8,
    coords: [20.5937, 78.9629],
    leafletZoom: 5,
    label: 'India — National View',
  },
  jharkhand: {
    name: 'Jharkhand',
    locationName: 'Jharkhand, India',
    sub: 'India · Asia · World',
    stats: { 'Districts': '24', 'Cities': '14', 'Active Alerts': '8', 'Sensors Online': '2,840', 'Population': '3.84 Crore' },
    zoom: 1.0,
    coords: [23.3441, 85.3096],
    leafletZoom: 8,
    label: 'Jharkhand — State Overview',
  },
  dhanbad: {
    name: 'Dhanbad City',
    locationName: 'Dhanbad, Jharkhand',
    sub: 'India · Asia · World',
    stats: { 'Population': '12.6 Lakh', 'Districts': '6 Active Zones', 'Alert Markers': '4 Critical', 'Sensors Online': '842 / 856', 'Air Quality (AQI)': '147 – Moderate', 'Last Update': 'Just now' },
    zoom: 1.3,
    coords: [23.7957, 86.4304],
    leafletZoom: 12,
    label: 'Dhanbad City — Street Detail',
  },
  ism_dhanbad: {
    name: 'IIT (ISM) Dhanbad',
    locationName: 'IIT (ISM) Dhanbad',
    sub: 'Dhanbad · Jharkhand · India',
    stats: { 'Students': '8,500+', 'Campus Area': '393 Acres', 'Active Alerts': '1 Critical', 'Sensors Online': '112 / 115', 'Air Quality (AQI)': '118 – Moderate', 'Last Update': 'Just now' },
    zoom: 1.6,
    coords: [23.8142, 86.4412],
    leafletZoom: 16,
    label: 'IIT (ISM) Dhanbad — Campus Detail',
  },
};

const LEVEL_STAT_COLORS = {
  'Alert Markers': '#EA4335',
  'Active Alerts': '#EA4335',
  'Sensors Online': '#34A853',
  'Districts': '#4285F4',
  'Cities Monitored': '#4285F4',
};
function setMapLevel(level) {
  State.mapLevel = level;
  $$('.map-crumb').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });

  const cfg = MAP_LEVELS[level] || MAP_LEVELS['dhanbad'];
  const nameEl = $('#map-location-name');
  if (nameEl) nameEl.textContent = cfg.locationName;
  const subEl = nameEl?.nextElementSibling;
  if (subEl) subEl.textContent = cfg.sub;
  
  const statsList = $('#map-stats-list');
  if (statsList) {
    statsList.innerHTML = Object.entries(cfg.stats).map(([k, v]) => {
      const color = LEVEL_STAT_COLORS[k] ? `color:${LEVEL_STAT_COLORS[k]}` : '';
      return `<div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.6)">${k}</span><span style="font-weight:600;${color}">${v}</span></div>`;
    }).join('');
  }
  
  const labelEl = $('#map-level-label');
  if (labelEl) {
    let iconName = 'location_on';
    if (level === 'world' || level === 'asia' || level === 'aria') iconName = 'public';
    else if (level === 'india') iconName = 'flag';
    else if (level === 'jharkhand') iconName = 'construction';
    else if (level === 'ism_dhanbad') iconName = 'school';
    labelEl.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;margin-right:6px;color:var(--blue)">${iconName}</span>${cfg.label}`;
  }
  
  // Pan and Zoom Leaflet map
  if (window.leafletMap && cfg.coords) {
    window.leafletMap.setView(cfg.coords, cfg.leafletZoom);
    renderLeafletLayers();
  }
  showToast(`Zoomed to: ${cfg.name}`, 'info');
}

function mapZoomIn() {
  if (window.leafletMap) window.leafletMap.zoomIn();
}

function mapZoomOut() {
  if (window.leafletMap) window.leafletMap.zoomOut();
}

function mapResetView() {
  setMapLevel('ism_dhanbad');
}

let _mapIsFullscreen = false;
function toggleMapFullscreen() {
  _mapIsFullscreen = !_mapIsFullscreen;
  const view = $('#view-maps');
  const icon = $('#map-fs-icon');
  const label = $('#map-fs-label');
  if (_mapIsFullscreen) {
    view?.classList.add('map-fullscreen');
    if (icon) icon.textContent = 'fullscreen_exit';
    if (label) label.textContent = 'Exit Full';
    document.body.style.overflow = 'hidden';
  } else {
    view?.classList.remove('map-fullscreen');
    if (icon) icon.textContent = 'fullscreen';
    if (label) label.textContent = 'Full Screen';
    document.body.style.overflow = '';
  }
  setTimeout(() => {
    if (window.leafletMap) window.leafletMap.invalidateSize();
  }, 200);
}

// Keyboard handler: Escape exits fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && _mapIsFullscreen) toggleMapFullscreen();
});

function renderMapView() {
  setTimeout(() => {
    if (!window.leafletMap) {
      const mapContainer = $('#main-map');
      if (mapContainer) {
        window.leafletMap = L.map('main-map', {
          zoomControl: false, // Custom zoom UI
          attributionControl: false
        }).setView([23.8142, 86.4412], 16); // IIT (ISM) Dhanbad Center
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(window.leafletMap);

        L.control.scale({ position: 'bottomright' }).addTo(window.leafletMap);

        // Sync level back to UI when zooming/dragging
        window.leafletMap.on('zoomend', () => {
          const z = window.leafletMap.getZoom();
          let level = 'ism_dhanbad';
          if (z <= 3) level = 'world';
          else if (z <= 5) level = 'asia';
          else if (z <= 7) level = 'india';
          else if (z <= 9) level = 'jharkhand';
          else if (z <= 13) level = 'dhanbad';
          
          if (State.mapLevel !== level) {
            State.mapLevel = level;
            $$('.map-crumb').forEach(b => {
              b.classList.toggle('active', b.dataset.level === level);
            });
            const cfg = MAP_LEVELS[level];
            const nameEl = $('#map-location-name');
            if (nameEl) nameEl.textContent = cfg.locationName;
            const subEl = nameEl?.nextElementSibling;
            if (subEl) subEl.textContent = cfg.sub;
            const statsList = $('#map-stats-list');
            if (statsList) {
              statsList.innerHTML = Object.entries(cfg.stats).map(([k, v]) => {
                const color = LEVEL_STAT_COLORS[k] ? `color:${LEVEL_STAT_COLORS[k]}` : '';
                return `<div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.6)">${k}</span><span style="font-weight:600;${color}">${v}</span></div>`;
              }).join('');
            }
            const labelEl = $('#map-level-label');
            if (labelEl) labelEl.textContent = cfg.label;
          }
        });
      }
    }
    
    if (window.leafletMap) {
      window.leafletMap.invalidateSize();
      renderLeafletLayers();
    }
    
    // Trigger setMapLevel for breadcrumb and statistics alignment
    setMapLevel(State.mapLevel);
  }, 100);
}

function switchMapLayer(layer) {
  State.activeMapLayer = layer;
  $$('.map-layer-btn').forEach(b => b.classList.toggle('active', b.dataset.layer === layer));
  renderLeafletLayers();
  showToast(`Layer: ${layer.charAt(0).toUpperCase() + layer.slice(1)} activated`, 'info');
}

function renderLeafletLayers() {
  if (!window.leafletMap) return;
  
  if (window.leafletLayers) {
    window.leafletLayers.forEach(l => l.remove());
  }
  window.leafletLayers = [];
  
  const layer = State.activeMapLayer;
  
  // 1. Draw layer elements (Polylines/Circles)
  if (layer === 'traffic') {
    const roads = [
      { coords: [[23.3441, 85.3096], [23.36, 85.33], [23.38, 85.37]], color: '#EA4335', name: 'NH-33 (Heavy Traffic)' },
      { coords: [[23.3441, 85.3096], [23.32, 85.28], [23.30, 85.25]], color: '#34A853', name: 'Kanke Road (Normal)' },
      { coords: [[23.7957, 86.4304], [23.82, 86.45], [23.85, 86.48]], color: '#FBBC04', name: 'NH-18 (Moderate)' },
      { coords: [[23.8115, 86.4402], [23.8130, 86.4408], [23.8142, 86.4412]], color: '#34A853', name: 'ISM Main Gate Avenue (Clear)' },
      { coords: [[23.8142, 86.4412], [23.8160, 86.4418], [23.8175, 86.4420]], color: '#FBBC04', name: 'Diamond Hostel Link Road (Moderate)' },
      { coords: [[23.8142, 86.4412], [23.8138, 86.4385], [23.8122, 86.4370]], color: '#EA4335', name: 'Executive Centre Pathway (Congested)' }
    ];
    roads.forEach(r => {
      const pl = L.polyline(r.coords, { color: r.color, weight: 6, opacity: 0.8 });
      pl.bindPopup(`<b>${r.name}</b><br/>Status: ${r.color === '#EA4335' ? 'Congested' : r.color === '#FBBC04' ? 'Moderate' : 'Clear'}`);
      pl.addTo(window.leafletMap);
      window.leafletLayers.push(pl);
    });
  } else if (layer === 'air') {
    const aqis = [
      { name: 'Ranchi AQI Station', coords: [23.3441, 85.3096], aqi: 184, color: '#EA4335', rad: 12000 },
      { name: 'Dhanbad Industrial Zone', coords: [23.7957, 86.4304], aqi: 147, color: '#FBBC04', rad: 12000 },
      { name: 'Jamshedpur Center', coords: [22.8046, 86.2029], aqi: 210, color: '#EA4335', rad: 12000 },
      { name: 'Bokaro Forest Park', coords: [23.6693, 86.1511], aqi: 45, color: '#34A853', rad: 12000 },
      { name: 'IIT (ISM) Dhanbad Campus', coords: [23.8142, 86.4412], aqi: 118, color: '#FBBC04', rad: 600 }
    ];
    aqis.forEach(a => {
      const circle = L.circle(a.coords, {
        color: a.color,
        fillColor: a.color,
        fillOpacity: 0.35,
        radius: 12000
      });
      circle.bindPopup(`<b>${a.name}</b><br/>AQI Level: <b>${a.aqi}</b>`);
      circle.addTo(window.leafletMap);
      window.leafletLayers.push(circle);
    });
  } else if (layer === 'flood') {
    const floods = [
      { name: 'Damodar River Basin', coords: [23.63, 86.35], color: '#4285F4', desc: 'High Risk (River overflow)', rad: 15000 },
      { name: 'Subarnarekha River Plain', coords: [22.82, 86.22], color: '#4285F4', desc: 'Moderate Risk (Low lying plain)', rad: 15000 },
      { name: 'IIT (ISM) Lake Plain', coords: [23.8165, 86.4390], color: '#4285F4', desc: 'Low Risk (Rainwater retention pond)', rad: 300 }
    ];
    floods.forEach(f => {
      const circle = L.circle(f.coords, {
        color: f.color,
        fillColor: f.color,
        fillOpacity: 0.4,
        radius: f.rad
      });
      circle.bindPopup(`<b>${f.name}</b><br/>Flood Vulnerability: <b>${f.desc}</b>`);
      circle.addTo(window.leafletMap);
      window.leafletLayers.push(circle);
    });
  } else if (layer === 'density') {
    const densities = [
      { name: 'Ranchi Urban', coords: [23.3441, 85.3096], pop: '14.5 Lakh', color: '#9c27b0', rad: 20000 },
      { name: 'Dhanbad Metro', coords: [23.7957, 86.4304], pop: '12.6 Lakh', color: '#9c27b0', rad: 20000 },
      { name: 'Jamshedpur Metro', coords: [22.8046, 86.2029], pop: '15.2 Lakh', color: '#9c27b0', rad: 20000 },
      { name: 'IIT (ISM) Student Hostels', coords: [23.8155, 86.4430], pop: '8,500 Students', color: '#9c27b0', rad: 350 }
    ];
    densities.forEach(d => {
      const circle = L.circle(d.coords, {
        color: d.color,
        fillColor: d.color,
        fillOpacity: 0.3,
        radius: d.rad
      });
      circle.bindPopup(`<b>${d.name}</b><br/>Estimated Population: <b>${d.pop}</b>`);
      circle.addTo(window.leafletMap);
      window.leafletLayers.push(circle);
    });
  }
  
  // 2. Draw critical alert markers
  const alerts = [
    { id: '1', title: 'Flood Warning (High)', desc: 'Rainfall exceeds 75mm in Damodar basin. Risk is high.', coords: [23.63, 86.35] },
    { id: '2', title: 'Traffic Congestion', desc: 'Average speed on NH-18 fell below 12 km/h.', coords: [23.82, 86.45] },
    { id: '3', title: 'Air Quality degraded', desc: 'AQI in Jamshedpur hit 210. Deploy filters.', coords: [22.8046, 86.2029] },
    { id: '4', title: 'Water Disruption (Hostel 10)', desc: 'Main supply line leakage near Executive Hostel path. Maintenance is resolving.', coords: [23.8125, 86.4395] }
  ];
  
  alerts.forEach(alert => {
    const marker = L.circleMarker(alert.coords, {
      color: '#EA4335',
      fillColor: '#EA4335',
      fillOpacity: 0.85,
      radius: 9,
      weight: 3
    }).addTo(window.leafletMap);
    
    marker.bindPopup(`
      <div style="color:#1c2129;font-family:sans-serif;padding:2px;min-width:160px;">
        <h4 style="margin:0 0 6px;color:#EA4335;font-weight:700;">🚨 ${alert.title}</h4>
        <p style="margin:0 0 8px;font-size:11px;color:#555;line-height:1.3;">${alert.desc}</p>
        <button onclick="window.resolveMapAlert('${alert.id}')" style="background:#EA4335;color:#fff;border:none;padding:5px 10px;font-size:10px;font-weight:600;border-radius:4px;cursor:pointer;width:100%;">Resolve Alert</button>
      </div>
    `);
    
    marker.on('click', () => {
      const nameEl = $('#map-location-name');
      if (nameEl) nameEl.textContent = alert.title;
      const subEl = nameEl?.nextElementSibling;
      if (subEl) subEl.textContent = 'Active Alert Marker';
      
      const statsList = $('#map-stats-list');
      if (statsList) {
        statsList.innerHTML = `
          <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.6)">Latitude</span><span style="font-weight:600">${alert.coords[0]}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.6)">Longitude</span><span style="font-weight:600">${alert.coords[1]}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:rgba(255,255,255,0.6)">Description</span><span style="font-weight:600;color:#EA4335">Critical Alert</span></div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;line-height:1.4;">${alert.desc}</div>
        `;
      }
    });
    
    window.leafletLayers.push(marker);
  });
}

window.resolveMapAlert = function(id) {
  showToast(`Alert #${id} resolved successfully!`, 'success');
  if (window.leafletMap) {
    window.leafletMap.closePopup();
    renderLeafletLayers();
  }
};

// ─────────────────────────────────────────────────────────
// MAP CANVAS RENDERER — HIERARCHICAL GEOGRAPHIC VIEWS
// ─────────────────────────────────────────────────────────
// Obsolete canvas map renderer (replaced by Leaflet)

// ─── WORLD MAP ───
function drawWorldMap(ctx, W, H) {
  // Sky-blue ocean background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a1628');
  bg.addColorStop(1, '#0d2545');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(26,115,232,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += W / 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += H / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Continents (simplified polygons)
  const continents = [
    { name: 'North America', x: W*0.12, y: H*0.25, w: W*0.18, h: H*0.32, color: '#2d4a7a' },
    { name: 'South America', x: W*0.2, y: H*0.58, w: W*0.10, h: H*0.28, color: '#2d4a7a' },
    { name: 'Europe', x: W*0.44, y: H*0.18, w: W*0.10, h: H*0.18, color: '#2d4a7a' },
    { name: 'Africa', x: W*0.45, y: H*0.38, w: W*0.11, h: H*0.36, color: '#2d4a7a' },
    { name: 'Asia', x: W*0.55, y: H*0.1, w: W*0.28, h: H*0.46, color: '#1a3660', highlighted: true },
    { name: 'Australia', x: W*0.75, y: H*0.62, w: W*0.10, h: H*0.18, color: '#2d4a7a' },
  ];
  continents.forEach(c => {
    ctx.fillStyle = c.highlighted ? 'rgba(26,115,232,0.35)' : 'rgba(45,74,122,0.8)';
    ctx.strokeStyle = c.highlighted ? 'rgba(26,115,232,0.8)' : 'rgba(100,140,200,0.3)';
    ctx.lineWidth = c.highlighted ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, c.h, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.highlighted ? '#fff' : 'rgba(255,255,255,0.5)';
    ctx.font = c.highlighted ? 'bold 11px Inter' : '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(c.name, c.x + c.w/2, c.y + c.h/2 + 4);
  });

  // India marker
  const ix = W*0.62, iy = H*0.42;
  [16,10,5].forEach((r,i) => { ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI*2); ctx.fillStyle = `rgba(26,115,232,${[0.12,0.25,0.7][i]})`; ctx.fill(); });
  ctx.beginPath(); ctx.arc(ix, iy, 4, 0, Math.PI*2); ctx.fillStyle = '#34A853'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('🇮🇳 India/Dhanbad', ix, iy - 18);

  drawLegend(ctx, W, H, 'World View — Click breadcrumb to drill down');
}

// ─── ASIA MAP ───
function drawAsiaMap(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b1a30'); bg.addColorStop(1, '#0f2040');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(26,115,232,0.07)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += W/16) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += H/8) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  const countries = [
    { name: 'China', x:W*0.5, y:H*0.15, w:W*0.28, h:H*0.38, color:'#1a3060' },
    { name: 'India', x:W*0.3, y:H*0.38, w:W*0.2, h:H*0.32, color:'#1a3060', highlighted:true },
    { name: 'Russia (Siberia)', x:W*0.38, y:H*0.04, w:W*0.45, h:H*0.14, color:'#1a3060' },
    { name: 'SE Asia', x:W*0.6, y:H*0.55, w:W*0.18, h:H*0.25, color:'#1a3060' },
    { name: 'Japan', x:W*0.82, y:H*0.2, w:W*0.06, h:H*0.18, color:'#1a3060' },
    { name: 'Middle East', x:W*0.18, y:H*0.3, w:W*0.14, h:H*0.18, color:'#1a3060' },
  ];
  countries.forEach(c => {
    ctx.fillStyle = c.highlighted ? 'rgba(26,115,232,0.4)' : 'rgba(26,48,96,0.85)';
    ctx.strokeStyle = c.highlighted ? '#4285F4' : 'rgba(100,140,200,0.25)';
    ctx.lineWidth = c.highlighted ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.highlighted ? '#fff' : 'rgba(255,255,255,0.55)';
    ctx.font = c.highlighted ? 'bold 12px Inter' : '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(c.name, c.x + c.w/2, c.y + c.h/2 + 4);
  });

  // Jharkhand/Dhanbad marker inside India
  const mx = W*0.41, my = H*0.52;
  [18,11,6].forEach((r,i) => { ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2); ctx.fillStyle = `rgba(234,67,53,${[0.15,0.3,0.7][i]})`; ctx.fill(); });
  ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI*2); ctx.fillStyle = '#EA4335'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'left';
  ctx.fillText('📍 Jharkhand', mx + 10, my + 4);

  drawLegend(ctx, W, H, 'Asia Region — India highlighted');
}

// ─── INDIA MAP ───
function drawIndiaMap(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c1e38'); bg.addColorStop(1, '#102544');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(26,115,232,0.06)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // India shape (simplified)
  ctx.beginPath();
  ctx.moveTo(W*0.28, H*0.05);
  ctx.lineTo(W*0.72, H*0.05);
  ctx.lineTo(W*0.80, H*0.25);
  ctx.lineTo(W*0.78, H*0.55);
  ctx.lineTo(W*0.60, H*0.85);
  ctx.lineTo(W*0.50, H*0.95);
  ctx.lineTo(W*0.40, H*0.85);
  ctx.lineTo(W*0.22, H*0.55);
  ctx.lineTo(W*0.20, H*0.25);
  ctx.closePath();
  ctx.fillStyle = 'rgba(26,60,120,0.7)';
  ctx.strokeStyle = 'rgba(100,160,255,0.3)';
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();

  // States rough outlines
  const stateLines = [
    [W*0.28, H*0.35, W*0.72, H*0.35],
    [W*0.28, H*0.6, W*0.72, H*0.6],
    [W*0.5, H*0.05, W*0.5, H*0.95],
  ];
  stateLines.forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle = 'rgba(100,150,220,0.15)'; ctx.lineWidth = 1; ctx.stroke();
  });

  // City dots
  const cities = [
    { name:'Delhi', x:W*0.42, y:H*0.22 },
    { name:'Mumbai', x:W*0.30, y:H*0.52 },
    { name:'Bangalore', x:W*0.42, y:H*0.75 },
    { name:'Kolkata', x:W*0.64, y:H*0.42 },
    { name:'Hyderabad', x:W*0.45, y:H*0.62 },
    { name:'Chennai', x:W*0.50, y:H*0.78 },
  ];
  cities.forEach(c => {
    ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(26,115,232,0.7)'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
    ctx.fillText(c.name, c.x, c.y - 8);
  });

  // Jharkhand highlight
  const jx = W*0.58, jy = H*0.38;
  ctx.fillStyle = 'rgba(26,115,232,0.25)';
  ctx.strokeStyle = '#4285F4';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(jx-30, jy-18, 90, 52, 6); ctx.fill(); ctx.stroke();
  [20,13,7].forEach((r,i) => { ctx.beginPath(); ctx.arc(jx+15, jy+8, r, 0, Math.PI*2); ctx.fillStyle = `rgba(234,67,53,${[0.15,0.3,0.8][i]})`; ctx.fill(); });
  ctx.beginPath(); ctx.arc(jx+15, jy+8, 6, 0, Math.PI*2); ctx.fillStyle = '#EA4335'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
  ctx.fillText('⛏ Jharkhand', jx+15, jy - 5);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px Inter';
  ctx.fillText('📍 Dhanbad', jx+15, jy + 24);

  drawLegend(ctx, W, H, 'India — Jharkhand highlighted');
}

// ─── JHARKHAND MAP ───
function drawJharkhandMap(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c1e38'); bg.addColorStop(1, '#0e2540');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(26,115,232,0.06)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Jharkhand outline
  ctx.beginPath();
  ctx.moveTo(W*0.18, H*0.12);
  ctx.lineTo(W*0.82, H*0.10);
  ctx.lineTo(W*0.88, H*0.45);
  ctx.lineTo(W*0.75, H*0.88);
  ctx.lineTo(W*0.50, H*0.92);
  ctx.lineTo(W*0.25, H*0.88);
  ctx.lineTo(W*0.12, H*0.45);
  ctx.closePath();
  ctx.fillStyle = 'rgba(26,60,120,0.65)'; ctx.strokeStyle = 'rgba(100,180,255,0.35)'; ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();

  // Districts
  const dists = [
    { name:'Dhanbad', x:W*0.65, y:H*0.32, size:22, highlight:true },
    { name:'Ranchi', x:W*0.38, y:H*0.52, size:16 },
    { name:'Jamshedpur', x:W*0.72, y:H*0.58, size:14 },
    { name:'Bokaro', x:W*0.60, y:H*0.45, size:12 },
    { name:'Hazaribagh', x:W*0.45, y:H*0.32, size:11 },
    { name:'Giridih', x:W*0.52, y:H*0.28, size:10 },
    { name:'Deoghar', x:W*0.58, y:H*0.2, size:10 },
    { name:'Dumka', x:W*0.70, y:H*0.22, size:10 },
  ];
  dists.forEach(d => {
    const r = d.size;
    if (d.highlight) {
      [r+12, r+6, r].forEach((pr, i) => { ctx.beginPath(); ctx.arc(d.x, d.y, pr, 0, Math.PI*2); ctx.fillStyle = `rgba(234,67,53,${[0.12,0.22,0.5][i]})`; ctx.fill(); });
      ctx.beginPath(); ctx.arc(d.x, d.y, 8, 0, Math.PI*2); ctx.fillStyle = '#EA4335'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
      ctx.fillText('📍 ' + d.name, d.x, d.y - r - 6);
    } else {
      ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI*2); ctx.fillStyle = 'rgba(26,115,232,0.8)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(d.name, d.x, d.y - 9);
    }
  });

  // River
  ctx.beginPath(); ctx.moveTo(W*0.2, H*0.35); ctx.bezierCurveTo(W*0.4, H*0.4, W*0.55, H*0.55, W*0.8, H*0.65);
  ctx.strokeStyle = 'rgba(66,133,244,0.35)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(66,133,244,0.5)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Damodar River', W*0.5, H*0.52);

  drawLegend(ctx, W, H, 'Jharkhand State — Dhanbad highlighted');
}

// ─── DHANBAD CITY MAP ───
function drawDhanbadMap(ctx, W, H, layer) {
  ctx.save();
  ctx.translate(W/2 + State.mapPanX, H/2 + State.mapPanY);
  ctx.scale(State.mapZoom * 0.8, State.mapZoom * 0.8);
  ctx.translate(-W/2, -H/2);

  // Dark city background with grid
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f1e38'); bg.addColorStop(1, '#162840');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // City grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 35) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 35) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // Damodar River
  ctx.beginPath();
  ctx.moveTo(0, H*0.72);
  ctx.bezierCurveTo(W*0.2, H*0.68, W*0.45, H*0.75, W*0.7, H*0.7);
  ctx.bezierCurveTo(W*0.85, H*0.67, W*0.95, H*0.65, W, H*0.64);
  ctx.strokeStyle = 'rgba(66,133,244,0.5)'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = 'rgba(66,133,244,0.35)'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('Damodar River', W*0.35, H*0.79);

  // Coal fields (Jharia)
  const coalZone = { x: W*0.05, y: H*0.45, w: W*0.22, h: H*0.22 };
  ctx.fillStyle = 'rgba(80,50,10,0.4)'; ctx.strokeStyle = 'rgba(200,130,30,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(coalZone.x, coalZone.y, coalZone.w, coalZone.h, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,180,50,0.8)'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('⛏ Jharia Coalfields', coalZone.x + coalZone.w/2, coalZone.y + coalZone.h/2 + 4);

  // Parks/green areas
  [{x:W*0.48,y:H*0.22,r:32},{x:W*0.72,y:H*0.55,r:22}].forEach(g => {
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(52,168,83,0.18)'; ctx.strokeStyle = 'rgba(52,168,83,0.3)'; ctx.lineWidth = 1;
    ctx.fill(); ctx.stroke();
  });

  // Major roads
  const roads = [
    { pts:[[0, H*0.5], [W*0.35, H*0.48], [W*0.6, H*0.45], [W, H*0.42]], w:6, color:'rgba(255,255,255,0.18)' },  // NH
    { pts:[[0, H*0.3], [W*0.3, H*0.32], [W*0.65, H*0.3], [W, H*0.28]], w:4, color:'rgba(255,255,255,0.12)' },
    { pts:[[W*0.38, 0], [W*0.40, H*0.55], [W*0.42, H]], w:4, color:'rgba(255,255,255,0.12)' },
    { pts:[[W*0.62, 0], [W*0.60, H*0.45], [W*0.63, H]], w:3, color:'rgba(255,255,255,0.1)' },
    { pts:[[W*0.18, 0], [W*0.2, H*0.65], [W*0.22, H]], w:3, color:'rgba(255,255,255,0.1)' },
    { pts:[[W*0.82, 0], [W*0.80, H*0.68]], w:3, color:'rgba(255,255,255,0.1)' },
    { pts:[[0, H*0.62], [W*0.38, H*0.6], [W*0.7, H*0.64], [W, H*0.62]], w:3, color:'rgba(255,255,255,0.09)' },
  ];
  roads.forEach(road => {
    ctx.beginPath(); ctx.moveTo(...road.pts[0]);
    road.pts.slice(1).forEach(([x,y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = road.color; ctx.lineWidth = road.w; ctx.stroke();
  });

  // NH label
  ctx.fillStyle = 'rgba(255,200,80,0.9)'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('NH-2 (Grand Trunk Road)', W*0.5, H*0.44);

  // Layer overlay
  if (layer === 'traffic') drawDhanbadTraffic(ctx, W, H);
  else if (layer === 'air') drawDhanbadAir(ctx, W, H);
  else if (layer === 'flood') drawDhanbadFlood(ctx, W, H);
  else if (layer === 'density') drawDhanbadDensity(ctx, W, H);
  else drawDhanbadTraffic(ctx, W, H);

  // Zones
  const zones = [
    { x:W*0.22, y:H*0.18, name:'Dhanbad City\nCentre', col:'#4285F4' },
    { x:W*0.07, y:H*0.52, name:'Jharia', col:'#FBBC04' },
    { x:W*0.58, y:H*0.55, name:'Sindri', col:'#34A853' },
    { x:W*0.82, y:H*0.3, name:'Bokaro\nBorder', col:'#9AA0AC' },
    { x:W*0.45, y:H*0.12, name:'Katras', col:'#9AA0AC' },
    { x:W*0.72, y:H*0.15, name:'Dhanbad\nStation', col:'#4285F4' },
    { x:W*0.35, y:H*0.82, name:'Topchanchi\nLake', col:'#4285F4' },
  ];
  zones.forEach(z => {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px Inter'; ctx.textAlign = 'center';
    z.name.split('\n').forEach((line, i) => ctx.fillText(line, z.x, z.y + i*11));
  });

  // Markers
  const markers = [
    { x:W*0.4, y:H*0.35, color:'#1A73E8', label:'CommunityPulse HQ', icon:'🏛' },
    { x:W*0.22, y:H*0.28, color:'#34A853', label:'Zone A – Normal', icon:'🟢' },
    { x:W*0.62, y:H*0.42, color:'#FBBC04', label:'Zone B – Alert', icon:'⚠' },
    { x:W*0.15, y:H*0.44, color:'#EA4335', label:'Zone C – Critical', icon:'🔴' },
    { x:W*0.78, y:H*0.58, color:'#34A853', label:'Hospital A', icon:'🏥' },
    { x:W*0.55, y:H*0.22, color:'#4285F4', label:'School District', icon:'🏫' },
    { x:W*0.68, y:H*0.34, color:'#FBBC04', label:'Coal Mine', icon:'⛏' },
  ];
  markers.forEach(m => {
    [22, 14, 7].forEach((r, i) => {
      ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI*2);
      ctx.fillStyle = m.color + (['18','30','70'][i]); ctx.fill();
    });
    ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, Math.PI*2); ctx.fillStyle = m.color; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
    ctx.fillText(m.icon + ' ' + m.label.split(' – ')[0], m.x, m.y - 20);
  });

  // Compass
  drawCompass(ctx, W - 48, H - 48, 22);

  // Scale bar
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
  ctx.fillRect(W*0.07, H - 30, 80, 2);
  ctx.fillText('≈ 5 km', W*0.07 + 40, H - 34);

  ctx.restore();
  drawLegend(ctx, W, H, '📍 Dhanbad, Jharkhand — Real-time Community Intelligence');
}

function drawDhanbadTraffic(ctx, W, H) {
  const segs = [
    { x:W*0.15, y:H*0.49, w:W*0.14, h:5, color:'#34A853' },
    { x:W*0.32, y:H*0.47, w:W*0.1, h:5, color:'#FBBC04' },
    { x:W*0.48, y:H*0.44, w:W*0.12, h:5, color:'#EA4335' },
    { x:W*0.63, y:H*0.42, w:W*0.1, h:5, color:'#FBBC04' },
    { x:W*0.78, y:H*0.41, w:W*0.1, h:5, color:'#34A853' },
    { x:W*0.1, y:H*0.29, w:W*0.18, h:4, color:'#34A853' },
    { x:W*0.36, y:H*0.31, w:W*0.1, h:4, color:'#1A73E8' },
  ];
  segs.forEach(s => {
    ctx.fillStyle = s.color + 'CC';
    ctx.fillRect(s.x, s.y - s.h/2, s.w, s.h);
  });
}

function drawDhanbadAir(ctx, W, H) {
  [{x:W*0.08,y:H*0.5,r:80,c:'#EA4335'},{x:W*0.35,y:H*0.38,r:70,c:'#FBBC04'},{x:W*0.6,y:H*0.45,r:60,c:'#34A853'},{x:W*0.8,y:H*0.35,r:50,c:'#34A853'}].forEach(z => {
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0, z.c+'45'); g.addColorStop(1, z.c+'00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle = '#EA4335'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('AQI: 190 (Jharia)', W*0.08, H*0.38);
  ctx.fillStyle = '#FBBC04';
  ctx.fillText('AQI: 147 (City)', W*0.35, H*0.28);
}

function drawDhanbadFlood(ctx, W, H) {
  [{x:W*0.3,y:H*0.75,r:90},{x:W*0.55,y:H*0.78,r:65},{x:W*0.15,y:H*0.82,r:55}].forEach(z => {
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0,'rgba(26,115,232,0.45)'); g.addColorStop(1,'rgba(26,115,232,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle = 'rgba(100,180,255,0.8)'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
  ctx.fillText('🌊 Flood Risk: HIGH (River Zone)', W*0.4, H*0.63);
}

function drawDhanbadDensity(ctx, W, H) {
  [{x:W*0.22,y:H*0.28,r:90,c:'#EA4335'},{x:W*0.4,y:H*0.38,r:80,c:'#FBBC04'},{x:W*0.1,y:H*0.5,r:70,c:'#FBBC04'},{x:W*0.6,y:H*0.55,r:60,c:'#34A853'},{x:W*0.75,y:H*0.35,r:50,c:'#34A853'}].forEach(z => {
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0, z.c+'50'); g.addColorStop(1, z.c+'00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill();
  });
}

function drawCompass(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(10,18,40,0.7)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#EA4335'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - r + 12);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px Inter';
  ctx.fillText('S', cx, cy + r - 4);
  ctx.fillText('E', cx + r - 4, cy + 3);
  ctx.fillText('W', cx - r + 4, cy + 3);
}

function drawLegend(ctx, W, H, text) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(8, H - 28, text.length * 5.5 + 16, 20, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
  ctx.fillText(text, 16, H - 14);
}

function drawRadarChart(canvas, labels, values, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.offsetWidth || 200;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const n = labels.length;
  const step = (Math.PI * 2) / n;

  // Grid
  [0.2, 0.4, 0.6, 0.8, 1].forEach(factor => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + step * i;
      const x = cx + Math.cos(angle) * r * factor;
      const y = cy + Math.sin(angle) * r * factor;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#E0E3F0';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + step * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#E0E3F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    const lx = cx + Math.cos(angle) * (r + 18);
    const ly = cy + Math.sin(angle) * (r + 18);
    ctx.fillStyle = State.theme === 'dark' ? '#9AA5C0' : '#5F6368';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + step * i;
    const val = values[i] / 100;
    const x = cx + Math.cos(angle) * r * val;
    const y = cy + Math.sin(angle) * r * val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color + '30';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}


function drawTrafficLayer(ctx, W, H) {
  const segments = [
    { x: W*0.2, y: H*0.32, w: W*0.15, h: 6, color: '#34A853' },
    { x: W*0.4, y: H*0.29, w: W*0.1,  h: 6, color: '#FBBC04' },
    { x: W*0.55, y: H*0.37, w: W*0.12, h: 6, color: '#EA4335' },
    { x: W*0.15, y: H*0.57, w: W*0.18, h: 5, color: '#34A853' },
    { x: W*0.5, y: H*0.52, w: W*0.1,  h: 5, color: '#1A73E8' },
  ];
  segments.forEach(s => {
    ctx.fillStyle = s.color + 'CC';
    ctx.fillRect(s.x - s.w/2, s.y - s.h/2, s.w, s.h);
  });
}

function drawAirQualityLayer(ctx, W, H) {
  const zones = [
    { x: W*0.2, y: H*0.3, r: 70, color: '#34A853' },
    { x: W*0.5, y: H*0.45, r: 90, color: '#FBBC04' },
    { x: W*0.75, y: H*0.4, r: 60, color: '#EA4335' },
    { x: W*0.3, y: H*0.7, r: 50, color: '#34A853' },
  ];
  zones.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, z.color + '55');
    grad.addColorStop(1, z.color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFloodLayer(ctx, W, H) {
  // Water zones
  const floodZones = [
    { x: W*0.1, y: H*0.65, r: 80 },
    { x: W*0.4, y: H*0.75, r: 60 },
    { x: W*0.65, y: H*0.8, r: 50 },
  ];
  floodZones.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, '#1A73E880');
    grad.addColorStop(0.7, '#1A73E840');
    grad.addColorStop(1, '#1A73E800');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDensityLayer(ctx, W, H) {
  const heatmap = [
    { x: W*0.3, y: H*0.35, r: 100, color: '#EA4335' },
    { x: W*0.6, y: H*0.5, r: 80,  color: '#FBBC04' },
    { x: W*0.15, y: H*0.6, r: 70, color: '#34A853' },
    { x: W*0.8, y: H*0.3, r: 60,  color: '#FBBC04' },
    { x: W*0.5, y: H*0.75, r: 55, color: '#34A853' },
  ];
  heatmap.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, z.color + '55');
    grad.addColorStop(1, z.color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ─────────────────────────────────────────────────────────
// DASHBOARD RENDER
// ─────────────────────────────────────────────────────────
function renderDashboard() {
  // KPI counters
  const counters = [
    { id: 'kpi-score', val: State.metrics.communityScore, suffix: '' },
    { id: 'kpi-traffic', val: State.metrics.trafficIndex, suffix: '' },
    { id: 'kpi-air', val: State.metrics.airQuality, suffix: '' },
    { id: 'kpi-sat', val: State.metrics.satisfaction, suffix: '%' },
  ];
  counters.forEach(c => {
    const el = $(`#${c.id}`);
    if (el) animateCounter(el, c.val, c.suffix, 1200);
  });

  // Main trend chart
  setTimeout(() => {
    const canvas = $('#dash-trend-chart');
    if (canvas) {
      canvas.height = 220;
      drawLineChart(canvas, [
        { data: [62, 68, 71, 65, 78, 84, 80, 88, 91, 87, 84, 90], color: CHART_BLUE, label: 'Satisfaction' },
        { data: [45, 52, 60, 55, 63, 67, 64, 72, 75, 70, 73, 77], color: CHART_GREEN, label: 'Engagement' },
      ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    }

    // Bar chart
    const barCanvas = $('#dash-bar-chart');
    if (barCanvas) {
      barCanvas.height = 200;
      drawBarChart(barCanvas,
        [450, 320, 580, 210, 390, 720, 640],
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [CHART_BLUE, CHART_GREEN, CHART_BLUE, CHART_YELLOW, CHART_GREEN, CHART_BLUE, CHART_BLUE]);
    }

    // Mini map
    const miniMapContainer = $('#dash-mini-map');
    if (miniMapContainer) {
      if (!window.leafletMiniMap) {
        window.leafletMiniMap = L.map('dash-mini-map', {
          zoomControl: false,
          dragging: false, // Static preview feel
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false
        }).setView([23.7957, 86.4304], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(window.leafletMiniMap);

        // Draw basic traffic overlay lines
        L.polyline([[23.7957, 86.4304], [23.82, 86.45]], { color: '#EA4335', weight: 4 }).addTo(window.leafletMiniMap);
        L.polyline([[23.7957, 86.4304], [23.77, 86.41]], { color: '#34A853', weight: 4 }).addTo(window.leafletMiniMap);
      } else {
        setTimeout(() => window.leafletMiniMap.invalidateSize(), 50);
      }
    }

    // Donut
    const donutCanvas = $('#dash-donut');
    if (donutCanvas) {
      donutCanvas.width = 160;
      donutCanvas.height = 160;
      donutCanvas.style.width = '160px';
      donutCanvas.style.height = '160px';
      drawDonutChart(donutCanvas,
        [35, 25, 20, 12, 8],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED, '#9AA0AC']);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// ANALYTICS RENDER
// ─────────────────────────────────────────────────────────
function renderAnalytics() {
  setTimeout(() => {
    const trendCanvas = $('#analytics-trend');
    if (trendCanvas) {
      trendCanvas.height = 240;
      drawLineChart(trendCanvas, [
        { data: [55, 60, 58, 72, 65, 80, 75, 85, 82, 90, 87, 94], color: CHART_BLUE },
        { data: [40, 45, 50, 48, 58, 62, 68, 65, 72, 70, 76, 80], color: CHART_GREEN },
      ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    }

    const barCanvas = $('#analytics-bar');
    if (barCanvas) {
      barCanvas.height = 200;
      drawBarChart(barCanvas,
        [850, 720, 940, 660, 1100, 890, 760],
        ['Energy', 'Water', 'Waste', 'Traffic', 'Health', 'Safety', 'Environ'],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED, CHART_BLUE, CHART_GREEN, CHART_YELLOW]);
    }

    const radarCanvas = $('#analytics-radar');
    if (radarCanvas) {
      radarCanvas.style.width = '220px';
      radarCanvas.style.height = '220px';
      drawRadarChart(radarCanvas,
        ['Safety', 'Health', 'Environ', 'Infra', 'Social', 'Economy'],
        [84, 72, 65, 90, 78, 82], CHART_BLUE);
    }

    const donutCanvas = $('#analytics-donut');
    if (donutCanvas) {
      donutCanvas.style.width = '180px';
      donutCanvas.style.height = '180px';
      drawDonutChart(donutCanvas,
        [42, 28, 18, 12],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED]);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// MAP VIEW
// ─────────────────────────────────────────────────────────
// Duplicate map view functions removed in favor of Leaflet implementation

// ─────────────────────────────────────────────────────────
// PREDICTIONS RENDER
// ─────────────────────────────────────────────────────────
function renderPredictions() {
  $$('.confidence-ring').forEach(ring => {
    const svg = ring.querySelector('svg');
    const val = parseInt(ring.dataset.val || 85);
    if (svg) {
      const size = 90;
      const r = 34;
      const circ = 2 * Math.PI * r;
      const dash = (val / 100) * circ;
      const color = val > 80 ? '#34A853' : val > 60 ? '#FBBC04' : '#EA4335';
      svg.innerHTML = `
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="7"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7"
          stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>`;
    }
  });
}

// ─────────────────────────────────────────────────────────
// DATA CONNECTIONS
// ─────────────────────────────────────────────────────────
function renderDataConnections() {
  $$('.connector-card').forEach(card => {
    const id = card.dataset.connector;
    card.classList.toggle('connected', State.connectedSources.includes(id));
  });
}

function toggleConnection(connectorId) {
  const card = $(`.connector-card[data-connector="${connectorId}"]`);
  if (State.connectedSources.includes(connectorId)) {
    State.connectedSources = State.connectedSources.filter(c => c !== connectorId);
    card?.classList.remove('connected');
    showToast(`Disconnected from ${connectorId}`, 'warn');
  } else {
    showToast(`Connecting to ${connectorId}...`, 'info');
    setTimeout(() => {
      State.connectedSources.push(connectorId);
      card?.classList.add('connected');
      showToast(`✓ Connected to ${connectorId}`, 'success');
    }, 1200);
  }
}

// ─────────────────────────────────────────────────────────
// DATASET EXPLORER & CSV INTEGRATION
// ─────────────────────────────────────────────────────────

const MOCK_DATASETS = {
  'County_Health_Rankings.csv': {
    headers: ['State', 'County', 'Year span', 'Measure name', 'Raw value'],
    rows: [
      { State: 'US', County: 'United States', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 483.4 },
      { State: 'AL', County: 'Autauga County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 252.0 },
      { State: 'CA', County: 'Los Angeles County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 524.3 },
      { State: 'NY', County: 'New York County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 610.1 },
      { State: 'TX', County: 'Harris County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 480.2 },
      { State: 'FL', County: 'Miami-Dade County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 590.5 },
      { State: 'IL', County: 'Cook County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 640.8 },
      { State: 'AZ', County: 'Maricopa County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 410.3 },
      { State: 'WA', County: 'King County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 320.1 },
      { State: 'MA', County: 'Middlesex County', 'Year span': '2003-2005', 'Measure name': 'Violent crime rate', 'Raw value': 180.4 }
    ]
  },
  'IHME_GBD_2010_MORTALITY_AGE_SPECIFIC_BY_COUNTRY_1970_2010.csv': {
    headers: ['Country Name', 'Year', 'Age Group', 'Sex', 'Number of Deaths', 'Death Rate Per 100,000'],
    rows: [
      { 'Country Name': 'Afghanistan', Year: 1970, 'Age Group': '0-6 days', Sex: 'Male', 'Number of Deaths': 19241, 'Death Rate Per 100,000': 318292.9 },
      { 'Country Name': 'India', Year: 1990, 'Age Group': '1-4 years', Sex: 'Female', 'Number of Deaths': 142000, 'Death Rate Per 100,000': 245.2 },
      { 'Country Name': 'United States', Year: 2010, 'Age Group': '80+', Sex: 'Both sexes', 'Number of Deaths': 850000, 'Death Rate Per 100,000': 5200.5 },
      { 'Country Name': 'Brazil', Year: 2000, 'Age Group': '15-49 years', Sex: 'Male', 'Number of Deaths': 45000, 'Death Rate Per 100,000': 185.0 },
      { 'Country Name': 'Japan', Year: 2005, 'Age Group': '50-69 years', Sex: 'Female', 'Number of Deaths': 12000, 'Death Rate Per 100,000': 95.8 },
      { 'Country Name': 'South Africa', Year: 2010, 'Age Group': '15-49 years', Sex: 'Both sexes', 'Number of Deaths': 220000, 'Death Rate Per 100,000': 780.4 },
      { 'Country Name': 'Germany', Year: 1995, 'Age Group': '70-79 years', Sex: 'Both sexes', 'Number of Deaths': 185000, 'Death Rate Per 100,000': 1950.2 },
      { 'Country Name': 'United Kingdom', Year: 2000, 'Age Group': '80+', Sex: 'Female', 'Number of Deaths': 140000, 'Death Rate Per 100,000': 4800.1 },
      { 'Country Name': 'Mexico', Year: 1980, 'Age Group': '5-14 years', Sex: 'Male', 'Number of Deaths': 8500, 'Death Rate Per 100,000': 35.6 },
      { 'Country Name': 'Australia', Year: 2005, 'Age Group': '80+', Sex: 'Male', 'Number of Deaths': 32000, 'Death Rate Per 100,000': 5100.9 }
    ]
  },
  'TB_Burden_Country.csv': {
    headers: ['Country or territory name', 'ISO 3-character country/territory code', 'Year', 'Estimated total population number', 'Estimated prevalence of TB (all forms) per 100 000 population', 'Estimated number of deaths from TB (all forms, excluding HIV)'],
    rows: [
      { 'Country or territory name': 'Afghanistan', 'ISO 3-character country/territory code': 'AFG', Year: 1990, 'Estimated total population number': 11731193, 'Estimated prevalence of TB (all forms) per 100 000 population': 306, 'Estimated number of deaths from TB (all forms, excluding HIV)': 4300 },
      { 'Country or territory name': 'India', 'ISO 3-character country/territory code': 'IND', Year: 2000, 'Estimated total population number': 1053000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 289, 'Estimated number of deaths from TB (all forms, excluding HIV)': 320000 },
      { 'Country or territory name': 'South Africa', 'ISO 3-character country/territory code': 'ZAF', Year: 2010, 'Estimated total population number': 51000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 850, 'Estimated number of deaths from TB (all forms, excluding HIV)': 25000 },
      { 'Country or territory name': 'Brazil', 'ISO 3-character country/territory code': 'BRA', Year: 2005, 'Estimated total population number': 186000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 48, 'Estimated number of deaths from TB (all forms, excluding HIV)': 5600 },
      { 'Country or territory name': 'China', 'ISO 3-character country/territory code': 'CHN', Year: 1995, 'Estimated total population number': 1200000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 180, 'Estimated number of deaths from TB (all forms, excluding HIV)': 85000 },
      { 'Country or territory name': 'Nigeria', 'ISO 3-character country/territory code': 'NGA', Year: 2008, 'Estimated total population number': 150000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 350, 'Estimated number of deaths from TB (all forms, excluding HIV)': 48000 },
      { 'Country or territory name': 'Russia', 'ISO 3-character country/territory code': 'RUS', Year: 2002, 'Estimated total population number': 144000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 120, 'Estimated number of deaths from TB (all forms, excluding HIV)': 14000 },
      { 'Country or territory name': 'Pakistan', 'ISO 3-character country/territory code': 'PAK', Year: 2010, 'Estimated total population number': 173000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 310, 'Estimated number of deaths from TB (all forms, excluding HIV)': 55000 },
      { 'Country or territory name': 'Indonesia', 'ISO 3-character country/territory code': 'IDN', Year: 2006, 'Estimated total population number': 230000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 240, 'Estimated number of deaths from TB (all forms, excluding HIV)': 68000 },
      { 'Country or territory name': 'Bangladesh', 'ISO 3-character country/territory code': 'BGD', Year: 2004, 'Estimated total population number': 140000000, 'Estimated prevalence of TB (all forms) per 100 000 population': 410, 'Estimated number of deaths from TB (all forms, excluding HIV)': 62000 }
    ]
  }
};

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let insideQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') { i++; }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') { lines.push(row); }
  return lines;
}

function processCSVData(filename, text) {
  const rawLines = parseCSV(text);
  if (rawLines.length === 0) return null;
  const headers = rawLines[0].map(h => h.trim());
  const rows = [];
  for (let i = 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.length === headers.length || (line.length > 1 && line.some(c => c !== ''))) {
      const obj = {};
      headers.forEach((h, idx) => {
        const val = line[idx] ? line[idx].trim() : '';
        // Convert to number if numeric
        const cleanVal = val.replace(/,/g, '');
        obj[h] = isNaN(cleanVal) || cleanVal === '' ? val : Number(cleanVal);
      });
      rows.push(obj);
    }
  }
  return { filename, headers, rows };
}

async function selectDataset(filename) {
  showToast(`Loading dataset ${filename}...`, 'info');
  // Highlight selected dataset card
  $$('.dataset-card').forEach(card => {
    const isSelected = card.getAttribute('onclick').includes(filename);
    card.classList.toggle('selected-dataset', isSelected);
  });
  
  try {
    const response = await fetch(`DATASET/${filename}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const text = await response.text();
    const data = processCSVData(filename, text);
    if (data) {
      State.activeDataset = data;
      State.datasetPage = 0;
      State.connectedSources.push('excel');
      $$('.connector-card[data-connector="excel"]').forEach(c => c.classList.add('connected'));
      showToast(`✓ Loaded ${filename} with ${data.rows.length} rows`, 'success');
      renderDatasetExplorer();
    }
  } catch (err) {
    console.warn(`CORS or local fetch failed for ${filename}, loading local mock data fallback:`, err);
    const data = MOCK_DATASETS[filename];
    if (data) {
      State.activeDataset = { filename, headers: data.headers, rows: data.rows };
      State.datasetPage = 0;
      State.connectedSources.push('excel');
      $$('.connector-card[data-connector="excel"]').forEach(c => c.classList.add('connected'));
      showToast(`Loaded pre-parsed mock fallback for ${filename}`, 'info');
      renderDatasetExplorer();
    } else {
      showToast(`Failed to load dataset: ${err.message}`, 'error');
    }
  }
}

function handleCSVFileUpload(file) {
  if (!file.name.endsWith('.csv')) {
    showToast('Only CSV files are supported in this browser demo', 'error');
    return;
  }
  showToast(`Parsing ${file.name}...`, 'info');
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const data = processCSVData(file.name, text);
    if (data) {
      State.activeDataset = data;
      State.datasetPage = 0;
      State.connectedSources.push('excel');
      $$('.connector-card[data-connector="excel"]').forEach(c => c.classList.add('connected'));
      showToast(`✓ Successfully uploaded and parsed ${file.name}`, 'success');
      renderDatasetExplorer();
    }
  };
  reader.readAsText(file);
}

function renderDatasetExplorer() {
  const panel = $('#dataset-explorer-panel');
  if (!panel || !State.activeDataset) return;
  panel.style.display = 'block';

  // Update header text
  $('#explorer-dataset-name').textContent = State.activeDataset.filename;
  $('#explorer-dataset-rows').textContent = `${State.activeDataset.rows.length.toLocaleString()} rows`;
  $('#explorer-dataset-cols').textContent = `${State.activeDataset.headers.length} columns`;

  // Populate Dropdowns for Chart Builder
  const xSelect = $('#dataset-chart-x');
  const ySelect = $('#dataset-chart-y');
  if (xSelect && ySelect) {
    const prevX = xSelect.value;
    const prevY = ySelect.value;
    xSelect.innerHTML = State.activeDataset.headers.map(h => `<option value="${h}">${h}</option>`).join('');
    ySelect.innerHTML = State.activeDataset.headers.map(h => `<option value="${h}">${h}</option>`).join('');
    if (State.activeDataset.headers.includes(prevX)) xSelect.value = prevX;
    if (State.activeDataset.headers.includes(prevY)) ySelect.value = prevY;
    else if (State.activeDataset.headers.length > 1) ySelect.selectedIndex = 1;
  }

  renderDatasetTable();
  drawDatasetChart();
}

function renderDatasetTable() {
  if (!State.activeDataset) return;
  const thead = $('#dataset-table-head');
  const tbody = $('#dataset-table-body');
  if (!thead || !tbody) return;

  // Filter rows
  const query = State.datasetSearch.toLowerCase().trim();
  const filteredRows = State.activeDataset.rows.filter(row => {
    if (!query) return true;
    return Object.values(row).some(val => String(val).toLowerCase().includes(query));
  });

  // Table Headers
  thead.innerHTML = `<tr>${State.activeDataset.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

  // Paginated Rows
  const startIdx = State.datasetPage * State.datasetPageSize;
  const paginated = filteredRows.slice(startIdx, startIdx + State.datasetPageSize);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${State.activeDataset.headers.length}" style="text-align:center;padding:24px;color:var(--text-tertiary);">No rows match the search query</td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(row => {
      return `<tr>${State.activeDataset.headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('')}</tr>`;
    }).join('');
  }

  // Pagination Info & Buttons
  const totalPages = Math.ceil(filteredRows.length / State.datasetPageSize);
  const info = $('#dataset-table-info');
  if (info) {
    info.textContent = `Showing ${Math.min(filteredRows.length, startIdx + 1)}-${Math.min(filteredRows.length, startIdx + State.datasetPageSize)} of ${filteredRows.length.toLocaleString()} rows`;
  }
  
  const prevBtn = $('#dataset-prev-btn');
  const nextBtn = $('#dataset-next-btn');
  if (prevBtn) prevBtn.disabled = State.datasetPage === 0;
  if (nextBtn) nextBtn.disabled = State.datasetPage >= totalPages - 1 || totalPages === 0;
}

function updateDatasetSearch(val) {
  State.datasetSearch = val;
  State.datasetPage = 0;
  renderDatasetTable();
}

function changeDatasetPage(dir) {
  State.datasetPage += dir;
  renderDatasetTable();
}

function drawDatasetChart() {
  const canvas = $('#dataset-chart-canvas');
  if (!canvas || !State.activeDataset) return;

  const xCol = $('#dataset-chart-x').value;
  const yCol = $('#dataset-chart-y').value;
  const chartType = $('#dataset-chart-type').value;
  if (!xCol || !yCol) return;

  // Extract points
  let points = State.activeDataset.rows.map(row => {
    const rawVal = row[yCol];
    const cleanVal = typeof rawVal === 'string' ? rawVal.replace(/,/g, '') : rawVal;
    return {
      x: row[xCol],
      y: parseFloat(cleanVal)
    };
  }).filter(p => !isNaN(p.y));

  // Limit to first 40 rows for visual clarity
  if (points.length > 40) {
    points = points.slice(0, 40);
  }

  if (points.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#EA4335';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Selected Y-Axis contains no numeric values to plot', canvas.width/2, canvas.height/2);
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 24, bottom: 44, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const yVals = points.map(p => p.y);
  let minY = Math.min(...yVals);
  let maxY = Math.max(...yVals);
  
  // Set boundary thresholds
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  } else {
    const diff = maxY - minY;
    minY = Math.max(0, minY - diff * 0.1);
    maxY = maxY + diff * 0.1;
  }

  // Draw Grid lines & Y Axis Labels
  ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#F1F3FF';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const val = maxY - ((maxY - minY) / 4) * i;
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(val).toLocaleString(), pad.left - 8, y + 3);
  }

  // Draw X Axis Labels (sampled to prevent overlaying)
  ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
  ctx.textAlign = 'center';
  ctx.font = '10px Inter';
  const labelStep = Math.max(1, Math.ceil(points.length / 5));
  points.forEach((p, i) => {
    if (i % labelStep === 0 || i === points.length - 1) {
      const x = pad.left + (chartW / (points.length - 1 || 1)) * i;
      let label = String(p.x);
      if (label.length > 10) label = label.substring(0, 8) + '...';
      ctx.fillText(label, x, H - 12);
    }
  });

  // Plot data points coordinates
  const pts = points.map((p, i) => ({
    x: pad.left + (chartW / (points.length - 1 || 1)) * i,
    y: pad.top + chartH - ((p.y - minY) / (maxY - minY)) * chartH
  }));

  if (chartType === 'line' || chartType === 'area') {
    // Area Fill
    if (chartType === 'area') {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pad.top + chartH);
      pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      grad.addColorStop(0, 'rgba(26, 115, 232, 0.25)');
      grad.addColorStop(1, 'rgba(26, 115, 232, 0.00)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Line Path
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = '#1A73E8';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Data Dots
    pts.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1A73E8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  } else if (chartType === 'bar') {
    const barW = Math.max(2, (chartW / points.length) * 0.7);
    const gap = (chartW / points.length) * 0.3 / 2;
    points.forEach((p, i) => {
      const barH = ((p.y - minY) / (maxY - minY)) * chartH;
      const x = pad.left + (chartW / points.length) * i + gap;
      const y = pad.top + chartH - barH;
      ctx.fillStyle = '#34A853';
      ctx.fillRect(x, y, barW, barH);
    });
  }
}

function summarizeActiveDataset() {
  if (!State.activeDataset) return;
  showToast('Generating AI dataset summary...', 'info');
  navigateTo('ai-assistant');
  const filename = State.activeDataset.filename;
  const prompt = `Can you summarize the dataset "${filename}" with columns: [${State.activeDataset.headers.join(', ')}]? Give me some highlights.`;
  
  // Clear chat input, send prompt
  const input = $('#chat-input');
  if (input) {
    input.value = prompt;
    sendChatMessage();
  }
}

// ─────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────
const AI_RESPONSES = {
  'traffic': {
    text: "Based on real-time sensor data and historical patterns, I predict **peak congestion** in Districts 3 and 5 between 08:00–09:30 AM tomorrow. I recommend activating alternate route guidance on the Eastern Bypass. Confidence: 91%.",
    chart: true
  },
  'pollution': {
    text: "**Districts 7, 12, and 14** show the highest PM2.5 concentrations — averaging 148 µg/m³, which is 3× the WHO guideline. Primary sources: industrial emissions (62%), vehicular traffic (28%), construction dust (10%). I recommend issuing an orange AQI advisory for these areas.",
    chart: false
  },
  'flood': {
    text: "Flood risk analysis complete. **3 high-risk zones identified** in the low-lying areas of Sector 6 and 9 based on 72-hour rainfall forecast (85mm expected). Recommended action: Pre-position emergency response teams and alert 14,200 residents via SMS.",
    chart: true
  },
  'waste': {
    text: "Optimized waste collection schedule generated for the next 7 days. **Route efficiency improved by 23%** by clustering Zones B, D, and F on Tuesdays and Thursdays. This reduces fuel costs by ₹18,400/month and cuts CO₂ emissions by 1.2 tons.",
    chart: false
  },
  'energy': {
    text: "Energy consumption spike of **+34%** detected in the Northern Grid between 18:00–22:00. Root cause analysis suggests a combination of summer AC load (68%) and EV charging demand (22%). Forecast: demand will peak at 847 MW on Wednesday. Recommend activating demand-response protocols.",
    chart: true
  },
  'crime': {
    text: "Predictive crime analysis shows **elevated risk** in Grid Sectors G-7 and H-3 between Friday 10 PM – Saturday 3 AM (next 48h). Historical correlation: 87% accuracy. Recommended: increase mobile patrol frequency by 2× in these sectors.",
    chart: false
  },
  'default': {
    text: "I've analyzed the available datasets across all 6 connected data sources. Here's a summary: Community Health Score is **84/100** (↑4 points from last week), with notable improvements in waste management and citizen satisfaction. 3 predictive alerts require attention. Would you like me to drill deeper into any specific domain?",
    chart: true
  }
};

function getAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('traffic') || q.includes('congestion')) return AI_RESPONSES.traffic;
  if (q.includes('pollution') || q.includes('air') || q.includes('district')) return AI_RESPONSES.pollution;
  if (q.includes('flood') || q.includes('water') || q.includes('rain')) return AI_RESPONSES.flood;
  if (q.includes('waste') || q.includes('collection')) return AI_RESPONSES.waste;
  if (q.includes('energy') || q.includes('power') || q.includes('electricity')) return AI_RESPONSES.energy;
  if (q.includes('crime') || q.includes('safety') || q.includes('police')) return AI_RESPONSES.crime;
  return AI_RESPONSES.default;
}

function renderAIAssistant() {
  if (State.chatHistory.length === 0) {
    appendAIMessage("Hello! I'm **CommunityPulse AI** powered by **Gemini**. I can help you analyze community data, generate predictions, create reports, and answer complex questions about your datasets. Try asking me something!", false);
  }
}

function appendUserMessage(text) {
  const container = $('#chat-messages');
  if (!container) return;
  const msg = el('div', 'chat-msg user');
  msg.innerHTML = `
    <div class="chat-avatar user">
      <span class="material-symbols-rounded" style="font-size:16px">person</span>
    </div>
    <div class="chat-bubble user">${text}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  State.chatHistory.push({ role: 'user', text });
}

function parseMarkdown(text) {
  // Bold markdown
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Bullet points
  html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
  // Wrap list items in ul blocks
  html = html.replace(/(?:<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>');
  // Convert double newlines to paragraph blocks
  html = html.replace(/\n\n/g, '</p><p style="margin-top:10px;line-height:1.75;">');
  return html;
}

function appendAIMessage(text, showChart = false) {
  const container = $('#chat-messages');
  if (!container) return;

  // Thinking indicator
  const thinking = el('div', 'chat-msg');
  thinking.innerHTML = `
    <div class="chat-avatar ai">
      <span class="material-symbols-rounded" style="font-size:16px">auto_awesome</span>
    </div>
    <div class="chat-thinking">
      <div class="chat-dot ai-dot-1" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
      <div class="chat-dot ai-dot-2" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
      <div class="chat-dot ai-dot-3" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
    </div>`;
  container.appendChild(thinking);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    thinking.remove();
    const formattedText = parseMarkdown(text);
    const msg = el('div', 'chat-msg');
    let chartHTML = '';
    if (showChart) {
      chartHTML = `
        <div style="margin-top:12px;padding:12px;background:var(--surface-2);border-radius:var(--r-md)">
          <canvas id="ai-chart-${Date.now()}" style="width:100%;height:160px;display:block"></canvas>
        </div>`;
    }
    msg.innerHTML = `
      <div class="chat-avatar ai">
        <span class="material-symbols-rounded" style="font-size:16px">auto_awesome</span>
      </div>
      <div class="chat-bubble ai">
        <p style="font-size:14px;line-height:1.7">${formattedText}</p>
        ${chartHTML}
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;color:var(--text-tertiary);display:flex;align-items:center;gap:4px">
            <span class="material-symbols-rounded" style="font-size:14px">database</span>
            Sources: BigQuery, IoT Sensors, Govt. API
          </span>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button onclick="exportChat()" class="btn btn-secondary btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">download</span>Export
          </button>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">thumb_up</span>
          </button>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">thumb_down</span>
          </button>
        </div>
      </div>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    if (showChart) {
      setTimeout(() => {
        const canvas = msg.querySelector('canvas');
        if (canvas) {
          drawLineChart(canvas, [
            { data: [40, 55, 48, 65, 72, 68, 80, 76, 88, 84, 91, 95], color: CHART_BLUE },
          ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        }
      }, 100);
    }
    State.chatHistory.push({ role: 'ai', text });
  }, 1400 + Math.random() * 600);
}

function sendChatMessage() {
  const input = $('#chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  appendUserMessage(text);
  const response = getAIResponse(text);
  appendAIMessage(response.text, response.chart);
}

function sendQuickPrompt(text) {
  const input = $('#chat-input');
  if (input) input.value = text;
  sendChatMessage();
}

function exportChat() {
  showToast('Chat exported as PDF', 'success');
}

// ─────────────────────────────────────────────────────────
// REFERRAL CENTER
// ─────────────────────────────────────────────────────────
function renderReferralCenter() {
  const codeEl = $('#my-referral-code');
  if (codeEl) codeEl.textContent = State.referralCode;
  const countEl = $('#referral-count');
  if (countEl) animateCounter(countEl, State.referralCount, '', 1000);
  const progressEl = $('#referral-progress');
  if (progressEl) progressEl.style.width = `${(State.referralCount / 10) * 100}%`;
}

function copyReferralCode() {
  navigator.clipboard.writeText(State.referralCode).catch(() => {});
  showToast('Referral code copied to clipboard!', 'success');
}

function copyReferralLink() {
  const origin = window.location.origin.endsWith('/') ? window.location.origin : `${window.location.origin}/`;
  const link = `${origin}?ref=${State.referralCode}`;
  navigator.clipboard.writeText(link).catch(() => {});
  showToast('Referral link copied!', 'success');
}

function shareOnSocial(platform) {
  const code = State.referralCode || 'PULSE-RK2024';
  const url = window.location.origin.endsWith('/') ? window.location.origin : `${window.location.origin}/`;
  const text = `Join me on CommunityPulse AI, the Decision Intelligence Platform! Use my referral code: ${code} to claim 5,000 free credits.`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  let shareUrl = '';
  switch(platform) {
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
      break;
    case 'x':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent("Join me on CommunityPulse AI")}&body=${encodedText}%0A%0A${encodedUrl}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    showToast(`Shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`, 'success');
  }
}

// ─────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────
function renderReports() {
  // Reports are static HTML, just animate in
}

function downloadReport(name) {
  showToast(`Downloading "${name}"...`, 'info');
  setTimeout(() => showToast(`"${name}" downloaded successfully`, 'success'), 1500);
}

// ─────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────
function renderAdmin() {
  setTimeout(() => {
    const gpuCanvas = $('#gpu-chart');
    if (gpuCanvas) {
      gpuCanvas.height = 140;
      drawLineChart(gpuCanvas, [
        { data: [45, 62, 78, 55, 82, 90, 75, 88, 94, 71, 85, 92], color: '#34A853' },
        { data: [30, 40, 55, 42, 60, 72, 58, 65, 80, 55, 68, 74], color: '#1A73E8' },
      ], ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']);
    }
    const bqCanvas = $('#bq-chart');
    if (bqCanvas) {
      bqCanvas.height = 140;
      drawBarChart(bqCanvas,
        [1200, 980, 1450, 820, 1680, 1340, 1120],
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [CHART_BLUE]);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────
function switchSettingsPanel(panel) {
  State.activeSettingsPanel = panel;
  $$('.settings-nav-item').forEach(i => i.classList.toggle('active', i.dataset.panel === panel));
  $$('.settings-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === panel));
}

// ─────────────────────────────────────────────────────────
// LANDING PAGE ANIMATIONS
// ─────────────────────────────────────────────────────────
function initLandingAnimations() {
  // Stats counters
  const stats = [
    { id: 'stat-communities', val: 2400, suffix: '+' },
    { id: 'stat-datasets', val: 18700, suffix: '+' },
    { id: 'stat-decisions', val: 4200000, suffix: '' },
    { id: 'stat-predictions', val: 98, suffix: '%' },
  ];
  stats.forEach(s => {
    const el = $(`#${s.id}`);
    if (el) animateCounter(el, s.val, s.suffix, 2000);
  });

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
}

// ─────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────
function toggleFAQ(item) {
  item.classList.toggle('open');
}

// ─────────────────────────────────────────────────────────
// FLOATING AI CHAT & SIMULATED EMERGENCY DISPATCH
// ─────────────────────────────────────────────────────────
function toggleFloatingChat() {
  const chat = $('#floating-chat');
  if (!chat) return;
  const isVisible = chat.style.display === 'flex';
  chat.style.display = isVisible ? 'none' : 'flex';
  if (!isVisible) {
    $('#floating-chat-input')?.focus();
  }
}

function sendFloatingChatMessage() {
  const input = $('#floating-chat-input');
  const body = $('#floating-chat-body');
  if (!input || !body || !input.value.trim()) return;

  const userText = input.value.trim();
  
  // Render user bubble
  const userMsg = el('div', '', `
    <div style="background: var(--blue); color: #fff; padding: 10px; border-radius: var(--r-md); max-width: 85%; align-self: flex-end; line-height: 1.4; margin-left: auto; margin-bottom: 8px;">
      ${userText}
    </div>`);
  body.appendChild(userMsg);
  input.value = '';
  body.scrollTop = body.scrollHeight;

  // Render typing indicators
  const typingMsg = el('div', '', `
    <div style="background: var(--surface-2); padding: 10px; border-radius: var(--r-md); max-width: 85%; align-self: flex-start; line-height: 1.4; margin-bottom: 8px; color: var(--text-primary);">
      Typing...
    </div>`);
  body.appendChild(typingMsg);
  body.scrollTop = body.scrollHeight;

  // Trigger simulated response
  setTimeout(() => {
    typingMsg.remove();
    let reply = "I've analyzed your telemetry stream. Everything looks steady. Let me know if you need specific insights on our local datasets (TB Burden, County Health, Mortality).";
    if (userText.toLowerCase().includes('hello') || userText.toLowerCase().includes('hi')) {
      reply = "Hello! How can I assist you with CommunityPulse AI today? Ask me to summarize datasets or trigger disaster simulations.";
    } else if (userText.toLowerCase().includes('dataset') || userText.toLowerCase().includes('csv')) {
      reply = "You can select preloaded CSV datasets in the Data Explorer tab, or drop your own local CSV file to visualize stats and trends.";
    } else if (userText.toLowerCase().includes('disaster') || userText.toLowerCase().includes('emergency')) {
      reply = "Click the floating siren button to run an emergency action broadcast simulation, warning citizen devices in risk sectors.";
    }
    
    const replyMsg = el('div', '', `
      <div style="background: var(--surface-2); padding: 10px; border-radius: var(--r-md); max-width: 85%; align-self: flex-start; line-height: 1.4; margin-bottom: 8px; color: var(--text-primary);">
        ${reply}
      </div>`);
    body.appendChild(replyMsg);
    body.scrollTop = body.scrollHeight;
    if (navigator.vibrate) navigator.vibrate(10);
  }, 1000);
}

function triggerEmergencyAlert() {
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 150]);
  showToast('🚨 Simulated emergency alert broadcast dispatched to District 7!', 'error');
  
  navigateTo('alerts');
  
  // Flash siren screen overlay
  const flash = el('div', '', '');
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.right = '0';
  flash.style.bottom = '0';
  flash.style.background = 'rgba(234, 67, 53, 0.35)';
  flash.style.zIndex = '9999';
  flash.style.pointerEvents = 'none';
  document.body.appendChild(flash);
  
  setTimeout(() => {
    flash.style.transition = 'opacity 0.8s ease-out';
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 800);
  }, 150);
}

// ─────────────────────────────────────────────────────────
// GESTURE NAVIGATION & TOUCH ENGINE
// ─────────────────────────────────────────────────────────

const TABS_ORDER = ['dashboard', 'ai-assistant', 'analytics', 'maps', 'predictions', 'reports', 'alerts', 'data', 'workflow', 'feedback', 'team', 'referral', 'admin', 'settings'];

function navigateTabDirection(dir) {
  const currentIdx = TABS_ORDER.indexOf(State.currentView);
  if (currentIdx === -1) return;
  const nextIdx = currentIdx + dir;
  if (nextIdx >= 0 && nextIdx < TABS_ORDER.length) {
    navigateTo(TABS_ORDER[nextIdx]);
    if (navigator.vibrate) navigator.vibrate(10);
  }
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initGestureSystem() {
  const container = document.body;
  if (!container) return;

  container.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].screenX;
    touchStartY = e.touches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture(e);
  }, { passive: true });

  // Map canvas dragging / panning support
  let isDraggingMap = false;
  let lastMapX = 0;
  let lastMapY = 0;
  const mapCanvas = $('#main-map-canvas');
  if (mapCanvas) {
    mapCanvas.addEventListener('mousedown', e => {
      isDraggingMap = true;
      lastMapX = e.clientX;
      lastMapY = e.clientY;
    });
    window.addEventListener('mousemove', e => {
      if (!isDraggingMap) return;
      const dx = e.clientX - lastMapX;
      const dy = e.clientY - lastMapY;
      lastMapX = e.clientX;
      lastMapY = e.clientY;
      panMap(dx, dy);
    });
    window.addEventListener('mouseup', () => {
      isDraggingMap = false;
    });

    // Touch support for map panning
    mapCanvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        isDraggingMap = true;
        lastMapX = e.touches[0].clientX;
        lastMapY = e.touches[0].clientY;
      }
    }, { passive: true });
    mapCanvas.addEventListener('touchmove', e => {
      if (!isDraggingMap || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMapX;
      const dy = e.touches[0].clientY - lastMapY;
      lastMapX = e.touches[0].clientX;
      lastMapY = e.touches[0].clientY;
      panMap(dx, dy);
    }, { passive: true });
    mapCanvas.addEventListener('touchend', () => {
      isDraggingMap = false;
    });
  }

  // Double tap zoom logic
  let lastTap = 0;
  container.addEventListener('touchend', e => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 250 && tapLength > 0) {
      const map = e.target.closest('#main-map-canvas');
      if (map) {
        e.preventDefault();
        zoomMap(1.5);
        showToast('Zooming map in (+50%)', 'info');
      }
    }
    lastTap = currentTime;
  });

  initDragAndDrop();
  initSwipeToDismissAlerts();
}

function initDragAndDrop() {
  const cards = $$('.kpi-card');
  let draggedElement = null;

  cards.forEach(card => {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function(e) {
      draggedElement = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });

    card.addEventListener('dragenter', function(e) {
      if (this !== draggedElement) {
        this.classList.add('drag-over');
      }
    });

    card.addEventListener('dragleave', function(e) {
      this.classList.remove('drag-over');
    });

    card.addEventListener('dragend', function() {
      cards.forEach(c => {
        c.classList.remove('drag-over');
        c.classList.remove('dragging');
      });
    });

    card.addEventListener('drop', function(e) {
      e.preventDefault();
      if (this !== draggedElement) {
        const tempHTML = this.innerHTML;
        const tempStyle = this.getAttribute('style');
        
        this.innerHTML = draggedElement.innerHTML;
        this.setAttribute('style', draggedElement.getAttribute('style'));
        
        draggedElement.innerHTML = tempHTML;
        draggedElement.setAttribute('style', tempStyle);

        if (navigator.vibrate) navigator.vibrate(15);
        showToast('Dashboard widgets reordered', 'success');
      }
      return false;
    });

    let touchTimer = null;
    let isTouchDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let currentDragCard = null;

    card.addEventListener('touchstart', function(e) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      currentDragCard = this;

      touchTimer = setTimeout(() => {
        isTouchDragging = true;
        currentDragCard.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(25);
      }, 400);
    }, { passive: true });

    card.addEventListener('touchmove', function(e) {
      if (!isTouchDragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(touchTimer);
        }
        return;
      }

      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      currentDragCard.style.transform = `translate3d(${dx}px, ${dy}px, 10px) scale(1.05)`;
      currentDragCard.style.zIndex = '1000';
      currentDragCard.style.boxShadow = 'var(--shadow-lg)';

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetCard = element ? element.closest('.kpi-card') : null;
      
      cards.forEach(c => c.classList.remove('drag-over'));
      if (targetCard && targetCard !== currentDragCard) {
        targetCard.classList.add('drag-over');
      }
    }, { passive: false });

    card.addEventListener('touchend', function(e) {
      clearTimeout(touchTimer);
      if (!isTouchDragging) return;
      isTouchDragging = false;

      currentDragCard.classList.remove('dragging');
      currentDragCard.style.transform = '';
      currentDragCard.style.zIndex = '';
      currentDragCard.style.boxShadow = '';

      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetCard = element ? element.closest('.kpi-card') : null;

      if (targetCard && targetCard !== currentDragCard) {
        const tempHTML = targetCard.innerHTML;
        const tempStyle = targetCard.getAttribute('style');

        targetCard.innerHTML = currentDragCard.innerHTML;
        targetCard.setAttribute('style', currentDragCard.getAttribute('style'));

        currentDragCard.innerHTML = tempHTML;
        currentDragCard.setAttribute('style', tempStyle);

        if (navigator.vibrate) navigator.vibrate([15, 10, 15]);
        showToast('Dashboard widgets reordered', 'success');
      }

      cards.forEach(c => c.classList.remove('drag-over'));
    });
  });
}

function initSwipeToDismissAlerts() {
  const alertContainer = $('#view-alerts');
  if (!alertContainer) return;

  alertContainer.addEventListener('touchstart', e => {
    const card = e.target.closest('.alert-item');
    if (!card) return;

    let touch = e.touches[0];
    let startX = touch.clientX;
    let startY = touch.clientY;
    let isSwiping = false;

    function onTouchMove(ev) {
      let t = ev.touches[0];
      let dx = t.clientX - startX;
      let dy = t.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isSwiping = true;
        ev.preventDefault();
        
        if (dx < 0) {
          card.style.transform = `translateX(${dx}px)`;
          card.style.opacity = `${1 - Math.abs(dx) / 300}`;
        }
      }
    }

    function onTouchEnd(ev) {
      card.removeEventListener('touchmove', onTouchMove);
      card.removeEventListener('touchend', onTouchEnd);

      if (!isSwiping) return;
      isSwiping = false;

      let dx = ev.changedTouches[0].clientX - startX;
      if (dx < -120) {
        card.style.transition = 'all 0.3s ease-out';
        card.style.transform = 'translateX(-120%)';
        card.style.opacity = '0';
        
        if (navigator.vibrate) navigator.vibrate(20);
        showToast('Alert resolved and dismissed', 'success');
        
        setTimeout(() => {
          card.remove();
          const remaining = alertContainer.querySelectorAll('.alert-item').length;
          if (remaining === 0) {
            const emptyState = el('div', '', `
              <div style="text-align:center;padding:48px;color:var(--text-tertiary);">
                <span class="material-symbols-rounded" style="font-size:48px;color:var(--green);margin-bottom:12px;">check_circle</span>
                <div style="font-weight:600;font-size:16px;">All systems operational</div>
                <div style="font-size:12px;margin-top:4px;">No active warning triggers logged</div>
              </div>`);
            alertContainer.appendChild(emptyState);
          }
        }, 300);
      } else {
        card.style.transition = 'all 0.2s ease-out';
        card.style.transform = '';
        card.style.opacity = '';
      }
    }

    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('touchend', onTouchEnd, { passive: true });
  });
}

function handleSwipeGesture(e) {
  // Ignore gesture if inside map, chart, draggable cards, or scrollable tables
  if (e.target.closest('#main-map-canvas') || 
      e.target.closest('.card-draggable') || 
      e.target.closest('#dataset-chart-canvas') || 
      e.target.closest('.data-table') ||
      e.target.closest('.kanban-column') ||
      e.target.closest('.settings-panel')) {
    return;
  }

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 80; // px

  if (absDx > absDy) {
    if (absDx > threshold) {
      if (dx > 0) {
        if (touchStartX < 50 && window.innerWidth <= 600) {
          openMobileDrawer();
        } else {
          navigateTabDirection(-1);
        }
      } else {
        const sidebar = $('#sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open') && window.innerWidth <= 600) {
          closeMobileDrawer();
        } else {
          navigateTabDirection(1);
        }
      }
    }
  } else {
    if (absDy > threshold) {
      if (dy > 0 && window.scrollY === 0) {
        triggerPullToRefresh();
      }
    }
  }
}

function openMobileDrawer() {
  const sidebar = $('#sidebar');
  if (sidebar && window.innerWidth <= 600) {
    sidebar.classList.add('mobile-open');
    showToast('Navigation Drawer opened', 'info');
    if (navigator.vibrate) navigator.vibrate(15);
  }
}

function closeMobileDrawer() {
  const sidebar = $('#sidebar');
  if (sidebar && window.innerWidth <= 600) {
    sidebar.classList.remove('mobile-open');
  }
}

function triggerPullToRefresh() {
  if (!State.auth.loggedIn) return;
  const container = $('.main-content');
  if (!container) return;

  let refreshIndicator = $('#pull-to-refresh-indicator');
  if (!refreshIndicator) {
    refreshIndicator = el('div', '', `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:var(--blue-50);color:var(--blue);border-radius:var(--r-sm);margin-bottom:16px;box-shadow:var(--shadow-sm);font-weight:600;font-size:13px;animation:slideDown 0.3s ease-out;">
        <span class="material-symbols-rounded spinner" style="animation:spin 1s linear infinite;">sync</span>
        Refreshing live telemetry parameters...
      </div>`);
    refreshIndicator.id = 'pull-to-refresh-indicator';
    container.insertBefore(refreshIndicator, container.firstChild);
  }

  if (navigator.vibrate) navigator.vibrate([20, 10, 20]);

  setTimeout(() => {
    State.metrics.communityScore = Math.min(100, Math.max(40, State.metrics.communityScore + Math.round(Math.random() * 6 - 3)));
    State.metrics.trafficIndex = Math.min(100, Math.max(10, State.metrics.trafficIndex + Math.round(Math.random() * 10 - 5)));
    State.metrics.airQuality = Math.min(500, Math.max(10, State.metrics.airQuality + Math.round(Math.random() * 8 - 4)));
    
    renderDashboard();
    
    refreshIndicator.remove();
    showToast('✓ Telemetry parameters refreshed successfully', 'success');
  }, 1200);
}

function zoomMap(scale) {
  State.mapZoom = Math.max(0.5, Math.min(4, State.mapZoom * scale));
  const canvas = $('#main-map-canvas');
  if (canvas) renderMapCanvas(canvas, State.activeMapLayer);
}

function panMap(dx, dy) {
  State.mapPanX += dx / State.mapZoom;
  State.mapPanY += dy / State.mapZoom;
  const canvas = $('#main-map-canvas');
  if (canvas) renderMapCanvas(canvas, State.activeMapLayer);
}

// ─────────────────────────────────────────────────────────
// GLOBAL EVENT LISTENERS
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSplash();
  initGestureSystem();

  // Dynamic filter change listeners
  $$('.filter-select').forEach(select => {
    select.addEventListener('change', () => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4 variation
      State.metrics.communityScore = Math.max(50, Math.min(100, State.metrics.communityScore + delta));
      State.metrics.trafficIndex = Math.max(20, Math.min(100, State.metrics.trafficIndex - delta));
      State.metrics.airQuality = Math.max(10, Math.min(300, State.metrics.airQuality + delta * 2));
      State.metrics.satisfaction = Math.max(40, Math.min(100, State.metrics.satisfaction + delta));
      showToast('Recalculating statistics for selected filters...', 'info');
      setTimeout(() => {
        renderDashboard();
        showToast('Dashboard stats updated successfully', 'success');
      }, 350);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-dropdown-trigger]') && !e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
    if (!e.target.closest('#command-palette') && !e.target.closest('[data-open-cmd]')) {
      $('#command-palette')?.classList.add('hidden');
    }
  });

  // Chat input auto-resize + Enter to send
  const chatInput = $('#chat-input');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }



  // ScrollSpy for landing sections
  window.addEventListener('scroll', () => {
    const landing = $('#landing');
    if (!landing || !landing.classList.contains('active')) return;

    const sections = [
      { id: 'hero', name: 'Home' },
      { id: 'ls-solutions', name: 'Solutions' },
      { id: 'ls-features', name: 'Features' },
      { id: 'ls-dashboard', name: 'Dashboard' },
      { id: 'ls-pricing', name: 'Pricing' },
      { id: 'ls-developers', name: 'Developers' },
      { id: 'ls-resources', name: 'Resources' },
      { id: 'ls-about', name: 'About' },
      { id: 'ls-contact', name: 'Contact' }
    ];

    let currentSectionId = 'hero';
    // Offset for navbar height and spacing
    const scrollPosition = window.scrollY + 120;

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) {
        const top = el.offsetTop;
        if (scrollPosition >= top) {
          currentSectionId = section.id;
        }
      }
    }

    // Update nav link active state
    $$('.land-nav-link').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${currentSectionId}'`)) {
        a.classList.add('active');
      }
    });
  });

  // Window resize — re-render charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (State.auth.loggedIn) renderView(State.currentView);
    }, 300);
  });

  // ─── COMMAND PALETTE & KEYBOARD SHORTCUT CONTROLLER ───
  const COMMANDS = [
    { name: 'Go to Dashboard', icon: 'dashboard', action: () => navigateTo('dashboard'), keys: 'g d' },
    { name: 'Go to GIS Maps', icon: 'map', action: () => navigateTo('maps'), keys: 'g m' },
    { name: 'Go to AI Assistant', icon: 'smart_toy', action: () => navigateTo('ai-assistant'), keys: 'g a' },
    { name: 'Go to Analytics', icon: 'equalizer', action: () => navigateTo('analytics'), keys: 'g n' },
    { name: 'Go to Predictions', icon: 'online_prediction', action: () => navigateTo('predictions'), keys: 'g p' },
    { name: 'Go to Data Connections', icon: 'table_chart', action: () => navigateTo('data'), keys: 'g c' },
    { name: 'Go to Settings', icon: 'settings', action: () => navigateTo('settings'), keys: 'g s' },
    { name: 'Toggle Light/Dark Theme', icon: 'dark_mode', action: () => toggleTheme(), keys: 't t' },
    { name: 'Reset Map View (IIT ISM)', icon: 'home', action: () => mapResetView(), keys: 'r m' },
    { name: 'Onboarding Tutorial Tour', icon: 'tour', action: () => startOnboardingTour(), keys: 'o t' },
    { name: 'Open Keyboard Shortcuts', icon: 'keyboard', action: () => openShortcutsHelp(), keys: '?' }
  ];

  window.openCommandPalette = function() {
    const cp = $('#command-palette');
    if (cp) {
      cp.classList.remove('hidden');
      const input = $('#cmd-input');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
      }
      renderCommands('');
    }
  };

  window.closeCommandPalette = function(e) {
    const cp = $('#command-palette');
    if (cp) cp.classList.add('hidden');
  };

  function renderCommands(filter) {
    const list = $('#cmd-list');
    if (!list) return;
    const cleanFilter = filter.toLowerCase().trim();
    const filtered = COMMANDS.filter(c => c.name.toLowerCase().includes(cleanFilter));
    
    list.innerHTML = filtered.map((c, idx) => `
      <div class="command-item ${idx === 0 ? 'selected' : ''}" onclick="executeCommand(${COMMANDS.indexOf(c)})">
        <span>
          <span class="material-symbols-rounded" style="color:var(--blue);">${c.icon}</span>
          ${c.name}
        </span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-tertiary);">${c.keys}</span>
      </div>
    `).join('');
    
    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:13px;">No commands found</div>`;
    }
  }

  window.filterCommands = function() {
    const input = $('#cmd-input');
    if (input) renderCommands(input.value);
  };

  window.executeCommand = function(idx) {
    closeCommandPalette();
    if (COMMANDS[idx]) COMMANDS[idx].action();
  };

  // Keyboard Shortcuts Helper
  const SHORTCUTS = [
    { keys: 'Ctrl + K', desc: 'Open Command Palette' },
    { keys: 'Esc', desc: 'Close any active overlay / dialog' },
    { keys: 'g + d', desc: 'Navigate to Dashboard' },
    { keys: 'g + m', desc: 'Navigate to GIS Maps' },
    { keys: 'g + a', desc: 'Navigate to AI Assistant' },
    { keys: 'g + n', desc: 'Navigate to Analytics' },
    { keys: 'g + s', desc: 'Navigate to Settings' },
    { keys: 't + t', desc: 'Toggle Dark / Light Mode' },
    { keys: 'Shift + ?', desc: 'Show this shortcuts help sheet' }
  ];

  window.openShortcutsHelp = function() {
    const sh = $('#shortcuts-help');
    if (sh) {
      sh.classList.remove('hidden');
      const list = $('#shortcuts-list-container');
      if (list) {
        list.innerHTML = SHORTCUTS.map(s => `
          <div class="shortcut-row">
            <span style="color:var(--text-secondary);font-weight:500;">${s.desc}</span>
            <span class="shortcut-key">${s.keys}</span>
          </div>
        `).join('');
      }
    }
  };

  window.closeShortcutsHelp = function() {
    const sh = $('#shortcuts-help');
    if (sh) sh.classList.add('hidden');
  };

  // Keyboard shortcuts event bindings
  let keySequence = '';
  let sequenceTimer;
  document.addEventListener('keydown', e => {
    // CMD + K or CTRL + K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
      return;
    }
    
    // ESC closes overlays
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeShortcutsHelp();
      endOnboardingTour();
      return;
    }
    
    // Ignore sequences inside inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Single key shortcuts
    if (e.key === '?') {
      e.preventDefault();
      openShortcutsHelp();
      return;
    }

    // Sequence keys (e.g. g then d)
    clearTimeout(sequenceTimer);
    keySequence += e.key.toLowerCase();
    
    if (keySequence === 'gd') { navigateTo('dashboard'); keySequence = ''; }
    else if (keySequence === 'gm') { navigateTo('maps'); keySequence = ''; }
    else if (keySequence === 'ga') { navigateTo('ai-assistant'); keySequence = ''; }
    else if (keySequence === 'gn') { navigateTo('analytics'); keySequence = ''; }
    else if (keySequence === 'gp') { navigateTo('predictions'); keySequence = ''; }
    else if (keySequence === 'gc') { navigateTo('data'); keySequence = ''; }
    else if (keySequence === 'gs') { navigateTo('settings'); keySequence = ''; }
    else if (keySequence === 'tt') { toggleTheme(); keySequence = ''; }
    else if (keySequence === 'rm') { mapResetView(); keySequence = ''; }
    else if (keySequence === 'ot') { startOnboardingTour(); keySequence = ''; }
    
    sequenceTimer = setTimeout(() => { keySequence = ''; }, 700);
  });

  // ─── ONBOARDING TOUR CONTROLLER ───
  let tourStepIndex = 0;
  const TOUR_STEPS = [
    {
      target: '.sidebar',
      title: 'Navigation Sidebar',
      desc: 'Access all primary sections like the AI Assistant, predictions, GIS maps, and data configurations.'
    },
    {
      target: '.greeting-banner',
      title: 'Greetings & Actions',
      desc: 'Check live synchronization state and run direct AI report compilation actions here.'
    },
    {
      target: '.dash-grid',
      title: 'Real-Time KPI Analytics',
      desc: 'Monitor community scores, traffic delays, air quality parameters, and general satisfaction percentages.'
    },
    {
      target: '.fab-btn',
      title: 'AI Copilot Launcher',
      desc: 'Trigger the floating conversational helper to quickly query local tables and summarize indices.'
    },
    {
      target: '.theme-toggle',
      title: 'Appearance Customizer',
      desc: 'Toggle between dark and light workspace designs instantly to fit your surroundings.'
    }
  ];

  window.startOnboardingTour = function() {
    navigateTo('dashboard');
    setTimeout(() => {
      const tour = $('#onboarding-tour');
      if (tour) {
        tour.classList.remove('hidden');
        tourStepIndex = 0;
        showTourStep(0);
      }
    }, 500);
  };

  window.endOnboardingTour = function() {
    const tour = $('#onboarding-tour');
    if (tour) tour.classList.add('hidden');
  };

  window.nextTourStep = function() {
    tourStepIndex++;
    if (tourStepIndex < TOUR_STEPS.length) {
      showTourStep(tourStepIndex);
    } else {
      endOnboardingTour();
      showToast('Tour completed! Welcome to CommunityPulse.', 'success');
    }
  };

  function showTourStep(index) {
    const step = TOUR_STEPS[index];
    const targetEl = document.querySelector(step.target);
    const box = $('#tour-box');
    const highlight = $('#tour-highlight');
    const title = $('#tour-title');
    const desc = $('#tour-desc');
    const progress = $('#tour-progress');
    const nextBtn = $('#tour-next-btn');

    if (!targetEl || !box || !highlight) return;

    // Get target boundaries
    const rect = targetEl.getBoundingClientRect();
    
    // Position highlight ring
    highlight.style.top = `${rect.top - 8 + window.scrollY}px`;
    highlight.style.left = `${rect.left - 8 + window.scrollX}px`;
    highlight.style.width = `${rect.width + 16}px`;
    highlight.style.height = `${rect.height + 16}px`;

    // Position helper box
    let boxTop = rect.bottom + 16 + window.scrollY;
    let boxLeft = rect.left + window.scrollX;
    
    // Adjust boundaries
    if (boxLeft + 330 > window.innerWidth) {
      boxLeft = window.innerWidth - 350;
    }
    if (boxTop + 200 > window.innerHeight + window.scrollY) {
      boxTop = rect.top - 200 + window.scrollY;
    }

    box.style.top = `${Math.max(16, boxTop)}px`;
    box.style.left = `${Math.max(16, boxLeft)}px`;

    // Set texts
    title.innerHTML = `<span class="material-symbols-rounded" style="color:var(--blue)">tour</span> ${step.title}`;
    desc.textContent = step.desc;
    progress.textContent = `Step ${index + 1} of ${TOUR_STEPS.length}`;
    nextBtn.textContent = index === TOUR_STEPS.length - 1 ? 'Finish' : 'Next';
  }

  // ─── OFFLINE & CUSTOM ERROR ROBUSTNESS ───
  window.addEventListener('online', () => {
    showToast('Connection restored. Back online.', 'success');
  });
  window.addEventListener('offline', () => {
    showToast('You are currently offline. Running on cached simulation mode.', 'warning');
  });

  // ─── RIPPLE EFFECT CONTROLLER ───
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .ripple-btn');
    if (!btn) return;
    
    const circle = document.createElement('div');
    circle.classList.add('ripple');
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${size}px`;
    
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  });

  // ─── DRAG AND DROP DASHBOARD REORDERING ───
  setTimeout(() => {
    const cards = document.querySelectorAll('.dash-grid > .kpi-card');
    cards.forEach((card, idx) => {
      card.setAttribute('draggable', 'true');
      card.style.cursor = 'grab';
      
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', idx);
        card.style.opacity = '0.5';
      });
      
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
      
      card.addEventListener('dragover', e => {
        e.preventDefault();
      });
      
      card.addEventListener('drop', e => {
        e.preventDefault();
        const draggedIdx = e.dataTransfer.getData('text/plain');
        if (draggedIdx === '') return;
        
        const parent = card.parentNode;
        const draggedCard = parent.children[draggedIdx];
        if (draggedCard !== card) {
          const children = Array.from(parent.children);
          const indexCurrent = children.indexOf(card);
          const indexDragged = children.indexOf(draggedCard);
          
          if (indexCurrent > indexDragged) {
            parent.insertBefore(draggedCard, card.nextSibling);
          } else {
            parent.insertBefore(draggedCard, card);
          }
          
          const newOrder = Array.from(parent.children).map(c => c.querySelector('.kpi-label').textContent);
          localStorage.setItem('kpi_layout_order', JSON.stringify(newOrder));
          showToast('Dashboard layout updated & saved', 'success');
        }
      });
    });
    
    const savedOrder = localStorage.getItem('kpi_layout_order');
    if (savedOrder) {
      const orderArray = JSON.parse(savedOrder);
      const parent = document.querySelector('.dash-grid');
      if (parent) {
        const cardsArray = Array.from(parent.children);
        orderArray.forEach(label => {
          const match = cardsArray.find(c => c.querySelector('.kpi-label').textContent === label);
          if (match) parent.appendChild(match);
        });
      }
    }
  }, 1000);
});

// Interactive 3D Particle Background for Onboarding
(function() {
  const canvas = document.getElementById('onboarding-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const numParticles = 80;
  const focalLength = 300;
  
  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  // Initialize particles in a 3D box
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 800,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 2 + 1
    });
  }
  
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let rotationX = 0, rotationY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
    targetRotationY = (mouseX / (window.innerWidth / 2)) * 0.25;
    targetRotationX = -(mouseY / (window.innerHeight / 2)) * 0.25;
  });
  
  function rotateY(particle, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = particle.x * cos - particle.z * sin;
    const z = particle.z * cos + particle.x * sin;
    particle.x = x;
    particle.z = z;
  }
  
  function rotateX(particle, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y = particle.y * cos - particle.z * sin;
    const z = particle.z * cos + particle.y * sin;
    particle.y = y;
    particle.z = z;
  }
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Smoothly interpolate rotation toward target (mouse response)
    rotationX += (targetRotationX - rotationX) * 0.05;
    rotationY += (targetRotationY - rotationY) * 0.05;
    
    // Draw connections
    const projected = [];
    const maxDistance = 220;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Copy coordinates to rotate
      let rx = p.x;
      let ry = p.y;
      let rz = p.z;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      
      // Bounce inside boundary box
      const boxSize = 400;
      if (Math.abs(p.x) > boxSize) p.vx *= -1;
      if (Math.abs(p.y) > boxSize) p.vy *= -1;
      if (Math.abs(p.z) > boxSize) p.vz *= -1;
      
      // Apply mouse-based rotation plus a constant ambient drift
      const tempParticle = { x: rx, y: ry, z: rz };
      rotateY(tempParticle, rotationY + 0.0006);
      rotateX(tempParticle, rotationX + 0.0003);
      
      // Project to 2D
      const scale = focalLength / (focalLength + tempParticle.z + 500);
      const projX = width / 2 + tempParticle.x * scale;
      const projY = height / 2 + tempParticle.y * scale;
      
      projected.push({
        x: projX,
        y: projY,
        z: tempParticle.z,
        scale: scale,
        radius: p.radius * scale
      });
    }
    
    // Draw lines between particles close in 3D
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < maxDistance) {
          const pi = projected[i];
          const pj = projected[j];
          
          // Calculate opacity based on distance in 3D
          const alpha = (1 - dist / maxDistance) * 0.18;
          ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * pi.scale * pj.scale})`;
          ctx.lineWidth = 0.8 * pi.scale;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.stroke();
        }
      }
    }
    
    // Draw particles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const alpha = (p.z + 400) / 800; // Depth cueing
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    requestAnimationFrame(draw);
  }
  
  requestAnimationFrame(draw);
})();
