import TelemedicineConsultation from '../../models/TelemedicineConsultation.js';
import Appointment from '../../models/Appointment.js';
import { AppError } from '../../middleware/error.middleware.js';
import crypto from 'crypto';

// @desc    Create telemedicine session for an appointment
// @route   POST /api/telemedicine
export const createSession = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.type !== 'telemedicine') throw new AppError('This appointment is not a telemedicine appointment', 400);

    // Generate a functional meeting link using Jitsi Meet
    const meetingId = crypto.randomBytes(8).toString('hex');
    const meetingLink = `https://meet.jit.si/HealthHub_${meetingId}`;

    const session = await TelemedicineConsultation.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      meetingLink,
      startTime: new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.time}:00`),
      status: 'scheduled',
    });

    // Update appointment with meeting link
    appointment.meetingLink = meetingLink;
    await appointment.save();

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get telemedicine sessions for the logged-in user
// @route   GET /api/telemedicine
export const getSessions = async (req, res, next) => {
  try {
    const query = req.user.role === 'doctor'
      ? { doctorId: req.user._id }
      : { patientId: req.user._id };

    const sessions = await TelemedicineConsultation.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'date time status')
      .sort('-startTime');

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Update telemedicine session (doctor adds notes/prescription)
// @route   PUT /api/telemedicine/:id
export const updateSession = async (req, res, next) => {
  try {
    const session = await TelemedicineConsultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!session) throw new AppError('Session not found', 404);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
