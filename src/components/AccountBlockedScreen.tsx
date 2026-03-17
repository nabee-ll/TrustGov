import { useEffect, useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';

// ─── Props ────────────────────────────────────────────────────────────────
export interface BlockedDetails {
  blockedAt: string;         // ISO string
  blockExpiresAt: string;    // ISO string
  remainingMinutes: number;
}

interface Props {
  details: BlockedDetails;
  onBack?: () => void;
  adminEmail?: string;
}

const R    = 64;
const CX   = 80;
const CY   = 80;
const CIRC = 2 * Math.PI * R;

export default function AccountBlockedScreen({
  details,
  onBack,
  adminEmail = 'support@gov.in',
}: Props) {
  const cd = useCountdown(details.blockExpiresAt, details.blockedAt);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const strokeDashoffset = CIRC - (cd.progressPct / 100) * CIRC;
  const ringColor =
    cd.expired             ? '#22c55e'
    : cd.totalSeconds < 120 ? '#f97316'
    :                         '#ef4444';

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .tgb-root*{box-sizing:border-box;margin:0;padding:0}
        .tgb-root{
          position:fixed;inset:0;
          background:#0c0c0f;
          display:flex;align-items:center;justify-content:center;
          font-family:'DM Sans',sans-serif;
          z-index:9999;overflow:hidden;
        }
        .tgb-root::before{
          content:'';position:absolute;
          width:640px;height:640px;border-radius:50%;
          background:radial-gradient(circle,rgba(239,68,68,.07) 0%,transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%);
          animation:tgb-pulse 4s ease-in-out infinite;
        }
        @keyframes tgb-pulse{
          0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5}
          50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}
        }
        .tgb-card{
          position:relative;
          background:#141418;
          border:1px solid #22222a;
          border-radius:20px;
          padding:2.75rem 2.25rem 2.25rem;
          width:min(460px,calc(100vw - 2rem));
          text-align:center;
          opacity:0;transform:translateY(20px);
          transition:opacity .4s ease,transform .4s ease;
        }
        .tgb-card.in{opacity:1;transform:translateY(0)}
        .tgb-card::before{
          content:'';position:absolute;
          top:0;left:12%;right:12%;height:2px;
          background:linear-gradient(90deg,transparent,#ef4444 40%,#ef4444 60%,transparent);
        }
        .tgb-lock{
          width:60px;height:60px;border-radius:16px;
          background:#1b1b22;border:1px solid #2a2a34;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 1.5rem;
        }
        .tgb-title{
          font-family:'Syne',sans-serif;font-size:21px;font-weight:800;
          color:#f0f0f4;letter-spacing:-.3px;margin-bottom:.4rem;line-height:1.3;
        }
        .tgb-sub{font-size:13.5px;color:#55555f;line-height:1.65;margin-bottom:2rem;padding:0 .25rem}
        .tgb-ring{width:160px;height:160px;position:relative;margin:0 auto 1.75rem}
        .tgb-ring svg{display:block}
        .tgb-ring-inner{
          position:absolute;inset:0;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
        }
        .tgb-ring-time{
          font-family:'Syne',sans-serif;font-size:25px;font-weight:700;
          letter-spacing:-.4px;line-height:1;transition:color .5s;
        }
        .tgb-ring-lbl{font-size:10px;color:#3d3d4a;text-transform:uppercase;letter-spacing:.1em}
        .tgb-pills{display:flex;gap:8px;justify-content:center;margin-bottom:1.75rem;flex-wrap:wrap}
        .tgb-pill{
          background:#181820;border:1px solid #242430;border-radius:8px;
          padding:8px 14px;font-size:12px;color:#55555f;line-height:1.4;
        }
        .tgb-pill strong{display:block;font-size:13px;font-weight:500;color:#b8b8c6;margin-bottom:1px}
        .tgb-divider{border:none;border-top:1px solid #1c1c24;margin-bottom:1.5rem}
        .tgb-contact{
          background:#101016;border:1px solid #1e1e28;border-radius:12px;
          padding:.9rem 1.1rem;margin-bottom:1.5rem;
          display:flex;align-items:flex-start;gap:10px;text-align:left;
        }
        .tgb-ci{
          width:30px;height:30px;flex-shrink:0;border-radius:8px;
          background:#18181f;border:1px solid #232330;
          display:flex;align-items:center;justify-content:center;margin-top:1px;
        }
        .tgb-cb{flex:1}
        .tgb-ct{font-size:13px;font-weight:500;color:#b0b0be;margin-bottom:3px}
        .tgb-cb p{font-size:12px;color:#48484f;line-height:1.5;margin-bottom:6px}
        .tgb-cl{
          display:inline-flex;align-items:center;gap:4px;
          font-size:12px;font-weight:500;color:#818cf8;
          text-decoration:none;border-bottom:1px solid transparent;transition:border-color .15s;
        }
        .tgb-cl:hover{border-bottom-color:#818cf8}
        .tgb-back{
          width:100%;background:none;border:1px solid #1f1f28;border-radius:10px;
          padding:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
          color:#44444f;cursor:pointer;transition:background .15s,color .15s,border-color .15s;
        }
        .tgb-back:hover{background:#18181e;color:#7a7a88;border-color:#2a2a36}
        .tgb-unlocked{
          background:#0a1f12;border:1px solid #14532d;border-radius:10px;
          padding:10px 14px;font-size:13px;color:#4ade80;font-weight:500;margin-bottom:1.5rem;
        }
      `}</style>

      <div className="tgb-root">
        <div className={`tgb-card${visible ? ' in' : ''}`}>

          {/* Lock icon */}
          <div className="tgb-lock">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="5" y="12" width="16" height="10" rx="3"
                fill="none" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M8.5 12V8.5a4.5 4.5 0 0 1 9 0V12"
                fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="13" cy="17" r="1.4" fill="#ef4444"/>
              <line x1="13" y1="18.4" x2="13" y2="20.2"
                stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="tgb-title">Account Access Suspended</h1>
          <p className="tgb-sub">
            Suspicious activity was detected on your account.<br/>
            Access has been temporarily blocked for your security.
          </p>

          {/* Countdown ring */}
          <div className="tgb-ring">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1a1a22" strokeWidth="7"/>
              <circle
                cx={CX} cy={CY} r={R} fill="none"
                stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke .6s ease' }}
              />
            </svg>
            <div className="tgb-ring-inner">
              <span className="tgb-ring-time" style={{ color: ringColor }}>
                {cd.formatted}
              </span>
              <span className="tgb-ring-lbl">
                {cd.expired ? 'access restored' : 'until unlock'}
              </span>
            </div>
          </div>

          {cd.expired ? (
            <div className="tgb-unlocked">
              Your account has been automatically unlocked — please try signing in again.
            </div>
          ) : (
            <div className="tgb-pills">
              <div className="tgb-pill">
                <strong>{fmt(details.blockedAt)}</strong>blocked at
              </div>
              <div className="tgb-pill">
                <strong>{fmt(details.blockExpiresAt)}</strong>unlocks at
              </div>
            </div>
          )}

          <hr className="tgb-divider"/>

          {/* Admin contact */}
          <div className="tgb-contact">
            <div className="tgb-ci">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2.5" width="12" height="9" rx="2"
                  stroke="#4b4b5a" strokeWidth="1.2"/>
                <path d="M1 4.5l6 4.5 6-4.5"
                  stroke="#4b4b5a" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="tgb-cb">
              <div className="tgb-ct">Need immediate access?</div>
              <p>If this is a mistake or you require urgent assistance, reach your system administrator.</p>
              <a href={`mailto:${adminEmail}`} className="tgb-cl">
                {adminEmail}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 7.5L7.5 1.5M7.5 1.5H3.5M7.5 1.5v4"
                    stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {onBack && (
            <button className="tgb-back" onClick={onBack}>
              ← Back to sign in
            </button>
          )}

        </div>
      </div>
    </>
  );
}
