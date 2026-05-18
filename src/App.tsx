import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowRight, ArrowLeft, ShieldCheck, UserCircle, Search, Plus, Inbox, 
  Users, Bell, LogOut, Settings, MoreVertical, Building2 as CorporateFare, 
  Megaphone as Campaign, Shield as Security, History, ArrowRightCircle, Info, Paperclip, 
  ImageIcon, Calendar, Send, ChevronRight, CheckCircle2, Trash2,
  LayoutDashboard, User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { formatDistanceToNow } from 'date-fns';

// --- Local Storage Utility ---
const storage = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value)),
  init: () => {
    if (!storage.get('groups')) {
      storage.set('groups', [
        { id: 'exec-board', name: 'Executive Board', description: 'Main decision making body', member_count: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'eng-team', name: 'Engineering Team', description: 'Software and hardware infrastructure', member_count: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
    }
    if (!storage.get('messages')) {
      storage.set('messages', [
        { id: '1', sender_id: 'admin-1', subject: 'Welcome to Broadcast', content: 'This is a secure communication channel for administrative updates.', message_type: 'broadcast', group_id: 'exec-board', sent_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', sender_id: 'admin-1', subject: 'Infrastructure Update', content: 'We are scaling the backend systems for better reliability.', message_type: 'broadcast', group_id: 'eng-team', sent_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', sender_id: 'admin-1', subject: 'Personal Briefing', content: 'Sarah, please review the security logs for Group A.', message_type: 'selective', recipient_ids: ['c1'], sent_at: new Date(Date.now() - 1800000).toISOString() }
      ]);
    }
    if (!storage.get('contacts')) {
      storage.set('contacts', [
        { id: 'c1', full_name: 'Sarah Connor', email: 'sarah@resistance.com', role: 'member' },
        { id: 'c2', full_name: 'John Smith', email: 'john@agent.com', role: 'member' },
        { id: 'c3', full_name: 'Ellen Ripley', email: 'ellen@nostromo.com', role: 'member' },
        { id: 'c4', full_name: 'Arthur Dent', email: 'arthur@galaxy.com', role: 'member' },
        { id: 'c5', full_name: 'Trinity', email: 'trinity@zion.net', role: 'member' }
      ]);
    }
    if (!storage.get('memberships')) {
      storage.set('memberships', [
        { group_id: 'exec-board', contact_id: 'c1' },
        { group_id: 'exec-board', contact_id: 'c2' },
        { group_id: 'exec-board', contact_id: 'c3' },
        { group_id: 'eng-team', contact_id: 'c1' },
        { group_id: 'eng-team', contact_id: 'c4' },
        { group_id: 'eng-team', contact_id: 'c5' }
      ]);
    }
  }
};

// --- Types ---
interface Contact {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  role: 'admin' | 'member';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true, 
  isAdmin: false,
  isTransitioning: false,
  setIsTransitioning: () => {},
  login: async () => {},
  logout: () => {}
});

// --- Constants ---
const Logo = ({ className = "w-full h-full" }: { className?: string }) => (
  <ShieldCheck className={cn("text-primary fill-primary/10", className)} />
);

// --- Components ---

const LoadingScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface z-50">
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-24 h-24 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center p-6 border border-white">
        <Logo className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface">SecureCast</h1>
        <p className="text-on-surface-variant/60 font-medium">Establishing encrypted connection...</p>
      </div>
    </div>
    <div className="fixed bottom-12 w-full flex flex-col items-center gap-3">
      <div className="w-48 h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full w-full bg-primary loading-pulse origin-left" />
      </div>
      <span className="text-[10px] text-outline font-bold tracking-[0.2em] uppercase opacity-40">Administrative Protocol Active</span>
    </div>
  </div>
);

const Navbar = ({ activeTab }: { activeTab: string }) => {
  const navigate = useNavigate();
  const { isAdmin, setIsTransitioning } = useContext(AuthContext);

  const handleTabClick = (path: string) => {
    if (window.location.pathname === path) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(path);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 400);
  };

  const tabs = isAdmin 
    ? [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dash', path: '/admin/dashboard' },
        { id: 'inbox', icon: Inbox, label: 'Sent', path: '/inbox' },
        { id: 'groups', icon: ShieldCheck, label: 'Groups', path: '/admin/groups' },
        { id: 'contacts', icon: UserIcon, label: 'Users', path: '/admin/contacts' },
        { id: 'notifications', icon: Bell, label: 'Alerts', path: '/admin/notifications' }
      ]
    : [
        { id: 'inbox', icon: Inbox, label: 'Inbox', path: '/inbox' },
        { id: 'notifications', icon: Bell, label: 'Alerts', path: '/notifications' },
        { id: 'profile', icon: UserIcon, label: 'Account', path: '/profile' }
      ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-50 flex justify-around items-center h-20 px-6 bg-white/80 backdrop-blur-2xl border border-outline-variant/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.path)}
          className={cn(
            "flex flex-col items-center justify-center transition-all cursor-pointer relative",
            activeTab === tab.id ? "text-primary scale-110" : "text-black hover:opacity-70"
          )}
        >
          <div className={cn(
            "p-2.5 rounded-2xl transition-all duration-300",
            activeTab === tab.id ? "bg-primary/10 shadow-sm" : "bg-transparent"
          )}>
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id && "fill-primary")} />
          </div>
          <span className={cn(
            "text-[9px] font-bold mt-1 transition-all duration-300",
            activeTab === tab.id ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,163,255,0.6)]"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

const Header = ({ title, subtitle, showSearch = true, showBack = false, backPath, onSearchClick }: { title: string, subtitle?: string, showSearch?: boolean, showBack?: boolean, backPath?: string, onSearchClick?: () => void }) => {
  const { profile, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate(isAdmin ? '/admin/profile' : '/profile');
  };

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      const searchInput = document.getElementById('page-search') || document.querySelector('input[type="text"]');
      if (searchInput) {
        (searchInput as HTMLInputElement).focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => backPath ? navigate(backPath) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low cursor-pointer transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
        <button 
          onClick={() => navigate(isAdmin ? '/admin' : '/inbox')}
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-white hover:border-primary/20 transition-all cursor-pointer active:scale-95"
        >
          <Logo />
        </button>
        <div className="flex flex-col">
          <h1 className="text-[14px] font-bold tracking-tight text-on-surface leading-none uppercase">{title}</h1>
          {subtitle && <p className="text-[9px] font-medium text-on-surface-variant mt-0.5 opacity-60 hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {showSearch && (
          <button 
            onClick={handleSearch} 
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer group"
          >
            <Search className="w-4.5 h-4.5 text-on-surface-variant group-hover:scale-110 transition-transform" />
          </button>
        )}
        
        <button 
          onClick={handleProfile}
          className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/20 transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col items-start pr-1">
            <span className="text-[11px] font-bold text-on-surface leading-none group-hover:text-primary transition-colors">{profile?.full_name?.split(' ')[0]}</span>
            <span className="text-[8px] font-bold text-outline uppercase tracking-wider mt-0.5 opacity-70">{profile?.role}</span>
          </div>
        </button>

        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-error/10 text-outline hover:text-error transition-all cursor-pointer group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
};

