import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Stethoscope, Users, ChevronRight, ChevronLeft, CheckCircle, Activity } from 'lucide-react';

const TOTAL_STEPS = 5;
const stepLabels = ['Account Type', 'Basic Info', 'Personal Details', 'Professional', 'Review'];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: 'user', firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phone: '', city: '', country: '', specialization: '', agreeToTerms: false, agreeToPrivacy: false,
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validateStep = () => {
    setError('');
    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName) return setError('Name is required'), false;
      if (!formData.email) return setError('Email is required'), false;
      if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters'), false;
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
    }
    if (currentStep === 5) {
      if (!formData.agreeToTerms || !formData.agreeToPrivacy) return setError('Please agree to the terms and privacy policy'), false;
    }
    return true;
  };

  const next = () => { if (validateStep()) setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const prev = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      // Map "user" → "regular" for the server
      await signup({ ...formData, role: formData.role === 'user' ? 'regular' : formData.role });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create your Health Hive Account</CardTitle>
          <CardDescription>Step {currentStep} of {TOTAL_STEPS}: {stepLabels[currentStep - 1]}</CardDescription>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="mt-4" />
        </CardHeader>
        <CardContent className="pb-8 space-y-6">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-slate-600 text-center">I am joining as a:</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ value: 'user', label: 'Regular User', icon: <Users className="w-8 h-8" />, desc: 'Patient or health enthusiast' },
                  { value: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-8 h-8" />, desc: 'Medical professional' }
                ].map(opt => (
                  <button key={opt.value} onClick={() => update('role', opt.value)}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${formData.role === opt.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}>
                    {opt.icon}
                    <div className="text-center">
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                    </div>
                    {formData.role === opt.value && <Badge className="bg-blue-600">Selected</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['firstName','First Name','John'], ['lastName','Last Name','Doe']].map(([field, label, ph]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Input placeholder={ph} value={formData[field]} onChange={e => update(field, e.target.value)} className="h-11" />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="Min. 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="h-11" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input placeholder="+1 555 000 0000" value={formData.phone} onChange={e => update('phone', e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>City (optional)</Label>
                <Input placeholder="New York" value={formData.city} onChange={e => update('city', e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Country (optional)</Label>
                <Input placeholder="United States" value={formData.country} onChange={e => update('country', e.target.value)} className="h-11" />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            formData.role === 'doctor' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Select value={formData.specialization} onValueChange={v => update('specialization', v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select specialization" /></SelectTrigger>
                    <SelectContent>
                      {['General Medicine','Cardiology','Dermatology','Neurology','Oncology','Orthopedics','Pediatrics','Psychiatry','Surgery','Other'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No professional details required for regular users.</p>
              </div>
            )
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <p className="font-semibold text-slate-700 mb-2">Account Summary</p>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span>Name:</span><span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  <span>Email:</span><span className="font-medium">{formData.email}</span>
                  <span>Role:</span><span className="font-medium capitalize">{formData.role}</span>
                  {formData.specialization && <><span>Specialization:</span><span className="font-medium">{formData.specialization}</span></>}
                </div>
              </div>
              {[{ field:'agreeToTerms', label:'I agree to the Terms of Service' }, { field:'agreeToPrivacy', label:'I agree to the Privacy Policy' }].map(({ field, label }) => (
                <div key={field} className="flex items-center gap-3">
                  <Checkbox id={field} checked={formData[field]} onCheckedChange={v => update(field, v)} />
                  <Label htmlFor={field} className="cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {currentStep > 1
              ? <Button variant="outline" onClick={prev} className="gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
              : <Link to="/login"><Button variant="ghost">Already have an account?</Button></Link>}
            {currentStep < TOTAL_STEPS
              ? <Button onClick={next} className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600">Next <ChevronRight className="w-4 h-4" /></Button>
              : <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-linear-to-r from-blue-600 to-indigo-600">{loading ? 'Creating...' : <><CheckCircle className="w-4 h-4" /> Create Account</>}</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
