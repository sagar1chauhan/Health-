import mongoose from 'mongoose';

const telemedicineConsultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
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
    meetingLink: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingUrl: {
      type: String,
    },
    doctorNotes: {
      type: String,
    },
    prescription: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
telemedicineConsultationSchema.index({ patientId: 1, doctorId: 1 });
telemedicineConsultationSchema.index({ appointmentId: 1 }, { unique: true });

const TelemedicineConsultation = mongoose.model('TelemedicineConsultation', telemedicineConsultationSchema);
export default TelemedicineConsultation;
