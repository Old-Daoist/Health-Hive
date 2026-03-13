import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
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
import {
  LogOut, MessageSquare, User as UserIcon, Settings,
  Bookmark, HelpCircle, Info, Menu, Hash, Activity,
  MessageCircle, Search, TrendingUp, Sparkles, X, Mail, Stethoscope
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const categories = [
  'General Health', 'Mental Health', 'Cardiology', 'Neurology',
  'Pediatrics', 'Dermatology', 'Nutrition', 'Fitness', "Women's Health", "Men's Health",
];

export default function ForumDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('discussions');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discussions, setDiscussions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const userId = user?._id || user?.id;

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

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name || 'User';
  const displayInitials = user?.firstName
    ? getInitials(user.firstName, user.lastName)
    : (user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U');
  const isDoctor = user?.role === 'doctor';

  const searchResults = globalSearchQuery.trim()
    ? discussions.filter(d =>
        d.title?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        d.content?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        d.tags?.some(t => t.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        d.symptoms?.some(s => s.toLowerCase().includes(globalSearchQuery.toLowerCase()))
      )
    : [];

  const isForumPage = currentPage === 'discussions' || currentPage === 'discussion-detail';

  const renderPage = () => {
    switch (currentPage) {
      case 'discussions':
        return (
          <DiscussionList
            discussions={discussions}
            setDiscussions={setDiscussions}
            categories={categories}
            onViewDiscussion={d => { setSelectedDiscussion(d); setCurrentPage('discussion-detail'); }}
            onReload={loadDiscussions}
          />
        );
      case 'discussion-detail':
        return (
          <DiscussionDetail
            discussion={selectedDiscussion}
            onBack={() => { setCurrentPage('discussions'); setSelectedDiscussion(null); }}
          />
        );
      case 'messages':  return <DirectMessaging />;
      case 'bookmarks': return <BookmarksPage onViewDiscussion={d => { setSelectedDiscussion(d); setCurrentPage('discussion-detail'); }} />;
      case 'profile':   return <UserProfile />;
      case 'settings':  return <SettingsPage />;
      case 'help':      return <HelpPage />;
      case 'about':     return <AboutPage />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 font-sans">

      {/* ── Top Navbar ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 h-16 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between gap-4">

          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentPage('discussions')} className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-all duration-200">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden sm:block">
                Health Hive
              </span>
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'discussions', label: 'Forum' },
                { id: 'messages',    label: 'Messages' },
                { id: 'bookmarks',   label: 'Bookmarks' },
              ].map(item => (
                <button key={item.id} onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentPage('messages')}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Mail className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <NotificationDropdown
                onNavigateToDiscussion={async (discussionId) => {
                  try {
                    const { data } = await (await import('../services/api')).discussionsAPI.getById(discussionId);
                    setSelectedDiscussion(data.discussion);
                    setCurrentPage('discussion-detail');
                  } catch {}
                }}
              />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-0.5" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200">
                  <Avatar className="w-8 h-8 ring-2 ring-offset-1 ring-offset-white ring-blue-100">
                    <AvatarFallback className={`text-white text-xs font-bold ${isDoctor ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                      {displayInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{displayName}</p>
                    {isDoctor && <p className="text-[10px] text-emerald-600 font-bold mt-0.5 tracking-wide">VERIFIED DOCTOR</p>}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-200">
                <DropdownMenuItem onClick={() => setCurrentPage('profile')} className="rounded-lg"><UserIcon className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('settings')} className="rounded-lg"><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('bookmarks')} className="rounded-lg"><Bookmark className="w-4 h-4 mr-2" /> Bookmarks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('help')} className="rounded-lg"><HelpCircle className="w-4 h-4 mr-2" /> Help</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('about')} className="rounded-lg"><Info className="w-4 h-4 mr-2" /> About</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg focus:text-red-700 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all ml-0.5">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Activity className="w-5 h-5 text-blue-600" /> Health Hive
                  </div>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
                  <div className="space-y-0.5 mb-5">
                    {[
                      { id: 'discussions', label: 'Forum', icon: MessageSquare },
                      { id: 'messages',    label: 'Messages', icon: MessageCircle },
                      { id: 'bookmarks',   label: 'Bookmarks', icon: Bookmark },
                      { id: 'profile',     label: 'Profile', icon: UserIcon },
                      { id: 'settings',    label: 'Settings', icon: Settings },
                      { id: 'help',        label: 'Help', icon: HelpCircle },
                      { id: 'about',       label: 'About', icon: Info },
                    ].map(item => (
                      <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          currentPage === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                        }`}>
                        <item.icon className="w-4 h-4" /> {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Categories</p>
                    {[{ value: 'all', label: 'All Topics' }, ...categories.map(c => ({ value: c, label: c }))].map(cat => (
                      <button key={cat.value}
                        onClick={() => { setSelectedCategory(cat.value); setCurrentPage('discussions'); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                          selectedCategory === cat.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-100'
                        }`}>
                        <Hash className="w-3 h-3 opacity-60" /> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 max-w-screen-2xl w-full mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className={isForumPage ? 'md:grid md:grid-cols-[210px_1fr] gap-8' : ''}>

          {/* Category sidebar — forum pages only */}
          {isForumPage && (
            <aside className="hidden md:flex flex-col gap-6 self-start sticky top-20">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Topics</p>
                {[{ value: 'all', label: 'All Topics' }, ...categories.map(c => ({ value: c, label: c }))].map(cat => (
                  <button key={cat.value}
                    onClick={() => { setSelectedCategory(cat.value); setCurrentPage('discussions'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedCategory === cat.value && currentPage === 'discussions'
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${selectedCategory === cat.value ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="space-y-0.5 pt-4 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Help & Info</p>
                <button onClick={() => setCurrentPage('about')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all">
                  <Info className="w-4 h-4" /> About Health Hive
                </button>
                <button onClick={() => setCurrentPage('help')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all">
                  <HelpCircle className="w-4 h-4" /> Help Center
                </button>
              </div>
            </aside>
          )}

          <main className="min-w-0">
            {renderPage()}
          </main>
        </div>
      </div>

      {currentPage !== 'messages' && <Footer onNavigate={page => setCurrentPage(page)} />}

      {/* ── Global Search Dialog ── */}
      <Dialog open={isSearchOpen} onOpenChange={v => { setIsSearchOpen(v); if (!v) setGlobalSearchQuery(''); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Search Health Hive
            </DialogTitle>
            <DialogDescription>Search discussions, symptoms, tags, and more</DialogDescription>
          </DialogHeader>
          <div className="p-5 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input autoFocus placeholder="Search discussions, symptoms, tags..."
                value={globalSearchQuery} onChange={e => setGlobalSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-400 rounded-xl" />
              {globalSearchQuery && (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[50vh] p-5">
            {!globalSearchQuery.trim() ? (
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <TrendingUp className="w-3.5 h-3.5" /> Trending Topics
                </div>
                <div className="grid gap-2">
                  {categories.slice(0, 5).map(cat => (
                    <button key={cat}
                      onClick={() => { setSelectedCategory(cat); setCurrentPage('discussions'); setIsSearchOpen(false); setGlobalSearchQuery(''); }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-left transition-all">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">No results found</h3>
                <p className="text-sm text-slate-400">Try different keywords or browse by category</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                </p>
                {searchResults.map(d => (
                  <button key={d._id}
                    onClick={() => { setSelectedDiscussion(d); setCurrentPage('discussion-detail'); setIsSearchOpen(false); setGlobalSearchQuery(''); }}
                    className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 hover:shadow-md transition-all group">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.author?.role === 'doctor' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                        {d.author?.role === 'doctor' ? <Stethoscope className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{d.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2">{d.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">{d.category}</Badge>
                          <span className="text-xs text-slate-400 ml-auto">{d.replyCount || 0} replies</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}