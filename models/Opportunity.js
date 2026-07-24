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
    approved: { type: Boolean, default: true }, // set false for a moderation queue later
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
