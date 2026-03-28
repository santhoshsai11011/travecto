const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGODB_URI } = require('../config/env');

async function makeAdmin() {
  await mongoose.connect(MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email: 'santhosh@gmail.com' },
    { role: 'admin' },
    { new: true }
  );

  if (user) {
    console.log(`✅ ${user.email} is now admin`);
  } else {
    console.log('❌ User not found');
  }

  await mongoose.disconnect();
  process.exit(0);
}

makeAdmin();
