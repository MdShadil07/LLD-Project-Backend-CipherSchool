import mongoose from 'mongoose';

const rubricCriterionSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true, trim: true },
    id: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const problemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
    requirements: { type: [String], required: true, default: [] },
    nonFunctionalRequirements: { type: [String], required: true, default: [] },
    topics: { type: [String], required: true, default: [] },
    estimatedTime: { type: Number, required: true, min: 1 },
    rubricVersion: { type: String, required: true, default: 'v1' },
    rubric: { type: [rubricCriterionSchema], required: true, default: [] },
    beforeYouStart: { type: String, required: true, default: 'Focus on responsibilities, relationships, core behavior, trade-offs, and edge cases.' },
  },
  { timestamps: true, versionKey: false },
);

export const Problem = mongoose.model('Problem', problemSchema);
