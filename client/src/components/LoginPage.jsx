import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 pointer-events-none" />
        <CardHeader className="text-center relative pb-8 pt-12">
          <div className="mx-auto mb-6 w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25 transform hover:scale-105 transition-transform duration-300">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Health Hive</CardTitle>
          <CardDescription className="mt-3 text-base">A platform for medical professionals and patients to connect</CardDescription>
        </CardHeader>
        <CardContent className="relative pb-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 px-4 border-slate-200 focus:border-blue-500 transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 px-4 border-slate-200 focus:border-blue-500 transition-all" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-[1.02]">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Need an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-indigo-600 hover:underline font-semibold transition-colors">Sign up here</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
