import DiseasePrediction from '../../models/DiseasePrediction.js';
import axios from 'axios';
import { AppError } from '../../middleware/error.middleware.js';

export const predictDisease = async (req, res, next) => {
  try {
    const inputFeatures = req.body;
    
    // Call AI Service (FastAPI)
    // const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, inputFeatures);
    
    // MOCK RESPONSE FOR NOW
    const aiResponse = {
      data: {
        predictions: [
          { disease: "Heart Disease", probability: 0.85, riskLevel: "high", model: "XGBoost" }
        ],
        overallRiskScore: 78,
        riskCategory: "high",
        shapExplanation: {
            "Heart Disease": {
                "bmi": { value: 30, contribution: 0.2 },
                "age": { value: 50, contribution: 0.15 }
            }
        }
      }
    };

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
