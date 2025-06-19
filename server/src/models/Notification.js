const mongoose = require('mongoose');

const deliveryStatusSchema = new mongoose.Schema({
  email: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'pending', 'not_applicable'],
    default: 'pending'
  },
  push: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'pending', 'not_applicable'],
    default: 'pending'
  },
  sms: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'pending', 'not_applicable'],
    default: 'pending'
  }
});

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Band'
  },
  rehearsalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rehearsal'
  },
  type: {
    type: String,
    enum: [
      'rehearsal_created', 
      'rehearsal_updated',
      'rehearsal_reminder',
      'rehearsal_cancelled', 
      'member_joined',
      'member_left',
      'invitation_sent',
      'invitation_accepted',
      'band_created',
      'band_updated',
      'resource_added',
      'setlist_updated'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  deliveryStatus: {
    type: deliveryStatusSchema,
    default: () => ({})
  },
  scheduledFor: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // Auto-delete after 30 days

// Static method to create a notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to create rehearsal reminder notifications
notificationSchema.statics.createRehearsalReminders = async function(rehearsalId, hours) {
  try {
    const Rehearsal = mongoose.model('Rehearsal');
    const rehearsal = await Rehearsal.findById(rehearsalId)
      .populate('bandId')
      .populate({
        path: 'attendance.userId',
        select: 'name email notificationPreferences'
      });
      
    if (!rehearsal) {
      throw new Error('Rehearsal not found');
    }
    
    const reminderTime = new Date(rehearsal.startTime);
    reminderTime.setHours(reminderTime.getHours() - hours);
    
    // Only create for those with status 'attending' or 'maybe'
    const notifications = [];
    for (const attendee of rehearsal.attendance) {
      if (!attendee.userId || attendee.status === 'declined') {
        continue;
      }
      
      // Check if user wants reminders at this time
      const user = attendee.userId;
      if (user.notificationPreferences && 
          user.notificationPreferences.reminderTimes &&
          !user.notificationPreferences.reminderTimes.includes(hours)) {
        continue;
      }
      
      const message = `Reminder: "${rehearsal.title}" rehearsal with ${rehearsal.bandId.name} starts in ${hours} hour${hours > 1 ? 's' : ''}.`;
      
      const notification = new this({
        userId: user._id,
        bandId: rehearsal.bandId._id,
        rehearsalId: rehearsal._id,
        type: 'rehearsal_reminder',
        title: `Rehearsal Reminder: ${rehearsal.title}`,
        message,
        scheduledFor: reminderTime,
        deliveryStatus: {
          email: user.notificationPreferences?.email ? 'pending' : 'not_applicable',
          push: user.notificationPreferences?.push ? 'pending' : 'not_applicable',
          sms: user.notificationPreferences?.sms ? 'pending' : 'not_applicable'
        }
      });
      
      await notification.save();
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating rehearsal reminders:', error);
    throw error;
  }
};

// Static method to mark notifications as sent
notificationSchema.statics.markAsSent = async function(notificationId, channel) {
  try {
    const update = {};
    update[`deliveryStatus.${channel}`] = 'sent';
    
    return await this.findByIdAndUpdate(
      notificationId,
      update,
      { new: true }
    );
  } catch (error) {
    console.error(`Error marking notification as sent for ${channel}:`, error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;