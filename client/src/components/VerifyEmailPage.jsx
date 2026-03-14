import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Activity, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const { user } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    try {
      await authAPI.resendVerification();
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Health Hive</h1>
            <p className="text-xs text-slate-500 -mt-0.5">Community Health Platform</p>
          </div>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl shadow-blue-900/10 p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-14 h-14 mx-auto text-blue-500 animate-spin" />
              <h2 className="text-xl font-bold text-slate-800">Verifying your email…</h2>
              <p className="text-slate-500 text-sm">This will only take a moment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Email verified!</h2>
              <p className="text-slate-500 text-sm">Your account is now fully activated. You can start using Health Hive.</p>
              <Link to="/forum">
                <Button className="w-full mt-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11">
                  Go to Forum
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Link expired or invalid</h2>
              <p className="text-slate-500 text-sm">This verification link has expired or already been used.</p>
              {user && !user.isEmailVerified && (
                <Button onClick={handleResend} variant="outline" className="w-full mt-2 gap-2 h-11">
                  <Mail className="w-4 h-4" /> Resend verification email
                </Button>
              )}
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full text-slate-500">Back to login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}