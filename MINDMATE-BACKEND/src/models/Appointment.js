import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({
  CounselorId: { type: Schema.Types.ObjectId, required: true, ref: 'CounselorPsychologist' },
  SlotStartTime: { type: String, required: true },
  SlotDate: { type: Date, required: true },
  SlotEndTime: { type: String, required: true },
  StudentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
  ReminderSent: { type: Boolean, default: false },
  Status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed'],
    default: 'pending',
  },
  CreatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Appointment = model('Appointment', AppointmentSchema);

module.exports = Appointment;
