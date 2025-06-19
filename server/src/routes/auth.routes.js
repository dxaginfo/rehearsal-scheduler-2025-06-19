const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

// Middleware for auth validation
const { validateRegistration, validateLogin, validateResetPassword } = require('../middleware/validators');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Create new user
    user = new User({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      name,
      phone,
      verificationToken,
      isVerified: false
    });
    
    await user.save();
    
    // Send verification email (implementation would be in a service)
    // emailService.sendVerificationEmail(user.email, verificationToken);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/verify/:token
 * @desc    Verify user email
 * @access  Public
 */
router.get('/verify/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find user with token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token' 
      });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Save token with expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send password reset email (implementation would be in a service)
    // emailService.sendPasswordResetEmail(user.email, resetToken);
    
    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password/:token', validateResetPassword, async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Update password
    user.passwordHash = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;