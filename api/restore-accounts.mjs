import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function restoreDeletedAccounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fidelhub');
    console.log('✅ Connected to database');

    // Simple user schema to access users
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String,
      isVerified: Boolean,
      phone: String,
      expertise: String,
      cv: String,
      bio: String,
      profilePic: String,
      availableBalance: Number,
      blocked: Boolean,
      socketId: String,
      otp: String,
      otpExpiration: Date,
      passwordResetOtp: String,
      passwordResetOtpExpiration: Date,
      createdAt: Date,
      updatedAt: Date
    }, { collection: 'users' });

    const User = mongoose.model('RestoreUsers', userSchema);

    // Restore the deleted admin and instructor accounts
    const accountsToRestore = [
      {
        name: 'Biruk wagew',
        email: 'birukwagnew445@gmail.com',
        phone: '+25109876543',
        role: 'instructor',
        isApproved: true,
        status: 'pending',
        isVerified: true,
        expertise: 'swddfvv  cshj',
        cv: 'uploads\\cvs\\user-1767560802497.pdf',
        bio: 'I am passionate about learning and sharing knowledge with others.',
        profilePic: '',
        availableBalance: 0,
        blocked: false,
        socketId: null,
        otp: '596738',
        otpExpiration: new Date('2026-01-05T14:03:09.530Z'),
        passwordResetOtp: '237598',
        passwordResetOtpExpiration: new Date('2026-01-05T12:33:10.517Z'),
        createdAt: new Date('2026-01-04T21:01:45.083Z'),
        updatedAt: new Date('2026-01-04T21:06:42.553Z')
      },
      {
        name: 'jhon',
        email: 'birukwagnew41145@gmail.com',
        phone: 'birukwagnew445@gmail.com',
        role: 'instructor',
        isApproved: true,
        status: 'active',
        isVerified: true,
        expertise: 'swddfvv  cshj',
        cv: 'uploads\\cvs\\user-1767560802497.pdf',
        bio: 'I am passionate about learning and sharing knowledge with others.',
        profilePic: '',
        availableBalance: 0,
        blocked: false,
        socketId: null,
        otp: '596738',
        otpExpiration: new Date('2026-01-05T14:03:09.530Z'),
        passwordResetOtp: '237598',
        passwordResetOtpExpiration: new Date('2026-01-05T12:33:10.517Z'),
        createdAt: new Date('2026-01-05T07:47:09.418Z'),
        updatedAt: new Date('2026-01-05T07:47:09.418Z')
      },
      {
        name: 'System Administrator',
        email: 'admin@fidelhub.com',
        role: 'admin',
        isApproved: true,
        status: 'active',
        isVerified: true,
        phone: '',
        expertise: '',
        cv: '',
        bio: '',
        profilePic: '',
        availableBalance: 0,
        blocked: false,
        socketId: null,
        otp: '',
        otpExpiration: null,
        passwordResetOtp: '',
        passwordResetOtpExpiration: null,
        createdAt: new Date('2026-01-05T19:36:04.811Z'),
        updatedAt: new Date('2026-01-05T19:36:04.811Z')
      },
      {
        name: 'Secondary Administrator',
        email: 'admin2@fidelhub.com',
        role: 'admin',
        isApproved: true,
        status: 'active',
        isVerified: true,
        phone: '',
        expertise: '',
        cv: '',
        bio: '',
        profilePic: '',
        availableBalance: 0,
        blocked: false,
        socketId: null,
        otp: '',
        otpExpiration: null,
        passwordResetOtp: '',
        passwordResetOtpExpiration: null,
        createdAt: new Date('2026-01-05T19:36:04.811Z'),
        updatedAt: new Date('2026-01-05T19:36:04.811Z')
      },
      {
        name: 'Gmail Administrator',
        email: 'fidelhub.admin@gmail.com',
        role: 'admin',
        isApproved: true,
        status: 'active',
        isVerified: true,
        phone: '',
        expertise: '',
        cv: '',
        bio: '',
        profilePic: '',
        availableBalance: 0,
        blocked: false,
        socketId: null,
        otp: '',
        otpExpiration: null,
        passwordResetOtp: '',
        passwordResetOtpExpiration: null,
        createdAt: new Date('2026-01-05T19:36:04.811Z'),
        updatedAt: new Date('2026-01-05T19:36:04.811Z')
      }
    ];

    console.log('🔄 Restoring deleted admin and instructor accounts...');
    
    let restoredCount = 0;
    for (const account of accountsToRestore) {
      try {
        // Check if account already exists
        const existing = await User.findOne({ email: account.email });
        if (!existing) {
          await User.create(account);
          console.log(`✅ RESTORED: ${account.email} (${account.role})`);
          restoredCount++;
        } else {
          console.log(`⚠️ ALREADY EXISTS: ${account.email} (${account.role})`);
        }
      } catch (error) {
        console.log(`❌ FAILED to restore ${account.email}:`, error.message);
      }
    }

    console.log(`\n📋 Summary:`);
    console.log(`✅ Restored accounts: ${restoredCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

restoreDeletedAccounts();
