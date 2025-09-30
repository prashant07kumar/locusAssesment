const Registration = require('../models/Registration.js');
const Event = require('../models/Event.js');


const getRegistrationStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registration = await Registration.findOne({
      event: req.params.eventId,
      student: req.user._id
    });
    
    if (!registration) {
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

    // ✨ --- THIS IS THE NEW LINE --- ✨
    // This emits an event to all clients, letting them know a registration has been updated.
    req.io.emit('registrationUpdate', { eventId: eventId });

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsForEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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