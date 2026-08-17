import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Cloudinary SDK if credentials exist in .env
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${unique}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isExtAllowed = !!file.originalname.match(/\.(pdf|doc|docx|png|jpg|jpeg)$/i);
  const isExecutableExt = !!file.originalname.match(/\.(exe|bat|cmd|sh|php|js|jsx|ts|tsx|html|htm|py|pl|cgi|jar|vbs)$/i);
  const allowedMime = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (isExecutableExt) {
    return cb(new Error('Executable or script files are strictly forbidden.'), false);
  }

  if (isExtAllowed && (allowedMime.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PNG, JPG allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,  // 25 MB max file size
    fieldSize: 25 * 1024 * 1024, // 25 MB max field size for base64 / text fields
  }
});

/**
 * Upload Buffer or File to Cloudinary CDN (with local URL fallback)
 */
export const uploadToCloudinaryOrDisk = async (filePath: string, filename: string): Promise<string> => {
  if (hasCloudinary && fs.existsSync(filePath)) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'adyapan_resumes',
        resource_type: 'auto',
        public_id: filename.replace(/\.[^/.]+$/, ''),
      });
      return result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, using local disk URL fallback:', err);
    }
  }
  return `/uploads/resumes/${filename}`;
};