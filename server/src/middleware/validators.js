const Joi = require('joi');

/**
 * Validation middleware for user registration
 */
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    phone: Joi.string().pattern(new RegExp('^[0-9+\\-\\s]{10,15}$')).allow(''),
    instruments: Joi.array().items(Joi.string())
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

/**
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

/**
 * Validation middleware for password reset
 */
const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords must match' })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

/**
 * Validation middleware for band creation
 */
const validateBandCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).allow(''),
    genre: Joi.string().max(50).allow(''),
    website: Joi.string().uri().allow(''),
    socialLinks: Joi.object({
      facebook: Joi.string().uri().allow(''),
      instagram: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      youtube: Joi.string().uri().allow(''),
      soundcloud: Joi.string().uri().allow(''),
      spotify: Joi.string().uri().allow('')
    })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

/**
 * Validation middleware for rehearsal creation
 */
const validateRehearsalCreation = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).allow(''),
    location: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().allow(''),
      coordinates: Joi.array().items(Joi.number()).length(2)
    }).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
      .messages({ 'date.greater': 'End time must be after start time' }),
    isRecurring: Joi.boolean().default(false),
    recurringPattern: Joi.when('isRecurring', {
      is: true,
      then: Joi.object({
        frequency: Joi.string().valid('weekly', 'biweekly', 'monthly').required(),
        dayOfWeek: Joi.when('frequency', {
          is: Joi.string().valid('weekly', 'biweekly'),
          then: Joi.number().min(0).max(6).required(),
          otherwise: Joi.number().min(0).max(6)
        }),
        interval: Joi.number().min(1).default(1),
        endDate: Joi.date().iso().greater(Joi.ref('...startTime'))
      }).required(),
      otherwise: Joi.object().allow(null)
    })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

/**
 * Validation middleware for updating user profile
 */
const validateUserUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(new RegExp('^[0-9+\\-\\s]{10,15}$')).allow(''),
    instruments: Joi.array().items(Joi.string()),
    location: Joi.object({
      address: Joi.string().allow(''),
      coordinates: Joi.array().items(Joi.number()).length(2)
    }),
    defaultAvailability: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().min(0).max(6).required(),
        startTime: Joi.string().pattern(new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')).required(),
        endTime: Joi.string().pattern(new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')).required()
      })
    ),
    notificationPreferences: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      sms: Joi.boolean(),
      reminderTimes: Joi.array().items(Joi.number().min(0))
    })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateResetPassword,
  validateBandCreation,
  validateRehearsalCreation,
  validateUserUpdate
};