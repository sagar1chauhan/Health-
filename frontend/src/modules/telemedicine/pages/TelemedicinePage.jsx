import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Video, VideoOff, Clock, User, Loader2, ExternalLink,
  Phone, Calendar, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import api from '../../../app/api';
import { PageWrapper, staggerContainer, itemVariant } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

const statusConfig = {
  scheduled: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20', icon: Clock },
  ongoing: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', icon: Video },
  completed: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/20', icon: CheckCircle },
  cancelled: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20', icon: XCircle },
};

export default function TelemedicinePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
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
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl"
                      >
                        <Video size={16} /> Join Meeting <ExternalLink size={14} />
                      </a>
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
    </PageWrapper>
  );
}
