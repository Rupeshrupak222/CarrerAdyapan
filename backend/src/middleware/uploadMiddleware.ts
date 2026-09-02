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

// Ensure Cloudinary is properly configured
const getCloudinaryClient = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'tdxhecfr';
  const apiKey = process.env.CLOUDINARY_API_KEY || '637165639466259';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'eqnB2Hl_RDJVEzOu0PZcUJCPfh8';

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }
  return null;
};

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

const fileFilter = (req: any, file: any, cb: any) => {
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
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const localUrl = `/uploads/resumes/${filename}`;
  const cld = getCloudinaryClient();

  if (cld && fs.existsSync(filePath)) {
    try {
      const sanitizedPublicId = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const isPdf = filename.toLowerCase().endsWith('.pdf');
      
      const uploadPromise = cld.uploader.upload(filePath, {
        folder: 'adyapan_resumes',
        resource_type: isPdf ? 'auto' : 'auto',
        public_id: sanitizedPublicId,
        overwrite: true,
        use_filename: true,
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const result: any = await Promise.race([uploadPromise, timeoutPromise]);

      if (result && result.secure_url) {
        console.log(`[Cloudinary] Successfully uploaded ${filename} -> ${result.secure_url}`);
        return result.secure_url;
      }
    } catch (err: any) {
      console.warn('[Cloudinary] Upload failed or timed out, falling back to local disk URL:', err?.message || err);
    }
  }

  return localUrl;
};