const mongoose = require('mongoose');

const { Schema } = mongoose;

const SOSLogSchema = new Schema({
  StudentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  AlertedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'CounselorPsychologist' // Model based on App Logic
  }],
  Method: {
    type: String,
    required: true,
    enum: ['call', 'sms', 'app']
  },
  TriggeredAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SOSLog = mongoose.model('SOSLog', SOSLogSchema);

module.exports = SOSLog;
