import mongoose from 'mongoose';

const mlModelMetricSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      enum: ['RandomForest', 'XGBoost', 'NeuralNetwork', 'Ensemble'],
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    targetDisease: {
      type: String,
      required: true,
    },
    metrics: {
      accuracy: {
        type: Number,
        required: true,
      },
      precision: {
        type: Number,
        required: true,
      },
      recall: {
        type: Number,
        required: true,
      },
      f1Score: {
        type: Number,
        required: true,
      },
      rocAuc: {
        type: Number,
        required: true,
      },
    },
    datasetSize: {
      type: Number,
    },
    deployedAt: {
      type: Date,
      default: Date.now,
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

// Index to fetch the active version of a specific model for a disease
mlModelMetricSchema.index({ modelName: 1, targetDisease: 1, isActive: 1 });

const MLModelMetric = mongoose.model('MLModelMetric', mlModelMetricSchema);
export default MLModelMetric;
