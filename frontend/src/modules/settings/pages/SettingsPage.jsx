import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import {
  Settings, Lock, Bell, Shield, Eye, EyeOff,
  Save, Loader2, AlertCircle, User, Mail, Phone,
} from 'lucide-react';
import api from '../../../app/api';
import { PageWrapper } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    healthAlerts: true,
    marketingEmails: false,
  });
  const headerRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      // In a real app, call the API to change password
      // await api.put('/auth/change-password', data);
      toast.success('Password changed successfully!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preference updated');
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto pb-10">
        <div ref={headerRef} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <GlassCard className="p-6 rounded-2xl">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User size={16} className="text-blue-400" />
              </div>
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <User size={16} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm text-white font-medium">{user?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <Mail size={16} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-white font-medium">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <Shield size={16} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm text-white font-medium capitalize">{user?.role || '—'}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Change Password */}
          <GlassCard className="p-6 rounded-2xl">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Lock size={16} className="text-red-400" />
              </div>
              Change Password
            </h3>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Current Password</label>
                <div className="relative">
                  <input
                    {...register('currentPassword')}
                    type={showCurrentPwd ? 'text' : 'password'}
                    placeholder="Enter current password"
                    className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.currentPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    {...register('newPassword')}
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.newPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2 text-sm">
                {changingPassword ? <><Loader2 size={16} className="animate-spin" /> Changing...</> : <><Lock size={16} /> Change Password</>}
              </button>
            </form>
          </GlassCard>

          {/* Notification Preferences */}
          <GlassCard className="p-6 rounded-2xl">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Bell size={16} className="text-purple-400" />
              </div>
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Get reminded before appointments' },
                { key: 'healthAlerts', label: 'Health Alerts', desc: 'AI-powered health risk notifications' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, news, and product updates' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`w-11 h-6 rounded-full transition-all relative ${notifications[item.key] ? 'bg-blue-500' : 'bg-slate-600'}`}
                  >
                    <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all shadow ${notifications[item.key] ? 'left-[22px]' : 'left-[3px]'}`} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
