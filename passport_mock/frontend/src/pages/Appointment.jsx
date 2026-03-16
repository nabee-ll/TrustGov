import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, officesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/UI';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PSK_MAP = {
  'Tamil Nadu': ['Chennai PSK, Anna Nagar','Chennai PSK, Taramani','Coimbatore POPSK','Madurai POPSK'],
  'Karnataka': ['Bengaluru PSK, Rajajinagar','Bengaluru PSK, Marathahalli','Mysuru POPSK'],
  'Maharashtra': ['Mumbai PSK, Malad','Mumbai PSK, Worli','Pune PSK','Nagpur POPSK'],
  'Delhi': ['Delhi PSK, Dwarka','Delhi PSK, Saket','Delhi PSK, Sector-62 Noida'],
  'West Bengal': ['Kolkata PSK, Salt Lake','Kolkata PSK, Topsia'],
  'Telangana': ['Hyderabad PSK, Secunderabad','Hyderabad PSK, Suchitra Circle'],
};

export default function Appointment() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [selState, setSelState] = useState('');
  const [selPSK, setSelPSK] = useState('');
  const [serviceType, setServiceType] = useState('Fresh Passport (Normal)');
  const [month, setMonth] = useState(2);
  const [year, setYear] = useState(2026);
  const [selDate, setSelDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selTime, setSelTime] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const FULLY_BOOKED = [4, 8, 15, 19, 23];

  const changeMonth = dir => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y); setSelDate(null); setSlots([]); setSelTime(null);
  };

  const selectDate = async (d) => {
    if (!selPSK) { toast('Please select a PSK first', 'error'); return; }
    const date = new Date(year, month, d);
    setSelDate(date); setSelTime(null);
    const dateStr = date.toISOString().split('T')[0];
    try {
      const { data } = await appointmentsAPI.getSlots(dateStr, selPSK);
      setSlots(data.slots || []);
    } catch { setSlots([]); }
  };

  const confirmAppt = async () => {
    if (!user) { toast('Please login to book an appointment', 'error'); navigate('/'); return; }
    if (!selDate || !selTime || !selPSK) { toast('Please select date, time and office', 'error'); return; }
    setConfirming(true);
    try {
      const { data } = await appointmentsAPI.book({
        office: selPSK, serviceType,
        date: selDate.toISOString().split('T')[0],
        time: selTime,
      });
      setConfirmed(data.appointment);
      toast('Appointment booked successfully! 🎉', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Booking failed', 'error');
    } finally { setConfirming(false); }
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Book Appointment</h2>
        <p className="section-sub">Select your Passport Seva Kendra, date, and preferred time slot.</p>

        {confirmed ? (
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div className="card">
              <div className="card-header green">✅ Appointment Confirmed</div>
              <div className="card-body">
                <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                <h4 style={{ color: '#15803d', fontSize: 18, marginBottom: 16 }}>Appointment Booked!</h4>
                {[['Office', confirmed.office], ['Date', confirmed.date], ['Time', confirmed.time], ['Token No.', '#' + confirmed.token]].map(([k, v]) => (
                  <div key={k} className="fee-row"><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                ))}
                <p style={{ fontSize: 12, color: '#475569', marginTop: 14 }}>Confirmation SMS & email sent. Carry all original documents.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                  <button className="btn btn-outline" onClick={() => { setConfirmed(null); setSelDate(null); setSelTime(null); }}>Book Another</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="two-col">
            <div>
              {/* Office Selection */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header navy">📍 Select Passport Seva Kendra</div>
                <div className="card-body">
                  <div className="form-row cols-2">
                    <div className="form-group">
                      <label>State <span className="req">*</span></label>
                      <select className="form-control" value={selState} onChange={e => { setSelState(e.target.value); setSelPSK(''); }}>
                        <option value="">Select State</option>
                        {Object.keys(PSK_MAP).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Passport Seva Kendra <span className="req">*</span></label>
                      <select className="form-control" value={selPSK} onChange={e => setSelPSK(e.target.value)}>
                        <option value="">Select PSK</option>
                        {(PSK_MAP[selState] || []).map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Service Type</label>
                    <select className="form-control" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                      {['Fresh Passport (Normal)','Fresh Passport (Tatkal)','Re-issue of Passport','Minor Passport','Police Clearance Certificate'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header navy">📅 Select Date</div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => changeMonth(-1)}>← Prev</button>
                    <strong style={{ color: '#003580' }}>{MONTHS[month]} {year}</strong>
                    <button className="btn btn-outline btn-sm" onClick={() => changeMonth(1)}>Next →</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#475569', padding: 6 }}>{d}</div>
                    ))}
                    {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                      const date = new Date(year, month, d);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isPast = date < today;
                      const isFull = FULLY_BOOKED.includes(d);
                      const isToday = date.getTime() === today.getTime();
                      const isSel = selDate?.getTime() === date.getTime();
                      let bg = 'transparent', color = '#94a3b8', cursor = 'not-allowed', border = '1px solid transparent';
                      if (!isPast && !isWeekend && !isFull) { bg = '#dbeafe'; color = '#003580'; cursor = 'pointer'; }
                      if (isSel) { bg = '#003580'; color = 'white'; }
                      if (isToday && !isSel) border = '1px solid #e8520a';
                      return (
                        <div key={d} onClick={() => !isPast && !isWeekend && !isFull && selectDate(d)}
                          style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 6, fontSize: 13, cursor, background: bg, color, border, transition: 'all 0.15s' }}>
                          {d}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: '#475569' }}>
                    <span>🟦 Available</span><span style={{ opacity: 0.5 }}>⬛ Booked/Weekend</span><span>🟩 Selected</span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {selDate && (
                <div className="card">
                  <div className="card-header navy">⏰ Time Slots — {selDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                  <div className="card-body">
                    {slots.length === 0 ? (
                      <p style={{ color: '#475569', textAlign: 'center', padding: 16 }}>Loading slots...</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                        {slots.map(s => (
                          <div key={s.time} onClick={() => s.available && setSelTime(s.time)}
                            style={{ border: `1.5px solid ${selTime === s.time ? '#003580' : s.available ? '#d0d9ec' : '#f1f5f9'}`, borderRadius: 6, padding: '10px 6px', textAlign: 'center', fontSize: 12, cursor: s.available ? 'pointer' : 'not-allowed', background: selTime === s.time ? '#003580' : s.available ? 'white' : '#f1f5f9', color: selTime === s.time ? 'white' : s.available ? '#003580' : '#94a3b8', textDecoration: s.available ? 'none' : 'line-through', transition: 'all 0.15s' }}>
                            {s.time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header light">📋 Booking Summary</div>
                <div className="card-body">
                  <div className="fee-row"><span>Office</span><span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 160 }}>{selPSK || '—'}</span></div>
                  <div className="fee-row"><span>Service</span><span style={{ fontWeight: 600 }}>{serviceType}</span></div>
                  <div className="fee-row"><span>Date</span><span style={{ fontWeight: 600 }}>{selDate ? selDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                  <div className="fee-row"><span>Time</span><span style={{ fontWeight: 600 }}>{selTime || '—'}</span></div>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-full" onClick={confirmAppt} disabled={!selDate || !selTime || !selPSK || confirming}>
                      {confirming ? 'Booking...' : '✅ Confirm Appointment'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header light">📄 Bring These Documents</div>
                <div className="card-body">
                  <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 2.1, color: '#475569' }}>
                    <li>Printed appointment letter</li>
                    <li>Original Aadhaar Card</li>
                    <li>DOB Proof (original + copy)</li>
                    <li>Address Proof (original + copy)</li>
                    <li>2 passport-size photographs</li>
                    <li>Fee payment receipt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
