import React from 'react';
import { useSecurityAlerts } from '../hooks/useSecurityAlerts';
import { AlertTriangle } from 'lucide-react';

export function SecurityAlertBanner() {
  const { latestAlert } = useSecurityAlerts();

  if (!latestAlert) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-sm flex items-start space-x-4">
        <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
        <div className="flex-1">
          <h4 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-1 flex items-center">
            ⚠ Security Alert
          </h4>
          <p className="text-white font-medium text-lg mb-1 leading-tight">
            {latestAlert.event_type.replace(/_/g, ' ')}
          </p>
          <p className="text-red-200 text-sm mb-2">{latestAlert.message}</p>
          <p className="text-xs bg-red-500/20 text-red-100 py-1 px-2 rounded-lg inline-block whitespace-nowrap font-mono font-bold">
            Action: {latestAlert.action_taken.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    </div>
  );
}