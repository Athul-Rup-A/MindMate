const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['video', 'article', 'podcast', 'guide'],
  },
  language: {
    type: String,
    required: true,
    enum: ['English', 'Hindi', 'Tamil', 'Malayalam'],
  },
  CreatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'CounselorPsychologist',
  required: true
}, 
  link: { type: String, required: true },
  tags: [{
    type: String,
    enum: ['anxiety', 'study', 'sleep'],
  }],
}, { timestamps: true });

const Resource = model('Resource', ResourceSchema);

module.exports = Resource;
