import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Stethoscope, User as UserIcon, Mail, Shield } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        <p className="text-gray-600 mt-1">Your account information and activity</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${user.role === 'doctor' ? 'bg-green-600' : 'bg-blue-600'}`}>
              {user.role === 'doctor' ? <Stethoscope className="w-8 h-8 text-white" /> : <UserIcon className="w-8 h-8 text-white" />}
            </div>
            <div>
              <CardTitle>{user.name || `${user.firstName} ${user.lastName}`}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'}>
                  {user.role === 'doctor' ? 'Doctor' : 'User'}
                </Badge>
                {user.isDoctorVerified && <Badge variant="outline" className="text-green-600 border-green-300">Verified</Badge>}
                {user.specialization && <Badge variant="outline">{user.specialization}</Badge>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">Account Type</p>
                <p className="text-gray-900 font-medium">{user.role === 'doctor' ? 'Medical Professional' : 'Regular User'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Your contributions to the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: user.discussionCount || 0, label: 'Discussions', color: 'blue' },
              { value: user.replyCount || 0, label: 'Replies', color: 'green' },
              { value: user.likesReceived || 0, label: 'Likes Received', color: 'purple' },
            ].map(({ value, label, color }) => (
              <div key={label} className={`text-center p-4 bg-${color}-50 rounded-lg`}>
                <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
                <p className={`text-${color}-600 text-sm`}>{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
