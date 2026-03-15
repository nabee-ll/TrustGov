import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Shield, Lock, Cpu, Database, Activity, UserCheck, ArrowRight, AlertTriangle, CheckCircle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="card p-8 group"
  >
    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
      <Icon className="w-6 h-6 text-brand" />
    </div>
    <h3 className="text-xl font-bold text-text-main mb-3">{title}</h3>
    <p className="text-text-muted leading-relaxed">{description}</p>
  </motion.div>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-brand mb-2">{value}</div>
    <div className="text-sm text-text-muted uppercase tracking-widest font-semibold">{label}</div>
  </div>
);

export function HomePage() {
  const [stats, setStats] = React.useState({
    activeUsers: '0',
    apiCalls: '0',
    threatsBlocked: '0',
    servicesConnected: '0'
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      });
  }, []);

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.03),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <span className="section-label">National Security Infrastructure</span>
              <h1 className="text-6xl lg:text-[5.5rem] font-bold text-text-main leading-[0.95] tracking-[-0.04em] mb-8">
                The Secure Bridge to <br />
                <span className="text-brand">Digital Government.</span>
              </h1>
              <p className="text-xl text-text-muted mb-12 max-w-xl leading-relaxed font-light">
                TrustGov provides a unified, high-security identity gateway connecting citizens to essential government services with Zero Trust integrity.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/login"
                  className="btn-primary flex items-center justify-center group px-8"
                >
                  Access Gateway
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/architecture"
                  className="btn-secondary flex items-center justify-center px-8"
                >
                  Technical Overview
                </Link>
              </div>
              
              <div className="mt-16 pt-8 border-t border-border flex items-center space-x-12">
                <div>
                  <div className="text-2xl font-bold text-text-main">{stats.activeUsers}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Active Citizens</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-main">{stats.apiCalls}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Secure API Calls</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-main">{stats.threatsBlocked}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Threats Blocked</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-20 bg-brand/5 rounded-full blur-[100px] animate-pulse" />
                <div className="relative card p-10 bg-white/80 backdrop-blur-sm border-white/50">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-tight">Security Status</div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                          <span className="text-[10px] text-success font-bold uppercase tracking-wider">Active Protection</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-text-muted bg-slate-100 px-2 py-1 rounded">ID: TG-9921</div>
                  </div>
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group cursor-default">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${30 + i * 20}%` }}
                              transition={{ duration: 2, delay: i * 0.2 }}
                              className="h-full bg-brand/30" 
                            />
                          </div>
                          <div className="text-[10px] font-mono text-text-muted">0{i}</div>
                        </div>
                        <div className="h-14 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center px-5 justify-between group-hover:border-brand/20 group-hover:bg-white transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                              <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="w-32 h-2.5 bg-slate-200/50 rounded-full" />
                          </div>
                          <CheckCircle className="w-4 h-4 text-brand/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-sm overflow-hidden">
                          <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-bold text-brand uppercase tracking-widest">Verified Sessions</div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 card p-4 bg-white shadow-xl"
                >
                  <Activity className="w-6 h-6 text-brand" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-8 -left-8 card p-4 bg-white shadow-xl"
                >
                  <Globe className="w-6 h-6 text-success" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            <div className="lg:col-span-4">
              <span className="section-label">Core Capabilities</span>
              <h2 className="text-4xl font-bold text-text-main mb-6 leading-tight">Built for National Scale Security.</h2>
              <p className="text-text-muted leading-relaxed font-light">
                TrustGov leverages advanced cryptographic protocols and distributed systems to ensure citizen data remains sovereign and secure.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                icon={UserCheck}
                title="Secure Digital Identity"
                description="Single login for all government services with multi-factor biometric support."
              />
              <FeatureCard
                icon={Cpu}
                title="API Security Gateway"
                description="High-performance encrypted proxy protecting communication with government backends."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Database}
              title="Blockchain Integrity"
              description="Distributed ledger technology ensuring government records are immutable."
            />
            <FeatureCard
              icon={Shield}
              title="Zero Trust Security"
              description="Continuous verification model where every request is authenticated."
            />
            <FeatureCard
              icon={Activity}
              title="Threat Monitoring"
              description="AI-driven anomaly detection to identify and block suspicious activity."
            />
            <FeatureCard
              icon={Lock}
              title="End-to-End Encryption"
              description="Military-grade AES-256 encryption for all data at rest and in transit."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/5" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <span className="section-label mx-auto">Get Started</span>
          <h2 className="text-5xl font-bold text-text-main mb-8 tracking-tight">Ready for a Secure Digital Future?</h2>
          <p className="text-xl text-text-muted mb-12 font-light">
            Join millions of citizens using TrustGov to access government services with peace of mind.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center px-12 py-5 text-lg"
          >
            Access TrustGov Now
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
