import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initializeDatabase } from './config/database';

async function main() {
  try {
    await initializeDatabase();
    logger.info('Database initialized');

    app.listen(config.port, () => {
      logger.info(`ChaiBoost API running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
