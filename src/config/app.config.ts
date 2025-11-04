// Application Configuration
// Centralized configuration management

import { APP_NAME, APP_VERSION, API_CONFIG, FEATURES } from "@/constants";

export const appConfig = {
  // Application Info
  name: APP_NAME,
  version: APP_VERSION,
  environment: import.meta.env.VITE_ENVIRONMENT || "development",

  // API Configuration
  api: {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
    retryDelay: API_CONFIG.RETRY_DELAY,
  },

  // Feature Flags
  features: FEATURES,

  // Development Settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  debugMode: import.meta.env.VITE_DEBUG_MODE === "true",

  // External Services
  googleAI: {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
    enabled: !!import.meta.env.VITE_GOOGLE_API_KEY,
  },

  // Analytics
  analytics: {
    enabled: FEATURES.ANALYTICS,
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  },

  // Error Tracking
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || "",
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || "development",
  },
} as const;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return appConfig.features[feature];
};

// Helper function to get environment
export const getEnvironment = (): string => {
  return appConfig.environment;
};

// Helper function to check if running in development
export const isDev = (): boolean => {
  return appConfig.isDevelopment;
};

// Helper function to check if running in production
export const isProd = (): boolean => {
  return appConfig.isProduction;
};
