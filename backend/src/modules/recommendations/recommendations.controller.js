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
    const recommendation = await Recommendation.findOne({ patientId: req.user._id, isActive: true }).sort('-createdAt');
    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};

export const getRecommendationById = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });
    if (!recommendation) {
      throw new AppError('Recommendation not found', 404);
    }
    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};

