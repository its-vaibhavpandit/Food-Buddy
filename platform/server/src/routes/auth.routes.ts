import { Router, type RequestHandler } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
} from '../validators/auth.validators.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes — authenticate as RequestHandler for Express 5 compat
const auth = authenticate as unknown as RequestHandler;
router.get('/me', auth, getMe as unknown as RequestHandler);
router.patch('/profile', auth, updateProfile as unknown as RequestHandler);
router.post('/addresses', auth, addAddress as unknown as RequestHandler);
router.delete('/addresses/:addressId', auth, deleteAddress as unknown as RequestHandler);

export default router;
