import mongoose from 'mongoose';

const wearableDataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceType: {
      type: String,
      enum: ['smartwatch', 'heart_monitor', 'glucose_monitor', 'other'],
      required: true,
    },
    deviceName: {
      type: String,
    },
    metrics: {
      heartRate: [
        {
          value: Number,
          time: Date,
        },
      ],
      steps: {
        type: Number,
        default: 0,
      },
      sleepDuration: {
        type: Number, // In minutes
      },
      oxygenLevelSpO2: {
        type: Number, // Percentage 0-100
      },
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to easily fetch patient's latest wearable data
wearableDataSchema.index({ patientId: 1, recordedAt: -1 });

const WearableData = mongoose.model('WearableData', wearableDataSchema);
export default WearableData;
