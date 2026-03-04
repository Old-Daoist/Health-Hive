import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForumDashboard from './components/ForumDashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute><div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50"><LoginPage /></div></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50"><SignupPage /></div></PublicRoute>} />
        <Route path="/*" element={<PrivateRoute><div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"><ForumDashboard /></div></PrivateRoute>} />
      </Routes>
      <Toaster />
    </>
  );
}
