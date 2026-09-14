import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteSettings } from '../../data/hotelData';
import { initiatePhoneCall } from '../../utils/callUtils';
import { Phone, ArrowRight, Sparkles } from 'lucide-react';
import { NavPage } from '../../types';

interface PreFooterBannerProps {
  type?: 'home' | 'about' | 'rooms' | 'amenities' | 'gallery' | 'attractions';
  onNavigate?: (page: NavPage) => void;
  onOpenEnquiry?: () => void;
}

export const PreFooterBanner: React.FC<PreFooterBannerProps> = ({
  type = 'home',
  onNavigate,
  onOpenEnquiry,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const content = {
    home: {
      eyebrow: 'MAKE YOUR NEXT STAY SPECIAL',
      title: 'Ready to Book Your Stay?',
      description: 'Experience refined hospitality, spotless comfort, and attentive service in the heart of Hyderabad.',
      hasPhone: true,
      buttonText: 'Enquire Now',
      action: onOpenEnquiry,
      sideNote: 'Comfort · Stays Brighter · Journeys',
    },
    about: {
      eyebrow: 'WE LOOK FORWARD TO WELCOMING YOU',
      title: 'Come Stay With Us',
      description: 'Discover warm hospitality and a truly memorable experience at Lotus Grand.',
      hasPhone: true,
      buttonText: 'View Suites & Rooms',
      action: () => onNavigate && onNavigate('rooms'),
      sideNote: 'Warm South Indian Hospitality',
    },
    rooms: {
      eyebrow: 'YOUR PERFECT RETREAT AWAITS',
      title: 'Reserve Your Room Today',
      description: 'Experience pristine comfort, modern amenities, and prompt service at Lotus Grand.',
      hasPhone: true,
      buttonText: 'Reserve Room',
      action: onOpenEnquiry,
      sideNote: 'Best Direct Rate Guaranteed',
    },
    amenities: {
      eyebrow: 'YOUR COMFORT IS OUR HIGHEST PRIORITY',
      title: 'Enjoy a Truly Comfortable Stay',
      description: "From 24/7 room service to high-speed Wi-Fi, we cater to your every travel need.",
      hasPhone: true,
      buttonText: 'Enquire Now',
      action: onOpenEnquiry,
      sideNote: '24/7 Dedicated Concierge',
    },
    gallery: {
      eyebrow: 'EXPERIENCE THE ELEGANCE',
      title: 'Come See It for Yourself',
      description:
        'Immaculate suites, welcoming lounges, and unforgettable hospitality await you.',
      hasPhone: true,
      buttonText: 'Plan Your Visit',
      action: onOpenEnquiry,
      sideNote: 'Prime Kothapet Location',
    },
    attractions: {
      eyebrow: 'EXPLORE HYDERABAD WITH EASE',
      title: "We're Delighted to Help You Plan Your Visit",
      description:
        'Our front desk team is always delighted to recommend iconic landmarks, local bazaars, and effortless travel routes.',
      hasPhone: true,
      buttonText: 'Enquire Now',
      action: onOpenEnquiry,
      sideNote: 'Convenient Transit Access',
    },
  }[type];

  return (
    <section
      id={`pre-footer-banner-${type}`}
      className="relative bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#EFE7D8] text-[#0C192E] overflow-hidden py-14 md:py-18 border-t border-b border-[#D8BE7E]/40"
    >
      {/* Soft Ambient Warm Champagne Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(224,195,123,0.18),transparent_75%)] pointer-events-none" />

      {/* Delicate Architectural Gold Hairline Accent at Top Center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1.5px] bg-gradient-to-r from-transparent via-[#C59A47] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
        >
          {/* Left Editorial Header */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C5E13]" />
              <span className="text-[11px] font-serif font-bold tracking-[0.24em] text-[#8C5E13] uppercase">
                {content.eyebrow}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#0C192E] tracking-tight leading-tight">
              {content.title}
            </h2>

            {content.description && (
              <p className="mt-3 text-sm sm:text-base text-[#4A5568] font-light leading-relaxed max-w-xl">
                {content.description}
              </p>
            )}
          </div>

          {/* Right Action Block */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
            {content.hasPhone && (
              <a
                href={`tel:${siteSettings.phone}`}
                onClick={(e) => {
                  e.preventDefault();
                  initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay);
                }}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full bg-white/95 border border-[#D4B055]/50 hover:border-[#8C5E13] hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
                title="Click to call or view quick contact options"
              >
                <div className="w-9 h-9 rounded-full bg-[#E0C37B]/20 flex items-center justify-center text-[#8C5E13] group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left pr-1">
                  <span className="block text-[10px] font-medium tracking-wider uppercase text-[#718096]">
                    Call Us Anytime
                  </span>
                  <span className="text-sm font-semibold tracking-wide text-[#0C192E] group-hover:text-[#8C5E13] transition-colors">
                    {siteSettings.phoneDisplay}
                  </span>
                </div>
              </a>
            )}

            <button
              onClick={content.action}
              className="px-7 sm:px-8 py-3.5 rounded-full font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-[#091526] hover:bg-[#12233C] border border-[#E0C37B]/40 shadow-[0_4px_16px_rgba(9,21,38,0.22)] hover:shadow-[0_6px_22px_rgba(9,21,38,0.32)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
            >
              <span>{content.buttonText}</span>
              <ArrowRight className="w-4 h-4 text-[#E0C37B]" />
            </button>

            {content.sideNote && (
              <div className="hidden xl:block text-right border-l border-[#C59A47]/40 pl-6 text-xs text-[#718096] font-light leading-5 italic">
                {content.sideNote}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
