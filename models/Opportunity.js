const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
    projectName: { type: String, required: true, trim: true }, // denormalized for submissions without a linked Project doc
    type: {
      type: String,
      enum: ['Job', 'Bounty', 'Grant', 'Contribution', 'Hackathon'],
      default: 'Contribution',
    },
    skillsNeeded: [{ type: String, trim: true }],
    description: { type: String, default: '' },
    applyUrl: { type: String, required: true },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    submittedBy: { type: String, default: 'StackScout Team' },
    submittedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
