/**
 * RAILRAKSHA — RAILWAYS API CONFIGURATION (RapidAPI Version)
 */

export const RAILWAY_API_CONFIG = {
  /**
   * PASTE YOUR RAPIDAPI KEY HERE (or use localStorage / env variables)
   */
  API_KEY: (typeof window !== 'undefined' && localStorage.getItem('railraksha_custom_api_key'))
    || import.meta.env?.VITE_RAILWAYS_API_KEY
    || 'YOUR_KEY_HERE',

  /**
   * API Host Header / Base Domain for RapidAPI IRCTC Gateway
   */
  API_HOST: (typeof window !== 'undefined' && localStorage.getItem('railraksha_custom_api_host'))
    || import.meta.env?.VITE_RAILWAYS_API_HOST
    || 'irctc1.p.rapidapi.com',

  /**
   * Base API Endpoint URL
   */
  BASE_URL: 'https://irctc1.p.rapidapi.com/api/v3',

  /**
   * Fallback Flag: Always preserve mock data when API is unavailable or unconfigured
   */
  USE_MOCK_FALLBACK: true,

  /**
   * Provider display label
   */
  PROVIDER_NAME: 'RapidAPI IRCTC Gateway',
};

/**
 * Helper to update runtime API key from UI
 */
export function setRuntimeRailwayApiKey(newKey, newHost) {
  if (typeof window !== 'undefined') {
    if (newKey) {
      localStorage.setItem('railraksha_custom_api_key', newKey.trim());
      RAILWAY_API_CONFIG.API_KEY = newKey.trim();
    } else {
      localStorage.removeItem('railraksha_custom_api_key');
      RAILWAY_API_CONFIG.API_KEY = '';
    }
    if (newHost) {
      localStorage.setItem('railraksha_custom_api_host', newHost.trim());
      RAILWAY_API_CONFIG.API_HOST = newHost.trim();
    }
  }
}

/**
 * Helper to check whether a live API key is actively configured
 */
export function isLiveRailwayApiActive() {
  const key = RAILWAY_API_CONFIG.API_KEY || (typeof window !== 'undefined' && localStorage.getItem('railraksha_custom_api_key'));
  return Boolean(key && key.trim().length > 5 && key.trim() !== 'YOUR_KEY_HERE');
}