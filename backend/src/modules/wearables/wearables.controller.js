import WearableData from '../../models/WearableData.js';

// @desc    Get wearable data for the logged-in patient
// @route   GET /api/wearables
export const getWearableData = async (req, res, next) => {
  try {
    const data = await WearableData.find({ patientId: req.user._id })
      .sort('-recordedAt')
      .limit(30); // Last 30 records
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Add wearable data entry
// @route   POST /api/wearables
export const addWearableData = async (req, res, next) => {
  try {
    const data = await WearableData.create({
      patientId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
