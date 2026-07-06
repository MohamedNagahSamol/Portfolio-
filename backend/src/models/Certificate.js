import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  credentialUrl: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
