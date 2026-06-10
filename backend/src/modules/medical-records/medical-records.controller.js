import MedicalRecord from '../../models/MedicalRecord.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/error.middleware.js';

// @desc    Upload new medical record
// @route   POST /api/medical-records
export const uploadRecord = async (req, res, next) => {
  try {
    const { title, type, description, patientId } = req.body;
    let fileUrls = [];

    // If files are uploaded
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Since we're using memoryStorage, we'd normally convert buffer to base64 or upload directly stream
        // For simplicity, assuming a middleware or utility handles buffer upload
        // Here's a placeholder logic for multer memory storage + cloudinary
        const b64 = Buffer.from(file.buffer).toString('base64');
        let dataURI = 'data:' + file.mimetype + ';base64,' + b64;
        const uploadResult = await uploadToCloudinary(dataURI, 'healthhub/records');
        fileUrls.push({
          name: file.originalname,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          type: file.mimetype,
          size: file.size
        });
      }
    }

    const record = await MedicalRecord.create({
      patientId: patientId || req.user._id, // Doctor can upload for patient
      doctorId: req.user.role === 'doctor' ? req.user._id : undefined,
      title,
      type,
      description,
      files: fileUrls
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records
// @route   GET /api/medical-records
export const getRecords = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Logic for doctors viewing patient records could be more complex (only their patients, or shared records)
      // Simplifying for now
      if (req.query.patientId) query.patientId = req.query.patientId;
      else throw new AppError('Please provide patientId', 400);
    }

    const records = await MedicalRecord.find(query).sort('-date');
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
