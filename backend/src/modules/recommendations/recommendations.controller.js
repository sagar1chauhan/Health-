import Recommendation from '../../models/Recommendation.js';
import { AppError } from '../../middleware/error.middleware.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ patientId: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

export const getLatestRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({ patientId: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};
