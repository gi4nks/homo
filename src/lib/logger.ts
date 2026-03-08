/**
 * Structured Logging with Pino
 *
 * Centralized logging infrastructure with:
 * - Structured JSON logs for production
 * - Pretty-printed logs for development
 * - Context enrichment (sceneId, bookId, userId, etc.)
 * - Log levels: DEBUG, INFO, WARN, ERROR, FATAL
 * - Automatic file rotation
 */

import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log rotation: daily files with date suffix
const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `homo-${date}.log`);
};

// Development vs Production configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false
        }
      }
    : {
        target: 'pino/file',
        options: {
          destination: getLogFilePath(),
          mkdir: true
        }
      },

  // Base context (added to all logs)
  base: {
    env: process.env.NODE_ENV || 'development',
    app: 'HOMO',
    version: process.env.npm_package_version || '1.0.0'
  },

  // Timestamp formatting
  timestamp: pino.stdTimeFunctions.isoTime
});

/**
 * Log rotation cleanup
 * Delete log files older than 30 days
 */
export function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      if (!file.endsWith('.log')) continue;

      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        logger.info({ file }, 'Deleted old log file');
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old logs');
  }
}

/**
 * Get recent log entries (last N lines)
 * Used for Settings UI log viewer
 */
export function getRecentLogs(limit: number = 100): string[] {
  try {
    const logFile = getLogFilePath();

    if (!fs.existsSync(logFile)) {
      return [];
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    // Return last N lines
    return lines.slice(-limit);
  } catch (error) {
    logger.error({ error }, 'Failed to read log file');
    return [];
  }
}

/**
 * Structured logger with context helpers
 */
export const log = {
  /**
   * Debug-level logging (verbose, development only)
   */
  debug: (context: Record<string, any>, message: string) => {
    logger.debug(context, message);
  },

  /**
   * Info-level logging (normal operations)
   */
  info: (context: Record<string, any>, message: string) => {
    logger.info(context, message);
  },

  /**
   * Warning-level logging (recoverable issues)
   */
  warn: (context: Record<string, any>, message: string) => {
    logger.warn(context, message);
  },

  /**
   * Error-level logging (failures that need attention)
   */
  error: (context: Record<string, any>, message: string, error?: Error) => {
    logger.error({
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }, message);
  },

  /**
   * Fatal-level logging (critical failures)
   */
  fatal: (context: Record<string, any>, message: string, error?: Error) => {
    logger.fatal({
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }, message);
  },

  /**
   * Log AI generation events with duration and token usage
   */
  aiGeneration: (context: {
    sceneId: string;
    bookId: string;
    provider: string;
    model: string;
    taskType: string;
    duration?: number;
    tokens?: number;
    cacheHit?: boolean;
  }) => {
    logger.info({
      ...context,
      event: 'ai_generation'
    }, 'AI generation completed');
  },

  /**
   * Log database operations
   */
  database: (context: {
    operation: 'create' | 'update' | 'delete' | 'read';
    model: string;
    recordId?: string;
    duration?: number;
  }) => {
    logger.debug({
      ...context,
      event: 'database'
    }, `Database ${context.operation}: ${context.model}`);
  },

  /**
   * Log snapshot operations
   */
  snapshot: (context: {
    sceneId: string;
    operation: 'create' | 'restore' | 'cleanup';
    count?: number;
  }) => {
    logger.info({
      ...context,
      event: 'snapshot'
    }, `Snapshot ${context.operation}`);
  },

  /**
   * Log backup operations
   */
  backup: (context: {
    operation: 'create' | 'restore';
    filename?: string;
    size?: number;
    checksum?: string;
  }) => {
    logger.info({
      ...context,
      event: 'backup'
    }, `Database backup ${context.operation}`);
  }
};

// Schedule log rotation cleanup (run on server startup)
if (typeof window === 'undefined') {
  // Server-side only
  cleanupOldLogs();

  // Schedule daily cleanup at midnight
  const msUntilMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  setTimeout(() => {
    cleanupOldLogs();
    // Then run every 24 hours
    setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
  }, msUntilMidnight());
}

export default logger;
