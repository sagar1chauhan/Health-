import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../../features/auth/authSlice';
import AuthLayout from '../../layouts/AuthLayout';
import GlassCard from '../../components/ui/GlassCard';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(login(data));
      if (login.fulfilled.match(resultAction)) {
        toast.success('Welcome back to HealthHub+');
        navigate('/dashboard');
      } else {
        toast.error(resultAction.payload || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <AuthLayout>
      <GlassCard className="w-full p-8 relative overflow-hidden">
        {/* Subtle shine effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to access your personalized health dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:text-blue-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
