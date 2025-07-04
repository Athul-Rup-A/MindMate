const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  AliasId: { type: String, required: true, unique: true },
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
}, { timestamps: true });

const Admin = model('Admin', AdminSchema);

module.exports = Admin;
