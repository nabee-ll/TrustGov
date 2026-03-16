import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Code, Copy, Check } from 'lucide-react';

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={copyToClipboard}
          className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
        </button>
      </div>
      <pre className="p-6 rounded-xl bg-slate-900 border border-slate-700 overflow-x-auto font-mono text-sm leading-relaxed">
        <code className="text-brand">{code}</code>
      </pre>
    </div>
  );
};

export function DevelopersPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 mb-4">
          <Code className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-4xl font-bold text-text-main mb-4">Developer API</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Integrate your government service with the TrustGov Secure Gateway using our standardized REST APIs.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <Terminal className="w-6 h-6 text-brand" />
            <h2 className="text-2xl font-bold text-text-main">Authentication API</h2>
          </div>
          <p className="text-text-muted mb-6">
            Authenticate citizens and receive a secure JWT token for session management.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-brand/20 text-brand text-xs font-bold rounded">POST</span>
              <code className="text-sm text-text-main">/api/login</code>
            </div>
            <CodeBlock
              language="json"
              code={`{
  "citizenId": "123456789012",
  "password": "secure_password_hash"
}`}
            />
            <h4 className="text-sm font-bold text-text-muted mt-4">Response</h4>
            <CodeBlock
              language="json"
              code={`{
  "token": "secure-jwt-token-header.payload.signature",
  "status": "verified",
  "expiresIn": "3600s"
}`}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-3 mb-6">
            <Terminal className="w-6 h-6 text-brand" />
            <h2 className="text-2xl font-bold text-text-main">Service Access API</h2>
          </div>
          <p className="text-text-muted mb-6">
            Retrieve a list of authorized services for the authenticated citizen.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-success/20 text-success text-xs font-bold rounded">GET</span>
              <code className="text-sm text-text-main">/api/services</code>
            </div>
            <h4 className="text-sm font-bold text-text-muted mt-4">Response</h4>
            <CodeBlock
              language="json"
              code={`{
  "services": [
    {
      "id": "tax",
      "name": "Tax Portal",
      "status": "active"
    },
    {
      "id": "health",
      "name": "Healthcare Records",
      "status": "active"
    }
  ]
}`}
            />
          </div>
        </section>

        <div className="glass p-8 rounded-2xl border border-brand/10 bg-brand/5">
          <h3 className="text-xl font-bold text-text-main mb-4">Security Requirements</h3>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
              <span>All requests must be made over HTTPS with TLS 1.3.</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
              <span>API keys must be rotated every 90 days via the Developer Portal.</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5" />
              <span>Requests are rate-limited to 100 calls per minute per service.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
