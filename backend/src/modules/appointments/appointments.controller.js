import Appointment from '../../models/Appointment.js';
import { AppError } from '../../middleware/error.middleware.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, type, reason, symptoms } = req.body;
    
    // Check if slot is available
    const existing = await Appointment.findOne({ doctorId, date, time, status: { $in: ['pending', 'confirmed'] } });
    if (existing) {
      throw new AppError('Slot is already booked', 400);
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      type,
      reason,
      symptoms
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (req.user.role === 'doctor') query.doctorId = req.user._id;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name avatar email')
      .populate('doctorId', 'name avatar email')
      .sort('date time');

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, meetingLink } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) throw new AppError('Appointment not found', 404);

    // Basic authorization check
    if (req.user.role === 'patient' && req.user._id.toString() !== appointment.patientId.toString()) {
      throw new AppError('Not authorized', 403);
    }
    if (req.user.role === 'doctor' && req.user._id.toString() !== appointment.doctorId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    appointment.status = status;
    if (meetingLink) appointment.meetingLink = meetingLink;

    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
