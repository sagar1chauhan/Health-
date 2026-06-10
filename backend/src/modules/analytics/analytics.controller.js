import User from '../../models/User.js';
import DiseasePrediction from '../../models/DiseasePrediction.js';
import Appointment from '../../models/Appointment.js';

export const getOverviewAnalytics = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const totalPredictions = await DiseasePrediction.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalPredictions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDiseaseStats = async (req, res, next) => {
  try {
    // Aggregate disease statistics
    const stats = await DiseasePrediction.aggregate([
      { $unwind: '$predictions' },
      { $group: { _id: '$predictions.disease', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
