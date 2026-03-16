const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Driving Licence', 'Vehicle Registration', 'Permits', 'Taxation', 'Other'],
  },
  description: { type: String, required: true },
  fees: { type: Number, required: true, default: 0 },
  processingDays: { type: Number, required: true },
  requiredDocuments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Service', serviceSchema);
