import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { PageWrapper, itemVariant, staggerContainer } from '../../components/animations/motion';
import GlassCard from '../../components/ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PredictionResults() {
  const [showContent, setShowContent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const prediction = location.state?.prediction;

  useEffect(() => {
    if (!prediction) {
      navigate('/dashboard/prediction');
      return;
    }
    // Reveal after "calculating" animation
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, [prediction, navigate]);

  const shapData = useMemo(() => {
    if (!prediction || !prediction.shapExplanation) return [];
    
    // Assume the first predicted disease is the primary one for the SHAP explanation
    const primaryDisease = prediction.predictions[0]?.disease;
    const explanations = prediction.shapExplanation[primaryDisease] || {};
    
    return Object.entries(explanations).map(([feature, data]) => ({
      feature,
      impact: data.contribution,
      type: data.contribution > 0 ? 'negative' : 'positive'
    })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [prediction]);

  if (!prediction) return null;

  if (!showContent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Health Profile</h2>
        <p className="text-slate-400">Running XGBoost and Random Forest ensembles...</p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analysis Results</h1>
          <p className="text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <button className="btn-primary">Download PDF Report</button>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Risk Status */}
        <motion.div variants={itemVariant} className="lg:col-span-1">
          <GlassCard className={`h-full flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b ${prediction.riskCategory === 'high' ? 'from-red-500/10 border-red-500/20' : prediction.riskCategory === 'moderate' ? 'from-yellow-500/10 border-yellow-500/20' : 'from-green-500/10 border-green-500/20'}`}>
            <div className={`absolute top-0 w-full h-1 ${prediction.riskCategory === 'high' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : prediction.riskCategory === 'moderate' ? 'bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.8)]' : 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]'}`} />
            
            <div className={`w-24 h-24 rounded-full ${prediction.riskCategory === 'high' ? 'bg-red-500/20 text-red-500' : prediction.riskCategory === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'} flex items-center justify-center mb-6`}>
              {prediction.riskCategory === 'high' ? <ShieldAlert size={48} /> : <CheckCircle2 size={48} />}
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{prediction.overallRiskScore}<span className="text-lg text-slate-400 font-normal">/100</span></h2>
            <div className={`inline-block px-4 py-1 rounded-full font-semibold mb-6 border ${prediction.riskCategory === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : prediction.riskCategory === 'moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
              {prediction.riskCategory.charAt(0).toUpperCase() + prediction.riskCategory.slice(1)} Risk Level
            </div>
            
            <p className="text-slate-300">
              Our models indicate {prediction.riskCategory === 'high' ? 'an elevated' : prediction.riskCategory === 'moderate' ? 'a moderate' : 'a low'} risk for <span className="font-semibold text-white">{prediction.predictions[0]?.disease}</span> within the next 5 years.
            </p>
            
            <div className="w-full mt-8 p-4 rounded-xl bg-dark-bg/60 border border-dark-border text-left">
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Model Confidence</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white">XGBoost Ensemble</span><span className="text-primary">85%</span></div>
                  <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden"><div className="h-full bg-primary w-[85%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white">Random Forest</span><span className="text-accent">82%</span></div>
                  <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden"><div className="h-full bg-accent w-[82%]" /></div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Explainable AI (SHAP) */}
        <motion.div variants={itemVariant} className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-accent" />
              <h3 className="text-xl font-bold text-white">Why did the AI make this prediction?</h3>
            </div>
            <p className="text-slate-400 mb-6">Using SHAP (SHapley Additive exPlanations), we can see exactly which factors pushed your risk score up or down.</p>
            
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${val > 0 ? '+' : ''}${Math.round(val * 100)}%`} />
                  <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={13} width={120} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1E293B'}}
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`${value > 0 ? '+' : ''}${Math.round(value * 100)}% Impact`, 'Contribution']}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={24}>
                    {shapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#EF4444' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Actionable Next Steps */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-dark-border bg-dark-bg/50 hover:bg-dark-border/30 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">View Diet Plan</span>
                  <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-slate-400">AI-generated meal plan to lower blood pressure and BMI.</p>
              </div>
              <div className="p-4 rounded-xl border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">Consult Cardiologist</span>
                  <ChevronRight size={18} className="text-secondary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-slate-400">Book an appointment to discuss these results.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
        
      </motion.div>
    </PageWrapper>
  );
}
