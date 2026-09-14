import {
  siteSettings as fallbackSiteSettings,
  roomsData as fallbackRoomsData,
  amenitiesData as fallbackAmenitiesData,
  approvedAttractions as fallbackAttractionsData,
  galleryItems as fallbackGalleryData,
  testimonialsData as fallbackTestimonialsData,
} from '../data/hotelData';
import {
  SiteSettings,
  RoomItem,
  AmenityItem,
  AttractionItem,
  GalleryItem,
  TestimonialItem,
  HeroSlideItem,
  HeroSliderHeightProfile,
  FaqItem,
  StoryContentSettings,
  EnquirySubmission,
  AdminEnquiryItem,
  StorageAssetItem,
  AdminRoomRecord,
  AdminAmenityRecord,
  AdminAttractionRecord,
  AdminGalleryItem,
  AdminCategoryItem,
  AdminRole,
  AdminApprovalStatus,
  AdminPermission,
  AdminProfile,
  AdminAuditLog,
  GlobalSeoSettings,
  PageSeoSettings,
  SeoPageRoute,
  AnalyticsSettings,
  TrashItem,
  TrashItemType,
  PrivacySection,
  PrivacyNoticeSettings,
} from '../types';
import { supabase, isSupabaseAvailable } from './supabaseClient';

export const VALID_GALLERY_CATEGORIES = ['Rooms', 'Property', 'Dining', 'Hyderabad'] as const;
export type ValidGalleryCategory = (typeof VALID_GALLERY_CATEGORIES)[number];

/**
 * Case-safe and alias-safe category normalizer for the 4 approved categories:
 * Rooms, Property, Dining, Hyderabad
 */
export function normalizeGalleryCategory(raw?: string | null): ValidGalleryCategory {
  if (!raw) return 'Rooms';
  const val = raw.trim().toLowerCase();
  if (val.includes('din') || val.includes('food') || val.includes('restaurant')) return 'Dining';
  if (val.includes('prop') || val.includes('hotel') || val.includes('exterior') || val.includes('lobby') || val.includes('common')) return 'Property';
  if (val.includes('hyd') || val.includes('attract') || val.includes('tour') || val.includes('city') || val.includes('landmark')) return 'Hyderabad';
  if (val.includes('room') || val.includes('suite') || val.includes('bed')) return 'Rooms';
  return 'Rooms';
}

/**
 * Image deduplication helper
 * Prevents displaying identical images or re-uploaded fallback assets twice.
 */
export function isDuplicateImage(urlA: string, urlB: string): boolean {
  if (!urlA || !urlB) return false;
  const a = urlA.trim().toLowerCase();
  const b = urlB.trim().toLowerCase();
  if (a === b) return true;

  // Extract clean filename without queries or hashes
  const fileA = a.split('?')[0].split('#')[0].split('/').pop() || '';
  const fileB = b.split('?')[0].split('#')[0].split('/').pop() || '';

  if (fileA && fileB && fileA === fileB) return true;

  // Match base filenames if uploaded to storage with a timestamp suffix (e.g. name-1725890000.ext -> name)
  const baseNameA = fileA.replace(/\.[^/.]+$/, '').replace(/-\d{10,14}$/, '');
  const baseNameB = fileB.replace(/\.[^/.]+$/, '').replace(/-\d{10,14}$/, '');

  if (baseNameA && baseNameB && baseNameA === baseNameB && baseNameA.length > 5) {
    return true;
  }

  return false;
}

/**
 * HotelDataService
 * 
 * Strict 3-Tier Architecture:
 *   React UI Components
 *          ↓
 *   hotelService.ts (Abstraction Layer)
 *          ↓
 *   Supabase PostgreSQL
 *          ↓
 *   hotelData.ts (Permanent Verified Fallback)
 * 
 * Public UI components never query Supabase directly.
 * If Supabase is unavailable, offline, or returns empty/null,
 * the service gracefully returns verified fallback data without throwing errors.
 */
const DELETED_GALLERY_IMAGES_KEY = 'lotus_deleted_gallery_images';
const UPDATED_GALLERY_IMAGES_KEY = 'lotus_updated_gallery_images';

const DELETED_ATTRACTIONS_KEY = 'lotus_deleted_attractions';
const UPDATED_ATTRACTIONS_KEY = 'lotus_updated_attractions';

const DELETED_ROOMS_KEY = 'lotus_deleted_rooms';
const UPDATED_ROOMS_KEY = 'lotus_updated_rooms';

const DELETED_AMENITIES_KEY = 'lotus_deleted_amenities';
const UPDATED_AMENITIES_KEY = 'lotus_updated_amenities';

const HOTEL_SETTINGS_KEY = 'lotus_hotel_settings';

const HERO_SLIDES_KEY = 'lotus_cms_hero_slides';
const HERO_SLIDER_HEIGHT_KEY = 'lotus_cms_hero_slider_height';
const TESTIMONIALS_KEY = 'lotus_cms_testimonials';
const ABOUT_STORY_KEY = 'lotus_cms_about_story';
const FAQS_KEY = 'lotus_cms_faqs';
const PRIVACY_NOTICE_KEY = 'lotus_cms_privacy_notice';

const DELETED_ENQUIRIES_KEY = 'lotus_deleted_enquiries';
const ENQUIRIES_CACHE_KEY = 'lotus_admin_enquiries_cache';

export const fallbackEnquiriesData: AdminEnquiryItem[] = [
  {
    id: 'enq-seed-1',
    full_name: 'Praveen Kumar',
    phone: '+91 98480 22338',
    email: 'praveen.k@gmail.com',
    room_preference: 'Executive AC Room',
    arrival_date: '2026-09-18',
    departure_date: '2026-09-20',
    guest_count: '2 Adults',
    message: 'Attending a family wedding in Dilsukhnagar. Requesting early check-in around 10:00 AM if available.',
    source_page: 'enquiry_modal',
    status: 'new',
    created_at: '2026-09-12T07:30:00.000Z',
  },
  {
    id: 'enq-seed-2',
    full_name: 'Ananya Reddy',
    phone: '+91 99890 55441',
    email: 'ananya.reddy@techcorp.in',
    room_preference: 'Deluxe AC Room',
    arrival_date: '2026-09-22',
    departure_date: '2026-09-25',
    guest_count: '1 Adult',
    message: 'Business visit to LB Nagar IT corridor. Need high-speed Wi-Fi and quiet room facing inner courtyard.',
    source_page: 'contact_page',
    status: 'contacted',
    created_at: '2026-09-11T14:15:00.000Z',
  },
  {
    id: 'enq-seed-3',
    full_name: 'Dr. Suresh Varma',
    phone: '+91 94401 77229',
    email: 'suresh.varma@medcare.org',
    room_preference: 'Standard AC Room',
    arrival_date: '2026-09-15',
    departure_date: '2026-09-16',
    guest_count: '2 Adults',
    message: 'Medical conference near Kothapet. Requesting twin beds and late check-out.',
    source_page: 'enquiry_modal',
    status: 'confirmed',
    created_at: '2026-09-10T10:00:00.000Z',
  },
];

export function getLocalEnquiries(): AdminEnquiryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ENQUIRIES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalEnquiries(list: AdminEnquiryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ENQUIRIES_CACHE_KEY, JSON.stringify(list));
  } catch {}
}

export function saveLocalEnquiry(enq: AdminEnquiryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalEnquiries();
    const idx = current.findIndex((x) => x.id === enq.id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...enq };
    } else {
      current.unshift(enq);
    }
    localStorage.setItem(ENQUIRIES_CACHE_KEY, JSON.stringify(current));
  } catch {}
}

const TRASH_ITEMS_KEY = 'lotus_admin_trash_items';

export function getTrashItemsLocal(): TrashItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRASH_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrashItemsLocal(items: TrashItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRASH_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('lotus_trash_updated', { detail: items }));
  } catch {
    // Ignore storage issues
  }
}

