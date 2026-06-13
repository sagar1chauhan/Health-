import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FileText, UploadCloud, File, Image as ImageIcon, FileArchive, Download, X, Plus, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../app/api';
import { PageWrapper, itemVariant, staggerContainer } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/medical-records');
      setRecords(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
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
      formData.append('files', selectedFile);

      const res = await api.post('/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Record uploaded successfully!');
        setIsUploadModalOpen(false);
        reset();
        setSelectedFile(null);
        fetchRecords();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to upload record');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="text-slate-400" size={32} />;
    if (mimeType.includes('image')) return <ImageIcon className="text-blue-400" size={32} />;
    if (mimeType.includes('pdf')) return <FileText className="text-red-400" size={32} />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="text-yellow-400" size={32} />;
    return <File className="text-slate-400" size={32} />;
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Medical Records</h1>
          <p className="text-slate-400">Securely store and access all your health documents.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UploadCloud size={18} /> Upload Record
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Activity className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 bg-dark-bg/50 border border-dark-border rounded-xl">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>No medical records found.</p>
            </div>
          ) : (
            records.map((record) => (
              <motion.div key={record._id} variants={itemVariant}>
                <GlassCard className="h-full flex flex-col hover:border-primary/30 transition-colors group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getFileIcon(record.files[0]?.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate" title={record.title}>{record.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-dark-bg border border-dark-border text-slate-300 uppercase truncate max-w-full">
                          {record.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(record.date || record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {record.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                      {record.description}
                    </p>
                  )}

                  {record.files && record.files.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-dark-border/50 flex gap-2">
                      <a 
                        href={record.files[0].url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-primary/20"
                      >
                        <FileText size={16} /> View
                      </a>
                      <a 
                        href={record.files[0].url} 
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 flex items-center justify-center rounded-lg bg-dark-bg border border-dark-border hover:bg-dark-border/50 text-slate-300 transition-colors"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Title</label>
                    <input type="text" {...register('title', { required: 'Title is required' })} placeholder="E.g., Blood Test Report" className="form-input w-full bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none py-2.5 px-4 text-white" />
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
                      {isUploading ? <Activity size={18} className="animate-spin" /> : 'Upload Document'}
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
