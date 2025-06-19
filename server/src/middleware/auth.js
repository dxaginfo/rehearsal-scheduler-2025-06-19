const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT
 */
const authenticateJWT = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Middleware to check if user is band admin
 */
const isBandAdmin = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const Band = require('../models/Band');
    
    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ 
        success: false, 
        message: 'Band not found' 
      });
    }
    
    const isAdmin = band.isAdmin(req.user.userId);
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required' 
      });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to check if user is band member
 */
const isBandMember = async (req, res, next) => {
  try {
    const { bandId } = req.params;
    const Band = require('../models/Band');
    
    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ 
        success: false, 
        message: 'Band not found' 
      });
    }
    
    const isMember = band.isMember(req.user.userId);
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Band membership required' 
      });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to check if user is verified
 */
const isVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email verification required' 
      });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to check if user owns the resource
 */
const isResourceOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.resourceId;
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }
      
      // Check if user is the owner (assuming resource has createdBy field)
      if (resource.createdBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You do not own this resource' 
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  authenticateJWT,
  isBandAdmin,
  isBandMember,
  isVerified,
  isResourceOwner
};