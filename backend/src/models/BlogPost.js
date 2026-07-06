import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  excerpt: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  content: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  tags: [{ type: String }],
  coverImage: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('BlogPost', blogPostSchema);
