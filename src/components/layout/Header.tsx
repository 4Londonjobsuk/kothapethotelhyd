import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPage } from '../../types';
import { LotusLogo } from '../common/LotusLogo';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useBodyScrollLock } from '../common/MotionWrapper';
import { initiatePhoneCall } from '../../utils/callUtils';

interface HeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenEnquiry,
}) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      // Color changes only after scrolling past half the page (50% of viewport height)
      const halfPageThreshold = window.innerHeight * 0.5;
      setIsScrolled(window.scrollY > halfPageThreshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile/tablet menu on resize or device rotation to wide screen (>= 1024px)
  useEffect(() => {
    const handleDeviceRotateOrResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleDeviceRotateOrResize, { passive: true });
    window.addEventListener('orientationchange', handleDeviceRotateOrResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleDeviceRotateOrResize);
      window.removeEventListener('orientationchange', handleDeviceRotateOrResize);
    };
  }, [mobileMenuOpen]);

  const navItems: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-[#071324]/96 backdrop-blur-md shadow-2xl py-3 border-b border-[#C59A47]/30'
          : 'bg-gradient-to-b from-black/75 via-black/35 to-transparent py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <LotusLogo
            variant="inverted"
            onClick={() => handleNavClick('home')}
            className="cursor-pointer transition-opacity hover:opacity-90 active:scale-98"
          />

          {/* Desktop Navigation (Visible on Large Tablet Landscape & Desktop) */}
          <nav
            id="desktop-navigation"
            aria-label="Main Navigation"
            className="hidden lg:flex items-center space-x-5 xl:space-x-8"
          >
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-sm font-medium transition-colors py-1 cursor-pointer ${
                    isActive
                      ? 'text-[#E0C37B] font-semibold drop-shadow'
                      : 'text-white/85 hover:text-[#E0C37B]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId={shouldReduceMotion ? undefined : 'activeNavIndicator'}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E0C37B] rounded-full shadow-[0_0_8px_rgba(224,195,123,0.85)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Action Button (Desktop & Tablet Landscape) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={() => initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay)}
              className="px-3.5 py-2 rounded-full border border-[#E0C37B]/40 hover:border-[#E0C37B] bg-black/20 hover:bg-black/40 text-white text-xs flex items-center gap-2 transition-all cursor-pointer group"
              title="Click to call or view quick contact options"
            >
              <Phone className="w-3.5 h-3.5 text-[#E0C37B] group-hover:scale-110 transition-transform" />
              <span className="font-serif font-medium tracking-wide">{siteSettings.phoneDisplay}</span>
            </button>
            <button
              id="header-enquire-btn"
              onClick={onOpenEnquiry}
              className="btn-gold-luxury px-5 py-2.5 rounded-full text-xs flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[#081220]" />
              <span>Book Stay</span>
            </button>
          </div>

          {/* Mobile & Tablet Portrait Menu Toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-white hover:text-[#E0C37B] hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C59A47] active:scale-95 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-black/60 backdrop-blur-xs z-30"
              aria-hidden="true"
            />

            {/* Sliding Drawer (Responsive: 1 col on mobile phone, 2 cols on tablet/landscape) */}
            <motion.div
              id="mobile-navigation-drawer"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bg-[#071324]/98 backdrop-blur-xl border-b border-[#C59A47]/30 shadow-2xl px-5 sm:px-8 pt-4 pb-6 space-y-4 z-40 max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                {navItems.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`text-left py-3 px-3.5 text-base font-medium rounded-lg transition-colors cursor-pointer active:scale-[0.99] flex items-center justify-between ${
                        isActive
                          ? 'text-[#E0C37B] bg-white/10 font-semibold border-l-2 border-[#E0C37B]'
                          : 'text-stone-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E0C37B]" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEnquiry();
                  }}
                  className="btn-gold-luxury w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#081220]" />
                  <span>Book Stay</span>
                </button>

                <a
                  href={`tel:${siteSettings.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay);
                  }}
                  className="btn-navy-luxury w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#E0C37B]" />
                  <span>Direct Call: {siteSettings.phoneDisplay}</span>
                </a>

                <a
                  href={`https://wa.me/${siteSettings.whatsAppNumber}?text=${encodeURIComponent(
                    'Hello Lotus Grand Front Desk, I would like to inquire about room booking and availability.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 transition-colors cursor-pointer sm:col-span-2 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Chat on WhatsApp ({siteSettings.phoneDisplay})</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
