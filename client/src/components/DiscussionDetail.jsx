import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI, repliesAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ArrowLeft, ThumbsUp, Bookmark, Stethoscope, User as UserIcon, Eye, Send, CheckCircle, Hash, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function DiscussionDetail({ discussion: initial, onBack }) {
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(initial);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initial?._id) return;
    setLoading(true);
    discussionsAPI.getById(initial._id)
      .then(({ data }) => {
        setDiscussion(data.discussion);
        setReplies(data.replies || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Join real-time room
    socket.emit('joinDiscussion', initial._id);
    return () => socket.emit('leaveDiscussion', initial._id);
  }, [initial?._id]);

  // Real-time new replies
  useEffect(() => {
    const handleNewReply = (reply) => {
      // Only add if belongs to this discussion
      if (reply.discussion === initial?._id || reply.discussion?._id === initial?._id) {
        setReplies(prev => {
          // Avoid duplicates
          if (prev.some(r => r._id === reply._id)) return prev;
          return [...prev, reply];
        });
      }
    };
    socket.on('newReply', handleNewReply);
    return () => socket.off('newReply', handleNewReply);
  }, [initial?._id]);

  if (!discussion) return null;

  const getAuthorName = (obj) => {
    if (obj?.author?.firstName) return `${obj.author.firstName} ${obj.author.lastName}`;
    return obj?.author?.name || 'Unknown';
  };
  const getAuthorRole = (obj) => obj?.author?.role || obj?.authorRole || 'regular';
  const isDoctor = (obj) => getAuthorRole(obj) === 'doctor';
  const isVerified = (obj) => obj?.author?.isDoctorVerified || false;
  const getInitials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase() || '?';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '';

  const handleLike = async () => {
    try {
      const { data } = await discussionsAPI.like(discussion._id);
      setDiscussion(prev => ({...prev, likes:data.likes, isLiked:data.isLiked}));
    } catch { toast.error('Failed to like'); }
  };

  const handleBookmark = async () => {
    try {
      const { data } = await discussionsAPI.bookmark(discussion._id);
      setDiscussion(prev => ({...prev, isBookmarked:data.isBookmarked}));
      toast.success(data.isBookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch { toast.error('Failed to bookmark'); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await repliesAPI.create(discussion._id, replyContent);
      // Don't add optimistically — server emits newReply via socket back to sender
      setReplyContent('');
      toast.success('Reply posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally { setSubmitting(false); }
  };

  const authorName = getAuthorName(discussion);
  const doctorPost = isDoctor(discussion);

  return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2 text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Discussions
      </Button>

      {/* ── Discussion Card ── */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {/* Gradient top strip */}
        <div className="h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <CardContent className="p-6 space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
              <Hash className="w-2.5 h-2.5 mr-0.5" />{discussion.category}
            </Badge>
            {doctorPost && (
              <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                <Stethoscope className="w-3 h-3 mr-1" /> Doctor
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{discussion.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
              <AvatarFallback className={`text-white text-sm font-semibold ${doctorPost ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{authorName}</p>
                {isVerified(discussion) && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{formatDate(discussion.createdAt)}</p>
            </div>
          </div>

          {/* Content */}
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">{discussion.content}</p>

          {/* Symptoms */}
          {discussion.symptoms?.length > 0 && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm font-semibold text-blue-700 mb-2">Reported Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {discussion.symptoms.map(s => (
                  <Badge key={s} className="text-xs bg-white text-blue-700 border-blue-200 shadow-sm">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {discussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {discussion.tags.map(t => (
                <Badge key={t} variant="outline" className="text-xs text-slate-500 border-slate-200">#{t}</Badge>
              ))}
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLike}
              className={`gap-2 rounded-xl hover:bg-blue-50 ${discussion.isLiked ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
              <ThumbsUp className={`w-4 h-4 ${discussion.isLiked?'fill-blue-600':''}`} />
              {discussion.likes || 0} Likes
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBookmark}
              className={`gap-2 rounded-xl hover:bg-amber-50 ${discussion.isBookmarked ? 'text-amber-600 bg-amber-50' : 'text-slate-500'}`}>
              <Bookmark className={`w-4 h-4 ${discussion.isBookmarked?'fill-amber-500':''}`} />
              {discussion.isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <span className="flex items-center gap-1.5 text-sm text-slate-400 ml-auto">
              <Eye className="w-4 h-4" /> {discussion.views || 0} views
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Replies ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : replies.length === 0 ? (
          <Card className="border-dashed border-slate-200">
            <CardContent className="py-10 text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm">No replies yet. Be the first to respond!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {replies.map((reply, idx) => {
              const replyAuthorName = reply.author ? `${reply.author.firstName} ${reply.author.lastName}` : 'Unknown';
              const replyIsDoctor = isDoctor(reply);
              return (
                <Card key={reply._id || idx}
                  className={`overflow-hidden transition-all ${reply.isExpertAnswer ? 'border-emerald-200 shadow-emerald-100/50 shadow-md' : 'border-slate-100'}`}>
                  {reply.isExpertAnswer && <div className="h-0.5 bg-linear-to-r from-emerald-400 to-green-500" />}
                  <CardContent className="p-4 space-y-3">
                    {reply.isExpertAnswer && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                        <CheckCircle className="w-3 h-3" /> Expert Answer
                      </Badge>
                    )}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                        <AvatarFallback className={`text-white text-xs font-semibold ${replyIsDoctor ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-slate-400 to-slate-500'}`}>
                          {getInitials(replyAuthorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-sm text-slate-800">{replyAuthorName}</p>
                          {replyIsDoctor && (
                            <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 py-0">
                              <Stethoscope className="w-3 h-3 mr-0.5" />
                              {isVerified(reply) ? 'Verified Doctor' : 'Doctor'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{formatDate(reply.createdAt)}</p>
                        <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reply Box ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h4 className="font-semibold text-slate-800">Add a Reply</h4>
          <div className="flex items-start gap-3">
            <Avatar className="w-9 h-9 shrink-0 mt-0.5">
              <AvatarFallback className={`text-white text-xs font-semibold ${user?.role==='doctor'?'bg-linear-to-br from-emerald-500 to-green-600':'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                {getInitials(user?.name || `${user?.firstName||''} ${user?.lastName||''}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your thoughts or advice…"
                rows={3}
                value={replyContent}
                onChange={e=>setReplyContent(e.target.value)}
                className="rounded-xl border-slate-200 resize-none focus:border-blue-300 focus:ring-blue-100"
                onKeyDown={e => { if (e.key==='Enter' && e.ctrlKey) handleReply(); }}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Ctrl+Enter to post</p>
                <Button
                  onClick={handleReply}
                  disabled={submitting || !replyContent.trim()}
                  className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting…' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}