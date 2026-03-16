const mongoose = require("mongoose");

const mongoURI = mongoose.connect("mongodb+srv://nabeels2024csecs_db_user:4R7nXi5O2npMeZQC@trustgov.8yuza0i.mongodb.net/trustgov?retryWrites=true&w=majority");

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.log(err));
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taxRoutes = require('./routes/tax');
const userRoutes = require('./routes/user');
const refundRoutes = require('./routes/refund');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/user', userRoutes);
app.use('/api/refund', refundRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Income Tax Portal API is running', timestamp: new Date().toISOString() });
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
  console.log(`✅ Income Tax Portal Backend running on http://localhost:${PORT}`);
});

module.exports = app;
