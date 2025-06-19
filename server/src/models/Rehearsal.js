const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
});

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['attending', 'maybe', 'declined', 'pending'],
    default: 'pending'
  },
  responseTime: {
    type: Date
  },
  actualAttendance: {
    type: Boolean,
    default: null
  },
  notes: {
    type: String
  }
});

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sheet', 'audio', 'video', 'link'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const songSchema = new mongoose.Schema({
  songTitle: {
    type: String,
    required: true
  },
  artist: {
    type: String
  },
  duration: {
    type: Number
  },
  notes: {
    type: String
  }
});

const recurringPatternSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: function() {
      return this.frequency === 'weekly' || this.frequency === 'biweekly';
    }
  },
  interval: {
    type: Number,
    default: 1, // 1 = every week, 2 = every other week, etc.
    min: 1
  },
  endDate: {
    type: Date
  }
});

const rehearsalSchema = new mongoose.Schema({
  bandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Band',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: locationSchema,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: recurringPatternSchema,
    required: function() {
      return this.isRecurring;
    }
  },
  parentRehearsalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rehearsal'
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  attendance: [attendanceSchema],
  resources: [resourceSchema],
  setlist: [songSchema],
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index on start and end times for efficient querying
rehearsalSchema.index({ startTime: 1, endTime: 1 });
rehearsalSchema.index({ bandId: 1, startTime: 1 });

// Method to check if two rehearsals overlap in time
rehearsalSchema.methods.overlaps = function(otherRehearsal) {
  return (
    this.startTime < otherRehearsal.endTime && 
    this.endTime > otherRehearsal.startTime
  );
};

// Method to update attendance status
rehearsalSchema.methods.updateAttendance = function(userId, status) {
  const attendee = this.attendance.find(a => 
    a.userId.toString() === userId.toString()
  );
  
  if (attendee) {
    attendee.status = status;
    attendee.responseTime = new Date();
    return true;
  }
  
  this.attendance.push({
    userId,
    status,
    responseTime: new Date()
  });
  
  return true;
};

// Method to mark actual attendance
rehearsalSchema.methods.markActualAttendance = function(userId, didAttend) {
  const attendee = this.attendance.find(a => 
    a.userId.toString() === userId.toString()
  );
  
  if (!attendee) {
    this.attendance.push({
      userId,
      status: didAttend ? 'attending' : 'declined',
      responseTime: new Date(),
      actualAttendance: didAttend
    });
    return true;
  }
  
  attendee.actualAttendance = didAttend;
  return true;
};

// Method to generate recurring rehearsal instances
rehearsalSchema.statics.generateRecurringInstances = async function(parentRehearsalId, count = 10) {
  try {
    const parentRehearsal = await this.findById(parentRehearsalId);
    if (!parentRehearsal || !parentRehearsal.isRecurring) {
      return [];
    }
    
    const instances = [];
    const pattern = parentRehearsal.recurringPattern;
    
    // Get duration of rehearsal in milliseconds
    const duration = parentRehearsal.endTime - parentRehearsal.startTime;
    
    // Generate instances based on pattern
    let currentDate = new Date(parentRehearsal.startTime);
    for (let i = 0; i < count; i++) {
      // Move to next occurrence based on pattern
      if (pattern.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
      } else if (pattern.frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + (14 * pattern.interval));
      } else if (pattern.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
      }
      
      // Check if we've gone past the end date
      if (pattern.endDate && currentDate > pattern.endDate) {
        break;
      }
      
      // Create new instance
      const startTime = new Date(currentDate);
      const endTime = new Date(currentDate.getTime() + duration);
      
      const instance = new this({
        bandId: parentRehearsal.bandId,
        title: parentRehearsal.title,
        description: parentRehearsal.description,
        location: parentRehearsal.location,
        startTime: startTime,
        endTime: endTime,
        isRecurring: false,
        parentRehearsalId: parentRehearsal._id,
        status: 'scheduled',
        attendance: [], // Empty, will be populated when created
        resources: parentRehearsal.resources,
        setlist: parentRehearsal.setlist,
        notes: parentRehearsal.notes,
        createdBy: parentRehearsal.createdBy
      });
      
      await instance.save();
      instances.push(instance);
    }
    
    return instances;
  } catch (error) {
    console.error('Error generating recurring instances:', error);
    throw error;
  }
};

const Rehearsal = mongoose.model('Rehearsal', rehearsalSchema);

module.exports = Rehearsal;