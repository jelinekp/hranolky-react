import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { AppSettings, DEFAULT_APP_SETTINGS, mergeWithDefaults } from "../../config/appSettings";

export interface UseAppSettingsReturn {
  settings: AppSettings;
  loading: boolean;
  error: Error | null;
  /** Update settings in Firestore. Version will auto-increment and lastUpdated will be set to current time. */
  updateSettings: (updates: Partial<Omit<AppSettings, 'version' | 'lastUpdated'>>) => Promise<boolean>;
  /** Whether settings are being saved */
  saving: boolean;
}

/**
 * Hook to fetch and manage application settings from Firestore.
 * 
 * Subscribes to AppConfig/settings document with realtime updates.
 * Falls back to DEFAULT_APP_SETTINGS if document doesn't exist or on error.
 * 
 * @returns Settings data, loading/saving states, error, and update function
 */
export const useAppSettings = (): UseAppSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const settingsRef = doc(db, 'AppConfig', 'settings');

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings(mergeWithDefaults(data as Partial<AppSettings>));
          setError(null);
        } else {
          // Document doesn't exist, use defaults
          console.warn('AppConfig/settings document not found, using defaults');
          setSettings(DEFAULT_APP_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching app settings:", err);
        setError(err);
        setSettings(DEFAULT_APP_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = useCallback(async (
    updates: Partial<Omit<AppSettings, 'version' | 'lastUpdated'>>
  ): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const settingsRef = doc(db, 'AppConfig', 'settings');

      // Merge updates with current settings, increment version, update timestamp
      const newSettings: AppSettings = {
        ...settings,
        ...updates,
        version: settings.version + 1,
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(settingsRef, newSettings);
      // Note: onSnapshot will automatically update the local state
      return true;
    } catch (err) {
      console.error("Error updating app settings:", err);
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return { settings, loading, error, updateSettings, saving };
};
