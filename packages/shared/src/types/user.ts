export type UserRole = 'owner' | 'manager' | 'staff';
export type AuthProvider = 'email' | 'google' | 'apple';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
  tier: SubscriptionTier;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAuthProvider {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerUserId: string;
  accessToken: string; // encrypted
  refreshToken: string | null; // encrypted
  expiresAt: Date | null;
  createdAt: Date;
}

export interface OTPRecord {
  id: string;
  userId: string | null;
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro';
