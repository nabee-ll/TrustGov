import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api.js';

const statusConfig = {
  Pending:        { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳', step: 1 },
  'Under Review': { color: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '🔍', step: 2 },
  Approved:       { color: 'bg-green-100 text-green-800 border-green-300',    icon: '✅', step: 3 },
  Rejected:       { color: 'bg-red-100 text-red-800 border-red-300',          icon: '❌', step: 3 },
  Completed:      { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🎉', step: 4 },
};

const TIMELINE = [
  { label: 'Application Submitted', desc: 'Your application has been received' },
  { label: 'Under Review',          desc: 'Application is being verified by officials' },
  { label: 'Approved / Rejected',   desc: 'Decision has been taken on your application' },
  { label: 'Completed',             desc: 'Service has been rendered successfully' },
];

export default function ApplicationStatus() {
  const [appNumber, setAppNumber] = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!appNumber.trim()) { setError('Please enter an application number'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await applicationsAPI.getByNumber(appNumber.trim().toUpperCase());
      setResult(data.data);
    } catch (e) {
      setError(e.response?.status === 404
        ? 'No application found with this number. Please check and try again.'
        : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const cfg = result ? (statusConfig[result.status] || statusConfig['Pending']) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          <div>
            <h1 className="text-xl font-bold">Application Status</h1>
            <p className="text-orange-100 text-sm">Track your Parivahan service application</p>
          </div>
        </div>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Enter Application Number</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={appNumber}
              onChange={(e) => { setAppNumber(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. PRV12345678001"
              className={`form-input font-mono text-sm ${error ? 'border-red-400' : ''}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-2 rounded transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : '🔍'}
            <span className="hidden sm:inline">{loading ? 'Searching...' : 'Track'}</span>
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-3">
          Application number starts with <span className="font-mono font-semibold">PRV</span> followed by digits.
          Find it in your confirmation SMS/email.
        </p>
      </div>

      {/* Result */}
      {result && cfg && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Status banner */}
          <div className={`px-6 py-4 flex items-center gap-3 ${
            result.status === 'Approved' || result.status === 'Completed' ? 'bg-green-50 border-b border-green-200' :
            result.status === 'Rejected' ? 'bg-red-50 border-b border-red-200' :
            'bg-yellow-50 border-b border-yellow-200'
          }`}>
            <span className="text-3xl">{cfg.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Application #{result.applicationNumber}</p>
              <p className="text-sm text-gray-500">{result.service?.serviceName}</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
              {result.status}
            </span>
          </div>

          {/* Details */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Applicant',     value: result.fullName },
                { label: 'Service',       value: result.service?.serviceName },
                { label: 'Category',      value: result.service?.category },
                { label: 'Applied On',    value: new Date(result.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) },
                { label: 'Last Updated',  value: new Date(result.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) },
                { label: 'Service Fee',   value: result.service?.fees > 0 ? `₹${result.service.fees}` : 'Free' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {result.remarks && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-sm text-blue-800">
                <p className="font-semibold mb-1">Official Remarks:</p>
                <p>{result.remarks}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-4">Application Progress</p>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
                {TIMELINE.map((item, i) => {
                  const isDone    = i < cfg.step;
                  const isCurrent = i === cfg.step - 1;
                  const isRejected = result.status === 'Rejected' && i === 2;
                  return (
                    <div key={item.label} className="relative pl-10 pb-5 last:pb-0">
                      <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isRejected ? 'bg-red-500 border-red-500 text-white' :
                        isDone ? 'bg-green-500 border-green-500 text-white' :
                        isCurrent ? 'bg-blue-600 border-blue-600 text-white animate-pulse' :
                        'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {isRejected ? '✕' : isDone ? '✓' : i + 1}
                      </div>
                      <p className={`text-sm font-semibold ${isDone || isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No result */}
      {searched && !result && !loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">📭</p>
          <h3 className="font-semibold text-gray-700">Application Not Found</h3>
          <p className="text-gray-400 text-sm mt-1">Double-check your application number and try again.</p>
        </div>
      )}

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <span>📞</span>
            <div>
              <p className="font-semibold">Helpdesk</p>
              <p className="text-xs">1800-180-1212 (Toll Free, Mon–Sat 9AM–6PM)</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <span>📧</span>
            <div>
              <p className="font-semibold">Email Support</p>
              <p className="text-xs">helpdesk@parivahan.gov.in</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/login" className="btn-primary text-sm">Login to Dashboard</Link>
          <Link to="/" className="border border-blue-600 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-4 rounded transition-all text-sm">
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
