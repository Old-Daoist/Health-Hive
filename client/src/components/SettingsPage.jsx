import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Lock, User, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', city: user?.city || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ emailAlerts: true, replyNotifications: true });

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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPwd(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><User className="w-5 h-5 text-slate-500" /><CardTitle>Profile</CardTitle></div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['firstName','First Name'],['lastName','Last Name'],['phone','Phone'],['city','City']].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                <Input value={profileForm[field]} onChange={e => setProfileForm({...profileForm, [field]: e.target.value})} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-slate-50 text-slate-400" />
            <p className="text-xs text-slate-400">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-slate-500" /><CardTitle>Change Password</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label>{label}</Label>
              <Input type="password" value={passwordForm[field]} onChange={e => setPasswordForm({...passwordForm, [field]: e.target.value})} />
            </div>
          ))}
          <Button onClick={handleChangePassword} disabled={changingPwd} variant="outline">{changingPwd ? 'Changing...' : 'Change Password'}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-slate-500" /><CardTitle>Notifications</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[{ key: 'emailAlerts', label: 'Email Alerts', desc: 'Notifications via email' },
            { key: 'replyNotifications', label: 'Reply Notifications', desc: 'When someone replies to your posts' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div><p className="font-medium text-slate-700">{label}</p><p className="text-sm text-slate-500">{desc}</p></div>
              <Switch checked={notifications[key]} onCheckedChange={v => setNotifications({...notifications, [key]: v})} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /><CardTitle className="text-red-700">Danger Zone</CardTitle></div>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout}>Log Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
