import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, User, FileText, AlertCircle, Plus, X, Video, Activity, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../../app/api';
import { PageWrapper, itemVariant, staggerContainer } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

export default function AppointmentsPage() {
  const { user } = useSelector(state => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors')
      ]);
      setAppointments(appointmentsRes.data.data);
      setDoctors(doctorsRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load appointments data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await api.post('/appointments', data);
      if (res.data.success) {
        toast.success('Appointment booked successfully!');
        setIsBookingModalOpen(false);
        reset();
        fetchData(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status, type) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      
      if (status === 'confirmed' && type === 'telemedicine') {
        try {
          await api.post('/telemedicine', { appointmentId });
        } catch (teleError) {
          console.error("Telemedicine creation failed:", teleError);
          toast.error("Appointment confirmed, but failed to create meeting link.");
        }
      }

      toast.success(`Appointment ${status} successfully!`);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
          <p className="text-slate-400">Manage your upcoming and past consultations.</p>
        </div>
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Activity className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 bg-dark-bg/50 border border-dark-border rounded-xl">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p>You have no appointments yet.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <motion.div key={apt._id} variants={itemVariant}>
                <GlassCard className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {apt.doctorId?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{apt.doctorId?.name || 'Unknown Doctor'}</h3>
                        <p className="text-sm text-primary capitalize">{apt.type} Consultation</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar size={16} className="text-slate-500" />
                      <span className="text-sm">{new Date(apt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Clock size={16} className="text-slate-500" />
                      <span className="text-sm">{apt.time}</span>
                    </div>
                    {apt.reason && (
                      <div className="flex items-start gap-3 text-slate-300 mt-2">
                        <FileText size={16} className="text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-sm line-clamp-2">{apt.reason}</p>
                      </div>
                    )}
                  </div>

                  {apt.status === 'confirmed' && apt.meetingLink && apt.type === 'telemedicine' && (
                    <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium flex items-center justify-center gap-2 transition-colors border border-primary/20">
                      <Video size={16} /> Join Call
                    </a>
                  )}

                  {user?.role === 'doctor' && apt.status === 'pending' && (
                    <div className="flex gap-2 mt-auto pt-4">
                      <button 
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed', apt.type)}
                        className="flex-1 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium flex justify-center items-center gap-1 transition-colors border border-green-500/20"
                      >
                        <CheckCircle size={16} /> Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(apt._id, 'cancelled', apt.type)}
                        className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium flex justify-center items-center gap-1 transition-colors border border-red-500/20"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-primary" /> Book Appointment
                </h2>
                <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Doctor</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <select {...register('doctorId', { required: 'Doctor is required' })} className="form-select w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 pl-10 pr-4 text-white">
                        <option value="">Choose a specialist...</option>
                        {doctors.map(doc => (
                          <option key={doc.userId?._id} value={doc.userId?._id}>{doc.userId?.name} - {doc.specialization}</option>
                        ))}
                      </select>
                    </div>
                    {errors.doctorId && <span className="text-red-400 text-xs mt-1">{errors.doctorId.message}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={18} className="text-slate-400" />
                        </div>
                        <input type="date" style={{ colorScheme: 'dark' }} {...register('date', { required: 'Date is required' })} className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 pl-10 pr-4 text-white" />
                      </div>
                      {errors.date && <span className="text-red-400 text-xs mt-1">{errors.date.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock size={18} className="text-slate-400" />
                        </div>
                        <input type="time" style={{ colorScheme: 'dark' }} {...register('time', { required: 'Time is required' })} className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 pl-10 pr-4 text-white" />
                      </div>
                      {errors.time && <span className="text-red-400 text-xs mt-1">{errors.time.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Consultation Type</label>
                    <select {...register('type', { required: 'Type is required' })} className="form-select w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white">
                      <option value="telemedicine">Video Call (Telemedicine)</option>
                      <option value="in-person">In-Person Clinic Visit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason for Visit</label>
                    <input type="text" {...register('reason', { required: 'Reason is required' })} placeholder="E.g., Routine checkup, fever..." className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Symptoms (Optional)</label>
                    <textarea {...register('symptoms')} rows="3" placeholder="Briefly describe your symptoms..." className="form-textarea w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white resize-none"></textarea>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-dark-border hover:bg-dark-border/50 text-white font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                      {isSubmitting ? <Activity size={18} className="animate-spin" /> : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
