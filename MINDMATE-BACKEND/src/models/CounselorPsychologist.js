const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const CounselorPsychologistSchema = new Schema({
  AliasId: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  AvailabilitySlots: [{
    Day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    StartTime: { type: String, required: true },
    EndTime: { type: String, required: true },
  }],
  Phone: { type: String },
  FullName: { type: String },
  Credentials: { type: String, required: true },
  Specialization: { type: String, required: true },
  Status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'pending',
  },
  Email: { type: String, unique: true },
  ApprovedByAdmin: { type: Boolean, default: false },
  Role: {
    type: String,
    enum: ['counselor', 'psychologist'],
    required: true,
  },
}, { timestamps: true });

const CounselorPsychologist = model('CounselorPsychologist', CounselorPsychologistSchema);

module.exports = CounselorPsychologist;
