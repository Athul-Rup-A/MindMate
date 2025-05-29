const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ResourcesSchema = new Schema({
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
  link: { type: String, required: true },
  tags: [{
    type: String,
    enum: ['anxiety', 'study', 'sleep'],
  }],
}, { timestamps: true });

const Resources = model('Resources', ResourcesSchema);

module.exports = Resources;
