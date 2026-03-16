import React, { useEffect, useState } from 'react';
import { Shield, Server, ArrowRight, Lock, AlertTriangle, AlertCircle, FileText, Database } from 'lucide-react';

interface BlockchainBlock {
  block_index: number;
  timestamp: string;
  event_type: string;
  user: string;
  document_id: string;
  previous_hash: string;
  hash: string;
}

export function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockchain = async () => {
    try {
      const res = await fetch('/api/security/blockchain');
      if (!res.ok) throw new Error('Failed to fetch blockchain data');
      const data = await res.json();
      if (data.success) {
        setBlocks(data.blockchain);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchain();
    // Poll every 3 seconds for updates during demo
    const interval = setInterval(fetchBlockchain, 3000);
    return () => clearInterval(interval);
  }, []);

  const getEventColor = (event: string) => {
    if (event.includes('ATTACK') || event.includes('TAMPER') || event.includes('ESCALATION')) return 'text-red-400';
    if (event.includes('ACCESS') || event.includes('CREATE') || event.includes('MODIFY')) return 'text-blue-400';
    return 'text-green-400';
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <Database className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Blockchain Audit Ledger
          </h1>
        </div>
        
        <p className="text-lg text-slate-300 mb-8 max-w-3xl">
          Real-time view of the cryptographic blockchain ledger. Every security event, document access, and system action is permanently recorded here. Hashes form a continuous Merkle tree preventing any tampering.
        </p>

        {loading && blocks.length === 0 ? (
          <div className="text-center text-slate-400 mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            Syncing Ledger...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3" />
            {error}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-800 border-b border-slate-700 text-slate-300 uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Block</th>
                    <th scope="col" className="px-6 py-4">Event Flow</th>
                    <th scope="col" className="px-6 py-4">Actor</th>
                    <th scope="col" className="px-6 py-4">Target Ref</th>
                    <th scope="col" className="px-6 py-4 text-center">Cryptographic Hashes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {blocks.slice().reverse().map((block) => (
                    <tr key={block.block_index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        #{block.block_index}
                      </td>
                      <td className={`px-6 py-4 font-bold ${getEventColor(block.event_type)}`}>
                        <div className="flex items-center">
                          {block.event_type.includes('TAMPER') || block.event_type.includes('ATTACK') ? (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          ) : (
                            <Shield className="h-4 w-4 mr-2" />
                          )}
                          {block.event_type}
                        </div>
                        <div className="text-xs text-slate-500 font-normal mt-1">
                          {new Date(block.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {block.user}
                      </td>
                      <td className="px-6 py-4">
                        {block.document_id && block.document_id !== 'N/A' ? (
                          <div className="flex items-center text-blue-400 font-mono text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {block.document_id.substring(0, 8)}...
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 font-mono text-xs w-full text-right">
                          <div className="flex items-center justify-end text-slate-500">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] mr-2">PREV</span>
                            {block.previous_hash.length > 32 ? `${block.previous_hash.substring(0, 16)}...` : block.previous_hash}
                          </div>
                          <div className="flex items-center justify-end text-emerald-400">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] mr-2 text-emerald-500">CUR</span>
                            {block.hash.length > 32 ? `${block.hash.substring(0, 16)}...` : block.hash}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {blocks.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Ledger is empty. Waiting for genesis block...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
