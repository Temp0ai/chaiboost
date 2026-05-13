import Stripe from 'stripe';
import { config } from '../config';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { TIER_LIMITS, type SubscriptionTier } from '@chaiboost/shared';

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-02-15' as any });

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
  // Check if customer already exists
  const result = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
  if (result.rows[0]?.stripe_customer_id) {
    return result.rows[0].stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, userId]);
  logger.info('Stripe customer created', { userId, customerId: customer.id });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const user = userResult.rows[0];
  const customerId = await getOrCreateCustomer(userId, user.email, user.display_name);

  const priceId = getStripePriceId(tier);
  if (!priceId) {
    throw new AppError(400, 'INVALID_TIER', 'Cannot create checkout for this tier');
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, tier },
  });

  return session.url!;
}

/**
 * Create a billing portal session
 */
export async function createPortalSession(userId: string, returnUrl: string): Promise<string> {
  const result = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
  const customerId = result.rows[0]?.stripe_customer_id;

  if (!customerId) {
    throw new AppError(400, 'NO_SUBSCRIPTION', 'No billing account found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as SubscriptionTier;

      if (userId && tier) {
        await query(
          "UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2",
          [tier, userId]
        );
        logger.info('Subscription activated via checkout', { userId, tier });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Map Stripe price to tier
      const priceId = subscription.items.data[0]?.price.id;
      const tier = mapPriceIdToTier(priceId);

      if (tier) {
        await query(
          "UPDATE users SET tier = $1, updated_at = NOW() WHERE stripe_customer_id = $2",
          [tier, customerId]
        );
        logger.info('Subscription updated', { customerId, tier });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await query(
        "UPDATE users SET tier = 'free', updated_at = NOW() WHERE stripe_customer_id = $1",
        [customerId]
      );
      logger.info('Subscription cancelled, reverted to free', { customerId });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      logger.warn('Invoice payment failed', { customerId });
      // Could send notification email here
      break;
    }

    default:
      logger.debug('Unhandled webhook event', { type: event.type });
  }
}

function getStripePriceId(tier: SubscriptionTier): string | null {
  const map: Record<string, string | null> = {
    free: null,
    starter: process.env.STRIPE_PRICE_STARTER || null,
    growth: process.env.STRIPE_PRICE_GROWTH || null,
    pro: process.env.STRIPE_PRICE_PRO || null,
  };
  return map[tier] || null;
}

function mapPriceIdToTier(priceId: string): SubscriptionTier | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return 'growth';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  return null;
}
