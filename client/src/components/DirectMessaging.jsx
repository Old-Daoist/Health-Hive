import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesAPI } from '../services/api';
import { socket } from '../services/socket';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

import {
  ArrowLeft, Send, Search, MessageCircle, Stethoscope, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

const formatTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── ConversationItem ─── */
function ConversationItem({ conv, isActive, onClick }) {
  const isDoctor = conv.other?.role === 'doctor';
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
        isActive
          ? 'bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="w-11 h-11">
          <AvatarFallback
            className={`text-white text-sm font-semibold ${isDoctor ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}
          >
            {getInitials(conv.other?.firstName, conv.other?.lastName)}
          </AvatarFallback>
        </Avatar>
        {conv.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {conv.unread > 9 ? '9+' : conv.unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
            {conv.other?.firstName} {conv.other?.lastName}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {formatTime(conv.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isDoctor && (
            <Stethoscope className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
          <p className={`text-xs truncate ${conv.unread > 0 ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
            {conv.lastMessage?.fromMe ? 'You: ' : ''}{conv.lastMessage?.content}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── MessageBubble ─── */
function MessageBubble({ message, isMe }) {
  return (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <Avatar className="w-7 h-7 shrink-0 mb-0.5">
          <AvatarFallback className={`text-white text-xs ${message.sender?.role === 'doctor' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
            {getInitials(message.sender?.firstName, message.sender?.lastName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isMe
              ? 'bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DirectMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeOther, setActiveOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const userId = user?._id || user?.id;

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await messagesAPI.getConversations();
      setConversations(data.conversations || []);
    } catch {
      /* silent */
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Listen for new messages (joinUserRoom is handled by ForumDashboard)
  useEffect(() => {
    if (!userId) return;

    const handleNewMessage = (msg) => {
      const senderId = (msg.sender?._id || msg.sender).toString();
      const receiverId = (msg.receiver?._id || msg.receiver).toString();
      const otherId = senderId === userId ? receiverId : senderId;

      // If this conversation is open, append the message
      setActiveConvId(currentConvId => {
        const normalizedConvId = currentConvId?.toString();
        if (normalizedConvId === otherId || normalizedConvId === senderId) {
          setMessages(prev => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
        return currentConvId;
      });

      // Always refresh conversation list
      loadConversations();
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [userId, activeConvId, loadConversations]);

  // Open conversation
  const openConversation = async (otherId, otherUser) => {
    setActiveConvId(otherId);
    setActiveOther(otherUser);
    setLoadingMsgs(true);
    setMessages([]);
    setShowNewChat(false);
    try {
      const { data } = await messagesAPI.getMessages(otherId);
      setMessages(data.messages || []);
      // Mark unread as 0 locally
      setConversations((prev) =>
        prev.map((c) =>
          c.other?._id === otherId ? { ...c, unread: 0 } : c
        )
      );
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !activeConvId || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      await messagesAPI.sendMessage(activeConvId, content);
      // Don't add optimistically — the server emits newMessage back to sender via socket
    } catch {
      toast.error('Failed to send message');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Search users
  useEffect(() => {
    if (!showNewChat) return;
    if (!userSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await messagesAPI.getUsers(userSearch);
        setSearchResults(data.users || []);
      } catch {
        /* silent */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, showNewChat]);

  const isDoctor = (u) => u?.role === 'doctor';

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-125 rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
      {/* ── Sidebar ── */}
      <div className="w-80 shrink-0 border-r border-slate-100 flex flex-col bg-linear-to-b from-slate-50/50 to-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
              onClick={() => { setShowNewChat(true); setUserSearch(''); setSearchResults([]); }}
              title="New Message"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat search */}
        {showNewChat ? (
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-700 flex-1">New Conversation</h3>
                <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setShowNewChat(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  autoFocus
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 h-8 text-sm bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {searching && (
                  <p className="text-xs text-slate-400 text-center py-4">Searching…</p>
                )}
                {!searching && userSearch && searchResults.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No users found</p>
                )}
                {!userSearch && (
                  <p className="text-xs text-slate-400 text-center py-6">Type a name to search</p>
                )}
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => openConversation(u._id, u)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all text-left"
                  >
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className={`text-white text-xs ${isDoctor(u) ? 'bg-linear-to-brrom-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                        {getInitials(u.firstName, u.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {isDoctor(u) ? '🩺 Doctor' : 'Member'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {loadingConvs && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              )}
              {!loadingConvs && conversations.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">No messages yet</p>
                  <p className="text-xs text-slate-400">Click + to start a conversation</p>
                </div>
              )}
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.conversationId}
                  conv={conv}
                  isActive={activeConvId === conv.other?._id}
                  onClick={() => openConversation(conv.other?._id, conv.other)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Panel ── */}
      {activeOther ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-white shadow-sm shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-8 h-8"
              onClick={() => { setActiveConvId(null); setActiveOther(null); }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className={`text-white font-semibold ${isDoctor(activeOther) ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
                {getInitials(activeOther.firstName, activeOther.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {activeOther.firstName} {activeOther.lastName}
              </p>
              {isDoctor(activeOther) && (
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">
                    {activeOther.isDoctorVerified ? 'Verified Doctor' : 'Doctor'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-linear-to-b from-slate-50/30 to-white">
            <div className="p-5 space-y-4">
              {loadingMsgs && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Say hello! 👋</p>
                </div>
              )}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isMe={(msg.sender?._id || msg.sender).toString() === userId}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder={`Message ${activeOther.firstName}…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 rounded-xl border-slate-200 focus:border-blue-300 bg-slate-50 focus:bg-white transition-colors"
                  disabled={sending}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                size="icon"
                className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-linear-to-br from-slate-50/50 to-blue-50/20">
          <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
            <MessageCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Your Messages</h3>
          <p className="text-sm text-slate-400 text-center max-w-xs">
            Select a conversation or click <strong>+</strong> to start a new one
          </p>
        </div>
      )}
    </div>
  );
}