import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPage, RoomItem, AdminPage } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { RoomsPage } from './components/pages/RoomsPage';
import { AmenitiesPage } from './components/pages/AmenitiesPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { AttractionsPage } from './components/pages/AttractionsPage';
import { ContactPage } from './components/pages/ContactPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { EnquiryModal } from './components/common/EnquiryModal';
import { CallActionModal } from './components/common/CallActionModal';
import { initiatePhoneCall } from './utils/callUtils';
import { useSiteSettings } from './hooks/useSiteSettings';
import { ArrowUp, Phone, Loader2, ShieldAlert } from 'lucide-react';
import { hotelService } from './services/hotelService';

// Admin CMS Components
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminThemeProvider } from './components/admin/AdminThemeContext';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { AdminImagesPage } from './components/admin/AdminImagesPage';
import { AdminRoomsPage } from './components/admin/AdminRoomsPage';
import { AdminAmenitiesPage } from './components/admin/AdminAmenitiesPage';
import { AdminAttractionsPage } from './components/admin/AdminAttractionsPage';
import { AdminGalleryPage } from './components/admin/AdminGalleryPage';
import { AdminEnquiriesPage } from './components/admin/AdminEnquiriesPage';
import { AdminUsersPage } from './components/admin/AdminUsersPage';
import { AdminSeoPage } from './components/admin/AdminSeoPage';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';
import { AdminContentPage } from './components/admin/AdminContentPage';
import { AdminPrivacyPage } from './components/admin/AdminPrivacyPage';
import { AdminTrashPage } from './components/admin/AdminTrashPage';
import { AdminAccessStatePage } from './components/admin/AdminAccessStatePage';
import { AdminProfile, AdminPermission } from './types';
import { useSeoHead } from './components/SeoHead';
import { AnalyticsTracker } from './components/AnalyticsTracker';

