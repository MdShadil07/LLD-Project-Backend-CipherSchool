import mongoose from 'mongoose';

const submissionContentSchema = new mongoose.Schema(
  {
    requirements: { type: String, required: true },
    assumptions: { type: String, required: true },
    entities: { type: String, required: true },
    relationships: { type: String, required: true },
    flow: { type: String, required: true },
    tradeoffs: { type: String, required: true },
  },
  { _id: false, strict: true }
);

const submissionSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    format: { type: String, required: true, enum: ['STRUCTURED_DESIGN'], default: 'STRUCTURED_DESIGN' },
    content: { type: submissionContentSchema, required: true },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

submissionSchema.index({ attemptId: 1, version: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
