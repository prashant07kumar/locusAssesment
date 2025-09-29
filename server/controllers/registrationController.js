const Registration = require('../models/Registration.js');
const Event = require('../models/Event.js');

// @desc    Get registration status for a student
// @route   GET /api/registrations/status/:eventId
const getRegistrationStatus = async (req, res) => {
  try {
    // First validate if the event exists
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Then check for registration
    const registration = await Registration.findOne({
      event: req.params.eventId,
      student: req.user._id
    });
    
    if (!registration) {
      // Instead of 404, return a valid response indicating no registration
      return res.json({ status: 'not-registered', message: 'No registration found' });
    }

    res.json(registration);
  } catch (error) {
    // Check for invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a student for an event
// @route   POST /api/registrations/register/:eventId
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user._id;

    // Check if registration already exists
    const existingRegistration = await Registration.findOne({ event: eventId, student: studentId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    const registration = await Registration.create({ event: eventId, student: studentId });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
const getRegistrationsForEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a registration's status (approve/reject)
// @route   PUT /api/registrations/:registrationId
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const registration = await Registration.findById(req.params.registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = status;
    await registration.save();

    // REAL-TIME LOGIC: After updating status, recalculate attendee count
    if (status === 'approved' || status === 'rejected') {
      const approvedCount = await Registration.countDocuments({
        event: registration.event,
        status: 'approved',
      });
      const event = await Event.findByIdAndUpdate(
        registration.event,
        { attendeeCount: approvedCount },
        { new: true }
      );
      
      // Emit the update via Socket.IO
      req.io.emit('attendeeUpdate', {
        eventId: event._id.toString(),
        newCount: event.attendeeCount,
      });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerForEvent,
  getRegistrationsForEvent,
  updateRegistrationStatus,
  getRegistrationStatus,
};