import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, Activity, Heart, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { PageWrapper } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';

const steps = [
  { id: 1, title: 'Basic Vitals', description: 'Enter your physical measurements' },
  { id: 2, title: 'Blood Work', description: 'Recent lab results' },
  { id: 3, title: 'Lifestyle', description: 'Daily habits and history' },
];

export default function PredictionForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      age: 45,
      gender: '1',
      bmi: 26.5,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      glucoseLevel: 110,
      cholesterolTotal: 200,
      cholesterolHDL: 50,
      smoking: '0',
      alcohol: '0',
      physicalActivity: '2',
      familyHistory: '0',
      stressLevel: '3'
    }
  });

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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

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
              <AnimatePresence mode="wait">
                
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <Activity size={24} />
                      <h3 className="text-xl font-semibold text-white">Physical Measurements</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Age</label>
                        <input {...register('age')} type="number" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
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
                        <input {...register('bmi')} type="number" step="0.1" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div className="flex items-center gap-2 mb-6 text-red-400">
                      <Heart size={24} />
                      <h3 className="text-xl font-semibold text-white">Cardiovascular & Blood</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Systolic Blood Pressure</label>
                        <input {...register('bloodPressureSystolic')} type="number" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Diastolic Blood Pressure</label>
                        <input {...register('bloodPressureDiastolic')} type="number" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Fasting Glucose Level</label>
                        <input {...register('glucoseLevel')} type="number" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Total Cholesterol</label>
                        <input {...register('cholesterolTotal')} type="number" className="form-input w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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
                        <label className="text-sm font-medium text-slate-300">Physical Activity</label>
                        <select {...register('physicalActivity')} className="form-select w-full bg-dark-bg/50 border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-3 px-4 text-white">
                          <option value="0">None</option>
                          <option value="1">Low</option>
                          <option value="2">Moderate</option>
                          <option value="3">High</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Stress Level (1-5)</label>
                        <input {...register('stressLevel')} type="range" min="1" max="5" className="w-full accent-primary mt-3" />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Low</span><span>Moderate</span><span>High</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
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
