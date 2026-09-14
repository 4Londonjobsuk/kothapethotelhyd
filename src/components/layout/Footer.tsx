import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavPage } from '../../types';
import { LotusLogo } from '../common/LotusLogo';
import { initiatePhoneCall } from '../../utils/callUtils';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import {
  MapPin,
  Phone,
  Navigation,
  X,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

type PolicyModalType = 'guest-policy' | 'privacy' | 'cancellation' | null;

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenEnquiry }) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyModalType>(null);

  const quickLinks: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const accommodationHighlights = [
    { label: 'Wi-Fi', page: 'amenities' as NavPage },
    { label: 'Room Service', page: 'amenities' as NavPage },
    { label: 'Air Conditioning', page: 'amenities' as NavPage },
    { label: 'Power Backup', page: 'amenities' as NavPage },
    { label: 'Daily Housekeeping & Fresh Linens', page: 'amenities' as NavPage },
    { label: '100% Power Backup & Geyser', page: 'amenities' as NavPage },
    { label: 'CCTV in common areas', page: 'amenities' as NavPage },
  ];

  const handleLinkClick = (page: NavPage) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="relative bg-[#050B15] text-stone-300 overflow-hidden border-t border-[#E0C37B]/20">
      {/* MAIN FOOTER ARCHITECTURE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 relative z-10">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start pb-6 sm:pb-8 border-b border-[#E0C37B]/15"
        >
          {/* Column 1: The Crest & Brand Narrative */}
          <div className="space-y-3.5">
            <LotusLogo
              variant="stacked"
              size="md"
              onClick={() => handleLinkClick('home')}
              className="transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
            />

            <p className="text-xs sm:text-[13px] text-stone-300/85 font-light leading-relaxed">
              A boutique haven of warmth and refined hospitality in Kothapet, Hyderabad. Thoughtfully designed for discerning business executives, vacationing families, and city travelers seeking immaculate comfort.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <div className="pb-2 mb-3.5 border-b border-[#E0C37B]/20">
              <h3 className="text-xs font-serif font-bold tracking-[0.2em] text-[#E0C37B] uppercase">
                Navigation
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="group flex items-center gap-2 text-stone-400 hover:text-[#E0C37B] transition-colors duration-200 cursor-pointer block text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#E0C37B]/50 group-hover:text-[#E0C37B] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hospitality & Stay */}
          <div>
            <div className="pb-2 mb-3.5 border-b border-[#E0C37B]/20">
              <h3 className="text-xs font-serif font-bold tracking-[0.2em] text-[#E0C37B] uppercase">
                Hospitality & Stay
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {accommodationHighlights.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(item.page)}
                    className="group flex items-center gap-2 text-stone-400 hover:text-[#E0C37B] transition-colors duration-200 cursor-pointer text-left block"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#E0C37B]/50 group-hover:text-[#E0C37B] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Reservations & Location */}
          <div className="space-y-3">
            <div className="pb-2 mb-3.5 border-b border-[#E0C37B]/20">
              <h3 className="text-xs font-serif font-bold tracking-[0.2em] text-[#E0C37B] uppercase">
                Reservations & Desk
              </h3>
            </div>

            {/* Direct Calling & Action Box */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#0A1628] to-[#07101E] border border-[#E0C37B]/25 shadow-inner space-y-2.5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#E0C37B] font-serif font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Front Desk (24/7)
                </p>
                <a
                  href={`tel:${siteSettings.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay);
                  }}
                  className="text-white hover:text-[#E0C37B] font-serif text-base sm:text-lg font-bold tracking-wide flex items-center gap-2 transition-colors cursor-pointer group"
                  title="Click to call or view quick contact options"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E0C37B] group-hover:scale-110 transition-transform shrink-0" />
                  <span>{siteSettings.phoneDisplay}</span>
                </a>
              </div>

              {/* Action Buttons: WhatsApp & Reserve Stay */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/90">
                <a
                  href={`https://wa.me/${siteSettings.whatsAppNumber.replace('+', '')}?text=${encodeURIComponent(
                    'Hi i am looking for Room'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#05271B] hover:bg-[#073625] border border-emerald-500/40 hover:border-emerald-400 text-xs font-semibold text-emerald-100 hover:text-white transition-all shadow-xs group cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current text-[#25D366] shrink-0"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="truncate">WhatsApp</span>
                </a>
                <button
                  id="footer-enquire-btn"
                  onClick={onOpenEnquiry}
                  className="py-1.5 px-2 rounded-lg font-serif text-xs font-bold tracking-wider uppercase text-[#050C17] bg-gradient-to-r from-[#FDE8A5] via-[#E4C277] to-[#B98E34] hover:from-[#FFF0B8] hover:to-[#CA9B3C] shadow-[0_2px_10px_rgba(224,195,123,0.25)] hover:shadow-[0_4px_14px_rgba(224,195,123,0.38)] active:scale-98 transition-all duration-300 cursor-pointer truncate"
                >
                  Reserve Stay
                </button>
              </div>
            </div>

            {/* Address with Google Maps Link */}
            <div className="flex items-start gap-2 text-xs text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-[#E0C37B] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="text-stone-300/90 text-xs block">
                  Beside PVT Market Building, HUDA Complex, Kothapet, Hyderabad 500035
                </span>
                <div className="mt-1">
                  <a
                    href={siteSettings.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#E0C37B] hover:text-[#FDE8A5] underline underline-offset-4 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. REFINED LEGAL & CREST BAR */}
        <div className="pt-5 pb-1 flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <div className="flex items-center gap-2 text-stone-400">
            <span className="font-serif font-bold text-white tracking-wider">LOTUS GRAND</span>
            <span className="text-stone-600">•</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          {/* Interactive Policy Modal Triggers */}
          <div className="flex items-center space-x-5 text-stone-400">
            <button
              onClick={() => setActivePolicyModal('guest-policy')}
              className="hover:text-[#E0C37B] transition-colors cursor-pointer"
            >
              Guest & Stay Policy
            </button>
            <span className="text-stone-600">•</span>
            <button
              onClick={() => setActivePolicyModal('cancellation')}
              className="hover:text-[#E0C37B] transition-colors cursor-pointer"
            >
              Cancellation Guidelines
            </button>
            <span className="text-stone-600">•</span>
            <button
              onClick={() => handleLinkClick('privacy')}
              className="hover:text-[#E0C37B] transition-colors cursor-pointer"
            >
              Privacy Notice
            </button>
            <span className="text-stone-600">•</span>
            <a
              href="/admin/login"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'admin/login';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }}
              className="hover:text-[#E0C37B] text-stone-500 transition-colors"
            >
              Admin Portal
            </a>
          </div>

          <p className="text-stone-400 text-center md:text-right font-light">
            A Premium Stay in Kothapet, Hyderabad
          </p>
        </div>
      </div>

      {/* 4. GUEST POLICY MODAL DIALOG */}
      {activePolicyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActivePolicyModal(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#071324] border border-[#E0C37B]/40 rounded-2xl p-6 sm:p-8 text-stone-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#E0C37B]" />
                <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                  {activePolicyModal === 'guest-policy' && 'Guest Policies & Check-in Standards'}
                  {activePolicyModal === 'cancellation' && 'Cancellation & Reservation Guidelines'}
                  {activePolicyModal === 'privacy' && 'Guest Privacy Notice'}
                </h4>
              </div>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs sm:text-sm text-stone-300/90 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {activePolicyModal === 'guest-policy' && (
                <>
                  <p>
                    <strong className="text-white">Check-in / Check-out:</strong> Standard Check-in is at 12:00 PM and Check-out is at 11:00 AM. Early check-in or late check-out is subject to room availability upon prior request.
                  </p>
                  <p>
                    <strong className="text-white">Valid Government ID:</strong> As mandated by statutory regulations, all adult guests must present a valid physical government-issued photo ID (Aadhaar Card, Passport, or Driving License) at the time of check-in.
                  </p>
                  <p>
                    <strong className="text-white">Visitor Policy:</strong> In the interest of resident guest security, non-registered visitors are kindly requested to meet guests at the main lobby lounge.
                  </p>
                </>
              )}

              {activePolicyModal === 'cancellation' && (
                <>
                  <p>
                    <strong className="text-white">Flexible Schedule Modification:</strong> We understand travel plans can change. Please notify our 24/7 Front Desk at least 24 hours prior to standard check-in time for any schedule modifications.
                  </p>
                  <p>
                    <strong className="text-white">Direct Booking Advantage:</strong> Guests booking directly with Lotus Grand enjoy priority rescheduling assistance and zero hidden processing surcharges.
                  </p>
                </>
              )}

              {activePolicyModal === 'privacy' && (
                <>
                  <p>
                    <strong className="text-white">Guest Information Confidentiality:</strong> Lotus Grand strictly respects your privacy. Contact details collected during reservation are used exclusively to coordinate your stay and hospitality services.
                  </p>
                  <p>
                    <strong className="text-white">Zero Third-Party Sharing:</strong> Your personal data is never shared, rented, or distributed to outside marketing agencies.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider bg-gradient-to-r from-[#FDE8A5] to-[#E4C277] text-[#050B15] transition-all cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
