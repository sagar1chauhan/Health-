import Recommendation from '../../models/Recommendation.js';
import axios from 'axios';

/**
 * Generate personalized health recommendations by calling the Python AI Service.
 *
 * @param {Object} prediction - The saved DiseasePrediction document
 * @param {Object} inputFeatures - The raw input health metrics
 * @returns {Object} Created Recommendation document
 */
export const generateRecommendations = async (prediction, inputFeatures) => {
  try {
    // Call FastAPI AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const response = await axios.post(`${aiServiceUrl}/recommend/`, {
      prediction: {
        riskCategory: prediction.riskCategory,
        overallRiskScore: prediction.overallRiskScore,
        predictions: prediction.predictions
      },
      inputFeatures
    });

    const aiRecommendation = response.data;

    // Deactivate previous recommendations for this patient
    await Recommendation.updateMany(
      { patientId: prediction.patientId, isActive: true },
      { isActive: false }
    );

    // Create new recommendation from AI response
    const recommendation = await Recommendation.create({
      patientId: prediction.patientId,
      predictionId: prediction._id,
      dietPlan: aiRecommendation.dietPlan || [],
      exercisePlan: aiRecommendation.exercisePlan || [],
      lifestyleSuggestions: aiRecommendation.lifestyleSuggestions || [],
      doctorRecommendations: aiRecommendation.doctorRecommendations || [],
      isActive: true,
    });

    return recommendation;
  } catch (error) {
    console.error('AI Recommendation Generation Error:', error.message);
    throw error;
  }
};

export default generateRecommendations;
