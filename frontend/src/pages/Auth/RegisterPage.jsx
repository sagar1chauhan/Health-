import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import AuthLayout from '../../layouts/AuthLayout';
import GlassCard from '../../components/ui/GlassCard';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'doctor']),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('patient');

  const { register, handleSubmit, formState: { errors }, trigger, setValue } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'patient' }
  });

  const handleNext = async () => {
    const valid = await trigger(['role']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        toast.success('Account created successfully! Please log in.');
        navigate('/auth/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <AuthLayout>
      <GlassCard className="w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join HealthHub+ and take control of your health.</p>
          </div>
          <div className="flex gap-1">
            <div className={`h-2 w-8 rounded-full ${step === 1 ? 'bg-primary' : 'bg-dark-border'}`} />
            <div className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-primary' : 'bg-dark-border'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait" custom={step === 2 ? 1 : -1}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={-1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">I am a...</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => { setSelectedRole('patient'); setValue('role', 'patient'); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${selectedRole === 'patient' ? 'border-primary bg-primary/10' : 'border-dark-border bg-dark-bg/50 hover:border-slate-500'}`}
                      >
                        <User size={32} className={selectedRole === 'patient' ? 'text-primary' : 'text-slate-400'} />
                        <span className={`font-medium ${selectedRole === 'patient' ? 'text-white' : 'text-slate-400'}`}>Patient</span>
                      </div>
                      <div 
                        onClick={() => { setSelectedRole('doctor'); setValue('role', 'doctor'); }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${selectedRole === 'doctor' ? 'border-secondary bg-secondary/10' : 'border-dark-border bg-dark-bg/50 hover:border-slate-500'}`}
                      >
                        <Shield size={32} className={selectedRole === 'doctor' ? 'text-secondary' : 'text-slate-400'} />
                        <span className={`font-medium ${selectedRole === 'doctor' ? 'text-white' : 'text-slate-400'}`}>Doctor</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2 backdrop-blur-md border border-white/10"
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        {...register('password')}
                        type="password"
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-dark-border hover:bg-dark-bg/50 transition-colors text-slate-300 flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-secondary to-primary hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 z-10 relative">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
