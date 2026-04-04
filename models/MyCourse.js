import mongoose from 'mongoose';

const myCourseFileSchema = new mongoose.Schema(
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

const myCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    courseDescription: {
      type: String,
      trim: true,
      default: '',
    },
    files: {
      type: [myCourseFileSchema],
      default: [],
    },
    quiz: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Free',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    student: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true,
      lowercase: true,
    },
    studentName: {
      type: String,
      trim: true,
      default: '',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificateUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

myCourseSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('MyCourse', myCourseSchema);
