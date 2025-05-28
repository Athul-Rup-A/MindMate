const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
  AliasId: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  Role: { type: String, required: true, enum: ['admin', 'moderator'] },
  Permissions: [{
    type: String,
    enum: ['approve_counselor', 'moderate_content'],
  }],
}, { timestamps: true });

const Admin = model('Admin', AdminSchema);

module.exports = Admin;
