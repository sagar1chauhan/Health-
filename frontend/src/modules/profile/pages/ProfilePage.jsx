import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import {
  User, Heart, Activity, Droplets, Scale, Ruler,
  Cigarette, Wine, Dumbbell, Moon, Brain, Save,
  Loader2, AlertCircle, CheckCircle, ChevronDown,
} from 'lucide-react';
import api from '../../../app/api';

// ─── Zod Validation Schema ─────────────────────────────────────────────
const profileSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .min(1, 'Age must be at least 1')
    .max(150, 'Age seems invalid')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', ''], { message: 'Select a gender' }).optional(),
  height: z.coerce
    .number({ invalid_type_error: 'Height must be a number' })
    .min(30, 'Height must be at least 30 cm')
    .max(300, 'Height seems invalid')
    .optional()
    .or(z.literal('')),
  weight: z.coerce
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(1, 'Weight must be at least 1 kg')
    .max(500, 'Weight seems invalid')
    .optional()
    .or(z.literal('')),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], {
    message: 'Select a valid blood group',
  }).optional(),
  bloodPressureSystolic: z.coerce
    .number()
    .min(50, 'Systolic must be at least 50')
    .max(300, 'Systolic seems invalid')
    .optional()
    .or(z.literal('')),
  bloodPressureDiastolic: z.coerce
    .number()
    .min(30, 'Diastolic must be at least 30')
    .max(200, 'Diastolic seems invalid')
    .optional()
    .or(z.literal('')),
  glucoseLevel: z.coerce
    .number()
    .min(20, 'Glucose must be at least 20 mg/dL')
    .max(700, 'Glucose seems invalid')
    .optional()
    .or(z.literal('')),
  cholesterolTotal: z.coerce
    .number()
    .min(50, 'Cholesterol must be at least 50')
    .max(600, 'Cholesterol seems invalid')
    .optional()
    .or(z.literal('')),
  heartRate: z.coerce
    .number()
    .min(30, 'Heart rate must be at least 30 bpm')
    .max(250, 'Heart rate seems invalid')
    .optional()
    .or(z.literal('')),
  smokingStatus: z.enum(['never', 'former', 'current', '']).optional(),
  alcoholConsumption: z.enum(['none', 'occasional', 'moderate', 'heavy', '']).optional(),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active', '']).optional(),
  dietType: z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'other', '']).optional(),
  stressLevel: z.coerce.number().min(1).max(5).optional().or(z.literal('')),
  sleepHours: z.coerce.number().min(0).max(24).optional().or(z.literal('')),
});

