const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed initial services
    await seedServices();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed default Parivahan services
const seedServices = async () => {
  try {
    const Service = require('../models/Service');

    const count = await Service.countDocuments();

    if (count > 0) {
      console.log("ℹ️ Services already exist, skipping seed.");
      return;
    }

    const services = [
      {
        serviceName: 'Apply for Learner Licence',
        category: 'Driving Licence',
        description: 'Apply online for a learner driving licence. Valid for 6 months.',
        fees: 150,
        processingDays: 7,
        requiredDocuments: [
          'Aadhaar Card',
          'Age Proof',
          'Address Proof',
          'Passport Photo'
        ],
      },
      {
        serviceName: 'Apply for Driving Licence',
        category: 'Driving Licence',
        description: 'Apply for a permanent driving licence after holding a learner licence.',
        fees: 200,
        processingDays: 14,
        requiredDocuments: [
          'Learner Licence',
          'Aadhaar Card',
          'Passport Photo',
          'Medical Certificate'
        ],
      },
      {
        serviceName: 'Renew Driving Licence',
        category: 'Driving Licence',
        description: 'Renew your expired or soon-to-expire driving licence.',
        fees: 250,
        processingDays: 10,
        requiredDocuments: [
          'Existing Licence',
          'Aadhaar Card',
          'Passport Photo'
        ],
      },
      {
        serviceName: 'New Vehicle Registration',
        category: 'Vehicle Registration',
        description: 'Register your newly purchased vehicle with the RTO.',
        fees: 500,
        processingDays: 21,
        requiredDocuments: [
          'Form 20',
          'Sales Certificate',
          'Insurance Certificate',
          'PUC Certificate',
          'Aadhaar Card'
        ],
      },
      {
        serviceName: 'RC Renewal',
        category: 'Vehicle Registration',
        description: 'Renew your vehicle registration certificate.',
        fees: 300,
        processingDays: 14,
        requiredDocuments: [
          'Existing RC',
          'Insurance Certificate',
          'PUC Certificate',
          'Fitness Certificate'
        ],
      },
      {
        serviceName: 'Transfer of Ownership',
        category: 'Vehicle Registration',
        description: 'Transfer vehicle ownership from seller to buyer.',
        fees: 400,
        processingDays: 30,
        requiredDocuments: [
          'Form 29',
          'Form 30',
          'Original RC',
          'Insurance',
          'Aadhaar of Buyer'
        ],
      },
      {
        serviceName: 'Issue of Duplicate RC',
        category: 'Vehicle Registration',
        description: 'Apply for a duplicate RC if original is lost or damaged.',
        fees: 350,
        processingDays: 15,
        requiredDocuments: [
          'FIR Copy',
          'Affidavit',
          'Insurance Certificate',
          'PUC Certificate'
        ],
      },
      {
        serviceName: 'Fancy Number Plate',
        category: 'Vehicle Registration',
        description: 'Bid for a preferred/fancy vehicle registration number.',
        fees: 1000,
        processingDays: 7,
        requiredDocuments: [
          'Vehicle Invoice',
          'Aadhaar Card',
          'Address Proof'
        ],
      },
      {
        serviceName: 'International Driving Permit',
        category: 'Driving Licence',
        description: 'Obtain an international driving permit for driving abroad.',
        fees: 500,
        processingDays: 7,
        requiredDocuments: [
          'Valid Driving Licence',
          'Passport',
          'Visa',
          'Passport Photo',
          'Application Form'
        ],
      },
      {
        serviceName: 'Conductor Licence',
        category: 'Permits',
        description: 'Apply for a conductor licence for public transport vehicles.',
        fees: 100,
        processingDays: 21,
        requiredDocuments: [
          'Aadhaar Card',
          'Age Proof',
          'Medical Certificate',
          'Passport Photo'
        ],
      },
      {
        serviceName: 'Vehicle Fitness Certificate',
        category: 'Permits',
        description: 'Obtain fitness certificate for commercial vehicles.',
        fees: 600,
        processingDays: 3,
        requiredDocuments: [
          'RC Book',
          'Insurance',
          'Pollution Certificate',
          'Tax Receipt'
        ],
      },
      {
        serviceName: 'Road Tax Payment',
        category: 'Taxation',
        description: 'Pay road tax for your vehicle online.',
        fees: 0,
        processingDays: 1,
        requiredDocuments: [
          'RC Book',
          'Insurance Certificate'
        ],
      }
    ];

    await Service.insertMany(services);

    console.log("✅ Sample services seeded to database");

  } catch (error) {
    console.error("❌ Error seeding services:", error.message);
  }
};

module.exports = connectDB;