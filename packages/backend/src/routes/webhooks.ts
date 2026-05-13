import { Router, raw } from 'express';
import Stripe from 'stripe';
import { config } from '../config';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();
const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-06-20' });

// Stripe webhook — raw body required for signature verification
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err: any) {
    logger.error('Stripe webhook signature failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier;
        if (userId && tier) {
          await query(
            `UPDATE users SET is_premium = true, premium_tier = $1, 
             premium_expires_at = NOW() + INTERVAL '30 days', updated_at = NOW()
             WHERE id = $2`,
            [tier, userId]
          );
          logger.info(`User ${userId} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer && !customer.deleted && customer.email) {
          await query(
            `UPDATE users SET is_premium = false, premium_tier = 'free', 
             premium_expires_at = NULL, updated_at = NOW()
             WHERE email = $1`,
            [customer.email]
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        logger.warn('Invoice payment failed:', event.data.object.id);
        // TODO: notify user, start grace period
        break;
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export { router as webhooksRouter };
