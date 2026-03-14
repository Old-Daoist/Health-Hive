import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, doctorAPI } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  User, Lock, Bell, Shield, CheckCircle, Mail,
  Eye, EyeOff, AlertTriangle, Save, RefreshCw, Camera, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'profile',      label: 'Profile',      icon: User        },
  { id: 'security',     label: 'Password',     icon: Lock        },
  { id: 'notifications',label: 'Notifications',icon: Bell        },
  { id: 'account',      label: 'Account',      icon: Shield      },
  { id: 'verification', label: 'Verification', icon: Stethoscope, doctorOnly: true },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving]               = useState(false);
  const [changingPwd, setChangingPwd]     = useState(false);
  const [resending, setResending]         = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [showCurr, setShowCurr]           = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const avatarInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    firstName:      user?.firstName      || '',
    lastName:       user?.lastName       || '',
    bio:            user?.bio            || '',
    phone:          user?.phone          || '',
    city:           user?.city           || '',
    country:        user?.country        || '',
    specialization: user?.specialization || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [verifyForm, setVerifyForm] = useState({
    qualification: '', registrationNumber: '', country: '',
  });

  /* ── Password strength ── */
  const pwStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    const map = [
      { label: '',       color: '' },
      { label: 'Weak',   color: 'bg-red-400' },
      { label: 'Fair',   color: 'bg-amber-400' },
      { label: 'Good',   color: 'bg-blue-400' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];
    return { score, ...map[score] };
  };
  const strength = pwStrength(passwordForm.newPassword);

  /* ── Handlers ── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarLoading(true);
    try {
      const { data } = await authAPI.uploadAvatar(formData);
      updateUser({ avatar: data.avatar });
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally { setAvatarLoading(false); }
  };

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
    if (passwordForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('Passwords do not match');
    setChangingPwd(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
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

  const handleVerifySubmit = async () => {
    if (!verifyForm.qualification || !verifyForm.registrationNumber || !verifyForm.country)
      return toast.error('All fields are required');
    setVerifySubmitting(true);
    try {
      await doctorAPI.requestVerification({ ...verifyForm, documentUrl: 'pending' });
      toast.success('Verification request submitted! An admin will review it shortly.');
      setVerifyForm({ qualification: '', registrationNumber: '', country: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally { setVerifySubmitting(false); }
  };

  const isDoctor = user?.role === 'doctor';

  /* ══════════════════════════════════════════
     SECTION RENDERERS
  ══════════════════════════════════════════ */
  const renderSection = () => {
    switch (activeSection) {

      /* ── PROFILE ── */
      case 'profile':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Profile information</h3>
              <p className="text-sm text-slate-500">Update how others see you in the community</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-md">
                  {user?.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md transition-colors"
                >
                  {avatarLoading
                    ? <RefreshCw className="w-3 h-3 text-white animate-spin" />
                    : <Camera className="w-3 h-3 text-white" />}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Profile picture</p>
                <p className="text-xs text-slate-500">JPG, PNG or WebP · Max 2MB</p>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:underline mt-0.5"
                >
                  Change photo
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'firstName',     label: 'First name',      placeholder: 'John'              },
                { field: 'lastName',      label: 'Last name',       placeholder: 'Smith'             },
                { field: 'phone',         label: 'Phone',           placeholder: '+1 (555) 000-0000' },
                { field: 'city',          label: 'City',            placeholder: 'New York'          },
                { field: 'country',       label: 'Country',         placeholder: 'United States'     },
                isDoctor && { field: 'specialization', label: 'Specialization', placeholder: 'e.g. Cardiologist' },
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

            {/* Bio */}
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
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 gap-2"
              >
                {saving
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save changes</>}
              </Button>
            </div>
          </div>
        );

      /* ── SECURITY ── */
      case 'security':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Change password</h3>
              <p className="text-sm text-slate-500">Use a strong password you don't use elsewhere</p>
            </div>
            <div className="space-y-4 max-w-md">
              {/* Current */}
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
              {/* New */}
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
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Strength: <span className="font-medium">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>
              {/* Confirm */}
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
              <Button
                onClick={handleChangePassword}
                disabled={changingPwd}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
              >
                {changingPwd
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Changing…</>
                  : 'Change password'}
              </Button>
            </div>
          </div>
        );

      /* ── NOTIFICATIONS ── */
      case 'notifications':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Notification preferences</h3>
              <p className="text-sm text-slate-500">Choose what updates you receive</p>
            </div>
            <NotificationToggles />
            <p className="text-xs text-slate-400">Full notification management coming soon.</p>
          </div>
        );

      /* ── ACCOUNT ── */
      case 'account':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Account details</h3>
              <p className="text-sm text-slate-500">Your account status and actions</p>
            </div>

            {/* Email verification */}
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${user?.isEmailVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              {user?.isEmailVerified
                ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
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
                    <Button
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-2 bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-8"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {resending ? 'Sending…' : 'Resend verification email'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Role */}
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
            <div className="p-4 border border-red-200 rounded-xl bg-red-50/50">
              <p className="text-sm font-semibold text-red-800 mb-1">Danger zone</p>
              <p className="text-xs text-red-600 mb-3">Logging out will clear your session on this device.</p>
              <Button
                variant="outline"
                onClick={logout}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 h-9 text-sm"
              >
                Sign out
              </Button>
            </div>
          </div>
        );

      /* ── VERIFICATION ── */
      case 'verification':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0.5">Doctor Verification</h3>
              <p className="text-sm text-slate-500">Submit your credentials to get a verified doctor badge</p>
            </div>

            {user?.isDoctorVerified ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">You are a verified doctor</p>
                  <p className="text-sm text-emerald-600">Your account displays the verified doctor badge.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  Fill in your credentials and an admin will review your request within 24–48 hours.
                </div>
                {[
                  { field: 'qualification',       label: 'Qualification',                 placeholder: 'e.g. MBBS, MD, FRCP'          },
                  { field: 'registrationNumber',  label: 'Medical Registration Number',   placeholder: 'Your official registration number' },
                  { field: 'country',             label: 'Country of Registration',       placeholder: 'e.g. United States'            },
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">{label}</Label>
                    <Input
                      value={verifyForm[field]}
                      onChange={e => setVerifyForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="border-slate-200 focus:border-blue-400"
                    />
                  </div>
                ))}
                <Button
                  onClick={handleVerifySubmit}
                  disabled={verifySubmitting}
                  className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  {verifySubmitting ? 'Submitting…' : 'Submit verification request'}
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar */}
        <nav className="sm:w-44 shrink-0">
          <div className="space-y-1">
            {SECTIONS.filter(s => !s.doctorOnly || isDoctor).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
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

/* ── Notification toggles extracted to avoid hook-in-loop ── */
function NotificationToggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative rounded-full transition-colors duration-200 ${on ? 'bg-blue-600' : 'bg-slate-300'}`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className="absolute bg-white rounded-full shadow transition-all duration-200"
          style={{ width: 18, height: 18, top: 2, left: on ? 20 : 2 }}
        />
      </button>
    </div>
  );
}

function NotificationToggles() {
  const items = [
    { label: 'Reply notifications',   desc: 'When someone replies to your discussion', defaultOn: true  },
    { label: 'Like notifications',    desc: 'When someone likes your post',            defaultOn: true  },
    { label: 'Message notifications', desc: 'When you receive a direct message',       defaultOn: true  },
    { label: 'Email digest',          desc: 'Weekly summary of activity',              defaultOn: false },
  ];
  return (
    <div className="space-y-3">
      {items.map(item => <NotificationToggle key={item.label} {...item} />)}
    </div>
  );
}