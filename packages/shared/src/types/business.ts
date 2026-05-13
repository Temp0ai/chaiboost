export type PlatformType = 'instagram' | 'google_my_business';
export type BusinessCategory = 'tea_shop' | 'bubble_tea' | 'coffee_house' | 'juice_bar' | 'smoothie_shop' | 'matcha_bar' | 'kombucha' | 'other';

export interface Business {
  id: string;
  userId: string;
  name: string;
  category: BusinessCategory;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  brandColors: BrandColors;
  toneOfVoice: string | null;
  targetAudience: string | null;
  operatingHours: OperatingHours | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface OperatingHours {
  [day: string]: { open: string; close: string } | null;
}

export interface ConnectedPlatform {
  id: string;
  businessId: string;
  platform: PlatformType;
  platformUserId: string;
  platformUsername: string;
  accessToken: string; // encrypted
  refreshToken: string | null; // encrypted
  expiresAt: Date | null;
  scopes: string[];
  isActive: boolean;
  lastSyncAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandAsset {
  id: string;
  businessId: string;
  type: 'logo' | 'photo' | 'template' | 'watermark';
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
