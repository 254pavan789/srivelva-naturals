import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings } from '../utils/api';

/**
 * SettingsContext — provides live business settings (WhatsApp number, email)
 * fetched from GET /api/settings to every component in the app.
 *
 * WHY THIS EXISTS:
 *   Previously, WhatsApp number was read from VITE_WHATSAPP_NUMBER (a compile-time
 *   env var). This meant:
 *     1. Admins changing the number in the settings panel had no effect on
 *        the footer, home page buttons, or contact page.
 *     2. The env var is baked in at build time — impossible to change without
 *        redeploying the frontend.
 *
 *   This context fetches the live value from the backend on app load, then makes
 *   it available to Footer, Home, and any other component via useSettings().
 *   When the admin saves new settings, they can call refreshSettings() to
 *   instantly propagate the new values everywhere.
 *
 * USAGE:
 *   const { wa, email, refreshSettings } = useSettings();
 */

const SettingsContext = createContext({
  wa:              '9944268288',     // WhatsApp number (no country code)
  email:           'info@srivelvanaturals.com',
  loaded:          false,
  refreshSettings: () => {},
});

/** Default fallback values — shown if the API hasn't responded yet */
const DEFAULTS = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '9944268288',
  email:          'info@srivelvanaturals.com',
};

export function SettingsProvider({ children }) {
  const [settings,  setSettings]  = useState(DEFAULTS);
  const [loaded,    setLoaded]    = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      // ApiResponse shape: { success, data: { whatsappNumber, email, ... } }
      const data = res?.data?.data || res?.data;
      if (data?.whatsappNumber || data?.email) {
        setSettings({
          whatsappNumber: data.whatsappNumber || DEFAULTS.whatsappNumber,
          email:          data.email          || DEFAULTS.email,
        });
      }
    } catch {
      // Backend unreachable — keep using env-var fallback, don't crash the app
    } finally {
      setLoaded(true);
    }
  }, []);

  // Fetch on app load
  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{
      settings,                          // full object: { whatsappNumber, email }
      wa:              settings.whatsappNumber,  // shorthand used by Footer/Home
      email:           settings.email,
      loaded,
      refreshSettings: fetchSettings,    // canonical name — call after admin saves
      refresh:         fetchSettings,    // alias so Admin.jsx works with either name
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
