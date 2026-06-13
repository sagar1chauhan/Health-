import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import {
  User, Stethoscope, Building2, Award, DollarSign,
  Languages, Save, Loader2, AlertCircle, Plus, X, Clock,
  GraduationCap, FileText, BadgeCheck,
} from 'lucide-react';
import api from '../../app/api';
import { PageWrapper } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';

// ─── Zod Schema ────────────────────────────────────────────────────────
const doctorProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.coerce.number().min(0, 'Cannot be negative').max(60, 'Seems too high').optional().or(z.literal('')),
  hospital: z.string().optional(),
  licenseNumber: z.string().optional(),
  consultationFee: z.coerce.number().min(0, 'Cannot be negative').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  languages: z.string().optional(),
});

export default function DoctorProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const headerRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(doctorProfileSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/doctors/${user._id}`);
        if (res.data.success) {
          const p = res.data.data;
          setProfileData(p);
          reset({
            specialization: p.specialization || '',
            experience: p.experience || '',
            hospital: p.hospital || '',
            licenseNumber: p.licenseNumber || '',
            consultationFee: p.consultationFee || '',
            bio: p.bio || '',
            languages: p.languages?.join(', ') || '',
          });
        }
      } catch {
        console.log('Doctor profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user._id, reset]);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        languages: data.languages ? data.languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
      };
      const res = await api.put('/doctors/profile', payload);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        setProfileData(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto pb-10">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Doctor Profile</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your professional information and availability.</p>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-white font-semibold">Dr. {user?.name || 'Doctor'}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Verification badge + stats */}
          {profileData && (
            <div className="flex flex-wrap gap-3 mt-5">
              <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border ${
                profileData.isVerified
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}>
                <BadgeCheck size={14} />
                {profileData.isVerified ? 'Verified Doctor' : 'Pending Verification'}
              </div>
              {profileData.rating?.average > 0 && (
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium flex items-center gap-2">
                  ⭐ {profileData.rating.average}/5 ({profileData.rating.count} reviews)
                </div>
              )}
              <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium flex items-center gap-2">
                <Stethoscope size={14} /> {profileData.totalConsultations || 0} Consultations
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Professional Information */}
          <GlassCard className="p-6 rounded-2xl">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Stethoscope size={16} className="text-emerald-400" />
              </div>
              Professional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Stethoscope size={15} className="text-blue-400" /> Specialization *
                </label>
                <input {...register('specialization')} placeholder="e.g. Cardiology" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                {errors.specialization && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.specialization.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Award size={15} className="text-blue-400" /> Experience
                </label>
                <input {...register('experience')} type="number" placeholder="e.g. 10" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Building2 size={15} className="text-blue-400" /> Hospital / Clinic
                </label>
                <input {...register('hospital')} placeholder="e.g. City Hospital" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <FileText size={15} className="text-blue-400" /> License Number
                </label>
                <input {...register('licenseNumber')} placeholder="e.g. MED-12345" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <DollarSign size={15} className="text-blue-400" /> Consultation Fee
                </label>
                <input {...register('consultationFee')} type="number" placeholder="e.g. 500" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Languages size={15} className="text-blue-400" /> Languages
                </label>
                <input {...register('languages')} placeholder="e.g. English, Hindi" className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                <p className="text-xs text-slate-500">Separate with commas</p>
              </div>
            </div>
          </GlassCard>

          {/* Bio */}
          <GlassCard className="p-6 rounded-2xl">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <User size={16} className="text-purple-400" />
              </div>
              About Me
            </h3>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Write a short bio about your medical practice, expertise, and approach to patient care..."
              className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
            />
            {errors.bio && <p className="text-red-400 text-xs mt-1"><AlertCircle size={12} className="inline mr-1" />{errors.bio.message}</p>}
          </GlassCard>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !isDirty} className="btn-primary flex items-center gap-2.5 px-8 py-3 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
