const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const CounselorPsychologistSchema = new Schema({
  ProfileImage: {
    type: String,
    default: null,
  },
  Username: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  isTempPassword: {
    type: Boolean,
    default: false,
  },
  tempPasswordHash: { type: String, default: null },
  tempPasswordExpires: {
    type: Date,
  },
  AvailabilitySlots: [{
    Day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    StartTime: { type: String, required: true },
    EndTime: { type: String, required: true },
  }],
  Phone: {
    type: String,
    required: true,
    unique: true,
  },
  FullName: { type: String },
  Credentials: { type: String, required: true },
  Specialization: { type: String, required: true },
  SpecializationStatus: { type: String, enum: ['approved', 'pending'], default: 'approved' },
  Status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'blocked'],
    default: 'pending',
  },
  Email: { type: String, unique: true },
  ApprovedByAdmin: { type: Boolean, default: false },
  Role: {
    type: String,
    enum: ['counselor', 'psychologist'],
    required: true,
  },
  pendingUpdates: {
    Phone: { type: String },
    Email: { type: String },
    FullName: { type: String },
    Credentials: { type: String },
    Specialization: { type: String },
    PasswordHash: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  },
  pendingPasswordChange: {
    newPasswordHash: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const CounselorPsychologist = model('CounselorPsychologist', CounselorPsychologistSchema);

module.exports = CounselorPsychologist;