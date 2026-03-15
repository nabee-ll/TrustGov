import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Activity, Clock, AlertTriangle, ExternalLink, FileText, Map, CreditCard, UserCheck, GraduationCap, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Service, Activity as ActivityType, cn } from '../lib/utils';
import * as Icons from 'lucide-react';

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = (Icons as any)[service.icon] || FileText;

  return (
    <motion.div
      whileHover={{ y: -4, shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card p-8 group cursor-pointer bg-white/80 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-8">
        <div className="p-4 bg-brand/5 rounded-2xl group-hover:bg-brand/10 transition-colors">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <div className="badge bg-success/10 text-success">
          Verified
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-main mb-3 tracking-tight">{service.name}</h3>
      <p className="text-sm text-text-muted mb-6 leading-relaxed font-medium line-clamp-2">{service.description}</p>
      <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-brand group-hover:translate-x-2 transition-transform">
        Open Portal <ChevronRight className="w-4 h-4 ml-2" />
      </div>
    </motion.div>
  );
};

export function DashboardPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, actRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/activity')
        ]);
        const servData = await servRes.json();
        const actData = await actRes.json();
        if (servData.success) setServices(servData.services);
        if (actData.success) setActivities(actData.activity);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-brand p-10 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-brand/20"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Shield className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 mb-4 block">Identity Gateway Active</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Good morning, <br />{user.name}</h1>
              <p className="text-brand-light/70 max-w-md text-lg font-light leading-relaxed">Your digital identity is active and protected. You have secure access to all linked national services.</p>
              
              <div className="mt-12 flex flex-wrap gap-6 items-center">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Identity Verified</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-white/40 tracking-widest uppercase">Session: TG-8821-X</div>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-label">Available Services</span>
                <h2 className="text-2xl font-bold text-text-main">Government Portals</h2>
              </div>
              <button className="text-[11px] font-bold uppercase tracking-widest text-brand hover:opacity-70 transition-opacity">Manage Services</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {services.map(service => (
                <div key={service.id}>
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          {/* Security Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card p-8 bg-white/80 backdrop-blur-sm"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8 flex items-center">
              <Shield className="w-4 h-4 text-brand mr-3" />
              Security Health
            </h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Gateway Status</span>
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                </div>
                <p className="text-sm font-bold text-text-main">Encrypted tunnel active.</p>
                <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-success w-[98%]" />
                </div>
              </div>

              <div className="p-5 bg-warning/5 border border-warning/10 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Recent Alert</span>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <p className="text-sm font-bold text-text-main">New device login detected.</p>
                <button className="mt-4 text-[10px] font-bold text-warning uppercase tracking-widest hover:opacity-70 transition-opacity">Review Access</button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card p-8 bg-white/80 backdrop-blur-sm"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8 flex items-center">
              <Clock className="w-4 h-4 text-brand mr-3" />
              Access Logs
            </h3>
            <div className="space-y-8">
              {activities.map((act, i) => (
                <div key={act.id} className="flex items-start space-x-5 relative">
                  {i !== activities.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-32px] w-[1px] bg-slate-100" />
                  )}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center mt-1 z-10 shadow-sm",
                    act.type === 'Login' ? "bg-brand text-white" : "bg-slate-100 text-text-muted"
                  )}>
                    {act.type === 'Login' ? <Lock className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-text-main">{act.type}</p>
                      <span className="text-[10px] font-mono font-bold text-text-muted">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-text-muted font-medium mb-2">{act.location}</p>
                    <div className={cn(
                      "badge",
                      act.status === 'Success' ? "bg-success/10 text-success" : "bg-slate-100 text-text-muted"
                    )}>
                      {act.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main border border-border rounded-2xl transition-all hover:bg-slate-50">
              Full Security Audit
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
