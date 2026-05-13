import axios from 'axios';
import { config } from '../config';
import { encrypt, decrypt } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { query } from '../config/database';

const INSTAGRAM_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const INSTAGRAM_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const INSTAGRAM_API_BASE = 'https://graph.facebook.com/v19.0';

interface InstagramOAuthState {
  businessId: string;
  userId: string;
}

/**
 * Generate Instagram OAuth authorization URL
 */
export function getOAuthUrl(businessId: string, userId: string): { url: string; state: string } {
  const state = Buffer.from(JSON.stringify({ businessId, userId } as InstagramOAuthState)).toString('base64url');

  const params = new URLSearchParams({
    client_id: config.instagram.appId,
    redirect_uri: config.instagram.redirectUri,
    scope: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
    ].join(','),
    response_type: 'code',
    state,
  });

  return {
    url: `${INSTAGRAM_AUTH_URL}?${params.toString()}`,
    state,
  };
}

/**
 * Exchange authorization code for access token
 */
export async function handleOAuthCallback(code: string, state: string): Promise<{
  platformUserId: string;
  platformUsername: string;
  accessToken: string;
  businessId: string;
}> {
  let stateData: InstagramOAuthState;
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
  } catch {
    throw new AppError(400, 'INVALID_STATE', 'Invalid OAuth state parameter');
  }

  // Exchange code for short-lived token
  const tokenResponse = await axios.get(INSTAGRAM_TOKEN_URL, {
    params: {
      client_id: config.instagram.appId,
      client_secret: config.instagram.appSecret,
      redirect_uri: config.instagram.redirectUri,
      code,
    },
  });

  const { access_token: shortLivedToken } = tokenResponse.data;

  // Exchange for long-lived token (60 days)
  const longLivedResponse = await axios.get(`${INSTAGRAM_API_BASE}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: config.instagram.appId,
      client_secret: config.instagram.appSecret,
      fb_exchange_token: shortLivedToken,
    },
  });

  const longLivedToken = longLivedResponse.data.access_token;
  const expiresIn = longLivedResponse.data.expires_in; // seconds

  // Get user's pages
  const pagesResponse = await axios.get(`${INSTAGRAM_API_BASE}/me/accounts`, {
    params: {
      access_token: longLivedToken,
      fields: 'id,name,instagram_business_account',
    },
  });

  const pages = pagesResponse.data.data;
  if (!pages || pages.length === 0) {
    throw new AppError(400, 'NO_PAGES', 'No Facebook pages found. Please create a Facebook page and connect it to an Instagram Business account.');
  }

  // Find page with Instagram business account
  let instagramAccountId: string | null = null;
  let instagramUsername: string | null = null;

  for (const page of pages) {
    if (page.instagram_business_account) {
      instagramAccountId = page.instagram_business_account.id;

      // Get Instagram account details
      const igResponse = await axios.get(`${INSTAGRAM_API_BASE}/${instagramAccountId}`, {
        params: {
          fields: 'id,username,name,profile_picture_url,followers_count,media_count',
          access_token: longLivedToken,
        },
      });
      instagramUsername = igResponse.data.username;
      break;
    }
  }

  if (!instagramAccountId || !instagramUsername) {
    throw new AppError(400, 'NO_INSTAGRAM_ACCOUNT', 'No Instagram Business account found linked to your Facebook pages.');
  }

  return {
    platformUserId: instagramAccountId,
    platformUsername: instagramUsername,
    accessToken: encrypt(longLivedToken),
    businessId: stateData.businessId,
  };
}

/**
 * Refresh an expiring long-lived token
 */
export async function refreshAccessToken(encryptedToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const token = decrypt(encryptedToken);

  const response = await axios.get(`${INSTAGRAM_API_BASE}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: config.instagram.appId,
      client_secret: config.instagram.appSecret,
      fb_exchange_token: token,
    },
  });

  return {
    accessToken: encrypt(response.data.access_token),
    expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
  };
}

/**
 * Publish an image post to Instagram
 */
