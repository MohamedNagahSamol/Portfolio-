import 'dotenv/config';
import mongoose from 'mongoose';
import AdminUser from './models/AdminUser.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.');

    console.log('Cleaning AdminUser collection...');
    const deleted = await AdminUser.deleteMany({});
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing admin users.`);

    console.log(`Creating admin user: ${ADMIN_EMAIL}...`);
    const user = await AdminUser.create({
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD // Hashing is handled by the .pre('save') hook in the model
    });
    
    console.log(`✅ Admin user created with ID: ${user._id}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
