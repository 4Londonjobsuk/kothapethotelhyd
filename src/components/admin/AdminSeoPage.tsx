import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  Share2,
  Twitter,
  Compass,
  BarChart3,
  Activity,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  hotelService,
  FALLBACK_GLOBAL_SEO,
  FALLBACK_PAGE_SEO,
  FALLBACK_ANALYTICS_SETTINGS,
} from '../../services/hotelService';
import { GlobalSeoSettings, PageSeoSettings, SeoPageRoute, AnalyticsSettings } from '../../types';
import { isValidGa4MeasurementId, isValidClarityProjectId } from '../AnalyticsTracker';

type MainSection = 'seo' | 'analytics';
type SeoTab = 'global' | 'pages' | 'gsc';
type AnalyticsTab = 'ga4' | 'clarity';

const SUPPORTED_PAGES: { route: SeoPageRoute; label: string; defaultPath: string }[] = [
  { route: '/', label: 'Home', defaultPath: '/' },
  { route: '/about', label: 'About Us', defaultPath: '/about' },
  { route: '/rooms', label: 'Rooms & Suites', defaultPath: '/rooms' },
  { route: '/amenities', label: 'Amenities', defaultPath: '/amenities' },
  { route: '/gallery', label: 'Gallery', defaultPath: '/gallery' },
  { route: '/attractions', label: 'Attractions', defaultPath: '/attractions' },
  { route: '/contact', label: 'Contact Us', defaultPath: '/contact' },
];

