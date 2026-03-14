import { useState, useEffect } from 'react';
import { adminAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  CheckCircle, XCircle, Stethoscope, Clock, Shield,
  AlertTriangle, Flag, MessageSquare, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'verifications', label: 'Doctor Verifications', icon: Stethoscope },
  { id: 'reports',       label: 'Content Reports',      icon: Flag        },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]           = useState('verifications');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [reports, setReports]               = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [processing, setProcessing]         = useState(null);

  useEffect(() => {
    adminAPI.getPendingVerifications()
      .then(({ data }) => setPendingDoctors(data || []))
      .catch(() => toast.error('Failed to load verifications'))
      .finally(() => setLoadingDoctors(false));

    reportsAPI.getAll()
      .then(({ data }) => setReports(data || []))
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-3" />
        <p className="text-slate-600 font-medium">Admin access only</p>
      </div>
    );
  }

  const handleApprove = async (id) => {
    setProcessing(id + 'a');
    try {
      await adminAPI.approveDoctor(id);
      setPendingDoctors(prev => prev.filter(d => d._id !== id));
      toast.success('Doctor approved!');
    } catch { toast.error('Failed to approve'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (id) => {
    setProcessing(id + 'r');
    try {
      await adminAPI.rejectDoctor(id);
      setPendingDoctors(prev => prev.filter(d => d._id !== id));
      toast.success('Verification rejected');
    } catch { toast.error('Failed to reject'); }
    finally { setProcessing(null); }
  };

  const handleResolve = async (id) => {
    setProcessing(id + 'res');
    try {
      await reportsAPI.resolve(id);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report resolved');
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  const handleDismiss = async (id) => {
    setProcessing(id + 'dis');
    try {
      await reportsAPI.dismiss(id);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report dismissed');
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-500 text-sm">Manage verifications and content reports</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Verifications', value: pendingDoctors.length, icon: Clock,    color: 'text-amber-600',  bg: 'bg-amber-50'   },
          { label: 'Pending Reports',        value: reports.length,       icon: Flag,     color: 'text-red-600',    bg: 'bg-red-50'     },
          { label: 'Access Level',           value: 'Full Admin',         icon: Shield,   color: 'text-blue-600',   bg: 'bg-blue-50'    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = id === 'verifications' ? pendingDoctors.length : reports.length;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Doctor Verifications Tab ── */}
      {activeTab === 'verifications' && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            {loadingDoctors ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600/30 border-t-blue-600" />
              </div>
            ) : pendingDoctors.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">All caught up!</p>
                <p className="text-slate-400 text-sm mt-1">No pending verifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDoctors.map(doc => (
                  <div key={doc._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {doc.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{doc.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{doc.user?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {doc.qualification && <Badge variant="outline" className="text-xs">{doc.qualification}</Badge>}
                        {doc.registrationNumber && <Badge variant="outline" className="text-xs">Reg: {doc.registrationNumber}</Badge>}
                        {doc.country && <Badge variant="outline" className="text-xs">{doc.country}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleApprove(doc._id)}
                        disabled={processing === doc._id + 'a'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {processing === doc._id + 'a' ? '…' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(doc._id)}
                        disabled={processing === doc._id + 'r'}
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
      )}

      {/* ── Content Reports Tab ── */}
      {activeTab === 'reports' && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            {loadingReports ? (
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
                            : <FileText className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs capitalize">{rep.targetType}</Badge>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">
                      <span className="font-medium">Reason: </span>{rep.reason}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Reported by: <span className="font-medium">{rep.reporter?.firstName} {rep.reporter?.lastName}</span>
                      {' · '}{rep.reporter?.email}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleResolve(rep._id)}
                        disabled={processing === rep._id + 'res'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {processing === rep._id + 'res' ? '…' : 'Resolve'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDismiss(rep._id)}
                        disabled={processing === rep._id + 'dis'}
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
      )}
    </div>
  );
}