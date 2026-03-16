const bcrypt = require('bcryptjs');

// ── USERS ─────────────────────────────────────────────────────
const users = [
  {
    id: 'user-001',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@passport.gov.in',
    password: bcrypt.hashSync('Demo@1234', 10),
    mobile: '9876543210',
    dob: '1990-01-15',
    passportOffice: 'Chennai Passport Office',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ── APPLICATIONS ───────────────────────────────────────────────
const applications = [
  {
    id: 'app-001',
    arn: 'AP25031600001',
    userId: 'user-001',
    serviceType: 'Fresh Passport (Normal)',
    bookletType: '36 Pages',
    validity: '10 Years',
    status: 'Processing',
    appliedOn: '2026-03-16T10:42:00.000Z',
    expectedDate: '2026-04-15',
    office: 'Chennai Passport Office',
    paymentStatus: 'Paid',
    paymentAmount: 1829,
    paymentRef: 'PAY2603160001',
    personalInfo: {
      firstName: 'Demo', middleName: '', lastName: 'User',
      gender: 'Male', dob: '1990-01-15', pob: 'Chennai, Tamil Nadu',
      maritalStatus: 'Single', mobile: '9876543210', email: 'demo@passport.gov.in',
    },
    timeline: [
      { step: 'Application Submitted', done: true, date: '2026-03-16T10:42:00.000Z', note: 'Online submission confirmed' },
      { step: 'Payment Received', done: true, date: '2026-03-16T10:45:00.000Z', note: '₹1,829 received via UPI' },
      { step: 'Appointment Booked', done: true, date: '2026-03-16T11:00:00.000Z', note: 'Chennai PSK, Anna Nagar — 22 Mar 2026, 10:30 AM' },
      { step: 'Document Verification', done: false, date: null, note: 'In progress at passport office' },
      { step: 'Police Verification', done: false, date: null, note: 'Pending' },
      { step: 'Passport Dispatched', done: false, date: null, note: 'Pending' },
    ],
  },
  {
    id: 'app-002',
    arn: 'AP24120500023',
    userId: 'user-001',
    serviceType: 'Police Clearance Certificate',
    status: 'Granted',
    appliedOn: '2024-12-05T09:00:00.000Z',
    expectedDate: '2024-12-19',
    office: 'Chennai Passport Office',
    paymentStatus: 'Paid',
    paymentAmount: 590,
    paymentRef: 'PAY2412050023',
    timeline: [
      { step: 'Application Submitted', done: true, date: '2024-12-05T09:00:00.000Z', note: '' },
      { step: 'Payment Received', done: true, date: '2024-12-05T09:05:00.000Z', note: '₹590 received' },
      { step: 'Appointment Booked', done: true, date: '2024-12-05T10:00:00.000Z', note: '' },
      { step: 'Document Verification', done: true, date: '2024-12-10T11:00:00.000Z', note: 'Documents verified' },
      { step: 'Police Verification', done: true, date: '2024-12-17T00:00:00.000Z', note: 'Cleared' },
      { step: 'PCC Issued', done: true, date: '2024-12-19T00:00:00.000Z', note: 'Certificate granted' },
    ],
  },
];

// ── APPOINTMENTS ───────────────────────────────────────────────
const appointments = [
  {
    id: 'appt-001',
    userId: 'user-001',
    arn: 'AP25031600001',
    office: 'Chennai PSK, Anna Nagar',
    date: '2026-03-22',
    time: '10:30 AM',
    token: 'T-047',
    status: 'Upcoming',
    createdAt: '2026-03-16T11:00:00.000Z',
  },
];

// ── GRIEVANCES ─────────────────────────────────────────────────
const grievances = [];

// ── OFFICES ────────────────────────────────────────────────────
const offices = [
  { id: 'off-01', name: 'Chennai RPO', type: 'RPO', city: 'Chennai', state: 'Tamil Nadu', address: 'Shastri Bhavan, 26 Haddows Road, Chennai – 600006', phone: '044-28270226', email: 'rpo.chennai@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-02', name: 'Chennai PSK, Anna Nagar', type: 'PSK', city: 'Chennai', state: 'Tamil Nadu', address: 'Shop No. 6, G Block, Anna Nagar East, Chennai – 600102', phone: '1800-258-1800', email: '', hours: 'Mon–Sat: 8:00 AM – 6:00 PM' },
  { id: 'off-03', name: 'Chennai PSK, Taramani', type: 'PSK', city: 'Chennai', state: 'Tamil Nadu', address: 'Taramani Link Road, Chennai – 600113', phone: '1800-258-1800', email: '', hours: 'Mon–Sat: 8:00 AM – 6:00 PM' },
  { id: 'off-04', name: 'Bengaluru RPO', type: 'RPO', city: 'Bengaluru', state: 'Karnataka', address: 'Kendriya Sadan, Koramangala, Bengaluru – 560034', phone: '080-25660400', email: 'rpo.bangalore@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-05', name: 'Bengaluru PSK, Marathahalli', type: 'PSK', city: 'Bengaluru', state: 'Karnataka', address: 'Kundalahalli Gate, Marathahalli, Bengaluru – 560037', phone: '1800-258-1800', email: '', hours: 'Mon–Sat: 8:00 AM – 6:00 PM' },
  { id: 'off-06', name: 'Mumbai RPO', type: 'RPO', city: 'Mumbai', state: 'Maharashtra', address: 'Passport Sewa Bhavan, Andheri East, Mumbai – 400069', phone: '022-26681111', email: 'rpo.mumbai@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-07', name: 'Delhi RPO', type: 'RPO', city: 'New Delhi', state: 'Delhi', address: 'Bhikaji Cama Place, New Delhi – 110066', phone: '011-26182450', email: 'rpo.delhi@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-08', name: 'Kolkata RPO', type: 'RPO', city: 'Kolkata', state: 'West Bengal', address: '37/2 C.I.T. Road, Kolkata – 700014', phone: '033-22136630', email: 'rpo.kolkata@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-09', name: 'Hyderabad RPO', type: 'RPO', city: 'Hyderabad', state: 'Telangana', address: 'Block B, BRK Bhavan, Tankbund Road, Hyderabad – 500022', phone: '040-23220520', email: 'rpo.hyderabad@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-10', name: 'Pune PSK', type: 'PSK', city: 'Pune', state: 'Maharashtra', address: 'Amar Sigma IT Park, Baner, Pune – 411045', phone: '1800-258-1800', email: '', hours: 'Mon–Sat: 8:00 AM – 6:00 PM' },
  { id: 'off-11', name: 'Ahmedabad RPO', type: 'RPO', city: 'Ahmedabad', state: 'Gujarat', address: 'Nirman Bhavan, Sector-10A, Gandhinagar – 382010', phone: '079-23256101', email: 'rpo.ahmedabad@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-12', name: 'Jaipur PSK', type: 'PSK', city: 'Jaipur', state: 'Rajasthan', address: 'Plot No. E-3, Pankaj Singhvi Marg, Jaipur – 302001', phone: '1800-258-1800', email: '', hours: 'Mon–Sat: 8:00 AM – 6:00 PM' },
  { id: 'off-13', name: 'Lucknow RPO', type: 'RPO', city: 'Lucknow', state: 'Uttar Pradesh', address: '8 Sapru Marg, Lucknow – 226001', phone: '0522-2620350', email: 'rpo.lucknow@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
  { id: 'off-14', name: 'Chandigarh RPO', type: 'RPO', city: 'Chandigarh', state: 'Chandigarh', address: 'Plot No. 35, Industrial Area Phase-I, Chandigarh – 160002', phone: '0172-2703600', email: 'rpo.chandigarh@mea.gov.in', hours: 'Mon–Fri: 9:30 AM – 5:30 PM' },
];

module.exports = { users, applications, appointments, grievances, offices };
