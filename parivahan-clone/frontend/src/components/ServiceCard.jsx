import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';

const categoryColors = {
  'Driving Licence':     { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: '🪪', badge: 'bg-blue-100 text-blue-800' },
  'Vehicle Registration':{ bg: 'bg-green-50',  border: 'border-green-200',  icon: '🚗', badge: 'bg-green-100 text-green-800' },
  'Permits':             { bg: 'bg-purple-50', border: 'border-purple-200', icon: '📋', badge: 'bg-purple-100 text-purple-800' },
  'Taxation':            { bg: 'bg-orange-50', border: 'border-orange-200', icon: '💰', badge: 'bg-orange-100 text-orange-800' },
  'Other':               { bg: 'bg-gray-50',   border: 'border-gray-200',   icon: '📄', badge: 'bg-gray-100 text-gray-700' },
};

export default function ServiceCard({ service, compact = false }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const colors = categoryColors[service.category] || categoryColors['Other'];

  const handleApply = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (service.category === 'Driving Licence') navigate('/driving-license', { state: { serviceId: service._id, serviceName: service.serviceName } });
    else if (service.category === 'Vehicle Registration') navigate('/vehicle-registration', { state: { serviceId: service._id, serviceName: service.serviceName } });
    else navigate('/driving-license', { state: { serviceId: service._id, serviceName: service.serviceName } });
  };

  if (compact) {
    return (
      <div
        onClick={handleApply}
        className={`${colors.bg} ${colors.border} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{colors.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{service.serviceName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {service.fees > 0 ? `₹${service.fees}` : 'Free'} • {service.processingDays} days
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colors.icon}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {service.category}
          </span>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
          {service.fees > 0 ? `₹${service.fees}` : 'FREE'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-800 mb-2 leading-snug">{service.serviceName}</h3>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed flex-grow mb-3">{service.description}</p>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-white rounded p-2 border border-gray-100">
        <div className="flex items-center gap-1">
          <span>⏱</span>
          <span>{service.processingDays} Working Days</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📄</span>
          <span>{service.requiredDocuments?.length || 0} Documents</span>
        </div>
      </div>

      {/* Required documents preview */}
      {service.requiredDocuments?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Required Documents:</p>
          <div className="flex flex-wrap gap-1">
            {service.requiredDocuments.slice(0, 3).map((doc) => (
              <span key={doc} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
                {doc}
              </span>
            ))}
            {service.requiredDocuments.length > 3 && (
              <span className="text-xs text-blue-600">+{service.requiredDocuments.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Apply button */}
      <button
        onClick={handleApply}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2 rounded transition-colors duration-200 mt-auto"
      >
        Apply Online →
      </button>
    </div>
  );
}
