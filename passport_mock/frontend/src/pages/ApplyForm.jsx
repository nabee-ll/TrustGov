import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../api';
import { useToast } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const SERVICE_NAMES = {
  new: 'Fresh Passport (Normal) - 36 Pages',
  reissue: 'Re-issue of Passport (Normal)',
  tatkal: 'Fresh Passport (Tatkal) - 36 Pages',
  minor: 'Minor Passport',
  pcc: 'Police Clearance Certificate',
  emergency: 'Emergency Certificate',
};

const SERVICE_TITLES = {
  new: 'Fresh Passport Application',
  reissue: 'Re-issue of Passport',
  tatkal: 'Tatkal Passport Application',
  minor: 'Minor Passport Application',
  pcc: 'Police Clearance Certificate (PCC)',
  emergency: 'Emergency Certificate Application',
};

const DOC_LISTS = {
  new: ['Birth Certificate / School Leaving Certificate', 'Aadhaar Card / Voter ID (Address proof)', '2 recent passport-size photographs', 'Self-attested copies of all documents'],
  minor: ['Birth Certificate (mandatory)', "Parent's valid passport copies", 'School ID / bonafide certificate', 'Consent letter if one parent absent', '2 passport-size photos of minor'],
  reissue: ['Original old passport', 'Self-attested copy of first/last 2 pages', 'Address proof', 'FIR copy if passport lost/stolen'],
  tatkal: ['All Normal passport documents', 'Verification certificate from BDO/SDM', 'Proof of urgency (ticket/employment letter)'],
  pcc: ['Current valid passport (original + copy)', 'Proof of present address', 'Reason for PCC (employment/visa proof)', '2 passport-size photographs'],
  emergency: ['Emergency travel proof (ticket/medical)', 'Proof of identity', 'Old passport if available'],
};

const STEPS = ['Personal Info', 'Family Details', 'Address & Docs', 'Review & Pay'];

