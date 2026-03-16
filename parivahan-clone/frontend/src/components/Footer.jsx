import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#003580] text-white mt-auto">
      {/* Tricolor bar */}
      <div className="flex h-1">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Column 1 – About */}
        <div>
          <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">
            Parivahan Sewa
          </h3>
          <p className="text-blue-200 text-xs leading-relaxed">
            Ministry of Road Transport &amp; Highways, Government of India. This portal provides e-services for vehicle registration, driving licences, and other transport-related services.
          </p>
          <p className="text-blue-300 text-xs mt-3 font-medium">
            Powered by NIC – National Informatics Centre
          </p>
        </div>

        {/* Column 2 – Quick Links */}
        <div>
          <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">Quick Links</h3>
          <ul className="space-y-1.5 text-xs text-blue-200">
            {[
              { to: '/', label: 'Home' },
              { to: '/driving-license', label: 'Driving Licence' },
              { to: '/vehicle-registration', label: 'Vehicle Registration' },
              { to: '/application-status', label: 'Application Status' },
              { to: '/dashboard', label: 'My Dashboard' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-orange-300 transition-colors">
                  ▸ {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 – Services */}
        <div>
          <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">Services</h3>
          <ul className="space-y-1.5 text-xs text-blue-200">
            {[
              'Apply for Learner Licence',
              'Apply for Driving Licence',
              'Renew Driving Licence',
              'New Vehicle Registration',
              'RC Renewal',
              'Road Tax Payment',
            ].map((s) => (
              <li key={s} className="flex items-start gap-1">
                <span className="text-orange-400 mt-0.5">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 – Contact */}
        <div>
          <h3 className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">Contact &amp; Help</h3>
          <div className="space-y-2 text-xs text-blue-200">
            <div className="flex items-start gap-2">
              <span>📞</span>
              <div>
                <p className="font-semibold text-white">Helpdesk</p>
                <p>1800-180-1212 (Toll Free)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span>📧</span>
              <div>
                <p className="font-semibold text-white">Email</p>
                <p>helpdesk@parivahan.gov.in</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span>🏛️</span>
              <div>
                <p className="font-semibold text-white">Address</p>
                <p>Transport Bhawan, 1 Parliament Street, New Delhi - 110001</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-blue-300">
          <p>© 2024 Ministry of Road Transport &amp; Highways, Government of India. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-300">Terms of Use</a>
            <a href="#" className="hover:text-orange-300">Privacy Policy</a>
            <a href="#" className="hover:text-orange-300">Accessibility</a>
            <a href="#" className="hover:text-orange-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