// --- Pages ---

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) navigate('/inbox');
        else navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return <LoadingScreen />;
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    setLoading(true);
    try {
      await login('admin', 'admin');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberDemo = async () => {
    const contacts = storage.get('contacts') || [];
    if (contacts.length === 0) {
      setError('No contacts found. Login as admin and add contacts first.');
      return;
    }
    setLoading(true);
    try {
      // Logic for member demo login: just use the first contact's email as password for this demo bypass
      await login(contacts[0].email, 'demo-bypass');
      navigate('/inbox');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface bg-gradient-to-tr from-primary/10 via-surface to-secondary/10">
      <div className="w-full max-w-[380px] flex flex-col gap-4">
        <header className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-[28px] bg-white shadow-[0_8px_30px_-5px_rgba(0,0,0,0.06)] flex items-center justify-center p-5 border border-white">
            <Logo className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">SecureCast</h1>
            <p className="text-xs text-on-surface-variant/60 font-medium px-4">
              Centralized broadcast control panel
            </p>
          </div>
        </header>

        <section className="bg-white border border-outline-variant/10 rounded-[36px] p-8 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface/40 uppercase px-4 tracking-wider">Identity</label>
              <div className="relative group">
                <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/30 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Personnel ID / Email" 
                  className="w-full h-12 pl-12 pr-6 bg-surface/30 border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none text-sm font-medium placeholder:text-outline/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface/40 uppercase px-4 tracking-wider">Passphrase</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/30 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-12 pl-12 pr-6 bg-surface/30 border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none text-sm font-medium placeholder:text-outline/20"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-[11px] text-error bg-error/5 p-3 rounded-[20px] border border-error/10 animate-in fade-in slide-in-from-top-2">
                <p className="font-bold flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-error" /> Validation Failed
                </p>
                <p className="mt-0.5 opacity-80 pl-3">{error}</p>
              </div>
            )}
            
            <button 
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm">Authorizing...</span>
                </div>
              ) : (
                <>
                  <span className="text-sm tracking-wide">Authorize Entry</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-3">
            <button 
               onClick={handleAdminDemo}
               className="flex flex-col items-center justify-center gap-2 p-3 border border-outline-variant/20 rounded-[28px] hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
            >
              <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary group-hover:text-white" />
              </div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Admin</span>
            </button>
            <button 
               onClick={handleMemberDemo}
               className="flex flex-col items-center justify-center gap-2 p-3 border border-outline-variant/20 rounded-[28px] hover:bg-secondary/5 hover:border-secondary/30 transition-all text-secondary cursor-pointer group shadow-sm"
            >
              <div className="p-2.5 bg-secondary/10 rounded-xl group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                <UserIcon className="w-5 h-5 text-secondary group-hover:text-white" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Member</span>
            </button>
          </div>
        </section>

        <footer className="text-center opacity-30">
          <p className="text-[9px] uppercase font-bold tracking-[0.25em] text-on-surface">Secure Messaging • Protocol v2.5</p>
        </footer>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ groups: 0, members: 0, messages: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const groups = storage.get('groups') || [];
    const contacts = storage.get('contacts') || [];
    const messages = storage.get('messages') || [];
    setStats({ 
      groups: groups.length, 
      members: contacts.length, 
      messages: messages.length 
    });

    // Derive activity feed
    const activities: any[] = [];
    messages.slice(-5).forEach((m: any) => {
      let recipientDetail = 'Global Broadcast';
      if (m.group_id) {
        const group = groups.find((g: any) => g.id === m.group_id);
        recipientDetail = group ? `Sector: ${group.name}` : `Sector ID: ${m.group_id}`;
      } else if (m.recipient_ids) {
        recipientDetail = `${m.recipient_ids.length} isolated personnel`;
      }

      activities.push({
        id: `m-${m.id}`,
        type: 'message',
        title: m.message_type === 'broadcast' ? 'Broadcast Dispatched' : 'Selective Briefing Sent',
        desc: m.content.substring(0, 40) + '...',
        fullMsg: m,
        recipients: recipientDetail,
        time: m.sent_at,
        icon: m.message_type === 'broadcast' ? Campaign : Security
      });
    });
    
    // In a real app we'd track membership events in storage, for now we derive from groups
    groups.slice(-2).forEach((g: any) => {
       activities.push({
         id: `g-${g.id}`,
         type: 'group',
         title: 'Perimeter Configured',
         desc: `Sector ${g.name} protocol update.`,
         fullDesc: `The communication perimeter for ${g.name} has been synchronized with administrative protocols.`,
         recipients: g.name,
         time: g.updated_at || g.created_at,
         icon: CorporateFare
       });
    });

    setActivity(activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  }, []);

  const handleActivityClick = (act: any) => {
    if (act.type === 'message') {
      setSelectedMessage(act.fullMsg);
    } else {
        const toast = document.createElement('div');
        toast.className = 'fixed inset-0 z-[300] flex items-center justify-center p-6';
        toast.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-md bg-surface border border-outline-variant rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>
            </div>
            <div>
                <p class="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol Log</p>
                <h4 class="text-xl font-bold text-on-surface">${act.title}</h4>
            </div>
            </div>
            <div class="space-y-4 mb-8">
            <p class="text-sm text-on-surface-variant leading-relaxed font-medium">${act.fullDesc}</p>
            </div>
            <button id="close-act-modal" class="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest cursor-pointer">Acknowledge</button>
        </div>
        `;
        document.body.appendChild(toast);
        document.getElementById('close-act-modal')?.addEventListener('click', () => {
          toast.classList.add('animate-out', 'fade-out', 'zoom-out');
          setTimeout(() => toast.remove(), 200);
        });
    }
  };

  if (selectedMessage) {
    return <MessageDetailView message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-br from-surface via-primary/5 to-secondary/5 overflow-hidden">
      <Header title="Admin Overview" />
      <main className="flex-1 overflow-y-auto pt-20 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-6">
        <section className="grid grid-cols-2 gap-2 mt-2">
          <button 
            onClick={() => navigate('/admin/broadcast')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-outline-variant/10 rounded-2xl shadow-sm transition-all duration-150 ease-out outline-none select-none touch-manipulation active:scale-95 active:bg-gray-50 md:hover:border-primary/20 md:hover:shadow-md group cursor-pointer"
          >
            <Campaign className="w-5 h-5 mb-1 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">Broadcast</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/groups/new')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-outline-variant/10 rounded-2xl shadow-sm transition-all duration-150 ease-out outline-none select-none touch-manipulation active:scale-95 active:bg-gray-50 md:hover:border-primary/20 md:hover:shadow-md group cursor-pointer"
          >
            <Plus className="w-5 h-5 mb-1 text-primary group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">New Cluster</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/contacts')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-outline-variant/10 rounded-2xl shadow-sm transition-all duration-150 ease-out outline-none select-none touch-manipulation active:scale-95 active:bg-gray-50 md:hover:border-primary/20 md:hover:shadow-md group cursor-pointer"
          >
            <Users className="w-5 h-5 mb-1 text-secondary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">Selective Msg</span>
          </button>

          <button 
            onClick={() => navigate('/admin/notifications')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-outline-variant/10 rounded-2xl shadow-sm transition-all duration-150 ease-out outline-none select-none touch-manipulation active:scale-95 active:bg-gray-50 md:hover:border-primary/20 md:hover:shadow-md group cursor-pointer"
          >
            <History className="w-5 h-5 mb-1 text-outline group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">System Logs</span>
          </button>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <StatCard title="Groups" value={stats.groups.toString()} trend="Active" icon={ShieldCheck} color="bg-primary" />
          <StatCard title="Members" value={stats.members.toString()} trend="Unit" icon={UserIcon} color="bg-secondary" />
          <StatCard title="Audit" value={stats.messages.toString()} trend="Msg" icon={Inbox} color="bg-success" />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-bold text-on-surface/40 uppercase tracking-[0.2em]">Broadcast Activity</h3>
            <button onClick={() => navigate('/admin/notifications')} className="text-[11px] font-bold text-primary uppercase hover:opacity-70 transition-opacity">Full Archive</button>
          </div>
          <div className="space-y-2">
            {activity.map((act) => (
              <div 
                key={act.id} 
                onClick={() => handleActivityClick(act)}
                className="bg-white border border-outline-variant/10 rounded-xl p-3.5 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-outline/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                    <act.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-black group-hover:text-primary transition-colors tracking-tight">{act.title}</h4>
                    <p className="text-[9px] font-medium text-black/50 line-clamp-1">{act.desc}</p>
                  </div>
                </div>
                <div className="text-[8px] font-bold text-black/20 whitespace-nowrap bg-surface-container-low/20 px-2 py-0.5 rounded-full uppercase">
                  {formatDistanceToNow(new Date(act.time))}
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="text-center py-12 text-on-surface-variant/40 italic font-medium">No system events detected.</p>}
          </div>
        </section>

      </main>
      <Navbar activeTab="dashboard" />
    </div>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => {
  const getSubtleColor = (c: string) => {
    if (c === 'bg-primary') return 'bg-primary/[0.03] border-primary/10';
    if (c === 'bg-secondary') return 'bg-secondary/[0.03] border-secondary/10';
    if (c === 'bg-success') return 'bg-success/[0.03] border-success/10';
    return 'bg-white border-outline-variant/10';
  };

  return (
    <div className={cn("border rounded-[16px] p-3 shadow-none space-y-2 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group", getSubtleColor(color))}>
      <div className="flex justify-between items-start">
        <div className={cn("p-1.5 rounded-lg bg-opacity-10 shadow-sm", color === 'bg-primary' ? 'bg-primary text-primary' : (color === 'bg-secondary' ? 'bg-secondary text-secondary' : 'bg-success text-success'))}>
          <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-white text-on-surface-variant/30 uppercase tracking-[0.2em] border border-outline-variant/5">{trend}</span>
      </div>
      <div>
        <p className="text-[8px] font-bold text-on-surface-variant/30 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-lg font-black tracking-tighter text-on-surface">{value}</h4>
      </div>
    </div>
  );
};

const AdminGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedGroups = storage.get('groups') || [];
    setGroups(savedGroups);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = groups.filter(g => g.id !== id);
    storage.set('groups', updated);
    setGroups(updated);
    const memberships = storage.get('memberships') || [];
    storage.set('memberships', memberships.filter((m: any) => m.group_id !== id));
    setShowOptionsId(null);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-br from-surface via-primary/5 to-secondary/10 overflow-hidden">
      <Header title="Groups" />
      <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-4">
        <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md pt-2 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            <input 
              id="page-search"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..." 
              className="w-full pl-12 pr-6 h-12 bg-white border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all shadow-sm outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="px-1 mb-2">
          <p className="text-[11px] font-medium text-on-surface-variant/60">Manage your communication groups and perimeters here.</p>
        </div>

        <div className="space-y-4">
          {filteredGroups.length === 0 && <p className="text-center text-on-surface-variant py-12 italic opacity-60">No perimeters matching criteria.</p>}
          {filteredGroups.map((group) => (
            <div 
              key={group.id} 
              onClick={() => navigate(`/admin/chat/${group.id}`)}
              className="bg-white rounded-[28px] p-5 border border-outline-variant/20 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Security className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight">{group.name}</h3>
                    <p className="text-[11px] text-on-surface-variant/70 font-medium line-clamp-1">{group.description}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowOptionsId(showOptionsId === group.id ? null : group.id); }}
                    className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <MoreVertical className="text-outline/40 w-4 h-4 group-hover:text-outline transition-colors" />
                  </button>
                  {showOptionsId === group.id && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-outline-variant/30 rounded-[24px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      <div className="p-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/groups/${group.id}/members`); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-on-surface hover:bg-primary/5 rounded-2xl transition-colors cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-primary" /> Member Management
                        </button>
                        <div className="h-px bg-outline-variant/10 my-1 mx-2" />
                        <button 
                          onClick={(e) => handleDelete(e, group.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-error hover:bg-error/5 rounded-2xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Remove Group
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <Users className="w-3.5 h-3.5 text-outline" /> {group.member_count}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface/40">
                    <History className="w-3.5 h-3.5" /> Active
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRightCircle className="w-5 h-5 text-outline group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <button onClick={() => navigate('/admin/groups/new')} className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50">
        <Plus className="w-8 h-8" />
      </button>
      <Navbar activeTab="groups" />
    </div>
  );
};

const AdminBroadcast = () => {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [groups, setGroups] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setGroups(storage.get('groups') || []);
  }, []);

  const handleSend = async () => {
    if (!selectedGroup || !content) return;
    setSending(true);
    try {
      const messages = storage.get('messages') || [];
      const newMessage = {
        id: Date.now().toString(),
        sender_id: user.uid,
        message_type: 'broadcast',
        group_id: selectedGroup,
        priority,
        subject: subject || 'Administrative Broadcast',
        content,
        sent_at: new Date().toISOString(),
      };
      storage.set('messages', [newMessage, ...messages]);
      
      const allGroups = storage.get('groups') || [];
      const updatedGroups = allGroups.map((g: any) => 
        g.id === selectedGroup ? { ...g, updated_at: new Date().toISOString() } : g
      );
      storage.set('groups', updatedGroups);

      // Simulate notification on user side
      const toast = document.createElement('div');
      toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-2xl z-[1000] animate-in slide-in-from-top';
      toast.innerText = 'BROADCAST DISPATCHED TO GROUP';
      document.body.appendChild(toast);
      setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header title="New Broadcast" showBack={true} />

      <main className="pt-20 pb-32 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 overflow-y-auto no-scrollbar">
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.2em] px-1">Target Sector</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap border transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer",
                  selectedGroup === group.id ? "bg-primary text-white border-transparent shadow-md shadow-primary/10" : "bg-white text-on-surface-variant/60 border-outline-variant/20 hover:border-primary/40"
                )}
              >
                <ShieldCheck className={cn("w-3.5 h-3.5", selectedGroup === group.id ? "text-white" : "text-outline/30")} />
                {group.name}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.2em] px-1">Priority Protocol</h2>
          <div className="grid grid-cols-4 gap-2">
            {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-bold tracking-widest transition-all cursor-pointer uppercase shadow-sm",
                  priority === p 
                    ? (p === 'URGENT' ? "bg-error text-white border-transparent shadow-md" : "bg-primary text-white border-transparent shadow-md")
                    : "bg-white border-outline-variant/20 text-on-surface-variant/60 hover:bg-surface-container-low"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <div className="bg-white rounded-3xl border border-outline-variant/10 p-6 space-y-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10" />
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-on-surface/30 uppercase px-1 tracking-widest">Subject Line</label>
            <input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent border-b border-outline-variant/10 px-1 pb-2 h-10 focus:border-primary transition-all outline-none font-bold text-lg placeholder:text-on-surface/10" 
              placeholder="Broadcast subject..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-on-surface/30 uppercase px-1 tracking-widest">Message Payload</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-sm min-h-[180px] font-medium leading-relaxed placeholder:text-on-surface/20" 
              placeholder="Type administrative briefing..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-primary/[0.03] rounded-2xl border border-primary/10 shadow-sm">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-primary uppercase tracking-tight">Encryption Active</p>
            <p className="text-[11px] text-on-surface-variant/60 leading-tight font-medium">
              Transmissions are encrypted and distributed via isolated nodes.
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 py-4 px-6 z-50">
        <div className="max-w-2xl mx-auto">
          <button 
            disabled={sending || !selectedGroup || !content}
            onClick={handleSend}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white h-12 rounded-xl font-bold text-[13px] uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95 cursor-pointer group"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>Broadcast Message</span>
                <Send className="w-4 h-4 text-white/50 group-hover:text-white transform group-hover:translate-x-0.5 transition-all" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageDetailView = ({ message, onBack }: { message: any, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[100] bg-surface flex flex-col"
    >
      <header className="h-16 border-b border-outline-variant/10 flex items-center px-4 gap-4 bg-surface/80 backdrop-blur-xl sticky top-0 z-10 shrink-0">
        <button onClick={onBack} className="p-3 hover:bg-surface-container-low rounded-full transition-all cursor-pointer group">
          <ArrowLeft className="w-6 h-6 text-on-surface group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold tracking-tight truncate">{message.subject || 'Secure Brief'}</h2>
          <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest truncate">Authorized Communication Node</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-10 pb-40 no-scrollbar">
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-8"
          >
              <div className="px-5 py-1.5 rounded-full bg-success/5 border border-success/10 text-[11px] font-bold uppercase tracking-wider text-success flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Integrity Verified
              </div>
              <p className="text-[11px] text-on-surface/30 font-bold uppercase tracking-widest">Received: {formatDistanceToNow(new Date(message.sent_at))} ago</p>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Administrative Node</p>
              <p className="text-[10px] font-bold text-on-surface/20 uppercase tracking-tight">One-way secure link enabled</p>
            </div>
          </div>
          
          <div className="bg-white border border-outline-variant/10 p-10 rounded-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
             <p className="text-lg font-medium leading-relaxed text-on-surface whitespace-pre-wrap">{message.content}</p>
          </div>

          <div className="flex items-center justify-center gap-2 opacity-20 px-2 py-4">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
             <p className="text-[11px] font-bold uppercase tracking-widest text-outline">Transmission Hash: {message.id}</p>
          </div>
        </motion.div>
      </main>

      <div className="p-8 border-t border-outline-variant/10 bg-surface/80 backdrop-blur-2xl shrink-0 fixed bottom-0 w-full left-0">
         <div className="max-w-3xl mx-auto bg-white border border-outline-variant/20 p-6 rounded-[32px] text-center shadow-lg shadow-black/[0.02]">
            <p className="text-[11px] font-bold text-on-surface/40 uppercase tracking-[0.2em] mb-1">Reply Restricted</p>
            <p className="text-[10px] text-on-surface/20 font-bold uppercase tracking-tight">This terminal is restricted to receive-only administrative transmissions.</p>
         </div>
      </div>
    </motion.div>
  );
};

const MemberInbox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [inboxTab, setInboxTab] = useState<'all' | 'group' | 'private'>('all');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    const allMessages = storage.get('messages') || [];
    const memberships = storage.get('memberships') || [];
    
    if (user.uid !== 'admin-1') {
      const userGroupIds = memberships.filter((m: any) => m.contact_id === user.uid).map((m: any) => m.group_id);
      setMessages(allMessages.filter((m: any) => 
        (m.group_id && userGroupIds.includes(m.group_id)) || 
        (m.recipient_ids && m.recipient_ids.includes(user.uid))
      ).sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()));
    } else {
      setMessages(allMessages.sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()));
    }
  }, [user]);

  const filteredMessages = messages.filter(m => {
    const matchesSearch = (m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = activePriority ? m.priority === activePriority : true;
    const matchesTab = inboxTab === 'all' 
      ? true 
      : (inboxTab === 'group' ? !!m.group_id : !!m.recipient_ids);
    return matchesSearch && matchesPriority && matchesTab;
  });

  const priorityMessages = filteredMessages.filter(m => ['URGENT', 'HIGH'].includes(m.priority));
  const recentMessages = filteredMessages.filter(m => !['URGENT', 'HIGH'].includes(m.priority));

  if (selectedMessage) {
    return <MessageDetailView message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-tr from-surface via-secondary/5 to-primary/10 overflow-hidden">
      <Header title="Inbox" />
      <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-3">
        <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md pt-1 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="space-y-4">
            <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/20 shadow-sm max-w-[280px] mx-auto">
              {(['all', 'group', 'private'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setInboxTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer",
                    inboxTab === tab ? "bg-white text-primary shadow-sm" : "text-on-surface-variant/50 hover:text-on-surface"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline/30 group-focus-within:text-primary transition-colors" />
              <input 
                id="page-search"
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feed..." 
                className="w-full pl-10 pr-4 h-10 bg-white border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 transition-all shadow-sm outline-none text-xs font-medium placeholder:text-outline/20"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth">
              {['URGENT', 'HIGH', 'NORMAL', 'LOW'].map(p => (
                <button
                   key={p}
                   onClick={() => setActivePriority(activePriority === p ? null : p)}
                   className={cn(
                       "px-3.5 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap cursor-pointer",
                       activePriority === p 
                           ? "bg-primary text-white border-primary shadow-sm" 
                           : "bg-white border-outline-variant/20 text-on-surface-variant/60 hover:bg-surface-container-low"
                   )}
                >
                   {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredMessages.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <Inbox className="w-20 h-20 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No matching broadcasts.</p>
          </div>
        )}

        {priorityMessages.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Priority Streams</h2>
            </div>
            <div className="space-y-4">
              {priorityMessages.map((msg) => (
                <BroadcastCard key={msg.id} msg={msg} onClick={() => setSelectedMessage(msg)} />
              ))}
            </div>
          </section>
        )}

        {recentMessages.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Recent Broadcasts</h2>
            </div>
            <div className="space-y-4">
              {recentMessages.map((msg) => (
                <BroadcastCard key={msg.id} msg={msg} onClick={() => setSelectedMessage(msg)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Navbar activeTab="inbox" />
    </div>
  );
};

const BroadcastCard = ({ msg, onClick }: any) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      onClick();
      setLoading(false);
    }, 600);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'border-l-error bg-error/[0.02]';
      case 'HIGH': return 'border-l-primary bg-primary/[0.02]';
      case 'NORMAL': return 'border-l-success bg-success/[0.02]';
      default: return 'border-l-outline-variant/30 bg-white';
    }
  };

  return (
    <article 
      onClick={handleClick}
      className={cn(
        "border border-outline-variant/10 rounded-[12px] p-3 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group active:scale-[0.99] border-l-4 relative",
        getPriorityColor(msg.priority),
        loading && "opacity-60 pointer-events-none"
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 transition-all duration-300">
           <div className="flex gap-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="px-1.5 py-0.5 rounded bg-surface-container-low border border-outline-variant/5">
            <span className="text-[7px] font-bold text-on-surface/30 uppercase tracking-widest">Admin</span>
          </div>
          <span className="text-[7px] font-medium text-on-surface-variant/30 uppercase tracking-tight">{formatDistanceToNow(new Date(msg.sent_at))} ago</span>
        </div>
        <Badge color={msg.priority === 'URGENT' ? 'error' : (msg.priority === 'HIGH' ? 'primary' : (msg.priority === 'NORMAL' ? 'success' : 'outline'))}>
          {msg.priority || 'NORMAL'}
        </Badge>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-on-surface tracking-tight leading-tight group-hover:text-primary transition-colors">{msg.subject || 'Broadcast'}</h3>
        <p className="text-[11px] font-medium text-on-surface-variant/50 line-clamp-1 leading-relaxed">{msg.content}</p>
      </div>
      <div className="mt-2.5 pt-2 border-t border-outline-variant/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-1">
           <ShieldCheck className="w-3 h-3 text-success/60" />
           <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Validated</span>
         </div>
         <ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
      </div>
    </article>
  );
};

const Badge = ({ children, color = 'primary' }: { children: React.ReactNode, color?: 'primary' | 'error' | 'outline' | 'success' }) => {
  const styles = {
    primary: "bg-primary/5 text-primary border-primary/20",
    error: "bg-error/5 text-error border-error/20",
    outline: "bg-on-surface-variant/5 text-on-surface-variant border-outline-variant/20",
    success: "bg-success/5 text-success border-success/20"
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[color]
    )}>
      {children}
    </span>
  );
};

const MemberNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    const messages = storage.get('messages') || [];
    const memberships = storage.get('memberships') || [];
    const groups = storage.get('groups') || [];
    const userGroupIds = memberships.filter((m: any) => m.contact_id === user.uid).map((m: any) => m.group_id);

    const userMessages = messages.filter((m: any) => 
      (m.group_id && userGroupIds.includes(m.group_id)) || 
      (m.recipient_ids && m.recipient_ids.includes(user.uid))
    );

    const notes: any[] = [];
    userMessages.slice(-15).forEach((m: any) => {
      notes.push({
        id: `m-${m.id}`,
        title: m.priority === 'URGENT' ? 'Priority Broadcast Delivered' : 'New Broadcast Received',
        message: `Official administrative brief: "${m.subject || 'Administrative Update'}"`,
        time: m.sent_at,
        type: m.priority === 'URGENT' ? 'urgent' : 'info'
      });
    });
    
    // Add group updates
    userGroupIds.forEach(gid => {
        const group = groups.find((g:any) => g.id === gid);
        if (group) {
            notes.push({
                id: `g-${gid}`,
                title: 'Communication Group Updated',
                message: `The protocol group "${group.name.toUpperCase()}" status is active and verified.`,
                time: group.updated_at || group.created_at,
                type: 'success'
            });
        }
    });

    setNotifications(notes.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  }, [user]);

  const handleAlertClick = (note: any) => {
    if (note.id.startsWith('m-')) {
      const msgId = note.id.replace('m-', '');
      const allMessages = storage.get('messages') || [];
      const msg = allMessages.find((m: any) => m.id === msgId);
      if (msg) setSelectedMessage(msg);
    }
  };

  const filteredNotes = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMessage) {
    return <MessageDetailView message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      <Header title="Alerts" />
      <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-3">
        <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md pt-2 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts..." 
              className="w-full pl-12 pr-6 h-12 bg-white border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 transition-all shadow-sm outline-none text-sm font-medium placeholder:text-outline/40"
            />
          </div>
        </div>

        {filteredNotes.length === 0 && (
          <div className="py-20 text-center opacity-20 flex flex-col items-center">
            <Bell className="w-16 h-16 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No matching alerts.</p>
          </div>
        )}
        {filteredNotes.map((note) => (
          <div 
            key={note.id} 
            onClick={() => handleAlertClick(note)}
            className={cn(
              "bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-primary/30 border-l-4 cursor-pointer active:scale-[0.98]",
              note.type === 'urgent' ? "border-l-error" : (note.type === 'success' ? "border-l-success" : "border-l-primary")
            )}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant shadow-inner">
              {note.type === 'urgent' ? <Info className="w-5 h-5 text-error" /> : (note.type === 'success' ? <ShieldCheck className="w-5 h-5 text-success" /> : <Bell className="w-5 h-5 text-primary" />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-on-surface truncate">{note.title}</h3>
                <span className="text-[9px] text-outline font-black uppercase whitespace-nowrap ml-2">{formatDistanceToNow(new Date(note.time))} ago</span>
              </div>
              <p className="text-xs font-medium text-on-surface-variant line-clamp-2 opacity-80">{note.message}</p>
            </div>
          </div>
        ))}
      </main>
      <Navbar activeTab="notifications" />
    </div>
  );
};

const MemberAccount = () => {
  const { profile, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [priorityOnly, setPriorityOnly] = useState(() => {
    const saved = localStorage.getItem('pref_priority_only');
    return saved === null ? true : saved === 'true';
  });

  const [deepAlerts, setDeepAlerts] = useState(() => {
    const saved = localStorage.getItem('pref_deep_alerts');
    return saved === null ? true : saved === 'true';
  });

  const togglePriority = () => {
    const next = !priorityOnly;
    setPriorityOnly(next);
    localStorage.setItem('pref_priority_only', String(next));
  };

  const toggleDeepAlerts = () => {
    const next = !deepAlerts;
    setDeepAlerts(next);
    localStorage.setItem('pref_deep_alerts', String(next));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-bl from-surface via-primary/5 to-secondary/5 overflow-hidden">
      <Header title="Account" showSearch={false} />
      <main className="flex-1 overflow-y-auto pt-16 pb-40 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar">
        <section className="bg-surface-container-low rounded-3xl p-8 mb-8 border border-outline-variant shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl bg-primary flex items-center justify-center mb-4 ring-1 ring-outline-variant text-white">
              <UserCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-on-surface tracking-tighter uppercase">{profile?.full_name || 'Auth Personnel'}</h2>
            <p className="text-xs font-black text-outline uppercase tracking-widest mt-1">{profile?.email}</p>
            <div className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-widest">
              {profile?.role === 'admin' ? 'System Administrator' : 'Authorized Recipient'}
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <Bell className="text-primary w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Alerts</h3>
              </div>
            </div>
            <div className="space-y-4">
              <PreferenceToggle 
                title="Priority Only" 
                desc="Mute standard group activity" 
                active={priorityOnly} 
                onClick={togglePriority}
              />
              <div className="h-px bg-outline-variant/30 w-full" />
              <PreferenceToggle 
                title="Deep Alerts" 
                desc="Critical system protocol changes" 
                active={deepAlerts} 
                onClick={toggleDeepAlerts}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
             <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Security</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <Lock className="text-primary w-5 h-5 mt-1" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-on-surface">Privacy Active</p>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-1 leading-relaxed opacity-70">Identity isolated from all other network members.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                    <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Last Access</p>
                    <p className="text-xs font-bold">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                    <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Device</p>
                    <p className="text-xs font-bold">Authenticated Terminal</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full py-5 bg-surface-container-lowest border border-error text-error rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-error/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 shadow-sm cursor-pointer">
            <LogOut className="w-5 h-5" /> De-Authorize & Logout
          </button>
        </div>
      </main>
      <Navbar activeTab="profile" />
    </div>
  );
};

const PreferenceToggle = ({ title, desc, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between cursor-pointer group hover:bg-surface-container-low -mx-2 px-2 py-2 rounded-xl transition-all"
  >
    <div className="flex-1">
      <p className="text-sm font-black text-on-surface uppercase tracking-tight">{title}</p>
      <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed opacity-70 uppercase tracking-widest">{desc}</p>
    </div>
    <div className={cn("w-11 h-6 rounded-full relative transition-all shadow-inner", active ? "bg-primary" : "bg-outline-variant")}>
      <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm", active ? "left-6" : "left-1")} />
    </div>
  </div>
);

const AdminNewGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setAvailableContacts(storage.get('contacts') || []);
  }, []);

  const toggleMemberSelection = (id: string) => {
    setSelectedContactIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const groups = storage.get('groups') || [];
      const groupId = name.toLowerCase().replace(/ /g, '-') + '-' + Date.now().toString().slice(-4);
      const newGroup = {
        id: groupId,
        name,
        description,
        member_count: selectedContactIds.length,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      storage.set('groups', [...groups, newGroup]);
      
      const memberships = storage.get('memberships') || [];
      const newMemberships = selectedContactIds.map(cid => ({ group_id: groupId, contact_id: cid }));
      storage.set('memberships', [...memberships, ...newMemberships]);
      
      navigate('/admin/groups');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header title="New Group" showBack={true} showSearch={false} />
      <main className="pt-20 pb-20 px-4 sm:px-6 max-w-lg mx-auto overflow-y-auto no-scrollbar">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase">Group Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 outline-none" 
                placeholder="e.g. Executive Board"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 outline-none min-h-[100px]" 
                placeholder="What is this group for?"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase px-1">Assign Initial Members ({selectedContactIds.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {availableContacts.map(contact => (
                <div 
                  key={contact.id}
                  onClick={() => toggleMemberSelection(contact.id)}
                  className={cn(
                    "flex items-center justify-between p-4 bg-white border rounded-xl cursor-pointer transition-all",
                    selectedContactIds.includes(contact.id) ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <UserIcon className={cn("w-4 h-4", selectedContactIds.includes(contact.id) ? "text-primary" : "text-outline")} />
                    <div>
                      <p className="font-bold text-xs">{contact.full_name}</p>
                      <p className="text-[10px] text-outline uppercase">{contact.email}</p>
                    </div>
                  </div>
                  {selectedContactIds.includes(contact.id) && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
              ))}
              {availableContacts.length === 0 && <p className="text-center py-10 text-outline text-xs">No registered members found.</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={creating || !name}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg disabled:opacity-50 active:scale-95 transition-all uppercase text-xs tracking-widest"
          >
            {creating ? 'Creating Perimeter...' : 'Initialize Group'}
          </button>
        </form>
      </main>
    </div>
  );
};

const AdminContacts = () => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ full_name: '', email: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelectiveMsg, setShowSelectiveMsg] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const navigate = useNavigate();

  useEffect(() => {
    setContacts(storage.get('contacts') || []);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const contacts = storage.get('contacts') || [];
    const id = 'c' + Date.now();
    const updated = [...contacts, { ...newContact, id, role: 'member' }];
    storage.set('contacts', updated);
    setContacts(updated);
    setShowAdd(false);
    setNewContact({ full_name: '', email: '' });
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    storage.set('contacts', updated);
    setContacts(updated);
  };

  const handleSelectiveSend = () => {
    if (!msgContent || selectedIds.length === 0) return;
    const allMessages = storage.get('messages') || [];
    const newMessage = {
      id: Date.now().toString(),
      sender_id: user.uid,
      message_type: 'selective',
      recipient_ids: [...selectedIds],
      priority,
      subject: 'DIRECT ADMINISTRATIVE BRIEFING',
      content: msgContent,
      sent_at: new Date().toISOString()
    };
    storage.set('messages', [newMessage, ...allMessages]);
    setShowSelectiveMsg(false);
    setSelectedIds([]);
    setMsgContent('');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredContacts = contacts.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-br from-surface via-secondary/5 to-primary/5 overflow-hidden">
      <Header title="Members" />
      <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-3">
        <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md pt-2 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/40 group-focus-within:text-primary transition-colors" />
            <input 
              id="page-search"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory..." 
              className="w-full pl-12 pr-4 h-12 bg-white border border-outline-variant/30 rounded-full focus:ring-4 focus:ring-primary/5 transition-all shadow-sm outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest">{filteredContacts.length} members listed</p>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setShowSelectiveMsg(true)}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-in slide-in-from-right duration-200 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Selective Broadcast ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              onClick={() => toggleSelect(contact.id)}
              className={cn(
                "bg-white rounded-[24px] p-4 border transition-all flex items-center justify-between group cursor-pointer",
                selectedIds.includes(contact.id) ? "border-primary ring-4 ring-primary/5 bg-primary/5 shadow-sm" : "border-outline-variant/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-inner",
                  selectedIds.includes(contact.id) ? "bg-primary border-transparent text-white" : "bg-primary/5 text-primary border-primary/20"
                )}>
                  {selectedIds.includes(contact.id) ? <CheckCircle2 className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight leading-none mb-1">{contact.full_name}</h3>
                  <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-wide">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
                  className="p-2 rounded-xl hover:bg-error/10 text-error/40 hover:text-error transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Selective Briefing Modal */}
      {showSelectiveMsg && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSelectiveMsg(false)} />
          <div className="relative w-full max-w-lg bg-surface rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200 border border-outline-variant">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Security className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Selective Briefing</h3>
                <p class="text-[10px] text-outline font-black uppercase tracking-widest">Targeting {selectedIds.length} selected personnel</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Priority Protocol</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                        "py-2 rounded-lg border text-[10px] font-black tracking-widest transition-all",
                        priority === p 
                            ? (p === 'URGENT' ? "bg-error text-white border-transparent" : "bg-primary text-white border-transparent")
                            : "bg-surface-container-low border-outline-variant text-outline hover:border-primary/40"
                        )}
                    >
                        {p}
                    </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Briefing Content</label>
                <textarea 
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Enter administrative message content..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-5 text-sm outline-none min-h-[220px] focus:ring-2 focus:ring-primary/10 transition-all font-medium leading-relaxed"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowSelectiveMsg(false)} className="flex-1 h-14 border-2 border-outline-variant rounded-xl font-black uppercase text-[10px] tracking-widest">Abort</button>
                <button onClick={handleSelectiveSend} disabled={!msgContent} className="flex-2 h-14 bg-primary text-white rounded-xl font-black uppercase text-sm tracking-widest shadow-xl disabled:opacity-50">Initiate Dispatch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50 cursor-pointer">
        <Plus className="w-8 h-8" />
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md bg-surface rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200 border border-outline-variant">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter">Add New Member</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Full Name</label>
                <input 
                  value={newContact.full_name}
                  onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 h-12 outline-none focus:border-primary font-bold" 
                  placeholder="Administrative Identifier"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Email Address</label>
                <input 
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 h-12 outline-none focus:border-primary font-bold" 
                  placeholder="member@securecast.net"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 h-12 border-2 border-outline-variant rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Navbar activeTab="contacts" />
    </div>
  );
};

const AdminChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [members, setMembers] = useState<Contact[]>([]);

  useEffect(() => {
    const allGroups = storage.get('groups') || [];
    const foundGroup = allGroups.find((g: any) => g.id === id);
    setGroup(foundGroup);

    const allMessages = storage.get('messages') || [];
    setMessages(allMessages.filter((m: any) => m.group_id === id).sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()));

    const memberships = storage.get('memberships') || [];
    const contacts = storage.get('contacts') || [];
    const groupMemberIds = memberships.filter((m: any) => m.group_id === id).map((m: any) => m.contact_id);
    setMembers(contacts.filter((c: any) => groupMemberIds.includes(c.id)));
  }, [id]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender_id: user.uid,
      message_type: 'broadcast',
      group_id: id,
      priority,
      content: input,
      sent_at: new Date().toISOString()
    };

    const allMessages = storage.get('messages') || [];
    storage.set('messages', [...allMessages, newMessage]);
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    const allGroups = storage.get('groups') || [];
    storage.set('groups', allGroups.map((g: any) => g.id === id ? { ...g, updated_at: new Date().toISOString() } : g));
    
    // Toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest z-[1000] animate-in slide-in-from-top';
    toast.innerText = 'BROADCAST DISPATCHED';
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('animate-out', 'fade-out'); setTimeout(() => toast.remove(), 300); }, 2000);
  };

  if (!group) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header title={group.name} subtitle={`${members.length} Authorized Units`} showBack={true} backPath="/admin/groups" />

      <main className="flex-1 pt-16 pb-44 px-4 sm:px-6 overflow-y-auto space-y-3 flex flex-col max-w-3xl mx-auto w-full">
        <div className="pt-0 pb-4 text-center">
            <p className="text-[10px] font-black text-outline uppercase tracking-[0.3em]">Group Broadcast Active • Logging Enabled</p>
        </div>

        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center gap-4">
            <ShieldCheck className="w-20 h-20" />
            <p className="font-black uppercase tracking-widest text-xs">No administrative records for this group.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start w-full">
            <div className="w-full flex items-center gap-3 mb-2 opacity-60">
                <div className="h-px flex-1 bg-outline-variant/30" />
                <span className="text-[9px] font-black text-outline uppercase tracking-widest">{new Date(msg.sent_at).toLocaleString()}</span>
                <div className="h-px flex-1 bg-outline-variant/30" />
            </div>
            <div className={cn(
                "w-full p-5 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden bg-surface-container-lowest",
                msg.priority === 'URGENT' && "border-error/40 bg-error/[0.02]"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Campaign className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Broadcast Log Item</span>
                </div>
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                    msg.priority === 'URGENT' ? "bg-error text-white" : "bg-primary/10 text-primary"
                )}>{msg.priority || 'NORMAL'}</span>
              </div>
              <p className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <div className="mt-4 flex items-center justify-between opacity-40">
                <div className="flex items-center gap-1.5 grayscale">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Dispatched to all restricted units</span>
                </div>
                <p className="text-[9px] font-black font-mono">ID: {msg.id.substring(0,8)}</p>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-2xl border-t border-outline-variant/10 z-50">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['NORMAL', 'HIGH', 'URGENT'] as const).map(p => (
              <button 
                key={p} 
                onClick={() => setPriority(p)}
                className={cn(
                    "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap cursor-pointer",
                    priority === p ? "bg-primary text-white border-transparent shadow-md" : "bg-white text-outline border-outline-variant/30 hover:bg-surface-container-low"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
                <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Secure transmission link..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 shadow-inner transition-all min-h-[56px] max-h-[160px] resize-none"
                />
            </div>
            <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 cursor-pointer shrink-0 group"
            >
                <Send className="w-6 h-6 fill-white opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showSelectiveMsg, setShowSelectiveMsg] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  useEffect(() => {
    const allGroups = storage.get('groups') || [];
    setGroup(allGroups.find((g: any) => g.id === id));

    const memberships = storage.get('memberships') || [];
    const allContacts = storage.get('contacts') || [];
    const groupMemberIds = memberships.filter((m: any) => m.group_id === id).map((m: any) => m.contact_id);
    
    setMembers(allContacts.filter((c: any) => groupMemberIds.includes(c.id)));
    setAvailableContacts(allContacts.filter((c: any) => !groupMemberIds.includes(c.id)));
  }, [id]);

  const removeMember = (contactId: string) => {
    const memberships = storage.get('memberships') || [];
    const newMemberships = memberships.filter((m: any) => !(m.group_id === id && m.contact_id === contactId));
    storage.set('memberships', newMemberships);
    
    const groups = storage.get('groups') || [];
    storage.set('groups', groups.map((g: any) => g.id === id ? { ...g, member_count: Math.max(0, (g.member_count || 1) - 1) } : g));

    const contact = members.find(c => c.id === contactId);
    if (contact) {
      setMembers(prev => prev.filter(c => c.id !== contactId));
      setAvailableContacts(prev => [...prev, contact]);
    }
  };

  const addMember = (contactId: string) => {
    const memberships = storage.get('memberships') || [];
    const newMemberships = [...memberships, { group_id: id, contact_id: contactId }];
    storage.set('memberships', newMemberships);
    
    const groups = storage.get('groups') || [];
    storage.set('groups', groups.map((g: any) => g.id === id ? { ...g, member_count: (g.member_count || 0) + 1 } : g));

    const contact = availableContacts.find(c => c.id === contactId);
    if (contact) {
      setMembers(prev => [...prev, contact]);
      setAvailableContacts(prev => prev.filter(c => c.id !== contactId));
    }
  };

  const handleSelectiveSend = () => {
    if (!msgContent || selectedMembers.length === 0) return;
    
    const allMessages = storage.get('messages') || [];
    const newMessage = {
      id: Date.now().toString(),
      sender_id: user.uid,
      message_type: 'selective',
      recipient_ids: [...selectedMembers],
      priority,
      subject: 'DIRECT ADMINISTRATIVE BRIEFING',
      content: msgContent,
      sent_at: new Date().toISOString()
    };
    
    storage.set('messages', [newMessage, ...allMessages]);
    setShowSelectiveMsg(false);
    setSelectedMembers([]);
    setMsgContent('');
    
    // Feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest z-[1000] animate-in slide-in-from-bottom duration-300';
    toast.innerText = 'SELECTIVE BROADCAST DISPATCHED';
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
  };

  const toggleSelect = (memberId: string) => {
    setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(m => m !== memberId) : [...prev, memberId]);
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!group) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface">
      <Header title="Members" showBack={true} />

      <main className="pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto space-y-3">
        <div className="sticky top-16 z-40 bg-surface/95 backdrop-blur-md pt-0 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter members in this group..." 
              className="w-full pl-12 pr-4 h-14 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none font-bold"
            />
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant shadow-inner border-l-4 border-l-primary">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Active Group</h2>
          <p className="text-xl font-black text-on-surface uppercase tracking-tight">{group.name}</p>
          <p className="text-[10px] text-outline font-black uppercase tracking-widest mt-1">{members.length} members authorized.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Authorized Members</h3>
            {selectedMembers.length > 0 && (
              <button 
                onClick={() => setShowSelectiveMsg(true)}
                className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-full flex items-center gap-2 animate-in slide-in-from-right uppercase tracking-widest"
              >
                <Send className="w-3 h-3" /> Selective Briefing ({selectedMembers.length})
              </button>
            )}
          </div>
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              onClick={() => toggleSelect(member.id)}
              className={cn(
                "bg-surface-container-lowest rounded-xl p-4 border transition-all flex items-center justify-between cursor-pointer",
                selectedMembers.includes(member.id) ? "border-primary ring-2 ring-primary/10 bg-primary/5 shadow-inner" : "border-outline-variant shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 shadow-inner",
                  selectedMembers.includes(member.id) ? "bg-primary border-transparent text-white" : "bg-secondary-container/10 text-primary border-outline-variant"
                )}>
                  {selectedMembers.includes(member.id) ? <CheckCircle2 className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface tracking-tight leading-none">{member.full_name}</h4>
                  <p className="text-[10px] text-outline font-black uppercase tracking-widest mt-1">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeMember(member.id); }}
                  className="p-2.5 rounded-xl hover:bg-error/10 text-error/40 hover:text-error transition-all cursor-pointer"
                  title="Remove from group"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && <p className="text-center py-10 text-outline italic text-xs">No members matching query.</p>}
        </div>
      </main>
      
      <button 
        onClick={() => setShowAdd(true)} 
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-[60] cursor-pointer"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Selective Message Modal */}
      {showSelectiveMsg && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowSelectiveMsg(false)} />
          <div className="relative w-full max-w-lg bg-surface rounded-2xl p-8 border border-outline-variant shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Selective Briefing</h3>
            <p className="text-[10px] text-outline font-black uppercase tracking-widest mb-8">Targeting {selectedMembers.length} members in group ${group.name}</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Priority Protocol</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                        "py-2 rounded-lg border text-[10px] font-black tracking-widest transition-all",
                        priority === p ? "bg-primary text-white border-transparent" : "bg-surface-container-low border-outline-variant text-outline"
                        )}
                    >
                        {p}
                    </button>
                    ))}
                </div>
              </div>
              <textarea 
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Enter administrative briefing content..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-5 text-sm outline-none min-h-[200px] focus:ring-2 focus:ring-primary/10 transition-all font-medium leading-relaxed"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowSelectiveMsg(false)} className="flex-1 h-14 border-2 border-outline-variant rounded-xl font-black uppercase text-[10px] tracking-widest">Abort</button>
                <button onClick={handleSelectiveSend} disabled={!msgContent} className="flex-2 h-14 bg-primary text-white rounded-xl font-black uppercase text-sm tracking-widest shadow-xl disabled:opacity-30">Initiate Dispatch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-lg bg-surface rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200 border border-outline-variant">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter italic">Assign Members to Group</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {availableContacts.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => addMember(contact.id)}
                  className="w-full flex items-center justify-between p-5 bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary/40 transition-all text-left shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <UserIcon className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{contact.full_name}</p>
                      <p className="text-[10px] text-outline font-black uppercase tracking-widest">{contact.email}</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {availableContacts.length === 0 && <p className="text-center py-10 text-outline font-black uppercase tracking-widest text-[10px]">Registry Empty</p>}
            </div>
            <button onClick={() => setShowAdd(false)} className="w-full mt-8 h-14 bg-surface-container-high border-2 border-outline-variant rounded-xl font-black uppercase text-[10px] tracking-widest">Complete Assignment</button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const groups = storage.get('groups') || [];
    const messages = storage.get('messages') || [];

    const notes: any[] = [];
    
    messages.slice(-10).forEach(m => {
      let recipientText = m.group_id ? `Group: ${groups.find((g: any) => g.id === m.group_id)?.name || m.group_id}` : (m.recipient_ids ? `${m.recipient_ids.length} Selected Personnel` : 'Public Broadcast');
      notes.push({
        id: `m-${m.id}`,
        title: 'Broadcast Securely Recorded',
        message: `${m.priority || 'NORMAL'} Briefing dispatched to ${recipientText}.`,
        time: m.sent_at,
        type: 'info'
      });
    });

    groups.forEach(g => {
      notes.push({
        id: `g-${g.id}`,
        title: 'Communication Group Active',
        message: `Group "${g.name.toUpperCase()}" is synchronized with Broadcast center.`,
        time: g.created_at,
        type: 'success'
      });
    });

    setNotifications(notes.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface bg-gradient-to-br from-surface via-error/5 to-primary/5 overflow-hidden">
      <Header title="Logs" />
      <main className="flex-1 overflow-y-auto pt-16 pb-32 px-4 sm:px-6 max-w-3xl mx-auto w-full no-scrollbar space-y-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          <p className="text-[10px] font-bold text-on-surface/40 uppercase tracking-[0.2em]">Real-Time Security Feed Active</p>
        </div>

        {notifications.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <ShieldCheck className="w-20 h-20 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No protocol events recorded.</p>
          </div>
        )}
        {notifications.map((note) => (
          <div key={note.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-start gap-4 hover:border-primary/30 transition-colors border-l-4 border-l-primary">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-outline-variant shadow-inner",
              note.type === 'success' ? "bg-success/5 text-success" : "bg-primary/5 text-primary"
            )}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-black text-[11px] uppercase tracking-wider text-on-surface">{note.title}</h3>
                <span className="text-[9px] text-outline font-black uppercase tracking-tighter">{formatDistanceToNow(new Date(note.time))} ago</span>
              </div>
              <p className="text-xs font-medium text-on-surface-variant leading-relaxed">{note.message}</p>
            </div>
          </div>
        ))}
        <div className="pt-12 text-center">
            <div className="h-px bg-outline-variant/30 w-1/2 mx-auto mb-4" />
            <p className="text-[9px] font-black text-outline uppercase tracking-[0.5em]">Command Log EOF</p>
        </div>
      </main>
      <Navbar activeTab="notifications" />
    </div>
  );
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const login = async (email: string, pass: string) => {
    if (email === 'admin' && pass === 'admin') {
      const mockUser = { uid: 'admin-1', email: 'admin@broadcast.com', displayName: 'Administrator' };
      const mockProfile: UserProfile = {
        full_name: 'Administrator',
        email: 'admin@broadcast.com',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(mockUser);
      setProfile(mockProfile);
      storage.set('current-user', { user: mockUser, profile: mockProfile });
    } else if (pass === 'demo-bypass') {
      const contacts = storage.get('contacts') || [];
      const member = contacts.find((c: any) => c.email === email);
      if (member) {
        const mockUser = { uid: member.id, email: member.email, displayName: member.full_name };
        const mockProfile: UserProfile = {
          full_name: member.full_name,
          email: member.email,
          role: 'member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(mockUser);
        setProfile(mockProfile);
        storage.set('current-user', { user: mockUser, profile: mockProfile });
      } else {
        throw new Error('Member not found in current directory.');
      }
    } else {
      throw new Error('Invalid credentials. Use admin/admin or Member Access.');
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('current-user');
  };

  useEffect(() => {
    storage.init();
    const saved = localStorage.getItem('current-user');
    if (saved) {
      const { user: u, profile: p } = JSON.parse(saved);
      setUser(u);
      setProfile(p);
    }
    setLoading(false);
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isTransitioning, setIsTransitioning, login, logout }}>
      {loading ? <LoadingScreen /> : children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/40 backdrop-blur-[2px] z-[1000] flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Feed...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/inbox" replace />;

  return <>{children}</>;
};

// --- App Root ---

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<Login />} />
            
            {/* Member Routes */}
            <Route path="/inbox" element={<ProtectedRoute><MemberInbox /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MemberAccount /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><MemberNotifications /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute adminOnly><MemberAccount /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute adminOnly><AdminGroups /></ProtectedRoute>} />
            <Route path="/admin/groups/new" element={<ProtectedRoute adminOnly><AdminNewGroup /></ProtectedRoute>} />
            <Route path="/admin/groups/:id/members" element={<ProtectedRoute adminOnly><AdminMembers /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute adminOnly><AdminContacts /></ProtectedRoute>} />
            <Route path="/admin/chat/:id" element={<ProtectedRoute adminOnly><AdminChat /></ProtectedRoute>} />
            <Route path="/admin/broadcast" element={<ProtectedRoute adminOnly><AdminBroadcast /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}
