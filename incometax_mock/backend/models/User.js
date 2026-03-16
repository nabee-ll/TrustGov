const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  ay: String,
  form: String,
  filedOn: String,
  status: { type: String, default: 'Filed - Pending Verification' },
  ackNo: String,
  totalIncome: Number,
  taxPayable: { type: Number, default: 0 },
  tdsDeducted: { type: Number, default: 0 },
  selfAssessmentTax: { type: Number, default: 0 },
  advanceTax: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  taxDue: { type: Number, default: 0 },
}, { _id: true });

const refundSchema = new mongoose.Schema({
  ay: String,
  amount: Number,
  status: { type: String, default: 'Initiated' },
  date: String,
}, { _id: true });

const paymentSchema = new mongoose.Schema({
  cin: String,
  bankRef: String,
  pan: String,
  ay: String,
  taxType: String,
  payMode: String,
  amounts: mongoose.Schema.Types.Mixed,
  amount: Number,
  date: String,
  status: { type: String, default: 'SUCCESS' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  pan: { type: String, required: true, unique: true, uppercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dob: String,
  email: { type: String, required: true },
  mobile: String,
  address: { type: String, default: '' },
  aadhaar: { type: String, default: '' },
  returns: [returnSchema],
  refunds: [refundSchema],
  payments: [paymentSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
