import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  refresh, 
  getMe, 
  updateProfile, 
  addAddress, 
  deleteAddress 
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  addressSchema 
} from '../validators/auth.validators.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authenticate as any, getMe as any);
router.patch('/profile', authenticate as any, validate(updateProfileSchema), updateProfile as any);
router.post('/addresses', authenticate as any, validate(addressSchema), addAddress as any);
router.delete('/addresses/:addressId', authenticate as any, deleteAddress as any);

export default router;
