const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');

const seedDemoUser = async () => {
  const pan = 'ABCDE1234F';
  const existing = await User.findOne({ pan });
  if (existing) return;

  await User.create({
    pan,
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
        refundAmount: 12000,
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
        refundAmount: 5000,
      },
    ],
    refunds: [
      { id: uuidv4(), ay: '2024-25', amount: 12000, status: 'Initiated', date: '2024-10-15' },
      { id: uuidv4(), ay: '2023-24', amount: 5000, status: 'Credited', date: '2023-11-01' },
    ],
    payments: [],
  });

  console.log('Seeded demo income-tax user AB CDE1234F.');
};

module.exports = { seedDemoUser };
