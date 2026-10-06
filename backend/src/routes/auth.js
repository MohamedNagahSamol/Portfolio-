import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refresh, logout } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { authValidator } from '../validators/index.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

router.post('/login', loginLimiter, authValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
