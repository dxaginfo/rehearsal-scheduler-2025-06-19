const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
    required: true
  },
  instruments: [String],
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  }
});

const bandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  invitations: [invitationSchema],
  genre: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    soundcloud: String,
    spotify: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create invitation token
bandSchema.methods.generateInvitationToken = function(email) {
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // Token expires in 48 hours
  
  this.invitations.push({
    email,
    token,
    expiresAt,
    role: 'member'
  });
  
  return token;
};

// Check if user is member
bandSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
};

// Check if user is admin
bandSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && 
    member.role === 'admin' && 
    member.isActive
  );
};

// Add member to band
bandSchema.methods.addMember = function(userId, role = 'member', instruments = []) {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    // Update existing member if inactive
    if (!existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.role = role;
      existingMember.instruments = instruments;
      return true;
    }
    return false; // User already active member
  }
  
  // Add new member
  this.members.push({
    userId,
    role,
    instruments,
    joinDate: new Date(),
    isActive: true
  });
  
  return true;
};

// Remove member from band
bandSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.userId.toString() === userId.toString() && member.isActive
  );
  
  if (memberIndex === -1) return false;
  
  // Don't actually remove, just mark as inactive
  this.members[memberIndex].isActive = false;
  return true;
};

const Band = mongoose.model('Band', bandSchema);

module.exports = Band;