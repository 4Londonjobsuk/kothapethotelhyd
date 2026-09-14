import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavPage, PrivacyNoticeSettings, PrivacySection } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { hotelService } from '../../services/hotelService';
import {
  ShieldCheck,
  Lock,
  Eye,
  CreditCard,
  FileCheck,
  Database,
  UserCheck,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  HelpCircle,
  Share2,
  Sparkles,
} from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate, onOpenEnquiry }) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  const [privacyData, setPrivacyData] = useState<PrivacyNoticeSettings>(() =>
    hotelService.getPrivacyNoticeFallback()
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    hotelService.getPrivacyNotice().then((data) => {
      if (isMounted && data) {
        setPrivacyData(data);
      }
    });

    const handleUpdated = (e: CustomEvent<PrivacyNoticeSettings>) => {
      if (isMounted && e.detail) {
        setPrivacyData(e.detail);
      }
    };

    window.addEventListener('lotus_privacy_notice_updated', handleUpdated as EventListener);
    return () => {
      isMounted = false;
      window.removeEventListener('lotus_privacy_notice_updated', handleUpdated as EventListener);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Section icon resolver
  const renderSectionIcon = (iconName?: string, index: number = 0) => {
    const iconClass = 'w-5 h-5 text-[#E0C37B]';
    switch (iconName?.toLowerCase()) {
      case 'shieldcheck':
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      case 'filecheck':
      case 'file':
        return <FileCheck className={iconClass} />;
      case 'eye':
      case 'cctv':
        return <Eye className={iconClass} />;
      case 'creditcard':
      case 'payment':
        return <CreditCard className={iconClass} />;
      case 'lock':
      case 'security':
        return <Lock className={iconClass} />;
      case 'database':
      case 'storage':
        return <Database className={iconClass} />;
      case 'usercheck':
      case 'user':
        return <UserCheck className={iconClass} />;
      case 'globe':
      case 'cookie':
        return <Globe className={iconClass} />;
      default:
        // Cyclic fallback icons
        const fallbacks = [
          <ShieldCheck className={iconClass} key="1" />,
          <FileCheck className={iconClass} key="2" />,
          <Eye className={iconClass} key="3" />,
          <CreditCard className={iconClass} key="4" />,
          <Lock className={iconClass} key="5" />,
          <Database className={iconClass} key="6" />,
          <UserCheck className={iconClass} key="7" />,
          <Globe className={iconClass} key="8" />,
        ];
        return fallbacks[index % fallbacks.length];
    }
  };

  const activeSections = (privacyData.sections || []).filter((s) => s.isActive !== false);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-800 pb-20">
      {/* 1. HERO HEADER */}
      <PageHeader
        title={privacyData.title || 'Guest Privacy Notice'}
        subtitle={privacyData.subtitle || 'Lotus Grand Hotel, Kothapet — Commitment to Confidentiality & Guest Data Protection'}
        breadcrumbs={[
          { label: 'Home', page: 'home' },
          { label: 'Privacy Notice' },
        ]}
        onNavigate={onNavigate}
      />

      {/* 2. SUB-HERO INFO BAR & QUICK UTILITIES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-[#0A1830] text-stone-200 rounded-2xl p-4 sm:p-6 shadow-xl border border-[#E0C37B]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#071122] border border-[#E0C37B]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#E0C37B]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0C37B] font-semibold">
                  Official Policy Revision
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-xs text-stone-300">
                  Effective: <strong className="text-white font-medium">{privacyData.lastUpdated || 'Current'}</strong>
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-light">
                Governed by Indian Hospitality Laws & Information Technology Standards
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto print:hidden">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E2244] hover:bg-[#132c58] text-xs text-stone-200 border border-[#E0C37B]/20 transition-colors cursor-pointer"
              title="Copy Page Link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#E0C37B]" />
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E2244] hover:bg-[#132c58] text-xs text-stone-200 border border-[#E0C37B]/20 transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5 text-[#E0C37B]" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* LEFT SIDEBAR: Table of Contents & Quick Contact (Sticky) */}
          <aside className="lg:col-span-4 space-y-6 print:hidden">
            <div className="sticky top-24 space-y-6">
              {/* Quick Navigation Menu */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-100">
                  <FileText className="w-4 h-4 text-[#C59A47]" />
                  <h3 className="font-serif text-sm font-bold text-stone-900 tracking-wide uppercase">
                    Notice Sections
                  </h3>
                </div>

                <nav className="space-y-1.5">
                  {activeSections.map((sec, idx) => (
                    <button
                      key={sec.id || idx}
                      onClick={() => scrollToSection(sec.id || `section-${idx}`)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer ${
                        activeSectionId === (sec.id || `section-${idx}`)
                          ? 'bg-[#0D1E3A] text-[#E0C37B] font-medium shadow-sm'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <span className="truncate pr-2">{sec.title}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          activeSectionId === (sec.id || `section-${idx}`)
                            ? 'text-[#E0C37B] translate-x-0.5'
                            : 'text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  ))}

                  <button
                    onClick={() => scrollToSection('grievance-desk')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#997328] hover:bg-[#FDF8EB] transition-all flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span>Grievance Officer & Contact</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </nav>
              </div>

              {/* Security Reassurance Box */}
              <div className="bg-gradient-to-br from-[#0B1526] to-[#070F1C] text-stone-200 rounded-2xl p-5 sm:p-6 shadow-md border border-[#E0C37B]/30 space-y-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#0E2244] border border-[#E0C37B]/40 flex items-center justify-center text-[#E0C37B]">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#E0C37B]">
                  100% Confidentiality Guarantee
                </h4>
                <p className="text-xs text-stone-300/85 leading-relaxed">
                  We never sell, trade, or share your contact number or personal identification with commercial telemarketers or third-party advertising companies.
                </p>
                <div className="pt-2 border-t border-stone-800 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Statutory Safe Guest Registration</span>
                </div>
              </div>

              {/* Direct Booking Helpline */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                  Questions regarding stay policies?
                </span>
                <a
                  href={`tel:${siteSettings.phone}`}
                  className="inline-flex items-center gap-2 text-stone-900 hover:text-[#C59A47] font-serif font-bold text-base transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C59A47]" />
                  <span>{siteSettings.phoneDisplay}</span>
                </a>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Our front desk manager is available 24 hours a day to address guest requests and confidentiality inquiries.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN COLUMN: Full Policy Text */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Introduction / Preamble Card */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF8EB] border border-[#E0C37B]/40 text-[#997328] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guest Trust & Privacy Mandate</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                Protecting Guest Data & Honoring Your Peace of Mind
              </h2>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                {privacyData.introText ||
                  'Welcome to Lotus Grand Hotel. We are committed to protecting your privacy and ensuring the confidentiality of your personal information during your stay with us and while using our online services.'}
              </p>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-600 leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#C59A47] shrink-0 mt-0.5" />
                <span>
                  This policy applies to all resident guests, walk-in visitors, direct website reservations, and telephone inquiries facilitated at Lotus Grand Hotel (Beside PVT Market, Kothapet, Hyderabad).
                </span>
              </div>
            </motion.div>

            {/* Structured Sections List */}
            <div className="space-y-6">
              {activeSections.map((sec, idx) => (
                <motion.section
                  id={sec.id || `section-${idx}`}
                  key={sec.id || idx}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 hover:border-[#E0C37B]/40 transition-all scroll-mt-28"
                >
                  {/* Section Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 mb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0D1E3A] flex items-center justify-center shrink-0">
                        {renderSectionIcon(sec.iconName, idx)}
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                        {sec.title}
                      </h3>
                    </div>

                    {sec.badge && (
                      <span className="self-start sm:self-auto text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-[#F4EFE6] text-[#7A5B18] border border-[#E0C37B]/30">
                        {sec.badge}
                      </span>
                    )}
                  </div>

                  {/* Section Description */}
                  <div className="text-stone-700 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                    {sec.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Bullet Points (If Any) */}
                  {Array.isArray(sec.bulletPoints) && sec.bulletPoints.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-100/80">
                      <ul className="space-y-2">
                        {sec.bulletPoints.map((point, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C59A47] shrink-0 mt-2" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.section>
              ))}
            </div>

            {/* Grievance Officer & Contact Desk Card */}
            <motion.section
              id="grievance-desk"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-[#071122] to-[#0A1830] text-stone-200 rounded-2xl p-6 sm:p-8 shadow-lg border border-[#E0C37B]/40 space-y-6 scroll-mt-28"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2244] border border-[#E0C37B]/40 flex items-center justify-center text-[#E0C37B]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                      Grievance Redressal & Privacy Contact
                    </h3>
                    <p className="text-xs text-stone-400">
                      Direct escalation desk for data inquiries, updates, or clarification
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0C37B] bg-[#0E2244] px-3 py-1 rounded-full border border-[#E0C37B]/30">
                  Compliance Desk
                </span>
              </div>

              {/* Officer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#081324] border border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Designated Compliance Officer
                  </span>
                  <p className="text-white font-serif font-bold text-sm">
                    {privacyData.grievanceOfficer?.name || 'Guest Relations & Privacy Compliance Officer'}
                  </p>
                  <p className="text-stone-400 text-xs">
                    {privacyData.grievanceOfficer?.designation || 'General Manager / Front Office Compliance'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081324] border border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Response Timings & Working Hours
                  </span>
                  <div className="flex items-center gap-2 text-stone-200 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#E0C37B]" />
                    <span>{privacyData.grievanceOfficer?.workingHours || '10:00 AM – 7:00 PM (Mon - Sat)'}</span>
                  </div>
                  <p className="text-[11px] text-stone-400">Queries acknowledged within 24 business hours</p>
                </div>

                <div className="p-4 rounded-xl bg-[#081324] border border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Official Privacy Email
                  </span>
                  <a
                    href={`mailto:${privacyData.grievanceOfficer?.email || siteSettings.email}`}
                    className="inline-flex items-center gap-2 text-[#E0C37B] hover:text-[#FDE8A5] font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{privacyData.grievanceOfficer?.email || siteSettings.email}</span>
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-[#081324] border border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Official Telephone Helpline
                  </span>
                  <a
                    href={`tel:${privacyData.grievanceOfficer?.phone || siteSettings.phone}`}
                    className="inline-flex items-center gap-2 text-[#E0C37B] hover:text-[#FDE8A5] font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{privacyData.grievanceOfficer?.phone || siteSettings.phoneDisplay}</span>
                  </a>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-[#081324] border border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Physical Postal Address for Formal Notices
                  </span>
                  <div className="flex items-start gap-2 text-stone-300 text-xs leading-relaxed pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E0C37B] shrink-0 mt-0.5" />
                    <span>{privacyData.grievanceOfficer?.address || siteSettings.postalAddress}</span>
                  </div>
                </div>
              </div>

              {/* Footer Policy Disclaimer */}
              <div className="pt-4 border-t border-stone-800 text-xs text-stone-400 leading-relaxed font-light">
                <p>
                  {privacyData.footerNotice ||
                    'Lotus Grand Hotel reserves the right to periodically review and update this Privacy Notice to reflect evolving operational, statutory, or regulatory enhancements. Continued use of our hotel facilities or website indicates acceptance of the terms outlined herein.'}
                </p>
              </div>
            </motion.section>

            {/* Bottom Reservation Assistance CTA */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-5 print:hidden">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  Ready to experience true hospitality at Lotus Grand?
                </h4>
                <p className="text-xs sm:text-sm text-stone-500">
                  Book direct for best rates, priority early check-in, and zero hidden surcharges.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate('rooms')}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-serif font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Explore Rooms
                </button>
                <button
                  onClick={() => onOpenEnquiry && onOpenEnquiry()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FDE8A5] via-[#E4C277] to-[#B98E34] text-[#050C17] text-xs font-serif font-bold tracking-wider uppercase shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Reserve Stay
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};
