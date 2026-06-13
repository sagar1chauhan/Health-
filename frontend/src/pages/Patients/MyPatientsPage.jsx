import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Users, Search, Activity, Heart, Loader2,
  ChevronRight, AlertTriangle, Shield, User,
} from 'lucide-react';
import api from '../../app/api';
import { PageWrapper, staggerContainer, itemVariant } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';

const riskColors = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  moderate: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  high: 'bg-red-500/15 text-red-400 border-red-500/20',
};

export default function MyPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const fetchPatients = async () => {
    try {
      // Fetch appointments to get the list of patients the doctor has seen
      const res = await api.get('/appointments');
      if (res.data.success) {
        // Extract unique patients from appointments
        const patientMap = new Map();
        (res.data.data || []).forEach((apt) => {
          if (apt.patientId && !patientMap.has(apt.patientId._id)) {
            patientMap.set(apt.patientId._id, {
              _id: apt.patientId._id,
              name: apt.patientId.name || 'Unknown',
              email: apt.patientId.email,
              lastAppointment: apt.date,
              appointmentCount: 1,
              status: apt.status,
            });
          } else if (apt.patientId && patientMap.has(apt.patientId._id)) {
            const existing = patientMap.get(apt.patientId._id);
            existing.appointmentCount += 1;
          }
        });
        setPatients(Array.from(patientMap.values()));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetail = async (patientId) => {
    setDetailLoading(true);
    setSelectedPatient(patientId);
    try {
      const res = await api.get(`/patients/${patientId}`);
      if (res.data.success) setPatientDetail(res.data.data);
    } catch {
      setPatientDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Patients</h1>
            <p className="text-slate-400 text-sm mt-1">{patients.length} patient{patients.length !== 1 && 's'} in your care</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full bg-slate-800/60 text-sm text-white border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Users size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">No patients found</p>
              </GlassCard>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
                {filtered.map((patient) => (
                  <motion.div key={patient._id} variants={itemVariant}>
                    <button
                      onClick={() => fetchPatientDetail(patient._id)}
                      className={`w-full glass-card p-4 rounded-xl flex items-center gap-3 text-left transition-all hover:border-blue-500/30 ${
                        selectedPatient === patient._id ? 'border-blue-500/50 bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.appointmentCount} visit{patient.appointmentCount > 1 && 's'}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Patient Detail */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <GlassCard className="text-center py-20">
                <User size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400 text-lg font-medium">Select a Patient</p>
                <p className="text-slate-500 text-sm mt-1">Click on a patient to view their health profile and AI predictions.</p>
              </GlassCard>
            ) : detailLoading ? (
              <GlassCard className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-blue-400" />
              </GlassCard>
            ) : patientDetail ? (
              <div className="space-y-4">
                {/* Patient Info Card */}
                <GlassCard className="p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-400" /> Patient Profile
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Age', value: patientDetail.age || '—' },
                      { label: 'Gender', value: patientDetail.gender || '—' },
                      { label: 'BMI', value: patientDetail.bmi || '—' },
                      { label: 'Blood Group', value: patientDetail.bloodGroup || '—' },
                      { label: 'Heart Rate', value: patientDetail.heartRate ? `${patientDetail.heartRate} bpm` : '—' },
                      { label: 'Blood Pressure', value: patientDetail.bloodPressure?.systolic ? `${patientDetail.bloodPressure.systolic}/${patientDetail.bloodPressure.diastolic}` : '—' },
                      { label: 'Glucose', value: patientDetail.glucoseLevel ? `${patientDetail.glucoseLevel} mg/dL` : '—' },
                      { label: 'Smoking', value: patientDetail.smokingStatus || '—' },
                      { label: 'Activity', value: patientDetail.physicalActivity || '—' },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-800/40 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="text-sm text-white font-medium capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Health Risk */}
                {patientDetail.healthRiskScore?.level && (
                  <GlassCard className="p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-purple-400" /> AI Risk Assessment
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${riskColors[patientDetail.healthRiskScore.level] || ''}`}>
                      {patientDetail.healthRiskScore.level === 'high' && <AlertTriangle size={16} />}
                      Risk Level: {patientDetail.healthRiskScore.level.toUpperCase()}
                      {patientDetail.healthRiskScore.score && ` (Score: ${patientDetail.healthRiskScore.score})`}
                    </div>
                  </GlassCard>
                )}

                {/* Allergies */}
                {patientDetail.allergies?.length > 0 && (
                  <GlassCard className="p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-3">⚠️ Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientDetail.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1 text-xs rounded-full bg-red-500/15 text-red-400 border border-red-500/20">{a}</span>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="text-center py-20">
                <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
                <p className="text-slate-400">Could not load patient profile.</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
