const mongoose = require('mongoose');
const User = require('./models/User.cjs');

mongoose.connect('mongodb://localhost:27017/fidelhub')
  .then(async () => {
    const user = await User.findOne({ _id: '695b6c7da6c2fccb0d110aeb' });
    console.log('🔍 User email:', user?.email);
    console.log('🔍 User name:', user?.name);
    console.log('🔍 User role:', user?.role);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database error:', err);
    process.exit(1);
  });
