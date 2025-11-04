/**
 * Centralized logging utility
 * Provides consistent logging across the application
 * In production, logs are sent to error tracking service (Sentry, etc.)
 */

import { appConfig, isDev } from "@/config/app.config";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private enableDebug: boolean;

  constructor() {
    this.isDevelopment = appConfig.isDevelopment;
    this.enableDebug = appConfig.debugMode;
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.enableDebug) {
      console.log(`[DEBUG] ${message}`, context || "");
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || "");
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || "");

    // In production, send to error tracking
    if (!this.isDevelopment && appConfig.sentry.enabled) {
      this.sendToErrorTracking("warning", message, context);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context || "");

    // In production, send to error tracking
    if (!this.isDevelopment && appConfig.sentry.enabled) {
      this.sendToErrorTracking("error", message, { error, ...context });
    }
  }

  /**
   * Log API errors
   */
  apiError(endpoint: string, error: Error | unknown, context?: LogContext): void {
    this.error(`API Error: ${endpoint}`, error, { endpoint, ...context });
  }

  /**
   * Log user actions (for analytics)
   */
  userAction(action: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[USER ACTION] ${action}`, context || "");
    }

    // In production, send to analytics
    if (!this.isDevelopment && appConfig.analytics.enabled) {
      this.sendToAnalytics(action, context);
    }
  }

  /**
   * Send error to tracking service (Sentry, etc.)
   * TODO: Implement actual Sentry integration
   */
  private sendToErrorTracking(level: string, message: string, context?: LogContext): void {
    // TODO: Implement Sentry.captureMessage() or similar
    if (this.enableDebug) {
      console.log(`[SENTRY] ${level}: ${message}`, context);
    }
  }

  /**
   * Send event to analytics service
   * TODO: Implement actual analytics integration
   */
  private sendToAnalytics(action: string, context?: LogContext): void {
    // TODO: Implement Google Analytics gtag() or similar
    if (this.enableDebug) {
      console.log(`[ANALYTICS] ${action}`, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logApiError = logger.apiError.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
