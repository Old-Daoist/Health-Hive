import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { DiscussionList } from './DiscussionList';
import { DiscussionDetail } from './DiscussionDetail';
import { UserProfile } from './UserProfile';
import { SettingsPage } from './SettingsPage';
import { BookmarksPage } from './BookmarksPage';
import { HelpPage } from './HelpPage';
import { AboutPage } from './AboutPage';
import { Footer } from './Footer';
import {
  LogOut, MessageSquare, User as UserIcon, Stethoscope, Settings,
  Bookmark, HelpCircle, Info, Bell, Menu, Hash,
} from 'lucide-react';

const categories = [
  'General Health','Mental Health','Cardiology','Neurology',
  'Pediatrics','Dermatology','Nutrition','Fitness',"Women's Health","Men's Health",
];

const navItems = [
  { id: 'discussions', icon: <MessageSquare className="w-4 h-4" />, label: 'Discussions' },
  { id: 'bookmarks',   icon: <Bookmark className="w-4 h-4" />,      label: 'Bookmarks' },
  { id: 'profile',     icon: <UserIcon className="w-4 h-4" />,       label: 'Profile' },
  { id: 'settings',    icon: <Settings className="w-4 h-4" />,       label: 'Settings' },
  { id: 'help',        icon: <HelpCircle className="w-4 h-4" />,     label: 'Help' },
  { id: 'about',       icon: <Info className="w-4 h-4" />,           label: 'About' },
];

export default function ForumDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('discussions');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory]);

  const loadDiscussions = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const { data } = await discussionsAPI.getAll(params);
      setDiscussions(data.discussions || []);
    } catch (err) {
      console.error('Failed to load discussions', err);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Health Hive</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1 mb-6">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPage === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-2">Categories</p>
          <div className="space-y-1">
            {[{ value: 'all', label: 'All Topics' }, ...categories.map(c => ({ value: c, label: c }))].map(cat => (
              <button key={cat.value} onClick={() => { setSelectedCategory(cat.value); setCurrentPage('discussions'); setMobileOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === cat.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Hash className="w-3 h-3" />{cat.label}
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">
              <Avatar className="w-8 h-8">
                <AvatarFallback className={`${user?.role === 'doctor' ? 'bg-green-600' : 'bg-blue-600'} text-white text-xs`}>
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role === 'regular' ? 'user' : user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setCurrentPage('profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentPage('settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
        return <DiscussionList discussions={discussions} setDiscussions={setDiscussions} categories={categories} onViewDiscussion={d => { setSelectedDiscussion(d); setCurrentPage('discussion-detail'); }} onReload={loadDiscussions} />;
      case 'discussion-detail':
        return <DiscussionDetail discussion={selectedDiscussion} onBack={() => { setCurrentPage('discussions'); setSelectedDiscussion(null); }} />;
      case 'bookmarks':
        return <BookmarksPage onViewDiscussion={d => { setSelectedDiscussion(d); setCurrentPage('discussion-detail'); }} />;
      case 'profile':   return <UserProfile />;
      case 'settings':  return <SettingsPage />;
      case 'help':      return <HelpPage />;
      case 'about':     return <AboutPage />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-white flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></Button>
          <span className="font-bold text-blue-600">Health Hive</span>
          <Bell className="w-5 h-5 text-slate-400" />
        </div>
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-8 max-w-5xl mx-auto">{renderPage()}</main>
          <Footer />
        </ScrollArea>
      </div>
    </div>
  );
}
