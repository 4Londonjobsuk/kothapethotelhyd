export type NavPage = 'home' | 'about' | 'rooms' | 'amenities' | 'attractions' | 'gallery' | 'contact' | 'privacy';

export interface SiteSettings {
  hotelName: string;
  tagline: string;
  subTagline: string;
  cityArea: string;
  stateCountry: string;
  fullLocation: string;
  postalAddress: string;
  secondaryAddressNote: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  isEmailVerified: boolean;
  whatsAppNumber: string;
  checkInTime: string;
  checkOutTime: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  googleMapsPlaceUrl?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  totalRooms?: number;
  googleHotelUrl?: string;
  makeMyTripUrl?: string;
  goibiboUrl?: string;
  ixigoUrl?: string;
  oyoUrl?: string;
}

export interface TransitItem {
  id: string;
  name: string;
  distance: string;
  duration: string;
  type: 'metro' | 'bus' | 'train' | 'airport' | 'lake';
  iconName?: string;
  description?: string;
}

export interface NearbyFoodItem {
  name: string;
  distance: string;
  type: string;
}

export interface RoomItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  rateLabel: string;
  specs: {
    bed: string;
    wifi: string;
    tv: string;
    ac: string;
    capacity?: string;
    size?: string;
  };
  amenities: string[];
  isVerifiedInventory: boolean;
  statusNote?: string;
}

export type AmenityCategory =
  | 'basic'
  | 'general'
  | 'health'
  | 'room'
  | 'safety'
  | 'common'
  | 'core'
  | 'additional'
  | string;

export interface AmenityItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  image?: string;
  category: AmenityCategory;
  categoryLabel?: string;
  verifiedNote?: string;
}

export interface AttractionItem {
  id: string;
  name: string;
  distanceKm?: number;
  distanceDisplay?: string;
  showDistance?: boolean;
  tagline: string;
  description: string;
  image: string;
  locationArea: string;
  isApproved: boolean;
}

export type GalleryCategory =
  | 'Rooms'
  | 'Property'
  | 'Dining'
  | 'Hyderabad'
  | 'Common Areas'
  | 'Exterior';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;
  alt: string;
}

export interface TestimonialItem {
  id: string;
  guestName: string;
  city?: string;
  timeAgo?: string;
  source?: string;
  rating: number;
  travelerType?: string;
  quote: string;
  ratingsBreakdown?: {
    rooms?: number;
    service?: number;
    location?: number;
  };
  highlights?: string;
}

export interface GuestCommitmentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export type HeroSliderHeightProfile = 'compact' | 'balanced' | 'cinema';

export interface HeroSlideItem {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonAction?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  display_order?: number;
}

export interface StoryContentSettings {
  aboutStoryTitle: string;
  aboutStoryQuote: string;
  aboutStoryParagraphs: string[];
  signatureText: string;
}

export interface EnquirySubmission {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  roomPreference?: string;
  arrivalDate?: string;
  departureDate?: string;
  guestCount?: string;
  sourcePage?: string;
}

export type TrashItemType =
  | 'room'
  | 'amenity'
  | 'attraction'
  | 'gallery'
  | 'enquiry'
  | 'hero_slide'
  | 'testimonial'
  | 'faq'
  | 'story_paragraph'
  | 'privacy_section';

export interface TrashItem {
  id: string;
  originalId: string;
  type: TrashItemType;
  title: string;
  subtitle?: string;
  image?: string;
  deletedAt: string;
  deletedBy?: string;
  data: any;
}

export type AdminPage =
  | 'dashboard'
  | 'images'
  | 'rooms'
  | 'amenities'
  | 'attractions'
  | 'gallery'
  | 'enquiries'
  | 'content'
  | 'trash'
  | 'users'
  | 'seo'
  | 'settings'
  | 'privacy';

export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'ENQUIRY_ADMIN';

export type AdminApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type AdminPermission =
  | 'users.view'
  | 'users.approve'
  | 'users.manage'
  | 'images.view'
  | 'images.upload'
  | 'images.replace'
  | 'images.delete'
  | 'rooms.view'
  | 'rooms.manage'
  | 'amenities.view'
  | 'amenities.manage'
  | 'attractions.view'
  | 'attractions.manage'
  | 'gallery.view'
  | 'gallery.manage'
  | 'enquiries.view'
  | 'enquiries.manage'
  | 'content.view'
  | 'content.manage'
  | 'seo.view'
  | 'seo.manage'
  | 'analytics.view'
  | 'analytics.manage'
  | 'settings.view'
  | 'settings.manage'
  | 'trash.view'
  | 'trash.manage';

export interface AdminProfile {
  id: string;
  email: string;
  full_name?: string | null;
  status: AdminApprovalStatus;
  roles: AdminRole[];
  permissions: string[];
  isSuperAdmin: boolean;
  created_at?: string;
  last_sign_in_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  notes?: string | null;
}

export interface AdminAuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  module: string;
  target_id?: string | null;
  details?: Record<string, any>;
  created_at: string;
}

export interface AdminEnquiryItem {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  room_preference?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  guest_count?: string | null;
  message?: string | null;
  source_page?: string;
  status: 'new' | 'contacted' | 'confirmed' | 'closed';
  created_at: string;
}

export interface StorageAssetItem {
  name: string;
  url: string;
  path: string;
  size?: number;
  updated_at?: string;
  folder: string;
}

export interface AdminRoomRecord {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  occupancy?: string | null;
  bed_type?: string | null;
  room_size?: string | null;
  image_url?: string | null;
  badge?: string | null;
  display_order: number;
  is_active: boolean;
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AdminAmenityRecord {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  category: AmenityCategory;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface AdminAttractionRecord {
  id: string;
  title: string;
  distance_approx?: string | null;
  show_distance?: boolean;
  travel_time_approx?: string | null;
  description?: string | null;
  highlights?: string[];
  timings?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface AdminGalleryItem {
  id: string;
  category_id: string;
  category_label?: string;
  title: string;
  alt_text: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AdminCategoryItem {
  id: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export type SeoPageRoute = '/' | '/about' | '/rooms' | '/amenities' | '/gallery' | '/attractions' | '/contact' | '/privacy';

export interface PrivacySection {
  id: string;
  title: string;
  badge?: string;
  iconName?: string;
  content: string;
  bulletPoints?: string[];
  displayOrder?: number;
  isActive: boolean;
}

export interface PrivacyNoticeSettings {
  title: string;
  subtitle: string;
  lastUpdated: string;
  introText: string;
  sections: PrivacySection[];
  grievanceOfficer: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    address: string;
    workingHours: string;
  };
  footerNotice: string;
}

export interface GlobalSeoSettings {
  id: string;
  page_route: '__global__';
  page_label: string;
  site_title: string;
  default_meta_description: string;
  default_canonical_url: string;
  default_og_title: string;
  default_og_description: string;
  default_og_image: string;
  default_twitter_title: string;
  default_twitter_description: string;
  default_twitter_image: string;
  robots_index: boolean;
  robots_follow: boolean;
  google_site_verification?: string | null;
  updated_at?: string;
}

export interface PageSeoSettings {
  id: string;
  page_route: SeoPageRoute;
  page_label: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  robots_index: boolean;
  robots_follow: boolean;
  updated_at?: string;
}

export interface AnalyticsSettings {
  id: string;
  google_analytics_enabled: boolean;
  google_analytics_measurement_id: string;
  clarity_enabled: boolean;
  clarity_project_id: string;
  created_at?: string;
  updated_at?: string;
}

