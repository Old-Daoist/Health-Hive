import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI, repliesAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ArrowLeft, ThumbsUp, Bookmark, Stethoscope, User as UserIcon, Eye, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DiscussionDetail({ discussion: initial, onBack }) {
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(initial);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial?._id) {
      discussionsAPI.getById(initial._id)
        .then(({ data }) => {
          setDiscussion(data.discussion);
          setReplies(data.replies || []);
        })
        .catch(() => {});
    }
  }, [initial?._id]);

  if (!discussion) return null;

  const getAuthorName = (obj) => {
    if (obj?.author?.firstName) return `${obj.author.firstName} ${obj.author.lastName}`;
    return obj?.author?.name || obj?.authorName || 'Unknown';
  };
  const getAuthorRole = (obj) => obj?.author?.role || obj?.authorRole || 'regular';
  const isDoctor = (obj) => getAuthorRole(obj) === 'doctor';
  const isVerified = (obj) => obj?.author?.isDoctorVerified || obj?.authorVerified || false;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  const handleLike = async () => {
    try {
      const { data } = await discussionsAPI.like(discussion._id);
      setDiscussion(prev => ({ ...prev, likes: data.likes, isLiked: data.isLiked }));
    } catch { toast.error('Failed to like'); }
  };

  const handleBookmark = async () => {
    try {
      const { data } = await discussionsAPI.bookmark(discussion._id);
      setDiscussion(prev => ({ ...prev, isBookmarked: data.isBookmarked }));
      toast.success(data.isBookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch { toast.error('Failed to bookmark'); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await repliesAPI.create(discussion._id, replyContent);
      setReplies(prev => [...prev, data.reply]);
      setReplyContent('');
      toast.success('Reply posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Discussions
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{discussion.category}</Badge>
              {isDoctor(discussion) && (
                <Badge className="bg-green-100 text-green-700 border-green-200"><Stethoscope className="w-3 h-3 mr-1" /> Doctor</Badge>
              )}
            </div>
            <CardTitle className="text-xl">{discussion.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className={`${isDoctor(discussion) ? 'bg-green-600' : 'bg-blue-600'} text-white text-sm`}>
                {getInitials(getAuthorName(discussion))}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-800">{getAuthorName(discussion)}</p>
              <p className="text-xs text-slate-400">{formatDate(discussion.createdAt)}</p>
            </div>
          </div>

          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>

          {discussion.symptoms?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Reported Symptoms:</p>
              <div className="flex flex-wrap gap-2">{discussion.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
            </div>
          )}

          {discussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">{discussion.tags.map(t => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}</div>
          )}

          <Separator />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${discussion.isLiked ? 'text-blue-600' : ''}`}>
              <ThumbsUp className="w-4 h-4" /> {discussion.likes || 0} Likes
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBookmark} className={`gap-2 ${discussion.isBookmarked ? 'text-yellow-600' : ''}`}>
              <Bookmark className="w-4 h-4" /> {discussion.isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <span className="flex items-center gap-1 text-sm text-slate-400 ml-auto">
              <Eye className="w-4 h-4" /> {discussion.views || 0} views
            </span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Replies ({replies.length})</h3>
        <div className="space-y-4">
          {replies.map((reply, idx) => (
            <Card key={reply._id || idx} className={reply.isExpertAnswer ? 'border-green-200 bg-green-50/50' : ''}>
              <CardContent className="p-4 space-y-3">
                {reply.isExpertAnswer && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle className="w-3 h-3" /> Expert Answer</Badge>
                )}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={`${isDoctor(reply) ? 'bg-green-600' : 'bg-slate-400'} text-white text-xs`}>
                      {getInitials(reply.author ? `${reply.author.firstName} ${reply.author.lastName}` : 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-slate-800">
                        {reply.author ? `${reply.author.firstName} ${reply.author.lastName}` : 'Unknown'}
                      </p>
                      {isDoctor(reply) && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                          <Stethoscope className="w-3 h-3 mr-0.5" /> {isVerified(reply) ? 'Verified Doctor' : 'Doctor'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(reply.createdAt)}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium text-slate-700">Add a Reply</h4>
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`${user?.role === 'doctor' ? 'bg-green-600' : 'bg-blue-600'} text-white text-xs`}>
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea placeholder="Share your thoughts..." rows={3} value={replyContent} onChange={e => setReplyContent(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={handleReply} disabled={submitting || !replyContent.trim()} className="gap-2">
                  <Send className="w-4 h-4" />{submitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
