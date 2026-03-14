import { useState, useEffect, useCallback } from 'react';
import { adminAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  CheckCircle, XCircle, Stethoscope, Clock, Shield,
  AlertTriangle, Flag, MessageSquare, FileText,
  Users, RefreshCw, Search, Trash2, Activity,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── helpers ── */
const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const userInitials = (u) =>
  `${u?.firstName?.[0] || u?.name?.[0] || ''}${u?.lastName?.[0] || ''}`.toUpperCase() || '?';

const ROLE_COLORS = {
  admin:   'bg-violet-100 text-violet-700 border-violet-200',
  doctor:  'bg-blue-100 text-blue-700 border-blue-200',
  regular: 'bg-slate-100 text-slate-600 border-slate-200',
};

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: Activity    },
  { id: 'verifications', label: 'Verifications', icon: Stethoscope },
  { id: 'users',         label: 'Users',         icon: Users       },
  { id: 'reports',       label: 'Reports',       icon: Flag        },
];

/* ════════════════════════
   OVERVIEW
════════════════════════ */
function OverviewTab({ onTabChange }) {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try   { const { data } = await adminAPI.getStats(); setStats(data); }
    catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">Platform at a glance</p>
        <button onClick={load} disabled={loading}
          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Users',    value: stats.totalUsers,           icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
              { label: 'Doctors',        value: stats.totalDoctors,         icon: Stethoscope,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Discussions',    value: stats.totalDiscussions,     icon: MessageSquare,color: 'text-slate-600',  bg: 'bg-slate-100' },
              { label: 'Pending Verif.', value: stats.pendingVerifications, icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50'  },
              { label: 'Open Reports',   value: stats.openReports,          icon: Flag,         color: 'text-red-500',    bg: 'bg-red-50'    },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(stats.pendingVerifications > 0 || stats.openReports > 0) && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Needs attention</p>
              {stats.pendingVerifications > 0 && (
                <button onClick={() => onTabChange('verifications')}
                  className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200
                    rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors text-left">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {stats.pendingVerifications} doctor verification{stats.pendingVerifications > 1 ? 's' : ''} pending
                    </p>
                    <p className="text-xs text-amber-600">Tap to review</p>
                  </div>
                </button>
              )}
              {stats.openReports > 0 && (
                <button onClick={() => onTabChange('reports')}
                  className="w-full flex items-center gap-3 bg-red-50 border border-red-200
                    rounded-xl px-4 py-3 hover:bg-red-100 transition-colors text-left">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Flag className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {stats.openReports} open report{stats.openReports > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-red-500">Tap to review</p>
                  </div>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════
   VERIFICATIONS
════════════════════════ */
function VerificationsTab() {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { const { data } = await adminAPI.getPendingVerifications(); setDocs(data || []); }
    catch { toast.error('Failed to load verifications'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    setProcessing(id + action);
    try {
      if (action === 'a') await adminAPI.approveDoctor(id);
      else                await adminAPI.rejectDoctor(id);
      setDocs(prev => prev.filter(d => d._id !== id));
      toast.success(action === 'a' ? 'Doctor approved!' : 'Verification rejected');
    } catch { toast.error('Action failed'); }
    finally { setProcessing(null); }
  };

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-slate-700">Pending Verifications</p>
          <button onClick={load} disabled={loading}
            className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600/30 border-t-blue-600" />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending verifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc._id}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl
                  flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {userInitials(doc.user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">
                    {doc.user?.name || `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.trim() || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500">{doc.user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doc.qualification      && <Badge variant="outline" className="text-xs">{doc.qualification}</Badge>}
                    {doc.registrationNumber && <Badge variant="outline" className="text-xs">Reg: {doc.registrationNumber}</Badge>}
                    {doc.country            && <Badge variant="outline" className="text-xs">{doc.country}</Badge>}
                  </div>
                  {doc.documentUrl && (
                    <a href={doc.documentUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                      <FileText className="w-3 h-3" /> View Document
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => act(doc._id, 'a')} disabled={!!processing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {processing === doc._id + 'a' ? '…' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(doc._id, 'r')} disabled={!!processing}
                    className="border-red-300 text-red-600 hover:bg-red-50 h-8 gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    {processing === doc._id + 'r' ? '…' : 'Reject'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ════════════════════════
   USERS
════════════════════════ */
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [total, setTotal]     = useState(0);
  const [acting, setActing]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search: q });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(window._adminSearch);
    window._adminSearch = setTimeout(() => load(q), 400);
  };

  const changeRole = async (id, role) => {
    setActing(id);
    try {
      await adminAPI.updateUserRole(id, role);
      toast.success('Role updated');
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setActing(null); }
  };

  const deleteUser = async (id) => {
    setConfirmDelete(null);
    setActing(id);
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(t => t - 1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setActing(null); }
  };

  return (
    <>
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-700">
              Users <span className="text-slate-400 font-normal text-sm">({total})</span>
            </p>
            <button onClick={() => load(search)} disabled={loading}
              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={handleSearch} placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600/30 border-t-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u._id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {`${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                    {u.isDoctorVerified && (
                      <span className="hidden sm:inline text-xs bg-emerald-100 text-emerald-700
                        border border-emerald-200 px-2 py-0.5 rounded-full font-medium">verified</span>
                    )}
                    <select value={u.role} disabled={acting === u._id}
                      onChange={e => changeRole(u._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white
                        text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                      <option value="regular">regular</option>
                      <option value="doctor">doctor</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={() => setConfirmDelete(u._id)} disabled={acting === u._id}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Delete User</h3>
            <p className="text-sm text-slate-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteUser(confirmDelete)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════
   REPORTS
════════════════════════ */
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { const { data } = await reportsAPI.getAll(); setReports(data || []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    setProcessing(id + action);
    try {
      if (action === 'res') await reportsAPI.resolve(id);
      else                  await reportsAPI.dismiss(id);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success(action === 'res' ? 'Report resolved' : 'Report dismissed');
    } catch { toast.error('Action failed'); }
    finally { setProcessing(null); }
  };

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-slate-700">Content Reports</p>
          <button onClick={load} disabled={loading}
            className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600/30 border-t-blue-600" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10">
            <Flag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending reports</p>
            <p className="text-slate-400 text-sm mt-1">The community is behaving!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(rep => (
              <div key={rep._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                      {rep.targetType === 'reply'
                        ? <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                        : <FileText      className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{rep.targetType}</Badge>
                  </div>
                  <span className="text-xs text-slate-400">{fmt(rep.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  <span className="font-medium">Reason: </span>{rep.reason}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  By: <span className="font-medium">{rep.reporter?.firstName} {rep.reporter?.lastName}</span>
                  {' · '}{rep.reporter?.email}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => act(rep._id, 'res')} disabled={!!processing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {processing === rep._id + 'res' ? '…' : 'Resolve'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(rep._id, 'dis')} disabled={!!processing}
                    className="border-slate-300 text-slate-600 hover:bg-slate-100 h-8">
                    {processing === rep._id + 'dis' ? '…' : 'Dismiss'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ════════════════════════
   MAIN
════════════════════════ */
export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-3" />
        <p className="text-slate-600 font-medium">Admin access only</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-orange-600 rounded-xl
          flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-500 text-sm">Manage users, verifications and reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px
              whitespace-nowrap transition-all ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'overview'      && <OverviewTab onTabChange={setTab} />}
      {tab === 'verifications' && <VerificationsTab />}
      {tab === 'users'         && <UsersTab />}
      {tab === 'reports'       && <ReportsTab />}
    </div>
  );
}