import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Activity, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/30 relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-linear(circle_at_20%_30%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-linear(circle_at_80%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
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

        <Card className="border-white/80 shadow-2xl shadow-blue-900/10 backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            {!sent ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Forgot password?</h2>
                  <p className="text-slate-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium text-sm">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email" placeholder="you@example.com" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 mt-2">
                    {loading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Check your inbox</h2>
                <p className="text-slate-500 text-sm">
                  If <span className="font-semibold text-slate-700">{email}</span> is registered, you'll receive a reset link within a few minutes.
                </p>
                <p className="text-xs text-slate-400">Didn't get it? Check spam or try again.</p>
                <Button variant="outline" onClick={() => setSent(false)} className="w-full h-11 mt-2">
                  Try a different email
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}