export function addTrashItemLocal(item: Omit<TrashItem, 'id' | 'deletedAt'>): TrashItem {
  const current = getTrashItemsLocal();
  const newItem: TrashItem = {
    ...item,
    id: `trash-${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    deletedAt: new Date().toISOString(),
  };
  // Avoid duplicate trash entries for the same originalId and type
  const filtered = current.filter((x) => !(x.originalId === item.originalId && x.type === item.type));
  const updated = [newItem, ...filtered];
  saveTrashItemsLocal(updated);
  return newItem;
}

export function getDeletedRoomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_ROOMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markRoomDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedRoomIds();
    if (!list.includes(id)) {
      localStorage.setItem(DELETED_ROOMS_KEY, JSON.stringify([...list, id]));
    }
  } catch {
    // Ignore storage issues
  }
}

export function unmarkRoomDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedRoomIds();
    const cleanId = id.toLowerCase().trim();
    localStorage.setItem(
      DELETED_ROOMS_KEY,
      JSON.stringify(list.filter((x) => x !== id && x.toLowerCase().trim() !== cleanId && x !== `room-${cleanId}` && `room-${x}` !== cleanId))
    );
  } catch {
    // Ignore storage issues
  }
}

export function getLocalUpdatedRoomsMap(): Record<string, Partial<AdminRoomRecord>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UPDATED_ROOMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalUpdatedRoom(id: string, updates: Partial<AdminRoomRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalUpdatedRoomsMap();
    current[id] = { ...(current[id] || {}), ...updates };
    localStorage.setItem(UPDATED_ROOMS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Match a room to its verified fallback data by ID, slug, or title
 */
export function findRoomFallback(id?: string, title?: string): RoomItem | undefined {
  if (id) {
    const clean = id.toLowerCase().trim();
    const byId = fallbackRoomsData.find((r) => r.id === clean || r.id === clean.replace(/^room-/, ''));
    if (byId) return byId;
  }
  const t = (title || '').toLowerCase().trim();
  if (!t) return undefined;
  if (t.includes('deluxe')) return fallbackRoomsData.find((r) => r.id === 'deluxe-room');
  if (t.includes('standard') || t.includes('classic')) return fallbackRoomsData.find((r) => r.id === 'standard-classic');
  if (t.includes('executive') || t.includes('suite')) return fallbackRoomsData.find((r) => r.id === 'executive-suite');
  if (t.includes('family')) return fallbackRoomsData.find((r) => r.id === 'family-room');
  return fallbackRoomsData.find(
    (r) => r.name.toLowerCase().trim() === t || t.includes(r.name.toLowerCase().trim()) || r.name.toLowerCase().trim().includes(t)
  );
}

export function getDeletedAmenityIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_AMENITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAmenityDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedAmenityIds();
    if (!list.includes(id)) {
      localStorage.setItem(DELETED_AMENITIES_KEY, JSON.stringify([...list, id]));
    }
  } catch {
    // Ignore storage issues
  }
}

export function unmarkAmenityDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedAmenityIds();
    const cleanId = id.toLowerCase().trim();
    localStorage.setItem(
      DELETED_AMENITIES_KEY,
      JSON.stringify(list.filter((x) => x !== id && x.toLowerCase().trim() !== cleanId && x !== `amenity-${cleanId}` && `amenity-${x}` !== cleanId))
    );
  } catch {
    // Ignore storage issues
  }
}

export function getLocalUpdatedAmenitiesMap(): Record<string, Partial<AdminAmenityRecord>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UPDATED_AMENITIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalUpdatedAmenity(id: string, updates: Partial<AdminAmenityRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalUpdatedAmenitiesMap();
    current[id] = { ...(current[id] || {}), ...updates };
    localStorage.setItem(UPDATED_AMENITIES_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Match an amenity to its verified fallback data by ID or title
 */
export function findAmenityFallback(id?: string, title?: string): AmenityItem | undefined {
  if (id) {
    const clean = id.toLowerCase().trim();
    const byId = fallbackAmenitiesData.find(
      (a) => a.id === clean || a.id === clean.replace(/^amenity-/, '') || `amenity-${a.id}` === clean
    );
    if (byId) return byId;
  }
  const t = (title || '').toLowerCase().trim();
  if (!t) return undefined;
  return fallbackAmenitiesData.find(
    (a) => a.title.toLowerCase().trim() === t || t.includes(a.title.toLowerCase().trim()) || a.title.toLowerCase().trim().includes(t)
  );
}

export function getSavedSiteSettings(): Partial<SiteSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HOTEL_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSiteSettingsLocal(settings: Partial<SiteSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(HOTEL_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lotus_settings_updated', { detail: updated }));
  } catch {
    // Ignore storage issues
  }
}

export function getDeletedEnquiryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_ENQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markEnquiryDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedEnquiryIds();
    if (!list.includes(id)) {
      localStorage.setItem(DELETED_ENQUIRIES_KEY, JSON.stringify([...list, id]));
    }
  } catch {
    // Ignore storage issues
  }
}

export function unmarkEnquiryDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedEnquiryIds();
    const cleanId = id.toLowerCase().trim();
    localStorage.setItem(
      DELETED_ENQUIRIES_KEY,
      JSON.stringify(list.filter((x) => x !== id && x.toLowerCase().trim() !== cleanId))
    );
  } catch {
    // Ignore storage issues
  }
}

export const NEHRU_ZOO_NEW_IMAGE =
  'https://kubyquytyviyigumtnbc.supabase.co/storage/v1/object/public/hotel-assets/rooms/chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png';

export function getDeletedAttractionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_ATTRACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAttractionDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedAttractionIds();
    if (!list.includes(id)) {
      localStorage.setItem(DELETED_ATTRACTIONS_KEY, JSON.stringify([...list, id]));
    }
  } catch {
    // Ignore storage issues
  }
}

export function unmarkAttractionDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedAttractionIds();
    localStorage.setItem(DELETED_ATTRACTIONS_KEY, JSON.stringify(list.filter((x) => x !== id)));
  } catch {
    // Ignore storage issues
  }
}

export function getLocalUpdatedAttractionsMap(): Record<string, Partial<AdminAttractionRecord>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UPDATED_ATTRACTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalUpdatedAttraction(id: string, updates: Partial<AdminAttractionRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalUpdatedAttractionsMap();
    current[id] = { ...(current[id] || {}), ...updates };
    localStorage.setItem(UPDATED_ATTRACTIONS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Match an attraction to its verified fallback data by ID, slug, or title
 */
export function findAttractionFallback(id?: string, title?: string): AttractionItem | undefined {
  if (id) {
    const byId = fallbackAttractionsData.find((a) => a.id === id);
    if (byId) return byId;
  }
  const t = (title || '').toLowerCase().trim();
  if (!t) return undefined;
  if (t.includes('nehru') || t.includes('zoo')) {
    return fallbackAttractionsData.find((a) => a.id === 'nehru-zoo');
  }
  if (t.includes('charminar')) {
    return fallbackAttractionsData.find((a) => a.id === 'charminar');
  }
  if (t.includes('salar') || t.includes('jung')) {
    return fallbackAttractionsData.find((a) => a.id === 'salar-jung');
  }
  if (t.includes('birla')) {
    return fallbackAttractionsData.find((a) => a.id === 'birla-mandir');
  }
  if (t.includes('buddha') || t.includes('hussain')) {
    return fallbackAttractionsData.find((a) => a.id === 'buddha-statue');
  }
  return fallbackAttractionsData.find(
    (a) => a.name.toLowerCase().trim() === t || t.includes(a.name.toLowerCase().trim()) || a.name.toLowerCase().trim().includes(t)
  );
}

/**
 * Returns initial attractions synchronously for instant rendering without distance flashing.
 */
export function getInitialAttractions(): AttractionItem[] {
  const updatedMap = getLocalUpdatedAttractionsMap();
  const deletedIds = getDeletedAttractionIds();
  const isAllDistancesHidden =
    typeof window !== 'undefined' && localStorage.getItem('lotus_hide_all_attraction_distances') === 'true';

  return fallbackAttractionsData
    .filter((att) => !deletedIds.includes(att.id))
    .map((att) => {
      const upd = updatedMap[att.id] || {};
      if (upd.is_active === false) return null;

      let showDist = false;
      if (upd.show_distance !== undefined) {
        showDist = Boolean(upd.show_distance);
      } else if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`attraction_show_distance_${att.id}`);
        if (cached !== null) {
          showDist = cached === 'true';
        } else {
          showDist = Boolean(att.showDistance);
        }
      } else {
        showDist = Boolean(att.showDistance);
      }

      if (isAllDistancesHidden) {
        showDist = false;
      }

      let dist = '';
      if (upd.distance_approx !== undefined && upd.distance_approx !== null) {
        dist = String(upd.distance_approx).trim();
      } else if (typeof window !== 'undefined') {
        const distOverride = localStorage.getItem(`attraction_distance_override_${att.id}`);
        if (distOverride !== null) {
          dist = distOverride.trim();
        } else {
          dist = att.distanceDisplay || '';
        }
      } else {
        dist = att.distanceDisplay || '';
      }

      const isPlaceholderOrEmpty =
        !dist ||
        dist.trim() === '' ||
        dist === '0' ||
        dist === '0 km' ||
        dist === '0km' ||
        dist.toLowerCase() === 'n/a' ||
        dist.toLowerCase() === 'na' ||
        dist.toLowerCase() === 'distance unavailable';

      const shouldDisplay = showDist === true && !isPlaceholderOrEmpty;

      return {
        ...att,
        name: upd.title || att.name,
        distanceDisplay: shouldDisplay ? dist : '',
        showDistance: shouldDisplay,
        distanceKm: shouldDisplay ? parseFloat(dist) || undefined : undefined,
        tagline: upd.travel_time_approx || att.tagline,
        description: upd.description || att.description,
        image: upd.image_url || att.image,
      };
    })
    .filter(Boolean) as AttractionItem[];
}

export function getDeletedGalleryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_GALLERY_IMAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markGalleryImageDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedGalleryIds();
    if (!list.includes(id)) {
      localStorage.setItem(DELETED_GALLERY_IMAGES_KEY, JSON.stringify([...list, id]));
    }
  } catch {
    // Ignore storage issues
  }
}

export function unmarkGalleryImageDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getDeletedGalleryIds();
    localStorage.setItem(DELETED_GALLERY_IMAGES_KEY, JSON.stringify(list.filter((x) => x !== id)));
  } catch {
    // Ignore storage issues
  }
}

export function getLocalUpdatedGalleryMap(): Record<string, Partial<AdminGalleryItem>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UPDATED_GALLERY_IMAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalUpdatedGalleryItem(id: string, updates: Partial<AdminGalleryItem>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalUpdatedGalleryMap();
    current[id] = { ...(current[id] || {}), ...updates };
    localStorage.setItem(UPDATED_GALLERY_IMAGES_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage issues
  }
}

class HotelDataService {
  /**
   * Fetch Site Settings
   * Reads from the public-safe view `public_site_settings` to prevent exposing unverified emails,
   * merged with saved administrative hotel configurations.
   */
  async getSettings(): Promise<SiteSettings> {
    const saved = getSavedSiteSettings();
    let baseSettings: SiteSettings = { ...fallbackSiteSettings };

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('public_site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          baseSettings = {
            hotelName: data.hotel_name || fallbackSiteSettings.hotelName,
            tagline: data.tagline || fallbackSiteSettings.tagline,
            subTagline: fallbackSiteSettings.subTagline,
            cityArea: `${data.city || 'Hyderabad'} / Saroornagar`,
            stateCountry: `${data.state || 'Telangana'}, ${data.country || 'India'}`,
            fullLocation: `${data.address_line2 || ''}, ${data.city || 'Hyderabad'}, ${data.state || 'Telangana'} ${data.postal_code || '500035'}, ${data.country || 'India'}`.trim(),
            postalAddress: `${data.address_line1 || ''}, ${data.address_line2 || ''}, ${data.city || 'Hyderabad'}, ${data.state || 'Telangana'} ${data.postal_code || '500035'}`.trim(),
            secondaryAddressNote: fallbackSiteSettings.secondaryAddressNote,
            phone: data.phone || fallbackSiteSettings.phone,
            phoneDisplay: data.phone_display || fallbackSiteSettings.phoneDisplay,
            email: '', // Excluded from public exposure per verification specification
            isEmailVerified: false,
            whatsAppNumber: data.whatsapp_number || fallbackSiteSettings.whatsAppNumber,
            checkInTime: data.check_in_time || fallbackSiteSettings.checkInTime,
            checkOutTime: data.check_out_time || fallbackSiteSettings.checkOutTime,
            googleMapsEmbedUrl: fallbackSiteSettings.googleMapsEmbedUrl,
            googleMapsDirectionsUrl: data.google_maps_directions_url || fallbackSiteSettings.googleMapsDirectionsUrl,
            socialLinks: fallbackSiteSettings.socialLinks,
          };
        } else if (error) {
          console.info('[HotelService] Settings fallback active:', error.message);
        }
      } catch (err) {
        console.info('[HotelService] Settings exception, using fallback:', err);
      }
    }

    return {
      ...baseSettings,
      ...saved,
    };
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return this.getSettings();
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
    saveSiteSettingsLocal(settings);

    if (isSupabaseAvailable() && supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (settings.phone !== undefined) payload.phone = settings.phone;
        if (settings.phoneDisplay !== undefined) payload.phone_display = settings.phoneDisplay;
        if (settings.whatsAppNumber !== undefined) payload.whatsapp_number = settings.whatsAppNumber;
        if (settings.checkInTime !== undefined) payload.check_in_time = settings.checkInTime;
        if (settings.checkOutTime !== undefined) payload.check_out_time = settings.checkOutTime;

        await supabase.from('site_settings').update(payload).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[HotelService] Supabase site_settings update notice:', err);
      }
    }

    await this.logAdminAction('settings.updated', 'settings', 'hotel-config', settings);
    return { success: true };
  }

  /**
   * Fetch Active Rooms
   */
  async getRooms(): Promise<RoomItem[]> {
    const deletedIds = getDeletedRoomIds();
    const updatedMap = getLocalUpdatedRoomsMap();

    let rawRooms: RoomItem[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*, room_amenity_mappings(room_amenities(title))')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          rawRooms = data.map((row: any) => {
            const fallback = findRoomFallback(row.id, row.title);
            const mappedAmenities: string[] = Array.isArray(row.room_amenity_mappings)
              ? row.room_amenity_mappings
                  .map((m: any) => m?.room_amenities?.title)
                  .filter(Boolean)
              : [];

            return {
              id: row.id,
              name: row.title || fallback?.name || 'Hotel Room',
              subtitle: row.subtitle || fallback?.subtitle || '',
              description: row.description || fallback?.description || '',
              image: row.image_url || fallback?.image || '',
              rateLabel: 'Contact for Rates',
              specs: {
                bed: row.bed_type || fallback?.specs?.bed || 'Comfortable Bed',
                wifi: fallback?.specs?.wifi || 'Wi-Fi Access',
                tv: fallback?.specs?.tv || 'Television',
                ac: fallback?.specs?.ac || 'Air Conditioning',
                capacity: row.occupancy || fallback?.specs?.capacity || '2 Guests',
                size: row.room_size || fallback?.specs?.size,
              },
              amenities:
                mappedAmenities.length > 0
                  ? mappedAmenities
                  : fallback?.amenities || ['Air Conditioning', 'Wi-Fi', 'Attached Bathroom'],
              isVerifiedInventory: true,
              statusNote: row.badge || fallback?.statusNote,
            };
          });
        } else if (error) {
          console.info('[HotelService] Rooms fallback active:', error.message);
        }
      } catch (err) {
        console.info('[HotelService] Rooms exception, using fallback:', err);
      }
    }

    if (rawRooms.length === 0) {
      rawRooms = [...fallbackRoomsData];
    }

    // Filter out deleted rooms
    const activeRooms = rawRooms.filter((r) => !deletedIds.includes(r.id));

    // Apply local storage overrides if any
    return activeRooms.map((r) => {
      const upd = updatedMap[r.id];
      if (!upd) return r;
      return {
        ...r,
        name: upd.title || r.name,
        subtitle: upd.subtitle !== undefined ? upd.subtitle : r.subtitle,
        description: upd.description !== undefined ? upd.description : r.description,
        image: upd.image_url || r.image,
        specs: {
          ...r.specs,
          bed: upd.bed_type || r.specs.bed,
          capacity: upd.occupancy || r.specs.capacity,
          size: upd.room_size || r.specs.size,
        },
        amenities: upd.amenities && upd.amenities.length > 0 ? upd.amenities : r.amenities,
        statusNote: upd.badge !== undefined ? upd.badge : r.statusNote,
      };
    });
  }

  /**
   * Fetch Room by ID
   */
  async getRoomById(id: string): Promise<RoomItem | undefined> {
    const rooms = await this.getRooms();
    return rooms.find((r) => r.id === id);
  }

  /**
   * Safe category normalizer for hotel amenities (ensures 6 verified hospitality categories)
   */
  normalizeAmenityCategory(cat?: string | null): string {
    if (!cat) return 'basic';
    const c = cat.toLowerCase().trim();
    if (c === 'core') return 'basic';
    if (c === 'additional') return 'general';
    if (c.includes('basic') || c.includes('facil')) return 'basic';
    if (c.includes('gen') || c.includes('serv')) return 'general';
    if (c.includes('health') || c.includes('well') || c.includes('aid') || c.includes('medic')) return 'health';
    if (c.includes('room') || c.includes('in-room') || c.includes('bath') || c.includes('desk') || c.includes('water')) return 'room';
    if (c.includes('safe') || c.includes('sec') || c.includes('cctv') || c.includes('fire')) return 'safety';
    if (c.includes('comm') || c.includes('lobby') || c.includes('recept') || c.includes('front')) return 'common';
    return c;
  }

  /**
   * Safe category label resolver for amenities
   */
  getAmenityCategoryLabel(category?: string | null): string {
    const norm = this.normalizeAmenityCategory(category);
    switch (norm) {
      case 'basic':
        return 'Basic Facilities';
      case 'general':
        return 'General Services';
      case 'health':
        return 'Health and Wellness';
      case 'room':
        return 'Room Amenities';
      case 'safety':
        return 'Safety and Security';
      case 'common':
        return 'Common Area';
      default:
        return 'Basic Facilities';
    }
  }

  /**
   * Fetch Hotel Amenities with full 16 verified facilities, database sync, and category awareness
   */
  async getAmenities(category?: string): Promise<AmenityItem[]> {
    const deletedIds = getDeletedAmenityIds();
    const updatedMap = getLocalUpdatedAmenitiesMap();

    let cachedAdminList: AdminAmenityRecord[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        if (stored) {
          cachedAdminList = JSON.parse(stored);
        }
      } catch (e) {
        // ignore
      }
    }

    let dbRows: any[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const query = supabase
          .from('amenities')
          .select('*')
          .order('display_order', { ascending: true });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          dbRows = data;
        } else if (error) {
          console.info('[HotelService] Amenities Supabase error, using fallback:', error.message);
        }
      } catch (err) {
        console.info('[HotelService] Amenities exception, using fallback:', err);
      }
    }

    // Build base map from all 16 verified fallback amenities (excluding deleted)
    const map = new Map<string, AmenityItem>();
    fallbackAmenitiesData.forEach((fb) => {
      if (deletedIds.includes(fb.id) || deletedIds.includes(`amenity-${fb.id}`)) return;
      const normCat = this.normalizeAmenityCategory(fb.category);
      map.set(fb.id, {
        ...fb,
        category: normCat,
        categoryLabel: this.getAmenityCategoryLabel(normCat),
      });
    });

    if (dbRows.length > 0) {
      dbRows.forEach((row: any) => {
        if (deletedIds.includes(row.id)) {
          map.delete(row.id);
          return;
        }
        const normCat = this.normalizeAmenityCategory(row.category);
        const matchingFallback = fallbackAmenitiesData.find(
          (fb) =>
            fb.id === row.id ||
            fb.id === row.id?.replace(/^amenity-/, '') ||
            row.id === `amenity-${fb.id}` ||
            fb.title.toLowerCase().trim() === (row.title || '').toLowerCase().trim()
        );

        if (matchingFallback) {
          if (deletedIds.includes(matchingFallback.id)) {
            map.delete(matchingFallback.id);
            return;
          }
          if (row.is_active === false) {
            // Respect admin deactivation
            map.delete(matchingFallback.id);
          } else {
            // Keep verified category, apply any user-edited title/description
            const finalCat =
              normCat !== 'basic' && normCat !== 'general'
                ? normCat
                : matchingFallback.category;
            map.set(matchingFallback.id, {
              id: matchingFallback.id,
              title: row.title || matchingFallback.title,
              description: row.description || matchingFallback.description,
              iconName: row.icon_name || matchingFallback.iconName,
              category: finalCat,
              categoryLabel: this.getAmenityCategoryLabel(finalCat),
              verifiedNote: matchingFallback.verifiedNote,
            });
          }
        } else if (row.is_active !== false) {
          // Custom amenity added via admin
          map.set(row.id, {
            id: row.id,
            title: row.title,
            description: row.description || '',
            iconName: row.icon_name || 'Sparkles',
            category: normCat,
            categoryLabel: this.getAmenityCategoryLabel(normCat),
          });
        }
      });
    } else if (cachedAdminList && cachedAdminList.length > 0) {
      cachedAdminList.forEach((row) => {
        if (deletedIds.includes(row.id)) return;
        const normCat = this.normalizeAmenityCategory(row.category);
        const matchingFallback = fallbackAmenitiesData.find(
          (fb) =>
            fb.id === row.id ||
            fb.title.toLowerCase().trim() === (row.title || '').toLowerCase().trim()
        );

        if (matchingFallback) {
          if (deletedIds.includes(matchingFallback.id)) {
            map.delete(matchingFallback.id);
            return;
          }
          if (row.is_active === false) {
            map.delete(matchingFallback.id);
          } else {
            const finalCat =
              normCat !== 'basic' && normCat !== 'general'
                ? normCat
                : matchingFallback.category;
            map.set(matchingFallback.id, {
              id: matchingFallback.id,
              title: row.title || matchingFallback.title,
              description: row.description || matchingFallback.description,
              iconName: row.icon_name || matchingFallback.iconName,
              category: finalCat,
              categoryLabel: this.getAmenityCategoryLabel(finalCat),
            });
          }
        } else if (row.is_active) {
          map.set(row.id, {
            id: row.id,
            title: row.title,
            description: row.description,
            iconName: row.icon_name || 'Sparkles',
            category: normCat,
            categoryLabel: this.getAmenityCategoryLabel(normCat),
          });
        }
      });
    }

    // Apply any local storage updates
    Object.keys(updatedMap).forEach((id) => {
      const upd = updatedMap[id];
      const existing = map.get(id);
      if (existing && upd) {
        if (upd.is_active === false) {
          map.delete(id);
        } else {
          const normCat = this.normalizeAmenityCategory(upd.category || existing.category);
          map.set(id, {
            ...existing,
            title: upd.title || existing.title,
            description: upd.description !== undefined ? upd.description : existing.description,
            iconName: upd.icon_name || existing.iconName,
            category: normCat,
            categoryLabel: this.getAmenityCategoryLabel(normCat),
          });
        }
      }
    });

    let result = Array.from(map.values());

    if (category && category !== 'all') {
      const target = this.normalizeAmenityCategory(category);
      result = result.filter((a) => this.normalizeAmenityCategory(a.category) === target);
    }

    return result;
  }

  /**
   * Synchronous initial attractions for instant display without flash
   */
  getInitialAttractions(): AttractionItem[] {
    return getInitialAttractions();
  }

  /**
   * Fetch Approved Attractions
   * Strictly 5 Hyderabad landmarks with optional approximate distances and show/hide control
   */
  async getAttractions(): Promise<AttractionItem[]> {
    let sourceData: any[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('attractions')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          sourceData = data;
        } else if (error) {
          console.info('[HotelService] Attractions fallback active:', error.message);
        }
      } catch (err) {
        console.info('[HotelService] Attractions exception, using fallback:', err);
      }
    }

    if (sourceData.length === 0) {
      sourceData = fallbackAttractionsData.map((att, idx) => ({
        id: att.id,
        title: att.name,
        distance_approx: att.distanceDisplay,
        travel_time_approx: att.tagline,
        description: att.description,
        image_url: att.image,
        display_order: idx + 1,
        is_active: true,
      }));
    }

    const deletedIds = getDeletedAttractionIds();
    const updatedMap = getLocalUpdatedAttractionsMap();

    // Filter out deleted attractions
    const filteredSource = sourceData.filter((row: any) => !deletedIds.includes(row.id));

    const resultItems: AttractionItem[] = [];

    for (const row of filteredSource) {
      const fallback = findAttractionFallback(row.id, row.title);
      const localUpdates = updatedMap[row.id] || {};

      // If local update explicitly marked this inactive, don't show on public site
      if (localUpdates.is_active === false) {
        continue;
      }

      const title = localUpdates.title || row.title || fallback?.name || '';
      let image = localUpdates.image_url || row.image_url || fallback?.image || '';

      // If this is Nehru Zoological Park or references the old lion photo, replace with requested image
      const isNehruZoo =
        row.id === 'nehru-zoo' ||
        title.toLowerCase().includes('nehru') ||
        (typeof image === 'string' &&
          (image.includes('nehru-zoological-park') ||
            image.includes('chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png')));

      if (isNehruZoo) {
        if (!image || image.includes('nehru-zoological-park') || !image.startsWith('http')) {
          image = NEHRU_ZOO_NEW_IMAGE;
        }
      }

      // Check distance override from localStorage or database
      let rawDist = '';
      if (localUpdates.distance_approx !== undefined && localUpdates.distance_approx !== null) {
        rawDist = String(localUpdates.distance_approx).trim();
      } else if (typeof window !== 'undefined') {
        const distOverride =
          localStorage.getItem(`attraction_distance_override_${row.id}`) ??
          (fallback ? localStorage.getItem(`attraction_distance_override_${fallback.id}`) : null);
        if (distOverride !== null) {
          rawDist = distOverride.trim();
        } else if (row.distance_approx !== undefined && row.distance_approx !== null) {
          // Genuine database value! If row.distance_approx is "" (empty string), it explicitly means NO distance!
          rawDist = String(row.distance_approx).trim();
        } else {
          rawDist = fallback?.distanceDisplay || '';
        }
      } else if (row.distance_approx !== undefined && row.distance_approx !== null) {
        rawDist = String(row.distance_approx).trim();
      } else {
        rawDist = fallback?.distanceDisplay || '';
      }

      // Check show_distance
      let showDist = false;
      if (localUpdates.show_distance !== undefined) {
        showDist = Boolean(localUpdates.show_distance);
      } else if (typeof window !== 'undefined') {
        const cached =
          localStorage.getItem(`attraction_show_distance_${row.id}`) ??
          (fallback ? localStorage.getItem(`attraction_show_distance_${fallback.id}`) : null);
        if (cached !== null) {
          showDist = cached === 'true';
        } else if (row.show_distance !== undefined && row.show_distance !== null) {
          showDist = Boolean(row.show_distance);
        } else {
          showDist = Boolean(rawDist && rawDist.trim() !== '');
        }
      } else if (row.show_distance !== undefined && row.show_distance !== null) {
        showDist = Boolean(row.show_distance);
      } else {
        showDist = Boolean(rawDist && rawDist.trim() !== '');
      }

      // Check global hide all distances setting
      if (typeof window !== 'undefined' && localStorage.getItem('lotus_hide_all_attraction_distances') === 'true') {
        showDist = false;
      }

      // Check if distance has a genuine value (not empty, not placeholder)
      const isPlaceholderOrEmpty =
        !rawDist ||
        rawDist.trim() === '' ||
        rawDist === '0' ||
        rawDist === '0 km' ||
        rawDist === '0km' ||
        rawDist.toLowerCase() === 'n/a' ||
        rawDist.toLowerCase() === 'na' ||
        rawDist.toLowerCase() === 'distance unavailable';

      const shouldDisplayDistance = !isPlaceholderOrEmpty && showDist === true;

      const finalDistanceDisplay = shouldDisplayDistance ? rawDist : '';
      const distNum = shouldDisplayDistance ? parseFloat(rawDist) || undefined : undefined;

      const tagline =
        localUpdates.travel_time_approx && String(localUpdates.travel_time_approx).trim() !== ''
          ? String(localUpdates.travel_time_approx).trim()
          : row.travel_time_approx && String(row.travel_time_approx).trim() !== ''
          ? String(row.travel_time_approx).trim()
          : fallback?.tagline || '';

      const description =
        localUpdates.description && String(localUpdates.description).trim() !== ''
          ? String(localUpdates.description).trim()
          : row.description && String(row.description).trim() !== ''
          ? String(row.description).trim()
          : fallback?.description || '';

      resultItems.push({
        id: row.id,
        name: title,
        distanceKm: distNum,
        distanceDisplay: finalDistanceDisplay,
        showDistance: shouldDisplayDistance,
        tagline,
        description,
        image: image || NEHRU_ZOO_NEW_IMAGE,
        locationArea: fallback?.locationArea || 'Hyderabad',
        isApproved: true,
      });
    }

    return resultItems;
  }

  /**
   * Fetch Gallery Items with Robust Fallback + Supabase Merge
   * 
   * Architecture:
   * 1. Start with verified fallback images from hotelData.ts
   * 2. Fetch active gallery images from Supabase (is_active = true)
   * 3. For every category (Rooms, Property, Dining, Hyderabad):
   *    Existing fallback images + Active Supabase uploaded images (deduplicated)
   * 4. Return combined gallery items (filtered by category if requested)
   */
  async getGallery(category?: string): Promise<GalleryItem[]> {
    // 1. Base verified fallback items with strict category normalization
    const baseItems: GalleryItem[] = fallbackGalleryData.map((item) => {
      let img = item.image;
      if (
        item.id === 'g-hyd-5' ||
        item.title?.toLowerCase().includes('nehru') ||
        (typeof img === 'string' && img.includes('nehru-zoological-park'))
      ) {
        img = NEHRU_ZOO_NEW_IMAGE;
      }
      return {
        ...item,
        image: img,
        category: normalizeGalleryCategory(item.category),
      };
    });

    const deletedGalleryIds = getDeletedGalleryIds();
    const updatedGalleryMap = getLocalUpdatedGalleryMap();

    // Helper to sanitize items
    const applyGalleryOverlay = (items: GalleryItem[]): GalleryItem[] => {
      return items
        .filter((item) => !deletedGalleryIds.includes(item.id))
        .map((item) => {
          const upd = updatedGalleryMap[item.id];
          let finalImg = upd?.image_url || item.image;
          if (
            item.id === 'g-hyd-5' ||
            item.title?.toLowerCase().includes('nehru') ||
            (typeof finalImg === 'string' && finalImg.includes('nehru-zoological-park'))
          ) {
            finalImg = NEHRU_ZOO_NEW_IMAGE;
          }
          return {
            ...item,
            title: upd?.title || item.title,
            image: finalImg,
            alt: upd?.alt_text || item.alt,
          };
        });
    };

    // If Supabase is unavailable, return fallback directly
    if (!isSupabaseAvailable() || !supabase) {
      const sanitizedBase = applyGalleryOverlay(baseItems);
      if (category && category !== 'All') {
        const targetCategory = normalizeGalleryCategory(category);
        return sanitizedBase.filter((g) => normalizeGalleryCategory(g.category) === targetCategory);
      }
      return sanitizedBase;
    }

    try {
      // 2. Fetch active images from Supabase
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*, gallery_categories(label)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        if (error) {
          console.info('[HotelService] Supabase gallery fetch notice (using base fallback):', error.message);
        }
        const sanitizedBase = applyGalleryOverlay(baseItems);
        if (category && category !== 'All') {
          const targetCategory = normalizeGalleryCategory(category);
          return sanitizedBase.filter((g) => normalizeGalleryCategory(g.category) === targetCategory);
        }
        return sanitizedBase;
      }

      // 3. Convert active Supabase rows to GalleryItem format
      const supabaseItems: GalleryItem[] = data
        .filter((row: any) => row.image_url && typeof row.image_url === 'string' && row.image_url.trim().length > 0)
        .map((row: any) => {
          const rawCat = row.gallery_categories?.label || row.category_id;
          const normalizedCat = normalizeGalleryCategory(rawCat);
          let img = row.image_url.trim();
          if (
            row.title?.toLowerCase().includes('nehru') ||
            (typeof img === 'string' && img.includes('nehru-zoological-park'))
          ) {
            img = NEHRU_ZOO_NEW_IMAGE;
          }
          return {
            id: row.id || `supabase-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: row.title || `${normalizedCat} Photo`,
            category: normalizedCat,
            image: img,
            alt: row.alt_text?.trim() || row.title?.trim() || `${normalizedCat} Photo`,
          };
        });

      // 4. Merge per category: Rooms, Property, Dining, Hyderabad
      const mergedByCategory: Record<ValidGalleryCategory, GalleryItem[]> = {
        Rooms: [],
        Property: [],
        Dining: [],
        Hyderabad: [],
      };

      for (const cat of VALID_GALLERY_CATEGORIES) {
        // Base verified fallback images for this category
        const catBase = baseItems.filter((item) => normalizeGalleryCategory(item.category) === cat);
        // Active Supabase images for this category
        const catSupabase = supabaseItems.filter((item) => normalizeGalleryCategory(item.category) === cat);

        // Start with all base verified images
        const catCombined: GalleryItem[] = [...catBase];

        // Append new Supabase images that do not duplicate base images or earlier images
        for (const supImg of catSupabase) {
          const alreadyExists = catCombined.some((existing) =>
            isDuplicateImage(existing.image, supImg.image)
          );
          if (!alreadyExists) {
            catCombined.push(supImg);
          }
        }

        mergedByCategory[cat] = catCombined;
      }

      // 5. Build full combined array in structured category order
      let allCombined: GalleryItem[] = [
        ...mergedByCategory.Property,
        ...mergedByCategory.Rooms,
        ...mergedByCategory.Dining,
        ...mergedByCategory.Hyderabad,
      ];

      allCombined = applyGalleryOverlay(allCombined);

      // If specific category requested
      if (category && category !== 'All') {
        const targetCategory = normalizeGalleryCategory(category);
        return allCombined.filter((g) => normalizeGalleryCategory(g.category) === targetCategory);
      }

      return allCombined;
    } catch (err) {
      console.info('[HotelService] Gallery exception, using base fallback:', err);
      const sanitizedBase = applyGalleryOverlay(baseItems);
      if (category && category !== 'All') {
        const targetCategory = normalizeGalleryCategory(category);
        return sanitizedBase.filter((g) => normalizeGalleryCategory(g.category) === targetCategory);
      }
      return sanitizedBase;
    }
  }

  /**
   * Fetch Testimonials / Guest Commitments
   */
  async getTestimonials(): Promise<TestimonialItem[]> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(TESTIMONIALS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [...fallbackTestimonialsData];
  }

  /**
   * Submit Guest Enquiry
   * Inserts into `enquiries` table if Supabase is connected.
   * Basic validation requires full name and valid phone (min 7 digits); message is optional.
   */
  async submitEnquiry(data: EnquirySubmission): Promise<{ success: boolean; message: string }> {
    // Validate required fields
    if (!data.fullName.trim()) {
      return {
        success: false,
        message: 'Please provide your name.',
      };
    }

    const cleanPhone = data.phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7) {
      return {
        success: false,
        message: 'Please enter a valid phone number (at least 7 digits) so our front desk can reach you.',
      };
    }

    const enqRecord: AdminEnquiryItem = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      room_preference: data.roomPreference || null,
      arrival_date: data.arrivalDate || null,
      departure_date: data.departureDate || null,
      guest_count: data.guestCount || null,
      message: data.message?.trim() || null,
      source_page: data.sourcePage || 'enquiry_modal',
      status: 'new',
      created_at: new Date().toISOString(),
    };
    saveLocalEnquiry(enqRecord);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: enqRecord.id }));
    }

    // Attempt Supabase insert if available
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('enquiries').insert([
          {
            id: enqRecord.id,
            full_name: enqRecord.full_name,
            phone: enqRecord.phone,
            email: enqRecord.email,
            room_preference: enqRecord.room_preference,
            arrival_date: enqRecord.arrival_date,
            departure_date: enqRecord.departure_date,
            guest_count: enqRecord.guest_count,
            message: enqRecord.message,
            source_page: enqRecord.source_page,
            status: 'new',
          },
        ]);

        if (error) {
          console.warn('[HotelService] Supabase enquiry insert warning:', error.message);
        }
      } catch (err) {
        console.warn('[HotelService] Supabase enquiry submission exception:', err);
      }
    } else {
      // Local fallback logging
      console.info('[HotelService] Guest enquiry recorded (Local Fallback):', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
    };
  }

  /**
   * Submit Contact Form Message
   */
  async submitContactMessage(data: {
    fullName: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!data.fullName.trim()) {
      return {
        success: false,
        message: 'Please provide your name.',
      };
    }

    const cleanPhone = data.phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7) {
      return {
        success: false,
        message: 'Please enter a valid phone number so our team can reach you.',
      };
    }

    const contactRecord: AdminEnquiryItem = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      room_preference: data.subject || 'General Inquiry',
      message: data.message?.trim() || null,
      source_page: 'contact_page',
      status: 'new',
      created_at: new Date().toISOString(),
    };
    saveLocalEnquiry(contactRecord);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: contactRecord.id }));
    }

    // Attempt Supabase insert into `enquiries` with source_page = 'contact_page'
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('enquiries').insert([
          {
            id: contactRecord.id,
            full_name: contactRecord.full_name,
            phone: contactRecord.phone,
            email: contactRecord.email,
            room_preference: contactRecord.room_preference,
            message: contactRecord.message,
            source_page: 'contact_page',
            status: 'new',
          },
        ]);

        if (error) {
          console.warn('[HotelService] Supabase contact message insert warning:', error.message);
        }
      } catch (err) {
        console.warn('[HotelService] Supabase contact message submission exception:', err);
      }
    } else {
      console.info('[HotelService] Contact message recorded (Local Fallback):', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'Thank you for reaching out! We have received your message and will respond promptly.',
    };
  }

  // ==========================================================
  // PHASE 1: SUPABASE AUTHENTICATION FOR ADMIN
  // ==========================================================

  /**
   * Admin Login via Supabase Auth
   */
  async adminLogin(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Supabase client is not configured or unavailable.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        return { success: false, error: 'Failed to establish an authenticated Supabase session.' };
      }

      // Verify the session and user explicitly
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session) {
        return { success: false, error: 'Supabase Auth session verification failed.' };
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        return { success: false, error: 'Supabase Auth user verification failed.' };
      }

      return { success: true, user: userData.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during authentication.' };
    }
  }

  /**
   * Admin Logout
   */
  async adminLogout(): Promise<void> {
    if (isSupabaseAvailable() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[HotelService] Admin signout exception:', err);
      }
    }
  }

  /**
   * Admin Password Reset Request
   */
  async adminResetPassword(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, message: '', error: 'Please enter your registered admin email.' };
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/admin/login`,
        });
        if (error) {
          return { success: false, message: '', error: error.message };
        }
        return { success: true, message: 'Password reset link sent! Please check your email.' };
      } catch (err: any) {
        return { success: false, message: '', error: err.message || 'Failed to send reset link.' };
      }
    }

    return {
      success: false,
      message: '',
      error: 'Supabase is not configured.',
    };
  }

  /**
   * Get Current Admin User
   */
  async getAdminUser(): Promise<any | null> {
    if (!isSupabaseAvailable() || !supabase) {
      return null;
    }

    try {
      // 1. Verify active session exists
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session) {
        return null;
      }

      // 2. Fetch verified user from Supabase Auth
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        return null;
      }

      return userData.user;
    } catch (err) {
      console.warn('[HotelService] getAdminUser check error:', err);
      return null;
    }
  }

  /**
   * Listen to Admin Auth State Changes
   */
  onAdminAuthStateChange(callback: (user: any | null) => void): () => void {
    if (isSupabaseAvailable() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
      });
      return () => {
        subscription.unsubscribe();
      };
    }

    return () => {};
  }

  // ==========================================================
  // PHASE 4: SUPABASE STORAGE (BUCKET: hotel-assets)
  // ==========================================================

  /**
   * Upload an asset into Supabase Storage
   * Sensible folders: property, rooms, dining, amenities, attractions, logo
   */
  async uploadAsset(
    file: File,
    folder: 'property' | 'rooms' | 'dining' | 'amenities' | 'attractions' | 'logo' | string,
    customFilename?: string
  ): Promise<{ publicUrl: string; path: string; error?: string }> {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const safeBaseName = (customFilename || file.name.replace(/\.[^/.]+$/, ''))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const filePath = `${cleanFolder}/${safeBaseName}-${timestamp}.${ext}`;

    if (!isSupabaseAvailable() || !supabase) {
      return { publicUrl: '', path: '', error: 'Supabase client is not available.' };
    }

    // Verify authenticated session exists before mutation
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData?.session) {
      return {
        publicUrl: '',
        path: '',
        error: 'Admin authentication session is missing. Please log in again.',
      };
    }

    try {
      const { error: uploadError } = await supabase.storage
        .from('hotel-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { publicUrl: '', path: '', error: uploadError.message };
      }

      const { data } = supabase.storage
        .from('hotel-assets')
        .getPublicUrl(filePath);

      await this.logAdminAction('image.uploaded', 'images', filePath, {
        folder: cleanFolder,
        path: filePath,
        fileName: file.name,
        size: file.size,
      });

      return {
        publicUrl: data.publicUrl,
        path: filePath,
      };
    } catch (err: any) {
      return { publicUrl: '', path: '', error: err.message || 'Upload failed' };
    }
  }

  /**
   * List assets in a storage folder
   */
  async listAssets(folder: string): Promise<StorageAssetItem[]> {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('hotel-assets')
          .list(cleanFolder, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (error || !data) {
          return [];
        }

        return data.map((item) => {
          const path = `${cleanFolder}/${item.name}`;
          const { data: urlData } = supabase!.storage
            .from('hotel-assets')
            .getPublicUrl(path);

          return {
            name: item.name,
            path,
            url: urlData.publicUrl,
            size: item.metadata?.size,
            updated_at: item.updated_at,
            folder: cleanFolder,
          };
        });
      } catch (err) {
        console.warn('[HotelService] listAssets warning:', err);
        return [];
      }
    }

    return [];
  }

  /**
   * Delete an asset from Supabase Storage
   */
  async deleteAsset(path: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Supabase client is not available.' };
    }

    // Verify authenticated session exists before mutation
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData?.session) {
      return {
        success: false,
        error: 'Admin authentication session is missing. Please log in again.',
      };
    }

    try {
      const { error } = await supabase.storage.from('hotel-assets').remove([path]);
      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction('image.deleted', 'images', path, { path });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete failed' };
    }
  }

  /**
   * Replace an asset
   */
  async replaceAsset(
    oldPath: string,
    newFile: File,
    folder: string
  ): Promise<{ publicUrl: string; path: string; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { publicUrl: '', path: '', error: 'Supabase client is not available.' };
    }

    // Verify authenticated session exists before mutation
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData?.session) {
      return {
        publicUrl: '',
        path: '',
        error: 'Admin authentication session is missing. Please log in again.',
      };
    }

    const uploadRes = await this.uploadAsset(newFile, folder);
    if (!uploadRes.publicUrl) {
      return uploadRes;
    }

    // Try deleting the old asset if it's on Supabase
    if (oldPath && oldPath !== uploadRes.path) {
      await this.deleteAsset(oldPath);
    }

    await this.logAdminAction('image.replaced', 'images', uploadRes.path, {
      oldPath,
      newPath: uploadRes.path,
    });

    return uploadRes;
  }

  // ==========================================================
  // PHASE 3: ADMIN DASHBOARD STATS
  // ==========================================================

  async getDashboardStats(): Promise<{
    roomsCount: number;
    galleryCount: number;
    amenitiesCount: number;
    attractionsCount: number;
    newEnquiriesCount: number;
  }> {
    let roomsCount = 0;
    let galleryCount = fallbackGalleryData.length;
    let amenitiesCount = fallbackAmenitiesData.length;
    let attractionsCount = fallbackAttractionsData.length;
    let newEnquiriesCount = 0;

    if (isSupabaseAvailable() && supabase) {
      try {
        const [roomsRes, galleryRes, amenitiesRes, attractionsRes, enquiriesRes] = await Promise.all([
          supabase.from('rooms').select('id', { count: 'exact', head: true }),
          supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
          supabase.from('amenities').select('id', { count: 'exact', head: true }),
          supabase.from('attractions').select('id', { count: 'exact', head: true }),
          supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        ]);

        if (roomsRes.count !== null && roomsRes.count !== undefined) roomsCount = roomsRes.count;
        if (galleryRes.count !== null && galleryRes.count !== undefined) {
          galleryCount = fallbackGalleryData.length + galleryRes.count;
        }
        if (amenitiesRes.count !== null && amenitiesRes.count !== undefined) amenitiesCount = amenitiesRes.count;
        if (attractionsRes.count !== null && attractionsRes.count !== undefined) attractionsCount = attractionsRes.count;
        if (enquiriesRes.count !== null && enquiriesRes.count !== undefined) newEnquiriesCount = enquiriesRes.count;
      } catch (err) {
        console.warn('[HotelService] Dashboard stats fetch error:', err);
      }
    }

    return {
      roomsCount,
      galleryCount,
      amenitiesCount,
      attractionsCount,
      newEnquiriesCount,
    };
  }

  // ==========================================================
  // PHASE 7: ROOMS MANAGEMENT
  // ==========================================================

  /**
   * Get all rooms for admin with verified fallback details pre-filling and local persistence
   */
  async getAdminRooms(): Promise<AdminRoomRecord[]> {
    const deletedIds = getDeletedRoomIds();
    const updatedMap = getLocalUpdatedRoomsMap();

    let rawList: AdminRoomRecord[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*, room_amenity_mappings(room_amenities(title))')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          rawList = data.map((row: any, idx: number) => {
            const fallback = findRoomFallback(row.id, row.title);
            const mappedAmenities = Array.isArray(row.room_amenity_mappings)
              ? row.room_amenity_mappings
                  .map((m: any) => m?.room_amenities?.title)
                  .filter(Boolean)
              : [];

            return {
              id: row.id,
              title: row.title || fallback?.name || 'Hotel Room',
              subtitle: row.subtitle || fallback?.subtitle || '',
              description: row.description || fallback?.description || '',
              occupancy: row.occupancy || fallback?.specs?.capacity || '2 Guests',
              bed_type: row.bed_type || fallback?.specs?.bed || 'King Bed',
              room_size: row.room_size || fallback?.specs?.size || '280 sq ft',
              image_url: row.image_url || fallback?.image || '',
              badge: row.badge || fallback?.statusNote || null,
              display_order: row.display_order ?? idx + 1,
              is_active: row.is_active ?? true,
              created_at: row.created_at,
              updated_at: row.updated_at,
              amenities:
                mappedAmenities.length > 0
                  ? mappedAmenities
                  : fallback?.amenities || ['Air Conditioning', 'High-Speed Wi-Fi', 'Attached Bathroom'],
            };
          });
        }
      } catch (err) {
        console.warn('[HotelService] Admin rooms fetch error:', err);
      }
    }

    // If DB is empty or unpopulated, seed from verified fallbackRoomsData so Admin always has complete rooms to manage
    if (rawList.length === 0) {
      rawList = fallbackRoomsData.map((r, idx) => ({
        id: r.id,
        title: r.name,
        subtitle: r.subtitle,
        description: r.description,
        occupancy: r.specs.capacity,
        bed_type: r.specs.bed,
        room_size: r.specs.size,
        image_url: r.image,
        badge: r.statusNote || null,
        display_order: idx + 1,
        is_active: true,
        amenities: r.amenities,
      }));
    }

    // Filter out deleted rooms
    const nonDeleted = rawList.filter((r) => !deletedIds.includes(r.id));

    // Apply local storage overrides
    const result = nonDeleted.map((r) => {
      const upd = updatedMap[r.id];
      if (!upd) return r;
      return {
        ...r,
        title: upd.title || r.title,
        subtitle: upd.subtitle !== undefined ? upd.subtitle : r.subtitle,
        description: upd.description !== undefined ? upd.description : r.description,
        occupancy: upd.occupancy !== undefined ? upd.occupancy : r.occupancy,
        bed_type: upd.bed_type !== undefined ? upd.bed_type : r.bed_type,
        room_size: upd.room_size !== undefined ? upd.room_size : r.room_size,
        image_url: upd.image_url !== undefined ? upd.image_url : r.image_url,
        badge: upd.badge !== undefined ? upd.badge : r.badge,
        display_order: upd.display_order !== undefined ? upd.display_order : r.display_order,
        is_active: upd.is_active !== undefined ? upd.is_active : r.is_active,
        amenities: upd.amenities && upd.amenities.length > 0 ? upd.amenities : r.amenities,
      };
    });

    // Also include any restored or locally saved room present in updatedMap but not in rawList
    const existingIds = new Set(result.map((r) => r.id));
    Object.entries(updatedMap).forEach(([roomId, upd]) => {
      if (!deletedIds.includes(roomId) && !existingIds.has(roomId) && upd.title) {
        const fallback = findRoomFallback(roomId, upd.title);
        result.push({
          id: roomId,
          title: upd.title,
          subtitle: upd.subtitle || fallback?.subtitle || '',
          description: upd.description || fallback?.description || '',
          occupancy: upd.occupancy || fallback?.specs?.capacity || '2 Guests',
          bed_type: upd.bed_type || fallback?.specs?.bed || 'King Bed',
          room_size: upd.room_size || fallback?.specs?.size || '280 sq ft',
          image_url: upd.image_url || fallback?.image || '',
          badge: upd.badge || fallback?.statusNote || null,
          display_order: upd.display_order ?? result.length + 1,
          is_active: upd.is_active ?? true,
          amenities:
            upd.amenities && upd.amenities.length > 0
              ? upd.amenities
              : fallback?.amenities || ['Air Conditioning', 'High-Speed Wi-Fi', 'Attached Bathroom'],
        });
        existingIds.add(roomId);
      }
    });

    return result.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }

  async createAdminRoom(
    room: Partial<AdminRoomRecord> & { amenities?: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    if (!room.title?.trim()) {
      return { success: false, error: 'Room title is required.' };
    }

    const cleanId = (room.id || room.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');

    const createdRecord: Partial<AdminRoomRecord> = {
      id: cleanId,
      title: room.title.trim(),
      subtitle: room.subtitle?.trim() || null,
      description: room.description?.trim() || null,
      occupancy: room.occupancy?.trim() || null,
      bed_type: room.bed_type?.trim() || null,
      room_size: room.room_size?.trim() || null,
      image_url: room.image_url?.trim() || null,
      badge: room.badge?.trim() || null,
      display_order: room.display_order ?? 0,
      is_active: room.is_active ?? true,
      amenities: room.amenities,
    };
    saveLocalUpdatedRoom(cleanId, createdRecord);

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('rooms').insert([
          {
            id: cleanId,
            title: room.title.trim(),
            subtitle: room.subtitle?.trim() || null,
            description: room.description?.trim() || null,
            occupancy: room.occupancy?.trim() || null,
            bed_type: room.bed_type?.trim() || null,
            room_size: room.room_size?.trim() || null,
            image_url: room.image_url?.trim() || null,
            badge: room.badge?.trim() || null,
            display_order: room.display_order ?? 0,
            is_active: room.is_active ?? true,
          },
        ]);
        if (error) console.warn('[HotelService] Supabase room insert note:', error.message);

        if (room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0) {
          await this.saveRoomAmenities(cleanId, room.amenities);
        }

        await this.logAdminAction('room.created', 'rooms', cleanId, { title: room.title });
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase room insert exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async updateAdminRoom(
    id: string,
    updates: Partial<AdminRoomRecord> & { amenities?: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    saveLocalUpdatedRoom(id, updates);

    if (isSupabaseAvailable() && supabase) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) payload.title = updates.title.trim();
        if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle?.trim() || null;
        if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
        if (updates.occupancy !== undefined) payload.occupancy = updates.occupancy?.trim() || null;
        if (updates.bed_type !== undefined) payload.bed_type = updates.bed_type?.trim() || null;
        if (updates.room_size !== undefined) payload.room_size = updates.room_size?.trim() || null;
        if (updates.image_url !== undefined) payload.image_url = updates.image_url?.trim() || null;
        if (updates.badge !== undefined) payload.badge = updates.badge?.trim() || null;
        if (updates.display_order !== undefined) payload.display_order = updates.display_order;
        if (updates.is_active !== undefined) payload.is_active = updates.is_active;

        const { error } = await supabase.from('rooms').update(payload).eq('id', id);
        if (error) console.warn('[HotelService] Supabase room update notice:', error.message);

        if (updates.amenities !== undefined && Array.isArray(updates.amenities)) {
          await this.saveRoomAmenities(id, updates.amenities);
        }

        await this.logAdminAction('room.updated', 'rooms', id, { updates });
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase room update exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  private async saveRoomAmenities(roomId: string, amenities: string[]): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) return;
    try {
      await supabase.from('room_amenity_mappings').delete().eq('room_id', roomId);

      for (const amen of amenities) {
        const trimmed = amen.trim();
        if (!trimmed) continue;
        const amenId = `amenity-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        await supabase.from('room_amenities').upsert(
          {
            id: amenId,
            title: trimmed,
            icon_name: 'CheckCircle2',
          },
          { onConflict: 'id' }
        );

        await supabase.from('room_amenity_mappings').insert([
          {
            room_id: roomId,
            amenity_id: amenId,
          },
        ]);
      }
    } catch (err) {
      console.warn('[HotelService] Room amenities mapping note:', err);
    }
  }

  async toggleAdminRoomActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateAdminRoom(id, { is_active: isActive });
  }

  async deleteAdminRoom(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const rooms = await this.getAdminRooms();
      const room = rooms.find((r) => r.id === id) || fallbackRoomsData.find((r) => r.id === id || r.id === id.replace(/^room-/, ''));
      if (room) {
        addTrashItemLocal({
          originalId: id,
          type: 'room',
          title: (room as any).title || (room as any).name || 'Hotel Room',
          subtitle: (room as any).subtitle || (room as any).rateLabel || (room as any).bed_type || '',
          image: (room as any).image_url || (room as any).image || '',
          data: room,
        });
      }
    } catch (e) {
      console.warn('[HotelService] Trash room archiving note:', e);
    }

    markRoomDeleted(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_rooms_updated', { detail: id }));
      window.dispatchEvent(new CustomEvent('lotus_trash_updated'));
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        await supabase.from('room_amenity_mappings').delete().eq('room_id', id);
        const { error } = await supabase.from('rooms').delete().eq('id', id);
        if (error) console.warn('[HotelService] Supabase room delete notice:', error.message);
        await this.logAdminAction('room.deleted', 'rooms', id);
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase room delete exception:', err);
        return { success: true };
      }
    }
    return { success: true };
  }

  async reorderAdminRooms(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseAvailable() && supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase.from('rooms').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
        }
        await this.logAdminAction('room.reordered', 'rooms', 'all', { orderedIds });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  // ==========================================================
  // PHASE 8: AMENITIES MANAGEMENT
  // ==========================================================

  async getAdminAmenities(): Promise<AdminAmenityRecord[]> {
    const deletedIds = getDeletedAmenityIds();
    const updatedMap = getLocalUpdatedAmenitiesMap();

    let dbRows: any[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('amenities')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          dbRows = data;
        }
      } catch (err) {
        console.warn('[HotelService] Admin amenities fetch error:', err);
      }
    }

    let cachedList: AdminAmenityRecord[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedList = parsed;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Seed map with all 16 verified amenities (excluding deleted)
    const map = new Map<string, AdminAmenityRecord>();
    fallbackAmenitiesData.forEach((fb, idx) => {
      if (deletedIds.includes(fb.id) || deletedIds.includes(`amenity-${fb.id}`)) return;
      map.set(fb.id, {
        id: fb.id,
        title: fb.title,
        description: fb.description,
        icon_name: fb.iconName,
        category: this.normalizeAmenityCategory(fb.category),
        display_order: idx + 1,
        is_active: true,
      });
    });

    const sourceRows = dbRows.length > 0 ? dbRows : cachedList || [];
    sourceRows.forEach((row: any, i: number) => {
      if (deletedIds.includes(row.id)) return;
      const normCat = this.normalizeAmenityCategory(row.category);
      const matchingFallback = fallbackAmenitiesData.find(
        (fb) =>
          fb.id === row.id ||
          fb.id === row.id?.replace(/^amenity-/, '') ||
          row.id === `amenity-${fb.id}` ||
          fb.title.toLowerCase().trim() === (row.title || '').toLowerCase().trim()
      );

      if (matchingFallback) {
        if (deletedIds.includes(matchingFallback.id)) return;
        const finalCat =
          normCat !== 'basic' && normCat !== 'general' ? normCat : matchingFallback.category;
        map.set(matchingFallback.id, {
          id: matchingFallback.id,
          title: row.title || matchingFallback.title,
          description: row.description || matchingFallback.description || '',
          icon_name: row.icon_name || matchingFallback.iconName,
          category: finalCat,
          display_order: row.display_order ?? i + 1,
          is_active: row.is_active ?? true,
        });
      } else if (row.id) {
        const fbLookup = findAmenityFallback(row.id, row.title);
        map.set(row.id, {
          id: row.id,
          title: row.title || fbLookup?.title || 'Amenity',
          description: row.description || fbLookup?.description || '',
          icon_name: row.icon_name || fbLookup?.iconName || 'Sparkles',
          category: normCat,
          display_order: row.display_order ?? i + 1,
          is_active: row.is_active ?? true,
        });
      }
    });

    // Apply any local updates and include restored amenities
    Object.keys(updatedMap).forEach((id) => {
      if (deletedIds.includes(id)) return;
      const upd = updatedMap[id];
      if (!upd) return;
      const existing = map.get(id);
      if (existing) {
        map.set(id, {
          ...existing,
          title: upd.title || existing.title,
          description: upd.description !== undefined ? upd.description : existing.description,
          icon_name: upd.icon_name || existing.icon_name,
          category: upd.category || existing.category,
          display_order: upd.display_order !== undefined ? upd.display_order : existing.display_order,
          is_active: upd.is_active !== undefined ? upd.is_active : existing.is_active,
        });
      } else if (upd.title) {
        const fbLookup = findAmenityFallback(id, upd.title);
        map.set(id, {
          id,
          title: upd.title,
          description: upd.description || fbLookup?.description || '',
          icon_name: upd.icon_name || fbLookup?.iconName || 'Sparkles',
          category: upd.category || (fbLookup ? this.normalizeAmenityCategory(fbLookup.category) : 'basic'),
          display_order: upd.display_order ?? map.size + 1,
          is_active: upd.is_active ?? true,
        });
      }
    });

    const finalList = Array.from(map.values()).sort(
      (a, b) => (a.display_order ?? 99) - (b.display_order ?? 99)
    );

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_amenities_data', JSON.stringify(finalList));
      } catch (e) {}
    }

    return finalList;
  }

  async updateAdminAmenity(id: string, updates: Partial<AdminAmenityRecord>): Promise<{ success: boolean; error?: string }> {
    saveLocalUpdatedAmenity(id, updates);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        if (stored) {
          const list: AdminAmenityRecord[] = JSON.parse(stored);
          const updatedList = list.map((item) => (item.id === id ? { ...item, ...updates } : item));
          localStorage.setItem('admin_amenities_data', JSON.stringify(updatedList));
        }
      } catch (e) {}
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase
          .from('amenities')
          .update({
            title: updates.title,
            description: updates.description,
            icon_name: updates.icon_name,
            category: updates.category,
            display_order: updates.display_order,
            is_active: updates.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) console.warn('[HotelService] Supabase amenity update notice:', error.message);
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase amenity update exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async createAdminAmenity(amenity: Partial<AdminAmenityRecord>): Promise<{ success: boolean; error?: string }> {
    if (!amenity.title?.trim()) {
      return { success: false, error: 'Amenity title is required.' };
    }
    const cleanId = (amenity.id || amenity.title).toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    const newRecord: AdminAmenityRecord = {
      id: cleanId,
      title: amenity.title.trim(),
      description: amenity.description?.trim() || '',
      icon_name: amenity.icon_name?.trim() || 'Sparkles',
      category: amenity.category || 'basic',
      display_order: amenity.display_order ?? 99,
      is_active: amenity.is_active ?? true,
    };

    saveLocalUpdatedAmenity(cleanId, newRecord);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        const list: AdminAmenityRecord[] = stored ? JSON.parse(stored) : [];
        list.push(newRecord);
        localStorage.setItem('admin_amenities_data', JSON.stringify(list));
      } catch (e) {}
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('amenities').insert([
          {
            id: cleanId,
            title: newRecord.title,
            description: newRecord.description,
            icon_name: newRecord.icon_name,
            category: newRecord.category,
            display_order: newRecord.display_order,
            is_active: newRecord.is_active,
          },
        ]);
        if (error) console.warn('[HotelService] Supabase amenity insert notice:', error.message);
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase amenity insert exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async toggleAdminAmenityActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateAdminAmenity(id, { is_active: isActive });
  }

  async deleteAdminAmenity(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const amenities = await this.getAdminAmenities();
      const amenity = amenities.find((a) => a.id === id) || fallbackAmenitiesData.find((a) => a.id === id || a.id === id.replace(/^amenity-/, ''));
      if (amenity) {
        addTrashItemLocal({
          originalId: id,
          type: 'amenity',
          title: (amenity as any).title || 'Hotel Amenity',
          subtitle: (amenity as any).category || (amenity as any).description || '',
          image: (amenity as any).icon_name || '',
          data: amenity,
        });
      }
    } catch (e) {
      console.warn('[HotelService] Trash amenity archiving note:', e);
    }

    markAmenityDeleted(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_amenities_updated', { detail: id }));
      window.dispatchEvent(new CustomEvent('lotus_trash_updated'));
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        if (stored) {
          const list: AdminAmenityRecord[] = JSON.parse(stored);
          const filtered = list.filter((a) => a.id !== id);
          localStorage.setItem('admin_amenities_data', JSON.stringify(filtered));
        }
      } catch (e) {}
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('amenities').delete().eq('id', id);
        if (error) console.warn('[HotelService] Supabase amenity delete notice:', error.message);
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase amenity delete exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async reorderAdminAmenities(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_amenities_data');
        if (stored) {
          const list: AdminAmenityRecord[] = JSON.parse(stored);
          const map = new Map(list.map((item) => [item.id, item]));
          const reordered: AdminAmenityRecord[] = [];
          orderedIds.forEach((id, idx) => {
            const item = map.get(id);
            if (item) {
              item.display_order = idx + 1;
              reordered.push(item);
              map.delete(id);
            }
          });
          map.forEach((item) => reordered.push(item));
          localStorage.setItem('admin_amenities_data', JSON.stringify(reordered));
        }
      } catch (e) {}
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase.from('amenities').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  /**
   * Get visibility preference for 'In-Room Standards & Guest Policies' section on public amenities page
   */
  getStandardsSectionVisibility(): boolean {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hotel_show_standards_section');
        if (stored !== null) {
          return stored === 'true';
        }
      } catch (e) {}
    }
    return true; // Default is visible
  }

  /**
   * Set visibility preference for 'In-Room Standards & Guest Policies' section on public amenities page
   */
  setStandardsSectionVisibility(visible: boolean): { success: boolean } {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hotel_show_standards_section', String(visible));
        window.dispatchEvent(new CustomEvent('hotel_standards_visibility_changed', { detail: { visible } }));
      } catch (e) {}
    }
    return { success: true };
  }

  // ==========================================================
  // PHASE 9: ATTRACTIONS MANAGEMENT (5 APPROVED HYDERABAD ATTRACTIONS)
  // ==========================================================

  async getAdminAttractions(): Promise<AdminAttractionRecord[]> {
    let rawItems: AdminAttractionRecord[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('attractions')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          rawItems = data.map((row: any, idx: number) => {
            const fallback = findAttractionFallback(row.id, row.title);

            let showDist = false;
            if (row.show_distance !== undefined && row.show_distance !== null) {
              showDist = Boolean(row.show_distance);
            } else if (typeof window !== 'undefined') {
              const cached =
                localStorage.getItem(`attraction_show_distance_${row.id}`) ??
                (fallback ? localStorage.getItem(`attraction_show_distance_${fallback.id}`) : null);
              if (cached !== null) {
                showDist = cached === 'true';
              }
            }

            const dist =
              row.distance_approx !== undefined && row.distance_approx !== null
                ? String(row.distance_approx).trim()
                : (fallback?.distanceDisplay || '');

            const isBlank =
              !dist ||
              dist === '0' ||
              dist === '0 km' ||
              dist === '0km' ||
              dist.toLowerCase() === 'n/a' ||
              dist.toLowerCase() === 'na' ||
              dist.toLowerCase() === 'distance unavailable';

            const effectiveShow = showDist === true && !isBlank;

            const desc =
              row.description && String(row.description).trim() !== ''
                ? String(row.description).trim()
                : fallback?.description || '';

            const travelTime =
              row.travel_time_approx && String(row.travel_time_approx).trim() !== ''
                ? String(row.travel_time_approx).trim()
                : fallback?.tagline || '';

            let img = row.image_url || fallback?.image || '';
            const isNehruZoo =
              row.id === 'nehru-zoo' ||
              (row.title && row.title.toLowerCase().includes('nehru')) ||
              (typeof img === 'string' &&
                (img.includes('nehru-zoological-park') ||
                  img.includes('chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png')));

            if (isNehruZoo) {
              if (!img || img.includes('nehru-zoological-park') || !img.startsWith('http')) {
                img = NEHRU_ZOO_NEW_IMAGE;
              }
            }

            return {
              id: row.id,
              title: row.title || fallback?.name || '',
              distance_approx: effectiveShow ? dist : (showDist ? '' : dist),
              show_distance: effectiveShow,
              travel_time_approx: travelTime,
              description: desc,
              highlights: row.highlights || [],
              timings: row.timings || null,
              image_url: img,
              display_order: row.display_order ?? idx + 1,
              is_active: row.is_active ?? true,
            };
          });
        }
      } catch (err) {
        console.warn('[HotelService] Admin attractions fetch error:', err);
      }
    }

    if (rawItems.length === 0) {
      // 5 Approved Hyderabad Landmarks
      rawItems = fallbackAttractionsData.map((att, idx) => ({
        id: att.id,
        title: att.name,
        distance_approx: att.distanceDisplay || '',
        show_distance: false,
        travel_time_approx: att.tagline,
        description: att.description,
        highlights: [],
        timings: null,
        image_url: att.image,
        display_order: idx + 1,
        is_active: true,
      }));
    }

    const deletedIds = getDeletedAttractionIds();
    const updatedMap = getLocalUpdatedAttractionsMap();

    // Exclude deleted attractions
    const filtered = rawItems.filter((item) => !deletedIds.includes(item.id));

    const result: AdminAttractionRecord[] = filtered.map((item) => {
      const fallback = findAttractionFallback(item.id, item.title);
      const upd = updatedMap[item.id] || {};

      let dist = '';
      if (upd.distance_approx !== undefined && upd.distance_approx !== null) {
        dist = String(upd.distance_approx).trim();
      } else if (typeof window !== 'undefined') {
        const distOverride =
          localStorage.getItem(`attraction_distance_override_${item.id}`) ??
          (fallback ? localStorage.getItem(`attraction_distance_override_${fallback.id}`) : null);
        if (distOverride !== null) {
          dist = distOverride.trim();
        } else if (item.distance_approx !== undefined && item.distance_approx !== null) {
          dist = String(item.distance_approx).trim();
        } else {
          dist = fallback?.distanceDisplay || '';
        }
      } else if (item.distance_approx !== undefined && item.distance_approx !== null) {
        dist = String(item.distance_approx).trim();
      } else {
        dist = fallback?.distanceDisplay || '';
      }

      let showDist = item.show_distance;
      if (upd.show_distance !== undefined) {
        showDist = Boolean(upd.show_distance);
      } else if (typeof window !== 'undefined') {
        const cached =
          localStorage.getItem(`attraction_show_distance_${item.id}`) ??
          (fallback ? localStorage.getItem(`attraction_show_distance_${fallback.id}`) : null);
        if (cached !== null) {
          showDist = cached === 'true';
        }
      }

      const isBlank =
        !dist ||
        dist.trim() === '' ||
        dist === '0' ||
        dist === '0 km' ||
        dist === '0km' ||
        dist.toLowerCase() === 'n/a' ||
        dist.toLowerCase() === 'na' ||
        dist.toLowerCase() === 'distance unavailable';

      const effectiveShow = showDist === true && !isBlank;

      const desc =
        upd.description !== undefined && upd.description !== null && String(upd.description).trim() !== ''
          ? String(upd.description).trim()
          : item.description && String(item.description).trim() !== ''
          ? String(item.description).trim()
          : fallback?.description || '';

      const travelTime =
        upd.travel_time_approx !== undefined && upd.travel_time_approx !== null && String(upd.travel_time_approx).trim() !== ''
          ? String(upd.travel_time_approx).trim()
          : item.travel_time_approx && String(item.travel_time_approx).trim() !== ''
          ? String(item.travel_time_approx).trim()
          : fallback?.tagline || '';

      let imgUrl =
        upd.image_url !== undefined && upd.image_url !== null && String(upd.image_url).trim() !== ''
          ? upd.image_url
          : item.image_url || fallback?.image || '';

      const isNehruZoo =
        item.id === 'nehru-zoo' ||
        item.title.toLowerCase().includes('nehru') ||
        (typeof imgUrl === 'string' &&
          (imgUrl.includes('nehru-zoological-park') ||
            imgUrl.includes('chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png')));

      if (isNehruZoo) {
        if (!imgUrl || imgUrl.includes('nehru-zoological-park') || !imgUrl.startsWith('http')) {
          imgUrl = NEHRU_ZOO_NEW_IMAGE;
        }
      }

      return {
        ...item,
        title: upd.title || item.title || fallback?.name || '',
        distance_approx: effectiveShow ? dist : '',
        show_distance: effectiveShow,
        travel_time_approx: travelTime,
        description: desc,
        image_url: imgUrl || NEHRU_ZOO_NEW_IMAGE,
        display_order: upd.display_order !== undefined ? upd.display_order : item.display_order,
        is_active: upd.is_active !== undefined ? upd.is_active : item.is_active,
      };
    });

    // Also include any restored or locally added attraction in updatedMap but not in filtered
    const existingAttractionIds = new Set(result.map((x) => x.id));
    Object.entries(updatedMap).forEach(([attrId, upd]) => {
      if (!deletedIds.includes(attrId) && !existingAttractionIds.has(attrId) && upd && upd.title) {
        const fallback = findAttractionFallback(attrId, upd.title);
        result.push({
          id: attrId,
          title: upd.title,
          distance_approx: upd.distance_approx ? String(upd.distance_approx) : '',
          show_distance: upd.show_distance ?? false,
          travel_time_approx: upd.travel_time_approx || fallback?.tagline || '',
          description: upd.description || fallback?.description || '',
          highlights: upd.highlights || [],
          timings: upd.timings || null,
          image_url: upd.image_url || fallback?.image || NEHRU_ZOO_NEW_IMAGE,
          display_order: upd.display_order ?? result.length + 1,
          is_active: upd.is_active ?? true,
        });
        existingAttractionIds.add(attrId);
      }
    });

    return result.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }

  async updateAdminAttraction(id: string, updates: Partial<AdminAttractionRecord>): Promise<{ success: boolean; error?: string }> {
    const fallback = findAttractionFallback(id, updates.title);

    // Normalize distance and visibility
    const rawDist = updates.distance_approx !== undefined ? String(updates.distance_approx).trim() : undefined;
    const isBlank = rawDist !== undefined && (!rawDist || rawDist === '0' || rawDist === '0 km' || rawDist === '0km');

    let normalizedShow = updates.show_distance;
    let normalizedDist = rawDist;

    if (updates.show_distance === false || isBlank) {
      normalizedShow = false;
      normalizedDist = '';
    } else if (updates.show_distance === true && rawDist) {
      normalizedShow = true;
      normalizedDist = rawDist;
    }

    const effectiveUpdates: Partial<AdminAttractionRecord> = {
      ...updates,
      ...(normalizedShow !== undefined ? { show_distance: normalizedShow } : {}),
      ...(normalizedDist !== undefined ? { distance_approx: normalizedDist } : {}),
    };

    // 1. Always cache in localStorage for instant synchronization and resilience
    saveLocalUpdatedAttraction(id, effectiveUpdates);
    if (fallback && fallback.id !== id) {
      saveLocalUpdatedAttraction(fallback.id, effectiveUpdates);
    }

    if (typeof window !== 'undefined') {
      if (normalizedShow !== undefined) {
        localStorage.setItem(`attraction_show_distance_${id}`, String(normalizedShow));
        if (fallback && fallback.id !== id) {
          localStorage.setItem(`attraction_show_distance_${fallback.id}`, String(normalizedShow));
        }
      }
      if (normalizedDist !== undefined) {
        localStorage.setItem(`attraction_distance_override_${id}`, normalizedDist);
        if (fallback && fallback.id !== id) {
          localStorage.setItem(`attraction_distance_override_${fallback.id}`, normalizedDist);
        }
      }

      // Dispatch custom event for real-time reactivity across pages
      window.dispatchEvent(new CustomEvent('lotus_attractions_updated', { detail: { id, updates: effectiveUpdates } }));
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const payload: Record<string, any> = {
          title: effectiveUpdates.title,
          distance_approx: normalizedDist !== undefined ? normalizedDist : (effectiveUpdates.distance_approx || ''),
          travel_time_approx: effectiveUpdates.travel_time_approx,
          description: effectiveUpdates.description,
          image_url: effectiveUpdates.image_url,
          display_order: effectiveUpdates.display_order,
          is_active: effectiveUpdates.is_active,
          updated_at: new Date().toISOString(),
        };

        if (normalizedShow !== undefined) {
          payload.show_distance = normalizedShow;
        }

        // Clean out undefined keys
        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

        let { error } = await supabase
          .from('attractions')
          .update(payload)
          .eq('id', id);

        // If show_distance column does not exist on Supabase table yet, retry without it
        if (error && (error.message?.includes('show_distance') || error.message?.includes('column'))) {
          delete payload.show_distance;
          const retry = await supabase
            .from('attractions')
            .update(payload)
            .eq('id', id);
          error = retry.error;
        }

        if (error) {
          console.warn('[HotelService] Supabase attraction update warning (local storage active):', error.message);
        }
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase attraction update exception (local storage active):', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async deleteAdminAttraction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const attractions = await this.getAdminAttractions();
      const attraction = attractions.find((a) => a.id === id) || fallbackAttractionsData.find((a) => a.id === id);
      if (attraction) {
        addTrashItemLocal({
          originalId: id,
          type: 'attraction',
          title: (attraction as any).title || (attraction as any).name || 'Attraction',
          subtitle: (attraction as any).distance || (attraction as any).duration || (attraction as any).type || '',
          image: (attraction as any).image_url || (attraction as any).image || '',
          data: attraction,
        });
      }
    } catch (e) {
      console.warn('[HotelService] Trash attraction archiving note:', e);
    }

    markAttractionDeleted(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_attractions_updated', { detail: id }));
      window.dispatchEvent(new CustomEvent('lotus_trash_updated'));
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('attractions').delete().eq('id', id);
        if (error) {
          console.warn('[HotelService] Supabase attraction delete warning:', error.message);
        }
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Supabase attraction delete exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  async toggleAdminAttractionActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateAdminAttraction(id, { is_active: isActive });
  }

  async reorderAdminAttractions(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseAvailable() && supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase.from('attractions').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  // ==========================================================
  // PHASE 5 & 10: GALLERY & IMAGE MANAGER
  // ==========================================================

  async getAdminGalleryCategories(): Promise<AdminCategoryItem[]> {
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('gallery_categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as AdminCategoryItem[];
        }
      } catch (err) {
        console.warn('[HotelService] Categories fetch error:', err);
      }
    }

    return [
      { id: 'rooms', label: 'Rooms', display_order: 1, is_active: true },
      { id: 'property', label: 'Property', display_order: 2, is_active: true },
      { id: 'dining', label: 'Dining', display_order: 3, is_active: true },
      { id: 'hyderabad', label: 'Hyderabad', display_order: 4, is_active: true },
    ];
  }

  async getAdminGalleryImages(categoryFilter?: string): Promise<AdminGalleryItem[]> {
    let supabaseItems: AdminGalleryItem[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        let query = supabase
          .from('gallery_images')
          .select('*, gallery_categories(label)')
          .order('display_order', { ascending: true });

        if (categoryFilter && categoryFilter !== 'All') {
          query = query.eq('category_id', categoryFilter.toLowerCase());
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          supabaseItems = data.map((row: any) => ({
            id: row.id,
            category_id: row.category_id,
            category_label: row.gallery_categories?.label || normalizeGalleryCategory(row.category_id),
            title: row.title,
            alt_text: row.alt_text,
            image_url: row.image_url || '',
            display_order: row.display_order,
            is_featured: row.is_featured,
            is_active: row.is_active,
            created_at: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('[HotelService] Admin gallery fetch error:', err);
      }
    }

    // Fallback images from verified hotel photos with strict category mapping
    const fallbackItems: AdminGalleryItem[] = fallbackGalleryData.map((item, idx) => {
      const normalizedCat = normalizeGalleryCategory(item.category);
      const catId = normalizedCat.toLowerCase();

      return {
        id: item.id,
        category_id: catId,
        category_label: normalizedCat,
        title: item.title,
        alt_text: item.alt,
        image_url: item.image,
        display_order: 100 + idx,
        is_featured: idx < 4,
        is_active: true,
      };
    });

    // Merge: Supabase uploaded items first, then fallback items (avoiding duplicates)
    let combined: AdminGalleryItem[] = [...supabaseItems];
    for (const fb of fallbackItems) {
      const isDuplicate = combined.some((item) => isDuplicateImage(item.image_url, fb.image_url));
      if (!isDuplicate) {
        combined.push(fb);
      }
    }

    // Apply local updates overlay
    const localUpdates = getLocalUpdatedGalleryMap();
    combined = combined.map((item) => {
      const upd = localUpdates[item.id];
      if (upd) {
        return {
          ...item,
          ...upd,
          category_label: upd.category_id ? normalizeGalleryCategory(upd.category_id) : item.category_label,
        };
      }
      return item;
    });

    // Exclude deleted items so deletions permanently persist across refreshes
    const deletedIds = getDeletedGalleryIds();
    if (deletedIds.length > 0) {
      combined = combined.filter((item) => !deletedIds.includes(item.id));
    }

    // Also append any restored or locally saved gallery image in localUpdates not already in combined
    const existingGalleryIds = new Set(combined.map((x) => x.id));
    Object.entries(localUpdates).forEach(([imgId, upd]) => {
      if (!deletedIds.includes(imgId) && !existingGalleryIds.has(imgId) && upd && upd.image_url) {
        const catId = upd.category_id || 'rooms';
        combined.push({
          id: imgId,
          category_id: catId,
          category_label: normalizeGalleryCategory(catId),
          title: upd.title || 'Gallery Image',
          alt_text: upd.alt_text || '',
          image_url: upd.image_url,
          display_order: upd.display_order ?? combined.length + 1,
          is_featured: upd.is_featured ?? false,
          is_active: upd.is_active ?? true,
        });
        existingGalleryIds.add(imgId);
      }
    });

    if (categoryFilter && categoryFilter !== 'All') {
      const filterLower = categoryFilter.toLowerCase();
      return combined.filter(
        (img) =>
          img.category_id.toLowerCase() === filterLower ||
          img.category_label.toLowerCase() === filterLower
      );
    }
    return combined;
  }

  async createAdminGalleryImage(payload: {
    category_id: string;
    title: string;
    alt_text: string;
    image_url: string;
    is_featured?: boolean;
    is_active?: boolean;
    display_order?: number;
  }): Promise<{ success: boolean; error?: string }> {
    if (!payload.title?.trim() || !payload.image_url?.trim()) {
      return { success: false, error: 'Title and image are required.' };
    }

    const cleanId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('gallery_images').insert([
          {
            id: cleanId,
            category_id: payload.category_id.toLowerCase(),
            title: payload.title.trim(),
            alt_text: payload.alt_text?.trim() || payload.title.trim(),
            image_url: payload.image_url.trim(),
            is_featured: payload.is_featured ?? false,
            is_active: payload.is_active ?? true,
            display_order: payload.display_order ?? 999,
          },
        ]);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }

  async updateAdminGalleryImage(id: string, updates: Partial<AdminGalleryItem>): Promise<{ success: boolean; error?: string }> {
    saveLocalUpdatedGalleryItem(id, updates);
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase
          .from('gallery_images')
          .update({
            category_id: updates.category_id?.toLowerCase(),
            title: updates.title,
            alt_text: updates.alt_text,
            image_url: updates.image_url,
            is_featured: updates.is_featured,
            is_active: updates.is_active,
            display_order: updates.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          console.warn('[HotelService] Supabase image update warning:', error.message);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }

  async deleteAdminGalleryImage(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const images = await this.getAdminGalleryImages();
      const img = images.find((i) => i.id === id);
      if (img) {
        addTrashItemLocal({
          originalId: id,
          type: 'gallery',
          title: img.title || 'Gallery Image',
          subtitle: img.category_label || img.category_id || '',
          image: img.image_url || '',
          data: img,
        });
      }
    } catch (e) {
      console.warn('[HotelService] Trash gallery archiving note:', e);
    }

    markGalleryImageDeleted(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_gallery_updated', { detail: id }));
      window.dispatchEvent(new CustomEvent('lotus_trash_updated'));
    }
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('gallery_images').delete().eq('id', id);
        if (error) {
          console.warn('[HotelService] Supabase image delete warning:', error.message);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }

  async reorderAdminGalleryImages(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseAvailable() && supabase) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await supabase.from('gallery_images').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }

  // ==========================================================
  // PHASE 11: ENQUIRY MANAGEMENT (PRIVATE / AUTHENTICATED ONLY)
  // ==========================================================

  async getAdminEnquiries(): Promise<AdminEnquiryItem[]> {
    const deletedIds = getDeletedEnquiryIds();
    let dbItems: AdminEnquiryItem[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          dbItems = data as AdminEnquiryItem[];
        }
      } catch (err) {
        console.warn('[HotelService] Admin enquiries fetch error:', err);
      }
    }

    const localList = getLocalEnquiries();

    let merged: AdminEnquiryItem[] = [];
    if (dbItems.length === 0 && localList.length === 0) {
      merged = [...fallbackEnquiriesData];
      saveLocalEnquiries(merged);
    } else {
      merged = [...dbItems];
      const seenIds = new Set(merged.map((x) => x.id));
      for (const loc of localList) {
        if (!seenIds.has(loc.id)) {
          merged.push(loc);
          seenIds.add(loc.id);
        }
      }
      if (merged.length === 0) {
        merged = [...fallbackEnquiriesData];
        saveLocalEnquiries(merged);
      }
    }

    // Filter out deleted IDs
    const nonDeleted = merged.filter((e) => !deletedIds.includes(e.id));
    return nonDeleted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateAdminEnquiryStatus(
    id: string,
    status: 'new' | 'contacted' | 'confirmed' | 'closed'
  ): Promise<{ success: boolean; error?: string }> {
    const current = getLocalEnquiries();
    const target = current.find((e) => e.id === id);
    if (target) {
      target.status = status;
      saveLocalEnquiry(target);
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase
          .from('enquiries')
          .update({ status })
          .eq('id', id);

        if (error) console.warn('[HotelService] Enquiry update notice:', error.message);

        await this.logAdminAction('enquiry.status_changed', 'enquiries', id, { status });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: { id, status } }));
        }
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Enquiry update exception:', err);
        return { success: true };
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: { id, status } }));
    }
    return { success: true };
  }

  async deleteAdminEnquiry(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const enquiries = await this.getAdminEnquiries();
      const enq = enquiries.find((e) => e.id === id);
      if (enq) {
        addTrashItemLocal({
          originalId: id,
          type: 'enquiry',
          title: enq.full_name || 'Guest Booking Enquiry',
          subtitle: `${enq.email || ''} ${enq.phone ? '• ' + enq.phone : ''}`.trim(),
          image: '',
          data: enq,
        });
      }
    } catch (e) {
      console.warn('[HotelService] Trash enquiry archiving note:', e);
    }

    markEnquiryDeleted(id);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: id }));
      window.dispatchEvent(new CustomEvent('lotus_trash_updated'));
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase.from('enquiries').delete().eq('id', id);
        if (error) console.warn('[HotelService] Enquiry delete notice:', error.message);
        await this.logAdminAction('enquiry.deleted', 'enquiries', id);
        return { success: true };
      } catch (err: any) {
        console.warn('[HotelService] Enquiry delete exception:', err);
        return { success: true };
      }
    }

    return { success: true };
  }

  // ==========================================================
  // PHASE 7: RBAC, USER APPROVAL & AUDIT LOGGING
  // ==========================================================

  /**
   * Log an administrative action to admin_audit_logs
   */
  async logAdminAction(
    action: string,
    module: string,
    targetId?: string | null,
    details?: Record<string, any>
  ): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      await supabase.from('admin_audit_logs').insert([
        {
          actor_id: user.id,
          actor_email: user.email,
          action,
          module,
          target_id: targetId || null,
          details: details || {},
        },
      ]);
    } catch (err) {
      console.warn('[HotelService] Audit logging notice:', err);
    }
  }

  /**
   * Fetch current admin profile including approval status, roles, and combined permissions
   */
  async getAdminProfile(userId?: string): Promise<AdminProfile | null> {
    if (!isSupabaseAvailable() || !supabase) return null;

    try {
      // 1. Determine user ID
      let targetId = userId;
      let targetEmail = '';
      if (!targetId) {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) return null;
        targetId = user.id;
        targetEmail = user.email || '';
      }

      // 2. Fetch profile from admin_profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (profileErr) {
        console.warn('[HotelService] Profile fetch notice:', profileErr.message);
      }

      let profileStatus: AdminApprovalStatus = 'PENDING';
      let fullName = '';
      let createdAt = new Date().toISOString();
      let lastSignIn = null;
      let approvedAt = null;
      let approvedBy = null;
      let notes = null;

      if (profileData) {
        profileStatus = (profileData.status as AdminApprovalStatus) || 'PENDING';
        fullName = profileData.full_name || '';
        createdAt = profileData.created_at;
        lastSignIn = profileData.last_sign_in_at;
        approvedAt = profileData.approved_at;
        approvedBy = profileData.approved_by;
        notes = profileData.notes;
        targetEmail = profileData.email || targetEmail;
      }

      // 3. Fetch user roles from admin_user_roles
      const { data: rolesData } = await supabase
        .from('admin_user_roles')
        .select('role_id')
        .eq('user_id', targetId);

      const roles: AdminRole[] = (rolesData || []).map((r: any) => r.role_id as AdminRole);
      const isSuperAdmin = roles.includes('SUPER_ADMIN');

      // 4. Fetch permissions:
      const permissionsSet = new Set<string>();

      if (isSuperAdmin) {
        // Super admin has all permissions
        const allPermissions: AdminPermission[] = [
          'users.view', 'users.approve', 'users.manage',
          'images.view', 'images.upload', 'images.replace', 'images.delete',
          'rooms.view', 'rooms.manage',
          'amenities.view', 'amenities.manage',
          'attractions.view', 'attractions.manage',
          'gallery.view', 'gallery.manage',
          'enquiries.view', 'enquiries.manage',
          'seo.view', 'seo.manage',
          'analytics.view', 'analytics.manage',
          'settings.view', 'settings.manage',
        ];
        allPermissions.forEach((p) => permissionsSet.add(p));
      } else {
        // Fetch role permissions
        if (roles.length > 0) {
          const { data: rolePermsData } = await supabase
            .from('admin_role_permissions')
            .select('permission_id')
            .in('role_id', roles);

          (rolePermsData || []).forEach((rp: any) => permissionsSet.add(rp.permission_id));
        }

        // Fetch individual custom permissions
        const { data: userPermsData } = await supabase
          .from('admin_user_permissions')
          .select('permission_id')
          .eq('user_id', targetId);

        (userPermsData || []).forEach((up: any) => permissionsSet.add(up.permission_id));
      }

      return {
        id: targetId,
        email: targetEmail,
        full_name: fullName,
        status: profileStatus,
        roles,
        permissions: Array.from(permissionsSet),
        isSuperAdmin,
        created_at: createdAt,
        last_sign_in_at: lastSignIn,
        approved_at: approvedAt,
        approved_by: approvedBy,
        notes,
      };
    } catch (err) {
      console.warn('[HotelService] getAdminProfile exception:', err);
      return null;
    }
  }

  /**
   * Helper to verify if an admin has a specific permission
   */
  hasPermission(profile: AdminProfile | null, permission: AdminPermission): boolean {
    if (!profile) return false;
    if (profile.status !== 'APPROVED') return false;
    if (profile.isSuperAdmin) return true;
    return profile.permissions.includes(permission);
  }

  /**
   * Fetch all admin users (Super Admin or users with users.manage only)
   */
  async getAllAdminUsers(): Promise<AdminProfile[]> {
    if (!isSupabaseAvailable() || !supabase) return [];

    try {
      const { data: profiles, error } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          admin_user_roles(role_id),
          admin_user_permissions(permission_id)
        `)
        .order('created_at', { ascending: false });

      if (error || !profiles) {
        console.warn('[HotelService] getAllAdminUsers error:', error?.message);
        return [];
      }

      // Fetch role permissions mapping
      const { data: rolePerms } = await supabase
        .from('admin_role_permissions')
        .select('role_id, permission_id');

      const rolePermsMap = new Map<string, string[]>();
      (rolePerms || []).forEach((rp: any) => {
        const existing = rolePermsMap.get(rp.role_id) || [];
        existing.push(rp.permission_id);
        rolePermsMap.set(rp.role_id, existing);
      });

      return profiles.map((p: any) => {
        const roles: AdminRole[] = (p.admin_user_roles || []).map((r: any) => r.role_id as AdminRole);
        const isSuperAdmin = roles.includes('SUPER_ADMIN');

        const permissionsSet = new Set<string>();
        if (isSuperAdmin) {
          const allPermissions: AdminPermission[] = [
            'users.view', 'users.approve', 'users.manage',
            'images.view', 'images.upload', 'images.replace', 'images.delete',
            'rooms.view', 'rooms.manage',
            'amenities.view', 'amenities.manage',
            'attractions.view', 'attractions.manage',
            'gallery.view', 'gallery.manage',
            'enquiries.view', 'enquiries.manage',
            'seo.view', 'seo.manage',
            'analytics.view', 'analytics.manage',
            'settings.view', 'settings.manage',
          ];
          allPermissions.forEach((perm) => permissionsSet.add(perm));
        } else {
          roles.forEach((r) => {
            const perms = rolePermsMap.get(r) || [];
            perms.forEach((perm) => permissionsSet.add(perm));
          });
          (p.admin_user_permissions || []).forEach((up: any) => {
            permissionsSet.add(up.permission_id);
          });
        }

        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          status: (p.status as AdminApprovalStatus) || 'PENDING',
          roles,
          permissions: Array.from(permissionsSet),
          isSuperAdmin,
          created_at: p.created_at,
          last_sign_in_at: p.last_sign_in_at,
          approved_at: p.approved_at,
          approved_by: p.approved_by,
          notes: p.notes,
        };
      });
    } catch (err) {
      console.warn('[HotelService] getAllAdminUsers exception:', err);
      return [];
    }
  }

  /**
   * Update Admin User Approval Status (Approve, Reject, Suspend, Activate)
   */
  async updateAdminUserStatus(
    userId: string,
    status: AdminApprovalStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Supabase client is not available.' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const approver = sessionData?.session?.user;

      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'APPROVED') {
        updatePayload.approved_at = new Date().toISOString();
        if (approver?.id) updatePayload.approved_by = approver.id;
      }
      if (notes !== undefined) {
        updatePayload.notes = notes;
      }

      const { error } = await supabase
        .from('admin_profiles')
        .update(updatePayload)
        .eq('id', userId);

      if (error) return { success: false, error: error.message };

      await this.logAdminAction(`user.${status.toLowerCase()}`, 'users', userId, {
        status,
        notes,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update user status.' };
    }
  }

  /**
   * Assign Role to Admin User (SUPER_ADMIN, CONTENT_ADMIN, ENQUIRY_ADMIN)
   */
  async assignAdminUserRole(
    userId: string,
    role: AdminRole
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Supabase client is not available.' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const assigner = sessionData?.session?.user;

      // Delete existing role assignments
      await supabase.from('admin_user_roles').delete().eq('user_id', userId);

      // Insert new role assignment
      const { error } = await supabase.from('admin_user_roles').insert([
        {
          user_id: userId,
          role_id: role,
          assigned_by: assigner?.id || null,
        },
      ]);

      if (error) return { success: false, error: error.message };

      await this.logAdminAction('user.role_assigned', 'users', userId, { role });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to assign role.' };
    }
  }

  /**
   * Manage Custom Individual Permissions for an Admin User
   */
  async updateAdminUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Supabase client is not available.' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const granter = sessionData?.session?.user;

      // 1. Delete existing custom permissions for user
      await supabase.from('admin_user_permissions').delete().eq('user_id', userId);

      // 2. Insert new individual permissions
      if (permissions.length > 0) {
        const rows = permissions.map((perm) => ({
          user_id: userId,
          permission_id: perm,
          granted_by: granter?.id || null,
        }));

        const { error } = await supabase.from('admin_user_permissions').insert(rows);
        if (error) return { success: false, error: error.message };
      }

      await this.logAdminAction('user.permissions_updated', 'users', userId, {
        permissions,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update permissions.' };
    }
  }

  /**
   * Fetch Audit Logs
   */
  async getAuditLogs(limit = 50): Promise<AdminAuditLog[]> {
    if (!isSupabaseAvailable() || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) {
        console.warn('[HotelService] Audit logs fetch error:', error?.message);
        return [];
      }

      return data as AdminAuditLog[];
    } catch (err) {
      console.warn('[HotelService] getAuditLogs exception:', err);
      return [];
    }
  }

  // ==========================================================
  // PHASE 8: PRODUCTION-READY SEO CMS & SEARCH CONSOLE
  // ==========================================================

  /**
   * Fetch Global SEO Settings with reliable fallback
   */
  async getGlobalSeo(): Promise<GlobalSeoSettings> {
    if (!isSupabaseAvailable() || !supabase) {
      return { ...FALLBACK_GLOBAL_SEO };
    }

    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_route', '__global__')
        .maybeSingle();

      if (error || !data) {
        return { ...FALLBACK_GLOBAL_SEO };
      }

      return {
        id: data.id || 'global',
        page_route: '__global__',
        page_label: data.page_label || 'Global SEO & Defaults',
        site_title: data.meta_title || FALLBACK_GLOBAL_SEO.site_title,
        default_meta_description: data.meta_description || FALLBACK_GLOBAL_SEO.default_meta_description,
        default_canonical_url: data.canonical_url || FALLBACK_GLOBAL_SEO.default_canonical_url,
        default_og_title: data.og_title || data.meta_title || FALLBACK_GLOBAL_SEO.default_og_title,
        default_og_description: data.og_description || data.meta_description || FALLBACK_GLOBAL_SEO.default_og_description,
        default_og_image: data.og_image || FALLBACK_GLOBAL_SEO.default_og_image,
        default_twitter_title: data.twitter_title || data.meta_title || FALLBACK_GLOBAL_SEO.default_twitter_title,
        default_twitter_description: data.twitter_description || data.meta_description || FALLBACK_GLOBAL_SEO.default_twitter_description,
        default_twitter_image: data.twitter_image || FALLBACK_GLOBAL_SEO.default_twitter_image,
        robots_index: data.robots_index !== undefined ? data.robots_index : true,
        robots_follow: data.robots_follow !== undefined ? data.robots_follow : true,
        google_site_verification: data.google_site_verification || null,
        updated_at: data.updated_at,
      };
    } catch (err) {
      console.warn('[HotelService] getGlobalSeo notice:', err);
      return { ...FALLBACK_GLOBAL_SEO };
    }
  }

  /**
   * Alias for getGlobalSeo to satisfy requirement getSeoSettings()
   */
  async getSeoSettings(): Promise<GlobalSeoSettings> {
    return this.getGlobalSeo();
  }

  /**
   * Fetch Page-Specific SEO Settings for a given route (e.g. '/', '/about', '/rooms')
   */
  async getPageSeo(pageRoute: string): Promise<PageSeoSettings> {
    const cleanRoute = pageRoute.startsWith('/') ? pageRoute : `/${pageRoute}`;
    const fallback = FALLBACK_PAGE_SEO[cleanRoute] || FALLBACK_PAGE_SEO['/'];

    if (!isSupabaseAvailable() || !supabase) {
      return { ...fallback };
    }

    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_route', cleanRoute)
        .maybeSingle();

      if (error || !data) {
        return { ...fallback };
      }

      return {
        id: data.id || fallback.id,
        page_route: cleanRoute as SeoPageRoute,
        page_label: data.page_label || fallback.page_label,
        meta_title: data.meta_title || fallback.meta_title,
        meta_description: data.meta_description || fallback.meta_description,
        canonical_url: data.canonical_url || fallback.canonical_url,
        og_title: data.og_title || data.meta_title || fallback.og_title,
        og_description: data.og_description || data.meta_description || fallback.og_description,
        og_image: data.og_image || fallback.og_image,
        twitter_title: data.twitter_title || data.meta_title || fallback.twitter_title,
        twitter_description: data.twitter_description || data.meta_description || fallback.twitter_description,
        twitter_image: data.twitter_image || fallback.twitter_image,
        robots_index: data.robots_index !== undefined ? data.robots_index : true,
        robots_follow: data.robots_follow !== undefined ? data.robots_follow : true,
        updated_at: data.updated_at,
      };
    } catch (err) {
      console.warn('[HotelService] getPageSeo notice:', err);
      return { ...fallback };
    }
  }

  /**
   * Fetch all 7 supported page SEO settings for Admin management
   */
  async getAllPageSeo(): Promise<PageSeoSettings[]> {
    const supportedRoutes: SeoPageRoute[] = ['/', '/about', '/rooms', '/amenities', '/gallery', '/attractions', '/contact', '/privacy'];

    if (!isSupabaseAvailable() || !supabase) {
      return supportedRoutes.map((r) => ({ ...FALLBACK_PAGE_SEO[r] }));
    }

    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .neq('page_route', '__global__');

      if (error || !data || data.length === 0) {
        return supportedRoutes.map((r) => ({ ...FALLBACK_PAGE_SEO[r] }));
      }

      const map = new Map<string, any>();
      data.forEach((d) => map.set(d.page_route, d));

      return supportedRoutes.map((route) => {
        const d = map.get(route);
        const fb = FALLBACK_PAGE_SEO[route];
        if (!d) return { ...fb };

        return {
          id: d.id || fb.id,
          page_route: route,
          page_label: d.page_label || fb.page_label,
          meta_title: d.meta_title || fb.meta_title,
          meta_description: d.meta_description || fb.meta_description,
          canonical_url: d.canonical_url || fb.canonical_url,
          og_title: d.og_title || fb.og_title,
          og_description: d.og_description || fb.og_description,
          og_image: d.og_image || fb.og_image,
          twitter_title: d.twitter_title || fb.twitter_title,
          twitter_description: d.twitter_description || fb.twitter_description,
          twitter_image: d.twitter_image || fb.twitter_image,
          robots_index: d.robots_index !== undefined ? d.robots_index : true,
          robots_follow: d.robots_follow !== undefined ? d.robots_follow : true,
          updated_at: d.updated_at,
        };
      });
    } catch (err) {
      console.warn('[HotelService] getAllPageSeo notice:', err);
      return supportedRoutes.map((r) => ({ ...FALLBACK_PAGE_SEO[r] }));
    }
  }

  /**
   * Update Global SEO Settings in Supabase and audit log
   */
  async updateGlobalSeo(updates: Partial<GlobalSeoSettings>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Database connection is not available.' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { success: false, error: 'Authentication required to update SEO.' };
    }

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.site_title !== undefined) payload.meta_title = updates.site_title;
      if (updates.default_meta_description !== undefined) payload.meta_description = updates.default_meta_description;
      if (updates.default_canonical_url !== undefined) payload.canonical_url = updates.default_canonical_url;
      if (updates.default_og_title !== undefined) payload.og_title = updates.default_og_title;
      if (updates.default_og_description !== undefined) payload.og_description = updates.default_og_description;
      if (updates.default_og_image !== undefined) payload.og_image = updates.default_og_image;
      if (updates.default_twitter_title !== undefined) payload.twitter_title = updates.default_twitter_title;
      if (updates.default_twitter_description !== undefined) payload.twitter_description = updates.default_twitter_description;
      if (updates.default_twitter_image !== undefined) payload.twitter_image = updates.default_twitter_image;
      if (updates.robots_index !== undefined) payload.robots_index = updates.robots_index;
      if (updates.robots_follow !== undefined) payload.robots_follow = updates.robots_follow;
      if (updates.google_site_verification !== undefined) payload.google_site_verification = updates.google_site_verification;

      const { error } = await supabase
        .from('seo_settings')
        .upsert(
          {
            id: 'global',
            page_route: '__global__',
            page_label: 'Global SEO & Defaults',
            ...payload,
          },
          { onConflict: 'page_route' }
        );

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction('seo.global_updated', 'seo', 'global', {
        site_title: updates.site_title,
        default_canonical_url: updates.default_canonical_url,
        google_site_verification: updates.google_site_verification ? 'configured' : 'cleared',
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update Global SEO.' };
    }
  }

  /**
   * Update Page-Level SEO Settings in Supabase and audit log
   */
  async updatePageSeo(
    pageRoute: string,
    updates: Partial<PageSeoSettings>
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable() || !supabase) {
      return { success: false, error: 'Database connection is not available.' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { success: false, error: 'Authentication required to update SEO.' };
    }

    try {
      const cleanRoute = pageRoute.startsWith('/') ? pageRoute : `/${pageRoute}`;
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.page_label !== undefined) payload.page_label = updates.page_label;
      if (updates.meta_title !== undefined) payload.meta_title = updates.meta_title;
      if (updates.meta_description !== undefined) payload.meta_description = updates.meta_description;
      if (updates.canonical_url !== undefined) payload.canonical_url = updates.canonical_url;
      if (updates.og_title !== undefined) payload.og_title = updates.og_title;
      if (updates.og_description !== undefined) payload.og_description = updates.og_description;
      if (updates.og_image !== undefined) payload.og_image = updates.og_image;
      if (updates.twitter_title !== undefined) payload.twitter_title = updates.twitter_title;
      if (updates.twitter_description !== undefined) payload.twitter_description = updates.twitter_description;
      if (updates.twitter_image !== undefined) payload.twitter_image = updates.twitter_image;
      if (updates.robots_index !== undefined) payload.robots_index = updates.robots_index;
      if (updates.robots_follow !== undefined) payload.robots_follow = updates.robots_follow;

      const fallback = FALLBACK_PAGE_SEO[cleanRoute] || FALLBACK_PAGE_SEO['/'];

      const { error } = await supabase
        .from('seo_settings')
        .upsert(
          {
            id: fallback.id,
            page_route: cleanRoute,
            page_label: fallback.page_label,
            meta_title: fallback.meta_title,
            meta_description: fallback.meta_description,
            canonical_url: fallback.canonical_url,
            ...payload,
          },
          { onConflict: 'page_route' }
        );

      if (error) {
        return { success: false, error: error.message };
      }

      await this.logAdminAction('seo.page_updated', 'seo', cleanRoute, {
        page_route: cleanRoute,
        meta_title: updates.meta_title,
        canonical_url: updates.canonical_url,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update Page SEO.' };
    }
  }

  // ==========================================================
  // PHASE 7: ANALYTICS CMS (GOOGLE ANALYTICS 4 + MS CLARITY)
  // ==========================================================

  /**
   * Get Analytics Settings from Supabase (or cached mirror)
   */
  async getAnalyticsSettings(): Promise<AnalyticsSettings> {
    if (!isSupabaseAvailable() || !supabase) {
      return this.getLocalAnalyticsFallback();
    }

    try {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error || !data) {
        return this.getLocalAnalyticsFallback();
      }

      const settings: AnalyticsSettings = {
        id: data.id || 'default',
        google_analytics_enabled: Boolean(data.google_analytics_enabled),
        google_analytics_measurement_id: (data.google_analytics_measurement_id || '').trim(),
        clarity_enabled: Boolean(data.clarity_enabled),
        clarity_project_id: (data.clarity_project_id || '').trim(),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('lotus_analytics_settings_mirror', JSON.stringify(settings));
        } catch (e) {
          // ignore localStorage error
        }
      }

      return settings;
    } catch (err) {
      console.warn('[HotelService] getAnalyticsSettings exception, using fallback:', err);
      return this.getLocalAnalyticsFallback();
    }
  }

  private getLocalAnalyticsFallback(): AnalyticsSettings {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('lotus_analytics_settings_mirror');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return {
              id: parsed.id || 'default',
              google_analytics_enabled: Boolean(parsed.google_analytics_enabled),
              google_analytics_measurement_id: (parsed.google_analytics_measurement_id || '').trim(),
              clarity_enabled: Boolean(parsed.clarity_enabled),
              clarity_project_id: (parsed.clarity_project_id || '').trim(),
              updated_at: parsed.updated_at,
            };
          }
        }
      } catch (e) {
        // ignore localStorage error
      }
    }
    return { ...FALLBACK_ANALYTICS_SETTINGS };
  }

  /**
   * Update Analytics Settings in Supabase, local cache mirror, and audit log
   */
  async updateAnalyticsSettings(updates: Partial<AnalyticsSettings>): Promise<{ success: boolean; error?: string }> {
    const current = await this.getAnalyticsSettings();
    const merged: AnalyticsSettings = {
      ...current,
      ...updates,
      google_analytics_measurement_id: updates.google_analytics_measurement_id !== undefined
        ? updates.google_analytics_measurement_id.trim()
        : current.google_analytics_measurement_id,
      clarity_project_id: updates.clarity_project_id !== undefined
        ? updates.clarity_project_id.trim()
        : current.clarity_project_id,
      updated_at: new Date().toISOString(),
    };

    // Save to local mirror immediately so public pages & UI update instantly
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lotus_analytics_settings_mirror', JSON.stringify(merged));
      } catch (e) {
        // ignore localStorage error
      }
    }

    if (!isSupabaseAvailable() || !supabase) {
      return { success: true };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { success: false, error: 'Authentication required to update Analytics.' };
    }

    try {
      const { error } = await supabase
        .from('analytics_settings')
        .upsert(
          {
            id: 'default',
            google_analytics_enabled: merged.google_analytics_enabled,
            google_analytics_measurement_id: merged.google_analytics_measurement_id,
            clarity_enabled: merged.clarity_enabled,
            clarity_project_id: merged.clarity_project_id,
            updated_at: merged.updated_at,
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('[HotelService] Supabase analytics_settings update warning (migration may be pending):', error.message);
        return { success: true };
      }

      await this.logAdminAction('analytics.updated', 'analytics', 'default', {
        google_analytics_enabled: merged.google_analytics_enabled,
        google_analytics_configured: Boolean(merged.google_analytics_measurement_id),
        clarity_enabled: merged.clarity_enabled,
        clarity_configured: Boolean(merged.clarity_project_id),
      });

      return { success: true };
    } catch (err: any) {
      return { success: true };
    }
  }

  async updateGoogleAnalytics(enabled: boolean, measurementId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateAnalyticsSettings({
      google_analytics_enabled: enabled,
      google_analytics_measurement_id: measurementId,
    });
  }

  async updateMicrosoftClarity(enabled: boolean, projectId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateAnalyticsSettings({
      clarity_enabled: enabled,
      clarity_project_id: projectId,
    });
  }

  // ==========================================================
  // CMS CONTENT MODULES (Hero Slides, Testimonials, About Story, FAQs)
  // ==========================================================

  getHeroSlidesFallback(): HeroSlideItem[] {
    return [
      {
        id: 'slide-1',
        image: '/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg',
        eyebrow: 'WHERE COMFORT MEETS TRUE HOSPITALITY',
        title: 'Experience Timeless Luxury at Lotus Grand',
        subtitle: 'A Premium Stay in the Heart of Hyderabad',
        primaryButtonText: 'Enquire Now',
        primaryButtonAction: 'enquire',
        secondaryButtonText: 'Explore Rooms',
        secondaryButtonAction: 'rooms',
      },
      {
        id: 'slide-2',
        image: '/assets/hotel-assets/rooms/img_10_hyderabad-super-townhouse-lotus-grand-photo-10.jpg',
        eyebrow: 'DESIGNED FOR YOUR COMFORT',
        title: 'Peaceful & Thoughtfully Appointed Rooms',
        subtitle: 'Clean, well-equipped accommodations in Kothapet',
        primaryButtonText: 'Enquire Now',
        primaryButtonAction: 'enquire',
        secondaryButtonText: 'Explore Rooms',
        secondaryButtonAction: 'rooms',
      },
      {
        id: 'slide-3',
        image: '/assets/hotel-assets/property/img_4_hyderabad-super-townhouse-lotus-grand-photo-4.jpg',
        eyebrow: 'WARM & COURTEOUS SERVICE',
        title: 'A Welcoming Atmosphere Every Time',
        subtitle: '24/7 Front Desk support & dedicated guest hospitality',
        primaryButtonText: 'Enquire Now',
        primaryButtonAction: 'enquire',
        secondaryButtonText: 'Explore Rooms',
        secondaryButtonAction: 'rooms',
      },
    ];
  }

  async getHeroSlides(): Promise<HeroSlideItem[]> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(HERO_SLIDES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Fallback to default
      }
    }
    return this.getHeroSlidesFallback();
  }

  async saveHeroSlides(slides: HeroSlideItem[]): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));
        window.dispatchEvent(new CustomEvent('lotus_hero_slides_updated', { detail: slides }));
      } catch {}
    }
    await this.logAdminAction('content.hero_slides_updated', 'content', 'hero-slider', { count: slides.length });
    return { success: true };
  }

  getHeroSliderHeightFallback(): HeroSliderHeightProfile {
    return 'balanced';
  }

  async getHeroSliderHeight(): Promise<HeroSliderHeightProfile> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(HERO_SLIDER_HEIGHT_KEY);
        if (raw === 'compact' || raw === 'balanced' || raw === 'cinema') {
          return raw;
        }
      } catch {}
    }
    return this.getHeroSliderHeightFallback();
  }

  async saveHeroSliderHeight(height: HeroSliderHeightProfile): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HERO_SLIDER_HEIGHT_KEY, height);
        window.dispatchEvent(new CustomEvent('lotus_hero_slider_height_updated', { detail: height }));
      } catch {}
    }
    await this.logAdminAction('content.hero_slider_height_updated', 'content', 'hero-slider', { height });
    return { success: true };
  }

  async saveTestimonials(testimonials: TestimonialItem[]): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
        window.dispatchEvent(new CustomEvent('lotus_testimonials_updated', { detail: testimonials }));
      } catch {}
    }
    await this.logAdminAction('content.testimonials_updated', 'content', 'testimonials', { count: testimonials.length });
    return { success: true };
  }

  getStoryContentFallback(): StoryContentSettings {
    return {
      aboutStoryTitle: 'Our Story',
      aboutStoryQuote: 'More Than Just a Stay, A Place to Belong',
      aboutStoryParagraphs: [
        'Lotus Grand was born from a simple idea — to create a warm and welcoming space where every guest feels at home. As a family-focused hotel in Kothapet, Hyderabad, we take pride in offering genuine hospitality, comfortable stays, and personalized service.',
        "Our journey is built on the belief that travel is more than just reaching a destination; it's about the people you meet, the experiences you cherish, and the comfort you return to. Whether you are here for business, leisure, medical visits, or a family trip, our team is always ready to make your stay special.",
        'Conveniently located in Kothapet, with easy access to key transit corridors of Hyderabad, Lotus Grand combines modern room amenities with the warmth of traditional Indian hospitality.',
      ],
      signatureText: 'Guests Arrive as Strangers, Leave as Friends —',
    };
  }

  async getStoryContent(): Promise<StoryContentSettings> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(ABOUT_STORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return { ...this.getStoryContentFallback(), ...parsed };
        }
      } catch {}
    }
    return this.getStoryContentFallback();
  }

  async saveStoryContent(content: StoryContentSettings): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ABOUT_STORY_KEY, JSON.stringify(content));
        window.dispatchEvent(new CustomEvent('lotus_about_story_updated', { detail: content }));
      } catch {}
    }
    await this.logAdminAction('content.story_updated', 'content', 'about-story', content);
    return { success: true };
  }

  getFaqsFallback(): FaqItem[] {
    const settings = getSavedSiteSettings();
    const checkIn = settings.checkInTime || fallbackSiteSettings.checkInTime;
    const checkOut = settings.checkOutTime || fallbackSiteSettings.checkOutTime;

    return [
      {
        id: 'faq-1',
        q: 'What are the check-in and check-out timings at Lotus Grand?',
        a: `Standard check-in is at ${checkIn} and check-out is at ${checkOut}. Early check-in or late check-out is subject to room availability upon arrival.`,
      },
      {
        id: 'faq-2',
        q: 'Is parking available at the hotel for guests?',
        a: 'Yes, we provide complimentary on-site parking for all staying guests.',
      },
      {
        id: 'faq-3',
        q: 'Is Wi-Fi provided in rooms and public areas?',
        a: 'Yes, complimentary high-speed Wi-Fi is available across all guest rooms and the lobby.',
      },
      {
        id: 'faq-4',
        q: 'Is the front desk open 24 hours?',
        a: 'Yes, our front desk operates 24 hours a day, 7 days a week to assist you anytime with check-in, queries, or room service.',
      },
    ];
  }

  async getFaqs(): Promise<FaqItem[]> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(FAQS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return this.getFaqsFallback();
  }

  async saveFaqs(faqs: FaqItem[]): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAQS_KEY, JSON.stringify(faqs));
        window.dispatchEvent(new CustomEvent('lotus_faqs_updated', { detail: faqs }));
      } catch {}
    }
    await this.logAdminAction('content.faqs_updated', 'content', 'faqs', { count: faqs.length });
    return { success: true };
  }

  getPrivacyNoticeFallback(): PrivacyNoticeSettings {
    const settings = getSavedSiteSettings();
    return {
      title: 'Guest Privacy Notice & Data Protection Policy',
      subtitle: 'Lotus Grand Hotel, Kothapet, Hyderabad — Safeguarding guest confidentiality, personal security, and statutory compliance.',
      lastUpdated: 'September 12, 2026',
      introText:
        'Welcome to Lotus Grand Hotel. We are committed to protecting your privacy and ensuring the confidentiality of your personal information during your stay with us and while using our online services. This Privacy Notice describes how we collect, use, store, and safeguard the information you provide to us in accordance with Indian hospitality regulations and statutory data protection standards.',
      sections: [
        {
          id: 'privacy-sec-1',
          title: '1. Information We Collect from Guests',
          badge: 'Mandatory Compliance',
          iconName: 'ShieldCheck',
          content:
            'In compliance with the Registration of Foreigners Act, Indian Foreigners Order, and local Hyderabad Police Commissionerate directives, all staying guests must present valid physical government-issued photo identification at the time of check-in.',
          bulletPoints: [
            'Full name, primary mobile phone number, and residential/business address.',
            'Government identification type and serial number (Aadhaar Card, Passport, Voter ID, or Driving License).',
            'Stay arrival and departure dates, room type preferences, and travel purpose.',
            'Vehicle registration number for guests utilizing our complimentary on-site parking.',
          ],
          displayOrder: 1,
          isActive: true,
        },
        {
          id: 'privacy-sec-2',
          title: '2. Purpose and Utilization of Personal Data',
          badge: 'Hospitality & Services',
          iconName: 'FileCheck',
          content:
            'Your personal information is used strictly to deliver an authentic, comfortable, and personalized hospitality experience at Lotus Grand.',
          bulletPoints: [
            'Processing room reservations, checking real-time room availability, and verifying registration records.',
            'Sending reservation confirmations, digital invoices, and route directions via direct WhatsApp or SMS.',
            'Coordinating front desk concierge, housekeeping services, and special guest stay preferences.',
            'Maintaining guest safety, room security, and statutory administrative guest registers mandated by local authorities.',
          ],
          displayOrder: 2,
          isActive: true,
        },
        {
          id: 'privacy-sec-3',
          title: '3. 24/7 CCTV Surveillance & Physical Security',
          badge: 'Premises Security',
          iconName: 'Eye',
          content:
            'Lotus Grand operates Closed-Circuit Television (CCTV) cameras to safeguard our guests, property, and hotel staff.',
          bulletPoints: [
            'CCTV surveillance is strictly active in public and transit zones: main entrance, reception lobby, lift lobbies, common corridors, and vehicle parking.',
            'No cameras are EVER installed inside private guest bedrooms, bathrooms, or changing areas under any circumstances.',
            'Recorded surveillance footage is stored on a secure, password-protected on-premise DVR system with strictly restricted managerial access.',
            'Footage is automatically overwritten after the statutory duration unless requested by law enforcement agencies for an official investigation.',
          ],
          displayOrder: 3,
          isActive: true,
        },
        {
          id: 'privacy-sec-4',
          title: '4. Financial & Payment Privacy Protocols',
          badge: 'Secure Billing',
          iconName: 'CreditCard',
          content:
            'We implement bank-grade transaction standards to ensure all payment methods remain completely safe and confidential.',
          bulletPoints: [
            'Card and UPI payments are processed via certified, encrypted POS terminals and licensed banking payment gateways.',
            'Lotus Grand NEVER stores, records, or logs your card CVV codes, ATM PINs, net banking passwords, or UPI MPINs.',
            'Official GST tax invoices are generated upon check-out and shared directly with the registered guest.',
          ],
          displayOrder: 4,
          isActive: true,
        },
        {
          id: 'privacy-sec-5',
          title: '5. Zero Commercial Data Selling & Confidentiality',
          badge: 'Strict Confidentiality',
          iconName: 'Lock',
          content:
            'We value guest trust above all else. Lotus Grand enforces a strict zero-telemarketing data policy.',
          bulletPoints: [
            'We NEVER sell, rent, lease, or distribute your personal contact information to third-party marketing companies, brokers, or data aggregators.',
            'Your phone number will never be added to commercial unsolicited promotional cold-calling lists.',
            'Personal data is disclosed only to statutory law enforcement authorities upon receipt of official warrants or mandated police guest register inspections.',
          ],
          displayOrder: 5,
          isActive: true,
        },
        {
          id: 'privacy-sec-6',
          title: '6. Data Retention & Secure Storage Safeguards',
          badge: 'Safe Storage',
          iconName: 'Database',
          content:
            'Guest records and identification logs are maintained in full accordance with Indian statutory hotel guest registration requirements.',
          bulletPoints: [
            'Physical registration slips are safely filed in restricted-access hotel administrative archives.',
            'Digital enquiry submissions and website reservation records are protected with SSL/TLS encryption and multi-factor admin authentication.',
            'Access is strictly restricted to verified hotel administrative personnel on a need-to-know basis.',
          ],
          displayOrder: 6,
          isActive: true,
        },
        {
          id: 'privacy-sec-7',
          title: '7. Guest Privacy Rights & Communication Preferences',
          badge: 'Your Control',
          iconName: 'UserCheck',
          content:
            'You retain full visibility and authority over your personal contact data retained by Lotus Grand.',
          bulletPoints: [
            'Request updates or corrections to any phone numbers, billing names, or email addresses on file.',
            'Opt out of occasional hotel festival greetings or special room rate updates at any time by notifying our front desk.',
            'Inquire about the nature of personal stay records retained in our front office archives.',
          ],
          displayOrder: 7,
          isActive: true,
        },
        {
          id: 'privacy-sec-8',
          title: '8. Website Cookies & Digital Analytics',
          badge: 'Digital Experience',
          iconName: 'Globe',
          content:
            'Our official website uses minimal, non-intrusive standard web cookies to deliver a smooth booking and browsing experience.',
          bulletPoints: [
            'Essential session cookies remember your navigation preferences and room viewing choices.',
            'Lightweight anonymous analytics (such as Google Analytics or Microsoft Clarity) measure aggregate page load times and device responsiveness.',
            'We do NOT use cross-website behavioral advertising trackers or persistent profiling cookies.',
            'You may easily clear or block cookies at any time through your web browser preferences without losing basic site access.',
          ],
          displayOrder: 8,
          isActive: true,
        },
      ],
      grievanceOfficer: {
        name: 'Guest Relations & Privacy Compliance Desk',
        designation: 'General Manager / Front Office Compliance',
        email: settings.email || 'info@lotusgrand.in',
        phone: settings.phoneDisplay || '090326 66941',
        address: settings.postalAddress || 'First floor, blue building, beside PVT Market Building, Kothapet, Hyderabad, Telangana 500035',
        workingHours: '10:00 AM – 7:00 PM (Monday to Saturday)',
      },
      footerNotice:
        'Lotus Grand Hotel reserves the right to periodically review and update this Privacy Notice to reflect evolving operational, statutory, or regulatory enhancements. Any changes will be posted here immediately with an updated revision date.',
    };
  }

  async getPrivacyNotice(): Promise<PrivacyNoticeSettings> {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PRIVACY_NOTICE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const fallback = this.getPrivacyNoticeFallback();
            return {
              ...fallback,
              ...parsed,
              sections: Array.isArray(parsed.sections) ? parsed.sections : fallback.sections,
              grievanceOfficer: {
                ...fallback.grievanceOfficer,
                ...(parsed.grievanceOfficer || {}),
              },
            };
          }
        }
      } catch {}
    }
    return this.getPrivacyNoticeFallback();
  }

  async savePrivacyNotice(content: PrivacyNoticeSettings): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRIVACY_NOTICE_KEY, JSON.stringify(content));
        window.dispatchEvent(new CustomEvent('lotus_privacy_notice_updated', { detail: content }));
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to save to local storage' };
      }
    }
    await this.logAdminAction('content.privacy_updated', 'content', 'privacy-notice', {
      sectionsCount: content.sections?.length || 0,
      title: content.title,
      lastUpdated: content.lastUpdated,
    });
    return { success: true };
  }

  // ==========================================================
  // RECYCLE BIN / TRASH MANAGEMENT
  // ==========================================================

  async getTrashItems(): Promise<TrashItem[]> {
    return getTrashItemsLocal();
  }

  async addToTrash(item: Omit<TrashItem, 'id' | 'deletedAt'>): Promise<TrashItem> {
    const created = addTrashItemLocal(item);
    await this.logAdminAction('trash.item_added', 'trash', item.originalId, {
      type: item.type,
      title: item.title,
    });
    return created;
  }

  async restoreTrashItem(trashId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const items = getTrashItemsLocal();
    const item = items.find((x) => x.id === trashId);
    if (!item) {
      return { success: false, error: 'Item not found in Recycle Bin.' };
    }

    try {
      switch (item.type) {
        case 'room': {
          unmarkRoomDeleted(item.originalId);
          if (item.data) {
            saveLocalUpdatedRoom(item.originalId, { ...item.data, is_active: true });
            if (isSupabaseAvailable() && supabase) {
              try {
                await supabase.from('rooms').upsert({
                  id: item.originalId,
                  title: item.data.title || item.title,
                  subtitle: item.data.subtitle || null,
                  description: item.data.description || null,
                  occupancy: item.data.occupancy || null,
                  bed_type: item.data.bed_type || null,
                  room_size: item.data.room_size || null,
                  image_url: item.data.image_url || item.image || null,
                  badge: item.data.badge || null,
                  display_order: item.data.display_order ?? 1,
                  is_active: true,
                  updated_at: new Date().toISOString(),
                });
              } catch (e) {
                console.warn('[HotelService] Supabase room restore note:', e);
              }
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_rooms_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'amenity': {
          unmarkAmenityDeleted(item.originalId);
          if (item.data) {
            saveLocalUpdatedAmenity(item.originalId, { ...item.data, is_active: true });
            if (typeof window !== 'undefined') {
              try {
                const stored = localStorage.getItem('admin_amenities_data');
                const list: AdminAmenityRecord[] = stored ? JSON.parse(stored) : [];
                const exists = list.some((a) => a.id === item.originalId);
                if (!exists) {
                  list.push({ ...item.data, is_active: true });
                } else {
                  const idx = list.findIndex((a) => a.id === item.originalId);
                  list[idx] = { ...list[idx], ...item.data, is_active: true };
                }
                localStorage.setItem('admin_amenities_data', JSON.stringify(list));
              } catch (e) {}
            }
            if (isSupabaseAvailable() && supabase) {
              try {
                await supabase.from('amenities').upsert({
                  id: item.originalId,
                  title: item.data.title || item.title,
                  description: item.data.description || null,
                  icon_name: item.data.icon_name || 'Sparkles',
                  category: item.data.category || 'basic',
                  display_order: item.data.display_order ?? 1,
                  is_active: true,
                });
              } catch (e) {
                console.warn('[HotelService] Supabase amenity restore note:', e);
              }
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_amenities_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'attraction': {
          unmarkAttractionDeleted(item.originalId);
          if (item.data) {
            saveLocalUpdatedAttraction(item.originalId, { ...item.data, is_active: true });
            if (isSupabaseAvailable() && supabase) {
              try {
                await supabase.from('attractions').upsert({
                  id: item.originalId,
                  title: item.data.title || item.title,
                  distance_approx: item.data.distance_approx || null,
                  show_distance: item.data.show_distance ?? false,
                  travel_time_approx: item.data.travel_time_approx || null,
                  description: item.data.description || null,
                  image_url: item.data.image_url || item.image || null,
                  display_order: item.data.display_order ?? 1,
                  is_active: true,
                });
              } catch (e) {
                console.warn('[HotelService] Supabase attraction restore note:', e);
              }
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_attractions_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'gallery': {
          unmarkGalleryImageDeleted(item.originalId);
          if (item.data) {
            saveLocalUpdatedGalleryItem(item.originalId, { ...item.data, is_active: true });
            if (isSupabaseAvailable() && supabase) {
              try {
                await supabase.from('gallery_images').upsert({
                  id: item.originalId,
                  category_id: item.data.category_id || 'rooms',
                  title: item.data.title || item.title || 'Gallery Image',
                  alt_text: item.data.alt_text || '',
                  image_url: item.data.image_url || item.image || '',
                  display_order: item.data.display_order ?? 1,
                  is_featured: item.data.is_featured ?? false,
                  is_active: true,
                });
              } catch (e) {
                console.warn('[HotelService] Supabase gallery restore note:', e);
              }
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_gallery_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'enquiry': {
          unmarkEnquiryDeleted(item.originalId);
          const restoredEnquiry: AdminEnquiryItem = item.data
            ? {
                id: item.data.id || item.originalId,
                full_name: item.data.full_name || item.title || 'Guest Booking Enquiry',
                phone: item.data.phone || '',
                email: item.data.email || null,
                room_preference: item.data.room_preference || null,
                arrival_date: item.data.arrival_date || item.data.arrivalDate || null,
                departure_date: item.data.departure_date || item.data.departureDate || null,
                guest_count: item.data.guest_count || item.data.guestCount || null,
                message: item.data.message || null,
                source_page: item.data.source_page || 'restored_from_recycle_bin',
                status: item.data.status || 'new',
                created_at: item.data.created_at || new Date().toISOString(),
              }
            : {
                id: item.originalId,
                full_name: item.title || 'Guest Booking Enquiry',
                phone: item.subtitle || '',
                status: 'new',
                created_at: new Date().toISOString(),
              };

          saveLocalEnquiry(restoredEnquiry);

          if (isSupabaseAvailable() && supabase) {
            try {
              await supabase.from('enquiries').upsert({
                id: restoredEnquiry.id,
                full_name: restoredEnquiry.full_name,
                phone: restoredEnquiry.phone,
                email: restoredEnquiry.email,
                room_preference: restoredEnquiry.room_preference,
                arrival_date: restoredEnquiry.arrival_date,
                departure_date: restoredEnquiry.departure_date,
                guest_count: restoredEnquiry.guest_count,
                message: restoredEnquiry.message,
                source_page: restoredEnquiry.source_page,
                status: restoredEnquiry.status,
                created_at: restoredEnquiry.created_at,
              });
            } catch (e) {
              console.warn('[HotelService] Supabase enquiry restore notice:', e);
            }
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_enquiries_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'hero_slide': {
          const slides = await this.getHeroSlides();
          const exists = slides.some((s) => s.id === item.originalId);
          if (!exists && item.data) {
            const restoredSlides = [item.data, ...slides];
            await this.saveHeroSlides(restoredSlides);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_hero_slides_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'testimonial': {
          const testimonials = await this.getTestimonials();
          const exists = testimonials.some((t) => t.id === item.originalId);
          if (!exists && item.data) {
            const restoredTestimonials = [item.data, ...testimonials];
            await this.saveTestimonials(restoredTestimonials);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_testimonials_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'faq': {
          const faqs = await this.getFaqs();
          const exists = faqs.some((f) => f.id === item.originalId);
          if (!exists && item.data) {
            const restoredFaqs = [...faqs, item.data];
            await this.saveFaqs(restoredFaqs);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_faqs_updated', { detail: item.originalId }));
          }
          break;
        }
        case 'story_paragraph': {
          const storyData = await this.getStoryContent();
          const restoredText = item.data?.text || item.title;
          if (restoredText) {
            const updatedParas = [...storyData.aboutStoryParagraphs, restoredText];
            await this.saveStoryContent({ ...storyData, aboutStoryParagraphs: updatedParas });
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_about_story_updated'));
          }
          break;
        }
        case 'privacy_section': {
          const noticeData = await this.getPrivacyNotice();
          const exists = noticeData.sections.some((s) => s.id === item.originalId);
          if (!exists && item.data) {
            const updatedSections = [...noticeData.sections, item.data];
            await this.savePrivacyNotice({ ...noticeData, sections: updatedSections });
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lotus_privacy_notice_updated'));
          }
          break;
        }
      }

      // Remove from trash list
      const remaining = items.filter((x) => x.id !== trashId);
      saveTrashItemsLocal(remaining);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lotus_trash_updated', { detail: remaining }));
      }

      await this.logAdminAction('trash.item_restored', 'trash', item.originalId, {
        type: item.type,
        title: item.title,
      });

      return {
        success: true,
        message: `"${item.title}" successfully restored from Recycle Bin!`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to restore item.' };
    }
  }

  async purgeTrashItem(trashId: string): Promise<{ success: boolean; error?: string }> {
    const items = getTrashItemsLocal();
    const item = items.find((x) => x.id === trashId);
    const remaining = items.filter((x) => x.id !== trashId);
    saveTrashItemsLocal(remaining);
    if (item) {
      await this.logAdminAction('trash.item_purged', 'trash', item.originalId, {
        type: item.type,
        title: item.title,
      });
    }
    return { success: true };
  }

  async emptyTrash(): Promise<{ success: boolean; error?: string }> {
    saveTrashItemsLocal([]);
    await this.logAdminAction('trash.bin_emptied', 'trash', 'all');
    return { success: true };
  }

  async restoreAllTrash(): Promise<{ success: boolean; count: number; error?: string }> {
    const items = getTrashItemsLocal();
    let count = 0;
    for (const item of items) {
      const res = await this.restoreTrashItem(item.id);
      if (res.success) count++;
    }
    return { success: true, count };
  }
}

export const FALLBACK_ANALYTICS_SETTINGS: AnalyticsSettings = {
  id: 'default',
  google_analytics_enabled: false,
  google_analytics_measurement_id: '',
  clarity_enabled: false,
  clarity_project_id: '',
};

export const FALLBACK_GLOBAL_SEO: GlobalSeoSettings = {
  id: 'global',
  page_route: '__global__',
  page_label: 'Global SEO & Defaults',
  site_title: 'Lotus Grand Hotel — Kothapet, Hyderabad',
  default_meta_description:
    'Official website for Lotus Grand Hotel in Kothapet / Saroornagar, Hyderabad, Telangana, India. Affordable luxury, comfortable rooms near Chaitanyapuri Metro.',
  default_canonical_url: 'https://lotusgrand.in',
  default_og_title: 'Lotus Grand Hotel — Kothapet, Hyderabad',
  default_og_description:
    'Experience premium comfort and true hospitality at Lotus Grand Hotel, beside PVT Market Building, Kothapet, Hyderabad.',
  default_og_image: '/assets/rooms/deluxe-room.webp',
  default_twitter_title: 'Lotus Grand Hotel — Kothapet, Hyderabad',
  default_twitter_description:
    'Experience premium comfort and true hospitality at Lotus Grand Hotel, Kothapet, Hyderabad.',
  default_twitter_image: '/assets/rooms/deluxe-room.webp',
  robots_index: true,
  robots_follow: true,
  google_site_verification: null,
};

export const FALLBACK_PAGE_SEO: Record<string, PageSeoSettings> = {
  '/': {
    id: 'home',
    page_route: '/',
    page_label: 'Home',
    meta_title: 'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    meta_description:
      'Welcome to Lotus Grand Hotel in Kothapet, Hyderabad. Conveniently located near Chaitanyapuri Metro Station and PVT Market with premium rooms and hospitality.',
    canonical_url: 'https://lotusgrand.in/',
    og_title: 'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    og_description:
      'Experience comfortable luxury rooms and modern amenities at Lotus Grand Hotel, Hyderabad.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    twitter_description:
      'Experience comfortable luxury rooms and modern amenities at Lotus Grand Hotel, Hyderabad.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/about': {
    id: 'about',
    page_route: '/about',
    page_label: 'About Us',
    meta_title: 'About Us | Lotus Grand Hotel Kothapet, Hyderabad',
    meta_description:
      'Discover our story, dedication to true hospitality, and commitment to exceptional guest comfort at Lotus Grand Hotel in Kothapet, Hyderabad.',
    canonical_url: 'https://lotusgrand.in/about',
    og_title: 'About Lotus Grand Hotel | Hospitality in Hyderabad',
    og_description:
      'Discover the comfort, story, and values of Lotus Grand Hotel in Kothapet, Hyderabad.',
    og_image: '/assets/rooms/suite-room.webp',
    twitter_title: 'About Lotus Grand Hotel | Hospitality in Hyderabad',
    twitter_description:
      'Discover the comfort, story, and values of Lotus Grand Hotel in Kothapet, Hyderabad.',
    twitter_image: '/assets/rooms/suite-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/rooms': {
    id: 'rooms',
    page_route: '/rooms',
    page_label: 'Rooms',
    meta_title: 'Rooms & Suites | Lotus Grand Hotel Kothapet, Hyderabad',
    meta_description:
      'Explore our spacious Executive, Deluxe, and Suite rooms at Lotus Grand Hotel with air conditioning, free Wi-Fi, and 24/7 room service.',
    canonical_url: 'https://lotusgrand.in/rooms',
    og_title: 'Rooms & Accommodations | Lotus Grand Hotel',
    og_description:
      'Book your stay in elegant, well-appointed rooms at Lotus Grand Hotel, Kothapet, Hyderabad.',
    og_image: '/assets/rooms/executive-room.webp',
    twitter_title: 'Rooms & Accommodations | Lotus Grand Hotel',
    twitter_description:
      'Book your stay in elegant, well-appointed rooms at Lotus Grand Hotel, Kothapet, Hyderabad.',
    twitter_image: '/assets/rooms/executive-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/amenities': {
    id: 'amenities',
    page_route: '/amenities',
    page_label: 'Amenities',
    meta_title: 'Hotel & Room Amenities | Lotus Grand Hotel Hyderabad',
    meta_description:
      'Enjoy 24/7 room service, high-speed Wi-Fi, elevator access, power backup, CCTV security, and ample parking at Lotus Grand Hotel in Kothapet.',
    canonical_url: 'https://lotusgrand.in/amenities',
    og_title: 'Amenities & Services | Lotus Grand Hotel Hyderabad',
    og_description:
      'Modern conveniences and thoughtful hospitality amenities at Lotus Grand Hotel.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Amenities & Services | Lotus Grand Hotel Hyderabad',
    twitter_description:
      'Modern conveniences and thoughtful hospitality amenities at Lotus Grand Hotel.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/gallery': {
    id: 'gallery',
    page_route: '/gallery',
    page_label: 'Gallery',
    meta_title: 'Photo Gallery | Lotus Grand Hotel Kothapet, Hyderabad',
    meta_description:
      'Browse photos of our hotel rooms, luxury suites, reception, and guest facilities at Lotus Grand Hotel in Hyderabad.',
    canonical_url: 'https://lotusgrand.in/gallery',
    og_title: 'Photo Gallery | Lotus Grand Hotel',
    og_description:
      'Visual tour of our hotel accommodations and facilities at Lotus Grand Hotel, Kothapet.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Photo Gallery | Lotus Grand Hotel',
    twitter_description:
      'Visual tour of our hotel accommodations and facilities at Lotus Grand Hotel, Kothapet.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/attractions': {
    id: 'attractions',
    page_route: '/attractions',
    page_label: 'Attractions',
    meta_title: 'Nearby Attractions & Transit | Lotus Grand Hotel Hyderabad',
    meta_description:
      'Explore Hyderabad landmarks near Lotus Grand: Chaitanyapuri Metro, Saroornagar Lake, Charminar, Ramoji Film City, and Rajiv Gandhi Airport.',
    canonical_url: 'https://lotusgrand.in/attractions',
    og_title: 'Nearby Attractions & Landmarks | Lotus Grand Hotel',
    og_description:
      'Discover Hyderabad attractions easily accessible from Lotus Grand Hotel in Kothapet.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Nearby Attractions & Landmarks | Lotus Grand Hotel',
    twitter_description:
      'Discover Hyderabad attractions easily accessible from Lotus Grand Hotel in Kothapet.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/contact': {
    id: 'contact',
    page_route: '/contact',
    page_label: 'Contact Us',
    meta_title: 'Contact & Location | Lotus Grand Hotel Kothapet, Hyderabad',
    meta_description:
      'Get in touch with Lotus Grand Hotel. Located beside PVT Market Building, Saroornagar, HUDA Complex, Kothapet, Hyderabad. Call +91 90326 66941.',
    canonical_url: 'https://lotusgrand.in/contact',
    og_title: 'Contact Lotus Grand Hotel | Reservations & Location',
    og_description:
      'Connect with our 24/7 front desk for bookings and location inquiries at Lotus Grand Hotel.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Contact Lotus Grand Hotel | Reservations & Location',
    twitter_description:
      'Connect with our 24/7 front desk for bookings and location inquiries at Lotus Grand Hotel.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
  '/privacy': {
    id: 'privacy',
    page_route: '/privacy',
    page_label: 'Privacy Notice',
    meta_title: 'Guest Privacy Notice & Policies | Lotus Grand Hotel Hyderabad',
    meta_description:
      'Learn about guest privacy standards, CCTV security policies, statutory ID registration, and guest confidentiality at Lotus Grand Hotel, Kothapet, Hyderabad.',
    canonical_url: 'https://lotusgrand.in/privacy',
    og_title: 'Guest Privacy Notice & Policies | Lotus Grand Hotel',
    og_description:
      'Our commitment to guest confidentiality, personal security, and data protection at Lotus Grand Hotel.',
    og_image: '/assets/rooms/deluxe-room.webp',
    twitter_title: 'Guest Privacy Notice & Policies | Lotus Grand Hotel',
    twitter_description:
      'Our commitment to guest confidentiality, personal security, and data protection at Lotus Grand Hotel.',
    twitter_image: '/assets/rooms/deluxe-room.webp',
    robots_index: true,
    robots_follow: true,
  },
};

export const hotelService = new HotelDataService();

