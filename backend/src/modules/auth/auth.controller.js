import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../models/User.js';
import PatientProfile from '../../models/PatientProfile.js';
import DoctorProfile from '../../models/DoctorProfile.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../config/email.js';
import { AppError } from '../../middleware/error.middleware.js';

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
  return { accessToken, refreshToken };
};

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production, false in dev
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain prod, 'lax' for local dev
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
    });

    // Create profile based on role
    if (user.role === 'patient') {
      await PatientProfile.create({ userId: user._id });
    } else if (user.role === 'doctor') {
      await DoctorProfile.create({ userId: user._id, specialization: req.body.specialization || 'General' });
    }

    // Generate email verification token and send email
    try {
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('Email verification send failed (non-blocking):', emailErr.message);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AppError('Your account has been deactivated. Contact support.', 403);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Save refresh token and last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new AppError('No refresh token provided', 401);
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new AppError('No user found with that email', 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, resetToken);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Error sending email. Try again later.', 500);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const tokens = generateTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Verification token is invalid or has expired', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now use all features.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};
