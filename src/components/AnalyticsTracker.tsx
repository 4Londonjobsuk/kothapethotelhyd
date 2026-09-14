import React, { useEffect, useState } from 'react';
import { NavPage, AnalyticsSettings } from '../types';
import { hotelService, FALLBACK_ANALYTICS_SETTINGS } from '../services/hotelService';

interface AnalyticsTrackerProps {
  currentPage: NavPage;
  isAdminRoute: boolean;
}

/**
 * Validates Google Analytics 4 Measurement ID (typically G-XXXXXXXXXX)
 */
export function isValidGa4MeasurementId(id?: string | null): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  return /^G-[A-Za-z0-9_-]{4,}$/i.test(trimmed);
}

/**
 * Validates Microsoft Clarity Project ID (alphanumeric, typically 8-12 characters)
 */
export function isValidClarityProjectId(id?: string | null): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  return /^[A-Za-z0-9_-]{4,20}$/.test(trimmed);
}

/**
 * Global Tracking Script Injector & Life-cycle Manager
 * - Strict exclusion on all /admin routes
 * - Respects enable/disable toggles
 * - Dynamically loads official GA4 and Microsoft Clarity client-side scripts
 */
export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({
  currentPage,
  isAdminRoute,
}) => {
  const [settings, setSettings] = useState<AnalyticsSettings>(FALLBACK_ANALYTICS_SETTINGS);

  // Load analytics settings on mount and listen for real-time admin updates
  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const data = await hotelService.getAnalyticsSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (err) {
        console.warn('[AnalyticsTracker] Failed to load analytics settings:', err);
      }
    }

    loadSettings();

    const handleUpdate = () => {
      loadSettings();
    };

    window.addEventListener('lotus_analytics_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_analytics_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Script injection & cleanup effect
  useEffect(() => {
    // -------------------------------------------------------------------------
    // 1. ADMIN ROUTE ISOLATION: ALWAYS PREVENT TRACKING ON /admin
    // -------------------------------------------------------------------------
    if (isAdminRoute) {
      // Remove any previously injected tracking scripts to prevent tracking admin activity
      const gaScripts = document.querySelectorAll('[data-analytics="ga4"], [data-analytics="ga4-init"]');
      gaScripts.forEach((el) => el.remove());

      const clarityScripts = document.querySelectorAll('[data-analytics="clarity"]');
      clarityScripts.forEach((el) => el.remove());

      // If gtag exists in window, disable tracking
      if (settings.google_analytics_measurement_id) {
        (window as any)[`ga-disable-${settings.google_analytics_measurement_id}`] = true;
      }

      return;
    }

    // -------------------------------------------------------------------------
    // 2. GOOGLE ANALYTICS 4 (PUBLIC PAGES)
    // -------------------------------------------------------------------------
    const gaMeasurementId = settings.google_analytics_measurement_id?.trim();
    const isGaEnabled = settings.google_analytics_enabled && isValidGa4MeasurementId(gaMeasurementId);

    if (isGaEnabled && gaMeasurementId) {
      // Ensure GA is not disabled
      (window as any)[`ga-disable-${gaMeasurementId}`] = false;

      // Check if external script already injected
      let gaScript = document.querySelector<HTMLScriptElement>('script[data-analytics="ga4"]');
      if (!gaScript || gaScript.getAttribute('data-id') !== gaMeasurementId) {
        // Clean previous if ID changed
        document.querySelectorAll('[data-analytics="ga4"], [data-analytics="ga4-init"]').forEach((el) => el.remove());

        // Create new gtag.js tag
        gaScript = document.createElement('script');
        gaScript.setAttribute('async', 'true');
        gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`);
        gaScript.setAttribute('data-analytics', 'ga4');
        gaScript.setAttribute('data-id', gaMeasurementId);
        document.head.appendChild(gaScript);

        // Create inline init script
        const initScript = document.createElement('script');
        initScript.setAttribute('data-analytics', 'ga4-init');
        initScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', { send_page_view: false });
        `;
        document.head.appendChild(initScript);
      }

      // Track page view event for current page navigation
      const win = window as any;
      if (typeof win.gtag === 'function') {
        const pagePath = currentPage === 'home' ? '/' : `/${currentPage}`;
        win.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pagePath,
        });
      }
    } else {
      // Clean up GA4 scripts when disabled or invalid
      document.querySelectorAll('[data-analytics="ga4"], [data-analytics="ga4-init"]').forEach((el) => el.remove());
      if (gaMeasurementId) {
        (window as any)[`ga-disable-${gaMeasurementId}`] = true;
      }
    }

    // -------------------------------------------------------------------------
    // 3. MICROSOFT CLARITY (PUBLIC PAGES)
    // -------------------------------------------------------------------------
    const clarityProjectId = settings.clarity_project_id?.trim();
    const isClarityEnabled = settings.clarity_enabled && isValidClarityProjectId(clarityProjectId);

    if (isClarityEnabled && clarityProjectId) {
      let clarityScript = document.querySelector<HTMLScriptElement>('script[data-analytics="clarity"]');
      if (!clarityScript || clarityScript.getAttribute('data-id') !== clarityProjectId) {
        // Remove previous if project ID changed
        document.querySelectorAll('[data-analytics="clarity"]').forEach((el) => el.remove());

        // Inject official Microsoft Clarity loader script
        clarityScript = document.createElement('script');
        clarityScript.setAttribute('type', 'text/javascript');
        clarityScript.setAttribute('data-analytics', 'clarity');
        clarityScript.setAttribute('data-id', clarityProjectId);
        clarityScript.innerHTML = `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityProjectId}");
        `;
        document.head.appendChild(clarityScript);
      }
    } else {
      // Clean up Clarity script when disabled
      document.querySelectorAll('[data-analytics="clarity"]').forEach((el) => el.remove());
    }
  }, [currentPage, isAdminRoute, settings]);

  return null;
};
