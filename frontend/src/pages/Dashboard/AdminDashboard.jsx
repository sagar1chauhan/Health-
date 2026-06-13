import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Users, UserCheck, Calendar, Activity, TrendingUp,
  ShieldCheck, Loader2, BarChart3, PieChart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../app/api';
import { PageWrapper, staggerContainer, itemVariant } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <motion.div variants={itemVariant}>
    <GlassCard className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </GlassCard>
  </motion.div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const fetchAll = async () => {
    try {
      const [overviewRes, diseaseRes, usersRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/disease-stats'),
        api.get('/users'),
      ]);
      if (overviewRes.data.success) setAnalytics(overviewRes.data.data);
      if (diseaseRes.data.success) setDiseaseStats(diseaseRes.data.data.map((d) => ({ name: d._id || 'Unknown', value: d.count })));
      if (usersRes.data.success) setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId, isVerified) => {
    try {
      await api.put(`/doctors/${doctorId}/verify`, { isVerified });
      toast.success(isVerified ? 'Doctor verified!' : 'Verification revoked');
      fetchAll();
    } catch {
      toast.error('Failed to update verification');
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

  const doctors = users.filter((u) => u.role === 'doctor');
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  // Mock monthly data for bar chart
  const monthlyData = [
    { month: 'Jan', patients: 12, predictions: 8 },
    { month: 'Feb', patients: 18, predictions: 15 },
    { month: 'Mar', patients: 25, predictions: 22 },
    { month: 'Apr', patients: 30, predictions: 28 },
    { month: 'May', patients: 35, predictions: 32 },
    { month: 'Jun', patients: analytics?.totalPatients || 40, predictions: analytics?.totalPredictions || 35 },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Total Patients" value={analytics?.totalPatients || 0} color="text-blue-400" bgColor="bg-blue-500/20" />
          <StatCard icon={UserCheck} label="Total Doctors" value={analytics?.totalDoctors || 0} color="text-emerald-400" bgColor="bg-emerald-500/20" />
          <StatCard icon={Calendar} label="Total Appointments" value={analytics?.totalAppointments || 0} color="text-purple-400" bgColor="bg-purple-500/20" />
          <StatCard icon={Activity} label="AI Predictions" value={analytics?.totalPredictions || 0} color="text-pink-400" bgColor="bg-pink-500/20" />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart: Monthly Growth */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" /> Monthly Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="patients" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Pie Chart: Disease Distribution */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-purple-400" /> Disease Distribution
            </h3>
            {diseaseStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie data={diseaseStats} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}>
                    {diseaseStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-500">No prediction data yet</div>
            )}
          </GlassCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Verification */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> Doctor Verification
            </h3>
            {doctors.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No registered doctors yet.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
                {doctors.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                        {doc.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVerifyDoctor(doc._id, true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Recent Users */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Recent Registrations
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                    u.role === 'admin' ? 'bg-red-500/15 text-red-400' :
                    u.role === 'doctor' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>{u.role}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
