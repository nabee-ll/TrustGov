import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api.js';
import ServiceCard from '../components/ServiceCard.jsx';

const stats = [
  { label: 'Registered Vehicles', value: '32+ Crore', icon: '🚗' },
  { label: 'Driving Licences',    value: '18+ Crore', icon: '🪪' },
  { label: 'States / UTs',        value: '36',        icon: '🗺️' },
  { label: 'RTOs',                value: '1400+',     icon: '🏢' },
];

const quickServices = [
  { title: 'Apply / Renew Driving Licence', icon: '🪪', path: '/driving-license',      color: 'bg-blue-600',   desc: 'LL, DL, Renewal & Duplicates' },
  { title: 'Vehicle Registration',          icon: '🚗', path: '/vehicle-registration', color: 'bg-green-600',  desc: 'New RC, Renewal, Transfer' },
  { title: 'Application Status',            icon: '🔍', path: '/application-status',   color: 'bg-orange-500', desc: 'Track your application' },
  { title: 'My Dashboard',                  icon: '📊', path: '/dashboard',            color: 'bg-purple-600', desc: 'View all your applications' },
];

const notices = [
  'Vahan & Sarathi services now integrated into Parivahan portal.',
  'New rule: Wearing seatbelts mandatory for all passengers. Penalty ₹1000.',
  'High Security Registration Plates (HSRP) mandatory for all vehicles.',
  'Faceless services launched – no need to visit RTO for select services.',
  'Driving Licence validity extended; check notification for details.',
];

export default function Home() {
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [noticeIdx, setNoticeIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await servicesAPI.getAll();
        setServices(data.data || []);
      } catch {
        /* use empty */ 
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Marquee-style notice rotation
  useEffect(() => {
    const id = setInterval(() => setNoticeIdx((i) => (i + 1) % notices.length), 4000);
    return () => clearInterval(id);
  }, []);

  const categories = ['All', 'Driving Licence', 'Vehicle Registration', 'Permits', 'Taxation'];
  const filtered = activeTab === 'All' ? services : services.filter((s) => s.category === activeTab);

  return (
    <div>
      {/* ── Notice Board ── */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-3">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 animate-pulse">
          NOTICE
        </span>
        <p className="text-xs text-gray-700 font-medium truncate">{notices[noticeIdx]}</p>
        <Link to="/application-status" className="text-xs text-blue-700 underline flex-shrink-0 hidden sm:block">
          Read More
        </Link>
      </div>

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-[#003580] via-[#1a56db] to-[#003580] text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Digital India Initiative
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Parivahan Sewa<br />
                <span className="text-orange-300">Online Transport Services</span>
              </h2>
              <p className="text-blue-200 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                Apply for Driving Licence, Vehicle Registration, Permits and other transport-related services
                from the comfort of your home. Fast, paperless and transparent.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/driving-license')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded transition-colors shadow-lg"
                >
                  Apply for DL
                </button>
                <button
                  onClick={() => navigate('/vehicle-registration')}
                  className="bg-white text-blue-800 hover:bg-gray-100 font-semibold px-6 py-2.5 rounded transition-colors shadow-lg"
                >
                  Register Vehicle
                </button>
                <button
                  onClick={() => navigate('/application-status')}
                  className="border border-white text-white hover:bg-white hover:text-blue-800 font-semibold px-6 py-2.5 rounded transition-colors"
                >
                  Track Application
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 text-center min-w-[130px]">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xl font-bold text-orange-300">{value}</div>
                  <div className="text-xs text-blue-200 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Access ── */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-center text-base font-bold text-gray-700 mb-4 uppercase tracking-wide">
            ⚡ Quick Access Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickServices.map(({ title, icon, path, color, desc }) => (
              <Link
                key={path}
                to={path}
                className={`${color} text-white rounded-lg p-4 flex flex-col items-center text-center hover:opacity-90 transition-opacity shadow-md hover:shadow-lg`}
              >
                <span className="text-3xl mb-2">{icon}</span>
                <span className="text-sm font-semibold leading-tight mb-1">{title}</span>
                <span className="text-xs opacity-80">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-blue-900">Available Online Services</h2>
            <p className="text-sm text-gray-500">Choose a service to apply online</p>
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  activeTab === cat
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-5 animate-pulse border border-gray-100">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-5/6" />
                <div className="h-8 bg-gray-200 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No services found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* ── Info Banners ── */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Secure & Safe', desc: 'All transactions are encrypted. Your data is protected under Government of India security standards.' },
              { icon: '⚡', title: 'Fast Processing', desc: 'Track your application status online. Get SMS/email updates at every stage of processing.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Access all services on your smartphone. No need to visit RTO for select faceless services.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Partner Ministries ── */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            Government of India Initiatives
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
            {['Digital India', 'Make in India', 'Ease of Doing Business', 'Swachh Bharat', 'Smart Cities'].map((item) => (
              <span key={item} className="flex items-center gap-1">
                <span className="text-orange-500">•</span> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
