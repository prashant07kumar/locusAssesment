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
    expires: 60 
  }
}, {
  timestamps: true
});

eventViewerSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventViewer = mongoose.model('EventViewer', eventViewerSchema);
module.exports = EventViewer;