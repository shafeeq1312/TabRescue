import mongoose from 'mongoose';

const tabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled Tab',
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    favicon: {
      type: String,
      default: '',
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const browserSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Exactly one latest snapshot document per user
      index: true,
    },
    tabs: [tabSchema],
    windowCount: {
      type: Number,
      default: 1,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const BrowserSnapshot = mongoose.model('BrowserSnapshot', browserSnapshotSchema);
export default BrowserSnapshot;
