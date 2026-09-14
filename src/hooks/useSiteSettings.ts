import { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { siteSettings as fallbackSettings } from '../data/hotelData';
import { hotelService, getSavedSiteSettings } from '../services/hotelService';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = getSavedSiteSettings();
    return {
      ...fallbackSettings,
      ...saved,
    };
  });

  useEffect(() => {
    let isMounted = true;

    // Fetch initial fresh settings from database / storage
    hotelService
      .getSettings()
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
        }
      })
      .catch(() => {});

    // Listen for real-time local updates from AdminSettingsPage
    const handleUpdate = (event: CustomEvent<Partial<SiteSettings>>) => {
      if (!isMounted) return;
      setSettings((prev) => ({
        ...prev,
        ...event.detail,
      }));
    };

    window.addEventListener('lotus_settings_updated', handleUpdate as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_settings_updated', handleUpdate as EventListener);
    };
  }, []);

  return settings;
}
