const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController.js');
const { protect, checkRole } = require('../middleware/authMiddleware.js');

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', protect, checkRole(['organizer', 'admin']), createEvent);
router.put('/:id', protect, checkRole(['organizer', 'admin']), updateEvent);
router.delete('/:id', protect, checkRole(['organizer', 'admin']), deleteEvent);

module.exports = router;