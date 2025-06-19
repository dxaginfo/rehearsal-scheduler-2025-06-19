const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  address: { type: String },
  coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
});

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
  startTime: { type: String, required: true }, // "HH:MM" format
  endTime: { type: String, required: true }
});

const specialAvailabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: false },
  startTime: { type: String },
  endTime: { type: String }
});

const calendarIntegrationSchema = new mongoose.Schema({
  provider: { type: String, required: true }, // "google", "apple", "outlook"
  token: { type: String, required: true },
  refreshToken: { type: String },
  expiry: { type: Date }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  instruments: [String],
  location: locationSchema,
  defaultAvailability: [availabilitySchema],
  specialAvailability: [specialAvailabilitySchema],
  calendarIntegrations: [calendarIntegrationSchema],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    reminderTimes: [Number] // hours before event
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  isVerified: { type: Boolean, default: false },
  verificationToken: String
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('passwordHash')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw error;
  }
};

// Method to get user's full availability (merging default and special)
userSchema.methods.getFullAvailability = function(startDate, endDate) {
  // Implementation of availability merging logic
  // This would combine the regular weekly availability with any special exceptions
  // and return a complete schedule for the given date range
  
  // Placeholder for implementation
  return {
    defaultAvailability: this.defaultAvailability,
    specialAvailability: this.specialAvailability.filter(
      a => a.date >= startDate && a.date <= endDate
    )
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;