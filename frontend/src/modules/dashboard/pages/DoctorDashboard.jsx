import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, Clock, TrendingUp, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../../app/api';
import { PageWrapper, itemVariant, staggerContainer } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

export default function DoctorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch upcoming appointments
      const res = await api.get('/appointments');
      setAppointments(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending');
  const todayAppointments = upcomingAppointments.filter(apt => {
    const aptDate = new Date(apt.date).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  });

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, Dr. {user?.name?.split(' ')[0] || 'Doctor'}</h1>
        <p className="text-slate-400">Here's an overview of your practice today.</p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariant}>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Patients</p>
              <p className="text-2xl font-bold text-white">124</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl text-accent">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Today's Appointments</p>
              <p className="text-2xl font-bold text-white">{todayAppointments.length}</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Consultations Done</p>
              <p className="text-2xl font-bold text-white">45</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Rating</p>
              <p className="text-2xl font-bold text-white">4.9/5</p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
              <button className="text-sm text-primary hover:text-white transition-colors">View All</button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Activity className="animate-spin text-primary" size={32} />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 5).map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-4 rounded-xl bg-dark-bg border border-dark-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {apt.patientId?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{apt.patientId?.name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-slate-400 capitalize">{apt.type} Consultation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-white mb-1 justify-end">
                        <Clock size={14} className="text-primary" /> {apt.time}
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div>
          <GlassCard className="h-full">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="relative border-l border-dark-border ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-dark-card" />
                <p className="text-sm text-slate-300">New appointment booked by <span className="text-white font-medium">John Doe</span></p>
                <p className="text-xs text-slate-500 mt-1">10 mins ago</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-green-400 rounded-full -left-[6.5px] top-1.5 ring-4 ring-dark-card" />
                <p className="text-sm text-slate-300">Completed consultation with <span className="text-white font-medium">Sarah Smith</span></p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-accent rounded-full -left-[6.5px] top-1.5 ring-4 ring-dark-card" />
                <p className="text-sm text-slate-300">Updated profile information</p>
                <p className="text-xs text-slate-500 mt-1">Yesterday</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
