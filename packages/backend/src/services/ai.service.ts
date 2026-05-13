import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { logger } from '../utils/logger';

interface AITokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export async function logAIUsage(
  userId: string,
  businessId: string,
  action: string,
  model: string,
  tokens: AITokenUsage,
  durationMs: number,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  // Cost estimation (per 1K tokens)
  const costPer1K: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'dall-e-3': { input: 0, output: 0.04 }, // per image
    'tts-1': { input: 0, output: 0.015 },
  };

  const pricing = costPer1K[model] || { input: 0.01, output: 0.03 };
  const costUsd = (tokens.prompt / 1000) * pricing.input + (tokens.completion / 1000) * pricing.output;

  await query(
    `INSERT INTO ai_usage_logs (id, user_id, business_id, action, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, duration_ms, success, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      uuidv4(),
      userId,
      businessId,
      action,
      model,
      tokens.prompt,
      tokens.completion,
      tokens.total,
      costUsd,
      durationMs,
      success,
      errorMessage || null,
    ]
  );

  logger.debug('AI usage logged', { userId, action, model, tokens: tokens.total, costUsd, success });
}

export async function getUsageSummary(userId: string, businessId: string, startDate: Date, endDate: Date) {
  const result = await query(
    `SELECT
       action,
       COUNT(*) as count,
       SUM(total_tokens) as total_tokens,
       SUM(cost_usd) as total_cost,
       AVG(duration_ms) as avg_duration,
       SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count,
       SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as error_count
     FROM ai_usage_logs
     WHERE user_id = $1 AND business_id = $2 AND created_at BETWEEN $3 AND $4
     GROUP BY action
     ORDER BY count DESC`,
    [userId, businessId, startDate.toISOString(), endDate.toISOString()]
  );

  return result.rows.map((row) => ({
    action: row.action,
    count: parseInt(row.count, 10),
    totalTokens: parseInt(row.total_tokens, 10),
    totalCost: parseFloat(row.total_cost),
    avgDurationMs: parseFloat(row.avg_duration),
    successCount: parseInt(row.success_count, 10),
    errorCount: parseInt(row.error_count, 10),
  }));
}
