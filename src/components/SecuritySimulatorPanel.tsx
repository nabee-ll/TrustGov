import React, { useState } from 'react';
import { ShieldAlert, Fingerprint, Code, UserX, FileX, TerminalSquare, AlertCircle } from 'lucide-react';

interface SimulationResult {
  message: string;
  success: boolean;
  tamperedDocumentId?: string;
  error?: string;
}

export function SecuritySimulatorPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async (endpoint: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/security/simulate/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message || (data.success ? 'Simulation completed successfully.' : 'Simulation failed.')
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'An error occurred during simulation.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentTamper = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Assuming document service simulation endpoint returns the tampered document ID
      const response = await fetch('/api/security/simulate/tamper-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'mock-doc-123' }) // Pass a mock ID or fetch one
      });
      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message,
        tamperedDocumentId: data.documentId
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldAlert className="h-48 w-48 text-red-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <TerminalSquare className="h-8 w-8 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Interactive Attack Simulator</h2>
        </div>
        
        <p className="text-slate-400 mb-8 max-w-2xl">
          Trigger live simulated cyberattacks against the TrustGov infrastructure. Monitor the resulting SIEM alerts, automated mitigation responses, and permanent cryptographic ledger entries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSimulate('jwt-forgery')}
            disabled={loading}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-lg transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center text-left">
              <div className="bg-purple-500/20 p-2 rounded-md mr-4">
                <Fingerprint className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">JWT Forgery Attack</h3>
                <p className="text-sm text-slate-500 mt-1">Simulates a modified token signature payload</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSimulate('api-injection')}
            disabled={loading}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-lg transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center text-left">
              <div className="bg-orange-500/20 p-2 rounded-md mr-4">
                <Code className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">SQL/NoSQL Injection</h3>
                <p className="text-sm text-slate-500 mt-1">Fires malicious payloads at gateway endpoints</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSimulate('privilege-escalation')}
            disabled={loading}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-lg transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center text-left">
              <div className="bg-red-500/20 p-2 rounded-md mr-4">
                <UserX className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">Privilege Escalation</h3>
                <p className="text-sm text-slate-500 mt-1">Attempts unauthorized administrative access</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleDocumentTamper}
            disabled={loading}
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-lg transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center text-left">
              <div className="bg-yellow-500/20 p-2 rounded-md mr-4">
                <FileX className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors">Document Tampering</h3>
                <p className="text-sm text-slate-500 mt-1">Alters DB content independently to trigger hash mismatch</p>
              </div>
            </div>
          </button>
        </div>

        {loading && (
           <div className="mt-6 text-blue-400 animate-pulse flex items-center">
             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
             Deploying simulated attack payload...
           </div>
        )}

        {result && (
          <div className={`mt-6 p-4 rounded-lg border flex items-start ${
            result.success ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{result.success ? 'Simulation Executed' : 'Simulation Failed'}</p>
              <p className="text-sm mt-1 opacity-90">{result.message}</p>
              {result.tamperedDocumentId && (
                 <p className="text-xs font-mono mt-2 opacity-75">Targeted Document ID: {result.tamperedDocumentId}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
