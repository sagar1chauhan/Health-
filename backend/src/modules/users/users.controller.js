import User from '../../models/User.js';
import PatientProfile from '../../models/PatientProfile.js';
import DoctorProfile from '../../models/DoctorProfile.js';
import { AppError } from '../../middleware/error.middleware.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Admin)
// @route   PUT /api/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete associated profile
    if (user.role === 'patient') {
      await PatientProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      await DoctorProfile.deleteOne({ userId: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats (Admin)
// @route   GET /api/users/stats
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalActive = await User.countDocuments({ status: 'active' });
    const totalInactive = await User.countDocuments({ status: 'inactive' });
    const totalBanned = await User.countDocuments({ status: 'banned' });

    res.status(200).json({
      success: true,
      data: {
        byRole: stats,
        totalActive,
        totalInactive,
        totalBanned,
        total: totalActive + totalInactive + totalBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};
