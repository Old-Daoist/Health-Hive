import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Stethoscope, Users, Shield, Heart, Target, Zap } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-gray-900">About MediConnect Forum</h2>
        <p className="text-gray-600">
          Learn about our mission and what makes us unique
        </p>
      </div>

      {/* Hero Section */}
      <Card className="bg-linear-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">MediConnect Forum</CardTitle>
              <Badge variant="secondary">Connecting Healthcare & Community</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base text-gray-700">
            MediConnect Forum is a comprehensive discussion platform that bridges the gap between medical professionals and individuals seeking health information. Our mission is to create a supportive, informative community where knowledge is shared freely and health literacy is promoted.
          </CardDescription>
        </CardContent>
      </Card>

      {/* Mission & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Target className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              To democratize access to medical knowledge by creating a safe, inclusive platform where healthcare professionals and community members can connect, share experiences, and learn from each other. We believe informed patients make better health decisions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="w-8 h-8 text-red-600 mb-2" />
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span><strong>Integrity:</strong> Accurate, evidence-based information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span><strong>Compassion:</strong> Supportive and respectful community</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span><strong>Privacy:</strong> Secure handling of personal health data</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>What makes MediConnect Forum special</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-gray-900">Verified Doctors</h4>
              <p className="text-gray-600 text-sm">
                Connect with verified medical professionals who provide expert insights and guidance.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-gray-900">Community Driven</h4>
              <p className="text-gray-600 text-sm">
                Engage with a supportive community of individuals sharing similar health journeys.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-gray-900">Secure & Private</h4>
              <p className="text-gray-600 text-sm">
                Your health information is protected with industry-standard security measures.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-gray-900">Real-time Discussions</h4>
              <p className="text-gray-600 text-sm">
                Get quick responses and engage in meaningful conversations about health topics.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <h4 className="text-gray-900">Medical Data Tracking</h4>
              <p className="text-gray-600 text-sm">
                Securely store and track your health information in one convenient location.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-gray-900">Private Messaging</h4>
              <p className="text-gray-600 text-sm">
                Connect directly with other members through secure private messages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>By the Numbers</CardTitle>
          <CardDescription>Our growing community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl text-green-600 mb-1">500+</div>
              <p className="text-gray-600 text-sm">Active Users</p>
            </div>
            <div>
              <div className="text-3xl text-blue-600 mb-1">150+</div>
              <p className="text-gray-600 text-sm">Verified Doctors</p>
            </div>
            <div>
              <div className="text-3xl text-purple-600 mb-1">1,200+</div>
              <p className="text-gray-600 text-sm">Discussions</p>
            </div>
            <div>
              <div className="text-3xl text-orange-600 mb-1">5,000+</div>
              <p className="text-gray-600 text-sm">Helpful Replies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle>Important Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-700">
            <strong>Medical Disclaimer:</strong> MediConnect Forum is designed for educational and informational purposes only. The information shared on this platform is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.
          </CardDescription>
        </CardContent>
      </Card>

      {/* Team Info */}
      <Card>
        <CardHeader>
          <CardTitle>Our Commitment</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            We are committed to maintaining the highest standards of information quality, user privacy, and community safety. Our moderation team works around the clock to ensure discussions remain respectful, helpful, and compliant with medical ethics. We continuously improve our platform based on user feedback and emerging healthcare communication needs.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
