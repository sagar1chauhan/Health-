import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplet, Flame, Calendar as CalIcon, ChevronRight } from 'lucide-react';
import { PageWrapper, itemVariant, staggerContainer } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock Data for charts
const healthData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 68 },
  { name: 'Wed', score: 74 },
  { name: 'Thu', score: 72 },
  { name: 'Fri', score: 85 },
  { name: 'Sat', score: 82 },
  { name: 'Sun', score: 88 },
];

const stats = [
  { label: 'Heart Rate', value: '72 bpm', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  { label: 'Blood Pressure', value: '120/80', icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Calories', value: '2,400', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { label: 'Sleep Score', value: '85%', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

export default function PatientDashboard() {
  const [score, setScore] = useState(0);

  // Animate score count up
  useEffect(() => {
    let current = 0;
    const target = 88;
    const step = target / 50;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setScore(target);
        clearInterval(timer);
      } else {
        setScore(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageWrapper>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
        
        {/* Welcome & Overall Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariant} className="lg:col-span-2">
            <GlassCard className="h-full relative overflow-hidden flex flex-col justify-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
              <h2 className="text-3xl font-bold text-white mb-2">Hello, John! 👋</h2>
              <p className="text-slate-400 max-w-md">Your overall health is improving. Keep following your AI-generated recommendations to reach your optimal wellness.</p>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-dark-bg/60 transition-colors cursor-default">
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="text-white font-bold text-lg">{stat.value}</span>
                    <span className="text-xs text-slate-400 mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariant}>
            <GlassCard className="h-full flex flex-col items-center justify-center text-center py-10">
              <h3 className="text-lg font-medium text-slate-300 mb-6">Overall Health Score</h3>
              
              {/* Circular Animated Progress */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-dark-border" />
                  <motion.circle 
                    cx="96" cy="96" r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88}
                    animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - score / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-bold text-white tracking-tighter">{score}</span>
                  <span className="text-sm text-emerald-400 font-medium">Excellent</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-6">+12% from last month</p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariant} className="lg:col-span-2">
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Health Score Trend</h3>
                <select className="bg-dark-bg border border-dark-border text-slate-300 text-sm rounded-lg px-3 py-1 outline-none focus:border-primary">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariant} className="space-y-6">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-purple-600 text-white rounded-xl p-4 flex items-center justify-between transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <Activity size={20} />
                    <span className="font-medium">Run AI Prediction</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button className="w-full bg-dark-bg hover:bg-dark-border border border-dark-border text-slate-200 rounded-xl p-4 flex items-center justify-between transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <CalIcon size={20} className="text-secondary" />
                    <span className="font-medium">Book Appointment</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Next Appointment</h3>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex flex-col items-center justify-center font-bold">
                  <span className="text-xs">JUN</span>
                  <span className="text-lg leading-none">14</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Dr. Sarah Smith</h4>
                  <p className="text-sm text-slate-400">Cardiologist • 10:00 AM</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

      </motion.div>
    </PageWrapper>
  );
}
