const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  attendeeCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;