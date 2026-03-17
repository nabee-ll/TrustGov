import { useEffect, useState } from 'react';

export interface SecurityEventPayload {
  event_type: string;
  severity: string;
  message: string;
  action_taken: string;
}

export function useSecurityAlerts() {
  const [latestAlert, setLatestAlert] = useState<SecurityEventPayload | null>(null);

  useEffect(() => {
    // Connect to Server-Sent Events stream
    const eventSource = new EventSource('/api/security/alerts-stream');

    eventSource.addEventListener('SECURITY_ALERT', (e) => {
      try {
        const data = JSON.parse(e.data) as SecurityEventPayload;

        if (data.event_type === 'SIMULATION_STOPPED') {
          setLatestAlert(null);
          return;
        }

        setLatestAlert(data);
        
        // Auto-dismiss the alert after a few seconds
        setTimeout(() => {
          setLatestAlert(current => current === data ? null : current);
        }, 8000);
      } catch (err) {
        console.error('Failed to parse SECURITY_ALERT event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE Connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { latestAlert };
}
