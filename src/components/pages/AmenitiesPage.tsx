import React, { useState, useEffect, useMemo } from 'react';
import { NavPage, AmenityItem } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { amenitiesData, verifiedHotelPolicies } from '../../data/hotelData';
import { hotelService } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import {
  Wifi,
  AirVent,
  Bell,
  Utensils,
  Car,
  ConciergeBell,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Bath,
  Tv,
  CheckCircle2,
  Ban,
  CreditCard,
  Globe2,
  Droplets,
  Flame,
  Laptop,
  HeartPulse,
  Luggage,
  UserCheck,
  Building2,
  Shield,
  Activity,
  Home,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AmenitiesPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

export const AmenitiesPage: React.FC<AmenitiesPageProps> = ({
  onNavigate,
  onOpenEnquiry,
}) => {
  const [amenities, setAmenities] = useState<AmenityItem[]>(() => amenitiesData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showStandardsSection, setShowStandardsSection] = useState<boolean>(() =>
    hotelService.getStandardsSectionVisibility()
  );
  const [isSectionCollapsed, setIsSectionCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const handleVisibilityUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ visible: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.visible === 'boolean') {
        setShowStandardsSection(customEvent.detail.visible);
      }
    };
    window.addEventListener('hotel_standards_visibility_changed', handleVisibilityUpdate);
    return () => {
      window.removeEventListener('hotel_standards_visibility_changed', handleVisibilityUpdate);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    hotelService
      .getAmenities()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setAmenities(data);
        }
      })
      .catch((err) => {
        console.warn('[AmenitiesPage] Error loading amenities, keeping fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getIcon = (iconName: string, iconClass: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Wifi':
        return <Wifi className={iconClass} />;
      case 'AirVent':
      case 'Wind':
        return <AirVent className={iconClass} />;
      case 'ConciergeBell':
        return <ConciergeBell className={iconClass} />;
      case 'Zap':
      case 'Power':
        return <Zap className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Car':
        return <Car className={iconClass} />;
      case 'Globe2':
        return <Globe2 className={iconClass} />;
      case 'Luggage':
      case 'Briefcase':
        return <Luggage className={iconClass} />;
      case 'UserCheck':
        return <UserCheck className={iconClass} />;
      case 'HeartPulse':
      case 'Cross':
        return <HeartPulse className={iconClass} />;
      case 'Droplets':
        return <Droplets className={iconClass} />;
      case 'Bath':
        return <Bath className={iconClass} />;
      case 'Laptop':
        return <Laptop className={iconClass} />;
      case 'ShieldCheck':
      case 'Shield':
        return <ShieldCheck className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Clock':
        return <Clock className={iconClass} />;
      case 'Bell':
        return <Bell className={iconClass} />;
      case 'Utensils':
      case 'UtensilsCrossed':
        return <Utensils className={iconClass} />;
      case 'Tv':
        return <Tv className={iconClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const categoryMeta: { id: string; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'all',
      label: 'All Facilities',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      description: 'Comprehensive overview of all verified facilities at Hotel Lotus Grand.',
    },
    {
      id: 'basic',
      label: 'Basic Facilities',
      icon: <Building2 className="w-3.5 h-3.5" />,
      description: 'Core hospitality essentials ensuring continuous connectivity, cooling, power, and comfort.',
    },
    {
      id: 'general',
      label: 'General Services',
      icon: <Globe2 className="w-3.5 h-3.5" />,
      description: 'Dedicated guest support with multilingual staff, luggage handling, and 24/7 care.',
    },
    {
      id: 'health',
      label: 'Health & Wellness',
      icon: <Activity className="w-3.5 h-3.5" />,
      description: 'Guest health assurance, equipped first-aid services, and emergency readiness.',
    },
    {
      id: 'room',
      label: 'Room Amenities',
      icon: <Home className="w-3.5 h-3.5" />,
      description: 'In-room provisions including sealed mineral water, toiletries, and business work desk.',
    },
    {
      id: 'safety',
      label: 'Safety & Security',
      icon: <Shield className="w-3.5 h-3.5" />,
      description: '24/7 continuous CCTV monitoring and certified fire safety prevention across all floors.',
    },
    {
      id: 'common',
      label: 'Common Area',
      icon: <Clock className="w-3.5 h-3.5" />,
      description: 'Welcoming 24/7 front desk and shared spaces designed for seamless check-in and leisure.',
    },
  ];

  // Helper to normalize category mapping for legacy data
  const normalizeCategory = (cat: string) => {
    if (cat === 'core') return 'basic';
    if (cat === 'additional') return 'general';
    return cat;
  };

  // Filter amenities by selected category
  const filteredAmenities = useMemo(() => {
    if (selectedCategory === 'all') return amenities;
    return amenities.filter((item) => normalizeCategory(item.category) === selectedCategory);
  }, [amenities, selectedCategory]);

  // Active categories: strictly omit/delete any category with 0 amenities
  const activeCategories = useMemo(() => {
    return categoryMeta.filter((cat) => {
      if (cat.id === 'all') {
        return amenities.length > 0;
      }
      const count = amenities.filter((a) => normalizeCategory(a.category) === cat.id).length;
      return count > 0;
    });
  }, [amenities]);

  // Automatically reset category if current selection has 0 amenities
  useEffect(() => {
    if (selectedCategory !== 'all') {
      const count = amenities.filter((a) => normalizeCategory(a.category) === selectedCategory).length;
      if (count === 0) {
        setSelectedCategory('all');
      }
    }
  }, [amenities, selectedCategory]);

  // Grouped amenities by category for structured layout
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: AmenityItem[] } = {};
    categoryMeta.forEach((cat) => {
      if (cat.id !== 'all') {
        groups[cat.id] = amenities.filter((item) => normalizeCategory(item.category) === cat.id);
      }
    });
    return groups;
  }, [amenities]);

  // Quick icon badges strip
  const quickAssurances = [
    { title: 'Wi-Fi', icon: <Wifi className="w-4 h-4 text-[#C5A059]" /> },
    { title: 'Air Conditioning', icon: <AirVent className="w-4 h-4 text-[#C5A059]" /> },
    { title: 'Power Backup', icon: <Zap className="w-4 h-4 text-[#C5A059]" /> },
    { title: 'Room Service', icon: <ConciergeBell className="w-4 h-4 text-[#C5A059]" /> },
    { title: 'Housekeeping', icon: <Sparkles className="w-4 h-4 text-[#C5A059]" /> },
    { title: '24/7 Reception', icon: <Clock className="w-4 h-4 text-[#C5A059]" /> },
  ];

  return (
    <div id="amenities-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="amenities"
        eyebrow="Thoughtful Comforts & Services"
        title="Hotel Amenities & Facilities"
        subtitle="Curated comforts, verified facilities, and seamless conveniences for every guest in Kothapet, Hyderabad."
        scriptText="Relax Recharge Belong"
        bgImage="/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. QUICK ASSURANCE STRIP */}
      <div className="bg-white border-b border-stone-200/80 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickAssurances.map((qa, i) => (
              <div
                key={i}
                className="flex items-center justify-center sm:justify-start gap-2.5 py-2 px-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs font-medium text-stone-800 hover:border-amber-300 transition-colors"
              >
                {qa.icon}
                <span className="whitespace-nowrap font-medium text-stone-700">{qa.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CATEGORY TABS (Search removed, 0-count categories omitted) */}
      <section className="pt-10 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start md:justify-center overflow-x-auto pb-3 scrollbar-none border-b border-stone-200">
          <div className="flex items-center gap-2">
            {activeCategories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? amenities.length
                  : amenities.filter((a) => normalizeCategory(a.category) === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#0D1E3A] text-white shadow-sm ring-1 ring-[#0D1E3A]'
                      : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:border-stone-300'
                  }`}
                >
                  <span className={isSelected ? 'text-[#C5A059]' : 'text-stone-400'}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isSelected
                        ? 'bg-[#C5A059]/25 text-[#FFF5A5]'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRIMARY AMENITIES DISPLAY */}
      <section id="amenities-primary-grid" className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {selectedCategory === 'all' ? (
          // Grouped Display by Official Hospitality Standards
          <div className="space-y-16">
            {activeCategories
              .filter((cat) => cat.id !== 'all')
              .map((cat) => {
                const items = groupedByCategory[cat.id] || [];
                if (items.length === 0) return null;

                return (
                  <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-24">
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 mb-6 border-b border-stone-200/90">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#9E7C32]">
                          {cat.icon}
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#0D1E3A]">
                            {cat.label}
                          </h3>
                          <p className="text-xs text-stone-500 font-light mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#9E7C32] bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                        {items.length} {items.length === 1 ? 'Amenity' : 'Amenities'}
                      </span>
                    </div>

                    {/* Grid of Icon Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 transition-all duration-300 border border-stone-200/90 flex flex-col justify-between h-full group relative overflow-hidden"
                        >
                          {/* Accent Top Bar */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div>
                            {/* Distinctive Icon Badge */}
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/80 flex items-center justify-center text-[#9E7C32] shadow-xs group-hover:bg-[#0D1E3A] group-hover:text-amber-300 group-hover:border-[#0D1E3A] group-hover:scale-105 transition-all duration-300 mb-5">
                              {getIcon(item.iconName, 'w-6 h-6')}
                            </div>

                            {/* Amenity Title */}
                            <h4 className="text-lg font-serif font-semibold text-[#0D1E3A] group-hover:text-[#9E7C32] transition-colors mb-2">
                              {item.title}
                            </h4>

                            {/* Description */}
                            <p className="text-xs text-stone-600 font-light leading-relaxed mb-4">
                              {item.description}
                            </p>
                          </div>

                          {/* Footer Info */}
                          <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                            <span className="capitalize font-medium text-stone-600">
                              {item.categoryLabel || cat.label}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          // Filtered Display for selected category
          <div>
            {/* Filter status description */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs text-stone-500">
                Showing{' '}
                <span className="font-semibold text-stone-800">{filteredAmenities.length}</span>{' '}
                {filteredAmenities.length === 1 ? 'amenity' : 'amenities'} in{' '}
                <span className="font-semibold text-stone-800">
                  {categoryMeta.find((c) => c.id === selectedCategory)?.label}
                </span>
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-[#9E7C32] hover:underline font-medium cursor-pointer"
              >
                View All Facilities
              </button>
            </div>

            {filteredAmenities.length > 0 ? (
              <StaggerContainer
                staggerDelay={0.06}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredAmenities.map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 transition-all duration-300 border border-stone-200/90 flex flex-col justify-between h-full group relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div>
                        {/* Distinctive Icon Badge */}
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/80 flex items-center justify-center text-[#9E7C32] shadow-xs group-hover:bg-[#0D1E3A] group-hover:text-amber-300 group-hover:border-[#0D1E3A] group-hover:scale-105 transition-all duration-300 mb-5">
                          {getIcon(item.iconName, 'w-6 h-6')}
                        </div>

                        {/* Amenity Title */}
                        <h4 className="text-lg font-serif font-semibold text-[#0D1E3A] group-hover:text-[#9E7C32] transition-colors mb-2">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-stone-600 font-light leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="capitalize font-medium text-stone-600">
                          {item.categoryLabel ||
                            categoryMeta.find((c) => c.id === normalizeCategory(item.category))
                              ?.label ||
                            'Verified Facility'}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <h4 className="text-base font-serif font-medium text-stone-800">
                  No amenities found in this category
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Select &ldquo;All Facilities&rdquo; to view all available hotel amenities.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-[#0D1E3A] text-white rounded-xl hover:bg-[#1A2E4C] transition-colors cursor-pointer"
                >
                  View All Facilities
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. HOTEL ASSURANCE & ESSENTIAL SPECIFICATIONS (Clean Icon Cards with Show/Hide Facility) */}
      {showStandardsSection && (
        <section className="py-12 bg-white border-y border-stone-200/80 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-100">
              <FadeIn className="max-w-2xl">
                <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
                  HOSPITALITY STANDARDS
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-medium text-[#0D1E3A]">
                  In-Room Standards & Guest Policies
                </h3>
                <div className="w-12 h-0.5 bg-[#C5A059] my-2.5" />
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Transparent, verified policies and specifications for a worry-free stay at Lotus Grand.
                </p>
              </FadeIn>

              {/* Show / Hide Toggle Button on Page */}
              <button
                onClick={() => setIsSectionCollapsed((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                title={isSectionCollapsed ? 'Expand Standards and Policies' : 'Hide Standards and Policies'}
              >
                {isSectionCollapsed ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Show Standards & Policies</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    <span>Hide Standards & Policies</span>
                  </>
                )}
              </button>
            </div>

            {!isSectionCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {/* In-Room Comfort Spec */}
                <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-stone-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#9E7C32]">
                      <Home className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-semibold text-stone-900 text-sm">
                      In-Room Comforts
                    </h4>
                  </div>
                  <ul className="space-y-2.5 text-xs text-stone-600 font-light">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Individually controlled Air Conditioning in all rooms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Complimentary packaged drinking mineral water daily</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Spacious work desk with ergonomic chair & bedside charging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Wall-mounted flat-screen TV with entertainment channels</span>
                    </li>
                  </ul>
                </div>

                {/* Bathroom & Hygiene */}
                <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-stone-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#9E7C32]">
                      <Bath className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-semibold text-stone-900 text-sm">
                      Bath & Personal Care
                    </h4>
                  </div>
                  <ul className="space-y-2.5 text-xs text-stone-600 font-light">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Private attached bathroom with continuous hot & cold shower</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Complimentary toiletries: sanitized soap, shampoo & fresh towels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Daily thorough room housekeeping & linen refresh</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Equipped first-aid medical support readily on-site</span>
                    </li>
                  </ul>
                </div>

                {/* Safety & Easy Payment */}
                <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-stone-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#9E7C32]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-semibold text-stone-900 text-sm">
                      Safety & Flexibility
                    </h4>
                  </div>
                  <ul className="space-y-2.5 text-xs text-stone-600 font-light">
                    <li className="flex items-start gap-2">
                      <Ban className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>100% Smoke-Free guest rooms for fresh, healthy air</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>24/7 CCTV surveillance and verified fire extinguishers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>24/7 reception desk & multilingual staff (Telugu, Hindi, English)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Payments accepted: {verifiedHotelPolicies.paymentModes.join(', ')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="amenities"
        onNavigate={onNavigate}
        onOpenEnquiry={onOpenEnquiry}
      />
    </div>
  );
};
