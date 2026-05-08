import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 1. Configure Cloudinary with your .env keys
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up the Cloudinary Storage Engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edusync_slides', // Cloudinary will create this folder for you!
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Block PDFs or dangerous files
    transformation: [{ width: 1280, height: 720, crop: 'limit' }], // Auto-compress massive images!
  },
});

// 3. Initialize Multer with our new storage engine
const upload = multer({ storage: storage });

// 4. Create the POST route
// The "upload.single('image')" middleware intercepts the file before it hits our function
router.post('/', upload.single('image'), (req, res) => {
  try {
    console.log("Cloudinary File Object:", req.file);
    // If we make it here, Multer and Cloudinary already did the heavy lifting!
    // Cloudinary attaches the final secure URL to req.file.path
    res.status(200).json({
      success: true,
      url: req.file.secure_url, // This is the magical URL we will save to MongoDB later
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

export default router;