export async function publishImagePost(
  encryptedToken: string,
  instagramUserId: string,
  imageUrl: string,
  caption: string
): Promise<{ postId: string }> {
  const token = decrypt(encryptedToken);

  // Step 1: Create media container
  const containerResponse = await axios.post(`${INSTAGRAM_API_BASE}/${instagramUserId}/media`, null, {
    params: {
      image_url: imageUrl,
      caption,
      access_token: token,
    },
  });

  const containerId = containerResponse.data.id;

  // Step 2: Wait for container to be ready (poll status)
  let status = 'IN_PROGRESS';
  let attempts = 0;
  const maxAttempts = 30;

  while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusResponse = await axios.get(`${INSTAGRAM_API_BASE}/${containerId}`, {
      params: {
        fields: 'status_code',
        access_token: token,
      },
    });
    status = statusResponse.data.status_code;
    attempts++;
  }

  if (status !== 'FINISHED') {
    throw new AppError(500, 'MEDIA_PROCESSING_TIMEOUT', 'Instagram media processing timed out');
  }

  // Step 3: Publish the container
  const publishResponse = await axios.post(`${INSTAGRAM_API_BASE}/${instagramUserId}/media_publish`, null, {
    params: {
      creation_id: containerId,
      access_token: token,
    },
  });

  logger.info('Instagram post published', { postId: publishResponse.data.id, instagramUserId });
  return { postId: publishResponse.data.id };
}

/**
 * Publish a carousel post (multiple images)
 */
export async function publishCarousel(
  encryptedToken: string,
  instagramUserId: string,
  imageUrls: string[],
  caption: string
): Promise<{ postId: string }> {
  const token = decrypt(encryptedToken);

  // Step 1: Create containers for each image
  const containerIds: string[] = [];
  for (const imageUrl of imageUrls.slice(0, 10)) {
    const response = await axios.post(`${INSTAGRAM_API_BASE}/${instagramUserId}/media`, null, {
      params: {
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: token,
      },
    });
    containerIds.push(response.data.id);
  }

  // Step 2: Create carousel container
  const carouselResponse = await axios.post(`${INSTAGRAM_API_BASE}/${instagramUserId}/media`, null, {
    params: {
      media_type: 'CAROUSEL',
      children: containerIds.join(','),
      caption,
      access_token: token,
    },
  });

  const carouselId = carouselResponse.data.id;

  // Step 3: Wait and publish
  let status = 'IN_PROGRESS';
  let attempts = 0;
  while (status === 'IN_PROGRESS' && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusResponse = await axios.get(`${INSTAGRAM_API_BASE}/${carouselId}`, {
      params: { fields: 'status_code', access_token: token },
    });
    status = statusResponse.data.status_code;
    attempts++;
  }

  if (status !== 'FINISHED') {
    throw new AppError(500, 'MEDIA_PROCESSING_TIMEOUT', 'Instagram carousel processing timed out');
  }

  const publishResponse = await axios.post(`${INSTAGRAM_API_BASE}/${instagramUserId}/media_publish`, null, {
    params: { creation_id: carouselId, access_token: token },
  });

  return { postId: publishResponse.data.id };
}

/**
 * Get account insights
 */
export async function getAccountInsights(
  encryptedToken: string,
  instagramUserId: string,
  period: 'day' | 'week' | 'days_28' = 'day'
): Promise<Record<string, any>> {
  const token = decrypt(encryptedToken);

  const metrics = [
    'impressions',
    'reach',
    'follower_count',
    'email_contacts',
    'phone_call_clicks',
    'text_message_clicks',
    'get_directions_clicks',
    'website_clicks',
    'profile_views',
  ];

  const response = await axios.get(`${INSTAGRAM_API_BASE}/${instagramUserId}/insights`, {
    params: {
      metric: metrics.join(','),
      period,
      access_token: token,
    },
  });

  const insights: Record<string, any> = {};
  for (const item of response.data.data) {
    insights[item.name] = item.values?.[0]?.value ?? item.total_value?.value ?? 0;
  }

  return insights;
}

/**
 * Get media insights for a specific post
 */
export async function getMediaInsights(
  encryptedToken: string,
  mediaId: string
): Promise<Record<string, number>> {
  const token = decrypt(encryptedToken);

  const response = await axios.get(`${INSTAGRAM_API_BASE}/${mediaId}/insights`, {
    params: {
      metric: 'engagement,impressions,reach,saved,video_views',
      access_token: token,
    },
  });

  const insights: Record<string, number> = {};
  for (const item of response.data.data) {
    insights[item.name] = item.values?.[0]?.value ?? 0;
  }

  return insights;
}
