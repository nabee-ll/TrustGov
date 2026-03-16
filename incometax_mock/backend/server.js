const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const taxRoutes = require('./routes/tax');
const userRoutes = require('./routes/user');
const refundRoutes = require('./routes/refund');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- DATABASE CONNECTION ---------------- */

const MONGO_URI = "mongodb+srv://nabeels2024csecs_db_user:4R7nXi5O2npMeZQC@trustgov.8yuza0i.mongodb.net/?appName=trustgov"

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
  });

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/user', userRoutes);
app.use('/api/refund', refundRoutes);

/* ---------------- HEALTH CHECK ---------------- */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Income Tax Portal API is running',
    timestamp: new Date().toISOString()
  });
});

/* ---------------- ERROR HANDLING ---------------- */

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`✅ Income Tax Portal Backend running on http://localhost:${PORT}`);
});

module.exports = app;