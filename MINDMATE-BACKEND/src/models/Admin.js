const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  Username: { type: String, required: true, unique: true },
  FullName: {
    type: String,
    required: true,
  },
  PasswordHash: { type: String, required: true },
  isTempPassword: {
    type: Boolean,
    default: false,
  },
  tempPasswordHash: { type: String, default: null },
  tempPasswordExpires: {
    type: Date,
  },
  Role: { type: String, required: true, enum: ['admin', 'moderator'] },
  Phone: {
    type: String,
    required: true,
    unique: true,
  },
  Email: { type: String, unique: true },
  pendingUpdates: {
    Phone: { type: String },
    Email: { type: String },
    token: { type: String },
    expiresAt: { type: Date }
  },
  pendingPasswordChange: {
    newPasswordHash: { type: String },
    token: { type: String },
    expiresAt: { type: Date }
  },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const Admin = model('Admin', AdminSchema);

module.exports = Admin;