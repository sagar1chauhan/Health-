import DoctorProfile from '../../models/DoctorProfile.js';
import User from '../../models/User.js';
import { AppError } from '../../middleware/error.middleware.js';

// @desc    Get all doctors
// @route   GET /api/doctors
export const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, isVerified } = req.query;
    
    let query = {};
    if (specialization) query.specialization = specialization;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    let doctors = await DoctorProfile.find(query).populate('userId', 'name email avatar');

    if (search) {
      doctors = doctors.filter(doc => doc.userId && doc.userId.name.toLowerCase().includes(search.toLowerCase()));
    }

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findOne({ userId: req.params.id }).populate('userId', 'name email avatar phone');
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
export const updateDoctorProfile = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      throw new AppError('Doctor profile not found', 404);
    }

    delete req.body.userId;
    delete req.body.isVerified; // Cannot self-verify

    profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify doctor (Admin)
// @route   PUT /api/doctors/:id/verify
export const verifyDoctor = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.params.id },
      { 
        isVerified, 
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? req.user._id : null
      },
      { new: true }
    );

    if (!profile) {
      throw new AppError('Doctor profile not found', 404);
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
