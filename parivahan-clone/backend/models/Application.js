const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    applicationNumber: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: String },
    vehicleNumber: { type: String },
    licenceNumber: { type: String },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

applicationSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.applicationNumber = `PRV${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
