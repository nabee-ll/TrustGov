// MyReturns.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function MyReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

    useEffect(() => {
        axios.get('/api/tax/returns').then(r => setReturns(r.data)).finally(() => setLoading(false));
    }, []);

    const badge = s => {
        const m = { 'Filed': 'badge-info', 'Processing': 'badge-warning', 'Refund Initiated': 'badge-warning', 'Refund Credited': 'badge-success', 'Verified': 'badge-success' };
        return m[s] || 'badge-info';
    };

    return (
        <div className="container main-content">
            <h1 className="page-title">My Returns</h1>
            <p className="page-sub">All ITRs filed by you</p>
            <div className="card">
                {loading ? <p style={{ color: '#6b7593' }}>Loading returns…</p> :
                    returns.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7593' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                            <p>No returns filed yet.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Ack Number</th><th>AY</th><th>Form</th><th>Regime</th><th>Gross Income</th><th>Tax Payable</th><th>TDS</th><th>Refund</th><th>Status</th><th>Filed On</th></tr>
                                </thead>
                                <tbody>
                                    {returns.map(r => (
                                        <tr key={r._id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.ackNumber}</td>
                                            <td>{r.assessmentYear}</td>
                                            <td>{r.itrForm}</td>
                                            <td>{r.regime === 'new' ? 'New' : 'Old'}</td>
                                            <td>{fmt(r.grossIncome)}</td>
                                            <td>{fmt(r.taxPayable)}</td>
                                            <td>{fmt(r.tdsDeducted)}</td>
                                            <td style={{ color: '#0a7c42', fontWeight: 600 }}>{fmt(r.refundAmount)}</td>
                                            <td><span className={`badge ${badge(r.status)}`}>{r.status}</span></td>
                                            <td style={{ fontSize: 12, color: '#6b7593' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </div>
    );
}

// TaxCalculator.js
export function TaxCalculator() {
    const [form, setForm] = useState({ gross_income: '', regime: 'new', age: 'below60' });
    const [deduct, setDeduct] = useState({ section_80c: '', section_80d: '', hra: '', standard_deduction: '50000', other_deductions: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

    const handleCalc = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await axios.post('/api/tax/calculate', {
                gross_income: form.gross_income, regime: form.regime, age: form.age,
                deduction_details: form.regime === 'old' ? deduct : undefined,
            });
            setResult(data);
        } catch (err) { setError(err.response?.data?.error || 'Calculation failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="container main-content" style={{ maxWidth: 700 }}>
            <h1 className="page-title">Tax Calculator</h1>
            <p className="page-sub">Estimate your income tax for FY 2024-25</p>
            <div className="card">
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleCalc}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Gross Annual Income (₹)</label>
                            <input type="number" value={form.gross_income} onChange={e => setForm(f => ({ ...f, gross_income: e.target.value }))} placeholder="e.g. 800000" required min="0" />
                        </div>
                        <div className="form-group">
                            <label>Tax Regime</label>
                            <select value={form.regime} onChange={e => setForm(f => ({ ...f, regime: e.target.value }))}>
                                <option value="new">New Regime</option>
                                <option value="old">Old Regime</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ maxWidth: 280 }}>
                        <label>Age Category</label>
                        <select value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}>
                            <option value="below60">Below 60</option>
                            <option value="senior">Senior (60-80)</option>
                            <option value="super_senior">Super Senior (80+)</option>
                        </select>
                    </div>
                    {form.regime === 'old' && (
                        <div style={{ background: '#f4f6fb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, color: '#002060', marginBottom: 12 }}>Deductions (Old Regime)</p>
                            <div className="form-row">
                                {[['section_80c', '80C (Max ₹1.5L)'], ['section_80d', '80D (Max ₹75K)'], ['hra', 'HRA'], ['other_deductions', 'Other']].map(([k, l]) => (
                                    <div className="form-group" key={k}>
                                        <label>{l}</label>
                                        <input type="number" value={deduct[k]} onChange={e => setDeduct(d => ({ ...d, [k]: e.target.value }))} placeholder="0" min="0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Calculating…' : 'Calculate Tax'}</button>
                </form>

                {result && (
                    <div style={{ marginTop: 24, borderTop: '2px solid #dce3f0', paddingTop: 20 }}>
                        <h3 style={{ fontFamily: 'Playfair Display,serif', color: '#002060', marginBottom: 16 }}>Tax Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            {[
                                ['Gross Income', fmt(result.gross_income)],
                                ['Total Deductions', fmt(result.total_deductions)],
                                ['Taxable Income', fmt(result.taxable_income)],
                                ['Base Tax', fmt(result.tax_breakdown.tax)],
                                ['Surcharge', fmt(result.tax_breakdown.surcharge)],
                                ['Health & Ed. Cess', fmt(result.tax_breakdown.cess)],
                            ].map(([l, v]) => (
                                <div key={l} style={{ background: '#f4f6fb', borderRadius: 6, padding: '10px 14px' }}>
                                    <div style={{ fontSize: 11, color: '#6b7593', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#002060' }}>{v}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#002060', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>TOTAL TAX PAYABLE</div>
                                <div style={{ color: '#f7a800', fontSize: 28, fontWeight: 800, fontFamily: 'Playfair Display,serif' }}>{fmt(result.tax_breakdown.total)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>EFFECTIVE RATE</div>
                                <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{result.effective_rate}%</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// RefundStatus.js
export function RefundStatus() {
    const [form, setForm] = useState({ pan: '', assessment_year: 'AY 2024-25' });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    const AYS = ['AY 2024-25', 'AY 2023-24', 'AY 2022-23'];

    const handleCheck = async e => {
        e.preventDefault(); setError(''); setData(null); setLoading(true);
        try {
            const { data: d } = await axios.post('/api/refund/check', form);
            setData(d);
        } catch (err) { setError(err.response?.data?.error || 'No record found'); }
        finally { setLoading(false); }
    };

    return (
        <div className="container main-content" style={{ maxWidth: 660 }}>
            <h1 className="page-title">Refund Status</h1>
            <p className="page-sub">Track your income tax refund</p>
            <div className="card">
                <form onSubmit={handleCheck}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>PAN Number</label>
                            <input value={form.pan} onChange={e => setForm(f => ({ ...f, pan: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} required />
                        </div>
                        <div className="form-group">
                            <label>Assessment Year</label>
                            <select value={form.assessment_year} onChange={e => setForm(f => ({ ...f, assessment_year: e.target.value }))}>
                                {AYS.map(a => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Check Refund Status'}</button>
                </form>

                {data && (
                    <div style={{ marginTop: 24, borderTop: '2px solid #dce3f0', paddingTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7593' }}>PAN</div>
                                <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{data.pan}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7593' }}>Assessment Year</div>
                                <div style={{ fontWeight: 700 }}>{data.assessment_year}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#6b7593' }}>Refund Amount</div>
                                <div style={{ fontWeight: 800, fontSize: 20, color: '#0a7c42' }}>{fmt(data.refund_amount)}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            {data.steps.map((s, i) => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < data.current_step ? '#0a7c42' : '#dce3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < data.current_step ? '#fff' : '#6b7593', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                        {i < data.current_step ? '✓' : i + 1}
                                    </div>
                                    <div style={{ flex: 1, borderBottom: '1px solid #f0f2f8', paddingBottom: 10 }}>
                                        <span style={{ fontWeight: i === data.current_step - 1 ? 700 : 400, color: i < data.current_step ? '#0a7c42' : i === data.current_step ? '#002060' : '#6b7593' }}>{s}</span>
                                        {i === data.current_step - 1 && <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 11 }}>Current</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Profile.js
export function Profile() {
    const { user: ctxUser } = require('../context/AuthContext').useAuth ? require('../context/AuthContext').useAuth() : { user: null };
    return <ProfileInner ctxUser={ctxUser} />;
}

function ProfileInner({ ctxUser }) {
    const [user, setUser] = useState(ctxUser);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const startEdit = () => { setForm({ email: user?.email || '', mobile: user?.mobile || '', address: user?.address || '', city: user?.city || '', state: user?.state || '', pincode: user?.pincode || '' }); setEdit(true); setMsg(''); };

    const handleSave = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await axios.put('/api/user/profile', form);
            setUser(data.user); setEdit(false); setMsg('Profile updated successfully!');
        } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
        finally { setLoading(false); }
    };

    if (!user) return <div className="container main-content"><p>Loading…</p></div>;

    return (
        <div className="container main-content" style={{ maxWidth: 700 }}>
            <div className="flex-between" style={{ marginBottom: 24 }}>
                <div><h1 className="page-title">My Profile</h1><p className="page-sub">Your registered details</p></div>
                {!edit && <button className="btn btn-secondary" onClick={startEdit}>✏️ Edit</button>}
            </div>
            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {[['PAN Number', user.pan], ['Full Name', user.name], ['Date of Birth', user.dob], ['Aadhaar', user.aadhaar || '—'], ['Email', user.email], ['Mobile', user.mobile]].map(([l, v]) => (
                        <div key={l}>
                            <div style={{ fontSize: 11, color: '#6b7593', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1f36', marginTop: 2 }}>{v}</div>
                        </div>
                    ))}
                </div>
                <div className="divider" />
                {!edit ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {[['Address', user.address || '—'], ['City', user.city || '—'], ['State', user.state || '—'], ['Pincode', user.pincode || '—']].map(([l, v]) => (
                            <div key={l}>
                                <div style={{ fontSize: 11, color: '#6b7593', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1f36', marginTop: 2 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="form-row">
                            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                            <div className="form-group"><label>Mobile</label><input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
                        </div>
                        <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                        <div className="form-row">
                            <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                            <div className="form-group"><label>State</label><input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
                            <div className="form-group"><label>Pincode</label><input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                        </div>
                        <div className="flex-between">
                            <button type="button" className="btn btn-secondary" onClick={() => setEdit(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}