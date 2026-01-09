import multer from 'multer';
import cloudinary from 'cloudinary';
import * as multerStorageCloudinary from 'multer-storage-cloudinary';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

const CloudinaryStorage =
  multerStorageCloudinary.CloudinaryStorage ||
  multerStorageCloudinary.default?.CloudinaryStorage ||
  multerStorageCloudinary.default;

if (!CloudinaryStorage) {
  throw new Error(
    "multer-storage-cloudinary: CloudinaryStorage export not found. Check installed version."
  );
}

config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for images (for thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'course-thumbnails', // Cloudinary folder for images
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Storage for video uploads
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'course-videos', // Cloudinary folder for videos
    resource_type: 'video', // This ensures it's uploaded as a video
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    chunk_size: 6000000 // 6MB chunks for large files
  }
});

// Set up multer with storage
const upload = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });

const tempVideoDir = path.join(process.cwd(), 'temp', 'videos');
if (!fs.existsSync(tempVideoDir)) {
  fs.mkdirSync(tempVideoDir, { recursive: true });
}

const localVideoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempVideoDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const uploadVideoLocal = multer({ storage: localVideoStorage });

export { upload, uploadVideo, uploadVideoLocal };
