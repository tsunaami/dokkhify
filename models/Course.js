import mongoose from 'mongoose';

const courseFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    a: {
      type: String,
      trim: true,
    },
    b: {
      type: String,
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Free',
    },
    files: {
      type: [courseFileSchema],
      default: [],
    },
    quiz: {
      type: [quizQuestionSchema],
      default: [],
    },
    uploadedBy: {
      type: String,
      trim: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    students: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