export default function ApplyForm() {
  const { type } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feeData, setFeeData] = useState({ baseFee: 1500, dispatch: 50, gst: 279, total: 1829 });
  const [payModal, setPayModal] = useState(false);
  const [submittedArn, setSubmittedArn] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');

  const [personal, setPersonal] = useState({ firstName: user?.firstName || '', middleName: '', lastName: user?.lastName || '', gender: '', dob: user?.dob || '', pob: '', maritalStatus: '', aadhaar: '', pan: '', mobile: user?.mobile || '', email: user?.email || '' });
  const [booklet, setBooklet] = useState({ type: '36 Pages', validity: '10 Years', previousPassport: '' });
  const [family, setFamily] = useState({ fatherFirst: '', fatherLast: '', motherFirst: '', motherLast: '', spouseFirst: '', spouseLast: '', citizenship: 'birth', state: 'Tamil Nadu', district: '' });
  const [address, setAddress] = useState({ house: '', city: '', district: '', state: 'Tamil Nadu', pin: '', policeStation: '', sameAsPermanent: false, permHouse: '', permCity: '', permDistrict: '', permState: 'Tamil Nadu', permPin: '' });
  const [declaration, setDeclaration] = useState(false);

  const serviceType = SERVICE_NAMES[type] || SERVICE_NAMES.new;

  useEffect(() => {
    applicationsAPI.calcFee(serviceType).then(r => setFeeData(r.data)).catch(() => {});
  }, [serviceType]);

  const setP = (k, v) => setPersonal(f => ({ ...f, [k]: v }));
  const setF = (k, v) => setFamily(f => ({ ...f, [k]: v }));
  const setA = (k, v) => setAddress(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const req = ['firstName', 'lastName', 'gender', 'dob', 'pob', 'mobile', 'email'];
    for (const k of req) { if (!personal[k]) { toast(`Please fill: ${k}`, 'error'); return false; } }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 4) setStep(s => s + 1);
  };
  const back = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!declaration) { toast('Please confirm the declaration', 'error'); return; }
    if (!user) { toast('Please login to submit application', 'error'); navigate('/'); return; }
    setLoading(true);
    try {
      const { data } = await applicationsAPI.submit({ serviceType, bookletType: booklet.type, validity: booklet.validity, personalInfo: personal, familyInfo: family, addressInfo: address });
      setSubmittedArn(data.application.arn);
      setPayModal(true);
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setLoading(false); }
  };

  const handlePay = async () => {
    try {
      await applicationsAPI.pay(submittedArn);
      setPayModal(false);
      toast(`Payment successful! ARN: ${submittedArn} 🎉`, 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch { toast('Payment failed. Try again.', 'error'); }
  };

  const STATES = ['Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'Uttar Pradesh'];

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 className="section-title">{SERVICE_TITLES[type] || 'Passport Application'}</h2>
              <p className="section-sub">Fill all required fields carefully. Use capital letters for names.</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
          </div>

          {/* Stepper */}
          <div className="stepper">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const isDone = step > n;
              const isActive = step === n;
              return (
                <React.Fragment key={n}>
                  <div className={`step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                    <div className="step-circle">{isDone ? '✓' : n}</div>
                    <div className="step-info">
                      <div className="step-num">Step {n}</div>
                      <div className="step-label">{label}</div>
                    </div>
                  </div>
                  {n < STEPS.length && <div className={`step-connector ${isDone ? 'done' : ''}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="alert alert-info"><span>ℹ️</span> Enter details exactly as in your supporting documents.</div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>👤 Personal Information</div>
                <div style={{ padding: 20 }}>
                  <div className="form-row cols-3">
                    <div className="form-group"><label>Given Name <span className="req">*</span></label><input className="form-control" value={personal.firstName} onChange={e => setP('firstName', e.target.value)} placeholder="FIRST NAME" /></div>
                    <div className="form-group"><label>Middle Name</label><input className="form-control" value={personal.middleName} onChange={e => setP('middleName', e.target.value)} placeholder="(if any)" /></div>
                    <div className="form-group"><label>Surname <span className="req">*</span></label><input className="form-control" value={personal.lastName} onChange={e => setP('lastName', e.target.value)} placeholder="SURNAME" /></div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Gender <span className="req">*</span></label>
                      <select className="form-control" value={personal.gender} onChange={e => setP('gender', e.target.value)}>
                        <option value="">Select</option><option>Male</option><option>Female</option><option>Transgender</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Date of Birth <span className="req">*</span></label><input className="form-control" type="date" value={personal.dob} onChange={e => setP('dob', e.target.value)} /></div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Place of Birth <span className="req">*</span></label><input className="form-control" value={personal.pob} onChange={e => setP('pob', e.target.value)} placeholder="City, State" /></div>
                    <div className="form-group"><label>Marital Status</label>
                      <select className="form-control" value={personal.maritalStatus} onChange={e => setP('maritalStatus', e.target.value)}>
                        <option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Aadhaar Number</label><input className="form-control" value={personal.aadhaar} onChange={e => setP('aadhaar', e.target.value)} placeholder="12-digit" maxLength={12} /></div>
                    <div className="form-group"><label>PAN Number</label><input className="form-control" value={personal.pan} onChange={e => setP('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Mobile <span className="req">*</span></label><input className="form-control" type="tel" value={personal.mobile} onChange={e => setP('mobile', e.target.value)} placeholder="10-digit" maxLength={10} /></div>
                    <div className="form-group"><label>Email <span className="req">*</span></label><input className="form-control" type="email" value={personal.email} onChange={e => setP('email', e.target.value)} placeholder="Valid email" /></div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>🛂 Passport Booklet</div>
                <div style={{ padding: 20 }}>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Booklet Type</label>
                      <select className="form-control" value={booklet.type} onChange={e => setBooklet(b => ({ ...b, type: e.target.value }))}>
                        <option>36 Pages (Normal)</option><option>60 Pages (Jumbo)</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Validity</label>
                      <select className="form-control" value={booklet.validity} onChange={e => setBooklet(b => ({ ...b, validity: e.target.value }))}>
                        <option>10 Years</option><option>5 Years (Minor)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label>Previous Passport Number (if any)</label><input className="form-control" value={booklet.previousPassport} onChange={e => setBooklet(b => ({ ...b, previousPassport: e.target.value }))} placeholder="Leave blank if first passport" /></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={next}>Next: Family Details →</button>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>👨‍👩‍👧 Family Information</div>
                <div style={{ padding: 20 }}>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Father's Given Name <span className="req">*</span></label><input className="form-control" value={family.fatherFirst} onChange={e => setF('fatherFirst', e.target.value)} /></div>
                    <div className="form-group"><label>Father's Surname <span className="req">*</span></label><input className="form-control" value={family.fatherLast} onChange={e => setF('fatherLast', e.target.value)} /></div>
                    <div className="form-group"><label>Mother's Given Name <span className="req">*</span></label><input className="form-control" value={family.motherFirst} onChange={e => setF('motherFirst', e.target.value)} /></div>
                    <div className="form-group"><label>Mother's Surname <span className="req">*</span></label><input className="form-control" value={family.motherLast} onChange={e => setF('motherLast', e.target.value)} /></div>
                    <div className="form-group"><label>Spouse's Given Name</label><input className="form-control" value={family.spouseFirst} onChange={e => setF('spouseFirst', e.target.value)} placeholder="(if applicable)" /></div>
                    <div className="form-group"><label>Spouse's Surname</label><input className="form-control" value={family.spouseLast} onChange={e => setF('spouseLast', e.target.value)} placeholder="(if applicable)" /></div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>🌍 Citizenship</div>
                <div style={{ padding: 20 }}>
                  <div className="form-group">
                    <label>How did you acquire Indian Citizenship?</label>
                    <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                      {['birth', 'descent', 'registration', 'naturalization'].map(v => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
                          <input type="radio" name="citizenship" value={v} checked={family.citizenship === v} onChange={() => setF('citizenship', v)} style={{ accentColor: '#003580' }} /> By {v.charAt(0).toUpperCase() + v.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>State of Citizenship</label>
                      <select className="form-control" value={family.state} onChange={e => setF('state', e.target.value)}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>District</label><input className="form-control" value={family.district} onChange={e => setF('district', e.target.value)} placeholder="Your district" /></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={back}>← Back</button>
                <button className="btn btn-primary" onClick={next}>Next: Address & Docs →</button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>🏠 Present Address</div>
                <div style={{ padding: 20 }}>
                  <div className="form-group"><label>House / Flat No. <span className="req">*</span></label><input className="form-control" value={address.house} onChange={e => setA('house', e.target.value)} /></div>
                  <div className="form-group"><label>City / Town <span className="req">*</span></label><input className="form-control" value={address.city} onChange={e => setA('city', e.target.value)} /></div>
                  <div className="form-row cols-3">
                    <div className="form-group"><label>District</label><input className="form-control" value={address.district} onChange={e => setA('district', e.target.value)} /></div>
                    <div className="form-group"><label>State</label><select className="form-control" value={address.state} onChange={e => setA('state', e.target.value)}>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div className="form-group"><label>PIN Code</label><input className="form-control" value={address.pin} onChange={e => setA('pin', e.target.value)} maxLength={6} /></div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                    <input type="checkbox" checked={address.sameAsPermanent} onChange={e => setA('sameAsPermanent', e.target.checked)} style={{ accentColor: '#003580' }} />
                    Permanent address is same as present address
                  </label>
                </div>
              </div>
              {!address.sameAsPermanent && (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                  <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>📌 Permanent Address</div>
                  <div style={{ padding: 20 }}>
                    <div className="form-group"><label>House / Flat No.</label><input className="form-control" value={address.permHouse} onChange={e => setA('permHouse', e.target.value)} /></div>
                    <div className="form-group"><label>City / Town</label><input className="form-control" value={address.permCity} onChange={e => setA('permCity', e.target.value)} /></div>
                    <div className="form-row cols-3">
                      <div className="form-group"><label>District</label><input className="form-control" value={address.permDistrict} onChange={e => setA('permDistrict', e.target.value)} /></div>
                      <div className="form-group"><label>State</label><select className="form-control" value={address.permState} onChange={e => setA('permState', e.target.value)}>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                      <div className="form-group"><label>PIN Code</label><input className="form-control" value={address.permPin} onChange={e => setA('permPin', e.target.value)} maxLength={6} /></div>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>📎 Document Upload</div>
                <div style={{ padding: 20 }}>
                  <div className="alert alert-warning"><span>⚠️</span>Upload clear colour scans. Max 1 MB each. Accepted: JPG, PNG, PDF</div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>DOB Proof <span className="req">*</span></label><input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf" /></div>
                    <div className="form-group"><label>Address Proof <span className="req">*</span></label><input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf" /></div>
                    <div className="form-group"><label>Photo ID Proof <span className="req">*</span></label><input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf" /></div>
                    <div className="form-group"><label>Applicant Photograph <span className="req">*</span></label><input type="file" className="form-control" accept=".jpg,.jpeg,.png" /></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={back}>← Back</button>
                <button className="btn btn-primary" onClick={next}>Next: Review & Pay →</button>
              </div>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <div className="alert alert-warning"><span>⚠️</span>Review your application carefully. Once submitted, changes cannot be made.</div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>📋 Application Summary</div>
                <div style={{ padding: 20 }}>
                  <div className="form-row cols-2">
                    {[['Service Type', serviceType], ['Applicant Name', `${personal.firstName} ${personal.lastName}`], ['Date of Birth', personal.dob], ['Gender', personal.gender], ['Mobile', personal.mobile], ['Email', personal.email]].map(([k, v]) => (
                      <div key={k}><div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{k}</div><div style={{ fontWeight: 600, marginTop: 2 }}>{v || '—'}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>📁 Document Checklist</div>
                <div style={{ padding: 20 }}>
                  {(DOC_LISTS[type] || DOC_LISTS.new).map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < (DOC_LISTS[type] || DOC_LISTS.new).length - 1 ? '1px dashed #d0d9ec' : 'none', fontSize: 13 }}>
                      <span style={{ color: '#15803d' }}>☐</span> {d}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #d0d9ec', marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fc', padding: '12px 20px', fontWeight: 700, color: '#003580', borderBottom: '1px solid #d0d9ec', fontSize: 14 }}>💰 Fee Details</div>
                <div style={{ padding: 20 }}>
                  <div className="fee-row"><span>Application Fee</span><span style={{ fontWeight: 700 }}>₹{feeData.baseFee?.toLocaleString('en-IN')}</span></div>
                  <div className="fee-row"><span>Speed Post Charges</span><span style={{ fontWeight: 700 }}>₹{feeData.dispatch}</span></div>
                  <div className="fee-row"><span>GST (18%)</span><span style={{ fontWeight: 700 }}>₹{feeData.gst?.toLocaleString('en-IN')}</span></div>
                  <div className="fee-total"><span>Total Payable</span><span>₹{feeData.total?.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, cursor: 'pointer', marginBottom: 20 }}>
                <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} style={{ accentColor: '#003580', marginTop: 2 }} />
                I confirm that all information provided is accurate and I accept full responsibility for any discrepancy found.
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={back}>← Back</button>
                <button className="btn btn-green btn-lg" onClick={handleSubmit} disabled={loading || !declaration}>
                  {loading ? 'Submitting...' : '✅ Submit & Pay Now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #d0d9ec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#003580', fontSize: 16, fontWeight: 700 }}>💳 Fee Payment</h3>
              <button onClick={() => setPayModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div className="alert alert-warning"><span>⚠️</span>This is a demo. No real payment will be processed.</div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header light">📋 Payment Summary</div>
                <div className="card-body">
                  <div className="fee-row"><span>Application Fee</span><span style={{ fontWeight: 700 }}>₹{feeData.baseFee?.toLocaleString('en-IN')}</span></div>
                  <div className="fee-row"><span>Speed Post</span><span style={{ fontWeight: 700 }}>₹{feeData.dispatch}</span></div>
                  <div className="fee-row"><span>GST</span><span style={{ fontWeight: 700 }}>₹{feeData.gst?.toLocaleString('en-IN')}</span></div>
                  <div className="fee-total"><span>Total</span><span>₹{feeData.total?.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option>UPI</option><option>Credit / Debit Card</option><option>Net Banking</option><option>Paytm / PhonePe</option>
                </select>
              </div>
              {payMethod === 'Credit / Debit Card' && (
                <>
                  <div className="form-group"><label>Card Number</label><input className="form-control" placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                  <div className="form-row cols-2">
                    <div className="form-group"><label>Expiry</label><input className="form-control" placeholder="MM/YY" /></div>
                    <div className="form-group"><label>CVV</label><input className="form-control" type="password" placeholder="•••" /></div>
                  </div>
                </>
              )}
              {payMethod === 'UPI' && (
                <div className="form-group"><label>UPI ID</label><input className="form-control" placeholder="yourname@upi" /></div>
              )}
              <button className="btn btn-green btn-full btn-lg" onClick={handlePay}>🔒 Pay ₹{feeData.total?.toLocaleString('en-IN')} Securely</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
