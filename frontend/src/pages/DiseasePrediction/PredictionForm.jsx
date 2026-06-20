import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import gsap from 'gsap';
import { ArrowRight, ArrowLeft, Activity, Heart, Info, Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { PageWrapper } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';

const steps = [
  { id: 1, title: 'Basic Vitals', description: 'Enter your physical measurements' },
  { id: 2, title: 'Blood Work', description: 'Recent lab results' },
  { id: 3, title: 'Lifestyle', description: 'Daily habits and history' },
];

// ─── Map profile lifestyle strings to numeric values for the ML model ───
const smokingMap = { never: '0', former: '0', current: '1' };
const activityMap = { sedentary: '0', light: '1', moderate: '2', active: '3', very_active: '3' };
const alcoholMap = { none: '0', occasional: '0', moderate: '1', heavy: '1' };

export default function PredictionForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const bannerRef = useRef(null);

  const { register, handleSubmit, reset, trigger, formState: { errors } } = useForm({
    defaultValues: {
      age: '',
      gender: '1',
      bmi: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      glucoseLevel: '',
      cholesterolTotal: '',
      cholesterolHDL: '',
      smoking: '0',
      alcohol: '0',
      physicalActivity: '2',
      familyHistory: '0',
      stressLevel: '3'
    }
  });

  // ─── Fetch patient profile and auto-fill ──────────────────────────
  useEffect(() => {
    const fetchProfileAndFill = async () => {
      try {
        const res = await api.get('/patients/profile');
        if (res.data.success) {
          const p = res.data.data;
          const missing = [];

          // Check which critical fields are missing
          if (!p.age) missing.push('Age');
          if (!p.bmi && !(p.height && p.weight)) missing.push('BMI');
          if (!p.bloodPressure?.systolic) missing.push('Blood Pressure');
          if (!p.glucoseLevel) missing.push('Glucose Level');

          setMissingFields(missing);

          // Calculate BMI if not available but height/weight exist
          let bmiValue = p.bmi;
          if (!bmiValue && p.height && p.weight) {
            const heightM = p.height / 100;
            bmiValue = parseFloat((p.weight / (heightM * heightM)).toFixed(1));
          }

          // Map gender string to numeric
          const genderMap = { male: '1', female: '0', other: '1' };

          // Check family history — true if any condition is true
          const hasFamilyHistory =
            p.familyHistory?.diabetes ||
            p.familyHistory?.heartDisease ||
            p.familyHistory?.hypertension ||
            p.familyHistory?.stroke
              ? '1'
              : '0';

          // Reset form with profile data
          reset({
            age: p.age || '',
            gender: genderMap[p.gender] ?? '1',
            bmi: bmiValue || '',
            bloodPressureSystolic: p.bloodPressure?.systolic || '',
            bloodPressureDiastolic: p.bloodPressure?.diastolic || '',
            glucoseLevel: p.glucoseLevel || '',
            cholesterolTotal: p.cholesterol?.total || '',
            cholesterolHDL: p.cholesterol?.hdl || '',
            smoking: smokingMap[p.smokingStatus] ?? '0',
            alcohol: alcoholMap[p.alcoholConsumption] ?? '0',
            physicalActivity: activityMap[p.physicalActivity] ?? '2',
            familyHistory: hasFamilyHistory,
            stressLevel: String(p.stressLevel || 3),
          });

          setProfileLoaded(true);
        }
      } catch (error) {
        // Profile not found — use empty defaults; patient fills manually
        console.log('Patient profile not found, using empty defaults.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfileAndFill();
  }, [reset]);

  // ─── GSAP banner animation ────────────────────────────────────────
  useEffect(() => {
    if (bannerRef.current && !profileLoading) {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: -15, scaleY: 0.8 },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.5, ease: 'back.out(1.4)' }
      );
    }
  }, [profileLoading, profileLoaded]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await api.post('/predictions/predict', data);
      
      if (res.data.success) {
        navigate('/dashboard/prediction/results', { state: { prediction: res.data.data } });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to analyze risk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['age', 'gender', 'bmi'];
    if (currentStep === 2) fieldsToValidate = ['bloodPressureSystolic', 'bloodPressureDiastolic', 'glucoseLevel', 'cholesterolTotal', 'cholesterolHDL'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  // ─── Loading state ────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 size={36} className="animate-spin text-blue-400" />
          <p className="text-slate-400 text-sm">Loading your health profile...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            AI Disease Prediction
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our advanced ensemble models analyze your unique health profile using XGBoost and Deep Learning to identify potential health risks before they become emergencies.
          </p>
        </div>

        {/* ── Auto-fill status banner ─────────────────────────────── */}
        <div ref={bannerRef} className="mb-6">
          {profileLoaded && missingFields.length === 0 && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
              <UserCheck size={18} className="shrink-0" />
              <span>
                <strong>Auto-filled from your profile!</strong> All fields have been pre-populated. Review and modify if needed before analyzing.
              </span>
            </div>
          )}
          {profileLoaded && missingFields.length > 0 && (
            <div className="flex items-start gap-3 px-5 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>
                <strong>Partially auto-filled.</strong> The following fields are missing from your profile: <strong>{missingFields.join(', ')}</strong>. Please fill them manually or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/profile')}
                  className="underline hover:text-amber-200 transition-colors"
                >
                  update your profile
                </button>.
              </span>
            </div>
          )}
          {!profileLoaded && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
              <Info size={18} className="shrink-0" />
              <span>
                No profile found. Please fill in the fields manually, or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/profile')}
                  className="underline hover:text-blue-200 transition-colors"
                >
                  create your profile first
                </button>{' '}
                for auto-fill on next visit.
              </span>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-dark-border -z-10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-accent -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-dark-bg transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'bg-dark-card text-slate-500'
                  }`}
                >
                  {step.id}
                </div>
                <span className={`mt-3 text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <GlassCard className="relative overflow-hidden p-8">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="min-h-[350px] relative">
              <div className="relative">
                
                {/* STEP 1 */}
                <div className={`space-y-6 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <Activity size={24} />
                    <h3 className="text-xl font-semibold text-white">Physical Measurements</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Age</label>
                      <input {...register('age', { required: 'Age is required', min: { value: 1, message: 'Age must be at least 1' }, max: { value: 150, message: 'Age seems invalid' } })} type="number" placeholder="e.g. 28" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Gender</label>
                      <select {...register('gender')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">BMI (Body Mass Index)</label>
                      <input {...register('bmi', { required: 'BMI is required', min: { value: 10, message: 'BMI seems too low' }, max: { value: 70, message: 'BMI seems too high' } })} type="number" step="0.1" placeholder="e.g. 24.5" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.bmi && <p className="text-red-400 text-xs mt-1">{errors.bmi.message}</p>}
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className={`space-y-6 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-6 text-red-400">
                    <Heart size={24} />
                    <h3 className="text-xl font-semibold text-white">Cardiovascular & Blood</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Systolic Blood Pressure</label>
                      <input {...register('bloodPressureSystolic', { required: 'Systolic BP is required', min: { value: 50, message: 'Must be at least 50 mmHg' } })} type="number" placeholder="e.g. 120" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.bloodPressureSystolic && <p className="text-red-400 text-xs mt-1">{errors.bloodPressureSystolic.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Diastolic Blood Pressure</label>
                      <input {...register('bloodPressureDiastolic', { required: 'Diastolic BP is required', min: { value: 30, message: 'Must be at least 30 mmHg' } })} type="number" placeholder="e.g. 80" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.bloodPressureDiastolic && <p className="text-red-400 text-xs mt-1">{errors.bloodPressureDiastolic.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Fasting Glucose Level</label>
                      <input {...register('glucoseLevel', { required: 'Glucose level is required', min: { value: 20, message: 'Must be at least 20 mg/dL' } })} type="number" placeholder="e.g. 95" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.glucoseLevel && <p className="text-red-400 text-xs mt-1">{errors.glucoseLevel.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Total Cholesterol</label>
                      <input {...register('cholesterolTotal', { required: 'Total Cholesterol is required', min: { value: 50, message: 'Must be at least 50 mg/dL' } })} type="number" placeholder="e.g. 190" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.cholesterolTotal && <p className="text-red-400 text-xs mt-1">{errors.cholesterolTotal.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">HDL Cholesterol</label>
                      <input {...register('cholesterolHDL', { required: 'HDL is required', min: { value: 10, message: 'Must be at least 10 mg/dL' } })} type="number" placeholder="e.g. 50" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      {errors.cholesterolHDL && <p className="text-red-400 text-xs mt-1">{errors.cholesterolHDL.message}</p>}
                    </div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className={`space-y-6 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-6 text-accent">
                    <Info size={24} />
                    <h3 className="text-xl font-semibold text-white">Lifestyle & History</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Smoking Habit</label>
                      <select {...register('smoking')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                        <option value="0">Never / Former</option>
                        <option value="1">Current Smoker</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Alcohol Consumption</label>
                      <select {...register('alcohol')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                        <option value="0">None / Occasional</option>
                        <option value="1">Moderate / Heavy</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Physical Activity</label>
                      <select {...register('physicalActivity')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                        <option value="0">None</option>
                        <option value="1">Low</option>
                        <option value="2">Moderate</option>
                        <option value="3">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Family History of Disease</label>
                      <select {...register('familyHistory')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Stress Level (1-5)</label>
                      <input {...register('stressLevel')} type="range" min="1" max="5" className="w-full accent-primary mt-3" />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Low</span><span>Moderate</span><span>High</span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-dark-border/50">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 rounded-xl border border-dark-border font-medium flex items-center gap-2 transition-all hover:bg-white/5 text-white ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeft size={18} /> Back
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-purple-600 text-white font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/20"
                >
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary hover:from-emerald-500 hover:to-blue-500 text-white font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-70 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Activity size={18} /> Analyze Health Risk</>}
                </button>
              )}
            </div>
          </form>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}
