const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
  ReporterId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  TargetId: { type: Schema.Types.ObjectId, required: true, refPath: 'TargetType' },
  TargetType: {
    type: String,
    enum: ['CounselorPsychologist', 'Resource', 'Vent'],
    required: true,
  },
  TargetAliasId: {
    type: String,
    required: function () {
      return this.TargetType === 'CounselorPsychologist';
    }
  },
  Reason: {
    type: String,
    enum: ['spam', 'abuse', 'offensive', 'harassment', 'misinformation'],
    required: true,
  },
  Status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
}, { timestamps: true });

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
