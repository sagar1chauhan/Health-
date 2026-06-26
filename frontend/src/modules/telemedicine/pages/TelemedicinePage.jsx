import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Video, VideoOff, Clock, User, Loader2, ExternalLink,
  Phone, Calendar, CheckCircle, XCircle, AlertCircle, Plus, X, Activity, FileText, Settings
} from 'lucide-react';
import api from '../../../app/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { PageWrapper, staggerContainer, itemVariant } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

const statusConfig = {
  scheduled: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20', icon: Clock },
  ongoing: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', icon: Video },
  completed: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/20', icon: CheckCircle },
  cancelled: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20', icon: XCircle },
};

export default function TelemedicinePage() {
  const { user } = useSelector(state => state.auth);
  const isDoctor = user?.role === 'doctor';
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Manage Session State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [manageForm, setManageForm] = useState({ status: 'completed', doctorNotes: '', prescription: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const headerRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/telemedicine');
      if (res.data.success) setSessions(res.data.data);
    } catch {
      console.log('No telemedicine sessions found.');
    } finally {
      setLoading(false);
    }
  };

  const openManageModal = (session) => {
    setSelectedSession(session);
    setManageForm({
      status: session.status === 'scheduled' ? 'ongoing' : 'completed',
      doctorNotes: session.doctorNotes || '',
      prescription: session.prescription ? session.prescription.join(', ') : ''
    });
    setIsManageModalOpen(true);
  };

  const handleManageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      setIsUpdating(true);
      const payload = {
        status: manageForm.status,
        doctorNotes: manageForm.doctorNotes,
        prescription: manageForm.prescription.split(',').map(p => p.trim()).filter(Boolean)
      };
      
      const res = await api.put(`/telemedicine/${selectedSession._id}`, payload);
      if (res.data.success) {
        toast.success('Session updated successfully!');
        setIsManageModalOpen(false);
        fetchSessions();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update session');
    } finally {
      setIsUpdating(false);
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

  const upcoming = sessions.filter((s) => s.status === 'scheduled' || s.status === 'ongoing');
  const past = sessions.filter((s) => s.status === 'completed' || s.status === 'cancelled');

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Telemedicine</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your virtual consultations</p>
        </div>

        {/* Upcoming Sessions */}
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Video size={18} className="text-blue-400" /> Upcoming Sessions
        </h2>

        {upcoming.length === 0 ? (
          <GlassCard className="text-center py-12 mb-8">
            <VideoOff size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No upcoming telemedicine sessions.</p>
            <p className="text-slate-500 text-sm mt-1">Sessions will appear here when you book a telemedicine appointment.</p>
          </GlassCard>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {upcoming.map((session) => {
              const config = statusConfig[session.status];
              const StatusIcon = config.icon;
              return (
                <motion.div key={session._id} variants={itemVariant}>
                  <GlassCard className="p-5 rounded-2xl hover:border-blue-500/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(session.doctorId?.name || session.patientId?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {session.doctorId?.name ? `Dr. ${session.doctorId.name}` : session.patientId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {session.appointmentId?.date
                              ? new Date(session.appointmentId.date).toLocaleDateString()
                              : 'N/A'}{' '}
                            at {session.appointmentId?.time || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.bg} ${config.color} border ${config.border}`}>
                        <StatusIcon size={12} /> {session.status}
                      </span>
                    </div>
                    {session.meetingLink && session.status !== 'completed' && session.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl"
                        >
                          <Video size={16} /> Join Meeting <ExternalLink size={14} />
                        </a>
                        {isDoctor && (
                          <button
                            onClick={() => openManageModal(session)}
                            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center justify-center gap-2"
                            title="Manage Session"
                          >
                            <Settings size={16} /> Manage
                          </button>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Past Sessions */}
        {past.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> Past Sessions
            </h2>
            <div className="space-y-3">
              {past.map((session) => {
                const config = statusConfig[session.status];
                return (
                  <div key={session._id} className="glass-card p-4 rounded-xl flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {(session.doctorId?.name || session.patientId?.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {session.doctorId?.name ? `Dr. ${session.doctorId.name}` : session.patientId?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${config.bg} ${config.color} border ${config.border}`}>
                      {session.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Manage Session Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsManageModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="text-primary" /> Manage Session
              </h2>
              <button onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleManageSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Session Status</label>
                  <select 
                    value={manageForm.status} 
                    onChange={e => setManageForm({...manageForm, status: e.target.value})}
                    className="form-select w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <FileText size={16} /> Clinical Notes
                  </label>
                  <textarea 
                    value={manageForm.doctorNotes}
                    onChange={e => setManageForm({...manageForm, doctorNotes: e.target.value})}
                    rows="4" 
                    placeholder="Enter clinical notes from the consultation..." 
                    className="form-textarea w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Plus size={16} /> Prescription (Comma separated)
                  </label>
                  <input 
                    type="text" 
                    value={manageForm.prescription}
                    onChange={e => setManageForm({...manageForm, prescription: e.target.value})}
                    placeholder="E.g., Paracetamol 500mg, Amoxicillin..." 
                    className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white" 
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsManageModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-dark-border hover:bg-dark-border/50 text-white font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                    {isUpdating ? <Activity size={18} className="animate-spin" /> : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
