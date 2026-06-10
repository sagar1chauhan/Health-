import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems invalid'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: Date,
    height: Number, // in cm
    weight: Number, // in kg
    bmi: Number,
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    glucoseLevel: Number, // mg/dL
    cholesterol: {
      total: Number,
      hdl: Number,
      ldl: Number,
    },
    heartRate: Number, // bpm
    // Lifestyle factors
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never',
    },
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy'],
      default: 'none',
    },
    physicalActivity: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'light',
    },
    dietType: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'other'],
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    // Medical history
    familyHistory: {
      diabetes: { type: Boolean, default: false },
      heartDisease: { type: Boolean, default: false },
      cancer: { type: Boolean, default: false },
      hypertension: { type: Boolean, default: false },
      stroke: { type: Boolean, default: false },
      other: [String],
    },
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        status: {
          type: String,
          enum: ['active', 'resolved', 'chronic'],
        },
        notes: String,
      },
    ],
    allergies: [String],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    // Latest health risk score
    healthRiskScore: {
      score: Number,
      level: {
        type: String,
        enum: ['low', 'moderate', 'high'],
      },
      calculatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate BMI
patientProfileSchema.pre('save', function () {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;
