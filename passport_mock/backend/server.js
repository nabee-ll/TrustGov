const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const appointmentRoutes = require('./routes/appointments');
const officeRoutes = require('./routes/offices');
const trackRoutes = require('./routes/track');
const grievanceRoutes = require('./routes/grievances');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = "mongodb+srv://passport:lo1w0zkgugx7njJX@trustgov.8yuza0i.mongodb.net/trustgov?retryWrites=true&w=majority&appName=trustgov"
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });


// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/grievances', grievanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Passport Seva API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Passport Seva API running on http://localhost:${PORT}`);
  console.log(`📋 Demo credentials: demo@passport.gov.in / Demo@1234\n`);
});
