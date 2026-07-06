import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  organization: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  description: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Experience', experienceSchema);
