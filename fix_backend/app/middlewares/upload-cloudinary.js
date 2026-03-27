const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (isCloudinaryConfigured) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        folder: 'fitness_tracker',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo
          ? ['mp4', 'mov', 'avi', 'webm']
          : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: isVideo
          ? [{ quality: 'auto' }]
          : [{ width: 1280, crop: 'limit' }, { quality: 'auto' }],
      };
    },
  });
  upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
} else {
  // Fallback: memory storage (no Cloudinary configured)
  upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
}

module.exports = upload;
