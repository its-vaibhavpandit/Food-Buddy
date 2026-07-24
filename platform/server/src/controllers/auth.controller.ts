import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';
import { AuthRequest } from '../middleware/auth.js';

const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id, role }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

const formatUserResponse = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
});

const sendTokenResponse = async (user: any, statusCode: number, res: Response) => {
  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }

  // Cap at 5 active sessions
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }
  user.refreshTokens.push(refreshToken);
  await user.save({ validateModifiedOnly: true });

  setRefreshCookie(res, refreshToken);

  res.status(statusCode).json({
    status: 'success',
    data: {
      accessToken,
      user: formatUserResponse(user),
    },
  });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, phone, password });
  // Freshly created user needs refreshTokens array initialized
  user.refreshTokens = user.refreshTokens || [];

  await sendTokenResponse(user, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Explicitly select password and refreshTokens since they have select:false
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await (user as any).comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  await sendTokenResponse(user, 200, res);
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken },
      });
    } catch {
      // Ignore token verify errors during logout
    }
  }

  clearRefreshCookie(res);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  let decoded: { id: string; role: string };
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; role: string };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }

  // Refresh token rotation / reuse detection
  const tokenIndex = user.refreshTokens.indexOf(refreshToken);
  if (tokenIndex === -1) {
    // Detected reuse or expired session — revoke session & clear cookie
    user.refreshTokens = [];
    await user.save({ validateModifiedOnly: true });
    clearRefreshCookie(res);
    throw new AppError('Session expired or refresh token invalid. Please log in.', 401);
  }

  // Remove the used refresh token
  user.refreshTokens.splice(tokenIndex, 1);

  await sendTokenResponse(user, 200, res);
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user: formatUserResponse(user) },
  });
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: { ...(name && { name }), ...(phone && { phone }) } },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user: formatUserResponse(user) },
  });
});

export const addAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { street, city, state, zipCode, isDefault } = req.body;
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If isDefault is true, unset all other defaults
  if (isDefault) {
    user.addresses.forEach((addr: any) => { addr.isDefault = false; });
  }

  const isFirstAddress = user.addresses.length === 0;

  user.addresses.push({
    street,
    city,
    state,
    zipCode,
    isDefault: isDefault || isFirstAddress,
  });

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    data: { addresses: user.addresses },
  });
});

export const deleteAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const initialLength = user.addresses.length;
  user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId) as any;

  if (user.addresses.length === initialLength) {
    throw new AppError('Address not found', 404);
  }

  // If deleted address was default, promote first remaining
  const hasDefault = user.addresses.some((addr: any) => addr.isDefault);
  if (!hasDefault && user.addresses.length > 0) {
    (user.addresses[0] as any).isDefault = true;
  }

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    data: { addresses: user.addresses },
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Return success message even if email not found to prevent user enumeration
    res.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, a password reset token has been generated.',
    });
    return;
  }

  // Generate 6-digit verification / reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    message: 'Password reset token generated (Valid for 10 minutes)',
    resetToken, // Returned in API response for test environment / UI convenience
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 6) {
    throw new AppError('Token and valid new password (min 6 chars) are required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});
