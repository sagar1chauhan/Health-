import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Apple, Dumbbell, HeartPulse, BrainCircuit, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../app/api';
import { PageWrapper, itemVariant, staggerContainer } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';
import { Link } from 'react-router-dom';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'diet': return <Apple className="text-green-400" size={24} />;
      case 'exercise': return <Dumbbell className="text-orange-400" size={24} />;
      case 'lifestyle': return <HeartPulse className="text-red-400" size={24} />;
      case 'mental': return <BrainCircuit className="text-purple-400" size={24} />;
      default: return <Sparkles className="text-primary" size={24} />;
    }
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Health Recommendations</h1>
        <p className="text-slate-400">Personalized diet, exercise, and lifestyle advice based on your risk profile.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Activity className="animate-spin text-primary" size={32} />
        </div>
      ) : recommendations.length === 0 ? (
        <GlassCard className="text-center py-16 px-4">
          <Sparkles size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">No Recommendations Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            We need more data to generate personalized recommendations. Please take our AI Health Risk Analysis first.
          </p>
          <Link to="/dashboard/prediction" className="btn-primary inline-flex items-center gap-2">
            <Activity size={18} /> Analyze Health Risk
          </Link>
        </GlassCard>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <motion.div key={rec._id} variants={itemVariant}>
              <GlassCard className="h-full flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-bg/50 border border-dark-border flex items-center justify-center">
                    {getIconForType(rec.type)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{rec.type}</span>
                    <h3 className="text-lg font-bold text-white leading-tight">{rec.title}</h3>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 flex-1">
                  {rec.description}
                </p>

                {rec.actionItems && rec.actionItems.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Action Items</h4>
                    <ul className="space-y-2">
                      {rec.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-dark-border/50 text-xs text-slate-500">
                  Generated on {new Date(rec.createdAt).toLocaleDateString()}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
}
