import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiseasePrediction',
    },
    dietPlan: [
      {
        meal: {
          type: String,
          enum: ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner'],
        },
        suggestion: String,
        reason: String,
        calories: Number,
        nutrients: {
          protein: Number,
          carbs: Number,
          fat: Number,
          fiber: Number,
        },
      },
    ],
    exercisePlan: [
      {
        activity: String,
        duration: String, // e.g., "30 mins"
        frequency: String, // e.g., "Daily", "3x/week"
        intensity: {
          type: String,
          enum: ['low', 'moderate', 'high'],
        },
        reason: String,
        caloriesBurned: Number,
      },
    ],
    lifestyleSuggestions: [
      {
        category: {
          type: String,
          enum: ['sleep', 'stress', 'smoking', 'alcohol', 'hydration', 'general'],
        },
        suggestion: String,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        impact: String,
      },
    ],
    doctorRecommendations: [
      {
        specialization: String,
        reason: String,
        urgency: {
          type: String,
          enum: ['routine', 'soon', 'urgent'],
        },
      },
    ],
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ patientId: 1, createdAt: -1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
