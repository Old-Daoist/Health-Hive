import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsAPI } from '../services/api';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Stethoscope, Mail, MapPin, Phone, Calendar, Shield,
  MessageSquare, ThumbsUp, Bookmark, CheckCircle, Hash
} from 'lucide-react';

export default function UserProfile() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBm, setLoadingBm] = useState(true);

  useEffect(() => {
    discussionsAPI.getBookmarks()
      .then(({ data }) => setBookmarks(data.discussions || []))
      .catch(() => {})
      .finally(() => setLoadingBm(false));
  }, []);

  if (!user) return null;

  const isDoctor  = user.role === 'doctor';
  const displayName = user.firstName ? `${user.firstName} ${user.lastName}` : user.name;
  const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Member';

  const stats = [
    { icon: MessageSquare, label: 'Discussions',    value: user.discussionCount || 0, color: 'text-blue-600',  bg: 'bg-blue-50' },
    { icon: ThumbsUp,      label: 'Likes received', value: user.likesReceived   || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Bookmark,      label: 'Bookmarks',      value: bookmarks.length,          color: 'text-indigo-600',bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Profile hero card ── */}
      <Card className="border-slate-100 shadow-md overflow-hidden">
        {/* Top accent strip */}
        <div className="h-24 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-[linear-linear(rgba(255,255,255,0.06)_1px,transparent_1px),linear-linear(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[32px_32px]" />
        </div>
        <CardContent className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white shrink-0 overflow-hidden ${isDoctor ? 'bg-linear-to-br from-emerald-500 to-green-600' : 'bg-linear-to-br from-blue-500 to-indigo-600'}`}>
              {user?.avatar
                ? <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="pb-1 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                {isDoctor && user.isDoctorVerified && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Doctor
                  </Badge>
                )}
                {isDoctor && !user.isDoctorVerified && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending Verification</Badge>
                )}
              </div>
              <p className="text-slate-500 text-sm">{isDoctor ? (user.specialization || 'Medical Professional') : 'Community Member'}</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-slate-600 text-sm leading-relaxed mb-5 bg-slate-50 rounded-xl p-4 border border-slate-100">{user.bio}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Mail,     value: user.email,  label: 'Email' },
              { icon: MapPin,   value: user.city && user.country ? `${user.city}, ${user.country}` : user.city || user.country, label: 'Location' },
              { icon: Phone,    value: user.phone,  label: 'Phone' },
              { icon: Calendar, value: memberSince, label: 'Member since' },
              isDoctor && user.specialization
                ? { icon: Stethoscope, value: user.specialization, label: 'Specialization' }
                : null,
              { icon: Shield, value: isDoctor ? 'Medical Professional' : 'Community Member', label: 'Account type' },
            ].filter(Boolean).map(({ icon: Icon, value, label }) => value ? (
              <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
                </div>
              </div>
            ) : null)}
          </div>
        </CardContent>
      </Card>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bookmarks preview ── */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Saved discussions</h3>
            <Badge variant="outline" className="text-xs ml-auto">{bookmarks.length}</Badge>
          </div>
          {loadingBm ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/30 border-t-blue-600" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No saved discussions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.slice(0, 5).map(d => (
                <div key={d._id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-600 border-blue-200">{d.category}</Badge>
                      {d.tags?.slice(0,2).map(t => (
                        <span key={t} className="text-[10px] text-slate-400 flex items-center">
                          <Hash className="w-2.5 h-2.5 mr-0.5" />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {bookmarks.length > 5 && (
                <p className="text-xs text-slate-400 text-center pt-1">+{bookmarks.length - 5} more in Bookmarks</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Verification banner for unverified email ── */}
      {!user.isEmailVerified && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Email not verified</p>
            <p className="text-xs text-amber-600 mt-0.5">Check your inbox for the verification link we sent to <strong>{user.email}</strong>.</p>
          </div>
        </div>
      )}
    </div>
  );
}