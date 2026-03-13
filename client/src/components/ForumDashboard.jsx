import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent } from './ui/sheet';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { DiscussionList } from './DiscussionList';
import { DiscussionDetail } from './DiscussionDetail';
import { UserProfile } from './UserProfile';
import { SettingsPage } from './SettingsPage';
import { BookmarksPage } from './BookmarksPage';
import { HelpPage } from './HelpPage';
import { AboutPage } from './AboutPage';
import { Footer } from './Footer';
import DirectMessaging from './DirectMessaging';
import { LogOut, MessageSquare, User as UserIcon, Stethoscope, Settings, Bookmark, HelpCircle, Info, Bell, Menu, Hash, Activity, MessageCircle, ChevronDown } from 'lucide-react';

const categories = [
  'General Health','Mental Health','Cardiology','Neurology',
  'Pediatrics','Dermatology','Nutrition','Fitness',"Women's Health","Men's Health",
];

const navItems = [
  { id:'discussions', icon:<MessageSquare className="w-4 h-4"/>, label:'Discussions' },
  { id:'messages',    icon:<MessageCircle className="w-4 h-4"/>, label:'Messages' },
  { id:'bookmarks',   icon:<Bookmark className="w-4 h-4"/>,      label:'Bookmarks' },
  { id:'profile',     icon:<UserIcon className="w-4 h-4"/>,       label:'Profile' },
  { id:'settings',    icon:<Settings className="w-4 h-4"/>,       label:'Settings' },
  { id:'help',        icon:<HelpCircle className="w-4 h-4"/>,     label:'Help' },
  { id:'about',       icon:<Info className="w-4 h-4"/>,           label:'About' },
];

export default function ForumDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('discussions');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userId = user?._id || user?.id;

  // Join personal socket room for DMs (and rejoin on reconnect)
  useEffect(() => {
    if (!userId) return;
    socket.emit('joinUserRoom', userId);
    const rejoin = () => socket.emit('joinUserRoom', userId);
    socket.on('connect', rejoin);
    return () => socket.off('connect', rejoin);
  }, [userId]);

  useEffect(() => { loadDiscussions(); }, [selectedCategory]);

  const loadDiscussions = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const { data } = await discussionsAPI.getAll(params);
      setDiscussions(data.discussions || []);
    } catch (err) {
      console.error('Failed to load discussions', err);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const getInitials = (firstName, lastName) => `${firstName?.[0]||''}${lastName?.[0]||''}`.toUpperCase() || 'U';
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name || 'User';
  const displayInitials = user?.firstName ? getInitials(user.firstName, user.lastName) : (user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'U');
  const isDoctor = user?.role === 'doctor';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Health Hive</span>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">Community Platform</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Main Navigation */}
        <div className="space-y-0.5 mb-5">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
                currentPage===item.id
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Categories</p>
          <div className="space-y-0.5">
            {[{value:'all',label:'All Topics'},...categories.map(c=>({value:c,label:c}))].map(cat=>(
              <button key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setCurrentPage('discussions'); setMobileOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedCategory===cat.value && currentPage==='discussions'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                <Hash className="w-3 h-3 shrink-0 opacity-60" />
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="p-3 border-t border-slate-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group">
              <Avatar className="w-9 h-9 shrink-0 ring-2 ring-white shadow-md">
                <AvatarFallback className={`text-white text-xs font-bold ${isDoctor?'bg-linear-to-br from-emerald-500 to-green-600':'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                  {displayInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {isDoctor ? '🩺 Doctor' : '👤 Member'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-200">
            <DropdownMenuItem onClick={()=>setCurrentPage('profile')} className="rounded-lg">
              <UserIcon className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>setCurrentPage('settings')} className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg focus:text-red-700 focus:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'discussions':
        return <DiscussionList discussions={discussions} setDiscussions={setDiscussions} categories={categories} onViewDiscussion={d=>{setSelectedDiscussion(d);setCurrentPage('discussion-detail');}} onReload={loadDiscussions} />;
      case 'discussion-detail':
        return <DiscussionDetail discussion={selectedDiscussion} onBack={()=>{setCurrentPage('discussions');setSelectedDiscussion(null);}} />;
      case 'messages':
        return <DirectMessaging />;
      case 'bookmarks':
        return <BookmarksPage onViewDiscussion={d=>{setSelectedDiscussion(d);setCurrentPage('discussion-detail');}} />;
      case 'profile':   return <UserProfile />;
      case 'settings':  return <SettingsPage />;
      case 'help':      return <HelpPage />;
      case 'about':     return <AboutPage />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-100 bg-white flex-col shrink-0 shadow-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-slate-100">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shadow-sm sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={()=>setMobileOpen(true)} className="rounded-xl">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Health Hive</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className={`p-4 md:p-8 mx-auto w-full ${currentPage==='messages'?'max-w-6xl':'max-w-4xl'}`}>
            {renderPage()}
          </main>
          {currentPage !== 'messages' && <Footer onNavigate={(page) => setCurrentPage(page)} />}
        </div>
      </div>
    </div>
  );
}