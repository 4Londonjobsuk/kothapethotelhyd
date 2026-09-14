import React, { useEffect, useState } from 'react';
import { NavPage, GlobalSeoSettings, PageSeoSettings, SeoPageRoute } from '../types';
import { hotelService, FALLBACK_GLOBAL_SEO, FALLBACK_PAGE_SEO } from '../services/hotelService';

interface SeoHeadProps {
  currentPage: NavPage;
  isAdminRoute: boolean;
}

const PAGE_ROUTE_MAP: Record<NavPage, SeoPageRoute> = {
  home: '/',
  about: '/about',
  rooms: '/rooms',
  amenities: '/amenities',
  gallery: '/gallery',
  attractions: '/attractions',
  contact: '/contact',
  privacy: '/privacy',
};

/**
 * Utility helper to update or create an HTML head meta element safely
 */
function setMetaTag(selector: string, attrName: 'name' | 'property', attrValue: string, content: string | null | undefined) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    if (element) {
      element.remove();
    }
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Utility helper to update or create exactly ONE canonical link tag
 */
function setCanonicalTag(url: string | null | undefined) {
  // Select all existing canonical tags to clean up any accidental duplicates
  const existingTags = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    existingTags.forEach((t) => t.remove());
    return;
  }

  if (existingTags.length > 0) {
    existingTags[0].setAttribute('href', url);
    // Remove any extra duplicates beyond the first
    for (let i = 1; i < existingTags.length; i++) {
      existingTags[i].remove();
    }
  } else {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
}

export function useSeoHead(currentPage: NavPage, isAdminRoute: boolean) {
  const [globalSeo, setGlobalSeo] = useState<GlobalSeoSettings>(FALLBACK_GLOBAL_SEO);
  const [pageSeoMap, setPageSeoMap] = useState<Record<string, PageSeoSettings>>(FALLBACK_PAGE_SEO);

  // Fetch verified SEO data from Supabase / hotelService on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSeo() {
      try {
        const [globalData, pagesData] = await Promise.all([
          hotelService.getGlobalSeo(),
          hotelService.getAllPageSeo(),
        ]);

        if (isMounted) {
          setGlobalSeo(globalData);
          const map: Record<string, PageSeoSettings> = {};
          pagesData.forEach((p) => {
            map[p.page_route] = p;
          });
          setPageSeoMap(map);
        }
      } catch (err) {
        console.warn('[SeoHead] Failed to load dynamic SEO, using fallbacks:', err);
      }
    }

    loadSeo();

    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize document.head on page transition or SEO change
  useEffect(() => {
    if (isAdminRoute) {
      // 1. Admin route protection: Always noindex, nofollow
      document.title = 'Lotus Grand Hotel — Admin Management Console';
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
      setCanonicalTag(null);
      setMetaTag('meta[name="description"]', 'name', 'description', 'Administrative management portal for Lotus Grand Hotel.');
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', 'Lotus Grand Hotel — Admin Console');
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', 'Admin Console');
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', null);
      return;
    }

    // 2. Public route SEO
    const route = PAGE_ROUTE_MAP[currentPage] || '/';
    const pageSeo = pageSeoMap[route] || FALLBACK_PAGE_SEO[route] || FALLBACK_PAGE_SEO['/'];

    // Title
    const finalTitle = pageSeo.meta_title || globalSeo.site_title;
    document.title = finalTitle;

    // Description
    const finalDescription = pageSeo.meta_description || globalSeo.default_meta_description;
    setMetaTag('meta[name="description"]', 'name', 'description', finalDescription);

    // Canonical URL
    const baseUrl = (globalSeo.default_canonical_url || 'https://lotusgrand.in').replace(/\/+$/, '');
    let finalCanonical = pageSeo.canonical_url;
    if (!finalCanonical || finalCanonical.trim() === '') {
      finalCanonical = route === '/' ? `${baseUrl}/` : `${baseUrl}${route}`;
    }
    setCanonicalTag(finalCanonical);

    // Robots meta tag
    const isIndex = pageSeo.robots_index !== undefined ? pageSeo.robots_index : globalSeo.robots_index;
    const isFollow = pageSeo.robots_follow !== undefined ? pageSeo.robots_follow : globalSeo.robots_follow;
    const robotsDirective = `${isIndex ? 'index' : 'noindex'}, ${isFollow ? 'follow' : 'nofollow'}`;
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsDirective);

    // Open Graph
    const ogTitle = pageSeo.og_title || pageSeo.meta_title || globalSeo.default_og_title || finalTitle;
    const ogDescription = pageSeo.og_description || pageSeo.meta_description || globalSeo.default_og_description || finalDescription;
    const ogImage = pageSeo.og_image || globalSeo.default_og_image;

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalCanonical);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    }

    // Twitter / X Card
    const twitterTitle = pageSeo.twitter_title || ogTitle;
    const twitterDescription = pageSeo.twitter_description || ogDescription;
    const twitterImage = pageSeo.twitter_image || ogImage;

    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', twitterTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', twitterDescription);
    if (twitterImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage);
    }

    // Google Search Console Verification Meta Tag (if configured)
    if (globalSeo.google_site_verification && globalSeo.google_site_verification.trim().length > 0) {
      setMetaTag(
        'meta[name="google-site-verification"]',
        'name',
        'google-site-verification',
        globalSeo.google_site_verification.trim()
      );
    } else {
      const gscMeta = document.head.querySelector('meta[name="google-site-verification"]');
      if (gscMeta) gscMeta.remove();
    }
  }, [currentPage, isAdminRoute, globalSeo, pageSeoMap]);
}

export const SeoHead: React.FC<SeoHeadProps> = ({ currentPage, isAdminRoute }) => {
  useSeoHead(currentPage, isAdminRoute);
  return null;
};

