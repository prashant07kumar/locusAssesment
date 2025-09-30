const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getRegistrationsForEvent,
  updateRegistrationStatus,
  getRegistrationStatus,
} = require('../controllers/registrationController.js');
const { protect, checkRole } = require('../middleware/authMiddleware.js');

router.post('/register/:eventId', protect, checkRole(['student']), registerForEvent);

router.get('/event/:eventId', protect, checkRole(['organizer', 'admin']), getRegistrationsForEvent);
router.put('/:registrationId', protect, checkRole(['organizer', 'admin']), updateRegistrationStatus);

router.get('/status/:eventId', protect, checkRole(['student', 'organizer', 'admin']), getRegistrationStatus);

module.exports = router;