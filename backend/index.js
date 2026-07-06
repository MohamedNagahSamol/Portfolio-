import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import errorHandler from './src/middleware/errorHandler.js';
import contentRoutes from './src/routes/content.js';
import contactRoutes from './src/routes/contact.js';
import uploadRoutes from './src/routes/upload.js';
import authRoutes from './src/routes/auth.js';
const app = express();
const PORT = process.env.PORT || 5000;



app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://portfolio-w1c5.vercel.app',
  credentials: true
}));

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', uploadRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
