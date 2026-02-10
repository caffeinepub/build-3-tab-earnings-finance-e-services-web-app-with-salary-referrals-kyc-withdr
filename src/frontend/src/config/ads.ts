// External ad configuration for Tap-to-Earn interstitials
// Update these values to change ad sources without refactoring components

export const adConfig = {
  // External ad script URL (if using a third-party ad network)
  // Example: 'https://example.com/ad-script.js'
  scriptUrl: '',
  
  // Direct ad URL (if using a direct ad link)
  // Example: 'https://example.com/ad-page'
  directUrl: '',
  
  // Enable external ads (set to true when scriptUrl or directUrl is configured)
  enabled: false,
  
  // Fallback to local creative inventory when external ads fail or are disabled
  useFallback: true,
};
