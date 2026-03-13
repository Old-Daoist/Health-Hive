import { Link } from 'react-router-dom';
import {
  Activity, Stethoscope, MessageSquare, Shield, Users, TrendingUp,
  CheckCircle, ArrowRight, Sparkles, Heart, Brain, Zap,
  Star, ChevronDown
} from 'lucide-react';

const stats = [
  { value: '1k',   label: 'Active Members',    icon: Users        },
  { value: '500+', label: 'Verified Doctors',  icon: Stethoscope  },
  { value: '100K+',  label: 'Discussions',        icon: MessageSquare},
  { value: '98%',    label: 'Satisfaction',       icon: Star         },
];

const features = [
  { icon: Stethoscope,   gradient: 'from-teal-400 to-cyan-500',    title: 'Verified Doctors',          desc: 'Every medical professional is credentialed and verified before they can answer.' },
  { icon: MessageSquare, gradient: 'from-violet-400 to-purple-500', title: 'Live Community',            desc: 'Real-time discussions, replies, and reactions. Knowledge flows fast here.' },
  { icon: Shield,        gradient: 'from-blue-400 to-indigo-500',   title: 'Private & Secure',          desc: 'End-to-end best practices. Your health data stays yours, always.' },
  { icon: Brain,         gradient: 'from-rose-400 to-pink-500',     title: 'Mental Health Support',     desc: 'Specialist professionals in psychology and psychiatry are here for you.' },
  { icon: Heart,         gradient: 'from-orange-400 to-amber-500',  title: 'Personalised Care',         desc: 'Track your journey, bookmark resources, and get tailored insights.' },
  { icon: Zap,           gradient: 'from-emerald-400 to-green-500', title: 'Instant Answers',           desc: 'Post a question, get a response from the community within minutes.' },
];

