import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { Business, ConnectedPlatform, BrandAsset, CreateBusinessRequest } from '@chaiboost/shared';

export async function createBusiness(userId: string, data: CreateBusinessRequest): Promise<Business> {
  const id = uuidv4();

  const result = await query(
    `INSERT INTO businesses (id, user_id, name, category, description, address, city, state, country, postal_code, phone, website, brand_colors, tone_of_voice, target_audience)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      id,
      userId,
      data.name,
      data.category,
      data.description || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
      data.postalCode || null,
      data.phone || null,
      data.website || null,
      JSON.stringify(data.brandColors || { primary: '#2D5016', secondary: '#8B6914', accent: '#D4A574' }),
      data.toneOfVoice || null,
      data.targetAudience || null,
    ]
  );

  logger.info('Business created', { businessId: id, userId, name: data.name });
  return mapBusiness(result.rows[0]);
}

export async function getBusinessById(businessId: string, userId: string): Promise<Business | null> {
  const result = await query(
    'SELECT * FROM businesses WHERE id = $1 AND user_id = $2',
    [businessId, userId]
  );
  return result.rows.length > 0 ? mapBusiness(result.rows[0]) : null;
}

export async function getBusinessesByUser(userId: string): Promise<Business[]> {
  const result = await query(
    'SELECT * FROM businesses WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(mapBusiness);
}

export async function updateBusiness(businessId: string, userId: string, data: Partial<CreateBusinessRequest>): Promise<Business> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    category: 'category',
    description: 'description',
    address: 'address',
    city: 'city',
    state: 'state',
    country: 'country',
    postalCode: 'postal_code',
    phone: 'phone',
    website: 'website',
    toneOfVoice: 'tone_of_voice',
    targetAudience: 'target_audience',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${column} = $${paramIndex}`);
      values.push((data as any)[key]);
      paramIndex++;
    }
  }

  if (data.brandColors) {
    fields.push(`brand_colors = $${paramIndex}`);
    values.push(JSON.stringify(data.brandColors));
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new AppError(400, 'NO_FIELDS', 'No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(businessId, userId);

  const result = await query(
    `UPDATE businesses SET ${fields.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'NOT_FOUND', 'Business not found');
  }

  return mapBusiness(result.rows[0]);
}

export async function connectPlatform(
  businessId: string,
  platform: string,
  platformUserId: string,
  platformUsername: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date,
  scopes?: string[]
): Promise<ConnectedPlatform> {
  const id = uuidv4();

  const result = await query(
    `INSERT INTO connected_platforms (id, business_id, platform, platform_user_id, platform_username, access_token, refresh_token, expires_at, scopes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
     ON CONFLICT (business_id, platform, platform_user_id)
     DO UPDATE SET access_token = $6, refresh_token = $7, expires_at = $8, scopes = $9, is_active = true, updated_at = NOW()
     RETURNING *`,
    [id, businessId, platform, platformUserId, platformUsername, accessToken, refreshToken || null, expiresAt || null, scopes || []]
  );

  return mapConnectedPlatform(result.rows[0]);
}

export async function getConnectedPlatforms(businessId: string): Promise<ConnectedPlatform[]> {
  const result = await query(
    'SELECT * FROM connected_platforms WHERE business_id = $1 AND is_active = true',
    [businessId]
  );
  return result.rows.map(mapConnectedPlatform);
}

export async function saveBrandAsset(
  businessId: string,
  type: string,
  url: string,
  filename: string,
  mimeType: string,
  sizeBytes: number
): Promise<BrandAsset> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO brand_assets (id, business_id, type, url, filename, mime_type, size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, businessId, type, url, filename, mimeType, sizeBytes]
  );
  return mapBrandAsset(result.rows[0]);
}

function mapBusiness(row: any): Business {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    description: row.description,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postal_code,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    website: row.website,
    logoUrl: row.logo_url,
    brandColors: typeof row.brand_colors === 'string' ? JSON.parse(row.brand_colors) : row.brand_colors,
    toneOfVoice: row.tone_of_voice,
    targetAudience: row.target_audience,
    operatingHours: row.operating_hours ? (typeof row.operating_hours === 'string' ? JSON.parse(row.operating_hours) : row.operating_hours) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapConnectedPlatform(row: any): ConnectedPlatform {
  return {
    id: row.id,
    businessId: row.business_id,
    platform: row.platform,
    platformUserId: row.platform_user_id,
    platformUsername: row.platform_username,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes,
    isActive: row.is_active,
    lastSyncAt: row.last_sync_at,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBrandAsset(row: any): BrandAsset {
  return {
    id: row.id,
    businessId: row.business_id,
    type: row.type,
    url: row.url,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    createdAt: row.created_at,
  };
}
