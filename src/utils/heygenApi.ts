
/**
 * HeyGen API utility functions
 * This file provides functions to interact with the HeyGen API
 */

export interface HeygenConfig {
  apiKey: string;
}

// Get stored API key
export const getApiKey = (): string | null => {
  return localStorage.getItem("heygenApiKey");
};

// Check if API key is configured
export const isApiConfigured = (): boolean => {
  return !!getApiKey();
};

// Initialize HeyGen with API key
export const initializeHeyGen = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("HeyGen API key not found");
    return false;
  }
  
  // Here you would typically initialize the HeyGen SDK or make validation calls
  // This is a placeholder for the actual implementation
  console.log("HeyGen API initialized with key:", apiKey);
  
  // Return true to indicate successful initialization
  return true;
};

// Additional HeyGen API functions can be added here
