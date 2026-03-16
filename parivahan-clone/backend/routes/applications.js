const express = require('express');
const router = express.Router();
const { applyForService, getUserApplications, getApplicationByNumber } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyForService);
router.get('/user', protect, getUserApplications);
router.get('/status/:appNumber', getApplicationByNumber);

module.exports = router;
