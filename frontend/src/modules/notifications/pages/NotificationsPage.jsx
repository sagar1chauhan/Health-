import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  Bell, BellOff, CheckCheck, Calendar, Activity, Heart,
  Stethoscope, MessageCircle, ShieldCheck, AlertCircle,
  Loader2, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../store/notificationSlice';
import { PageWrapper } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';
import { useState } from 'react';

// ─── Notification type → icon + color mapping ───────────────────────────
const typeConfig = {
  appointment_booked: { icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  appointment_confirmed: { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  appointment_cancelled: { icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/15' },
  appointment_reminder: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  prediction_complete: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/15' },
  new_recommendation: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/15' },
  health_reminder: { icon: Stethoscope, color: 'text-teal-400', bg: 'bg-teal-500/15' },
  doctor_verified: { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/15' },
  new_message: { icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  system: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/15' },
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const headerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
    toast.success('All notifications marked as read');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  if (loading && notifications.length === 0) {
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-primary flex items-center gap-2 text-sm shrink-0">
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <GlassCard className="text-center py-16">
            <BellOff size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg font-medium">No notifications</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'Nothing here yet.'}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((notif, idx) => {
                const config = typeConfig[notif.type] || typeConfig.system;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className={`glass-card p-4 sm:p-5 rounded-xl flex items-start gap-4 cursor-pointer transition-all hover:border-blue-500/30 ${
                      !notif.isRead ? 'border-l-4 border-l-blue-500' : 'opacity-70'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-white' : 'text-slate-400'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-slate-500 shrink-0">{getTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      {notif.priority === 'high' && (
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                          High Priority
                        </span>
                      )}
                    </div>
                    {!notif.isRead && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2" />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
