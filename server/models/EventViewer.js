const mongoose = require('mongoose');

const eventViewerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now,
    expires: 60 // Document will be automatically deleted after 60 seconds of inactivity
  }
}, {
  timestamps: true
});

// Compound index to ensure one viewer per event per user
eventViewerSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventViewer = mongoose.model('EventViewer', eventViewerSchema);
module.exports = EventViewer;