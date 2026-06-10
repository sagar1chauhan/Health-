import mongoose from 'mongoose';

const diseasePredictionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Input features used for prediction
    inputFeatures: {
      age: Number,
      gender: Number,
      bmi: Number,
      bloodPressureSystolic: Number,
      bloodPressureDiastolic: Number,
      glucoseLevel: Number,
      cholesterolTotal: Number,
      cholesterolHDL: Number,
      smoking: Number,
      alcohol: Number,
      physicalActivity: Number,
      familyHistory: Number,
      stressLevel: Number,
    },
    // Prediction results
    predictions: [
      {
        disease: String,
        probability: Number,
        riskLevel: {
          type: String,
          enum: ['low', 'moderate', 'high', 'critical'],
        },
        model: String, // 'RandomForest', 'XGBoost', 'NeuralNetwork'
      },
    ],
    // Overall risk
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskCategory: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
    },
    // SHAP explanations
    shapExplanation: {
      type: mongoose.Schema.Types.Mixed,
      // Structure: { "Heart Disease": { "bmi": { value, contribution }, ... } }
    },
    // Model performance for this prediction
    modelMetrics: {
      primaryModel: String,
      confidence: Number,
      ensembleAgreement: Number, // How many models agree
    },
    // Status
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
diseasePredictionSchema.index({ patientId: 1, createdAt: -1 });
diseasePredictionSchema.index({ riskCategory: 1 });

const DiseasePrediction = mongoose.model('DiseasePrediction', diseasePredictionSchema);
export default DiseasePrediction;
