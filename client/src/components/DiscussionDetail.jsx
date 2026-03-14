import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI, repliesAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Bookmark, Stethoscope,
  Eye, Send, CheckCircle, Hash, MessageSquare, Share2,
  Reply, X, CornerDownRight, Pencil, Trash2, MoreHorizontal, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import ReportModal from './ReportModal';

export function DiscussionDetail({ discussion: initial, onBack }) {
  const { user } = useAuth();
  const [discussion, setDiscussion]   = useState(initial);
  const [replies, setReplies]         = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo]   = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState({ title: '', content: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu]       = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { targetType, targetId }
  const textareaRef = useRef(null);

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

    socket.emit('joinDiscussion', initial._id);
    return () => socket.emit('leaveDiscussion', initial._id);
  }, [initial?._id]);

  useEffect(() => {
    const handleNewReply = (reply) => {
      if (reply.discussion === initial?._id || reply.discussion?._id === initial?._id) {
        setReplies(prev => prev.some(r => r._id === reply._id) ? prev : [...prev, reply]);
      }
    };
    socket.on('newReply', handleNewReply);
    return () => socket.off('newReply', handleNewReply);
  }, [initial?._id]);

  if (!discussion) return null;

  /* ── helpers ── */
  const getAuthorName  = (obj) => obj?.author?.firstName ? `${obj.author.firstName} ${obj.author.lastName}` : obj?.author?.name || 'Unknown';
  const isDoctor       = (obj) => (obj?.author?.role || obj?.authorRole) === 'doctor';
  const isVerified     = (obj) => obj?.author?.isDoctorVerified || false;
  const getInitials    = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const formatDate     = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  /* ── discussion actions ── */
  const handleLike = async () => {
    try {
      const { data } = await discussionsAPI.like(discussion._id);
      setDiscussion(prev => ({ ...prev, likes: data.likes, dislikes: data.dislikes ?? prev.dislikes, isLiked: data.isLiked, isDisliked: false }));
    } catch { toast.error('Failed to like'); }
  };

  const handleDislike = async () => {
    try {
      const { data } = await discussionsAPI.dislike(discussion._id);
      setDiscussion(prev => ({ ...prev, dislikes: data.dislikes, likes: data.likes, isDisliked: data.isDisliked, isLiked: false }));
    } catch { toast.error('Failed to dislike'); }
  };

  const handleBookmark = async () => {
    try {
      const { data } = await discussionsAPI.bookmark(discussion._id);
      setDiscussion(prev => ({ ...prev, isBookmarked: data.isBookmarked }));
      toast.success(data.isBookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch { toast.error('Failed to bookmark'); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/forum`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'));
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return toast.error('Title and content required');
    try {
      const { data } = await discussionsAPI.update(discussion._id, editForm);
      setDiscussion(prev => ({ ...prev, ...data.discussion }));
      setEditing(false);
      toast.success('Discussion updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async () => {
    try {
      await discussionsAPI.delete(discussion._id);
      toast.success('Discussion deleted');
      onBack();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleReplyDelete = async (replyId) => {
    try {
      await repliesAPI.delete(replyId);
      setReplies(prev => prev.filter(r => r._id !== replyId));
      toast.success('Reply deleted');
    } catch { toast.error('Failed to delete reply'); }
  };

  /* ── reply actions ── */
  const handleReplyLike = async (replyId) => {
    try {
      const { data } = await repliesAPI.like(replyId);
      setReplies(prev => prev.map(r => r._id === replyId
        ? { ...r, likes: data.likes, dislikes: data.dislikes, isLiked: data.isLiked, isDisliked: false }
        : r));
    } catch { toast.error('Failed to like reply'); }
  };

  const handleReplyDislike = async (replyId) => {
    try {
      const { data } = await repliesAPI.dislike(replyId);
      setReplies(prev => prev.map(r => r._id === replyId
        ? { ...r, dislikes: data.dislikes, likes: data.likes, isDisliked: data.isDisliked, isLiked: false }
        : r));
    } catch { toast.error('Failed to dislike reply'); }
  };

  const startReplyTo = (reply) => {
    const name = getAuthorName(reply);
    setReplyingTo({ _id: reply._id, authorName: name });
    setReplyContent('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const cancelReplyTo = () => setReplyingTo(null);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await repliesAPI.create(discussion._id, replyContent, replyingTo?._id || null);
      setReplyContent('');
      setReplyingTo(null);
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

          <div className="flex items-start justify-between gap-3">
            {editing ? (
              <input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                className="flex-1 text-2xl font-bold text-slate-900 border-b-2 border-blue-400 bg-transparent outline-none pb-1"
                maxLength={200}
              />
            ) : (
              <h1 className="text-2xl font-bold text-slate-900 leading-tight flex-1">{discussion.title}</h1>
            )}
            {/* Author menu — only shown to post author */}
            {discussion.author?._id?.toString() === user?.id?.toString() && !editing && (
              <div className="relative">
                <button onClick={() => setShowMenu(m => !m)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 z-20 min-w-35 overflow-hidden">
                    <button onClick={() => { setEditForm({ title: discussion.title, content: discussion.content }); setEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Pencil className="w-3.5 h-3.5" /> Edit post
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" /> Delete post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
              <AvatarFallback className={`text-white text-sm font-semibold ${doctorPost ? 'bg-linear-to-brrom-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
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

          {editing ? (
            <div className="space-y-3">
              <textarea
                value={editForm.content}
                onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                rows={6}
                maxLength={5000}
                className="w-full text-slate-700 text-[15px] leading-relaxed border border-blue-300 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{editForm.content.length}/5000</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                  <button onClick={handleEditSave}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">{discussion.content}</p>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-red-800">Delete this discussion?</p>
              <p className="text-xs text-red-600">This will also delete all replies. This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all">
                  Yes, delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

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

          {/* ── Post actions: like · dislike · bookmark · share · views ── */}
          <div className="flex items-center gap-1 flex-wrap discussion-detail-actions">
            {/* Like — hidden on own post */}
            {discussion.author?._id?.toString() !== user?.id?.toString() && (
              <Button variant="ghost" size="sm" onClick={handleLike}
                className={`gap-1.5 rounded-xl hover:bg-blue-50 ${discussion.isLiked ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
                <ThumbsUp className={`w-4 h-4 ${discussion.isLiked ? 'fill-blue-600' : ''}`} />
                <span>{discussion.likes || 0}</span>
              </Button>
            )}
            {discussion.author?._id?.toString() === user?.id?.toString() && (
              <span className="flex items-center gap-1.5 text-sm text-slate-400 px-2">
                <ThumbsUp className="w-4 h-4" /> {discussion.likes || 0}
              </span>
            )}

            {/* Dislike — hidden on own post */}
            {discussion.author?._id?.toString() !== user?.id?.toString() && (
              <Button variant="ghost" size="sm" onClick={handleDislike}
                className={`gap-1.5 rounded-xl hover:bg-red-50 ${discussion.isDisliked ? 'text-red-500 bg-red-50' : 'text-slate-500'}`}>
                <ThumbsDown className={`w-4 h-4 ${discussion.isDisliked ? 'fill-red-500' : ''}`} />
                <span>{discussion.dislikes || 0}</span>
              </Button>
            )}
            {discussion.author?._id?.toString() === user?.id?.toString() && (
              <span className="flex items-center gap-1.5 text-sm text-slate-400 px-2">
                <ThumbsDown className="w-4 h-4" /> {discussion.dislikes || 0}
              </span>
            )}

            {/* Bookmark */}
            <Button variant="ghost" size="sm" onClick={handleBookmark}
              className={`gap-1.5 rounded-xl hover:bg-amber-50 ${discussion.isBookmarked ? 'text-amber-600 bg-amber-50' : 'text-slate-500'}`}>
              <Bookmark className={`w-4 h-4 ${discussion.isBookmarked ? 'fill-amber-500' : ''}`} />
              {discussion.isBookmarked ? 'Saved' : 'Save'}
            </Button>

            {/* Share */}
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>

            {/* Report — only for non-authors */}
            {discussion.author?._id?.toString() !== user?.id?.toString() && (
              <button
                onClick={() => setReportTarget({ targetType: 'discussion', targetId: discussion._id })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-auto">
                <Flag className="w-4 h-4" /> Report
              </button>
            )}

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
              const replyAuthorName = getAuthorName(reply);
              const replyIsDoctor   = isDoctor(reply);
              const parentAuthor    = reply.replyTo?.author
                ? `${reply.replyTo.author.firstName} ${reply.replyTo.author.lastName}`
                : null;

              return (
                <Card key={reply._id || idx}
                  className={`overflow-hidden transition-all ${replyIsDoctor ? 'border-emerald-200' : 'border-slate-100'}`}>
                  {replyIsDoctor && <div className="h-0.5 bg-linear-to-r from-emerald-400 to-green-500" />}
                  <CardContent className="p-4 space-y-2">
                    {/* Author row */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                        <AvatarFallback className={`text-white text-xs font-semibold ${replyIsDoctor ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-slate-400 to-slate-500'}`}>
                          {getInitials(replyAuthorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-sm text-slate-800">{replyAuthorName}</p>
                          {replyIsDoctor && (
                            <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 py-0 gap-1">
                              <Stethoscope className="w-3 h-3" />
                              {isVerified(reply) ? 'Verified Doctor' : 'Doctor'}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">{formatDate(reply.createdAt)}</span>
                        </div>

                        {/* Reply-to quote */}
                        {parentAuthor && (
                          <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border-l-2 border-blue-300">
                            <CornerDownRight className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="text-xs text-blue-600 font-medium">@{parentAuthor}</span>
                            {reply.replyTo?.content && (
                              <span className="text-xs text-slate-400 line-clamp-1 ml-1">· {reply.replyTo.content}</span>
                            )}
                          </div>
                        )}

                        <p className="text-slate-700 text-sm leading-relaxed">{reply.content}</p>
                      </div>
                    </div>

                    {/* Reply actions: like · dislike · reply · delete */}
                    <div className="flex items-center gap-1 pl-11">
                      <button
                        onClick={() => reply.author?._id?.toString() !== user?.id?.toString() && handleReplyLike(reply._id)}
                        disabled={reply.author?._id?.toString() === user?.id?.toString()}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${reply.author?._id?.toString() === user?.id?.toString() ? 'text-slate-300 cursor-default' : `hover:bg-blue-50 ${reply.isLiked ? 'text-blue-600' : 'text-slate-400'}`}`}>
                        <ThumbsUp className={`w-3.5 h-3.5 ${reply.isLiked ? 'fill-blue-600' : ''}`} />
                        {reply.likes || 0}
                      </button>
                      <button
                        onClick={() => reply.author?._id?.toString() !== user?.id?.toString() && handleReplyDislike(reply._id)}
                        disabled={reply.author?._id?.toString() === user?.id?.toString()}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${reply.author?._id?.toString() === user?.id?.toString() ? 'text-slate-300 cursor-default' : `hover:bg-red-50 ${reply.isDisliked ? 'text-red-500' : 'text-slate-400'}`}`}>
                        <ThumbsDown className={`w-3.5 h-3.5 ${reply.isDisliked ? 'fill-red-500' : ''}`} />
                        {reply.dislikes || 0}
                      </button>
                      <button onClick={() => startReplyTo(reply)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Reply className="w-3.5 h-3.5" /> Reply
                      </button>
                      {reply.author?._id?.toString() === user?.id?.toString() && (
                        <button onClick={() => handleReplyDelete(reply._id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-auto">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {reply.author?._id?.toString() !== user?.id?.toString() && (
                        <button
                          onClick={() => setReportTarget({ targetType: 'reply', targetId: reply._id })}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-auto">
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
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

          {/* Replying-to banner */}
          {replyingTo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm text-blue-700">
                Replying to <span className="font-semibold">@{replyingTo.authorName}</span>
              </span>
              <button onClick={cancelReplyTo} className="ml-auto text-blue-400 hover:text-blue-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Avatar className="w-9 h-9 shrink-0 mt-0.5">
              <AvatarFallback className={`text-white text-xs font-semibold ${user?.role === 'doctor' ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                {getInitials(user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                ref={textareaRef}
                placeholder={replyingTo ? `Reply to @${replyingTo.authorName}…` : 'Share your thoughts or advice…'}
                rows={3}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                className="rounded-xl border-slate-200 resize-none focus:border-blue-300 focus:ring-blue-100"
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
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

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}