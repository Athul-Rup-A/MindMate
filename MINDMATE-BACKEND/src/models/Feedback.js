const mongoose = require('mongoose');

const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  Rating: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5]
  },
  Comment: {
    type: String
  },
  Type: {
    type: String,
    required: true,
    enum: ['session', 'platform', 'content', 'SOS']
  },
  StudentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  CounselorPsychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CounselorPsychologist'
  },
  AppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;