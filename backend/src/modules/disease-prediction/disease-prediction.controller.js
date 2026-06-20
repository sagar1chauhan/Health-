import DiseasePrediction from '../../models/DiseasePrediction.js';
import axios from 'axios';
import { AppError } from '../../middleware/error.middleware.js';

export const predictDisease = async (req, res, next) => {
  try {
    const inputFeatures = req.body;
    
    console.log("SENDING TO AI SERVICE:", inputFeatures);
    // Call AI Service (FastAPI)
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/predict/`, inputFeatures);

    // Save prediction
    const prediction = await DiseasePrediction.create({
      patientId: req.user._id,
      inputFeatures,
      predictions: aiResponse.data.predictions,
      overallRiskScore: aiResponse.data.overallRiskScore,
      riskCategory: aiResponse.data.riskCategory,
      shapExplanation: aiResponse.data.shapExplanation
    });

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
};

export const getPredictionHistory = async (req, res, next) => {
  try {
    const predictions = await DiseasePrediction.find({ patientId: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
};
