import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  MessageSquare, Plus, Stethoscope, ThumbsUp, User as UserIcon,
  Eye, Search, Hash, Flame, ArrowUpDown, X
} from 'lucide-react';
import { toast } from 'sonner';
import DiscussionSkeleton from './DiscussionSkeleton';

const commonSymptoms = [
  'Headache','Fever','Cough','Fatigue','Nausea','Dizziness','Anxiety','Insomnia',
  'Rash','Back Pain','Joint Pain','Sore Throat','Chest Pain','Shortness of Breath',
  'Stomach Pain','Diarrhea','Vomiting','Chills'
];

export function DiscussionList({ discussions, setDiscussions, categories, onViewDiscussion, onReload, pagination, onLoadMore, loadingMore }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [submitting, setSubmitting]     = useState(false);
  const [searching, setSearching]       = useState(false);
  const [initialLoading, setInitialLoading] = useState(discussions.length === 0);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '', content: '', category: 'General Health', tags: '', symptoms: []
  });

  // Mark initial load done once discussions arrive
  useEffect(() => {
    if (discussions.length > 0) setInitialLoading(false);
    // Also clear after 3s to avoid stuck skeleton
    const t = setTimeout(() => setInitialLoading(false), 3000);
    return () => clearTimeout(t);
  }, [discussions]);

  // Debounced server search
  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) { onReload(); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await discussionsAPI.getAll({ search: term, limit: 20 });
        setDiscussions(data.discussions || []);
      } catch {} finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    socket.on('newDiscussion', d => setDiscussions(prev => [d, ...prev]));
    socket.on('replyCountUpdate', ({ discussionId }) =>
      setDiscussions(prev => prev.map(d => d._id === discussionId ? { ...d, replyCount: (d.replyCount || 0) + 1 } : d))
    );
    return () => { socket.off('newDiscussion'); socket.off('replyCountUpdate'); };
  }, [setDiscussions]);

  const handleCreate = async () => {
    if (!newDiscussion.title || !newDiscussion.content) return toast.error('Title and content are required');
    if (newDiscussion.symptoms.length === 0) return toast.error('Select at least one symptom');
    setSubmitting(true);
    try {
      const { data } = await discussionsAPI.create({
        title: newDiscussion.title,
        content: newDiscussion.content,
        category: newDiscussion.category,
        tags: newDiscussion.tags.split(',').map(t => t.trim()).filter(Boolean),
        symptoms: newDiscussion.symptoms,
      });
      setDiscussions(prev => [data.discussion, ...prev]);
      setNewDiscussion({ title: '', content: '', category: 'General Health', tags: '', symptoms: [] });
      setIsDialogOpen(false);
      toast.success('Discussion posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create discussion');
    } finally { setSubmitting(false); }
  };

  const toggleSymptom = s => setNewDiscussion(prev => ({
    ...prev,
    symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]
  }));

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to like');
    const discussion = discussions.find(d => d._id === id);
    if (discussion?.author?._id?.toString() === user?.id?.toString()) return;
    try {
      const { data } = await discussionsAPI.like(id);
      setDiscussions(prev => prev.map(d => d._id === id
        ? { ...d, likes: data.likes, dislikes: data.dislikes ?? d.dislikes, isLiked: data.isLiked, isDisliked: false }
        : d));
    } catch { toast.error('Failed to like'); }
  };

  const getAuthorName = d => d.author?.firstName ? `${d.author.firstName} ${d.author.lastName}` : 'Unknown';
  const getAuthorRole = d => d.author?.role || d.authorRole || 'regular';
  const getInitials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Client-side sort only (search is server-side)
  let filtered = [...discussions].sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-0.5">Recent Discussions</h2>
            <p className="text-slate-500 text-sm">Join the conversation with doctors and the community</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] transition-all duration-200 shrink-0 h-11 px-6 gap-2">
                <Plus className="w-4 h-4" /> New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Start a New Discussion</DialogTitle>
                <DialogDescription>Ask a health question or share your experience</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="space-y-5 py-3">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input placeholder="Briefly summarize your question..." className="text-base"
                      value={newDiscussion.title} onChange={e => setNewDiscussion({ ...newDiscussion, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={newDiscussion.category} onValueChange={v => setNewDiscussion({ ...newDiscussion, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input placeholder="e.g. headache, exercise, advice"
                        value={newDiscussion.tags} onChange={e => setNewDiscussion({ ...newDiscussion, tags: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Related Symptoms *</Label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex flex-wrap gap-2 mb-3 min-h-8">
                        {newDiscussion.symptoms.map(s => (
                          <Badge key={s} variant="secondary" className="bg-white border border-slate-200 text-slate-700 pl-2.5 pr-1.5 py-1 flex items-center gap-1 text-sm">
                            {s}
                            <button onClick={() => toggleSymptom(s)} className="hover:bg-slate-100 rounded-full p-0.5 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                        {newDiscussion.symptoms.length === 0 && (
                          <span className="text-sm text-slate-400 italic">No symptoms selected yet</span>
                        )}
                      </div>
                      <div className="h-px bg-slate-200 mb-3" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {commonSymptoms.map(s => (
                          <div key={s} className="flex items-center gap-2">
                            <Checkbox id={`s-${s}`} checked={newDiscussion.symptoms.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
                            <label htmlFor={`s-${s}`} className="text-sm text-slate-600 cursor-pointer">{s}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Details *</Label>
                    <Textarea placeholder="Describe your situation in detail..." rows={5}
                      value={newDiscussion.content} onChange={e => setNewDiscussion({ ...newDiscussion, content: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={submitting} className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  {submitting ? 'Posting...' : 'Post Discussion'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Search by keywords, symptoms, or tags..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-400 rounded-xl transition-all" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 gap-2 border-slate-200 text-slate-600 h-11 px-4 hover:bg-slate-50 rounded-xl">
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === 'newest' ? 'Newest' : sortBy === 'likes' ? 'Most Liked' : 'Most Viewed'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('likes')}>Most Liked</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('views')}>Most Viewed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 px-1 flex items-center gap-2">
        {searching
          ? <><span className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin inline-block" /> Searching…</>
          : <>{filtered.length} {filtered.length === 1 ? 'discussion' : 'discussions'}{searchQuery && ` for "${searchQuery}"`}</>
        }
      </p>

      {/* Discussion cards */}
      <div className="space-y-4">
        {initialLoading ? (
          <DiscussionSkeleton count={5} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No discussions found</h3>
            <p className="text-slate-400 text-sm">{searchQuery ? 'Try adjusting your search' : 'Be the first to start a conversation!'}</p>
          </div>
        ) : filtered.map(d => {
          const authorName = getAuthorName(d);
          const authorRole = getAuthorRole(d);
          const isDoc = authorRole === 'doctor';

          return (
            <div key={d._id}
              className="group bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-xl hover:border-blue-200/70 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => onViewDiscussion(d)}>

              {/* Hover linear overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/20 transition-all duration-300 pointer-events-none rounded-2xl" />

              {/* Doctor left accent bar */}
              {isDoc && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-500 to-green-600 rounded-l-2xl" />
              )}

              <div className="flex items-start gap-4 relative">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-offset-2 ring-offset-white shrink-0 group-hover:scale-105 transition-transform duration-200 ${isDoc ? 'bg-linear-to-br from-emerald-500 to-green-600 ring-emerald-200' : 'bg-linear-to-br from-blue-500 to-indigo-600 ring-blue-200'}`}>
                  {getInitials(authorName)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + doctor badge */}
                  <div className="flex flex-wrap items-start gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
                      {d.title}
                    </h3>
                    {isDoc && (
                      <Badge className="bg-linear-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 text-xs h-5 shrink-0">
                        <Stethoscope className="w-3 h-3 mr-1" /> Verified Doctor
                      </Badge>
                    )}
                    {(d.views || 0) > 50 && (
                      <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-xs h-5 shrink-0">
                        <Flame className="w-3 h-3 mr-0.5" /> Trending
                      </Badge>
                    )}
                  </div>

                  {/* Meta: author · date · category */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mb-3">
                    <span className="font-semibold text-slate-700">{authorName}</span>
                    {d.createdAt && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50/50 font-medium px-2.5">
                      {d.category}
                    </Badge>
                  </div>

                  {/* Symptoms + tags */}
                  {((d.symptoms?.length > 0) || (d.tags?.length > 0)) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {d.symptoms?.slice(0, 3).map(s => (
                        <Badge key={s} variant="outline" className="bg-linear-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200 text-xs font-medium px-2.5 py-0.5">
                          {s}
                        </Badge>
                      ))}
                      {d.symptoms?.length > 3 && (
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 px-2.5">+{d.symptoms.length - 3}</Badge>
                      )}
                      {d.tags?.slice(0, 3).map(t => (
                        <span key={t} className="text-xs text-slate-400 flex items-center px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                          <Hash className="w-3 h-3 mr-0.5" />{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-700">{d.replyCount || 0}</span>
                      <span className="hidden sm:inline text-slate-500">replies</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-slate-700">{d.views || 0}</span>
                      <span className="hidden sm:inline text-slate-500">views</span>
                    </div>
                    <button
                      onClick={e => handleLike(e, d._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${d.isLiked ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      <ThumbsUp className={`w-4 h-4 ${d.isLiked ? 'fill-blue-500 text-blue-600' : 'text-emerald-500'}`} />
                      <span className="font-semibold">{d.likes || 0}</span>
                      <span className="hidden sm:inline text-slate-500">likes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {pagination?.hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {loadingMore
              ? <><span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mr-1" />Loading…</>
              : `Load more · ${(pagination.total || 0) - discussions.length} remaining`}
          </button>
        </div>
      )}
    </div>
  );
}