// In-memory store (replaces DB for demo)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const users = [
  {
    id: uuidv4(),
    pan: 'ABCDE1234F',
    password: bcrypt.hashSync('Test@1234', 10),
    name: 'Rajesh Kumar',
    dob: '1985-06-15',
    email: 'rajesh.kumar@example.com',
    mobile: '9876543210',
    address: '12, MG Road, Bengaluru, Karnataka - 560001',
    aadhaar: '1234-5678-9012',
    returns: [
      {
        id: uuidv4(),
        ay: '2024-25',
        filedOn: '2024-07-25',
        status: 'Processed',
        ackNo: 'ITR-123456789',
        form: 'ITR-1',
        totalIncome: 850000,
        taxPayable: 67500,
        refundAmount: 12000
      },
      {
        id: uuidv4(),
        ay: '2023-24',
        filedOn: '2023-07-20',
        status: 'Processed',
        ackNo: 'ITR-987654321',
        form: 'ITR-1',
        totalIncome: 720000,
        taxPayable: 52000,
        refundAmount: 5000
      }
    ],
    refunds: [
      { id: uuidv4(), ay: '2024-25', amount: 12000, status: 'Initiated', date: '2024-10-15' },
      { id: uuidv4(), ay: '2023-24', amount: 5000, status: 'Credited', date: '2023-11-01' }
    ]
  }
];

const otpStore = {}; // { pan: { otp, expires } }

module.exports = { users, otpStore };
