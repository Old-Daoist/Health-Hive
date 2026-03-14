import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  User, Lock, Bell, Shield, CheckCircle, Mail,
  Eye, EyeOff, AlertTriangle, Save, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'profile',       label: 'Profile',         icon: User    },
  { id: 'security',      label: 'Password',         icon: Lock    },
  { id: 'notifications', label: 'Notifications',    icon: Bell    },
  { id: 'account',       label: 'Account',          icon: Shield  },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving]       = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [resending, setResending] = useState(false);
  const [showCurr, setShowCurr]   = useState(false);
  const [showNew, setShowNew]     = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName:      user?.firstName       || '',
    lastName:       user?.lastName        || '',
    bio:            user?.bio             || '',
    phone:          user?.phone           || '',
    city:           user?.city            || '',
    country:        user?.country         || '',
    specialization: user?.specialization  || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const pwStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label:'', color:'' },
      { label:'Weak', color:'bg-red-400' },
      { label:'Fair', color:'bg-amber-400' },
      { label:'Good', color:'bg-blue-400' },
      { label:'Strong', color:'bg-emerald-500' },
    ];
    return { score, ...map[score] };
  };
  const strength = pwStrength(passwordForm.newPassword);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPwd(false); }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setResending(false); }
  };

  const isDoctor = user?.role === 'doctor';

  const renderSection = () => {
    switch (activeSection) {

      case 'profile':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Profile information</h3>
              <p className="text-sm text-slate-500">Update how others see you in the community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field:'firstName', label:'First name', placeholder:'John' },
                { field:'lastName',  label:'Last name',  placeholder:'Smith' },
                { field:'phone',     label:'Phone',      placeholder:'+1 (555) 000-0000' },
                { field:'city',      label:'City',       placeholder:'New York' },
                { field:'country',   label:'Country',    placeholder:'United States' },
                isDoctor && { field:'specialization', label:'Specialization', placeholder:'e.g. Cardiologist' },
              ].filter(Boolean).map(({ field, label, placeholder }) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">{label}</Label>
                  <Input
                    value={profileForm[field]}
                    onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Bio</Label>
              <Textarea
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell the community a little about yourself…"
                rows={3}
                className="resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
              <p className="text-xs text-slate-400">{profileForm.bio.length}/200 characters</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 gap-2">
                {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save changes</>}
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Change password</h3>
              <p className="text-sm text-slate-500">Use a strong password you don't use elsewhere</p>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Current password</Label>
                <div className="relative">
                  <Input
                    type={showCurr ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="pr-10 border-slate-200 focus:border-blue-400"
                  />
                  <button type="button" onClick={() => setShowCurr(!showCurr)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">New password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="pr-10 border-slate-200 focus:border-blue-400"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Strength: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Confirm new password</Label>
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="border-slate-200 focus:border-blue-400"
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
              </div>
              <Button onClick={handleChangePassword} disabled={changingPwd}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
                {changingPwd ? <><RefreshCw className="w-4 h-4 animate-spin" /> Changing…</> : 'Change password'}
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Notification preferences</h3>
              <p className="text-sm text-slate-500">Choose what updates you receive</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Reply notifications',      desc: 'When someone replies to your discussion', defaultOn: true },
                { label: 'Like notifications',       desc: 'When someone likes your post',            defaultOn: true },
                { label: 'Message notifications',    desc: 'When you receive a direct message',       defaultOn: true },
                { label: 'Email digest',             desc: 'Weekly summary of activity',              defaultOn: false },
              ].map(({ label, desc, defaultOn }) => {
                const [on, setOn] = useState(defaultOn);
                return (
                  <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setOn(!on)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${on ? 'bg-blue-600' : 'bg-slate-300'}`}
                      style={{ width: 40, height: 22 }}
                    >
                      <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
                        style={{ width: 18, height: 18, top: 2, left: on ? 20 : 2 }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">Full notification management coming soon.</p>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Account details</h3>
              <p className="text-sm text-slate-500">Your account status and actions</p>
            </div>
            {/* Email verification status */}
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${user?.isEmailVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              {user?.isEmailVerified ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${user?.isEmailVerified ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                  </p>
                  <Badge variant="outline" className="text-xs">{user?.email}</Badge>
                </div>
                {!user?.isEmailVerified && (
                  <>
                    <p className="text-xs text-amber-600 mt-0.5">Please verify your email to unlock all features.</p>
                    <Button size="sm" onClick={handleResendVerification} disabled={resending}
                      className="mt-2 bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-8">
                      <Mail className="w-3.5 h-3.5" />
                      {resending ? 'Sending…' : 'Resend verification email'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Role info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Shield className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">Account type</p>
                <p className="text-xs text-slate-500">{isDoctor ? 'Medical Professional' : 'Community Member'}</p>
              </div>
              <Badge className={`ml-auto ${isDoctor ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {isDoctor ? 'Doctor' : 'User'}
              </Badge>
            </div>

            {/* Danger zone */}
            <div className="mt-6 p-4 border border-red-200 rounded-xl bg-red-50/50">
              <p className="text-sm font-semibold text-red-800 mb-1">Danger zone</p>
              <p className="text-xs text-red-600 mb-3">Logging out will clear your session on this device.</p>
              <Button variant="outline" onClick={logout}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 h-9 text-sm">
                Sign out
              </Button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar nav */}
        <nav className="sm:w-44 shrink-0">
          <div className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <Card className="flex-1 border-slate-100 shadow-sm">
          <CardContent className="p-6">
            {renderSection()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}