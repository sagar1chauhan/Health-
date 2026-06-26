import DiseasePrediction from '../../models/DiseasePrediction.js';
import axios from 'axios';
import { AppError } from '../../middleware/error.middleware.js';
import { generateRecommendations } from '../recommendations/recommendation.generator.js';
import { sendNotification } from '../../sockets/notification.socket.js';

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

    // Auto-generate personalized recommendations based on prediction
    let recommendation = null;
    try {
      recommendation = await generateRecommendations(prediction, inputFeatures);
    } catch (recErr) {
      console.error('Recommendation generation failed (non-blocking):', recErr.message);
    }

    // Send real-time notifications
    try {
      await sendNotification(req.user._id, {
        type: 'prediction_complete',
        title: 'Health Risk Analysis Complete',
        message: `Your risk analysis is ready. Overall risk: ${prediction.riskCategory?.toUpperCase() || 'N/A'} (Score: ${prediction.overallRiskScore || 0}/100). View your detailed results now.`,
        priority: prediction.riskCategory === 'high' || prediction.riskCategory === 'critical' ? 'high' : 'medium',
        data: { predictionId: prediction._id },
      });

      if (recommendation) {
        await sendNotification(req.user._id, {
          type: 'new_recommendation',
          title: 'New Health Recommendations Available',
          message: 'Personalized diet, exercise, and lifestyle recommendations have been generated based on your latest health analysis.',
          priority: 'medium',
          data: { recommendationId: recommendation._id },
        });
      }
    } catch (notifErr) {
      console.error('Notification send failed (non-blocking):', notifErr.message);
    }

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

