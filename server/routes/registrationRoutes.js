const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getRegistrationsForEvent,
  updateRegistrationStatus,
  getRegistrationStatus,
} = require('../controllers/registrationController.js');
const { protect, checkRole } = require('../middleware/authMiddleware.js');

// Student route to register
router.post('/register/:eventId', protect, checkRole(['student']), registerForEvent);

// Organizer routes to manage registrations
router.get('/event/:eventId', protect, checkRole(['organizer', 'admin']), getRegistrationsForEvent);
router.put('/:registrationId', protect, checkRole(['organizer', 'admin']), updateRegistrationStatus);

// Get registration status for a specific event and student
router.get('/status/:eventId', protect, checkRole(['student', 'organizer', 'admin']), getRegistrationStatus);

module.exports = router;