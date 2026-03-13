import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Activity, Stethoscope, MessageSquare, Shield, Users,
  TrendingUp, CheckCircle, ArrowRight, Sparkles, Heart,
  Brain, Zap
} from 'lucide-react';

const stats = [
  { icon: Users,        label: 'Active Users',      value: '50K+',   color: 'from-blue-500 to-blue-600' },
  { icon: Stethoscope,  label: 'Verified Doctors',  value: '2,500+', color: 'from-emerald-500 to-green-600' },
  { icon: MessageSquare,label: 'Discussions',       value: '100K+',  color: 'from-purple-500 to-violet-600' },
  { icon: TrendingUp,   label: 'Success Rate',      value: '98%',    color: 'from-indigo-500 to-indigo-600' },
];

const features = [
  { icon: Stethoscope,   title: 'Verified Medical Professionals',  description: 'Get advice from certified doctors and healthcare experts you can trust.',                           gradient: 'from-green-500 to-emerald-600' },
  { icon: MessageSquare, title: 'Community Discussions',           description: 'Join conversations, share experiences, and learn from others facing similar health challenges.',   gradient: 'from-blue-500 to-indigo-600' },
  { icon: Shield,        title: 'Secure & Private',                description: 'Your health data is encrypted and protected with industry-leading security standards.',             gradient: 'from-purple-500 to-violet-600' },
  { icon: Brain,         title: 'Mental Health Support',           description: 'Access resources and connect with professionals specialising in mental wellness.',                  gradient: 'from-pink-500 to-rose-600' },
  { icon: Heart,         title: 'Personalized Care',               description: 'Track your health journey with personalised recommendations and insights.',                        gradient: 'from-red-500 to-orange-600' },
  { icon: Zap,           title: 'Instant Answers',                 description: 'Get real-time responses from our community of health experts and peers.',                          gradient: 'from-yellow-500 to-amber-600' },
];

const testimonials = [
  { name: 'Dr. Sarah Williams', role: 'Cardiologist',  content: 'Health Hive has revolutionized how I connect with patients. The platform is intuitive and secure.',              rating: 5 },
  { name: 'Michael Chen',       role: 'Patient',       content: 'Finally found a community where I can get reliable health advice. The verified doctors are incredibly helpful!', rating: 5 },
  { name: 'Dr. Emily Parker',   role: 'Psychiatrist',  content: 'The mental health community here is supportive and well-moderated. Highly recommend!',                          rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10">
        {/* ── Header ── */}
        <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Health Hive</span>
            </div>
            <Link to="/login">
              <Button variant="outline" className="border-2 hover:bg-blue-50 hover:border-blue-500 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Trusted by 10,000+ Healthcare Professionals</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Health,
              </span>
              <br />
              <span className="text-slate-900">Our Community</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Connect with verified doctors and a supportive community.
              Get answers, share experiences, and take control of your health journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-14 text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 h-14 text-lg border-2 hover:bg-white hover:border-blue-500 transition-all">
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-slate-600">
              {['100% Free Forever','HIPAA Compliant','24/7 Support'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
                  <p className="text-slate-600 text-sm">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 px-4 py-1">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed to support your health journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, gradient }) => (
              <Card key={title} className="border border-white/60 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 mb-5 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Loved by Thousands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, content, rating }) => (
              <Card key={name} className="border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(rating)].map((_,i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
                  </div>
                  <p className="text-slate-700 mb-4 italic leading-relaxed">"{content}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{name}</p>
                    <p className="text-sm text-slate-500">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0">
            <CardContent className="p-12 md:p-16 text-center bg-gradient-to-br from-blue-600 to-indigo-700">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Health Journey?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users and healthcare professionals in our thriving community today.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-14 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all group">
                  Join Health Hive Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-blue-100 mt-4 text-sm">No credit card required • Free forever</p>
            </CardContent>
          </Card>
        </section>

        {/* ── Footer ── */}
        <footer className="py-8 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200/60 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-700">Health Hive</span>
            </div>
            <p className="text-slate-500 text-sm">© 2025 Health Hive. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              {['Privacy','Terms','Contact'].map(l => (
                <button key={l} className="hover:text-blue-600 transition-colors">{l}</button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
