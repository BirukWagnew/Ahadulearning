import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ['student', 'instructor', 'admin'], required: true },
  expertise: { 
    type: String, 
    required: function() { return this.role === 'instructor'; }, 
  },
  password: { 
    type: String, 
    required: true,
    validate: {
      validator: function(password) {
        // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  cv: { type: String },  
  isApproved: { 
    type: Boolean, 
    default: function() { return this.role !== 'instructor'; } 
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'blocked'], 
    default: function() { return this.isApproved ? 'active' : 'pending'; } 
  },
  blocked: { type: Boolean, default: false }  ,
  socketId: { type: String, default: null },
  bio: {
    type: String,
    default: 'I am passionate about learning and sharing knowledge with others.',
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  
  profilePic: {
    type: String,
    default: '' 
  },
  otp: { type: String },
  otpExpiration: { type: Date },
  isVerified: { type: Boolean, default: false },
  passwordResetOtp: { type: String },
passwordResetOtpExpiration: { type: Date },

 availableBalance: { type: Number, default: 0 },
 bankDetails: {
  accountName: String,
  accountNumber: String,
  bankCode: String,  
},

}, { timestamps: true });

 userSchema.pre('save', function(next) {
  if (this.blocked) {
    this.status = 'blocked';   
    this.isApproved = false;   
  } else {
    this.status = this.isApproved ? 'active' : 'pending';   
  }
  next();
});


 userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

 
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

 userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();  
  this.otp = otp;
  this.otpExpiration = Date.now() + 100 * 60 * 1000;  
  return otp;
};

userSchema.methods.verifyOTP = function(otp) {
  if (this.otp === otp && this.otpExpiration > Date.now()) {
    return true;
  }
  return false;
};

 userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();  
  this.passwordResetOtp = otp;
  this.passwordResetOtpExpiration = Date.now() + 10 * 60 * 1000;  
  return otp;
};

userSchema.methods.verifyPasswordResetOTP = function(otp) {
  console.log('🔍 verifyPasswordResetOTP called');
  console.log('🔍 Stored passwordResetOtp:', this.passwordResetOtp);
  console.log('🔍 Received otp:', otp);
  console.log('🔍 passwordResetOtpExpiration:', this.passwordResetOtpExpiration);
  console.log('🔍 Current time:', Date.now());
  console.log('🔍 Is expired:', Date.now() > this.passwordResetOtpExpiration);
  
  if (this.passwordResetOtp === otp && this.passwordResetOtpExpiration > Date.now()) {
    console.log('🔍 OTP is valid');
    return true;
  }
  console.log('🔍 OTP is invalid');
  return false;
};


 
userSchema.methods.updateProfile = async function(updates) {
  const allowedUpdates = ['name', 'email', 'bio', 'profilePic'];
  const updatesKeys = Object.keys(updates);
  const isValidUpdate = updatesKeys.every(key => allowedUpdates.includes(key));

  if (!isValidUpdate) {
    throw new Error('Invalid profile updates');
  }

  updatesKeys.forEach(key => {
    this[key] = updates[key];
  });

  return this.save();
};

export default mongoose.model('User', userSchema);
