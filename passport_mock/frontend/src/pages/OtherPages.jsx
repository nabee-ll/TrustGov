import React, { useState, useEffect } from 'react';
import { officesAPI, grievancesAPI } from '../api';
import { useToast, HelplineCard } from '../components/UI';

// ── Offices ──────────────────────────────────────────────────
export function Offices() {
  const [offices, setOffices] = useState([]);
  const [q, setQ] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [states, setStates] = useState([]);

  useEffect(() => {
    officesAPI.getStates().then(r => setStates(r.data.states)).catch(() => {});
    load();
  }, []);

  const load = (params = {}) => officesAPI.getAll(params).then(r => setOffices(r.data.offices)).catch(() => {});

  const filter = () => load({ q, state: stateFilter, type: typeFilter });

  const TYPE_COLORS = { RPO: '#003580', PSK: '#15803d', POPSK: '#d97706' };

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Passport Seva Offices</h2>
        <p className="section-sub">Find your nearest Passport Seva Kendra or Regional Passport Office</p>
        <div className="form-row cols-3" style={{ marginBottom: 24 }}>
          <div className="form-group"><label>Search by City / Name</label><input className="form-control" value={q} onChange={e => setQ(e.target.value)} placeholder="Type city or office name..." /></div>
          <div className="form-group"><label>State</label>
            <select className="form-control" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              <option value="">All States</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Type</label>
            <select className="form-control" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="RPO">Regional Passport Office (RPO)</option>
              <option value="PSK">Passport Seva Kendra (PSK)</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}><button className="btn btn-saffron btn-sm" onClick={filter}>🔍 Search Offices</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {offices.map(o => (
            <div key={o.id} className="card" style={{ transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#003580'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,53,128,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#d0d9ec'; e.currentTarget.style.boxShadow=''; }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#003580' }}>{o.name}</h4>
                  <span style={{ background: TYPE_COLORS[o.type] || '#003580', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{o.type}</span>
                </div>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>📍 {o.address}</p>
                {o.phone && <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>📞 {o.phone}</p>}
                {o.hours && <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>🕐 {o.hours}</p>}
                {o.email && <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>📧 {o.email}</p>}
              </div>
            </div>
          ))}
          {offices.length === 0 && <p style={{ color: '#475569', padding: 20, gridColumn: '1/-1' }}>No offices found. Try a different search.</p>}
        </div>
      </div>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
const FAQ_DATA = [
  { q: 'How do I apply for a new passport?', a: 'Register on the Passport Seva portal, fill the online application form, pay the fee, and book an appointment at your nearest PSK. Attend the PSK on the appointment date with original documents.' },
  { q: 'What is the fee for a fresh passport?', a: 'Fresh Passport (36 pages, Normal) costs ₹1,500 + ₹50 Speed Post + GST. Tatkal costs ₹3,500. Minor passport is ₹1,000. Use the Fee Calculator on this portal for exact amounts.' },
  { q: 'How long does it take to get a passport?', a: 'Normal applications typically take 30-45 days after successful police verification. Tatkal applications are processed within 7-14 working days.' },
  { q: 'What documents do I need for a fresh passport?', a: 'Proof of Date of Birth (Birth Certificate/School Certificate), Proof of Address (Aadhaar/Voter ID/Utility bills), and recent passport-size photographs. Use the Document Advisor tool for a personalized checklist.' },
  { q: 'Can I track my passport application online?', a: 'Yes! Use the Track Application Status section on the homepage. Enter your ARN (Application Reference Number) and Date of Birth to check real-time status.' },
  { q: 'What is the Tatkal scheme?', a: 'Tatkal is an urgent passport processing scheme. It costs ₹2,000 extra over the normal fee and processes within 7-14 days. Additional document verification may be required.' },
  { q: 'How do I book a PSK appointment?', a: 'After completing the online application and paying the fee, go to Book Appointment, select your state, choose a PSK, pick an available date and time slot, and confirm.' },
  { q: 'My passport is expiring. How do I re-issue?', a: 'Apply for Re-issue under Apply Online. You can re-issue up to 1 year before expiry. Submit the old passport along with address and identity proof.' },
  { q: 'What if I lose my passport?', a: 'Immediately report the loss to the nearest police station and get an FIR. Then apply for Re-issue of Passport (Reason: Lost/Stolen) on this portal with the FIR copy.' },
  { q: 'Is Aadhaar mandatory for passport application?', a: 'Aadhaar is not mandatory but is accepted as address and identity proof. Providing Aadhaar may expedite police verification through the National Database.' },
  { q: 'Can a minor get a passport?', a: 'Yes. Minors can get a passport valid for 5 years or until they turn 18. Both parents must be present at PSK, or a consent letter from the absent parent is required.' },
  { q: 'What is a Police Clearance Certificate (PCC)?', a: 'PCC certifies that the applicant has no criminal record. It is required for immigration, employment abroad, and foreign residency applications.' },
];

export function FAQ() {
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const filtered = FAQ_DATA.filter(f => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub">Find answers to the most common questions about passport services</p>
        <input className="form-control" style={{ maxWidth: 400, marginBottom: 24 }} value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Search FAQs..." />
        {filtered.map((f, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span style={{ transition: 'transform 0.2s', transform: open === i ? 'rotate(180deg)' : 'none', fontSize: 12, color: '#475569' }}>▼</span>
            </div>
            {open === i && <div className="faq-a">{f.a}</div>}
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: '#475569' }}>No FAQs found for "{q}".</p>}
      </div>
    </div>
  );
}

// ── Document Advisor ──────────────────────────────────────────
const DOC_DATA = {
  new: ['✅ Birth Certificate / School Leaving Certificate (DOB proof)', '✅ Aadhaar Card / Voter ID / Driving Licence (Address proof)', '✅ 2 recent passport-size colour photographs (51mm × 51mm)', '✅ Self-attested copies of all documents'],
  minor: ["✅ Birth Certificate (mandatory for minors)", "✅ Parent's valid passport copies", '✅ School ID / bonafide certificate', '✅ Consent letter if only one parent present', '✅ 2 passport-size photos of the minor'],
  reissue: ['✅ Original old passport (submit at PSK)', '✅ Self-attested copy of first and last 2 pages', '✅ Address proof (Aadhaar / Utility bill)', '✅ FIR copy if passport is lost/stolen'],
  tatkal: ['✅ All documents required for Normal passport', '✅ Verification certificate from BDO/SDM/Tehsildar', '✅ Proof of urgency (travel ticket / medical / employment letter)'],
  pcc: ['✅ Current valid passport (original + copy)', '✅ Proof of present address', '✅ Reason for PCC (employment/visa/immigration proof)', '✅ 2 passport-size photographs'],
};

export function DocAdvisor() {
  const [type, setType] = useState('');
  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Document Advisor Tool</h2>
        <p className="section-sub">Answer a few questions to find out exactly which documents you need</p>
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header navy">Step 1: Select Service</div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>What service are you applying for?</label>
                <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
                  <option value="">Select service...</option>
                  <option value="new">Fresh Passport (Adult)</option>
                  <option value="minor">Minor Passport (below 18)</option>
                  <option value="reissue">Re-issue (Expired/Damaged/Lost)</option>
                  <option value="tatkal">Tatkal Passport</option>
                  <option value="pcc">Police Clearance Certificate</option>
                </select>
              </div>
            </div>
          </div>
          {type && (
            <div className="card">
              <div className="card-header green">📄 Required Documents</div>
              <div className="card-body">
                {DOC_DATA[type].map((d, i) => (
                  <div key={i} style={{ padding: '9px 0', borderBottom: i < DOC_DATA[type].length - 1 ? '1px dashed #d0d9ec' : 'none', fontSize: 13 }}>{d}</div>
                ))}
                <div className="alert alert-info" style={{ marginBottom: 0, marginTop: 16 }}>
                  <span>ℹ️</span> Carry originals + self-attested copies of all documents to your PSK appointment.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Fee Calculator ─────────────────────────────────────────────
const FEE_MAP = {
  'Fresh Passport – 36 pages (Normal)': 1500,
  'Fresh Passport – 60 pages (Normal)': 2000,
  'Fresh Passport – 36 pages (Tatkal)': 3500,
  'Fresh Passport – 60 pages (Tatkal)': 4000,
  'Minor Passport – 36 pages': 1000,
  'Re-issue of Passport (Normal)': 1500,
  'Re-issue of Passport (Tatkal)': 3500,
  'Police Clearance Certificate': 500,
  'Emergency Certificate': 250,
};

export function FeeCalculator() {
  const [service, setService] = useState('Fresh Passport – 36 pages (Normal)');
  const [dispatch, setDispatch] = useState(50);
  const fee = FEE_MAP[service] || 1500;
  const gst = Math.round((fee + dispatch) * 0.18);
  const total = fee + dispatch + gst;

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Fee Calculator</h2>
        <p className="section-sub">Calculate the exact fee payable for your passport application</p>
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header navy">🧮 Select Options</div>
            <div className="card-body">
              <div className="form-group">
                <label>Service Type <span className="req">*</span></label>
                <select className="form-control" value={service} onChange={e => setService(e.target.value)}>
                  {Object.keys(FEE_MAP).map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Mode of Dispatch</label>
                <select className="form-control" value={dispatch} onChange={e => setDispatch(Number(e.target.value))}>
                  <option value={50}>Speed Post (₹50)</option>
                  <option value={0}>Applicant will collect (₹0)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header saffron">💰 Fee Breakdown</div>
            <div className="card-body">
              <div className="fee-row"><span>Application Fee</span><span style={{ fontWeight: 700 }}>₹{fee.toLocaleString('en-IN')}</span></div>
              <div className="fee-row"><span>Dispatch Charges</span><span style={{ fontWeight: 700 }}>₹{dispatch}</span></div>
              <div className="fee-row"><span>GST (18%)</span><span style={{ fontWeight: 700 }}>₹{gst.toLocaleString('en-IN')}</span></div>
              <div className="fee-total"><span>Total Amount Payable</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              <p style={{ fontSize: 11, color: '#475569', marginTop: 12 }}>*Fees subject to revision. GST applicable as per government norms.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grievance ──────────────────────────────────────────────────
export function Grievance() {
  const toast = useToast();
  const [form, setForm] = useState({ arn: '', category: '', subject: '', description: '', name: '', mobile: '', email: '' });
  const [trackGrn, setTrackGrn] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.subject || !form.description || !form.name || !form.mobile) { toast('Please fill all required fields', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await grievancesAPI.submit(form);
      toast(`Grievance registered! GRN: ${data.grn}`, 'success');
      setForm({ arn: '', category: '', subject: '', description: '', name: '', mobile: '', email: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setLoading(false); }
  };

  const trackGrievance = async () => {
    if (!trackGrn) { toast('Enter GRN', 'error'); return; }
    try {
      const { data } = await grievancesAPI.track(trackGrn);
      toast(`Status: ${data.grievance.status}`, 'info');
    } catch { toast('GRN not found', 'error'); }
  };

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Grievance Redressal</h2>
        <p className="section-sub">Submit your grievance and track its resolution status</p>
        <div className="two-col">
          <div className="card">
            <div className="card-header navy">📢 Submit Grievance</div>
            <div className="card-body">
              <div className="form-group"><label>ARN / File Number</label><input className="form-control" value={form.arn} onChange={e => set('arn', e.target.value)} placeholder="Your application reference" /></div>
              <div className="form-group"><label>Category <span className="req">*</span></label>
                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select</option>
                  {['Delay in Passport Issuance','Wrong Entry in Passport','Passport Not Received','Appointment Related','Police Verification Delay','Payment Related','Staff Misconduct','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Subject <span className="req">*</span></label><input className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief subject" /></div>
              <div className="form-group"><label>Description <span className="req">*</span></label><textarea className="form-control" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your issue..." /></div>
              <div className="form-row cols-2">
                <div className="form-group"><label>Name <span className="req">*</span></label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div className="form-group"><label>Mobile <span className="req">*</span></label><input className="form-control" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : '📩 Submit Grievance'}</button>
            </div>
          </div>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header light">🔍 Track Grievance</div>
              <div className="card-body">
                <div className="form-group"><label>Grievance Registration Number</label><input className="form-control" value={trackGrn} onChange={e => setTrackGrn(e.target.value)} placeholder="e.g. GR2026031600001" /></div>
                <button className="btn btn-outline btn-full" onClick={trackGrievance}>Track Status</button>
              </div>
            </div>
            <div className="card">
              <div className="card-header light">📞 Escalation Contacts</div>
              <div className="card-body">
                {[['National Helpline', '1800-258-1800 (Toll Free)'], ['CPV Division, MEA', 'consular@mea.gov.in'], ['Online RTI', 'rtionline.gov.in']].map(([k, v]) => (
                  <div key={k} style={{ padding: '9px 0', borderBottom: '1px dashed #d0d9ec', fontSize: 13 }}>
                    <strong>{k}</strong><br /><span style={{ color: '#475569' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Photo Guidelines ───────────────────────────────────────────
export function PhotoGuidelines() {
  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Photograph Guidelines</h2>
        <p className="section-sub">Passport photographs must meet these specifications to avoid rejection</p>
        <div className="two-col">
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header navy">✅ Accepted Requirements</div>
              <div className="card-body">
                <ul style={{ paddingLeft: 20, lineHeight: 2.3, fontSize: 13 }}>
                  {[['Size', '51mm × 51mm (2 × 2 inches)'], ['Background', 'Plain white or off-white'], ['Face', 'Full face, front view, eyes open'], ['Head', 'Centered, 1–1⅓ inch face height'], ['Expression', 'Neutral, mouth closed'], ['Glasses', 'Not allowed (since 2016)'], ['Head Covering', 'Not allowed (except religious)'], ['Print', 'Colour photo on matte finish'], ['Age', 'Taken within last 6 months']].map(([k, v]) => (
                    <li key={k}><strong>{k}:</strong> {v}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-header" style={{ background: '#fee2e2', color: '#991b1b' }}>❌ Common Rejection Reasons</div>
              <div className="card-body">
                <ul style={{ paddingLeft: 20, lineHeight: 2.2, fontSize: 13, color: '#475569' }}>
                  {['Blurry, grainy or pixelated photo', 'Shadows on face or background', 'Sunglasses or tinted glasses', 'Hair covering face or eyes', 'Hat, cap or non-religious head covering', 'Edited / digitally altered photo', 'Black & white or sepia-toned photo', 'Torn, creased or stapled photo'].map(r => <li key={r}>{r}</li>)}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
              <div className="card-header navy">📸 Sample Photos</div>
              <div className="card-body">
                <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 300 }}>
                  <rect x="10" y="20" width="100" height="120" rx="4" fill="#e0e8f0" stroke="#003580" strokeWidth="2"/>
                  <circle cx="60" cy="65" r="22" fill="#f5d5b0"/>
                  <ellipse cx="60" cy="115" rx="28" ry="18" fill="#4a90d9"/>
                  <circle cx="53" cy="62" r="3" fill="#333"/><circle cx="67" cy="62" r="3" fill="#333"/>
                  <path d="M 53 74 Q 60 80 67 74" stroke="#a06040" strokeWidth="1.5" fill="none"/>
                  <rect x="10" y="140" width="100" height="10" rx="2" fill="#15803d"/>
                  <text x="60" y="148" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif">✓ CORRECT</text>
                  <text x="60" y="168" textAnchor="middle" fontSize="9" fill="#15803d" fontFamily="sans-serif" fontWeight="bold">ACCEPTED ✅</text>
                  <rect x="150" y="20" width="100" height="120" rx="4" fill="#fff0f0" stroke="#dc2626" strokeWidth="2"/>
                  <circle cx="200" cy="65" r="22" fill="#f5d5b0"/>
                  <ellipse cx="200" cy="115" rx="28" ry="18" fill="#888"/>
                  <circle cx="193" cy="62" r="3" fill="#333"/><circle cx="207" cy="62" r="3" fill="#333"/>
                  <rect x="185" y="58" width="12" height="8" rx="4" fill="#222" opacity="0.8"/>
                  <rect x="200" y="58" width="12" height="8" rx="4" fill="#222" opacity="0.8"/>
                  <line x1="197" y1="62" x2="200" y2="62" stroke="#333" strokeWidth="1.5"/>
                  <rect x="150" y="140" width="100" height="10" rx="2" fill="#dc2626"/>
                  <text x="200" y="148" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif">✗ INCORRECT</text>
                  <text x="200" y="168" textAnchor="middle" fontSize="9" fill="#dc2626" fontFamily="sans-serif" fontWeight="bold">REJECTED ❌</text>
                </svg>
                <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>Left: Accepted &nbsp;|&nbsp; Right: Rejected (glasses)</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header light">📏 Dimension Guide</div>
              <div className="card-body">
                {[['Photo Size', '51mm × 51mm'], ['Face Height', '25–35mm (70–80%)'], ['Eye Line', '55–70% from bottom'], ['Resolution', 'Min. 600 DPI'], ['File Size (upload)', 'Max 1 MB']].map(([k, v]) => (
                  <div key={k} className="fee-row"><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Contact ────────────────────────────────────────────────────
export function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', subject: 'General Enquiry', message: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p className="section-sub">Reach us through multiple channels for support</p>
        <div className="two-col">
          <div className="card">
            <div className="card-header navy">📩 Send a Message</div>
            <div className="card-body">
              <div className="form-row cols-2">
                <div className="form-group"><label>Name <span className="req">*</span></label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div className="form-group"><label>Mobile <span className="req">*</span></label><input className="form-control" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Email <span className="req">*</span></label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div className="form-group"><label>Subject</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  {['General Enquiry','Application Status','Technical Issue','Fee Related','Appointment Issue','Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Message <span className="req">*</span></label><textarea className="form-control" rows={5} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Describe your query..." /></div>
              <button className="btn btn-primary btn-full" onClick={() => { if (!form.name || !form.email || !form.message) { toast('Fill all required fields', 'error'); return; } toast('Message sent! We will reply within 2 working days.', 'success'); setForm(f => ({ ...f, message: '' })); }}>📤 Send Message</button>
            </div>
          </div>
          <div>
            <HelplineCard />
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header light">🏢 Head Office</div>
              <div className="card-body" style={{ fontSize: 13, lineHeight: 1.9, color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>CPV Division</strong><br />
                Ministry of External Affairs<br />
                Patiala House Annexe<br />
                Tilak Marg, New Delhi – 110 001<br /><br />
                📧 consular@mea.gov.in<br />
                📞 +91-11-2338-6559
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
