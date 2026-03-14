import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Activity, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid reset link');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label: '', color: '' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-amber-400' },
      { label: 'Good', color: 'bg-blue-400' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];
    return { score, ...map[score] };
  };

  const strength = pwStrength(form.newPassword);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-linear(circle_at_20%_30%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Health Hive</h1>
            <p className="text-xs text-slate-500 -mt-0.5">Community Health Platform</p>
          </div>
        </div>

        <Card className="border-white/80 shadow-2xl shadow-blue-900/10 bg-white/95">
          <CardContent className="p-8">
            {!done ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
                  <p className="text-slate-500 mt-1 text-sm">Choose a strong password for your account.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">New password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPw ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={form.newPassword}
                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-400"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.newPassword && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Strength: <span className="font-medium">{strength.label}</span></p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPw ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        className="pl-10 h-11 border-slate-200 focus:border-blue-400"
                      />
                    </div>
                    {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                      <p className="text-xs text-red-500">Passwords don't match</p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 mt-2">
                    {loading ? 'Resetting…' : 'Reset password'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Password reset!</h2>
                <p className="text-slate-500 text-sm">Your password has been updated. You can now log in with your new password.</p>
                <Button onClick={() => navigate('/login')} className="w-full h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-2">
                  Go to login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}