import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Users, Search, Activity, Heart, Loader2,
  ChevronRight, AlertTriangle, Shield, User,
  FileText, UploadCloud, Download, X
} from 'lucide-react';
import api from '../../../app/api';
import { PageWrapper, staggerContainer, itemVariant } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

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

  // Medical records state
  const [patientRecords, setPatientRecords] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      const res = await api.get('/appointments');
      if (res.data.success) {
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
      const [res, recordsRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/medical-records?patientId=${patientId}`)
      ]);
      if (res.data.success) setPatientDetail(res.data.data);
      if (recordsRes.data.success) setPatientRecords(recordsRes.data.data);
    } catch {
      setPatientDetail(null);
      setPatientRecords([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const onSubmitRecord = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('type', data.type);
      if (data.description) formData.append('description', data.description);
      formData.append('patientId', selectedPatient);
      formData.append('files', selectedFile);

      const res = await api.post('/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Record uploaded successfully!');
        setIsUploadModalOpen(false);
        reset();
        setSelectedFile(null);
        // Refresh records
        const recordsRes = await api.get(`/medical-records?patientId=${selectedPatient}`);
        if (recordsRes.data.success) setPatientRecords(recordsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to upload record');
    } finally {
      setIsUploading(false);
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
      <div className="max-w-6xl mx-auto pb-10">
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
                <p className="text-slate-500 text-sm mt-1">Click on a patient to view their health profile and records.</p>
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

                {/* Medical Records Section */}
                <GlassCard className="p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText size={18} className="text-blue-400" /> Medical Records
                    </h3>
                    <button onClick={() => setIsUploadModalOpen(true)} className="text-sm bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <UploadCloud size={16} /> Add Record
                    </button>
                  </div>
                  
                  {patientRecords.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No records found for this patient.</p>
                  ) : (
                    <div className="space-y-3">
                      {patientRecords.map(record => (
                        <div key={record._id} className="flex justify-between items-center bg-dark-bg/50 p-3 rounded-xl border border-dark-border">
                          <div>
                            <p className="text-sm font-medium text-white break-words">{record.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(record.date || record.createdAt).toLocaleDateString()} • {record.type.replace('_', ' ')}
                            </p>
                          </div>
                          {record.files && record.files.length > 0 && (
                            <a href={record.files[0].url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>

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

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
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
                  <UploadCloud className="text-primary" /> Upload Record
                </h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmitRecord)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Title</label>
                    <input type="text" {...register('title', { required: 'Title is required' })} placeholder="E.g., Prescription" className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white" />
                    {errors.title && <span className="text-red-400 text-xs mt-1">{errors.title.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Type</label>
                    <select {...register('type', { required: 'Type is required' })} className="form-select w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white">
                      <option value="prescription">Prescription</option>
                      <option value="medical_report">Medical Report</option>
                      <option value="lab_report">Lab Report</option>
                      <option value="imaging">Scan / Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="discharge_summary">Discharge Summary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
                    <textarea {...register('description')} rows="3" placeholder="Add any relevant notes..." className="form-textarea w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white resize-none"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Select File</label>
                    <div className="relative border-2 border-dashed border-dark-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-dark-bg/30">
                      <input 
                        type="file" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                        <UploadCloud size={32} className={selectedFile ? 'text-primary' : 'text-slate-500'} />
                        {selectedFile ? (
                          <span className="text-sm font-medium text-white truncate max-w-[200px]">{selectedFile.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-slate-300">Click or drag file to upload</span>
                            <span className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-dark-border hover:bg-dark-border/50 text-white font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isUploading} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                      {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload Document'}
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
