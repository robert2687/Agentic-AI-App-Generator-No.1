import { AuditLogger } from './auditLogger.js';

/**
 * A singleton instance of the AuditLogger.
 * This is used throughout the application to ensure all logs are collected
 * in one central place, making it easy to display in the UI and export
 * for CI/CD artifacts.
 */
export const logger = new AuditLogger();
