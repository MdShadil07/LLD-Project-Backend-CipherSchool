import mongoose from 'mongoose';

const criterionResultSchema = new mongoose.Schema(
  {
    criterionId: { type: String, required: true },
    criterion: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
    score: { type: Number, required: true, min: 0, max: 10 },
    evidence: { type: String, required: true },
    concern: { type: String, required: true },
    suggestion: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    evaluatorType: { type: String, required: true },
    evaluatorVersion: { type: String, required: true },
    model: { type: String, default: null },
    rubricVersion: { type: String, required: true },
    status: { type: String, required: true, enum: ['EVALUATING', 'COMPLETED', 'FAILED'], default: 'EVALUATING' },
    criteria: { type: [criterionResultSchema], default: [] },
    overallScore: { type: Number, min: 0, max: 100, default: null },
    overallSummary: { type: String, default: '' },
    topImprovements: { type: [String], default: [] },
    overallConfidence: { type: Number, min: 0, max: 1, default: null },
    error: { code: String, message: String },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

evaluationSchema.index({ submissionId: 1 }, { unique: true });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema);
