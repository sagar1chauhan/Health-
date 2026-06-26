import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Apple, Dumbbell, HeartPulse, Sparkles, Loader2,
  ChevronDown, ChevronUp, Utensils, Moon, Droplets, Wind,
  Cigarette, Wine, Brain, Stethoscope, AlertTriangle, Clock,
  Flame, Salad, Coffee, Sun, Sunset,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../app/api';
import { PageWrapper, itemVariant, staggerContainer } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';
import { Link } from 'react-router-dom';

// Meal icon mapping
const mealIcons = {
  breakfast: { icon: Coffee, label: 'Breakfast', color: 'text-amber-400' },
  morning_snack: { icon: Sun, label: 'Morning Snack', color: 'text-yellow-400' },
  lunch: { icon: Salad, label: 'Lunch', color: 'text-green-400' },
  evening_snack: { icon: Sunset, label: 'Evening Snack', color: 'text-orange-400' },
  dinner: { icon: Utensils, label: 'Dinner', color: 'text-blue-400' },
};

// Lifestyle category icons
const lifestyleIcons = {
  sleep: { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  stress: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/15' },
  smoking: { icon: Cigarette, color: 'text-red-400', bg: 'bg-red-500/15' },
  alcohol: { icon: Wine, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  hydration: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  general: { icon: Wind, color: 'text-slate-400', bg: 'bg-slate-500/15' },
};

// Urgency badge colors
const urgencyColors = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  soon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  routine: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-green-500/20 text-green-400',
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data.data);
      // Auto-expand all sections for the first (latest) recommendation
      if (res.data.data.length > 0) {
        setExpandedSections({
          [`${res.data.data[0]._id}-diet`]: true,
          [`${res.data.data[0]._id}-exercise`]: true,
          [`${res.data.data[0]._id}-lifestyle`]: true,
          [`${res.data.data[0]._id}-doctors`]: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Health Recommendations</h1>
        <p className="text-slate-400">Personalized diet, exercise, and lifestyle advice based on your risk profile.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="animate-spin text-blue-400" size={32} />
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
        <div className="space-y-8">
          {recommendations.map((rec, recIdx) => (
            <motion.div
              key={rec._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: recIdx * 0.1 }}
            >
              {/* Recommendation Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Health Plan {recIdx === 0 && rec.isActive ? '(Current)' : `#${recommendations.length - recIdx}`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Generated on {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {rec.validUntil && ` • Valid until ${new Date(rec.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                </div>
                {rec.isActive && (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                    Active
                  </span>
                )}
              </div>

              {/* ─── Diet Plan ─────────────────────────────────── */}
              {rec.dietPlan && rec.dietPlan.length > 0 && (
                <SectionCard
                  title="Diet Plan"
                  icon={<Apple size={20} className="text-green-400" />}
                  gradient="from-green-500/10 to-emerald-500/10"
                  borderColor="border-green-500/20"
                  isExpanded={expandedSections[`${rec._id}-diet`]}
                  onToggle={() => toggleSection(`${rec._id}-diet`)}
                  count={rec.dietPlan.length}
                >
                  <div className="space-y-3">
                    {rec.dietPlan.map((meal, idx) => {
                      const mealInfo = mealIcons[meal.meal] || mealIcons.lunch;
                      const MealIcon = mealInfo.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border/30 hover:border-green-500/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center shrink-0 mt-0.5">
                              <MealIcon size={16} className={mealInfo.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{mealInfo.label}</span>
                                {meal.calories && (
                                  <span className="text-xs text-amber-400 flex items-center gap-1">
                                    <Flame size={12} /> {meal.calories} cal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white font-medium">{meal.suggestion}</p>
                              {meal.reason && <p className="text-xs text-slate-400 mt-1">{meal.reason}</p>}
                              {meal.nutrients && (
                                <div className="flex gap-3 mt-2 text-[10px] font-medium">
                                  <span className="text-blue-400">P: {meal.nutrients.protein}g</span>
                                  <span className="text-amber-400">C: {meal.nutrients.carbs}g</span>
                                  <span className="text-red-400">F: {meal.nutrients.fat}g</span>
                                  <span className="text-green-400">Fiber: {meal.nutrients.fiber}g</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ─── Exercise Plan ────────────────────────────── */}
              {rec.exercisePlan && rec.exercisePlan.length > 0 && (
                <SectionCard
                  title="Exercise Plan"
                  icon={<Dumbbell size={20} className="text-orange-400" />}
                  gradient="from-orange-500/10 to-amber-500/10"
                  borderColor="border-orange-500/20"
                  isExpanded={expandedSections[`${rec._id}-exercise`]}
                  onToggle={() => toggleSection(`${rec._id}-exercise`)}
                  count={rec.exercisePlan.length}
                >
                  <div className="space-y-3">
                    {rec.exercisePlan.map((ex, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border/30 hover:border-orange-500/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm font-semibold text-white">{ex.activity}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                            ex.intensity === 'high' ? 'bg-red-500/15 text-red-400' :
                            ex.intensity === 'moderate' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-green-500/15 text-green-400'
                          }`}>
                            {ex.intensity}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-2">
                          <span className="flex items-center gap-1"><Clock size={12} /> {ex.duration}</span>
                          <span>📅 {ex.frequency}</span>
                          {ex.caloriesBurned && (
                            <span className="text-amber-400 flex items-center gap-1"><Flame size={12} /> ~{ex.caloriesBurned} cal</span>
                          )}
                        </div>
                        {ex.reason && <p className="text-xs text-slate-500">{ex.reason}</p>}
                      </motion.div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ─── Lifestyle Suggestions ────────────────────── */}
              {rec.lifestyleSuggestions && rec.lifestyleSuggestions.length > 0 && (
                <SectionCard
                  title="Lifestyle Suggestions"
                  icon={<HeartPulse size={20} className="text-pink-400" />}
                  gradient="from-pink-500/10 to-rose-500/10"
                  borderColor="border-pink-500/20"
                  isExpanded={expandedSections[`${rec._id}-lifestyle`]}
                  onToggle={() => toggleSection(`${rec._id}-lifestyle`)}
                  count={rec.lifestyleSuggestions.length}
                >
                  <div className="space-y-3">
                    {rec.lifestyleSuggestions.map((tip, idx) => {
                      const catInfo = lifestyleIcons[tip.category] || lifestyleIcons.general;
                      const CatIcon = catInfo.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border/30 hover:border-pink-500/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg ${catInfo.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <CatIcon size={16} className={catInfo.color} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 capitalize">{tip.category}</span>
                                {tip.priority && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[tip.priority] || ''}`}>
                                    {tip.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white">{tip.suggestion}</p>
                              {tip.impact && (
                                <p className="text-xs text-slate-400 mt-1.5 italic">💡 {tip.impact}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ─── Doctor Recommendations ───────────────────── */}
              {rec.doctorRecommendations && rec.doctorRecommendations.length > 0 && (
                <SectionCard
                  title="Specialist Consultations"
                  icon={<Stethoscope size={20} className="text-blue-400" />}
                  gradient="from-blue-500/10 to-indigo-500/10"
                  borderColor="border-blue-500/20"
                  isExpanded={expandedSections[`${rec._id}-doctors`]}
                  onToggle={() => toggleSection(`${rec._id}-doctors`)}
                  count={rec.doctorRecommendations.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rec.doctorRecommendations.map((doc, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border/30 hover:border-blue-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{doc.specialization}</h4>
                          {doc.urgency && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${urgencyColors[doc.urgency] || ''}`}>
                              {doc.urgency}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{doc.reason}</p>
                        <Link
                          to="/dashboard/appointments"
                          className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          Book Appointment →
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Divider between recommendations */}
              {recIdx < recommendations.length - 1 && (
                <div className="border-t border-dark-border/30 my-8" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

// ─── Collapsible Section Card Component ─────────────────────────────
function SectionCard({ title, icon, gradient, borderColor, isExpanded, onToggle, count, children }) {
  return (
    <GlassCard className={`mb-4 overflow-hidden border ${borderColor} transition-colors`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">{title}</h3>
            <p className="text-xs text-slate-500">{count} item{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
