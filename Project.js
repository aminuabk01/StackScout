const mongoose = require('mongoose');

const activitySnapshotSchema = new mongoose.Schema(
  {
    txCount24h: { type: Number, default: 0 },
    txCountTotal: { type: Number, default: 0 },
    lastTxTimestamp: { type: Date, default: null },
    fetchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['DeFi', 'NFT', 'Infrastructure', 'Wallet', 'DAO', 'Tooling', 'Other'],
      default: 'Other',
    },
    description: { type: String, default: '' },
    contractId: { type: String, default: null, index: true }, // e.g. SP...ADDRESS.contract-name
    githubUrl: { type: String, default: null },
    websiteUrl: { type: String, default: null },
    twitterUrl: { type: String, default: null },
    logoUrl: { type: String, default: null },
    activity: { type: activitySnapshotSchema, default: () => ({}) },
    activityLevel: {
      type: String,
      enum: ['high', 'growing', 'steady', 'quiet', 'unknown'],
      default: 'unknown',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
