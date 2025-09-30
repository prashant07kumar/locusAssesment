const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;