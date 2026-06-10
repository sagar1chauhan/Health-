import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String, // "10:00"
      required: [true, 'Appointment time is required'],
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    type: {
      type: String,
      enum: ['in-person', 'telemedicine'],
      default: 'telemedicine',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    reason: {
      type: String,
      trim: true,
    },
    symptoms: [String],
    notes: {
      patient: String,
      doctor: String,
    },
    meetingLink: String,
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    payment: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'free'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
