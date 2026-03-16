import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api.js';
import { useAuth } from '../App.jsx';

const statusStyle = {
  Pending:       'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Under Review':'bg-blue-100 text-blue-800 border-blue-300',
  Approved:      'bg-green-100 text-green-800 border-green-300',
  Rejected:      'bg-red-100 text-red-800 border-red-300',
  Completed:     'bg-purple-100 text-purple-800 border-purple-300',
};

const statusIcon = {
  Pending: '⏳', 'Under Review': '🔍', Approved: '✅', Rejected: '❌', Completed: '🎉',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await applicationsAPI.getUserApps();
        setApplications(data.data || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="bg-gradient-to-r from-[#003580] to-[#1a56db] text-white rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-blue-200 text-sm">{user?.email}</p>
            <p className="text-blue-300 text-xs mt-0.5">
              Citizen ID: <span className="font-mono">GOI-{user?.id?.slice(-8)?.toUpperCase()}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/driving-license" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
            + Apply DL
          </Link>
          <Link to="/vehicle-registration" className="bg-white text-blue-800 hover:bg-gray-100 text-sm font-semibold px-4 py-2 rounded transition-colors">
            + Register Vehicle
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',       value: applications.length, color: 'bg-gray-50  border-gray-200',  text: 'text-gray-700' },
          { label: 'Pending',     value: counts['Pending']       || 0, color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
          { label: 'Under Review',value: counts['Under Review']  || 0, color: 'bg-blue-50   border-blue-200',   text: 'text-blue-700' },
          { label: 'Approved',    value: counts['Approved']      || 0, color: 'bg-green-50  border-green-200',  text: 'text-green-700' },
          { label: 'Completed',   value: counts['Completed']     || 0, color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
        ].map(({ label, value, color, text }) => (
          <div key={label} className={`${color} border rounded-lg p-4 text-center`}>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Applications list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">My Applications</h2>
          <span className="text-xs text-gray-400">{applications.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-3">📋</p>
            <h3 className="font-semibold text-gray-700 mb-1">No Applications Yet</h3>
            <p className="text-gray-400 text-sm mb-4">You haven't applied for any services yet.</p>
            <div className="flex justify-center gap-3">
              <Link to="/driving-license" className="btn-primary text-sm">Apply for DL</Link>
              <Link to="/vehicle-registration" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded transition-all duration-200 shadow-sm text-sm">Register Vehicle</Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => (
              <div key={app._id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{statusIcon[app.status] || '📄'}</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {app.service?.serviceName || 'Service'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyle[app.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>📋 App No: <span className="font-mono font-semibold text-gray-700">{app.applicationNumber}</span></span>
                      <span>📂 {app.service?.category}</span>
                      <span>📅 {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {app.service?.fees > 0 && <span>💰 ₹{app.service.fees}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>⏱ ~{app.service?.processingDays} working days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🪪', title: 'Apply Driving Licence', desc: 'New, renewal & duplicate', path: '/driving-license', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
          { icon: '🚗', title: 'Vehicle Registration', desc: 'New RC, renewal, transfer', path: '/vehicle-registration', color: 'bg-green-50 border-green-200 hover:border-green-400' },
          { icon: '🔍', title: 'Track Application', desc: 'Check status by app number', path: '/application-status', color: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
        ].map(({ icon, title, desc, path, color }) => (
          <Link key={path} to={path} className={`${color} border rounded-lg p-4 flex items-center gap-3 transition-colors`}>
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