export const AdminSeoPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MainSection>('seo');
  const [activeTab, setActiveTab] = useState<SeoTab>('global');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<AnalyticsTab>('ga4');
  const [selectedRoute, setSelectedRoute] = useState<SeoPageRoute>('/');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global SEO Form State
  const [globalSeo, setGlobalSeo] = useState<GlobalSeoSettings>(FALLBACK_GLOBAL_SEO);

  // Page-Level SEO Form State
  const [pagesMap, setPagesMap] = useState<Record<string, PageSeoSettings>>(FALLBACK_PAGE_SEO);

  // Google Search Console Input State
  const [gscInput, setGscInput] = useState<string>('');

  // Analytics Settings State
  const [analyticsSettings, setAnalyticsSettings] = useState<AnalyticsSettings>(FALLBACK_ANALYTICS_SETTINGS);
  const [gaForm, setGaForm] = useState<{ enabled: boolean; measurementId: string }>({
    enabled: false,
    measurementId: '',
  });
  const [clarityForm, setClarityForm] = useState<{ enabled: boolean; projectId: string }>({
    enabled: false,
    projectId: '',
  });
  const [savingAnalytics, setSavingAnalytics] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [globalData, allPages, analyticsData] = await Promise.all([
          hotelService.getGlobalSeo(),
          hotelService.getAllPageSeo(),
          hotelService.getAnalyticsSettings(),
        ]);

        if (isMounted) {
          setGlobalSeo(globalData);
          setGscInput(globalData.google_site_verification || '');

          const map: Record<string, PageSeoSettings> = {};
          allPages.forEach((p) => {
            map[p.page_route] = p;
          });
          setPagesMap(map);

          setAnalyticsSettings(analyticsData);
          setGaForm({
            enabled: analyticsData.google_analytics_enabled,
            measurementId: analyticsData.google_analytics_measurement_id || '',
          });
          setClarityForm({
            enabled: analyticsData.clarity_enabled,
            projectId: analyticsData.clarity_project_id || '',
          });
        }
      } catch (err: any) {
        console.error('Error loading SEO & Analytics data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // ---------------------------------------------------------------------------
  // SAVE GLOBAL SEO
  // ---------------------------------------------------------------------------
  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const res = await hotelService.updateGlobalSeo({
      site_title: globalSeo.site_title,
      default_meta_description: globalSeo.default_meta_description,
      default_canonical_url: globalSeo.default_canonical_url,
      default_og_title: globalSeo.default_og_title,
      default_og_description: globalSeo.default_og_description,
      default_og_image: globalSeo.default_og_image,
      default_twitter_title: globalSeo.default_twitter_title,
      default_twitter_description: globalSeo.default_twitter_description,
      default_twitter_image: globalSeo.default_twitter_image,
      robots_index: globalSeo.robots_index,
      robots_follow: globalSeo.robots_follow,
    });

    setSaving(false);
    if (res.success) {
      showNotification('success', 'Global SEO configuration saved and updated successfully.');
    } else {
      showNotification('error', res.error || 'Failed to save Global SEO.');
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE PAGE-LEVEL SEO
  // ---------------------------------------------------------------------------
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const currentPageData = pagesMap[selectedRoute] || FALLBACK_PAGE_SEO[selectedRoute];
    const res = await hotelService.updatePageSeo(selectedRoute, currentPageData);

    setSaving(false);
    if (res.success) {
      showNotification('success', `Page SEO for "${currentPageData.page_label}" (${selectedRoute}) saved successfully.`);
    } else {
      showNotification('error', res.error || 'Failed to save Page SEO.');
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE GOOGLE SEARCH CONSOLE VERIFICATION CODE
  // ---------------------------------------------------------------------------
  const handleSaveGsc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    // Sanitize: If user pastes full tag <meta name="google-site-verification" content="xyz" />, extract content
    let sanitizedCode = gscInput.trim();
    const contentMatch = sanitizedCode.match(/content=["']([^"']+)["']/i);
    if (contentMatch && contentMatch[1]) {
      sanitizedCode = contentMatch[1].trim();
    }

    const res = await hotelService.updateGlobalSeo({
      google_site_verification: sanitizedCode.length > 0 ? sanitizedCode : null,
    });

    setSaving(false);
    if (res.success) {
      setGlobalSeo((prev) => ({
        ...prev,
        google_site_verification: sanitizedCode.length > 0 ? sanitizedCode : null,
      }));
      setGscInput(sanitizedCode);
      showNotification(
        'success',
        sanitizedCode.length > 0
          ? 'Google Search Console verification meta tag configured. Verification meta tag will now render in HTML document head.'
          : 'Google Search Console verification code cleared.'
      );
    } else {
      showNotification('error', res.error || 'Failed to save verification code.');
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE GOOGLE ANALYTICS 4 SETTINGS
  // ---------------------------------------------------------------------------
  const handleSaveGa4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnalytics(true);
    setStatusMsg(null);

    const cleanId = gaForm.measurementId.trim();

    if (gaForm.enabled && cleanId.length > 0 && !isValidGa4MeasurementId(cleanId)) {
      showNotification('error', 'Invalid Measurement ID format. Google Analytics 4 IDs start with "G-" (e.g. G-XXXXXXXXXX).');
      setSavingAnalytics(false);
      return;
    }

    const res = await hotelService.updateGoogleAnalytics(gaForm.enabled, cleanId);
    setSavingAnalytics(false);

    if (res.success) {
      setAnalyticsSettings((prev) => ({
        ...prev,
        google_analytics_enabled: gaForm.enabled,
        google_analytics_measurement_id: cleanId,
      }));
      window.dispatchEvent(new Event('lotus_analytics_updated'));
      showNotification(
        'success',
        gaForm.enabled
          ? `Google Analytics 4 is now ENABLED with Measurement ID ${cleanId || '(Pending ID)'}. Tracking will load on public pages.`
          : 'Google Analytics 4 is now DISABLED. Tracking script will not load.'
      );
    } else {
      showNotification('error', res.error || 'Failed to save Google Analytics 4 settings.');
    }
  };

  // ---------------------------------------------------------------------------
  // SAVE MICROSOFT CLARITY SETTINGS
  // ---------------------------------------------------------------------------
  const handleSaveClarity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnalytics(true);
    setStatusMsg(null);

    const cleanId = clarityForm.projectId.trim();

    if (clarityForm.enabled && cleanId.length > 0 && !isValidClarityProjectId(cleanId)) {
      showNotification('error', 'Invalid Project ID format. Microsoft Clarity Project IDs are alphanumeric strings without spaces.');
      setSavingAnalytics(false);
      return;
    }

    const res = await hotelService.updateMicrosoftClarity(clarityForm.enabled, cleanId);
    setSavingAnalytics(false);

    if (res.success) {
      setAnalyticsSettings((prev) => ({
        ...prev,
        clarity_enabled: clarityForm.enabled,
        clarity_project_id: cleanId,
      }));
      window.dispatchEvent(new Event('lotus_analytics_updated'));
      showNotification(
        'success',
        clarityForm.enabled
          ? `Microsoft Clarity is now ENABLED with Project ID ${cleanId || '(Pending ID)'}. Heatmaps & recordings will load on public pages.`
          : 'Microsoft Clarity is now DISABLED. Tracking script will not load.'
      );
    } else {
      showNotification('error', res.error || 'Failed to save Microsoft Clarity settings.');
    }
  };

  const currentSelectedPage = pagesMap[selectedRoute] || FALLBACK_PAGE_SEO[selectedRoute];

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
        <span className="text-xs uppercase tracking-widest font-sans">Loading SEO Configuration...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D1E3A] border border-[#C59A47]/40 flex items-center justify-center text-[#E0C37B]">
              {activeSection === 'seo' ? <Search className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-medium text-stone-100">
                SEO & Analytics Management Console
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Manage search engine optimization, page metadata, Google Search Console, and client-side tracking (GA4 & Clarity).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {activeSection === 'seo'
                  ? 'RLS Protected (seo.manage)'
                  : 'RLS Protected (analytics.manage)'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-lg border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800/80'
              : 'bg-rose-950/60 text-rose-200 border-rose-800/80'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Primary Section Switcher: SEO vs. Analytics */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070E1A] border border-stone-800/80 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveSection('seo')}
          className={`px-5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'seo'
              ? 'bg-[#0D1E3A] text-[#E0C37B] border border-[#C59A47]/40 shadow-sm font-semibold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('analytics')}
          className={`px-5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'analytics'
              ? 'bg-[#0D1E3A] text-[#E0C37B] border border-[#C59A47]/40 shadow-sm font-semibold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
          {(analyticsSettings.google_analytics_enabled || analyticsSettings.clarity_enabled) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active trackers configured" />
          )}
        </button>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: SEO MANAGEMENT */}
      {/* =================================================================== */}
      {activeSection === 'seo' && (
        <div className="space-y-6">
          {/* SEO Tab Navigation */}
          <div className="flex border-b border-stone-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'global'
                  ? 'text-[#E0C37B] border-[#C59A47] bg-[#0B1526]'
                  : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-[#0B1526]/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Global SEO & Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'pages'
                  ? 'text-[#E0C37B] border-[#C59A47] bg-[#0B1526]'
                  : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-[#0B1526]/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Page-Level SEO (7 Routes)</span>
            </button>

            <button
              onClick={() => setActiveTab('gsc')}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'gsc'
                  ? 'text-[#E0C37B] border-[#C59A47] bg-[#0B1526]'
                  : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-[#0B1526]/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Google Search Console</span>
              {globalSeo.google_site_verification && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Verification code active" />
              )}
            </button>
          </div>

      {/* =================================================================== */}
      {/* TAB 1: GLOBAL SEO */}
      {/* =================================================================== */}
      {activeTab === 'global' && (
        <form onSubmit={handleSaveGlobal} className="space-y-6">
          <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Global Site Identity & Defaults</span>
              </div>
              <span className="text-[10px] text-stone-400">Used as fallback when page-level tags are not defined</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Default Site Title
                </label>
                <input
                  type="text"
                  value={globalSeo.site_title}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, site_title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  placeholder="Lotus Grand Hotel — Kothapet, Hyderabad"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Recommended: 50–60 characters. Current: {globalSeo.site_title.length} characters.
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={globalSeo.default_meta_description}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, default_meta_description: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  placeholder="Official website for Lotus Grand Hotel in Kothapet / Saroornagar, Hyderabad..."
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Recommended: 140–160 characters. Current: {globalSeo.default_meta_description.length} characters.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Base Canonical Website URL
                </label>
                <input
                  type="url"
                  value={globalSeo.default_canonical_url}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, default_canonical_url: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  placeholder="https://lotusgrand.in"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Canonical URL base used for constructing self-referential canonical tags.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Global Robots Index
                  </label>
                  <select
                    value={globalSeo.robots_index ? 'true' : 'false'}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, robots_index: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  >
                    <option value="true">index (Allow search indexing)</option>
                    <option value="false">noindex (Block search indexing)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Global Robots Follow
                  </label>
                  <select
                    value={globalSeo.robots_follow ? 'true' : 'false'}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, robots_follow: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  >
                    <option value="true">follow (Crawl page links)</option>
                    <option value="false">nofollow (Do not crawl links)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OpenGraph & Social Sharing Defaults */}
            <div className="pt-4 border-t border-stone-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                <Share2 className="w-4 h-4" />
                <span>Default Social Media / OpenGraph Tags</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Default OG Title
                  </label>
                  <input
                    type="text"
                    value={globalSeo.default_og_title}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_og_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    placeholder="Lotus Grand Hotel — Kothapet, Hyderabad"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Default OG Image URL
                  </label>
                  <input
                    type="text"
                    value={globalSeo.default_og_image}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_og_image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    placeholder="/assets/rooms/deluxe-room.webp"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Default OG Description
                  </label>
                  <textarea
                    rows={2}
                    value={globalSeo.default_og_description}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_og_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    placeholder="Experience premium comfort and true hospitality at Lotus Grand Hotel..."
                  />
                </div>
              </div>
            </div>

            {/* Twitter / X Card Defaults */}
            <div className="pt-4 border-t border-stone-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                <Twitter className="w-4 h-4" />
                <span>Default Twitter / X Card Settings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Twitter Card Title
                  </label>
                  <input
                    type="text"
                    value={globalSeo.default_twitter_title}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_twitter_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Twitter Card Image URL
                  </label>
                  <input
                    type="text"
                    value={globalSeo.default_twitter_image}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_twitter_image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Twitter Card Description
                  </label>
                  <textarea
                    rows={2}
                    value={globalSeo.default_twitter_description}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_twitter_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  />
                </div>
              </div>
            </div>

            {/* Save Controls */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <div className="text-[11px] text-stone-400">
                Changes persist directly in Supabase table <code className="text-stone-300">seo_settings</code>.
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{saving ? 'Saving Global SEO...' : 'Save Global SEO Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* TAB 2: PAGE-LEVEL SEO */}
      {/* =================================================================== */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* Page Selector Pill Buttons */}
          <div className="bg-[#0B1526] p-3 rounded-2xl border border-stone-800/80">
            <label className="block text-[11px] font-medium text-stone-400 mb-2 px-1 uppercase tracking-wider">
              Select Public Page to Configure:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {SUPPORTED_PAGES.map((page) => {
                const isSelected = selectedRoute === page.route;
                return (
                  <button
                    key={page.route}
                    type="button"
                    onClick={() => setSelectedRoute(page.route)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#C59A47] text-stone-950 border-[#C59A47] font-semibold shadow-md'
                        : 'bg-[#070E1A] text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{page.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-stone-900/80' : 'text-stone-500'}`}>
                      {page.route}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form for selected page */}
          <form onSubmit={handleSavePage} className="space-y-6">
            <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800/60 pb-3 gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Route SEO: {currentSelectedPage.page_label} ({selectedRoute})</span>
                </div>
                <span className="text-[10px] text-stone-400">
                  Target Route: <code className="text-[#E0C37B]">{selectedRoute}</code>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Meta Title (Browser Tab & Search Title)
                  </label>
                  <input
                    type="text"
                    value={currentSelectedPage.meta_title}
                    onChange={(e) =>
                      setPagesMap({
                        ...pagesMap,
                        [selectedRoute]: {
                          ...currentSelectedPage,
                          meta_title: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Recommended: 50–60 characters. Current: {currentSelectedPage.meta_title.length} characters.
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Meta Description (Search Engine Snippet)
                  </label>
                  <textarea
                    rows={3}
                    value={currentSelectedPage.meta_description}
                    onChange={(e) =>
                      setPagesMap({
                        ...pagesMap,
                        [selectedRoute]: {
                          ...currentSelectedPage,
                          meta_description: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Recommended: 140–160 characters. Current: {currentSelectedPage.meta_description.length} characters.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Canonical URL (Specific to this page)
                  </label>
                  <input
                    type="url"
                    value={currentSelectedPage.canonical_url}
                    onChange={(e) =>
                      setPagesMap({
                        ...pagesMap,
                        [selectedRoute]: {
                          ...currentSelectedPage,
                          canonical_url: e.target.value,
                        },
                      })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    placeholder="https://lotusgrand.in/rooms"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Canonical link prevents search engine duplicate content penalties.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Robots Indexing
                    </label>
                    <select
                      value={currentSelectedPage.robots_index ? 'true' : 'false'}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            robots_index: e.target.value === 'true',
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    >
                      <option value="true">index (Allow indexing)</option>
                      <option value="false">noindex (Prevent indexing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Robots Link Following
                    </label>
                    <select
                      value={currentSelectedPage.robots_follow ? 'true' : 'false'}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            robots_follow: e.target.value === 'true',
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    >
                      <option value="true">follow (Crawl page links)</option>
                      <option value="false">nofollow (Do not crawl links)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* OpenGraph Group */}
              <div className="pt-4 border-t border-stone-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                  <Share2 className="w-4 h-4" />
                  <span>Page OpenGraph / Facebook Sharing</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={currentSelectedPage.og_title}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            og_title: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={currentSelectedPage.og_image}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            og_image: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      OG Description
                    </label>
                    <textarea
                      rows={2}
                      value={currentSelectedPage.og_description}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            og_description: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>
                </div>
              </div>

              {/* Twitter / X Group */}
              <div className="pt-4 border-t border-stone-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                  <Twitter className="w-4 h-4" />
                  <span>Page Twitter / X Metadata</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Twitter Title
                    </label>
                    <input
                      type="text"
                      value={currentSelectedPage.twitter_title}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            twitter_title: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Twitter Image URL
                    </label>
                    <input
                      type="text"
                      value={currentSelectedPage.twitter_image}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            twitter_image: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Twitter Description
                    </label>
                    <textarea
                      rows={2}
                      value={currentSelectedPage.twitter_description}
                      onChange={(e) =>
                        setPagesMap({
                          ...pagesMap,
                          [selectedRoute]: {
                            ...currentSelectedPage,
                            twitter_description: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
                    />
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div className="text-[11px] text-stone-400">
                  Saving updates route <span className="text-[#E0C37B] font-mono">{selectedRoute}</span> in Supabase.
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : `Save SEO for ${currentSelectedPage.page_label}`}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: GOOGLE SEARCH CONSOLE */}
      {/* =================================================================== */}
      {activeTab === 'gsc' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveGsc} className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E0C37B] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Search Console Ownership Verification</span>
              </div>
              <div className="flex items-center gap-2">
                {globalSeo.google_site_verification ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Verification Code Saved</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                Google Search Console allows you to monitor indexing status, search queries, and crawl errors for Lotus Grand Hotel. To prove ownership via HTML Tag, save your Google site verification code below.
              </p>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Google Verification Code or Meta Tag
                </label>
                <input
                  type="text"
                  value={gscInput}
                  onChange={(e) => setGscInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C59A47]"
                  placeholder="e.g. google1234567890abcdef OR <meta name='google-site-verification' content='...' />"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  You can paste either the raw code or the full &lt;meta&gt; tag provided by Google. The system automatically stores and renders the correct tag in the HTML head.
                </span>
              </div>

              {/* Step by step guide */}
              <div className="p-4 rounded-xl bg-[#070E1A] border border-stone-800/80 space-y-3">
                <div className="text-xs font-medium text-[#E0C37B]">How to Complete Verification:</div>
                <ol className="text-xs text-stone-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Open the official{' '}
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E0C37B] underline inline-flex items-center gap-1 hover:text-white"
                    >
                      <span>Google Search Console Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and sign in with your Google account.
                  </li>
                  <li>Add your property using URL Prefix (e.g. <code className="text-stone-300 font-mono">https://lotusgrand.in</code>).</li>
                  <li>Under <strong>Other verification methods</strong>, select <strong>HTML tag</strong>.</li>
                  <li>Copy the meta tag string and paste it into the field above.</li>
                  <li>Click <strong>Save Verification Code</strong> below.</li>
                  <li>Return to Google Search Console and click the <strong>Verify</strong> button.</li>
                </ol>
              </div>

              {/* Technical Verification Note */}
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/50 text-[11px] text-sky-300 leading-relaxed">
                <strong>Important:</strong> Saving this code injects <code className="font-mono text-white">&lt;meta name="google-site-verification" content="..."&gt;</code> into your website document head. Real ownership confirmation occurs directly within Google's Search Console infrastructure upon clicking Verify.
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#070E1A] hover:bg-stone-900 border border-stone-800 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Open Google Search Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Verification Code'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 2: ANALYTICS MANAGEMENT (GA4 & MICROSOFT CLARITY) */}
      {/* =================================================================== */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Sub-Tab Navigation */}
          <div className="flex border-b border-stone-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveAnalyticsTab('ga4')}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeAnalyticsTab === 'ga4'
                  ? 'text-[#E0C37B] border-[#C59A47] bg-[#0B1526]'
                  : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-[#0B1526]/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Google Analytics 4</span>
              {gaForm.enabled && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isValidGa4MeasurementId(gaForm.measurementId) ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isValidGa4MeasurementId(gaForm.measurementId) ? 'Tracking active' : 'Setup incomplete'}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveAnalyticsTab('clarity')}
              className={`px-4 py-2.5 text-xs font-medium rounded-t-xl transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                activeAnalyticsTab === 'clarity'
                  ? 'text-[#E0C37B] border-[#C59A47] bg-[#0B1526]'
                  : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-[#0B1526]/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Microsoft Clarity</span>
              {clarityForm.enabled && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isValidClarityProjectId(clarityForm.projectId) ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                  title={isValidClarityProjectId(clarityForm.projectId) ? 'Tracking active' : 'Setup incomplete'}
                />
              )}
            </button>
          </div>

          {/* =============================================================== */}
          {/* SUB-TAB 1: GOOGLE ANALYTICS 4 */}
          {/* =============================================================== */}
          {activeAnalyticsTab === 'ga4' && (
            <form onSubmit={handleSaveGa4} className="space-y-6">
              <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-6 shadow-xl">
                {/* Header & Status Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F9AB00]/10 border border-[#F9AB00]/30 flex items-center justify-center text-[#F9AB00]">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                        <span>Google Analytics 4 (GA4)</span>
                        <span className="text-[11px] text-stone-400 font-normal">gtag.js</span>
                      </h2>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Client-side visitor traffic, page views, and engagement tracking.
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-2">
                    {gaForm.enabled ? (
                      isValidGa4MeasurementId(gaForm.measurementId) ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active & Connected</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1.5 shadow-sm">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Enabled — Missing Valid ID</span>
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-stone-900 text-stone-400 border border-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-500" />
                        <span>Disabled / Inactive</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-time Status Explanation Card */}
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                    gaForm.enabled
                      ? isValidGa4MeasurementId(gaForm.measurementId)
                        ? 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
                        : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
                      : 'bg-[#070E1A] border-stone-800/70 text-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {gaForm.enabled ? (
                      isValidGa4MeasurementId(gaForm.measurementId) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )
                    ) : (
                      <Info className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      {gaForm.enabled ? (
                        isValidGa4MeasurementId(gaForm.measurementId) ? (
                          <>
                            <strong>Tracking Script is Active:</strong> GA4 script (<code className="font-mono text-emerald-300">gtag.js</code>) dynamically executes on all 7 public website pages with Measurement ID <code className="font-mono font-bold text-white bg-emerald-900/50 px-1.5 py-0.5 rounded">{gaForm.measurementId.trim()}</code>. All <code className="font-mono text-stone-300">/admin</code> routes are strictly excluded to keep your metrics clean.
                          </>
                        ) : (
                          <>
                            <strong>Setup Pending:</strong> GA4 is toggled ON, but requires a valid Measurement ID starting with <code className="font-mono text-white">G-</code> (e.g. <code className="font-mono text-stone-300">G-XXXXXXXXXX</code>) to load the script.
                          </>
                        )
                      ) : (
                        <>
                          <strong>Tracking is Disabled:</strong> GA4 script is completely blocked from loading on the public website and the admin console. No visitor analytics will be sent to Google.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#070E1A] border border-stone-800/80">
                  <div className="space-y-0.5">
                    <label htmlFor="ga4_toggle" className="text-xs font-medium text-stone-200 cursor-pointer">
                      Google Analytics 4 Tracking Status
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Enable or disable client-side GA4 script injection across all public visitor pages.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="ga4_toggle"
                    role="switch"
                    aria-checked={gaForm.enabled}
                    onClick={() => setGaForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gaForm.enabled ? 'bg-[#C59A47]' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        gaForm.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Measurement ID Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="ga4_measurement_id" className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                      <span>Measurement ID</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <a
                      href="https://analytics.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#E0C37B] hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Open Google Analytics</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <input
                    id="ga4_measurement_id"
                    type="text"
                    value={gaForm.measurementId}
                    onChange={(e) => setGaForm((prev) => ({ ...prev, measurementId: e.target.value }))}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-[#070E1A] border border-stone-800 rounded-xl text-stone-100 text-xs font-mono placeholder:text-stone-600 focus:outline-none focus:border-[#C59A47] transition-colors"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-stone-400 gap-1 pt-1">
                    <span>
                      Standard format: Begins with <code className="text-stone-300 font-mono">G-</code> followed by alphanumeric characters.
                    </span>
                    {gaForm.measurementId.trim().length > 0 && (
                      <span
                        className={
                          isValidGa4MeasurementId(gaForm.measurementId) ? 'text-emerald-400 font-medium' : 'text-amber-400'
                        }
                      >
                        {isValidGa4MeasurementId(gaForm.measurementId)
                          ? '✓ Valid Measurement ID format'
                          : '⚠ Measurement ID should begin with "G-"'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Where to find helper box */}
                <div className="p-4 rounded-xl bg-[#070E1A] border border-stone-800/80 space-y-2.5">
                  <div className="text-xs font-medium text-[#E0C37B] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Where to Find Your Measurement ID:</span>
                  </div>
                  <ol className="text-xs text-stone-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Sign in to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#E0C37B] underline hover:text-white">Google Analytics</a> and select your hotel property.</li>
                    <li>Click <strong>Admin</strong> (gear icon in lower left corner).</li>
                    <li>Under Property settings, click <strong>Data Streams</strong>, then click on your <strong>Web</strong> stream.</li>
                    <li>Copy the <strong>Measurement ID</strong> (top right, formatted as <code className="text-stone-300 font-mono">G-XXXXXXXXXX</code>).</li>
                    <li>Paste the ID above, ensure the toggle is ON, and click <strong>Save Google Analytics 4</strong>.</li>
                  </ol>
                </div>

                {/* Security and Privacy Assurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-stone-300 space-y-1">
                    <div className="font-semibold text-[#E0C37B] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Secret Credentials</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed">
                      Client-side GA4 uses strictly public Measurement IDs. No service account keys, private JSONs, or API secrets are stored or needed.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-stone-300 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Admin Route Protection</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed">
                      All <code className="font-mono text-stone-300">/admin</code> views are completely excluded from tracking, ensuring staff activity never pollutes your visitor reports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Footer with Actions */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#070E1A] hover:bg-stone-900 border border-stone-800 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open GA4 Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="submit"
                  disabled={savingAnalytics}
                  className="px-6 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingAnalytics ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{savingAnalytics ? 'Saving...' : 'Save Google Analytics 4'}</span>
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* SUB-TAB 2: MICROSOFT CLARITY */}
          {/* =============================================================== */}
          {activeAnalyticsTab === 'clarity' && (
            <form onSubmit={handleSaveClarity} className="space-y-6">
              <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-6 shadow-xl">
                {/* Header & Status Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                        <span>Microsoft Clarity</span>
                        <span className="text-[11px] text-stone-400 font-normal">Heatmaps & Session Recordings</span>
                      </h2>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Visual heatmaps, scroll depth, click tracking, and visitor journey replays.
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-2">
                    {clarityForm.enabled ? (
                      isValidClarityProjectId(clarityForm.projectId) ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active & Recording</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1.5 shadow-sm">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Enabled — Missing Project ID</span>
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-stone-900 text-stone-400 border border-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-500" />
                        <span>Disabled / Inactive</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-time Status Explanation Card */}
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                    clarityForm.enabled
                      ? isValidClarityProjectId(clarityForm.projectId)
                        ? 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
                        : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
                      : 'bg-[#070E1A] border-stone-800/70 text-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {clarityForm.enabled ? (
                      isValidClarityProjectId(clarityForm.projectId) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )
                    ) : (
                      <Info className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      {clarityForm.enabled ? (
                        isValidClarityProjectId(clarityForm.projectId) ? (
                          <>
                            <strong>Tracking Script is Active:</strong> Microsoft Clarity script is executing on all 7 public website pages with Project ID <code className="font-mono font-bold text-white bg-emerald-900/50 px-1.5 py-0.5 rounded">{clarityForm.projectId.trim()}</code>. Session recordings and heatmaps are active. All <code className="font-mono text-stone-300">/admin</code> routes are strictly excluded.
                          </>
                        ) : (
                          <>
                            <strong>Setup Pending:</strong> Microsoft Clarity is toggled ON, but requires a valid alphanumeric Project ID to initialize.
                          </>
                        )
                      ) : (
                        <>
                          <strong>Tracking is Disabled:</strong> Microsoft Clarity script is completely blocked from loading on public pages and the admin console.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#070E1A] border border-stone-800/80">
                  <div className="space-y-0.5">
                    <label htmlFor="clarity_toggle" className="text-xs font-medium text-stone-200 cursor-pointer">
                      Microsoft Clarity Tracking Status
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Enable or disable heatmap and session recording script injection across all public visitor pages.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="clarity_toggle"
                    role="switch"
                    aria-checked={clarityForm.enabled}
                    onClick={() => setClarityForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      clarityForm.enabled ? 'bg-[#C59A47]' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        clarityForm.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Project ID Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="clarity_project_id" className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                      <span>Project ID</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <a
                      href="https://clarity.microsoft.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#E0C37B] hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Open Microsoft Clarity</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <input
                    id="clarity_project_id"
                    type="text"
                    value={clarityForm.projectId}
                    onChange={(e) => setClarityForm((prev) => ({ ...prev, projectId: e.target.value }))}
                    placeholder="e.g., abcdef1234"
                    className="w-full px-4 py-2.5 bg-[#070E1A] border border-stone-800 rounded-xl text-stone-100 text-xs font-mono placeholder:text-stone-600 focus:outline-none focus:border-[#C59A47] transition-colors"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-stone-400 gap-1 pt-1">
                    <span>
                      Standard format: Typically an 8 to 12-character alphanumeric Project code.
                    </span>
                    {clarityForm.projectId.trim().length > 0 && (
                      <span
                        className={
                          isValidClarityProjectId(clarityForm.projectId) ? 'text-emerald-400 font-medium' : 'text-amber-400'
                        }
                      >
                        {isValidClarityProjectId(clarityForm.projectId)
                          ? '✓ Valid Project ID format'
                          : '⚠ Project ID should be alphanumeric without spaces'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Where to find helper box */}
                <div className="p-4 rounded-xl bg-[#070E1A] border border-stone-800/80 space-y-2.5">
                  <div className="text-xs font-medium text-[#E0C37B] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Where to Find Your Clarity Project ID:</span>
                  </div>
                  <ol className="text-xs text-stone-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Sign in to <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-[#E0C37B] underline hover:text-white">Microsoft Clarity</a> and select your hotel project.</li>
                    <li>Click <strong>Settings</strong> in the top navigation bar.</li>
                    <li>Under <strong>Overview</strong>, look for <strong>Project ID</strong> (near the top).</li>
                    <li>Copy the Project ID string (e.g. <code className="text-stone-300 font-mono">abcdef1234</code>).</li>
                    <li>Paste the Project ID above, toggle Clarity ON, and click <strong>Save Microsoft Clarity</strong>.</li>
                  </ol>
                </div>

                {/* Privacy and Masking Assurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-stone-300 space-y-1">
                    <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Visitor Privacy Masking</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed">
                      Clarity automatically masks sensitive visitor inputs and passwords by default, maintaining compliance with data privacy standards.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-stone-300 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Admin Route Exclusion</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed">
                      All <code className="font-mono text-stone-300">/admin</code> CMS dashboards are excluded from Clarity recording to protect administrative security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Footer with Actions */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <a
                  href="https://clarity.microsoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#070E1A] hover:bg-stone-900 border border-stone-800 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Clarity Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="submit"
                  disabled={savingAnalytics}
                  className="px-6 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingAnalytics ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{savingAnalytics ? 'Saving...' : 'Save Microsoft Clarity'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
