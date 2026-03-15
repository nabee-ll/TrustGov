import React from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Target, Award } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary-text mb-4">About TrustGov</h1>
        <p className="text-secondary-text max-w-2xl mx-auto">
          Building the foundation for a secure, unified, and citizen-centric digital government.
        </p>
      </div>

      <div className="space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary-text mb-4">What is TrustGov?</h2>
            <p className="text-secondary-text leading-relaxed">
              TrustGov is a secure digital gateway that sits between citizens and government digital services. Instead of citizens logging into multiple fragmented government websites, TrustGov provides one unified secure login system that connects safely to all government services.
            </p>
          </div>
          <div className="glass p-8 rounded-2xl flex items-center justify-center">
            <Shield className="w-32 h-32 text-teal opacity-20 absolute" />
            <Shield className="w-24 h-24 text-teal relative z-10" />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary-text mb-8 text-center">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-cyber-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-cyber-blue" />
              </div>
              <h4 className="font-bold mb-2">Citizen First</h4>
              <p className="text-sm text-secondary-text">Simplifying the digital experience for every citizen.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-teal" />
              </div>
              <h4 className="font-bold mb-2">Zero Trust</h4>
              <p className="text-sm text-secondary-text">Implementing the highest standards of cybersecurity.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <h4 className="font-bold mb-2">Integrity</h4>
              <p className="text-sm text-secondary-text">Ensuring government records are immutable and transparent.</p>
            </div>
          </div>
        </section>

        <section className="glass p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-primary-text mb-4">Hackathon Prototype</h2>
          <p className="text-secondary-text leading-relaxed mb-6">
            This project was developed as a hackathon prototype to demonstrate the architecture of a secure government gateway. It showcases how modern technologies like JWT authentication, Zero Trust API gateways, and blockchain integrity can be combined to protect national digital infrastructure.
          </p>
          <div className="flex items-center space-x-4 text-sm font-mono text-teal">
            <span>v1.0.0-prototype</span>
            <span className="text-white/20">|</span>
            <span>Secure Build</span>
          </div>
        </section>
      </div>
    </div>
  );
}
