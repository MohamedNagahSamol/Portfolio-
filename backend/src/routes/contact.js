import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { contactValidator, idParamValidator } from '../validators/index.js';
import {
  submitContact,
  listMessages,
  markAsRead,
  deleteMessage
} from '../controllers/contactController.js';

const router = Router();
export const adminMessagesRouter = Router();

// Admin messages routes (mounted at /api/admin/messages)
adminMessagesRouter.get('/', authMiddleware, listMessages);
adminMessagesRouter.patch('/:id/read', authMiddleware, idParamValidator, validate, markAsRead);
adminMessagesRouter.delete('/:id', authMiddleware, idParamValidator, validate, deleteMessage);

// Public contact route
router.post('/', contactValidator, validate, submitContact);

// Backward compatibility alias: /api/contact/admin/messages
router.use('/admin/messages', adminMessagesRouter);

export default router;
