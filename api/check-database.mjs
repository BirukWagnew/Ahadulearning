import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('\nAvailable databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkDatabase();
