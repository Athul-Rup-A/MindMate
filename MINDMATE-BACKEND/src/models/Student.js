const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const StudentSchema = new Schema({
  AliasId: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  Feedbacks: [{ type: Schema.Types.ObjectId, ref: 'Feedback' }],
  MoodEntries: [{
    Date: { type: Date, default: Date.now },
    Mood: {
      type: String,
      required: true,
      enum: ['happy', 'sad', 'stressed', 'anxious', 'motivated']
    },
    Note: { type: String },
    Tags: [{
      type: String,
      enum: ['productive', 'positive', 'tired', 'focussed', 'lonely', 'social', 'bored', 'energetic']
    }],
  }],
  Language: { type: String, default: 'en' },
  Role: { type: String, enum: ['student'], default: 'student' },
  VentPosts: [{ type: Schema.Types.ObjectId, ref: 'VentWall' }],
  Status: {
    type: String,
    enum: ['active', 'pending', 'banned'],
    default: 'pending'
  },
  HabitLogs: [{
    Date: { type: Date, required: true },
    Exercise: { type: Boolean, default: false },
    Hydration: { type: Number, default: 0 }, // in ml
    ScreenTime: { type: Number, default: 0 }, // in hours
    SleepHours: { type: Number, default: 0 },
  }],
  SosTriggers: [{ type: Schema.Types.ObjectId, ref: 'SOSLog' }],
}, { timestamps: true }); // automatic createdAt and updatedAt

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
