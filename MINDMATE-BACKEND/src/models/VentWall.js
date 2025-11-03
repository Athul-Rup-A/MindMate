const mongoose = require('mongoose');

const { Schema } = mongoose;

const VentWallSchema = new Schema({
  Topic: {
    type: String,
    required: true
  },
  Content: {
    type: String,
    required: true
  },
  Likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  Reports: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  StudentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }
}, { timestamps: true });

const VentWall = mongoose.model('VentWall', VentWallSchema);

module.exports = VentWall;