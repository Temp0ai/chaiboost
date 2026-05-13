import axios from 'axios';
import { config } from '../config';
import { encrypt, decrypt } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMB_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const GMB_ACCOUNTS_API = 'https://mybusinessaccountmanagement.googleapis.com/v1';

/**
 * Generate Google My Business OAuth URL
 */
export function getOAuthUrl(businessId: string, userId: string): { url: string; state: string } {
  const state = Buffer.from(JSON.stringify({ businessId, userId })).toString('base64url');

  const params = new URLSearchParams({
    client_id: config.gmb.clientId,
    redirect_uri: config.gmb.redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/plus.business.manage',
    ].join(' '),
    state,
  });

  return {
    url: `${GOOGLE_AUTH_URL}?${params.toString()}`,
    state,
  };
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(code: string, state: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}> {
  const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: config.gmb.clientId,
    client_secret: config.gmb.clientSecret,
    redirect_uri: config.gmb.redirectUri,
    grant_type: 'authorization_code',
  });

  const { access_token, refresh_token, expires_in } = tokenResponse.data;

  return {
    accessToken: encrypt(access_token),
    refreshToken: encrypt(refresh_token),
    expiresAt: new Date(Date.now() + expires_in * 1000),
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(encryptedRefreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const refreshToken = decrypt(encryptedRefreshToken);

  const response = await axios.post(GOOGLE_TOKEN_URL, {
    client_id: config.gmb.clientId,
    client_secret: config.gmb.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  return {
    accessToken: encrypt(response.data.access_token),
    expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
  };
}

/**
 * List business accounts
 */
export async function listAccounts(encryptedToken: string): Promise<any[]> {
  const token = decrypt(encryptedToken);

  const response = await axios.get(`${GMB_ACCOUNTS_API}/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.accounts || [];
}

/**
 * Get location details
 */
export async function getLocation(encryptedToken: string, accountId: string, locationId: string): Promise<any> {
  const token = decrypt(encryptedToken);

  const response = await axios.get(`${GMB_API_BASE}/accounts/${accountId}/locations/${locationId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours',
    },
  });

  return response.data;
}

/**
 * Create a local post on Google My Business
 */
export async function createLocalPost(
  encryptedToken: string,
  accountId: string,
  locationId: string,
  params: {
    summary: string;
    imageUrl?: string;
    callToAction?: { type: string; url: string };
    topicType?: 'STANDARD' | 'EVENT';
  }
): Promise<{ postId: string }> {
  const token = decrypt(encryptedToken);

  const body: any = {
    languageCode: 'en',
    summary: params.summary,
    topicType: params.topicType || 'STANDARD',
  };

  if (params.imageUrl) {
    body.media = [{
      mediaFormat: 'PHOTO',
      sourceUrl: params.imageUrl,
    }];
  }

  if (params.callToAction) {
    body.callToAction = params.callToAction;
  }

  const response = await axios.post(
    `${GMB_API_BASE}/accounts/${accountId}/locations/${locationId}/localPosts`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  logger.info('GMB local post created', { postId: response.data.name });
  return { postId: response.data.name };
}

/**
 * List reviews for a location
 */
export async function listReviews(
  encryptedToken: string,
  accountId: string,
  locationId: string,
  pageSize: number = 50,
  pageToken?: string
): Promise<{ reviews: any[]; nextPageToken?: string; totalReviewCount: number }> {
  const token = decrypt(encryptedToken);

  const params: any = {
    pageSize,
    orderBy: 'updateTime desc',
  };
  if (pageToken) params.pageToken = pageToken;

  const response = await axios.get(
    `${GMB_API_BASE}/accounts/${accountId}/locations/${locationId}/reviews`,
    { headers: { Authorization: `Bearer ${token}` }, params }
  );

  return {
    reviews: response.data.reviews || [],
    nextPageToken: response.data.nextPageToken,
    totalReviewCount: response.data.totalReviewCount || 0,
  };
}

/**
 * Reply to a review
 */
export async function replyToReview(
  encryptedToken: string,
  accountId: string,
  locationId: string,
  reviewId: string,
  replyText: string
): Promise<void> {
  const token = decrypt(encryptedToken);

  await axios.put(
    `${GMB_API_BASE}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
    { comment: replyText },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  logger.info('GMB review reply posted', { reviewId });
}

/**
 * Get insights for a location
 */
export async function getLocationInsights(
  encryptedToken: string,
  accountId: string,
  locationId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, any>> {
  const token = decrypt(encryptedToken);

  const response = await axios.post(
    `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:getDailyMetricsTimeSeries`,
    {
      dailyMetric: ['WEBSITE_CLICKS', 'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'],
      dailyRange: {
        startDate: { year: parseInt(startDate.split('-')[0]), month: parseInt(startDate.split('-')[1]), day: parseInt(startDate.split('-')[2]) },
        endDate: { year: parseInt(endDate.split('-')[0]), month: parseInt(endDate.split('-')[1]), day: parseInt(endDate.split('-')[2]) },
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
}
