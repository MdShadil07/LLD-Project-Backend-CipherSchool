import mongoose from 'mongoose';

const attemptDraftSchema = new mongoose.Schema(
  {
    requirements: { type: String, default: '' },
    assumptions: { type: String, default: '' },
    entities: { type: String, default: '' },
    relationships: { type: String, default: '' },
    flow: { type: String, default: '' },
    tradeoffs: { type: String, default: '' },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    status: { type: String, required: true, enum: ['DRAFT', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'FAILED'], default: 'DRAFT' },
    startedAt: { type: Date, required: true, default: Date.now },
    lastSavedAt: { type: Date, required: true, default: Date.now },
    timeSpentSeconds: { type: Number, required: true, default: 0 },
    draft: { type: attemptDraftSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false }
);

// Index to quickly find a user's draft for a specific problem
attemptSchema.index({ userId: 1, problemId: 1, status: 1 });

export const Attempt = mongoose.model('Attempt', attemptSchema);
