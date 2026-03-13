import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { MessageSquare, Plus, Stethoscope, ThumbsUp, User as UserIcon, Eye, Search, TrendingUp, Clock, Heart, Filter, Hash, Flame, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const commonSymptoms = ['Headache','Fever','Cough','Fatigue','Nausea','Dizziness','Anxiety','Insomnia','Rash','Back Pain','Joint Pain','Sore Throat','Chest Pain','Shortness of Breath','Stomach Pain','Diarrhea','Vomiting','Chills'];
const SORT_OPTIONS = [{ value:'newest',label:'Newest First',icon:Clock},{value:'popular',label:'Most Viewed',icon:TrendingUp},{value:'liked',label:'Most Liked',icon:Heart}];
const FILTER_TAGS = [{value:'all',label:'All',icon:Sparkles},{value:'doctor',label:'By Doctor',icon:Stethoscope},{value:'trending',label:'Trending',icon:Flame}];

export function DiscussionList({ discussions, setDiscussions, categories, onViewDiscussion }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterTag, setFilterTag] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title:'',content:'',category:'General Health',tags:'',symptoms:[] });

  useEffect(() => {
    socket.on('newDiscussion', (discussion) => setDiscussions(prev => [discussion,...prev]));
    socket.on('replyCountUpdate', ({ discussionId }) => setDiscussions(prev => prev.map(d => d._id===discussionId ? {...d,replyCount:(d.replyCount||0)+1} : d)));
    return () => { socket.off('newDiscussion'); socket.off('replyCountUpdate'); };
  }, [setDiscussions]);

  const handleCreate = async () => {
    if (!newDiscussion.title || !newDiscussion.content) return toast.error('Title and content are required');
    if (newDiscussion.symptoms.length === 0) return toast.error('Select at least one symptom');
    setSubmitting(true);
    try {
      const { data } = await discussionsAPI.create({ title:newDiscussion.title, content:newDiscussion.content, category:newDiscussion.category, tags:newDiscussion.tags.split(',').map(t=>t.trim()).filter(Boolean), symptoms:newDiscussion.symptoms });
      setDiscussions(prev => [data.discussion,...prev]);
      setNewDiscussion({ title:'',content:'',category:'General Health',tags:'',symptoms:[] });
      setIsDialogOpen(false);
      toast.success('Discussion posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create discussion');
    } finally { setSubmitting(false); }
  };

  const toggleSymptom = (s) => setNewDiscussion(prev => ({ ...prev, symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x=>x!==s) : [...prev.symptoms,s] }));

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to like');
    try {
      const { data } = await discussionsAPI.like(id);
      setDiscussions(prev => prev.map(d => d._id===id ? {...d,likes:data.likes,isLiked:data.isLiked} : d));
    } catch { toast.error('Failed to like'); }
  };

  const getAuthorName = (d) => d.author?.firstName ? `${d.author.firstName} ${d.author.lastName}` : 'Unknown';
  const getAuthorRole = (d) => d.author?.role || d.authorRole || 'regular';

  let filtered = discussions.filter(d => {
    const q = searchQuery.toLowerCase();
    if (q && !d.title?.toLowerCase().includes(q) && !d.content?.toLowerCase().includes(q)) return false;
    if (filterTag==='doctor' && getAuthorRole(d)!=='doctor') return false;
    if (filterTag==='trending' && (d.views||0)<10 && (d.replyCount||0)<2) return false;
    return true;
  });
  filtered = [...filtered].sort((a,b) => {
    if (sortBy==='popular') return (b.views||0)-(a.views||0);
    if (sortBy==='liked') return (b.likes||0)-(a.likes||0);
    return new Date(b.createdAt)-new Date(a.createdAt);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Discussions</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Join the conversation with the community</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
              <Plus className="w-4 h-4" /> New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
              <DialogDescription>Share your health question or experience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="What's your health question?" value={newDiscussion.title} onChange={e=>setNewDiscussion({...newDiscussion,title:e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={newDiscussion.category} onValueChange={v=>setNewDiscussion({...newDiscussion,category:v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea placeholder="Describe your situation in detail..." rows={4} value={newDiscussion.content} onChange={e=>setNewDiscussion({...newDiscussion,content:e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Symptoms (select all that apply)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-slate-50">
                  {commonSymptoms.map(s=>(
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox checked={newDiscussion.symptoms.includes(s)} onCheckedChange={()=>toggleSymptom(s)} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input placeholder="e.g. headache, workout, hydration" value={newDiscussion.tags} onChange={e=>setNewDiscussion({...newDiscussion,tags:e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                {submitting?'Posting...':'Post Discussion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search discussions…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="pl-10 rounded-xl border-slate-200 bg-white shadow-sm" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {FILTER_TAGS.map(({value,label,icon:Icon})=>(
            <button key={value} onClick={()=>setFilterTag(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterTag===value?'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm':'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 text-xs rounded-xl border-slate-200 bg-white shadow-sm w-40">
              <div className="flex items-center gap-1.5"><Filter className="w-3 h-3 text-slate-400" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} {filtered.length===1?'discussion':'discussions'}{searchQuery&&` for "${searchQuery}"`}</p>

      <div className="space-y-3">
        {filtered.length===0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <h3 className="text-slate-500 font-medium">No discussions found</h3>
              <p className="text-slate-400 text-sm mt-1">{searchQuery?'Try a different search term':'Be the first to start a conversation!'}</p>
            </CardContent>
          </Card>
        ) : filtered.map(d=>(
          <Card key={d._id} className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 overflow-hidden group" onClick={()=>onViewDiscussion(d)}>
            <div className="h-0.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <Badge variant="outline" className="text-xs border-slate-200 text-slate-600"><Hash className="w-2.5 h-2.5 mr-0.5"/>{d.category}</Badge>
                {getAuthorRole(d)==='doctor'&&<Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"><Stethoscope className="w-3 h-3 mr-1"/>Doctor</Badge>}
                {(d.views||0)>50&&<Badge className="text-xs bg-orange-50 text-orange-600 border-orange-200"><Flame className="w-3 h-3 mr-0.5"/>Trending</Badge>}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5 line-clamp-1 group-hover:text-blue-700 transition-colors">{d.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{d.content}</p>
              {d.symptoms?.length>0&&(
                <div className="flex gap-1 flex-wrap mt-2.5">
                  {d.symptoms.slice(0,3).map(s=><Badge key={s} variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-0">{s}</Badge>)}
                  {d.symptoms.length>3&&<Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500 border-0">+{d.symptoms.length-3} more</Badge>}
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getAuthorRole(d)==='doctor'?'bg-emerald-100':'bg-slate-100'}`}>
                    {getAuthorRole(d)==='doctor'?<Stethoscope className="w-2.5 h-2.5 text-emerald-600"/>:<UserIcon className="w-2.5 h-2.5 text-slate-500"/>}
                  </div>
                  <span className="font-medium text-slate-500">{getAuthorName(d)}</span>
                  {d.createdAt&&<><span>·</span><span>{new Date(d.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <button onClick={e=>handleLike(e,d._id)} className={`flex items-center gap-1 transition-all hover:scale-110 active:scale-95 ${d.isLiked?'text-blue-600':'hover:text-blue-600'}`}>
                    <ThumbsUp className={`w-3.5 h-3.5 ${d.isLiked?'fill-blue-600':''}`}/><span className="font-medium">{d.likes||0}</span>
                  </button>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5"/><span className="font-medium">{d.replyCount||0}</span></span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5"/><span className="font-medium">{d.views||0}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}