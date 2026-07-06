import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  category: {
    type: String,
    required: true,
    enum: ['backend', 'frontend', 'fullstack', 'simple']
  },
  stack: [{ type: String }],
  links: {
    github: { type: String, default: '' },
    frontend: { type: String, default: '' },
    backend: { type: String, default: '' },
    admin: { type: String, default: '' }
  },
  image: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
