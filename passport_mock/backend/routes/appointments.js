const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { appointments, applications } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

const BOOKED_SLOTS = ['09:30 AM', '11:00 AM', '02:00 PM'];
const ALL_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                   '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'];

// GET /api/appointments
router.get('/', authMiddleware, (req, res) => {
  const userAppts = appointments.filter(a => a.userId === req.user.id);
  res.json({ success: true, appointments: userAppts });
});

// GET /api/appointments/slots?date=&office=
router.get('/slots', (req, res) => {
  const { date, office } = req.query;
  if (!date || !office) return res.status(400).json({ success: false, message: 'date and office required' });
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6)
    return res.json({ success: true, slots: [], message: 'No slots on weekends' });
  const slots = ALL_SLOTS.map(t => ({ time: t, available: !BOOKED_SLOTS.includes(t) }));
  res.json({ success: true, slots, date, office });
});

// POST /api/appointments
router.post('/', authMiddleware, (req, res) => {
  const { arn, office, date, time, serviceType } = req.body;
  if (!office || !date || !time) return res.status(400).json({ success: false, message: 'office, date and time required' });
  const token = 'T-' + String(Math.floor(Math.random() * 99 + 10)).padStart(3, '0');
  const appt = {
    id: uuidv4(), userId: req.user.id, arn: arn || null,
    office, date, time, token, serviceType, status: 'Upcoming',
    createdAt: new Date().toISOString(),
  };
  appointments.push(appt);
  if (arn) {
    const app = applications.find(a => a.arn === arn);
    if (app) {
      const t = app.timeline.find(s => s.step === 'Appointment Booking');
      if (t) { t.done = true; t.date = new Date().toISOString(); t.note = `${office} — ${date}, ${time}`; }
    }
  }
  res.status(201).json({ success: true, appointment: appt, message: 'Appointment booked successfully' });
});

// DELETE /api/appointments/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });
  appointments.splice(idx, 1);
  res.json({ success: true, message: 'Appointment cancelled' });
});

module.exports = router;
