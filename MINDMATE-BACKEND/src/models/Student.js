const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const StudentSchema = new Schema({
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
  Feedbacks: [{ type: Schema.Types.ObjectId, ref: 'Feedback' }],
  Phone: {
    type: String,
    required: true,
    unique: true,
  },
  Email: { type: String, required: true, unique: true },
  Role: { type: String, enum: ['student'], default: 'student' },
  VentPosts: [{ type: Schema.Types.ObjectId, ref: 'VentWall' }],
  pendingUpdates: {
    Phone: { type: String },
    Email: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  },
  pendingPasswordChange: {
    newPasswordHash: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  },
  Status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
}, { timestamps: true }); // automatic createdAt and updatedAt

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;