const testimonials = [
  { name: 'Dr. Sarah Williams', role: 'Cardiologist',  rating: 5, text: 'Health Hive has completely changed how I stay connected with patients between visits. The platform is exactly what the healthcare space needed.' },
  { name: 'Michael Chen',       role: 'Patient',       rating: 5, text: 'After years of confusing medical advice online, I finally found a place where I can trust the answers. The verified doctor system is brilliant.' },
  { name: 'Dr. Emily Parker',   role: 'Psychiatrist',  rating: 5, text: 'The mental health community is thoughtfully moderated and genuinely supportive. I am proud to contribute here.' },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}
         className="min-h-screen bg-[#f0f4ff] text-slate-900 overflow-x-hidden">

      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .hh-display { font-family: 'Sora', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fade-up-1 { animation: fadeUp .7s ease both .1s; }
        .fade-up-2 { animation: fadeUp .7s ease both .25s; }
        .fade-up-3 { animation: fadeUp .7s ease both .4s; }
        .fade-up-4 { animation: fadeUp .7s ease both .55s; }
        .float-1   { animation: float 5s ease-in-out infinite; }
        .float-2   { animation: float 7s ease-in-out infinite .8s; }
        .float-3   { animation: float 6s ease-in-out infinite 1.4s; }
        .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(15,30,80,.1); }
      `}</style>

      {/* ──────────────── HEADER ──────────────── */}
      <header className="sticky top-0 z-50 bg-[#f0f4ff]/90 backdrop-blur-xl border-b border-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="hh-display text-xl font-bold text-slate-900 tracking-tight">Health Hive</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {['Features','How it works','Testimonials'].map(l => (
              <a key={l} href="#" className="hover:text-blue-600 transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-xl hover:bg-white/80">
              Sign in
            </Link>
            <Link to="/signup"
              className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02]">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[100px]" />
          <div className="absolute top-[60px] right-[-100px] w-[400px] h-[400px] bg-indigo-300/25 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-60px] left-[35%] w-[360px] h-[360px] bg-violet-200/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <div className="space-y-8">
              <div className="fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 border border-blue-200/60 rounded-full shadow-sm text-sm font-medium text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                Trusted by 10,000+ healthcare professionals
              </div>

              <h1 className="hh-display fade-up-2 text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Your health.<br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                    Real answers.
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q75,0 150,8 Q225,16 300,8" stroke="url(#underline-grad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="underline-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563eb"/>
                        <stop offset="100%" stopColor="#7c3aed"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="fade-up-3 text-lg text-slate-600 max-w-lg leading-relaxed">
                Connect with verified doctors and a supportive community. Ask questions, share experiences, and take control of your health journey — all in one place.
              </p>

              <div className="fade-up-4 flex flex-wrap gap-4">
                <Link to="/signup"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-[1.02]">
                  Join for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features"
                  className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/80 text-slate-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-white hover:border-slate-300 transition-all">
                  See how it works
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              <div className="fade-up-4 flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {['100% Free', 'HIPAA Compliant', 'No credit card'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right floating UI mockup */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-3xl blur-2xl" />

              <div className="relative space-y-4 w-full max-w-sm">
                {/* Doctor reply card */}
                <div className="float-1 bg-white rounded-2xl p-4 shadow-xl shadow-slate-900/8 border border-white/80">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">DR</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">Dr. Rebecca Hart</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">Verified</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">Based on your symptoms, I'd recommend scheduling a blood panel. The fatigue and joint pain combination warrants a closer look.</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>2 min ago</span>
                        <span>• Cardiology</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats mini card */}
                <div className="float-2 ml-auto bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-xl shadow-blue-500/25 w-56">
                  <p className="text-xs font-medium text-blue-200 mb-3">Today's activity</p>
                  <div className="space-y-2.5">
                    {[['New discussions','142'],['Replies posted','831'],['Doctors online','47']].map(([l,v]) => (
                      <div key={l} className="flex justify-between items-center">
                        <span className="text-xs text-blue-200">{l}</span>
                        <span className="text-sm font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification card */}
                <div className="float-3 bg-white rounded-2xl p-3.5 shadow-xl shadow-slate-900/8 border border-white/80 flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Dr. Mark liked your post</p>
                    <p className="text-xs text-slate-400">Just now • Mental Health</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── STATS BAND ──────────────── */}
      <section className="py-10 px-6 bg-white/60 backdrop-blur-sm border-y border-white/80">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-blue-500" />
                <span className="hh-display text-3xl font-extrabold text-slate-900">{value}</span>
              </div>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 border border-blue-200/60 rounded-full text-sm font-medium text-blue-700 mb-5 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> Features
            </div>
            <h2 className="hh-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Everything you need<br className="hidden sm:block" /> for better health
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Built for patients and professionals alike — no fluff, just the tools that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, gradient, title, desc }) => (
              <div key={title} className="card-hover bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl p-7 shadow-md shadow-slate-900/4 group">
                <div className={`w-13 h-13 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                     style={{ width: 52, height: 52 }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="hh-display text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="hh-display text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Up and running in minutes</h2>
            <p className="text-slate-500 text-lg">Three steps between you and real health guidance.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%-10px)] right-[calc(16.67%-10px)] h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            {[
              { step:'01', title:'Create your account',       desc:'Sign up free in under 30 seconds. No credit card, no friction.',          color:'bg-blue-600' },
              { step:'02', title:'Post your question',         desc:'Share your symptoms, concerns, or experiences with the community.',         color:'bg-indigo-600' },
              { step:'03', title:'Get expert answers',         desc:'Verified doctors and community members respond in real time.',             color:'bg-violet-600' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="text-center relative">
                <div className={`w-18 h-18 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}
                     style={{ width: 60, height: 60 }}>
                  <span className="hh-display text-xl font-extrabold text-white">{step}</span>
                </div>
                <h3 className="hh-display font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="hh-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Loved by the community
            </h2>
            <p className="text-slate-500 text-lg">Real people. Real outcomes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, rating, text }) => (
              <div key={name} className="card-hover bg-white/80 backdrop-blur-sm border border-white/80 rounded-2xl p-7 shadow-md shadow-slate-900/4">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── CTA ──────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-blue-900/25">
            {/* Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h2 className="hh-display text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                Ready to start your<br />health journey?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of patients and healthcare professionals building a healthier world together.
              </p>
              <Link to="/signup"
                className="group inline-flex items-center gap-2.5 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all">
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-blue-300 text-sm mt-4">No credit card · Free forever · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="py-10 px-6 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="hh-display font-bold text-slate-800 text-sm">Health Hive</span>
          </div>
          <p className="text-slate-400 text-sm">© 2025 Health Hive. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-blue-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}