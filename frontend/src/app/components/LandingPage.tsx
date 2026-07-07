"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { 
  Activity, ArrowRight, Shield, Zap, Database, Globe, Brain, HelpCircle, 
  Mail, MessageSquare, Plus, Check, Star, CheckCircle, BarChart3, Cloud, LayoutDashboard
} from 'lucide-react';

export default function LandingPage() {
  const { setView } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // ScrollSpy
      const sections = ['hero', 'solutions', 'features', 'pricing', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const techPartners = [
    { name: 'Google Cloud Partner', desc: 'BigQuery & Vertex AI', icon: Cloud, color: 'text-blue-500' },
    { name: 'NVIDIA H100', desc: 'Accelerated ML Models', icon: Zap, color: 'text-amber-500' },
    { name: 'Gemini AI', desc: 'Gemini 2.0 Flash LLM', icon: Brain, color: 'text-violet-500' }
  ];

  const features = [
    { title: 'Community Health Score', desc: 'Unified real-time vital signs metrics.', icon: Activity },
    { title: 'Gemini AI Assistant', desc: 'Ask questions, write BigQuery SQL, get reports.', icon: Brain },
    { title: 'Interactive GIS Map', desc: 'Traffic, flood risk, AQI, and POI spatial overlays.', icon: Globe },
    { title: 'ML Prediction Models', desc: 'Predict congestion, flood, and water demand.', icon: Zap },
    { title: 'Report Hub', desc: 'Auto-schedule PDF, Excel, and PPT reports.', icon: Database },
    { title: 'Smart Alerts', desc: 'Automated warnings with severity triggers.', icon: Shield }
  ];

  const testimonials = [
    { quote: "CommunityPulse AI transformed our flood response times. We now get 72-hour advance warnings with 94% accuracy. It saved lives during monsoon season.", author: "Ananya Rao", role: "Director, State Disaster Management Authority" },
    { quote: "We cut traffic routing analysis from 3 weeks to 4 hours. The Gemini assistant writes SQL and builds custom trend charts instantly.", author: "Marcus Klein", role: "Head of Smart City Initiatives, Metro Corp" }
  ];

  const faqs = [
    { q: "How accurate are the prediction models?", a: "Our models achieve 87% to 94% accuracy, leveraging Google Cloud and NVIDIA H100 GPU acceleration." },
    { q: "What databases can be connected?", a: "We support BigQuery, Cloud Storage, Firebase, PostgreSQL, MySQL, IoT streams, and REST APIs." },
    { q: "Is my organization's data secure?", a: "Yes. All data is AES-256 encrypted at rest and TLS 1.3 in transit, fully complying with GDPR and SOC 2 Type II." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 selection:bg-blue-500 selection:text-white">
      {/* Sticky Header Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-850 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">CommunityPulse <span className="text-blue-600 font-semibold">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-400 text-sm">
            <a href="#solutions" className={`hover:text-blue-600 transition-colors ${activeSection === 'solutions' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>Solutions</a>
            <a href="#features" className={`hover:text-blue-600 transition-colors ${activeSection === 'features' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>Features</a>
            <a href="#pricing" className={`hover:text-blue-600 transition-colors ${activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>Pricing</a>
            <a href="#faq" className={`hover:text-blue-600 transition-colors ${activeSection === 'faq' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>FAQ</a>
            <a href="#contact" className={`hover:text-blue-600 transition-colors ${activeSection === 'contact' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setView('auth')} className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Sign In
            </button>
            <button onClick={() => setView('auth')} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-xs tracking-wider uppercase">
              Google Cloud & NVIDIA Accelerated
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Transform Community Data Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Smarter Decisions</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              An enterprise-grade Decision Intelligence Platform leveraging Gemini AI and accelerated GPU computing to predict outcomes, monitor vital metrics, and automate emergency responses.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button onClick={() => setView('auth')} className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all">
                Launch Workspace <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#features" className="px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all">
                Explore Features
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Interactive Preview Frame */}
            <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Live Platform Status</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">District 3</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30">
                    <span className="text-xs text-slate-500">Health Index</span>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">87.4</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
                    <span className="text-xs text-slate-500">Traffic Status</span>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">Normal</h3>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Predictive Risk Forecast</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">72h Out</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[42%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Partners Section */}
      <section id="solutions" className="bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-850 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {techPartners.map((partner, i) => {
            const Icon = partner.icon;
            return (
              <div key={i} className="flex gap-4 items-start p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                <div className={`p-3 rounded-xl bg-white dark:bg-slate-850 shadow-sm ${partner.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{partner.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{partner.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="text-blue-600 font-bold text-sm uppercase tracking-wider">Features</div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Unified Intelligent Platform</h2>
          <p className="text-slate-600 dark:text-slate-400">Everything needed to run community analytics and predict events, powered by Google Cloud & NVIDIA.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 shadow-sm hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 w-fit mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-slate-900/30 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-blue-600 font-bold text-sm uppercase tracking-wider">Pricing</div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Simple, Transparent Plans</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-500">Starter</h3>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">$0<span className="text-sm font-normal text-slate-400">/mo</span></h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Community Dashboard</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 100 AI Assistant queries/mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2 GIS Map Layers</li>
              </ul>
              <button onClick={() => setView('auth')} className="w-full py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">Get Started Free</button>
            </div>
            {/* Pro */}
            <div className="p-8 rounded-2xl border-2 border-blue-600 shadow-xl space-y-6 relative bg-white dark:bg-slate-900">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider py-1 px-3.5 rounded-full">Popular</div>
              <div>
                <h3 className="font-bold text-lg text-blue-600">Pro</h3>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">$299<span className="text-sm font-normal text-slate-400">/mo</span></h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Everything in Starter</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited AI Queries</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> All 6 GIS Map Layers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> BigQuery Integrations</li>
              </ul>
              <button onClick={() => setView('auth')} className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/15 transition-all">Start Trial</button>
            </div>
            {/* Enterprise */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-500">Enterprise</h3>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Custom</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dedicated GCP Instances</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> NVIDIA H100 Clusters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom ML Predictions</li>
              </ul>
              <button onClick={() => setView('auth')} className="w-full py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-800">
        {testimonials.map((test, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-sm relative space-y-6">
            <div className="flex gap-1 text-amber-500"><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /></div>
            <p className="text-slate-600 dark:text-slate-450 italic">&ldquo;{test.quote}&rdquo;</p>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{test.author}</h4>
              <p className="text-xs text-slate-400">{test.role}</p>
            </div>
          </div>
        ))}
      </section>

      {/* FAQs */}
      <section id="faq" className="bg-slate-100 dark:bg-slate-900/50 py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-950 dark:text-white text-base mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Get In Touch</h2>
          <p className="text-slate-600 dark:text-slate-400">Have questions? We would love to showcase what CommunityPulse AI can do for your community.</p>
        </div>
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Name</label>
              <input type="text" placeholder="Ranjeet Kumar" className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Email</label>
              <input type="email" placeholder="you@organization.gov" className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Message</label>
            <textarea placeholder="Tell us about your organization..." rows={4} className="w-full mt-1.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 text-sm bg-transparent" />
          </div>
          <button onClick={() => alert("Mock demo request registered!")} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Submit Inquiry</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-bold text-white text-lg">CommunityPulse AI</span>
            <p className="text-sm leading-relaxed">AI-powered Decision Intelligence Platform powered by Google Cloud & NVIDIA GPU acceleration.</p>
            <div className="flex gap-3 flex-wrap mt-4 text-xs">
              <a href="https://www.linkedin.com/in/ranjeet-kumar-78a45120b/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
              <span className="text-slate-700">|</span>
              <a href="https://github.com/Ranjeet7680" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <span className="text-slate-700">|</span>
              <a href="https://www.youtube.com/@Ranjeet_Kumar68" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
              <span className="text-slate-700">|</span>
              <a href="https://x.com/Ranjeet21653458" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X</a>
              <span className="text-slate-700">|</span>
              <a href="mailto:rajranjeet7680@gmail.com" className="hover:text-white transition-colors">Gmail</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Developers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="https://github.com/Ranjeet7680/CommunityPulse-AI-Decision-Intelligence-Platform.git" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