// ─── Select Input Component ─────────────────────────────────────────────
const SelectField = ({ label, icon: Icon, options, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      {Icon && <Icon size={15} className="text-blue-400" />}
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full bg-slate-800/60 text-sm text-white border rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-slate-700/50 focus:ring-blue-500/40 focus:border-blue-500/50'
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
    {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
  </div>
);

// ─── Text/Number Input Component ────────────────────────────────────────
const InputField = ({ label, icon: Icon, unit, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      {Icon && <Icon size={15} className="text-blue-400" />}
      {label}
    </label>
    <div className="relative">
      <input
        {...props}
        className={`w-full bg-slate-800/60 text-sm text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all placeholder-slate-500 ${
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-slate-700/50 focus:ring-blue-500/40 focus:border-blue-500/50'
        }`}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{unit}</span>
      )}
    </div>
    {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
  </div>
);

// ─── Section Card Component ─────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, delay = 0 }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power3.out' }
      );
    }
  }, [delay]);

  return (
    <div ref={sectionRef} className="glass-card p-6 rounded-2xl">
      <h3 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Icon size={16} className="text-blue-400" />
        </div>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Main Profile Page
// ════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const headerRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
  });

  // ─── Fetch profile on mount ──────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/patients/profile');
        if (res.data.success) {
          const p = res.data.data;
          setProfileData(p);
          reset({
            age: p.age || '',
            gender: p.gender || '',
            height: p.height || '',
            weight: p.weight || '',
            bloodGroup: p.bloodGroup || '',
            bloodPressureSystolic: p.bloodPressure?.systolic || '',
            bloodPressureDiastolic: p.bloodPressure?.diastolic || '',
            glucoseLevel: p.glucoseLevel || '',
            cholesterolTotal: p.cholesterol?.total || '',
            heartRate: p.heartRate || '',
            smokingStatus: p.smokingStatus || '',
            alcoholConsumption: p.alcoholConsumption || '',
            physicalActivity: p.physicalActivity || '',
            dietType: p.dietType || '',
            stressLevel: p.stressLevel || '',
            sleepHours: p.sleepHours || '',
          });
        }
      } catch (error) {
        // Profile may not exist yet — that's OK
        console.log('Profile not found, user can create one.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // ─── Header animation ────────────────────────────────────────────
  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [loading]);

  // ─── Submit handler ──────────────────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Transform flat fields to nested schema structure
      const payload = {
        age: data.age || undefined,
        gender: data.gender || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        bloodGroup: data.bloodGroup || undefined,
        bloodPressure: {
          systolic: data.bloodPressureSystolic || undefined,
          diastolic: data.bloodPressureDiastolic || undefined,
        },
        glucoseLevel: data.glucoseLevel || undefined,
        cholesterol: {
          total: data.cholesterolTotal || undefined,
        },
        heartRate: data.heartRate || undefined,
        smokingStatus: data.smokingStatus || undefined,
        alcoholConsumption: data.alcoholConsumption || undefined,
        physicalActivity: data.physicalActivity || undefined,
        dietType: data.dietType || undefined,
        stressLevel: data.stressLevel || undefined,
        sleepHours: data.sleepHours || undefined,
      };

      const res = await api.put('/patients/profile', payload);
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

  // ─── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div ref={headerRef} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 text-sm mt-1">
              Keep your health information up to date for accurate AI predictions.
            </p>
          </div>
          {/* Avatar card */}
          <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name || 'Patient'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* BMI / Risk score badges */}
        {profileData && (
          <div className="flex flex-wrap gap-3 mt-5">
            {profileData.bmi && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium flex items-center gap-2"
              >
                <Scale size={14} /> BMI: {profileData.bmi}
              </motion.div>
            )}
            {profileData.healthRiskScore?.level && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border ${
                  profileData.healthRiskScore.level === 'low'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : profileData.healthRiskScore.level === 'moderate'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}
              >
                <CheckCircle size={14} /> Risk: {profileData.healthRiskScore.level}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Section title="Personal Information" icon={User} delay={0.1}>
          <InputField
            label="Age"
            icon={User}
            type="number"
            placeholder="e.g. 28"
            unit="years"
            error={errors.age?.message}
            {...register('age')}
          />
          <SelectField
            label="Gender"
            icon={User}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <SelectField
            label="Blood Group"
            icon={Droplets}
            options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
              value: v,
              label: v,
            }))}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
        </Section>

        {/* Body Measurements */}
        <Section title="Body Measurements" icon={Ruler} delay={0.2}>
          <InputField
            label="Height"
            icon={Ruler}
            type="number"
            placeholder="e.g. 175"
            unit="cm"
            error={errors.height?.message}
            {...register('height')}
          />
          <InputField
            label="Weight"
            icon={Scale}
            type="number"
            placeholder="e.g. 72"
            unit="kg"
            error={errors.weight?.message}
            {...register('weight')}
          />
          <InputField
            label="Heart Rate"
            icon={Heart}
            type="number"
            placeholder="e.g. 72"
            unit="bpm"
            error={errors.heartRate?.message}
            {...register('heartRate')}
          />
        </Section>

        {/* Vital Signs */}
        <Section title="Vital Signs" icon={Activity} delay={0.3}>
          <InputField
            label="Blood Pressure (Systolic)"
            icon={Activity}
            type="number"
            placeholder="e.g. 120"
            unit="mmHg"
            error={errors.bloodPressureSystolic?.message}
            {...register('bloodPressureSystolic')}
          />
          <InputField
            label="Blood Pressure (Diastolic)"
            icon={Activity}
            type="number"
            placeholder="e.g. 80"
            unit="mmHg"
            error={errors.bloodPressureDiastolic?.message}
            {...register('bloodPressureDiastolic')}
          />
          <InputField
            label="Glucose Level"
            icon={Droplets}
            type="number"
            placeholder="e.g. 95"
            unit="mg/dL"
            error={errors.glucoseLevel?.message}
            {...register('glucoseLevel')}
          />
          <InputField
            label="Total Cholesterol"
            icon={Heart}
            type="number"
            placeholder="e.g. 190"
            unit="mg/dL"
            error={errors.cholesterolTotal?.message}
            {...register('cholesterolTotal')}
          />
        </Section>

        {/* Lifestyle Factors */}
        <Section title="Lifestyle Factors" icon={Dumbbell} delay={0.4}>
          <SelectField
            label="Smoking Status"
            icon={Cigarette}
            options={[
              { value: 'never', label: 'Never' },
              { value: 'former', label: 'Former Smoker' },
              { value: 'current', label: 'Current Smoker' },
            ]}
            error={errors.smokingStatus?.message}
            {...register('smokingStatus')}
          />
          <SelectField
            label="Alcohol Consumption"
            icon={Wine}
            options={[
              { value: 'none', label: 'None' },
              { value: 'occasional', label: 'Occasional' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'heavy', label: 'Heavy' },
            ]}
            error={errors.alcoholConsumption?.message}
            {...register('alcoholConsumption')}
          />
          <SelectField
            label="Physical Activity"
            icon={Dumbbell}
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'light', label: 'Light' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'active', label: 'Active' },
              { value: 'very_active', label: 'Very Active' },
            ]}
            error={errors.physicalActivity?.message}
            {...register('physicalActivity')}
          />
          <SelectField
            label="Diet Type"
            icon={Heart}
            options={[
              { value: 'vegetarian', label: 'Vegetarian' },
              { value: 'non_vegetarian', label: 'Non-Vegetarian' },
              { value: 'vegan', label: 'Vegan' },
              { value: 'other', label: 'Other' },
            ]}
            error={errors.dietType?.message}
            {...register('dietType')}
          />
          <InputField
            label="Stress Level"
            icon={Brain}
            type="number"
            placeholder="1 (Low) to 5 (High)"
            error={errors.stressLevel?.message}
            {...register('stressLevel')}
          />
          <InputField
            label="Sleep Hours"
            icon={Moon}
            type="number"
            placeholder="e.g. 7"
            unit="hrs"
            error={errors.sleepHours?.message}
            {...register('sleepHours')}
          />
        </Section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="btn-primary flex items-center gap-2.5 px-8 py-3 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
