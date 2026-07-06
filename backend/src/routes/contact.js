import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import {
  submitContact,
  listMessages,
  markAsRead,
  deleteMessage
} from '../controllers/contactController.js';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('message').trim().notEmpty().withMessage('Message is required.')
  ],
  submitContact
);

router.get('/admin/messages', authMiddleware, listMessages);
router.patch('/admin/messages/:id/read', authMiddleware, markAsRead);
router.delete('/admin/messages/:id', authMiddleware, deleteMessage);

export default router;
