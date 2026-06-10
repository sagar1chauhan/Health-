import multer from 'multer';
import path from 'path';

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not supported. Allowed: JPEG, PNG, WebP, PDF, DOC/DOCX`), false);
  }
};

// Upload middleware configurations
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('file');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('files', 5);

export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatar.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

export default { uploadSingle, uploadMultiple, uploadAvatar };
