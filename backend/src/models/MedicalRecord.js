import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    type: {
      type: String,
      enum: ['lab_report', 'prescription', 'medical_report', 'imaging', 'vaccination', 'discharge_summary', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // For prescriptions
    prescriptionDetails: {
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
          instructions: String,
        },
      ],
      diagnosis: String,
      followUpDate: Date,
    },
    // File attachments
    files: [
      {
        name: String,
        url: String,
        publicId: String,
        type: { type: String }, // Mongoose requires this nested syntax when a field is named 'type'
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    tags: [String],
    isConfidential: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ type: 1 });
medicalRecordSchema.index({ tags: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
