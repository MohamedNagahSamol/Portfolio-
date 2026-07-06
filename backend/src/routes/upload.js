import { Router } from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/auth.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  }
});

router.post('/admin/upload', authMiddleware, upload.single('image'), uploadImage);

export default router;
