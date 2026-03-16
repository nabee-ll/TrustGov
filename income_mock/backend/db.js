const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ⚠️  IMPORTANT: Replace the URI below with your actual MongoDB Atlas connection string.
// Steps:
//   1. Go to https://cloud.mongodb.com → your cluster → Connect → Drivers
//   2. Copy the full URI (it includes a unique subdomain like cluster0.abc1234.mongodb.net)
//   3. Replace the placeholder below, or set the MONGO_URI environment variable in a .env file
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://Incometax:nZUvuNI2uUKzdaGM@cluster0.REPLACE_THIS.mongodb.net/incometaxdb?retryWrites=true&w=majority&appName=Cluster0';

// ── Connect ───────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB Atlas connected — database: incometaxdb');
    seedDemoUser();
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    console.error('👉  Fix: Update MONGO_URI in backend/db.js with your Atlas cluster URI');
    // Removed process.exit(1) so the server keeps running for routes that don't need DB
  });

// ── Schemas & Models ──────────────────────────────────────────────────────────

// Users
const userSchema = new mongoose.Schema({
  pan: { type: String, required: true, unique: true, uppercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true },
  aadhaar: { type: String, default: null },
  address: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  pincode: { type: String, default: null },
}, { timestamps: true });

// OTPs
const otpSchema = new mongoose.Schema({
  pan: { type: String, required: true, uppercase: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired OTPs after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

// Tax Returns
const taxReturnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ackNumber: { type: String, required: true, unique: true },
  assessmentYear: { type: String, required: true },
  itrForm: { type: String, required: true },
  regime: { type: String, required: true },
  grossIncome: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  taxableIncome: { type: Number, default: 0 },
  taxPayable: { type: Number, default: 0 },
  tdsDeducted: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  status: { type: String, default: 'Filed' },
  incomeDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  deductionDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  refundStep: { type: Number, default: 1 },
}, { timestamps: true });

// One return per user per Assessment Year
taxReturnSchema.index({ userId: 1, assessmentYear: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
const TaxReturn = mongoose.models.TaxReturn || mongoose.model('TaxReturn', taxReturnSchema);

// ── Seed Demo User ────────────────────────────────────────────────────────────
async function seedDemoUser() {
  try {
    const exists = await User.findOne({ pan: 'ABCDE1234F' });
    if (exists) return;

    const hash = await bcrypt.hash('Test@1234', 10);
    const user = await User.create({
      pan: 'ABCDE1234F',
      password: hash,
      name: 'Rajesh Kumar',
      dob: '1985-06-15',
      email: 'rajesh.kumar@email.com',
      mobile: '9876543210',
      aadhaar: '1234-5678-9012',
      address: '42, MG Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
    });

    await TaxReturn.create({
      userId: user._id,
      ackNumber: 'ACK2024DEMO001',
      assessmentYear: 'AY 2024-25',
      itrForm: 'ITR-1',
      regime: 'new',
      grossIncome: 750000,
      totalDeductions: 75000,
      taxableIncome: 675000,
      taxPayable: 37500,
      tdsDeducted: 45000,
      refundAmount: 7500,
      status: 'Refund Initiated',
      refundStep: 4,
      incomeDetails: { salary: 750000 },
      deductionDetails: {},
    });

    console.log('🌱  Demo user seeded — PAN: ABCDE1234F  |  Password: Test@1234');
  } catch (err) {
    if (err.code !== 11000) console.error('Seed error:', err.message);
  }
}

module.exports = { User, Otp, TaxReturn };
