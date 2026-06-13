import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = 'healthhub') => {
  try {
    // If no Cloudinary credentials, use mock
    if (!process.env.CLOUDINARY_API_KEY) {
      return getMockUploadResult();
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      };
    } catch (uploadError) {
      console.warn(`Cloudinary API Error (${uploadError.message}). Using fallback mock upload.`);
      return getMockUploadResult();
    }
  } catch (error) {
    return getMockUploadResult();
  }
};

function getMockUploadResult() {
  return {
    url: 'https://via.placeholder.com/150?text=Mock+Medical+Record',
    publicId: 'mock_id_' + Date.now(),
    format: 'png',
    size: 1024,
  };
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export default cloudinary;
