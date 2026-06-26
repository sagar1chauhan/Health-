import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Watch, Heart, Footprints, Moon, Wind,
  Loader2, Plus, Activity, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../../app/api';
import { PageWrapper } from '../../../shared/components/animations/motion';
import GlassCard from '../../../shared/components/ui/GlassCard';

// Mock demo data for visualization when no real data
const generateMockData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      heartRate: 65 + Math.floor(Math.random() * 25),
      steps: 3000 + Math.floor(Math.random() * 8000),
      sleep: 5 + Math.round(Math.random() * 4 * 10) / 10,
      spo2: 95 + Math.floor(Math.random() * 5),
    });
  }
  return data;
};

export default function WearablesPage() {
  const [wearableData, setWearableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (headerRef.current && !loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      const res = await api.get('/wearables');
      if (res.data.success && res.data.data.length > 0) {
        setIsDemo(false);
        setWearableData(res.data.data);
        setChartData(res.data.data.map((d) => ({
          date: new Date(d.recordedAt).toLocaleDateString('en-US', { weekday: 'short' }),
          heartRate: d.metrics?.heartRate?.[0]?.value || 0,
          steps: d.metrics?.steps || 0,
          sleep: d.metrics?.sleepDuration ? (d.metrics.sleepDuration / 60).toFixed(1) : 0,
          spo2: d.metrics?.oxygenLevelSpO2 || 0,
        })).reverse());
      } else {
        setIsDemo(true);
        setChartData(generateMockData());
      }
    } catch {
      setIsDemo(true);
      setChartData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDevice = async () => {
    try {
      setSyncing(true);
      
      // Generate a new realistic data point
      const payload = {
        deviceType: 'smartwatch',
        deviceModel: 'HealthHub Pro X1',
        metrics: {
          heartRate: [{ value: 65 + Math.floor(Math.random() * 25), timestamp: new Date() }],
          steps: 5000 + Math.floor(Math.random() * 5000),
          sleepDuration: (6 + Math.round(Math.random() * 3 * 10) / 10) * 60, // in minutes
          oxygenLevelSpO2: 95 + Math.floor(Math.random() * 5),
          bloodPressure: { systolic: 120, diastolic: 80 }
        },
        recordedAt: new Date()
      };

      const res = await api.post('/wearables', payload);
      if (res.data.success) {
        toast.success('Device synced successfully!');
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync device data');
    } finally {
      setSyncing(false);
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

  const latest = chartData[chartData.length - 1] || {};

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Wearables & IoT</h1>
            <p className="text-slate-400 text-sm mt-1">Track your vitals from connected devices</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${isDemo ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              <Watch size={16} /> {isDemo ? 'Demo Data Shown' : 'Live Data (Connected)'}
            </div>
            <button 
              onClick={handleSyncDevice} 
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} /> Sync Device
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Heart Rate', value: `${latest.heartRate || '—'}`, unit: 'bpm', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/15' },
            { label: 'Steps Today', value: `${latest.steps?.toLocaleString() || '—'}`, unit: 'steps', icon: Footprints, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
            { label: 'Sleep', value: `${latest.sleep || '—'}`, unit: 'hrs', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
            { label: 'SpO2', value: `${latest.spo2 || '—'}`, unit: '%', icon: Wind, color: 'text-teal-400', bg: 'bg-teal-500/15' },
          ].map((card) => (
            <GlassCard key={card.label} className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-xl font-bold text-white">{card.value} <span className="text-xs text-slate-500 font-normal">{card.unit}</span></p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heart Rate */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart size={18} className="text-red-400" /> Heart Rate Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[50, 110]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fill="url(#heartGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Steps */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Footprints size={18} className="text-emerald-400" /> Daily Steps
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="steps" stroke="#10B981" fill="url(#stepsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Sleep */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Moon size={18} className="text-indigo-400" /> Sleep Duration
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 12]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="sleep" stroke="#6366F1" fill="url(#sleepGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* SpO2 */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wind size={18} className="text-teal-400" /> Blood Oxygen (SpO2)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[90, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="spo2" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
