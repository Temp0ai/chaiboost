import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { encrypt, decrypt, generateOTP } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { User, AuthTokens } from '@chaiboost/shared';

const SALT_ROUNDS = 12;

export async function register(email: string, password: string, displayName: string, phone?: string): Promise<{ user: Omit<User, 'phone'>; tokens: AuthTokens }> {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = uuidv4();

  const result = await transaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, email, display_name, password_hash, phone, role, is_verified, tier)
       VALUES ($1, $2, $3, $4, $5, 'owner', false, 'free')`,
      [userId, email, displayName, passwordHash, phone || null]
    );

    await client.query(
      `INSERT INTO user_auth_providers (id, user_id, provider, provider_user_id)
       VALUES ($1, $2, 'email', $3)`,
      [uuidv4(), userId, email]
    );

    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    return userResult.rows[0];
  });

  const tokens = generateTokens(userId, email, 'free');

  logger.info('User registered', { userId, email });

  return {
    user: mapUser(result),
    tokens,
  };
}

export async function login(email: string, password: string): Promise<{ user: Omit<User, 'phone'>; tokens: AuthTokens }> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    throw new AppError(401, 'SOCIAL_LOGIN_ONLY', 'This account uses social login. Please sign in with Google or Apple.');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokens = generateTokens(user.id, email, user.tier);

  await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

  logger.info('User logged in', { userId: user.id, email });

  return {
    user: mapUser(user),
    tokens,
  };
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  try {
    const payload = verifyRefreshToken(token);
    const result = await query('SELECT id, email, tier FROM users WHERE id = $1', [payload.userId]);

    if (result.rows.length === 0) {
      throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
    }

    const user = result.rows[0];
    return generateTokens(user.id, user.email, user.tier);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }
}

export async function requestOTP(phone: string): Promise<{ expiresAt: Date }> {
  const code = generateOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    `INSERT INTO otp_records (id, phone, code, expires_at, attempts, verified)
     VALUES ($1, $2, $3, $4, 0, false)`,
    [uuidv4(), phone, code, expiresAt]
  );

  // In production, send SMS via Twilio/other provider
  logger.info('OTP generated', { phone, code }); // Remove code logging in production

  return { expiresAt };
}

export async function verifyOTP(phone: string, code: string): Promise<{ verified: boolean; userId: string | null }> {
  const result = await query(
    `SELECT * FROM otp_records
     WHERE phone = $1 AND code = $2 AND verified = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, code]
  );

  if (result.rows.length === 0) {
    throw new AppError(400, 'INVALID_OTP', 'Invalid or expired OTP code');
  }

  const otp = result.rows[0];

  if (otp.attempts >= 5) {
    throw new AppError(429, 'OTP_ATTEMPTS_EXCEEDED', 'Too many attempts. Request a new OTP.');
  }

  await query('UPDATE otp_records SET verified = true WHERE id = $1', [otp.id]);

  // If user exists with this phone, return their ID
  const userResult = await query('SELECT id FROM users WHERE phone = $1', [phone]);
  const userId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

  return { verified: true, userId };
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) return null;
  return mapUser(result.rows[0]) as User;
}

function generateTokens(userId: string, email: string, tier: string): AuthTokens {
  const accessToken = generateAccessToken({ userId, email, tier });
  const refreshToken = generateRefreshToken({ userId, tokenVersion: 0 });

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

function mapUser(row: any): Omit<User, 'phone'> {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isVerified: row.is_verified,
    tier: row.tier,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
