import PatientProfile from '../../models/PatientProfile.js';
import User from '../../models/User.js';
import { AppError } from '../../middleware/error.middleware.js';

// @desc    Get patient profile
// @route   GET /api/patients/profile
export const getPatientProfile = async (req, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar status');
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
export const updatePatientProfile = async (req, res, next) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }

    // Don't allow updating userId
    delete req.body.userId;

    profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar status');

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient profile by ID (Doctor/Admin)
// @route   GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.params.id }).populate('userId', 'name email phone avatar status');
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
