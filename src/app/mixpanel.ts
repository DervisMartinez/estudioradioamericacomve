import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = 'f20deadc65fe29b7453b9850d1725f35';
const isProduction = import.meta.env.MODE === 'production';

/**
 * Initializes Mixpanel analytics.
 * Call this function once when the application starts.
 */
export const initMixpanel = () => {
  // Check if the token is provided and we are in a browser environment
  if (MIXPANEL_TOKEN && typeof window !== 'undefined') {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: !isProduction, // Enable debug mode only when not in production
      track_pageview: true, // Automatically track page views for client-side routing
      persistence: 'localStorage', // Use localStorage for persistence
    });
  }
};

/**
 * A helper object for tracking events safely.
 * It ensures tracking calls are only made if Mixpanel is initialized.
 * Example: Mixpanel.track('Button Clicked', { buttonName: 'Subscribe' });
 */
export const Mixpanel = {
  track: (name: string, props?: object) => {
    if (MIXPANEL_TOKEN && isProduction) mixpanel.track(name, props);
  },
};