export default function App() {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryRoomName, setEnquiryRoomName] = useState<string | undefined>(undefined);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Admin CMS Routing & Auth State
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Dynamic document.head SEO Synchronization
  useSeoHead(currentPage, isAdminRoute);

  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const [isProfileRefreshing, setIsProfileRefreshing] = useState(false);

  const fetchProfile = async (user: any) => {
    if (!user) {
      setAdminProfile(null);
      return;
    }
    setIsProfileRefreshing(true);
    try {
      const profile = await hotelService.getAdminProfile(user.id);
      setAdminProfile(profile);
    } catch (err) {
      console.warn('[App] fetchProfile error:', err);
    } finally {
      setIsProfileRefreshing(false);
    }
  };

  // Route & Auth Synchronization
  useEffect(() => {
    const evaluateRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      const isPathAdmin = path.startsWith('/admin');
      const isHashAdmin = hash.startsWith('#admin');

      if (isPathAdmin || isHashAdmin) {
        setIsAdminRoute(true);

        let sub = 'dashboard';
        if (isHashAdmin) {
          const parts = hash.replace(/^#admin\/?/, '').split('/');
          if (parts[0]) sub = parts[0];
        } else if (isPathAdmin) {
          const parts = path.replace(/^\/admin\/?/, '').split('/');
          if (parts[0]) sub = parts[0];
        }

        const validAdminPages: AdminPage[] = [
          'dashboard',
          'images',
          'rooms',
          'amenities',
          'attractions',
          'gallery',
          'content',
          'privacy',
          'enquiries',
          'trash',
          'users',
          'seo',
          'settings',
        ];

        if (validAdminPages.includes(sub as AdminPage)) {
          setAdminPage(sub as AdminPage);
        } else {
          setAdminPage('dashboard');
        }
      } else {
        setIsAdminRoute(false);
        const cleanHash = window.location.hash.replace('#', '') as NavPage;
        const validPages: NavPage[] = [
          'home',
          'about',
          'rooms',
          'amenities',
          'attractions',
          'gallery',
          'contact',
          'privacy',
        ];
        if (validPages.includes(cleanHash)) {
          setCurrentPage(cleanHash);
        }
      }
    };

    evaluateRoute();

    // Check initial admin auth session
    hotelService.getAdminUser().then(async (user) => {
      setAdminUser(user);
      if (user) {
        await fetchProfile(user);
      }
      setAdminAuthLoading(false);
    });

    const unsubscribe = hotelService.onAdminAuthStateChange(async (user) => {
      setAdminUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setAdminProfile(null);
      }
      setAdminAuthLoading(false);
    });

    const handleOpenCallModalEvent = () => {
      setIsCallModalOpen(true);
    };

    window.addEventListener('hashchange', evaluateRoute);
    window.addEventListener('popstate', evaluateRoute);
    window.addEventListener('lotus:open-call-modal', handleOpenCallModalEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', evaluateRoute);
      window.removeEventListener('popstate', evaluateRoute);
      window.removeEventListener('lotus:open-call-modal', handleOpenCallModalEvent);
    };
  }, []);

  // Track scroll position for Back to Top button with rotation and resize support
  useEffect(() => {
    const checkScroll = () => {
      // Responsive threshold: 100px in landscape or mobile, 150px in desktop
      const isLandscape = window.matchMedia('(orientation: landscape) and (max-height: 550px)').matches;
      setShowScrollTop(window.scrollY > (isLandscape ? 80 : 130));
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    window.addEventListener('orientationchange', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('orientationchange', checkScroll);
    };
  }, []);

  const handleNavigate = (page: NavPage) => {
    setIsAdminRoute(false);
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNavigate = (page: AdminPage) => {
    setAdminPage(page);
    window.location.hash = `admin/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await hotelService.adminLogout();
    setAdminUser(null);
    window.location.hash = 'admin/login';
  };

  const handleOpenEnquiry = (roomName?: string) => {
    setEnquiryRoomName(roomName);
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
    setEnquiryRoomName(undefined);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsAppUrl = `https://wa.me/${siteSettings.whatsAppNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hi i am looking for Room'
  )}`;

  // ==========================================================
  // RENDER ADMIN CMS VIEW
  // ==========================================================
  if (isAdminRoute) {
    if (adminAuthLoading || (adminUser && !adminProfile && isProfileRefreshing)) {
      return (
        <div className="min-h-screen bg-[#070E1A] flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs uppercase tracking-widest font-sans">Verifying Admin Access...</span>
        </div>
      );
    }

    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={async (user) => {
            setAdminUser(user);
            await fetchProfile(user);
            handleAdminNavigate('dashboard');
          }}
          onNavigateHome={() => handleNavigate('home')}
        />
      );
    }

    // Check approval status: If not APPROVED, show security access state screen
    if (adminProfile && adminProfile.status !== 'APPROVED') {
      return (
        <AdminAccessStatePage
          profile={adminProfile}
          onRefresh={() => fetchProfile(adminUser)}
          onLogout={handleAdminLogout}
          onViewPublicSite={() => handleNavigate('home')}
          isRefreshing={isProfileRefreshing}
        />
      );
    }

    const canAccess = (perm?: AdminPermission): boolean => {
      if (!adminProfile) return false;
      if (adminProfile.isSuperAdmin) return true;
      if (!perm) return true;
      return adminProfile.permissions.includes(perm);
    };

    const renderAccessDenied = (required: string) => (
      <div className="p-8 max-w-lg mx-auto my-12 bg-[#0B1526] border border-rose-900/50 rounded-2xl text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-serif font-medium text-stone-100">Access Restricted</h2>
          <p className="text-xs text-stone-400">
            Your role does not have permission to view or manage this administrative module.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[#070E1A] border border-stone-800 text-[11px] font-mono text-stone-400">
          Required permission: <span className="text-[#E0C37B]">{required}</span>
        </div>
        <div>
          <button
            onClick={() => handleAdminNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 text-xs font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );

    return (
      <AdminThemeProvider>
        <AnalyticsTracker currentPage={currentPage} isAdminRoute={true} />
        <AdminLayout
          currentPage={adminPage}
          onNavigate={handleAdminNavigate}
          onLogout={handleAdminLogout}
          onViewPublicSite={() => handleNavigate('home')}
          adminEmail={adminUser.email}
          profile={adminProfile}
        >
          {adminPage === 'dashboard' && (
            <AdminDashboardPage onNavigate={handleAdminNavigate} adminEmail={adminUser.email} />
          )}
          {adminPage === 'images' && (
            canAccess('images.view') ? <AdminImagesPage /> : renderAccessDenied('images.view')
          )}
          {adminPage === 'rooms' && (
            canAccess('rooms.view') ? <AdminRoomsPage /> : renderAccessDenied('rooms.view')
          )}
          {adminPage === 'amenities' && (
            canAccess('amenities.view') ? <AdminAmenitiesPage /> : renderAccessDenied('amenities.view')
          )}
          {adminPage === 'attractions' && (
            canAccess('attractions.view') ? <AdminAttractionsPage /> : renderAccessDenied('attractions.view')
          )}
          {adminPage === 'gallery' && (
            canAccess('gallery.view') ? <AdminGalleryPage /> : renderAccessDenied('gallery.view')
          )}
          {adminPage === 'content' && (
            canAccess('content.view') ? <AdminContentPage /> : renderAccessDenied('content.view')
          )}
          {adminPage === 'privacy' && (
            canAccess('content.view') ? <AdminPrivacyPage /> : renderAccessDenied('content.view')
          )}
          {adminPage === 'enquiries' && (
            canAccess('enquiries.view') ? <AdminEnquiriesPage /> : renderAccessDenied('enquiries.view')
          )}
          {adminPage === 'trash' && (
            canAccess('trash.view') ? (
              <AdminTrashPage onNavigate={handleAdminNavigate} />
            ) : (
              renderAccessDenied('trash.view')
            )
          )}
          {adminPage === 'users' && (
            canAccess('users.manage') ? (
              <AdminUsersPage currentAdminProfile={adminProfile} />
            ) : (
              renderAccessDenied('users.manage (Super Admin Only)')
            )
          )}
          {adminPage === 'seo' && (
            (canAccess('seo.manage') || canAccess('analytics.manage')) ? (
              <AdminSeoPage />
            ) : (
              renderAccessDenied('seo.manage or analytics.manage')
            )
          )}
          {adminPage === 'settings' && (
            canAccess('settings.manage') ? <AdminSettingsPage /> : renderAccessDenied('settings.manage')
          )}
        </AdminLayout>
      </AdminThemeProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-stone-800 font-sans selection:bg-[#0D1E3A] selection:text-white">
      {/* Dynamic Third-Party Analytics (GA4 + Microsoft Clarity) */}
      <AnalyticsTracker currentPage={currentPage} isAdminRoute={false} />

      {/* Primary Sticky Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenEnquiry={() => handleOpenEnquiry()}
      />

      {/* Main Content Area: 7 Pages with subtle crossfade */}
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {currentPage === 'home' && (
              <HomePage
                onNavigate={handleNavigate}
                onOpenEnquiry={handleOpenEnquiry}
                onSelectRoom={(room) => setSelectedRoom(room)}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage
                onNavigate={handleNavigate}
                onOpenEnquiry={() => handleOpenEnquiry()}
              />
            )}

            {currentPage === 'rooms' && (
              <RoomsPage
                onNavigate={handleNavigate}
                onOpenEnquiry={handleOpenEnquiry}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
              />
            )}

            {currentPage === 'amenities' && (
              <AmenitiesPage
                onNavigate={handleNavigate}
                onOpenEnquiry={() => handleOpenEnquiry()}
              />
            )}

            {currentPage === 'attractions' && (
              <AttractionsPage
                onNavigate={handleNavigate}
                onOpenEnquiry={() => handleOpenEnquiry()}
              />
            )}

            {currentPage === 'gallery' && (
              <GalleryPage
                onNavigate={handleNavigate}
                onOpenEnquiry={() => handleOpenEnquiry()}
              />
            )}

            {currentPage === 'contact' && (
              <ContactPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'privacy' && (
              <PrivacyPage
                onNavigate={handleNavigate}
                onOpenEnquiry={() => handleOpenEnquiry()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Luxury Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenEnquiry={() => handleOpenEnquiry()}
      />

      {/* Booking / Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        prefilledRoom={enquiryRoomName}
      />

      {/* 24/7 Front Desk Call / Action Sheet Modal */}
      <CallActionModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

      {/* Floating WhatsApp Quick Action Button (Right Side, Lower-Mid Position) */}
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="fixed top-[74%] landscape:top-[68%] -translate-y-1/2 z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_16px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group cursor-pointer"
        aria-label="Chat on WhatsApp with Lotus Grand front desk"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-white relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="sr-only">Chat on WhatsApp</span>
      </a>

      {/* Floating Back to Top Button (Right Corner, below WhatsApp on all devices) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            style={{
              right: 'max(1rem, env(safe-area-inset-right))',
              bottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
            className="fixed bottom-6 landscape:bottom-3 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#070E1A] hover:bg-[#0D1E3A] border border-[#E0C37B]/50 text-[#E0C37B] hover:text-[#FFF5A5] shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.45)] active:scale-95 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm group"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform text-[#E0C37B]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile-Only Floating Calling Button (Left Side, strictly mobile in portrait and landscape rotation) */}
      <a
        href={`tel:${siteSettings.phone}`}
        onClick={() => {
          try {
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(siteSettings.phoneDisplay.replace(/\s+/g, ''));
            }
          } catch {}
          window.dispatchEvent(new CustomEvent('lotus:open-call-modal'));
        }}
        style={{
          left: 'max(1rem, env(safe-area-inset-left))',
        }}
        className="mobile-calling-btn fixed top-[74%] landscape:top-[68%] -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.65)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Call Lotus Grand 24/7 Front Desk"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-35 pointer-events-none" />
        <Phone className="w-5 h-5 text-white relative z-10 fill-current" />
      </a>
    </div>
  );
}
