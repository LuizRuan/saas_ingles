import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },
  page: {
    type: String,
    required: true,
    trim: true,
  },
  nickname: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export const BugReport = mongoose.model('BugReport', bugReportSchema);
