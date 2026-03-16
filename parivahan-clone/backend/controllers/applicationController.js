const Application = require('../models/Application');
const Service = require('../models/Service');

const applyForService = async (req, res) => {
  try {
    const { serviceId, fullName, email, phone, address, dateOfBirth, vehicleNumber, licenceNumber, documents } = req.body;
    if (!serviceId || !fullName || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    const application = await Application.create({
      user: req.user._id,
      service: serviceId,
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      vehicleNumber,
      licenceNumber,
      documents: documents || [],
    });
    await application.populate('service', 'serviceName category fees processingDays');
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('service', 'serviceName category fees processingDays')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationByNumber = async (req, res) => {
  try {
    const application = await Application.findOne({ applicationNumber: req.params.appNumber })
      .populate('service', 'serviceName category fees processingDays')
      .populate('user', 'name email');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { applyForService, getUserApplications, getApplicationByNumber };
