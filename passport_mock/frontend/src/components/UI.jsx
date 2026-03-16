import React, { useState } from 'react';

// ── Toast Context ─────────────────────────────────────────────
export const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '14px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            minWidth: 260, boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn 0.3s ease',
            background: t.type === 'success' ? '#15803d' : t.type === 'error' ? '#dc2626' : '#003580',
            color: 'white',
          }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => React.useContext(ToastContext);

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: size === 'lg' ? 680 : 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #d0d9ec', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#003580' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#475569', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: size, height: size, border: `3px solid #d0d9ec`, borderTopColor: '#003580', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }`}</style>
    </div>
  );
}

// ── Emblem SVG ────────────────────────────────────────────────
export function Emblem({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#003580" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="26" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="4.5" fill="#003580"/>
      <g stroke="#003580" strokeWidth="1.2" opacity="0.8">
        <line x1="40" y1="14" x2="40" y2="35.5"/><line x1="40" y1="44.5" x2="40" y2="66"/>
        <line x1="14" y1="40" x2="35.5" y2="40"/><line x1="44.5" y1="40" x2="66" y2="40"/>
        <line x1="22" y1="22" x2="37.4" y2="37.4"/><line x1="42.6" y1="42.6" x2="58" y2="58"/>
        <line x1="58" y1="22" x2="42.6" y2="37.4"/><line x1="37.4" y1="42.6" x2="22" y2="58"/>
        <line x1="17.5" y1="31" x2="37" y2="38.5"/><line x1="43" y1="41.5" x2="62.5" y2="49"/>
        <line x1="17.5" y1="49" x2="37" y2="41.5"/><line x1="43" y1="38.5" x2="62.5" y2="31"/>
        <line x1="31" y1="17.5" x2="38.5" y2="37"/><line x1="41.5" y1="43" x2="49" y2="62.5"/>
        <line x1="49" y1="17.5" x2="41.5" y2="37"/><line x1="38.5" y1="43" x2="31" y2="62.5"/>
      </g>
      <text x="40" y="75" textAnchor="middle" fontSize="5.5" fill="#003580" fontFamily="serif" letterSpacing="0.5">सत्यमेव जयते</text>
    </svg>
  );
}

// ── Helpline Card ─────────────────────────────────────────────
export function HelplineCard() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#001f4d,#1254b5)', color: 'white', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 20 }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>📞 National Helpline</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', letterSpacing: 3 }}>1800-258-1800</div>
      <div style={{ fontSize: 11, color: '#a8c4f0', marginTop: 4 }}>Toll-Free | Mon–Sat | 8 AM – 8 PM</div>
    </div>
  );
}
