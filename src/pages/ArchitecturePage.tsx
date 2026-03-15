import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Cpu, Database, Server, Network, Layers, Zap, Globe, FileCode, ArrowRight } from 'lucide-react';

const LayerCard = ({ icon: Icon, title, description, details }: { icon: any, title: string, description: string, details: string[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="card p-10 bg-white/80 backdrop-blur-sm border-white/50 group"
  >
    <div className="flex items-start space-x-8">
      <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
        <Icon className="w-8 h-8 text-brand" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-text-main mb-4 tracking-tight">{title}</h3>
        <p className="text-text-muted mb-8 leading-relaxed font-light text-lg">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((detail, i) => (
            <div key={i} className="flex items-center space-x-3 text-sm font-medium text-text-main">
              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <span className="section-label mx-auto">Technical Infrastructure</span>
          <h1 className="text-5xl md:text-6xl font-bold text-text-main mb-8 tracking-tight leading-tight">
            The Architecture of <br />
            <span className="text-brand">National Trust.</span>
          </h1>
          <p className="text-xl text-text-muted font-light leading-relaxed">
            TrustGov is built on a multi-layered security framework designed to provide high-availability access to government services while maintaining absolute data integrity.
          </p>
        </div>

        {/* High Level Diagram Simulation */}
        <div className="mb-32 relative">
          <div className="absolute inset-0 bg-brand/5 rounded-[3rem] blur-3xl -z-10" />
          <div className="card p-12 bg-white/40 backdrop-blur-md border-white/20 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              {/* Connectors (Visual Only) */}
              <div className="hidden lg:block absolute top-1/2 left-1/3 w-1/3 h-[1px] bg-gradient-to-r from-brand/20 via-brand to-brand/20 -translate-y-1/2" />
              
              {/* Client Layer */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl mx-auto flex items-center justify-center border border-slate-100">
                  <Globe className="w-10 h-10 text-brand" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">Client Layer</h4>
                  <p className="text-xs text-text-muted uppercase tracking-widest font-bold mt-1">React / Vite SPA</p>
                </div>
              </div>

              {/* API Gateway */}
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-brand rounded-[2rem] shadow-2xl shadow-brand/30 mx-auto flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping opacity-20" />
                  <Cpu className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">Security Gateway</h4>
                  <p className="text-xs text-text-muted uppercase tracking-widest font-bold mt-1">Express / Node.js</p>
                </div>
              </div>

              {/* Backend Services */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl mx-auto flex items-center justify-center border border-slate-100">
                  <Database className="w-10 h-10 text-brand" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">Service Layer</h4>
                  <p className="text-xs text-text-muted uppercase tracking-widest font-bold mt-1">Distributed Microservices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Architecture Section */}
        <div className="mt-32 mb-32">
          <div className="flex items-center space-x-4 mb-16">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Modular Backend Design</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <motion.div whileHover={{ y: -5 }} className="card p-8 bg-slate-50/50 border-slate-100">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-5 h-5 text-brand" />
              </div>
              <h4 className="font-bold text-text-main mb-3">Controllers</h4>
              <p className="text-xs text-text-muted leading-relaxed">Decoupled business logic handling request processing and response formatting.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="card p-8 bg-slate-50/50 border-slate-100">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                <Network className="w-5 h-5 text-brand" />
              </div>
              <h4 className="font-bold text-text-main mb-3">Routes</h4>
              <p className="text-xs text-text-muted leading-relaxed">Structured API endpoints with versioning and clear resource separation.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="card p-8 bg-slate-50/50 border-slate-100">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-brand" />
              </div>
              <h4 className="font-bold text-text-main mb-3">Middleware</h4>
              <p className="text-xs text-text-muted leading-relaxed">Interceptive layers for authentication, logging, and global error handling.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="card p-8 bg-slate-50/50 border-slate-100">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-5 h-5 text-brand" />
              </div>
              <h4 className="font-bold text-text-main mb-3">Data Layer</h4>
              <p className="text-xs text-text-muted leading-relaxed">Abstracted data access patterns ensuring consistency across services.</p>
            </motion.div>
          </div>
        </div>

        {/* Detailed Layers */}
        <div className="space-y-12">
          <LayerCard
            icon={Shield}
            title="Identity & Access Management (IAM)"
            description="Our Zero Trust identity layer ensures that every request is authenticated and authorized using national-grade cryptographic standards."
            details={[
              "Multi-Factor Authentication",
              "JWT Session Management",
              "Biometric Integration Support",
              "RBAC Authorization"
            ]}
          />
          <LayerCard
            icon={Network}
            title="Encrypted Communication Proxy"
            description="A high-performance API gateway that acts as a secure bridge between citizen applications and sensitive government backends."
            details={[
              "AES-256 End-to-End Encryption",
              "TLS 1.3 Protocol Enforcement",
              "DDoS Protection Layer",
              "API Rate Limiting"
            ]}
          />
          <LayerCard
            icon={Database}
            title="Distributed Ledger Integrity"
            description="Critical government records are mirrored on a private blockchain to ensure immutability and transparent audit trails."
            details={[
              "Hyperledger Fabric Core",
              "Immutable Audit Logs",
              "Smart Contract Verification",
              "Byzantine Fault Tolerance"
            ]}
          />
          <LayerCard
            icon={Zap}
            title="Real-time Anomaly Detection"
            description="AI-driven monitoring systems analyze traffic patterns in real-time to identify and neutralize potential security threats."
            details={[
              "Machine Learning Threat Models",
              "Behavioral Analysis",
              "Automated IP Blacklisting",
              "Instant Admin Alerts"
            ]}
          />
        </div>

        {/* Security Stack Visualization */}
        <div className="mt-32 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="section-label">Defense in Depth</span>
              <h2 className="text-4xl font-bold text-text-main mb-6">The Security Stack</h2>
              <p className="text-lg text-text-muted font-light leading-relaxed mb-8">
                Our architecture follows a "Defense in Depth" strategy, where multiple independent security layers protect the system from various attack vectors.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Application Layer", desc: "JWT, RBAC, Input Validation" },
                  { title: "Network Layer", desc: "TLS 1.3, DDoS Mitigation, WAF" },
                  { title: "Infrastructure Layer", desc: "Isolated Containers, Secure VPC" },
                  { title: "Data Layer", desc: "AES-256 Encryption, Blockchain Audit" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">{4-i}</div>
                    <div>
                      <h5 className="font-bold text-sm text-text-main">{item.title}</h5>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="aspect-square bg-brand/5 rounded-[3rem] flex items-center justify-center p-12">
                <div className="relative w-full h-full">
                  {/* Visual Stack Representation */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 w-4/5 h-20 bg-white border border-brand/20 rounded-2xl shadow-xl flex items-center justify-center"
                      style={{ bottom: `${i * 60}px`, zIndex: 10 - i, transform: `translateX(-50%) scale(${1 - i * 0.05})` }}
                    >
                      <div className="flex items-center space-x-4">
                        <Shield className="w-5 h-5 text-brand" />
                        <span className="font-bold text-text-main text-sm">Layer 0{4-i}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secure Data Flow */}
        <div className="mt-32 mb-32">
          <div className="flex items-center space-x-4 mb-16">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Secure Data Flow</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          <div className="relative p-12 bg-slate-900 rounded-[3rem] text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center space-y-4 w-full md:w-1/4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border border-white/10">
                  <Globe className="w-8 h-8 text-brand-light" />
                </div>
                <h5 className="font-bold text-sm">Citizen Request</h5>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Encrypted Payload</p>
              </div>

              <motion.div 
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden md:block"
              >
                <ArrowRight className="w-6 h-6 text-brand-light opacity-30" />
              </motion.div>

              <div className="text-center space-y-4 w-full md:w-1/4">
                <div className="w-20 h-20 bg-brand rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-brand/40 border border-white/20">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h5 className="font-bold text-sm">Security Gateway</h5>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Auth & Validation</p>
              </div>

              <motion.div 
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="hidden md:block"
              >
                <ArrowRight className="w-6 h-6 text-brand-light opacity-30" />
              </motion.div>

              <div className="text-center space-y-4 w-full md:w-1/4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border border-white/10">
                  <Database className="w-8 h-8 text-brand-light" />
                </div>
                <h5 className="font-bold text-sm">Gov Backend</h5>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Secure Retrieval</p>
              </div>
            </div>

            <div className="mt-16 pt-16 border-t border-white/10 text-center">
              <p className="text-sm text-white/60 font-light max-w-2xl mx-auto">
                Every transaction is logged on our distributed ledger, providing a transparent and immutable record of all government service interactions.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-32">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Technical Specifications</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-brand">
                <Server className="w-5 h-5" />
                <h5 className="font-bold uppercase tracking-wider text-xs">Runtime</h5>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Node.js 20+ environment with Express.js for high-concurrency request handling and low-latency response times.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-brand">
                <Layers className="w-5 h-5" />
                <h5 className="font-bold uppercase tracking-wider text-xs">Frontend</h5>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                React 19 with Vite for optimized client-side performance, utilizing Motion for fluid, high-trust interactions.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-brand">
                <FileCode className="w-5 h-5" />
                <h5 className="font-bold uppercase tracking-wider text-xs">Security</h5>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Strict CORS policies, HTTP-only cookies for session tokens, and automated vulnerability scanning in CI/CD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
