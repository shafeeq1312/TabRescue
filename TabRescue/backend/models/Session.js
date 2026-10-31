import mongoose from 'mongoose';

const tabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tab title is required'],
      trim: true,
      default: 'Untitled Tab',
    },
    url: {
      type: String,
      required: [true, 'Tab URL is required'],
      trim: true,
    },
    favicon: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session must belong to a user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Session name is required'],
      trim: true,
      maxlength: [120, 'Session name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'Development',
          'Learning',
          'Research',
          'Work',
          'Entertainment',
          'Personal',
          'Others',
        ],
        message: '{VALUE} is not a supported category',
      },
      default: 'Others',
      index: true,
    },
    tabs: {
      type: [tabSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A session must contain at least one tab',
      },
    },
    lastRestoredAt: {
      type: Date,
      default: null,
    },
    isAutoSaved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's sessions sorted by newest first
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, category: 1 });

// Text index for searching across session names, descriptions, and tab content
sessionSchema.index({
  name: 'text',
  description: 'text',
  'tabs.title': 'text',
  'tabs.url': 'text',
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
