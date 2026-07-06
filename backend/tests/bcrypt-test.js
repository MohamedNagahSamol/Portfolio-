import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from '../src/models/AdminUser.js';
import 'dotenv/config';

async function verifyBcrypt() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio');
    const password = 'Admin@123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const isMatch = await bcrypt.compare(password, hash);
    console.log(`Bcrypt verification: ${isMatch ? '✅ WORKING' : '❌ FAILING'}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
verifyBcrypt();
