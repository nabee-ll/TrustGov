import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Key, Eye, Activity, Database, CheckCircle, ShieldAlert } from 'lucide-react';

const SecuritySection = ({ icon: Icon, title, description, features }: { icon: any, title: string, description: string, features: string[] }) => (
  <div className="glass p-8 rounded-2xl border border-white/10">
    <div className="flex items-center space-x-4 mb-6">
      <div className="p-3 bg-brand/10 rounded-xl">
        <Icon className="w-8 h-8 text-brand" />
      </div>
      <h3 className="text-2xl font-bold text-text-main">{title}</h3>
    </div>
    <p className="text-text-muted mb-8 leading-relaxed">{description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {features.map((f, i) => (
        <div key={i} className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm text-text-main">{f}</span>
        </div>
      ))}
    </div>
  </div>
);

export function SecurityPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-main mb-4">Security Model</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          TrustGov is built on the principle of "Never Trust, Always Verify." Our security architecture exceeds international government standards.
        </p>
      </div>

      <div className="space-y-12">
        <SecuritySection
          icon={ShieldAlert}
          title="Zero Trust Architecture"
          description="Unlike traditional networks that trust users once they are inside, TrustGov treats every request as a potential threat. Every API call, every login, and every data access is verified in real-time."
          features={[
            "Identity-based access control",
            "Micro-segmentation of services",
            "Continuous verification",
            "Least privilege access"
          ]}
        />

        <SecuritySection
          icon={Lock}
          title="Advanced Encryption"
          description="We use military-grade encryption standards to protect citizen data at every stage of its lifecycle."
          features={[
            "AES-256 for data at rest",
            "TLS 1.3 for data in transit",
            "Hardware Security Modules (HSM)",
            "Quantum-resistant algorithms"
          ]}
        />

        <SecuritySection
          icon={Key}
          title="Multi-Factor Authentication"
          description="Identity is verified through multiple independent channels to ensure that only the rightful citizen can access their records."
          features={[
            "Biometric verification",
            "Time-based OTP (TOTP)",
            "FIDO2 Security Keys",
            "Behavioral analytics"
          ]}
        />

        <SecuritySection
          icon={Database}
          title="Blockchain Integrity"
          description="To prevent administrative corruption or unauthorized record changes, we utilize a private blockchain ledger to store cryptographic proofs of all government records."
          features={[
            "Tamper-proof audit logs",
            "Distributed consensus",
            "Immutable record history",
            "Transparent verification"
          ]}
        />
      </div>

      <div className="mt-24 p-12 rounded-3xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/10 text-center">
        <Shield className="w-16 h-16 text-brand mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-text-main mb-4">AI-Based Threat Monitoring</h2>
        <p className="text-lg text-text-muted max-w-3xl mx-auto mb-8">
          Our system employs advanced machine learning models to detect suspicious patterns, brute-force attempts, and anomalous behavior in real-time, automatically neutralizing threats before they reach government backends.
        </p>
        <div className="inline-flex items-center space-x-2 text-brand font-bold uppercase tracking-widest text-sm">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Active Protection Enabled</span>
        </div>
      </div>
    </div>
  );
}
