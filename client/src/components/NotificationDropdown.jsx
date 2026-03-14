import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageSquare, ThumbsUp, Mail, CheckCircle, Trash2, BellOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';

const typeIcon = (type) => {
  const cls = "w-4 h-4";
  switch (type) {
    case 'reply':   return <MessageSquare className={`${cls} text-blue-500`} />;
    case 'like':    return <ThumbsUp className={`${cls} text-amber-500`} />;
    case 'message': return <Mail className={`${cls} text-indigo-500`} />;
    default:        return <Bell className={`${cls} text-slate-400`} />;
  }
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

export default function NotificationDropdown({ onNavigateToDiscussion }) {
  const { user } = useAuth();
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [loading, setLoading]           = useState(false);
  const ref = useRef(null);

  /* Load on open */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    notificationsAPI.getAll()
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  /* Real-time push */
  useEffect(() => {
    const handler = (notif) => {
      setUnreadCount(c => c + 1);
      setNotifications(prev => [notif, ...prev].slice(0, 30));
      toast(notif.message, { icon: typeIcon(notif.type) });
    };
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, []);

  /* Also poll unread count on mount */
  useEffect(() => {
    notificationsAPI.getAll()
      .then(({ data }) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationsAPI.delete(id).catch(() => {});
    const was = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (was && !was.isRead) setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    if (notif.discussionId && onNavigateToDiscussion) {
      onNavigateToDiscussion(notif.discussionId);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-600 border-red-200 text-xs h-5 px-1.5">{unreadCount}</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-90 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/30 border-t-blue-600 mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellOff className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id}
                  onClick={() => handleClick(n)}
                  className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
                  {/* Icon badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                    {typeIcon(n.type)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {/* Unread dot + delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    <button
                      onClick={e => handleDelete(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}